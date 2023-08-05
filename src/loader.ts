import {
  taskData,
  taskDataSaved,
  type TaskData,
  folderData,
  fileData
} from '@/data'
import axios from 'axios'
import JSZip from 'jszip'

async function loadZip() {
  const res: Blob = (
    await axios.post('/api/zip', null, {
      responseType: 'blob'
    })
  ).data
  const zip = new JSZip()
  await zip.loadAsync(res)
  zip.forEach((p, f) => {
    console.log(p, f.dir)
  })
}

export async function loadData() {
  // loadZip()
  const entry = (await axios.post('/api/list')).data as {
    success: boolean
    data: {
      info: {
        dir: string[][]
        file: string[][]
      }
    }
  }

  folderData.data = structuredClone(entry.data.info.dir)
  fileData.data = structuredClone(entry.data.info.file)

  let mergeData: TaskData = {}
  const files: string[] = []
  for (const file of entry.data.info.file) {
    const url = `/res/` + file.join('/')
    if (url.endsWith('.json')) {
      files.push('/' + file.join('/') + '/')
      const data = (await axios(url)).data as TaskData
      for (const key in data) {
        data[key].editor_info = {
          path: '/' + file.join('/') + '/'
        }
      }
      mergeData = {
        ...mergeData,
        ...data
      }
    }
  }
  taskDataSaved.data = structuredClone(mergeData)
  taskData.data = structuredClone(mergeData)
  return [
    '@/',
    ...folderData.data.map(p => `@/${p.join('/')}/`),
    ...fileData.data
      .map(p => `/${p.join('/')}/`)
      .filter(p => p.endsWith('.json/'))
  ]
}

export async function syncData() {
  await axios.post('/api/sync', {
    dir: folderData.data,
    file: fileData.data,
    task: taskData.data
  })
  taskDataSaved.data = JSON.parse(JSON.stringify(taskData.data))
}
