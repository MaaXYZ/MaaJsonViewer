<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { NButton, NTree, NCard, NInput, NModal, NIcon } from 'naive-ui'
import {
  EditOutlined,
  NavigateBeforeOutlined,
  NavigateNextOutlined,
  SearchOutlined,
  SaveAltOutlined,
  SyncOutlined
} from '@vicons/material'
import { taskData, taskTree } from './data'
import TaskEdit from '@/components/TaskEdit.vue'
import {
  historyPush,
  historyUndo,
  historyRedo,
  canUndo,
  canRedo
} from './history'
import { loadData, syncData } from './loader'

const searchText = ref('')
const selectedKeys = ref<string[]>([])

const selectedKeysFilter = computed({
  set(v: string[]) {
    if (v.length === 0) {
      return
    } else {
      const s = v[0]
      if (s.endsWith('.')) {
        return
      }
      selectedKeys.value = historyPush(s)
    }
  },
  get() {
    return selectedKeys.value
  }
})

function handleNavigate(task: string) {
  if (task in taskData.data) {
    selectedKeysFilter.value = [
      `${taskData.data[task].editor_info!.path}.${task}`
    ]
  }
}

const active = computed(() => {
  return selectedKeys.value.length > 0
    ? selectedKeys.value[0].split('.').pop() ?? null
    : null
})

const treeParentEl = ref<HTMLDivElement | null>(null)
const treeHeight = computed(() => {
  return treeParentEl.value?.clientHeight ?? 600
})
</script>

<template>
  <div class="flex flex-col gap-2 flex-1 min-h-0">
    <div class="flex gap-2">
      <NButton :disabled="!canUndo" @click="selectedKeys = historyUndo()">
        <template #icon>
          <NIcon>
            <NavigateBeforeOutlined></NavigateBeforeOutlined>
          </NIcon>
        </template>
      </NButton>
      <NButton :disabled="!canRedo" @click="selectedKeys = historyRedo()">
        <template #icon>
          <NIcon>
            <NavigateNextOutlined></NavigateNextOutlined>
          </NIcon>
        </template>
      </NButton>
      <NButton @click="syncData">
        <template #icon>
          <NIcon>
            <SaveAltOutlined></SaveAltOutlined>
          </NIcon>
        </template>
      </NButton>
      <NButton @click="loadData">
        <template #icon>
          <NIcon>
            <SyncOutlined></SyncOutlined>
          </NIcon>
        </template>
      </NButton>
    </div>
    <div class="flex gap-2 flex-1 min-h-0">
      <NCard
        class="max-w-xs min-h-0"
        content-style="max-height: 100%; display: flex; flex-direction: column"
      >
        <div class="flex flex-col gap-2 flex-1 min-h-0">
          <NInput v-model:value="searchText" placeholder="task">
            <template #prefix>
              <NIcon>
                <SearchOutlined></SearchOutlined>
              </NIcon>
            </template>
          </NInput>
          <div ref="treeParentEl" class="flex flex-col flex-1 min-h-0">
            <NTree
              :style="{
                height: treeHeight
              }"
              :data="[taskTree]"
              v-model:selected-keys="selectedKeysFilter"
              block-line
              selectable
              expand-on-click
              :pattern="searchText"
              :show-irrelevant-nodes="false"
              :cancelable="false"
              virtual-scroll
            ></NTree>
          </div>
        </div>
      </NCard>
      <NCard class="min-h-0" content-style="max-height: 100%">
        <template v-if="active && active in taskData.data">
          <TaskEdit
            :name="active"
            v-model:value="taskData.data[active]"
            @navigate="handleNavigate"
          ></TaskEdit>
        </template>
      </NCard>
    </div>
  </div>
</template>
