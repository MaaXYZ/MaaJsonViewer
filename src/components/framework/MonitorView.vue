<script setup lang="ts">
import { Buffer } from 'buffer'
import { onMounted, onUnmounted, ref } from 'vue'

import * as api from '@/api'

const imageData = ref<ArrayBuffer | null>(null)
const imageURL = ref<string | null>(null)

defineExpose({
  imageURL
})

let socket: WebSocket | null

async function tryConnect() {
  socket = await api.controller()
  socket.onclose = () => {
    socket = null
  }
  socket.onmessage = async ev => {
    imageData.value = await (ev.data as Blob).arrayBuffer()
    imageURL.value =
      'data:image/png;base64,' + Buffer.from(imageData.value).toString('base64')
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
      v-if="imageURL"
      :src="imageURL"
      width="1280"
      height="720"
      @click="handleClick"
    />
    <span v-else> no data </span>
  </div>
</template>
