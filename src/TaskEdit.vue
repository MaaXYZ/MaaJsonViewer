<script setup lang="ts">
import { NSelect, NButton, NSwitch, NInput } from 'naive-ui'
import { computed, type Ref } from 'vue'
import type { Task, Rect, TextRepl } from '@/types'
import ClearButton from '@/components/ClearButton.vue'
import SingleArrayEdit from '@/components/SingleArrayEdit.vue'
import RectEdit from '@/components/RectEdit.vue'
import TemplateEdit from '@/components/TemplateEdit.vue'
import StringArrayEdit from '@/components/StringArrayEdit.vue'
import JsonEdit from './components/JsonEdit.vue'

defineProps<{
  name: string
}>()
defineEmits<{
  navigate: [string]
}>()

const task = defineModel<Task>('value', {
  required: true
})

type RemUndefined<T> = T extends undefined ? never : T

function wrapProp<T extends Record<string, unknown>, K extends string>(
  obj: Ref<T>,
  key: K
) {
  return computed<RemUndefined<T[K]> | null>({
    set(v: RemUndefined<T[K]> | null) {
      if (v === null) {
        if (key in obj.value) {
          delete obj.value[key]
        }
      } else {
        obj.value[key] = v
      }
    },
    get(): RemUndefined<T[K]> | null {
      return (obj.value[key] ?? null) as RemUndefined<T[K]> | null
    }
  })
}

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
        <ClearButton v-model="taskReco"> 识别 </ClearButton>
        <NSelect
          v-model:value="taskReco"
          :options="recoOptions"
          :placeholder="recoOptions[0].label"
        ></NSelect>
        <template v-if="taskRecoValue !== 'Custom'">
          <ClearButton v-model="taskRoi"> 区域 </ClearButton>
          <SingleArrayEdit
            v-model:value="taskRoi"
            :def="() => [0, 0, 0, 0] as Rect"
            :is-t="
              v =>
                v instanceof Array && v.length === 4 && typeof v[0] === 'number'
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
          <StringArrayEdit
            v-model:value="taskText"
            :def="'test'"
          ></StringArrayEdit>
          <ClearButton v-model="taskReplace"> 文本替换 </ClearButton>
          <SingleArrayEdit
            v-model:value="taskReplace"
            :nullable="true"
            :def="() => (['aaa', 'bbb'] as TextRepl)"
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
            :value="taskCustomReco ?? 'demo_reco'"
            @update:value="v => (taskCustomReco = v)"
          ></NInput>
          <ClearButton v-model="taskCustomRecoParam"> 识别参数 </ClearButton>
          <JsonEdit v-model:value="taskCustomRecoParam"></JsonEdit>
        </template>
        <ClearButton v-model="taskNext"> 导航 </ClearButton>
        <div class="flex flex-col gap-2">
          <div v-for="(s, i) in taskNextArr" :key="i" class="flex">
            <NButton @click="$emit('navigate', s)">
              {{ s }}
            </NButton>
          </div>
        </div>
      </div>
      <JsonEdit v-model:value="task"></JsonEdit>
    </div>
  </div>
</template>
