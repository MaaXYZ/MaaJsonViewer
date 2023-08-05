<script setup lang="ts">
import { computed, ref, type ComputedRef } from 'vue'
import {
  NButton,
  NCollapse,
  NCollapseItem,
  NIcon,
  NModal,
  NCard,
  NInput,
  NSwitch
} from 'naive-ui'
import {
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  ContentCopyOutlined,
  DeleteOutlined
} from '@vicons/material'
import ClearButton from './ClearButton.vue'
import JsonEdit from './JsonEdit.vue'
import NavigateEdit from './NavigateEdit.vue'
import RecognizerEdit from './RecognizerEdit.vue'
import ActionEdit from './ActionEdit.vue'
import { type Task, type Rect, type TextRepl } from '@/types'
import {
  commitMove,
  commitDuplicate,
  commitDelete,
  navigate,
  type TaskData
} from '@/data'
import SingleNavigateEdit from './SingleNavigateEdit.vue'
import { taskIndex } from '@/data/task'
import { produce } from 'immer'
import { type UseProducer, applyEditOn } from '@/persis'
import { Util } from '@/fs'

const props = defineProps<{
  name: string
  value: Task
  edit: UseProducer<Task>
}>()

const hash = computed(() => {
  const [, , hash] = Util.pathdiv(props.name)
  return hash
})

const showRename = ref(false)
const titleCache = ref('')

function enterRename() {
  titleCache.value = hash.value!
  showRename.value = true
}

function tryRename() {
  if (!titleCache || titleCache.value in taskIndex.value) {
    return
  }
  showRename.value = false
  const [dir, file] = Util.pathdiv(props.name)
  const into = Util.pathjoin(dir, file, titleCache.value)
  commitMove(props.name, into)
  navigate(into)
}

function tryDuplicate() {
  commitDuplicate(props.name)
}

const showDelete = ref(false)
const doTransfer = ref(false)
const transferTo = ref('')

function enterDelete() {
  showDelete.value = true
}

function tryDelete() {
  if (
    doTransfer.value &&
    (!(transferTo.value in taskIndex.value) || transferTo.value === hash.value)
  ) {
    return
  }
  showDelete.value = false
  commitDelete(
    props.name,
    doTransfer.value ? taskIndex.value[transferTo.value] : null
  )
}
</script>

<template>
  <NModal v-model:show="showRename">
    <NCard
      style="width: 60vw"
      content-style="display: flex; flex-direction: column; gap: 0.5rem"
    >
      <span class="text-lg">重命名 {{ hash }}</span>
      <NInput v-model:value="titleCache" placeholder="task"></NInput>
      <div class="flex gap-2 justify-end">
        <NButton
          @click="tryRename"
          type="primary"
          :disabled="!titleCache || titleCache in taskIndex"
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

  <NModal v-model:show="showDelete">
    <NCard
      style="width: 60vw"
      content-style="display: flex; flex-direction: column; gap: 0.5rem"
    >
      <span class="text-lg">删除 {{ hash }}</span>
      <div class="flex gap-2 items-center">
        <span> 替换 </span>
        <NSwitch v-model:value="doTransfer"></NSwitch>
      </div>
      <SingleNavigateEdit
        v-show="doTransfer"
        :value="transferTo"
        :edit="
          p => {
            transferTo = produce(transferTo, p)
          }
        "
      ></SingleNavigateEdit>
      <div class="flex gap-2 justify-end">
        <NButton
          @click="tryDelete"
          type="primary"
          :disabled="
            doTransfer && (!(transferTo in taskIndex) || transferTo === hash)
          "
        >
          <template #icon>
            <NIcon>
              <CheckOutlined></CheckOutlined>
            </NIcon>
          </template>
        </NButton>
        <NButton @click="showDelete = false">
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
      <span class="text-lg"> {{ hash }} </span>
      <NButton @click="enterRename">
        <template #icon>
          <NIcon>
            <EditOutlined></EditOutlined>
          </NIcon>
        </template>
      </NButton>
      <NButton @click="tryDuplicate">
        <template #icon>
          <NIcon>
            <ContentCopyOutlined></ContentCopyOutlined>
          </NIcon>
        </template>
      </NButton>
      <NButton @click="enterDelete">
        <template #icon>
          <NIcon>
            <DeleteOutlined></DeleteOutlined>
          </NIcon>
        </template>
      </NButton>
    </div>
    <div class="flex flex-col flex-1 overflow-auto">
      <div class="flex gap-2">
        <NCollapse :default-expanded-names="['reco', 'act', 'misc']">
          <NCollapseItem title="识别" name="reco">
            <RecognizerEdit :value="value" :edit="edit"></RecognizerEdit>
          </NCollapseItem>
          <NCollapseItem title="动作" name="act">
            <ActionEdit :value="value" :edit="edit"></ActionEdit>
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
              <ClearButton
                :value="value.next ?? null"
                :edit="applyEditOn(edit, 'next')"
              >
                Next
              </ClearButton>
              <NavigateEdit
                :value="value.next ?? null"
                :edit="applyEditOn(edit, 'next')"
              ></NavigateEdit>
            </div>
          </NCollapseItem>
        </NCollapse>
        <JsonEdit
          style="min-width: 28rem"
          :value="value"
          @update:value="v => edit(() => v)"
        ></JsonEdit>
      </div>
    </div>
  </div>
</template>
