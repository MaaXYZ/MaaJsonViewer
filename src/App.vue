<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  NButton,
  NTree,
  NCard,
  NInput,
  NModal,
  NIcon,
  NTabs,
  NTab
} from 'naive-ui'
import {
  EditOutlined,
  NavigateBeforeOutlined,
  NavigateNextOutlined,
  SearchOutlined,
  SaveAltOutlined,
  SyncOutlined
} from '@vicons/material'
import { taskData, active, navigate } from './data'
import TaskEdit from '@/components/TaskEdit.vue'
import TaskTree from '@/components/TaskTree.vue'
import { history } from './history'
import { loadData, syncData } from './loader'

const expands = ref<string[]>(['root.'])

onMounted(() => {
  loadData().then(folders => {
    expands.value = ['root.', ...folders]
  })
})

const someBackward = computed(() => {
  return history.info.prev[0].value.slice(-4).map(x => x.active)
})
const someForward = computed(() => {
  return history.info.next[0].value
    .slice(-4)
    .reverse()
    .map(x => x.active)
})
const fastNavigate = computed<number>({
  set(ofs: number) {
    history.move(ofs)
  },
  get() {
    return 0
  }
})
</script>

<template>
  <div class="flex flex-col gap-2 flex-1 min-h-0">
    <div class="flex gap-2">
      <NButton :disabled="!history.canUndo()" @click="history.undo()">
        <template #icon>
          <NIcon>
            <NavigateBeforeOutlined></NavigateBeforeOutlined>
          </NIcon>
        </template>
      </NButton>
      <NButton :disabled="!history.canRedo()" @click="history.redo()">
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
        <NButton v-if="active" type="primary" disabled>
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
        <template v-if="active && active in taskData.data">
          <TaskEdit
            :name="active"
            v-model:value="taskData.data[active]"
            @navigate="navigate"
          ></TaskEdit>
        </template>
      </NCard>
    </div>
  </div>
</template>
