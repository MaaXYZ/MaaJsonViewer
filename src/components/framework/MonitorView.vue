<script setup lang="ts">
import { Buffer } from 'buffer'
import { onMounted, onUnmounted, ref } from 'vue'

import * as api from '@/api'

const abData = ref<ArrayBuffer | null>(null)
const abURL = ref<string | null>(null)

let socket: WebSocket | null

async function tryConnect() {
  socket = await api.controller()
  socket.onclose = () => {
    socket = null
  }
  socket.onmessage = async ev => {
    abData.value = await (ev.data as Blob).arrayBuffer()
    abURL.value =
      'data:image/png;base64,' + Buffer.from(abData.value).toString('base64')
  }
}

onMounted(async () => {
  await tryConnect()
})

onUnmounted(() => {
  if (socket) {
    socket.close()
  }
})

function send(obj: unknown) {
  if (!socket) {
    tryConnect()
  } else {
    socket.send(JSON.stringify(obj))
  }
}

function sendClick(x: number, y: number) {
  send({
    action: 'click',
    x,
    y
  })
}

function handleClick(ev: MouseEvent) {
  sendClick(ev.offsetX, ev.offsetY)
}
</script>

<template>
  <div>
    <img
      v-if="abURL"
      :src="abURL"
      width="640"
      height="360"
      @click="handleClick"
    />
    <span v-else> no data </span>
  </div>
</template>
