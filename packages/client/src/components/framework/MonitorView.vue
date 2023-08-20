<script setup lang="ts">
import { Buffer } from 'buffer'
import { onMounted, onUnmounted, ref } from 'vue'

import * as api from '@/api'

const props = defineProps<{
  width: number
  height: number
}>()

const imageURL = ref<string | null>(null)

const canvasEl = ref<HTMLCanvasElement | null>(null)

defineExpose({
  imageURL
})

let socket: WebSocket | null

async function tryConnect() {
  let url: string | null = null
  let fr = 0
  let prefr = 0
  const ctx = canvasEl.value?.getContext('2d')
  if (!ctx) {
    return
  }
  socket = await api.controller()
  socket.onclose = () => {
    console.log('close!')
    socket = null
    setTimeout(() => {
      tryConnect()
    }, 100)
  }
  socket.onmessage = async ev => {
    // console.log('got image')
    fr += 1
    const cur = fr

    if (url) {
      URL.revokeObjectURL(url)
    }
    url = URL.createObjectURL(ev.data as Blob)
    const image = new Image(1280, 720)
    image.onload = () => {
      if (cur < prefr) {
        // console.log('skip image')
        return
      }
      prefr = cur
      // console.log('draw image')
      ctx.drawImage(image, 0, 0, 1280, 720, 0, 0, props.width, props.height)
    }
    image.src = url
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
    <canvas
      id="monitor"
      ref="canvasEl"
      :width="width"
      :height="height"
      @click="handleClick"
    ></canvas>
  </div>
</template>

<style scoped>
#monitor {
  max-width: inherit;
}
</style>
