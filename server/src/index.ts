import express, { json } from 'express'
import multer, { memoryStorage } from 'multer'
import path from 'path'
import fs from 'fs/promises'
import { format } from 'date-fns'

async function main() {
  const config = JSON.parse(await fs.readFile('config.json', 'utf-8')) as {
    port: number
    web: string
    date: string
    saves: string
    active: string
  }

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

main()
