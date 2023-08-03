<script setup lang="ts">
import { NCollapse, NCollapseItem } from 'naive-ui'
import { type Task, type Rect, type TextRepl, wrapProp } from '@/types'
import ClearButton from './ClearButton.vue'
import JsonEdit from './JsonEdit.vue'
import NavigateEdit from './NavigateEdit.vue'
import RecognizerEdit from './RecognizerEdit.vue'
import ActionEdit from './ActionEdit.vue'

defineProps<{
  name: string
}>()
defineEmits<{
  navigate: [string]
}>()

const task = defineModel<Task>('value', {
  required: true
})

const taskNext = wrapProp(task, 'next')
</script>

<template>
  <div class="flex flex-col gap-4 max-h-full">
    <div class="flex justify-center">
      <span class="text-lg"> {{ name }} </span>
    </div>
    <div class="flex flex-col flex-1 overflow-auto">
      <div class="flex gap-2">
        <NCollapse>
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
              <ActionEdit v-model:value="task"></ActionEdit>
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
              <ClearButton v-model="taskNext"> 导航 </ClearButton>
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
