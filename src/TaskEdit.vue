<script setup lang="ts">
import { NSelect, NButton, NSwitch, NInput } from 'naive-ui'
import { computed, type Ref } from 'vue'
import { type Task, type Rect, type TextRepl, wrapProp } from '@/types'
import ClearButton from '@/components/ClearButton.vue'
import SingleArrayEdit from '@/components/SingleArrayEdit.vue'
import RectEdit from '@/components/RectEdit.vue'
import TemplateEdit from '@/components/TemplateEdit.vue'
import StringArrayEdit from '@/components/StringArrayEdit.vue'
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
const taskNextArr = computed(() =>
  typeof taskNext.value === 'string'
    ? [taskNext.value]
    : taskNext.value === null
    ? []
    : taskNext.value
)
</script>

<template>
  <div class="flex flex-col gap-4 max-h-full">
    <div class="flex justify-center">
      <span class="text-lg"> {{ name }} </span>
    </div>
    <div class="flex flex-col gap-2 overflow-auto">
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
      <JsonEdit v-model:value="task"></JsonEdit>
    </div>
  </div>
</template>
