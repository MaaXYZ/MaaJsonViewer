import history from 'connect-history-api-fallback'
import { format } from 'date-fns'
import express, { json } from 'express'
import expressWs from 'express-ws'
import extract from 'extract-zip'
import fs from 'fs/promises'
import multer, { memoryStorage } from 'multer'
import os from 'os'
import path from 'path'
import sms from 'source-map-support'

import {
  MaaController,
  MaaFrameworkLoader,
  MaaInstance,
  MaaResource
} from '../MaaJSLoader'
import { MaaAdbControllerTypeEnum } from '../MaaJSLoader/src/framework/types'

interface Config {
  port: number
  web: string
  date: string
  saves: string
  active: string
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

sms.install()

async function main() {
  config = JSON.parse(await fs.readFile('config.json', 'utf-8'))

  const app = expressWs(express()).app

  app.use(history())
  app.use(express.static(config.web))
  app.use(json())

  app.post('/api/load', async (req, res) => {
    res.sendFile(path.resolve(config.active))
  })

  const cache = memoryStorage()
  const multerInst = multer({
    storage: cache
  })

  app.post('/api/save', multerInst.single('file'), async (req, res) => {
    const buffer = req.file?.buffer
    if (buffer) {
      const newFileName = config.saves.replaceAll(
        '{date}',
        format(new Date(), config.date)
      )
      await fs.mkdir(path.dirname(newFileName), { recursive: true })
      await fs.writeFile(newFileName, buffer)
      console.log('saved to', newFileName)
      config.active = newFileName
      fs.writeFile('config.json', JSON.stringify(config, null, 2))
      res.send({
        success: true
      })
    } else {
      res.send({
        success: false
      })
    }
  })

  app.ws('/api/controller', async (ws, req) => {
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
    const timer = setInterval(async () => {
      if (controller) {
        if (await controller.screencap()) {
          const buffer = controller.image()
          if (buffer) {
            ws.send(buffer)
          }
        }
      }
    }, 5000)
    ws.on('close', () => {
      clearInterval(timer)
    })
  })

  app.ws('/api/instance', async (ws, req) => {
    if (!controller) {
      ws.close()
      return
    }

    const resource = await prepareResource()
    if (!resource) {
      ws.close()
      return
    }

    const instance = new MaaInstance(loader, (msg, detail) => {
      ws.send(
        JSON.stringify({
          type: 'callback',
          msg,
          detail
        })
      )
    })

    instance.bindController(controller)
    instance.bindResource(resource)

    if (!instance.inited()) {
      ws.close()
      resource.destroy()
      return
    }

    ws.on('close', () => {
      // instance.destroy()
      resource.destroy()
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
    if (ctrl) {
      controller = ctrl
    }
  }
}

async function prepareResource() {
  const tempResourceDir = path.join(os.tmpdir(), 'MaaJsonViewer', 'resource')
  await fs.rm(tempResourceDir, {
    force: true,
    recursive: true
  })
  await fs.mkdir(path.join(tempResourceDir, 'model'), {
    recursive: true
  })
  await extract(config.active, {
    dir: path.join(tempResourceDir, 'pipeline')
  })
  await fs.cp(
    path.join(config.maaframework.root, 'model'),
    path.join(tempResourceDir, 'model'),
    {
      recursive: true
    }
  )
  await fs.writeFile(
    path.join(tempResourceDir, 'properties.json'),
    JSON.stringify({ is_base: true })
  )
  console.log('resource prepared at', tempResourceDir)

  const res = new MaaResource(loader)
  const loaded = await res.load(tempResourceDir)
  console.log('resource load:', loaded)

  if (!loaded) {
    res.destroy()
    return null
  }

  return res
}

async function prepareController() {
  const ctrl = new MaaController(
    loader,
    config.maaframework.adb,
    config.maaframework.address,
    MaaAdbControllerTypeEnum.Input_Preset_Minitouch |
      MaaAdbControllerTypeEnum.Screencap_Encode,
    await fs.readFile(
      path.join(config.maaframework.root, 'controller_config.json'),
      'utf-8'
    ),
    (msg, detail) => {
      console.log(msg, detail)
    }
  )

  ctrl.setWidth(1280 / 2)

  const connected = await ctrl.connect()
  console.log('controller connect:', connected)

  if (!connected) {
    ctrl.destroy()
    return null
  }

  return ctrl
}

main()
