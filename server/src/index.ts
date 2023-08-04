import express, { json } from 'express'
import path from 'path'
import fs from 'fs/promises'

type ListEntry = {
  name: string
  dir: ListEntry[]
  file: string[]
}

const app = express()

const webDir = path.resolve('./web')
const resDir = path.resolve('./res')

app.use(express.static(webDir))
app.use('/res', express.static(resDir))
app.use(json())

app.get('/api/list', async (req, res) => {
  const enumDir = async (dir: string) => {
    const res: ListEntry = {
      name: path.basename(dir),
      dir: [],
      file: []
    }
    for (const filename of await fs.readdir(dir)) {
      const file = path.join(dir, filename)
      if ((await fs.stat(file)).isDirectory()) {
        res.dir.push(await enumDir(file))
      } else {
        if (['.json', '.png'].includes(path.extname(filename))) {
          res.file.push(filename)
        }
      }
    }
    return res
  }

  const info = await enumDir(resDir)
  res.send({
    success: true,
    data: {
      info
    }
  })
})

app.get('/api/list_flat', async (req, res) => {
  const info: {
    dir: string[][]
    file: string[][]
  } = {
    dir: [],
    file: []
  }

  const enumDir = async (dir: string) => {
    for (const filename of await fs.readdir(dir)) {
      const file = path.join(dir, filename)
      if ((await fs.stat(file)).isDirectory()) {
        info.dir.push(
          file
            .replace(resDir, '')
            .split(path.sep)
            .filter(x => x)
        )
        await enumDir(file)
      } else {
        if (['.json', '.png'].includes(path.extname(filename))) {
          info.file.push(
            file
              .replace(resDir, '')
              .split(path.sep)
              .filter(x => x)
          )
        }
      }
    }
  }

  await enumDir(resDir)
  res.send({
    success: true,
    data: {
      info
    }
  })
})

app.listen(8080)
