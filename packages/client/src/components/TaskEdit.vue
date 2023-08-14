<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { NCollapse, NCollapseItem } from 'naive-ui'
import { computed } from 'vue'

import { taskBackwardIndex } from '@/data'
import { type PathKey, path } from '@/filesystem'
import type { Task } from '@/types'

import ActionEdit from './ActionEdit.vue'
import MiscEdit from './MiscEdit.vue'
import RecognizerEdit from './RecognizerEdit.vue'
import ClearButton from '@/components/atomic/ClearButton.vue'
import JsonEdit from '@/components/atomic/JsonEdit.vue'
import ArrayNavigateEdit from '@/components/task/ArrayNavigateEdit.vue'
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
</script>

<template>
  <div class="flex flex-col gap-4 max-h-full">
    <div class="flex justify-center gap-2 items-center">
      <span class="text-lg"> {{ hash }} </span>
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
