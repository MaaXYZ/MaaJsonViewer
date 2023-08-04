import express, { json } from 'express'
import path from 'path'
import fs from 'fs/promises'

const app = express()

const webDir = path.resolve('./web')
const resDir = path.resolve('./res')
const port = 8080

app.use(express.static(webDir))
app.use('/res', express.static(resDir))
app.use(json())

app.post('/api/list', async (req, res) => {
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

app.post('/api/sync', async (req, res) => {
  const makePath = (p: string) => {
    return path.join(...p.split('/').filter(x => x))
  }

  const data = req.body as {
    dir: string[][]
    file: string[][]
    task: {
      [task: string]: {
        editor_info: {
          path: string
        }
      }
    }
  }

  const result: Record<string, Record<string, unknown>> = {}

  for (const dir of data.dir) {
    await fs.mkdir(path.join(resDir, ...dir), { recursive: true })
  }

  const rmJson = async (dir: string) => {
    for (const filename of await fs.readdir(dir)) {
      const file = path.join(dir, filename)
      if ((await fs.stat(file)).isDirectory()) {
        await rmJson(file)
      } else {
        if (path.extname(filename) === '.json') {
          await fs.rm(file)
        }
      }
    }
  }

  await rmJson(resDir)

  for (const file of data.file) {
    if (file[file.length - 1].endsWith('.json')) {
      result[path.join(...file)] = {}
    }
  }

  for (const name in data.task) {
    const task = data.task[name]
    const file = makePath(task.editor_info.path)
    result[file] = result[file] ?? {}
    result[file][name] = task
  }

  for (const file in result) {
    const target = path.join(resDir, file)
    const dir = path.dirname(target)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(target, JSON.stringify(result[file], null, 4))
  }

  res.send({
    success: true,
    data: {
      result
    }
  })
})

app.listen(port, () => {
  console.log(`server started: http://localhost:${port}/`)
})
