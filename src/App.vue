<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { NButton, NTree, NCard, NInput, NModal } from 'naive-ui'
import { taskData, taskTree } from './data'
import TaskEdit from '@/components/TaskEdit.vue'

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

const history = reactive<{
  backward: string[]
  forward: string[]
}>({ backward: [], forward: [] })
function historyPush(v: string) {
  history.backward.push(v)
  history.forward = []
  selectedKeys.value = [v]
}
function historyUndo() {
  history.forward.push(history.backward.pop()!)
  selectedKeys.value = [history.backward[history.backward.length - 1]]
}
function historyRedo() {
  const v = history.forward.pop()!
  history.backward.push(v)
  selectedKeys.value = [v]
}

const selectedKeysFilter = computed({
  set(v: string[]) {
    if (v.length === 0) {
      return
    } else {
      const s = v[0]
      if (s.endsWith('.')) {
        return
      }
      historyPush(s)
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
      <NButton :disabled="history.backward.length <= 1" @click="historyUndo">
        ⏪
      </NButton>
      <NButton :disabled="history.forward.length === 0" @click="historyRedo">
        ⏩
      </NButton>
      <NButton @click="popupEdit"> ✏️ </NButton>
    </div>
    <div class="flex gap-2 flex-1 min-h-0">
      <NCard
        class="max-w-xs min-h-0"
        content-style="max-height: 100%; display: flex; flex-direction: column"
      >
        <div class="flex flex-col gap-2 flex-1 min-h-0">
          <div class="flex items-center gap-2">
            <span class="whitespace-nowrap">🔎</span>
            <NInput v-model:value="searchText" placeholder="task"></NInput>
          </div>
          <div ref="treeParentEl" class="flex flex-col flex-1 min-h-0">
            <NTree
              :style="{
                height: treeHeight
              }"
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
              virtual-scroll
            ></NTree>
          </div>
        </div>
      </NCard>
      <NCard class="min-h-0" content-style="max-height: 100%">
        <template v-if="active">
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
