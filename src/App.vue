<script setup lang="ts">
import { active } from './data'
import { getTask, setTask } from './data/task'
import { history } from './history'
import { loadFS, saveFS } from './loader'
import {
  FileDownloadOutlined,
  FileUploadOutlined,
  MapOutlined,
  NavigateBeforeOutlined,
  NavigateNextOutlined,
  RedoOutlined,
  UndoOutlined
} from '@vicons/material'
import type { MutGraphNode } from 'd3-dag'
import { produce } from 'immer'
import { NButton, NCard, NIcon, NModal } from 'naive-ui'
import { computed, nextTick, onMounted, ref } from 'vue'

import { fs } from '@/data/fs'
import { buildGraph } from '@/graph'

import TaskEdit from '@/components/TaskEdit.vue'
import TaskTree from '@/components/TaskTree.vue'

const expands = ref<string[]>(['/'])

onMounted(async () => {
  await loadFS()
  window.onkeydown = ev => {
    if (ev.ctrlKey && (ev.key === 'z' || ev.key === 'Z')) {
      ev.stopPropagation()
      ev.preventDefault()
      if (ev.shiftKey) {
        if (fs.canRedo()) {
          fs.redo()
        }
      } else {
        if (fs.canUndo()) {
          fs.undo()
        }
      }
    }
  }
})

const showCanvas = ref(false)
const dagEl = ref<HTMLCanvasElement | null>(null)

function showGraph() {
  showCanvas.value = true
  nextTick(() => {
    const el = dagEl.value
    if (!el) {
      return
    }
    const [graph, width, height] = buildGraph()
    el.width = width
    el.height = height
    el.setAttribute('style', `width:${width}px;height:${height}px`)
    const ctx = el.getContext('2d')
    if (!ctx) {
      return
    }
    for (const node of graph.nodes()) {
      ctx.beginPath()
      ctx.ellipse(node.x, node.y, 20, 20, 0, 0, Math.PI * 2)
      ctx.closePath()
      ctx.stroke()
    }
    for (const link of graph.links()) {
      const src = link.source
      const dst = link.target
      if (link.data !== 'next') {
        ctx.strokeStyle = 'red'
      } else {
        ctx.strokeStyle = 'black'
      }
      ctx.beginPath()
      ctx.moveTo(src.x, src.y)
      ctx.lineTo(dst.x, dst.y)
      ctx.closePath()
      ctx.stroke()
    }
  })
}
</script>

<template>
  <NModal v-model:show="showCanvas">
    <NCard content-style="display: flex; justify-content: center">
      <canvas ref="dagEl" id="DAG"></canvas>
    </NCard>
  </NModal>

  <div class="flex flex-col gap-2 flex-1 min-h-0">
    <div class="flex gap-2">
      <NButton :disabled="!fs.canUndo()" @click="() => fs.undo()">
        <template #icon>
          <NIcon>
            <UndoOutlined></UndoOutlined>
          </NIcon>
        </template>
      </NButton>
      <NButton :disabled="!fs.canRedo()" @click="() => fs.redo()">
        <template #icon>
          <NIcon>
            <RedoOutlined></RedoOutlined>
          </NIcon>
        </template>
      </NButton>
      <NButton
        :disabled="!history.info.canUndo()"
        @click="() => history.info.undo()"
      >
        <template #icon>
          <NIcon>
            <NavigateBeforeOutlined></NavigateBeforeOutlined>
          </NIcon>
        </template>
      </NButton>
      <NButton
        :disabled="!history.info.canRedo()"
        @click="() => history.info.redo()"
      >
        <template #icon>
          <NIcon>
            <NavigateNextOutlined></NavigateNextOutlined>
          </NIcon>
        </template>
      </NButton>
      <NButton @click="saveFS">
        <template #icon>
          <NIcon>
            <FileDownloadOutlined></FileDownloadOutlined>
          </NIcon>
        </template>
      </NButton>
      <NButton @click="loadFS">
        <template #icon>
          <NIcon>
            <FileUploadOutlined></FileUploadOutlined>
          </NIcon>
        </template>
      </NButton>
      <NButton @click="showGraph">
        <template #icon>
          <NIcon>
            <MapOutlined></MapOutlined>
          </NIcon>
        </template>
      </NButton>
    </div>
    <div class="flex gap-2 flex-1 min-h-0">
      <NCard
        class="min-h-0"
        style="max-width: 400px"
        content-style="max-height: 100%; display: flex; flex-direction: column"
      >
        <TaskTree v-model:expand="expands"></TaskTree>
      </NCard>
      <NCard class="min-h-0" content-style="max-height: 100%">
        <template v-if="active && getTask(active)">
          <TaskEdit
            :name="active"
            :value="getTask(active)!"
            :edit="
              prod => {
                setTask(active!, produce(getTask(active)!, prod))
              }
            "
          ></TaskEdit>
        </template>
      </NCard>
    </div>
  </div>
</template>
