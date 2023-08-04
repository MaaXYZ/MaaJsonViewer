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
    return path.join(...p.split('.')) + '.json'
  }

  const data = req.body as {
    [task: string]: {
      editor_info: {
        path: string
      }
    }
  }

  const result: Record<string, Record<string, unknown>> = {}

  for (const name in data) {
    const task = data[name]
    const file = makePath(task.editor_info.path)
    result[file] = result[file] ?? {}
    result[file][name] = task
  }

  for (const file in result) {
    await fs.writeFile(
      path.join(resDir, file),
      JSON.stringify(result[file], null, 4)
    )
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
