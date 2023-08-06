<script setup lang="ts">
import { active } from './data'
import { getTask, setTask } from './data/task'
import { history } from './history'
import { loadFS, saveFS } from './loader'
import {
  FileDownloadOutlined,
  FileUploadOutlined,
  NavigateBeforeOutlined,
  NavigateNextOutlined,
  RedoOutlined,
  UndoOutlined
} from '@vicons/material'
import { produce } from 'immer'
import { NButton, NCard, NIcon } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'

import { fs } from '@/data/fs'

import TaskEdit from '@/components/TaskEdit.vue'
import TaskTree from '@/components/TaskTree.vue'

const expands = ref<string[]>(['root.'])

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

const someBackward = computed(() => {
  return history.info.prev.value.slice(-4).map(x => x.active)
})
const someForward = computed(() => {
  return history.info.next.value
    .slice(-4)
    .reverse()
    .map(x => x.active)
})
const fastNavigate = computed<number>({
  set(ofs: number) {
    history.info.move(ofs)
  },
  get() {
    return 0
  }
})
</script>

<template>
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
      <div
        class="flex-1 grid gap-2"
        style="grid-template-columns: 1fr max-content 1fr"
      >
        <div class="flex gap-2 justify-end">
          <NButton
            v-for="(h, i) in someBackward"
            :key="`${h}-${i}`"
            @click="fastNavigate = i - someBackward.length"
          >
            {{ h }}
          </NButton>
        </div>
        <NButton type="primary" disabled>
          {{ active }}
        </NButton>
        <div class="flex gap-2">
          <NButton
            v-for="(h, i) in someForward"
            :key="`${h}-${i}`"
            @click="fastNavigate = i + 1"
          >
            {{ h }}
          </NButton>
        </div>
      </div>
    </div>
    <div class="flex gap-2 flex-1 min-h-0">
      <NCard
        class="max-w-md min-h-0"
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
