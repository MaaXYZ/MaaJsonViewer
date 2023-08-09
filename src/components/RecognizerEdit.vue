<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { NInput, NSelect, NSwitch } from 'naive-ui'
import { computed } from 'vue'

import { wrapProp } from '@/misc'
import type { Rect, Task, TextRepl } from '@/types'

import TemplateEdit from './TemplateEdit.vue'
import ArrayEdit from '@/components/array/ArrayEdit.vue'
import ArrayStringEdit from '@/components/array/ArrayStringEdit.vue'
import ClearButton from '@/components/atomic/ClearButton.vue'
import JsonEdit from '@/components/atomic/JsonEdit.vue'
import RectEdit from '@/components/atomic/RectEdit.vue'
import FormLayout from '@/layout/FormLayout.vue'

const props = defineProps<{
  value: Task
}>()

const emits = defineEmits<{
  'update:value': [Task]
}>()

const value = useVModel(props, 'value', emits, {
  passive: true,
  deep: true
})

const recoOptions = ['DirectHit', 'TemplateMatch', 'OCR', 'Custom'].map(x => ({
  label: x,
  value: x
}))

const templMethodOptions = [1, 3, 5].map(x => ({
  label: `${x}`,
  value: x
}))

const tReco = wrapProp(value, 'recognition')
const tRecoValue = computed(() => tReco.value ?? 'DirectHit')
const tRoi = wrapProp(value, 'roi')
const tTempl = wrapProp(value, 'template')
const tThre = wrapProp(value, 'threshold')
const tMethod = wrapProp(value, 'method')
const tGM = wrapProp(value, 'green_mask')
const tText = wrapProp(value, 'text')
const tRepl = wrapProp(value, 'replace')
const tOR = wrapProp(value, 'only_rec')
const tCust = wrapProp(value, 'custom_recognizer')
const tCustParam = wrapProp(value, 'custom_recognizer_param')
</script>

<template>
  <FormLayout>
    <ClearButton propkey="recognition" v-model:value="tReco">
      识别
    </ClearButton>
    <NSelect
      v-model:value="tReco"
      :options="recoOptions"
      :placeholder="recoOptions[0].label"
    ></NSelect>
    <template v-if="tRecoValue === 'TemplateMatch' || tRecoValue === 'OCR'">
      <ClearButton propkey="roi" v-model:value="tRoi"> 识别区域 </ClearButton>
      <ArrayEdit
        v-model:value="tRoi"
        :nullable="true"
        :def="() => [0, 0, 0, 0] as Rect"
        :is-t="
          v => v instanceof Array && v.length === 4 && typeof v[0] === 'number'
        "
      >
        <template #edit="{ value, update }">
          <RectEdit :value="value" @update:value="update"></RectEdit>
        </template>
      </ArrayEdit>
    </template>
    <template v-if="tRecoValue === 'TemplateMatch'">
      <TemplateEdit
        v-model:template="tTempl"
        v-model:threshold="tThre"
      ></TemplateEdit>
      <ClearButton propkey="method" v-model:value="tMethod">
        匹配算法
      </ClearButton>
      <NSelect
        :options="templMethodOptions"
        v-model:value="tMethod"
        placeholder="5"
      ></NSelect>
      <ClearButton propkey="green_mask" v-model:value="tGM">
        绿色掩码
      </ClearButton>
      <div>
        <NSwitch
          :value="tGM ?? false"
          @update:value="
            v => {
              tGM = v
            }
          "
        ></NSwitch>
      </div>
    </template>
    <template v-if="tRecoValue === 'OCR'">
      <ClearButton propkey="text" v-model:value="tText" invalid>
        文本
      </ClearButton>
      <ArrayStringEdit
        v-model:value="tText"
        :def="''"
        placeholder="text"
      ></ArrayStringEdit>
      <ClearButton propkey="replace" v-model:value="tRepl">
        文本替换
      </ClearButton>
      <ArrayEdit
        v-model:value="tRepl"
        :nullable="true"
        :def="() => ['', ''] as TextRepl"
        :is-t="
          (v: TextRepl | TextRepl[]) =>
            v.length === 2 && typeof v[0] === 'string'
        "
      >
        <template #edit="{ value, update }">
          <div class="flex gap-2">
            <NInput
              :value="value[0]"
              @update:value="
                v => {
                  update([v, value[1]])
                }
              "
              placeholder="替换"
            >
            </NInput>
            <NInput
              :value="value[1]"
              @update:value="
                v => {
                  update([value[0], v])
                }
              "
              placeholder="为"
            >
            </NInput>
          </div>
        </template>
      </ArrayEdit>
      <ClearButton propkey="only_rec" v-model:value="tOR"> 仅识别 </ClearButton>
      <div>
        <NSwitch
          :value="tOR ?? false"
          @update:value="
            v => {
              tOR = v
            }
          "
        ></NSwitch>
      </div>
    </template>
    <template v-if="tRecoValue === 'Custom'">
      <ClearButton propkey="custom_recognizer" v-model:value="tCust" invalid>
        识别器
      </ClearButton>
      <NInput v-model:value="tCust" placeholder="recognizer"></NInput>
      <ClearButton propkey="custom_recognizer_param" v-model:value="tCustParam">
        识别参数
      </ClearButton>
      <JsonEdit v-model:value="tCustParam"></JsonEdit>
    </template>
  </FormLayout>
</template>
