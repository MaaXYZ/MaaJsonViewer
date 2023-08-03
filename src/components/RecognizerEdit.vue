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

const task = defineModel<Task>('value', {
  required: true
})

const recoOptions = ['DirectHit', 'TemplateMatch', 'OCR', 'Custom'].map(x => ({
  label: x,
  value: x
}))

const taskReco = wrapProp(task, 'recognition')
const taskRecoValue = computed(() => taskReco.value ?? 'DirectHit')

const taskRoi = wrapProp(task, 'roi')

const taskTemplate = wrapProp(task, 'template')
const taskThreshold = wrapProp(task, 'threshold')

const taskMethod = wrapProp(task, 'method')
const templMethodOptions = [1, 3, 5].map(x => ({
  label: `${x}`,
  value: x
}))
const taskGMask = wrapProp(task, 'green_mask')

const taskText = wrapProp(task, 'text')
const taskReplace = wrapProp(task, 'replace')
const taskOnlyRec = wrapProp(task, 'only_rec')

const taskCustomReco = wrapProp(task, 'custom_recognizer')
const taskCustomRecoParam = wrapProp(task, 'custom_recognizer_param')
</script>

<template>
  <ClearButton v-model="taskReco"> 识别 </ClearButton>
  <NSelect
    v-model:value="taskReco"
    :options="recoOptions"
    :placeholder="recoOptions[0].label"
  ></NSelect>
  <template v-if="taskRecoValue !== 'Custom'">
    <ClearButton v-model="taskRoi"> 识别区域 </ClearButton>
    <SingleArrayEdit
      v-model:value="taskRoi"
      :nullable="true"
      :def="() => [0, 0, 0, 0] as Rect"
      :is-t="
        v => v instanceof Array && v.length === 4 && typeof v[0] === 'number'
      "
    >
      <template #edit="{ value, update }">
        <RectEdit :value="value" @update:value="update"></RectEdit>
      </template>
    </SingleArrayEdit>
  </template>
  <template v-if="taskRecoValue === 'TemplateMatch'">
    <TemplateEdit
      v-model:template="taskTemplate"
      v-model:threshold="taskThreshold"
    ></TemplateEdit>
    <ClearButton v-model="taskMethod"> 匹配算法 </ClearButton>
    <NSelect
      :options="templMethodOptions"
      v-model:value="taskMethod"
      placeholder="5"
    ></NSelect>
    <ClearButton v-model="taskGMask"> 绿色掩码 </ClearButton>
    <div>
      <NSwitch
        :value="taskGMask ?? false"
        @update:value="(v: boolean) => taskGMask = v"
      ></NSwitch>
    </div>
  </template>
  <template v-if="taskRecoValue === 'OCR'">
    <ClearButton v-model="taskText" invalid> 文本 </ClearButton>
    <StringArrayEdit v-model:value="taskText" :def="'test'"></StringArrayEdit>
    <ClearButton v-model="taskReplace"> 文本替换 </ClearButton>
    <SingleArrayEdit
      v-model:value="taskReplace"
      :nullable="true"
      :def="() => (['', ''] as TextRepl)"
      :is-t="(v: TextRepl | TextRepl[]) => (v.length === 2 && typeof v[0] === 'string')"
    >
      <template #edit="{ value, update }">
        <div class="flex gap-2">
          <NInput
            :value="value[0]"
            @update:value="(v: string) => update([v, value[1]])"
          >
            <template #prefix> 替换: </template>
          </NInput>
          <NInput
            :value="value[1]"
            @update:value="(v: string) => update([value[0], v])"
          >
            <template #prefix> 为: </template>
          </NInput>
        </div>
      </template>
    </SingleArrayEdit>
    <ClearButton v-model="taskOnlyRec"> 仅识别 </ClearButton>
    <div>
      <NSwitch
        :value="taskOnlyRec ?? false"
        @update:value="(v: boolean) => taskOnlyRec = v"
      ></NSwitch>
    </div>
  </template>
  <template v-if="taskRecoValue === 'Custom'">
    <ClearButton v-model="taskCustomReco" invalid> 识别器 </ClearButton>
    <NInput
      :value="taskCustomReco ?? ''"
      @update:value="v => (taskCustomReco = v)"
    ></NInput>
    <ClearButton v-model="taskCustomRecoParam"> 识别参数 </ClearButton>
    <JsonEdit v-model:value="taskCustomRecoParam"></JsonEdit>
  </template>
</template>
