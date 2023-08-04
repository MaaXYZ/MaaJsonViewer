import { taskData, type TaskData } from '@/data'
import axios from 'axios'

function appendPath(data: TaskData, path: string) {
  for (const key in data) {
    data[key].editor_info = {
      ...(data[key].editor_info ?? {}),
      path
    }
  }
  return data
}

export async function loadData() {
  const entry = (await axios.post('/api/list')).data as {
    success: boolean
    data: {
      info: {
        dir: string[][]
        file: string[][]
      }
    }
  }
  let mergeData: TaskData = {}
  for (const file of entry.data.info.file) {
    const url = `/res/` + file.join('/')
    if (url.endsWith('.json')) {
      const data = (await axios(url)).data as TaskData
      for (const key in data) {
        data[key].editor_info = {
          path: file.join('.').replace(/\.json$/, '')
        }
      }
      mergeData = {
        ...mergeData,
        ...data
      }
    }
  }
  taskData.data = mergeData
}

export async function syncData() {
  await axios.post('/api/sync', taskData.data)
}
