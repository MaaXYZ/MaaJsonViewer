import axios from 'axios'

export async function load() {
  return (
    await axios.post('/api/load', null, {
      responseType: 'arraybuffer'
    })
  ).data as ArrayBuffer
}

export async function save(blob: Blob) {
  const form = new FormData()
  form.append('file', blob)
  await axios.post('/api/save', form, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
