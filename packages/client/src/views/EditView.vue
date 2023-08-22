<script setup lang="ts">
import {
  FileDownloadOutlined,
  FileUploadOutlined,
  HealthAndSafetyOutlined,
  NavigateBeforeOutlined,
  NavigateNextOutlined,
  RedoOutlined,
  UndoOutlined
} from '@vicons/material'
import '@vueuse/core'
import { NButton, NCard, NIcon } from 'naive-ui'
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { onEnterRename } from '@/components/tree/TaskTreeAction'
import {
  active,
  getTask,
  history,
  makePngUrl,
  performValidate,
  setTask
} from '@/data'
import { fs } from '@/filesystem'
import { loadFS, saveCfg, saveFS } from '@/loader'

import NavigationButtons from '@/components/NavigationButtons.vue'
import TaskEdit from '@/components/TaskEdit.vue'
import ValidateTask from '@/components/task/ValidateTask.vue'
import TaskTree from '@/components/tree/TaskTree.vue'
import MainLayout from '@/layout/MainLayout.vue'

const router = useRouter()

function handleKey(ev: KeyboardEvent) {
  if (ev.key === 'F2') {
    if (active.value) {
      onEnterRename(active.value)
    }
    return
  }
  if (ev.ctrlKey) {
    if (ev.key === 'z' || ev.key === 'Z') {
      ev.stopPropagation()
      ev.preventDefault()
      if (ev.shiftKey) {
        if (fs.history.canRedo.value) {
          fs.history.redo()
        }
      } else {
        if (fs.history.canUndo.value) {
          fs.history.undo()
        }
      }
    } else if (ev.key === 's' || ev.key === 'S') {
      saveFS()
      saveCfg()
    }
  }
}

onMounted(() => {
  window.onkeydown = handleKey
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKey)
})

const validateEl = ref<InstanceType<typeof ValidateTask> | null>(null)
function doValidate() {
  if (validateEl.value) {
    validateEl.value.show = true
    performValidate()
  }
}
</script>

<template>
  <ValidateTask ref="validateEl"></ValidateTask>

  <MainLayout>
    <template #action>
      <NavigationButtons></NavigationButtons>
      <NButton @click="doValidate">
        <template #icon>
          <NIcon>
            <HealthAndSafetyOutlined></HealthAndSafetyOutlined>
          </NIcon>
        </template>
      </NButton>
      <NButton :disabled="!fs.history.canUndo.value" @click="fs.history.undo">
        <template #icon>
          <NIcon>
            <UndoOutlined></UndoOutlined>
          </NIcon>
        </template>
      </NButton>
      <NButton :disabled="!fs.history.canRedo.value" @click="fs.history.redo">
        <template #icon>
          <NIcon>
            <RedoOutlined></RedoOutlined>
          </NIcon>
        </template>
      </NButton>
      <NButton
        :disabled="!history.info.canUndo.value"
        @click="history.info.undo()"
      >
        <template #icon>
          <NIcon>
            <NavigateBeforeOutlined></NavigateBeforeOutlined>
          </NIcon>
        </template>
      </NButton>
      <NButton
        :disabled="!history.info.canRedo.value"
        @click="history.info.redo()"
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
    </template>
    <NCard
      class="min-h-0"
      style="max-width: 400px"
      content-style="max-height: 100%; display: flex; flex-direction: column"
    >
      <TaskTree></TaskTree>
    </NCard>
    <NCard class="min-h-0" content-style="max-height: 100%">
      <template v-if="active && getTask(active)">
        <TaskEdit
          :name="active"
          :value="getTask(active)!"
          @update:value="
            task => {
              setTask(active!, task)
            }
          "
        ></TaskEdit>
      </template>
      <template
        v-else-if="
          active && active.endsWith('.png') && fs.tree.existsFile(active)
        "
      >
        <div class="flex flex-col gap-4 max-h-full">
          <div class="flex justify-center gap-2 items-center">
            <span class="text-lg"> {{ active }} </span>
          </div>
          <div class="flex justify-center">
            <img :src="makePngUrl(active)" />
          </div>
        </div>
      </template>
    </NCard>
  </MainLayout>
</template>
