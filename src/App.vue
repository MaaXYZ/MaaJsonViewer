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
