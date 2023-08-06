import axios from 'axios'
import { FS } from './fs'
import { fs } from './data/fs'

async function loadZip() {
  const res: ArrayBuffer = (
    await axios.post('/api/load', null, {
      responseType: 'arraybuffer'
    })
  ).data
  return FS.fromZip(res)
}

export async function loadFS() {
  const newFs = await loadZip()
  fs.change(() => newFs)
}

export async function saveFS() {
  const form = new FormData()
  form.append('file', await fs.now().value!.zip())
  await axios.post('/api/save', form, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
