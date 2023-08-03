<script setup lang="ts">
import { computed } from 'vue'
import { type Task, type Rect, type TextRepl, wrapProp } from '@/types'
import ClearButton from '@/components/ClearButton.vue'
import JsonEdit from './components/JsonEdit.vue'
import NavigateEdit from './components/NavigateEdit.vue'
import RecognizerEdit from '@/components/RecognizerEdit.vue'

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
        <div
          class="grid items-center"
          style="
            grid-template-columns: max-content minmax(0, 1fr);
            column-gap: 0.5rem;
            row-gap: 1rem;
          "
        >
          <RecognizerEdit v-model:value="task"></RecognizerEdit>
          <ClearButton v-model="taskNext"> 导航 </ClearButton>
          <NavigateEdit
            v-model:value="taskNext"
            :navigate="s => $emit('navigate', s)"
          ></NavigateEdit>
        </div>
        <JsonEdit class="max-w-md" v-model:value="task"></JsonEdit>
      </div>
    </div>
  </div>
</template>
