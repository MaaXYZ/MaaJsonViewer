import {
  MaaAdbControllerTypeEnum,
  MaaController,
  MaaFrameworkLoader,
  MaaInstance,
  MaaResource
} from '@maa/loader'
import history from 'connect-history-api-fallback'
import express, { json } from 'express'
import expressWs from 'express-ws'
import extract from 'extract-zip'
import fs from 'fs/promises'
import multer, { memoryStorage } from 'multer'
import os from 'os'
import path from 'path'
import sms from 'source-map-support'

interface Config {
  port: number
  web: string
  save: string
  maaframework: {
    emulator: boolean
    adb: string
    address: string
    root: string
    log: string
    debug: boolean
  }
}

let config: Config
let loader: MaaFrameworkLoader
let controller: MaaController
let resource: MaaResource
let instance: MaaInstance
const instanceListener: ((msg: string, detail: unknown) => void)[] = []

sms.install()

async function main() {
  config = JSON.parse(await fs.readFile('config.json', 'utf-8'))

  const app = expressWs(express()).app

  app.use(history())
  app.use(express.static(config.web))
  app.use(json())

  app.post('/api/load', async (req, res) => {
    res.sendFile(path.resolve(config.save))
  })

  const cache = memoryStorage()
  const multerInst = multer({
    storage: cache
  })

  app.post('/api/save', multerInst.single('file'), async (req, res) => {
    const buffer = req.file?.buffer
    if (buffer) {
      await fs.writeFile(config.save, buffer)
      console.log('saved to', config.save)
      res.send({
        success: true
      })
    } else {
      res.send({
        success: false
      })
    }
  })

  app.post('/api/config/load', (req, res) => {
    res.send({
      success: true,
      config
    })
  })

  app.post('/api/config/save', (req, res) => {
    config = req.body
    fs.writeFile('config.json', JSON.stringify(config, null, 2))
    res.send({
      success: true
    })
  })

  let wsId = 0

  app.ws('/api/controller', async (ws, req) => {
    const id = wsId
    wsId += 1
    console.log(`/api/controller ${id} connected`)
    ws.on('message', async data => {
      const action = JSON.parse(data.toString('utf-8')) as {
        action: 'click'
        x: number
        y: number
      }
      // console.log(action)
      if (controller) {
        switch (action.action) {
          case 'click': {
            controller.click(action.x, action.y)
          }
        }
      }
    })

    let pending = false
    let quit = false

    const timer = setInterval(async () => {
      if (controller) {
        console.log(`/api/controller ${id} start push`)
        if (pending) {
          console.log(`/api/controller ${id} skipped`)
          return
        }
        pending = true
        if (quit) {
          return
        }
        if (await controller.screencap()) {
          if (quit) {
            return
          }
          console.log(`/api/controller ${id} get image`)
          const buffer = controller.image()
          pending = false
          if (buffer) {
            console.log(`/api/controller ${id} push image`)
            ws.send(buffer)
          }
        } else {
          console.log(`/api/controller ${id} screencap failed`)
          pending = false
        }
      }
    }, 1000)
    ws.on('close', () => {
      quit = true
      console.log(`/api/controller ${id} closed`)
      clearInterval(timer)
    })
  })

  app.ws('/api/instance', async (ws, req) => {
    const layer = req.query.layer as string
    const loaded = await prepareResourceFor(layer)

    if (!loaded || !instance.inited()) {
      ws.close()
      return
    }

    ws.on('close', () => {
      instance.stop()
    })

    ws.send(
      JSON.stringify({
        type: 'inited'
      })
    )

    ws.on('message', async data => {
      const action = JSON.parse(data.toString('utf-8')) as {
        action: 'start'
        task: string[]
      }
      if (controller) {
        switch (action.action) {
          case 'start': {
            for (const task of action.task) {
              instance.post(task, {}, status => {
                ws.send(
                  JSON.stringify({
                    type: 'status',
                    task,
                    status
                  })
                )
              })
            }
          }
        }
      }
    })
  })

  app.listen(config.port, () => {
    console.log(`server started: http://localhost:${config.port}/`)
  })

  if (config.maaframework.emulator) {
    loader = new MaaFrameworkLoader()
    loader.load(path.join(config.maaframework.root, 'bin'))

    loader.setLogging(config.maaframework.log)
    loader.setDebugMode(config.maaframework.debug)

    const ctrl = await prepareController()
    if (!ctrl) {
      return
    }

    controller = ctrl
    resource = new MaaResource(loader)
    instance = new MaaInstance(loader, (msg, detail) => {
      detail = JSON.parse(detail)
      for (const cb of instanceListener) {
        cb(msg, detail)
      }
    })

    instance.bindController(controller)
    instance.bindResource(resource)
  }
}

async function prepareResourceFor(target: string) {
  const extractDir = path.join(os.tmpdir(), 'MaaJsonViewer', 'extract')
  await fs.rm(extractDir, {
    force: true,
    recursive: true
  })
  await extract(config.save, {
    dir: extractDir
  })
  const cfg = JSON.parse(
    await fs.readFile(path.join(extractDir, '.config.json'), 'utf-8')
  ) as Record<
    string,
    {
      save: string
      extends?: string
    }
  >

  const track = (t: string, v: string[]) => {
    if (cfg[t].extends) {
      track(cfg[t].extends!, v)
      v.push(t)
    }
  }

  const layers: string[] = []
  track(target, layers)

  let AllLoaded = true

  const resourceBaseDir = path.join(os.tmpdir(), 'MaaJsonViewer', 'resources')
  for (const [idx, layer] of layers.entries()) {
    const resourceDir = path.join(resourceBaseDir, layer)
    await fs.rm(resourceDir, {
      force: true,
      recursive: true
    })
    await fs.mkdir(path.join(resourceDir, 'model'), {
      recursive: true
    })
    await extract(path.join(extractDir, cfg[layer].save), {
      dir: path.join(resourceDir, 'pipeline')
    })
    await fs.cp(
      path.join(config.maaframework.root, 'model'),
      path.join(resourceDir, 'model'),
      {
        recursive: true
      }
    )
    await fs.writeFile(
      path.join(resourceDir, 'properties.json'),
      JSON.stringify({ is_base: idx === 0 })
    )
    console.log(`resource layer ${layer} prepared at`, resourceDir)
    const loaded = await resource.load(resourceDir)
    console.log(`resource layer ${layer} load:`, loaded)
    AllLoaded = AllLoaded && loaded
  }

  return AllLoaded
}

async function prepareController() {
  const ctrl = new MaaController(
    loader,
    config.maaframework.adb,
    config.maaframework.address,
    MaaAdbControllerTypeEnum.Input_Preset_Adb |
      MaaAdbControllerTypeEnum.Screencap_Encode,
    await fs.readFile(
      path.join(config.maaframework.root, 'controller_config.json'),
      'utf-8'
    ),
    (msg, detail) => {
      console.log(msg, detail)
    }
  )

  ctrl.setWidth(1280)

  const connected = await ctrl.connect()
  console.log('controller connect:', connected)

  if (!connected) {
    ctrl.destroy()
    return null
  }

  return ctrl
}

main()
