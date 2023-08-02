<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton, NTree, NCard, NInput, NModal } from 'naive-ui'
import { taskData, taskTree } from './data'
import TaskEdit from './TaskEdit.vue'

const showEdit = ref(false)
const cacheEdit = ref('')

function popupEdit() {
  cacheEdit.value = JSON.stringify(taskData.data, null, 2)
  showEdit.value = true
}

function tryReplace() {
  try {
    taskData.data = JSON.parse(cacheEdit.value)
    showEdit.value = false
  } catch (_err) {}
}

function tryAppend() {
  try {
    taskData.data = {
      ...taskData.data,
      ...JSON.parse(cacheEdit.value)
    }
    showEdit.value = false
  } catch (_err) {}
}

function doReset() {
  cacheEdit.value = JSON.stringify(taskData.data, null, 2)
}

const searchText = ref('')
const selectedKeys = ref<string[]>([])
const selectedKeysHistory = ref<string[]>([])
const selectedKeysFilter = computed({
  set(v: string[]) {
    if (v.length === 0) {
      return
    } else {
      const s = v[0]
      if (s.endsWith('.')) {
        return
      }
      selectedKeysHistory.value.push(s)
      selectedKeys.value = [s]
    }
  },
  get() {
    return selectedKeys.value
  }
})

function navBack() {
  selectedKeysHistory.value.pop()
  selectedKeys.value = [
    selectedKeysHistory.value[selectedKeysHistory.value.length - 1]
  ]
}

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
</script>

<template>
  <NModal v-model:show="showEdit">
    <NCard style="width: 80vw" role="dialog">
      <div class="h-full flex flex-col gap-2">
        <NInput
          class="flex-1"
          type="textarea"
          :autosize="{
            minRows: 20,
            maxRows: 30
          }"
          v-model:value="cacheEdit"
        ></NInput>
        <div class="flex justify-center gap-2">
          <NButton @click="tryReplace">替换</NButton>
          <NButton @click="tryAppend">追加</NButton>
          <NButton @click="doReset">重置</NButton>
        </div>
      </div>
    </NCard>
  </NModal>

  <div class="flex flex-col gap-2 flex-1 min-h-0">
    <div class="flex gap-2">
      <NButton @click="popupEdit">编辑</NButton>
      <NButton v-if="selectedKeysHistory.length > 1" @click="navBack"
        >返回</NButton
      >
    </div>
    <div class="flex gap-2 flex-1 min-h-0">
      <NCard class="max-w-xs min-h-0" content-style="max-height: 100%">
        <div class="flex flex-col gap-2 max-h-full">
          <div class="flex items-center gap-2">
            <span class="whitespace-nowrap">搜索</span>
            <NInput v-model:value="searchText" placeholder="task"></NInput>
          </div>
          <NTree
            class="overflow-y-auto"
            :data="taskTree"
            v-model:selected-keys="selectedKeysFilter"
            block-line
            selectable
            expand-on-click
            accordion
            default-expand-all
            :pattern="searchText"
            :show-irrelevant-nodes="false"
            :cancelable="false"
          ></NTree>
        </div>
      </NCard>
      <NCard :title="active ?? '<Unselect>'">
        <div v-if="active">
          <TaskEdit
            v-model:value="taskData.data[active]"
            @navigate="handleNavigate"
          ></TaskEdit>
        </div>
      </NCard>
    </div>
  </div>
</template>
