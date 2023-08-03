<script setup lang="ts">
import { ref } from 'vue'
import {
  NButton,
  NCollapse,
  NCollapseItem,
  NIcon,
  NModal,
  NCard,
  NInput
} from 'naive-ui'
import { EditOutlined, CheckOutlined, CloseOutlined } from '@vicons/material'
import ClearButton from './ClearButton.vue'
import JsonEdit from './JsonEdit.vue'
import NavigateEdit from './NavigateEdit.vue'
import RecognizerEdit from './RecognizerEdit.vue'
import ActionEdit from './ActionEdit.vue'
import { type Task, type Rect, type TextRepl, wrapProp } from '@/types'
import { commitRename, taskData } from '@/data'

const props = defineProps<{
  name: string
}>()
const emits = defineEmits<{
  navigate: [string]
}>()

const task = defineModel<Task>('value', {
  required: true
})

const taskNext = wrapProp(task, 'next')

const showRename = ref(false)
const titleCache = ref('')

function enterRename() {
  titleCache.value = props.name
  showRename.value = true
}

function tryRename() {
  if (!titleCache || titleCache.value in taskData.data) {
    return
  }
  showRename.value = false
  commitRename(props.name, titleCache.value)
  emits('navigate', titleCache.value)
}
</script>

<template>
  <NModal v-model:show="showRename">
    <NCard
      style="width: 60vw"
      content-style="display: flex; flex-direction: column; gap: 0.5rem"
    >
      <span class="text-lg">重命名 {{ name }}</span>
      <NInput v-model:value="titleCache" placeholder="task"></NInput>
      <div class="flex gap-2 justify-end">
        <NButton
          @click="tryRename"
          type="primary"
          :disabled="!titleCache || titleCache in taskData.data"
        >
          <template #icon>
            <NIcon>
              <CheckOutlined></CheckOutlined>
            </NIcon>
          </template>
        </NButton>
        <NButton @click="showRename = false">
          <template #icon>
            <NIcon>
              <CloseOutlined></CloseOutlined>
            </NIcon>
          </template>
        </NButton>
      </div>
    </NCard>
  </NModal>

  <div class="flex flex-col gap-4 max-h-full">
    <div class="flex justify-center gap-2 items-center">
      <span class="text-lg"> {{ name }} </span>
      <NButton @click="enterRename">
        <template #icon>
          <NIcon>
            <EditOutlined></EditOutlined>
          </NIcon>
        </template>
      </NButton>
    </div>
    <div class="flex flex-col flex-1 overflow-auto">
      <div class="flex gap-2">
        <NCollapse :default-expanded-names="['reco', 'act', 'misc']">
          <NCollapseItem title="识别" name="reco">
            <div
              class="grid items-center"
              style="
                grid-template-columns: max-content minmax(0, 1fr);
                column-gap: 0.5rem;
                row-gap: 1rem;
              "
            >
              <RecognizerEdit v-model:value="task"></RecognizerEdit>
            </div>
          </NCollapseItem>
          <NCollapseItem title="动作" name="act">
            <div
              class="grid items-center"
              style="
                grid-template-columns: max-content minmax(0, 1fr);
                column-gap: 0.5rem;
                row-gap: 1rem;
              "
            >
              <ActionEdit
                v-model:value="task"
                :navigate="s => $emit('navigate', s)"
              ></ActionEdit>
            </div>
          </NCollapseItem>
          <NCollapseItem title="其他" name="misc">
            <div
              class="grid items-center"
              style="
                grid-template-columns: max-content minmax(0, 1fr);
                column-gap: 0.5rem;
                row-gap: 1rem;
              "
            >
              <ClearButton v-model="taskNext"> Next </ClearButton>
              <NavigateEdit
                v-model:value="taskNext"
                :navigate="s => $emit('navigate', s)"
              ></NavigateEdit>
            </div>
          </NCollapseItem>
        </NCollapse>
        <JsonEdit style="min-width: 28rem" v-model:value="task"></JsonEdit>
      </div>
    </div>
  </div>
</template>
