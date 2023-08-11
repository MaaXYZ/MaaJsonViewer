import axios from 'axios'

import type { Config } from './types'

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

export async function loadConfig() {
  return (
    (
      await axios.post('/api/config/load', null, {
        responseType: 'json'
      })
    ).data as {
      success: boolean
      config: Config
    }
  ).config
}

export async function saveConfig(cfg: Config) {
  return await axios.post('/api/config/save', cfg)
}

export async function controller() {
  return new Promise<WebSocket>(resolve => {
    const ws = new WebSocket('ws://' + window.location.host + '/api/controller')
    ws.onopen = () => {
      resolve(ws)
    }
  })
}

export async function instance() {
  return new Promise<WebSocket>(resolve => {
    const ws = new WebSocket('ws://' + window.location.host + '/api/instance')
    ws.onopen = () => {
      resolve(ws)
    }
  })
}
