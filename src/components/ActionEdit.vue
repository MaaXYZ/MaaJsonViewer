<script setup lang="ts">
import { NSelect, NButton, NSwitch, NInput } from 'naive-ui'
import { computed, watch, type Ref } from 'vue'
import { type Task, type Rect, type TextRepl, wrapProp } from '@/types'
import ClearButton from './ClearButton.vue'
import SingleArrayEdit from './SingleArrayEdit.vue'
import RectEdit from './RectEdit.vue'
import TemplateEdit from './TemplateEdit.vue'
import StringArrayEdit from './StringArrayEdit.vue'
import JsonEdit from './JsonEdit.vue'
import NavigateEdit from './NavigateEdit.vue'
import TargetEdit from './TargetEdit.vue'

defineProps<{
  navigate: (to: string) => void
}>()

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

const taskTarget = wrapProp(task, 'target')
const taskTargetOfs = wrapProp(task, 'target_offset')

const taskBegin = wrapProp(task, 'begin')
const taskBeginOfs = wrapProp(task, 'begin_offset')
const taskEnd = wrapProp(task, 'end')
const taskEndOfs = wrapProp(task, 'end_offset')

const taskKey = wrapProp(task, 'key')

const taskPackage = wrapProp(task, 'package')

const taskCustomAct = wrapProp(task, 'custom_action')
const taskCustomActParam = wrapProp(task, 'custom_action_param')
</script>

<template>
  <ClearButton v-model="taskAct"> 动作 </ClearButton>
  <NSelect
    v-model:value="taskAct"
    :options="actOptions"
    :placeholder="actOptions[0].label"
  ></NSelect>
  <template v-if="taskActValue === 'Click'">
    <TargetEdit
      name="目标"
      v-model:offset="taskTargetOfs"
      :value="taskTarget === true ? 1 : taskTarget"
      :navigate="navigate"
      @update:value="
        v => {
          taskTarget = v === 1 ? true : v
        }
      "
    ></TargetEdit>
  </template>
  <template v-else-if="taskActValue === 'Swipe'">
    <TargetEdit
      name="起点"
      v-model:offset="taskBeginOfs"
      :value="taskBegin === true ? 1 : taskBegin"
      :navigate="navigate"
      @update:value="
        v => {
          taskBegin = v === 1 ? true : v
        }
      "
    ></TargetEdit>
    <TargetEdit
      required
      name="终点"
      v-model:offset="taskEndOfs"
      :value="taskEnd === true ? 1 : taskEnd"
      :navigate="navigate"
      @update:value="
        v => {
          taskEnd = v === 1 ? true : v
        }
      "
    ></TargetEdit>
  </template>
  <template v-else-if="taskActValue === 'Key'">
    <ClearButton v-model="taskKey"> 按键 </ClearButton>
    <span> {{ taskKey }} </span>
  </template>
  <template v-else-if="taskActValue === 'StartApp'">
    <ClearButton v-model="taskPackage"> 包名 </ClearButton>
    <StringArrayEdit
      type="single"
      :nullable="true"
      def=""
      :value="taskPackage"
      @update:value="v => {taskPackage = v as string}"
      placeholder="package/activity"
    ></StringArrayEdit>
  </template>
  <template v-else-if="taskActValue === 'StopApp'">
    <ClearButton v-model="taskPackage"> 包名 </ClearButton>
    <StringArrayEdit
      type="single"
      :nullable="true"
      def=""
      :value="taskPackage"
      @update:value="v => {taskPackage = v as string}"
      placeholder="package"
    ></StringArrayEdit>
  </template>
  <template v-else-if="taskActValue === 'Custom'">
    <ClearButton v-model="taskCustomAct" invalid> 任务名 </ClearButton>
    <NInput v-model:value="taskCustomAct" placeholder="task"></NInput>
    <ClearButton v-model="taskCustomActParam"> 任务参数 </ClearButton>
    <JsonEdit v-model:value="taskCustomActParam"></JsonEdit>
  </template>
</template>
