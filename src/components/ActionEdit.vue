<script setup lang="ts">
import { NSelect, NButton, NSwitch, NInput } from 'naive-ui'
import { computed, type Ref } from 'vue'
import { type Task, type Rect, type TextRepl, wrapProp } from '@/types'
import ClearButton from './ClearButton.vue'
import SingleArrayEdit from './SingleArrayEdit.vue'
import RectEdit from './RectEdit.vue'
import TemplateEdit from './TemplateEdit.vue'
import StringArrayEdit from './StringArrayEdit.vue'
import JsonEdit from './JsonEdit.vue'
import NavigateEdit from './NavigateEdit.vue'

const task = defineModel<Task>('value', {
  required: true
})

const actOptions = [
  'DoNothing',
  'Click',
  'Swipe',
  'Key',
  'StartApp',
  'StopApp',
  'StopTask',
  'Custom'
].map(x => ({
  label: x,
  value: x
}))

const taskAct = wrapProp(task, 'action')
const taskActValue = computed(() => taskAct.value ?? 'DoNothing')
</script>

<template>
  <ClearButton v-model="taskAct"> 动作 </ClearButton>
  <NSelect
    v-model:value="taskAct"
    :options="actOptions"
    :placeholder="actOptions[0].label"
  ></NSelect>
</template>
