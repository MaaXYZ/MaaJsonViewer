import express, { json } from 'express'
import multer, { memoryStorage } from 'multer'
import path from 'path'
import fs from 'fs/promises'

const app = express()

const webDir = path.resolve('./web')
const port = 8080

app.use(express.static(webDir))
app.use(json())

let activeZip = './saves/res.zip'

app.post('/api/zip', async (req, res) => {
  res.sendFile(path.resolve(activeZip))
})

const cache = memoryStorage()
const multerInst = multer({
  storage: cache
})

app.post('/api/save', multerInst.single('file'), async (req, res) => {
  const buffer = req.file?.buffer
  if (buffer) {
    const newFileName = `./saves/${Date.now()}.zip`
    fs.writeFile(newFileName, buffer).then(() => {
      activeZip = newFileName
      res.send({
        success: true
      })
    })
  } else {
    res.send({
      success: false
    })
  }
})

app.listen(port, () => {
  console.log(`server started: http://localhost:${port}/`)
})
