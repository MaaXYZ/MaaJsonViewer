<script setup lang="ts">
import {
  CropFreeOutlined,
  EditOutlined,
  SaveAltRound,
  SyncOutlined
} from '@vicons/material'
import { Buffer } from 'buffer'
import { NButton, NCard, NIcon, NInput, NModal } from 'naive-ui'
import { computed, nextTick, onActivated, onDeactivated, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { type FileContentRef, type PathKey, fs, path, pool } from '@/filesystem'
import type { Rect } from '@/types'

import ChooseDir from '@/components/filesystem/ChooseDir.vue'
import MonitorView from '@/components/framework/MonitorView.vue'

const alive = ref(false)

onActivated(() => {
  alive.value = true
})

onDeactivated(() => {
  alive.value = false
})

const router = useRouter()

const monitor = ref<InstanceType<typeof MonitorView> | null>(null)
const targetEl = ref<HTMLCanvasElement | null>(null)
const cropEl = ref<HTMLCanvasElement | null>(null)
const curPos = ref<[number, number]>([0, 0])
const oldPos = ref<[number, number] | null>(null)
const newPos = ref<[number, number] | null>(null)

watch(targetEl, el => {
  if (el) {
    const fix = (x: number, s: number) => {
      x = Math.round(x)
      if (x < 0) {
        x = 0
      }
      if (x > s) {
        x = s
      }
      return x
    }
    el.onpointermove = ev => {
      curPos.value = [fix(ev.offsetX, 1280), fix(ev.offsetY, 720)]
      render()
    }
    el.onpointerdown = ev => {
      el.setPointerCapture(ev.pointerId)
      oldPos.value = [...curPos.value]
      newPos.value = null
      render()
    }
    el.onpointerup = ev => {
      if (!oldPos.value) {
        return
      }
      el.releasePointerCapture(ev.pointerId)
      if (
        curPos.value[0] === oldPos.value?.[0] &&
        curPos.value[1] === oldPos.value[1]
      ) {
        oldPos.value = null
      } else {
        newPos.value = [...curPos.value]
      }
      render()
    }
  }
})

const imageURL = ref<string>('')
const image = ref<HTMLImageElement | null>(null)
const rect = computed<Rect | null>(() => {
  if (!oldPos.value) {
    return null
  }
  const np = newPos.value ? newPos.value : curPos.value
  const l = Math.min(oldPos.value[0], np[0])
  const r = Math.max(oldPos.value[0], np[0])
  const t = Math.min(oldPos.value[1], np[1])
  const b = Math.max(oldPos.value[1], np[1])
  return [l, t, r - l, b - t]
})
const suggestRect = computed<Rect | null>(() => {
  if (!rect.value) {
    return null
  }
  const l = Math.max(rect.value[0] - 50, 0)
  const t = Math.max(rect.value[1] - 50, 0)
  const r = Math.min(rect.value[0] + rect.value[2] + 50, 1280)
  const b = Math.min(rect.value[1] + rect.value[3] + 50, 720)
  return [l, t, r - l, b - t]
})

function render() {
  const cvs = targetEl.value
  if (!cvs) {
    return
  }
  const ctx = cvs.getContext('2d')!
  ctx.clearRect(0, 0, 1280, 720)
  if (image.value) {
    ctx.drawImage(image.value, 0, 0)
    if (oldPos.value) {
      const [l, t, w, h] = rect.value!
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.fillRect(l, t, w, h)

      nextTick(() => {
        const crop = cropEl.value
        if (!crop) {
          return
        }
        crop.width = w
        crop.height = h
        crop.setAttribute('style', `width:${w}px;height:${h}px`)
        const ctx = crop.getContext('2d')
        ctx?.drawImage(image.value!, l, t, w, h, 0, 0, w, h)
      })
    }
  }
}

function takeImage() {
  const url = monitor.value?.imageURL
  if (url) {
    imageURL.value = url
    image.value = new Image()
    image.value.src = imageURL.value
    image.value.onload = () => {
      const cvs = targetEl.value!
      cvs.width = 1280
      cvs.height = 720
      render()
    }
  }
}

const showSave = ref(false)
const targetDir = ref('/')
const targetFile = ref('test')
const isExists = computed(() => {
  return fs.tree.existsFile(
    path.joinkey(targetDir.value as PathKey, targetFile.value + '.png')
  )
})

function requireSave() {
  showSave.value = true
}

function doSave() {
  const data = Buffer.from(
    cropEl.value!.toDataURL().replace('data:image/png;base64,', ''),
    'base64'
  )
  fs.tree.writeFile(
    path.joinkey(targetDir.value as PathKey, targetFile.value + '.png'),
    pool.put(data.buffer)
  )
  showSave.value = false
}
</script>

<template>
  <NModal v-model:show="showSave">
    <NCard
      style="width: 60vw"
      content-style="display:flex;flex-direction:column;gap:0.5rem"
    >
      <ChooseDir v-model:value="targetDir"></ChooseDir>
      <NInput v-model:value="targetFile">
        <template #suffix> .png </template>
      </NInput>
      <span v-if="isExists"> {{ targetDir }}{{ targetFile }}.png 已存在 </span>

      <template #action>
        <NButton @click="doSave"> 保存 </NButton>
      </template>
    </NCard>
  </NModal>

  <div class="flex flex-col gap-2">
    <div class="flex gap-2">
      <NButton @click="router.push('/edit')">
        <template #icon>
          <NIcon>
            <EditOutlined></EditOutlined>
          </NIcon>
        </template>
      </NButton>
      <NButton @click="takeImage" :disabled="!monitor?.imageURL">
        <template #icon>
          <NIcon>
            <CropFreeOutlined></CropFreeOutlined>
          </NIcon>
        </template>
      </NButton>
      <NButton @click="imageURL = ''" :disabled="imageURL === ''">
        <template #icon>
          <NIcon>
            <SyncOutlined></SyncOutlined>
          </NIcon>
        </template>
      </NButton>
      <NButton @click="requireSave" :disabled="!imageURL || !rect">
        <template #icon>
          <NIcon>
            <SaveAltRound></SaveAltRound>
          </NIcon>
        </template>
      </NButton>
    </div>
    <MonitorView
      v-if="alive"
      v-show="!imageURL"
      ref="monitor"
      :width="1280"
      :height="720"
    ></MonitorView>
    <div class="flex gap-2">
      <canvas
        v-if="imageURL"
        ref="targetEl"
        style="width: 1280px; height: 720px"
      ></canvas>
      <div class="flex flex-col gap-2">
        <span v-if="rect">
          {{ rect.join(',') }}
        </span>
        <span v-if="suggestRect">
          {{ suggestRect.join(',') }}
        </span>
      </div>
    </div>
    <canvas v-if="rect" ref="cropEl"></canvas>
  </div>
</template>
