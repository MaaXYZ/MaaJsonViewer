<script setup lang="ts">
import {
  BuildOutlined,
  FileDownloadOutlined,
  FileUploadOutlined,
  NavigateBeforeOutlined,
  NavigateNextOutlined,
  RedoOutlined,
  UndoOutlined
} from '@vicons/material'
import { NButton, NCard, NIcon } from 'naive-ui'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { active, getTask, history, setTask } from '@/data'
import { type PathKey, fs } from '@/filesystem'
import { loadFS, saveFS } from '@/loader'

import TaskEdit from '@/components/TaskEdit.vue'
import TaskTree from '@/components/TaskTree.vue'
import MainLayout from '@/layout/MainLayout.vue'

const router = useRouter()

const expands = ref<PathKey[]>(['/' as PathKey])
</script>

<template>
  <MainLayout>
    <template #action>
      <NButton @click="router.push('/eval')">
        <template #icon>
          <NIcon>
            <BuildOutlined></BuildOutlined>
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
      <TaskTree v-model:expand="expands"></TaskTree>
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
    </NCard>
  </MainLayout>
</template>
