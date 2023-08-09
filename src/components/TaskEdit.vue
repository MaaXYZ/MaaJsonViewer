<script setup lang="ts">
import {
  CheckOutlined,
  CloseOutlined,
  ContentCopyOutlined,
  DeleteOutlined,
  EditOutlined
} from '@vicons/material'
import { produce } from 'immer'
import {
  NButton,
  NCard,
  NCollapse,
  NCollapseItem,
  NIcon,
  NInput,
  NModal,
  NSwitch
} from 'naive-ui'
import { computed, ref } from 'vue'

import { commitDelete, commitDuplicate, commitMove, navigate } from '@/data'
import { taskBackwardIndex, taskIndex } from '@/data/task'
import { Util } from '@/fs'
import type { UseProducer } from '@/persis'
import type { Task } from '@/types'

import ActionEdit from './ActionEdit.vue'
import MiscEdit from './MiscEdit.vue'
import RecognizerEdit from './RecognizerEdit.vue'
import ClearButton from '@/components/atomic/ClearButton.vue'
import JsonEdit from '@/components/atomic/JsonEdit.vue'
import ArrayNavigateEdit from '@/components/task/ArrayNavigateEdit.vue'
import SingleNavigateEdit from '@/components/task/SingleNavigateEdit.vue'
import FormLayout from '@/layout/FormLayout.vue'

const props = defineProps<{
  name: string
  value: Task
  edit: UseProducer<Task>
}>()

const hash = computed(() => {
  const [, , hash] = Util.pathdiv(props.name)
  return hash!
})

const showRename = ref(false)
const titleCache = ref('')

function enterRename() {
  titleCache.value = hash.value
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
    <div class="flex flex-1 gap-2 min-h-0">
      <div
        class="flex flex-col flex-1 overflow-y-auto min-h-0"
        style="min-width: 500px"
      >
        <NCollapse :default-expanded-names="['reco', 'act', 'misc', 'ref']">
          <NCollapseItem title="识别" name="reco">
            <RecognizerEdit :value="value" :edit="edit"></RecognizerEdit>
          </NCollapseItem>
          <NCollapseItem title="动作" name="act">
            <ActionEdit :value="value" :edit="edit"></ActionEdit>
          </NCollapseItem>
          <NCollapseItem title="其他" name="misc">
            <MiscEdit :value="value" :edit="edit"></MiscEdit>
          </NCollapseItem>
          <NCollapseItem title="引用" name="ref">
            <FormLayout>
              <ClearButton propkey="<unknown>" :value="null" :edit="() => {}">
                前序任务
              </ClearButton>
              <ArrayNavigateEdit
                :value="
                  (taskBackwardIndex[hash] ?? []).sort((a, b) =>
                    a.localeCompare(b)
                  )
                "
                :edit="() => {}"
                array
                readonly
              ></ArrayNavigateEdit>
            </FormLayout>
          </NCollapseItem>
        </NCollapse>
      </div>
      <JsonEdit
        style="width: 450px"
        :value="value"
        @update:value="v => edit(() => v)"
      ></JsonEdit>
    </div>
  </div>
</template>
