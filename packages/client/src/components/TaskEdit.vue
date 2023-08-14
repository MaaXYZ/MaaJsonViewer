<script setup lang="ts">
import {
  CheckOutlined,
  CloseOutlined,
  ContentCopyOutlined,
  DeleteOutlined
} from '@vicons/material'
import { useVModel } from '@vueuse/core'
import {
  NButton,
  NCard,
  NCollapse,
  NCollapseItem,
  NIcon,
  NModal,
  NSwitch
} from 'naive-ui'
import { computed, ref } from 'vue'

import { deleteTask, duplicateTask, taskBackwardIndex, taskIndex } from '@/data'
import { type PathKey, path } from '@/filesystem'
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
  name: PathKey
  value: Task
}>()

const emits = defineEmits<{
  'update:value': [Task]
}>()

const value = useVModel(props, 'value', emits, {
  passive: true,
  deep: true
})

const hash = computed(() => {
  const [, , hash] = path.divide(props.name)
  return hash!
})

function tryDuplicate() {
  duplicateTask(props.name)
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
  deleteTask(
    props.name,
    doTransfer.value ? taskIndex.value[transferTo.value] : null
  )
}
</script>

<template>
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
        v-model:value="transferTo"
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
            <RecognizerEdit v-model:value="value"></RecognizerEdit>
          </NCollapseItem>
          <NCollapseItem title="动作" name="act">
            <ActionEdit v-model:value="value"></ActionEdit>
          </NCollapseItem>
          <NCollapseItem title="其他" name="misc">
            <MiscEdit v-model:value="value"></MiscEdit>
          </NCollapseItem>
          <NCollapseItem title="引用" name="ref">
            <FormLayout>
              <ClearButton propkey="" :value="null"> 前序任务 </ClearButton>
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
      <JsonEdit style="width: 450px" v-model:value="value"></JsonEdit>
    </div>
  </div>
</template>