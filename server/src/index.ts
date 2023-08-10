import { format } from 'date-fns'
import express, { json } from 'express'
import fs from 'fs/promises'
import multer, { memoryStorage } from 'multer'
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
    adb: string
    address: string
    root: string
    log: string
    debug: boolean
  }
}

sms.install()

async function main() {
  const config = JSON.parse(await fs.readFile('config.json', 'utf-8')) as Config

  testLoader(config)

  const app = express()

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

  app.listen(config.port, () => {
    console.log(`server started: http://localhost:${config.port}/`)
  })
}

async function testLoader(config: Config) {
  const loader = new MaaFrameworkLoader()
  loader.load(path.join(config.maaframework.root, 'bin'))

  loader.setLogging(config.maaframework.log)
  loader.setDebugMode(config.maaframework.debug)

  const res = new MaaResource(loader)
  console.log(
    'resource load:',
    await res.load(path.join(config.maaframework.root, 'share/resource'))
  )

  const ctrl = new MaaController(
    loader,
    config.maaframework.adb,
    config.maaframework.address,
    MaaAdbControllerTypeEnum.Input_Preset_Adb |
      MaaAdbControllerTypeEnum.Screencap_RawWithGzip,
    await fs.readFile(
      path.join(config.maaframework.root, 'share/controller_config.json'),
      'utf-8'
    ),
    (msg, detail) => {
      console.log(msg, detail)
    }
  )

  console.log('controller connect:', await ctrl.connect())

  if (await ctrl.screencap()) {
    const buf = ctrl.image()
    if (buf) {
      await fs.writeFile('test.png', buf)
    }
  }

  const inst = new MaaInstance(loader, (msg, detail) => {
    console.log(msg, detail)
  })

  inst.bindResource(res)
  inst.bindController(ctrl)

  console.log('instance inited:', inst.inited())
}

main()
