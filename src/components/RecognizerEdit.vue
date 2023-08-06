<script setup lang="ts">
import { NInput, NSelect, NSwitch } from 'naive-ui'
import { computed } from 'vue'

import { type UseProducer, applyEditOn, updateEditOn } from '@/persis'
import type { Rect, Task, TextRepl } from '@/types'

import TemplateEdit from './TemplateEdit.vue'
import ArrayEdit from '@/components/array/ArrayEdit.vue'
import ArrayStringEdit from '@/components/array/ArrayStringEdit.vue'
import ClearButton from '@/components/atomic/ClearButton.vue'
import JsonEdit from '@/components/atomic/JsonEdit.vue'
import RectEdit from '@/components/atomic/RectEdit.vue'

const props = defineProps<{
  value: Task
  edit: UseProducer<Task>
}>()

const recoOptions = ['DirectHit', 'TemplateMatch', 'OCR', 'Custom'].map(x => ({
  label: x,
  value: x
}))

const taskRecoValue = computed(() => props.value.recognition ?? 'DirectHit')

const templMethodOptions = [1, 3, 5].map(x => ({
  label: `${x}`,
  value: x
}))
</script>

<template>
  <div
    class="grid items-center"
    style="
      grid-template-columns: max-content minmax(0, 1fr);
      column-gap: 0.5rem;
      row-gap: 1rem;
    "
  >
    <ClearButton
      :value="value.recognition ?? null"
      :edit="applyEditOn(edit, 'recognition')"
    >
      识别
    </ClearButton>
    <NSelect
      :value="value.recognition ?? null"
      @update:value="v => updateEditOn(edit, 'recognition', v)"
      :options="recoOptions"
      :placeholder="recoOptions[0].label"
    ></NSelect>
    <template v-if="taskRecoValue !== 'Custom'">
      <ClearButton :value="value.roi ?? null" :edit="applyEditOn(edit, 'roi')">
        识别区域
      </ClearButton>
      <ArrayEdit
        :value="value.roi ?? null"
        :edit="applyEditOn(edit, 'roi')"
        :nullable="true"
        :def="() => [0, 0, 0, 0] as Rect"
        :is-t="
          v => v instanceof Array && v.length === 4 && typeof v[0] === 'number'
        "
      >
        <template #edit="{ value, edit }">
          <RectEdit :value="value" :edit="edit"></RectEdit>
        </template>
      </ArrayEdit>
    </template>
    <template v-if="taskRecoValue === 'TemplateMatch'">
      <TemplateEdit
        :template="value.template ?? null"
        :edit-template="applyEditOn(edit, 'template')"
        :threshold="value.threshold ?? null"
        :edit-threshold="applyEditOn(edit, 'threshold')"
      ></TemplateEdit>
      <ClearButton
        :value="value.method ?? null"
        :edit="applyEditOn(edit, 'method')"
      >
        匹配算法
      </ClearButton>
      <NSelect
        :options="templMethodOptions"
        :value="value.method ?? null"
        @update:value="v => updateEditOn(edit, 'method', v)"
        placeholder="5"
      ></NSelect>
      <ClearButton
        :value="value.green_mask ?? null"
        :edit="applyEditOn(edit, 'green_mask')"
      >
        绿色掩码
      </ClearButton>
      <div>
        <NSwitch
          :value="value.green_mask ?? false"
          @update:value="v => updateEditOn(edit, 'green_mask', v)"
        ></NSwitch>
      </div>
    </template>
    <template v-if="taskRecoValue === 'OCR'">
      <ClearButton
        :value="value.text ?? null"
        :edit="applyEditOn(edit, 'text')"
        invalid
      >
        文本
      </ClearButton>
      <ArrayStringEdit
        :value="value.text ?? null"
        :edit="applyEditOn(edit, 'text')"
        :def="''"
        placeholder="text"
      ></ArrayStringEdit>
      <ClearButton
        :value="value.replace ?? null"
        :edit="applyEditOn(edit, 'replace')"
      >
        文本替换
      </ClearButton>
      <ArrayEdit
        :value="value.replace ?? null"
        :edit="applyEditOn(edit, 'replace')"
        :nullable="true"
        :def="() => ['', ''] as TextRepl"
        :is-t="
          (v: TextRepl | TextRepl[]) =>
            v.length === 2 && typeof v[0] === 'string'
        "
      >
        <template #edit="{ value, edit }">
          <div class="flex gap-2">
            <NInput
              :value="value[0]"
              @update:value="
                v => {
                  edit(draft => {
                    draft[0] = v
                  })
                }
              "
              placeholder="替换"
            >
            </NInput>
            <NInput
              :value="value[1]"
              @update:value="
                v => {
                  edit(draft => {
                    draft[1] = v
                  })
                }
              "
              placeholder="为"
            >
            </NInput>
          </div>
        </template>
      </ArrayEdit>
      <ClearButton
        :value="value.only_rec ?? null"
        :edit="applyEditOn(edit, 'only_rec')"
      >
        仅识别
      </ClearButton>
      <div>
        <NSwitch
          :value="value.only_rec ?? false"
          @update:value="v => updateEditOn(edit, 'only_rec', v)"
        ></NSwitch>
      </div>
    </template>
    <template v-if="taskRecoValue === 'Custom'">
      <ClearButton
        :value="value.custom_recognizer ?? null"
        :edit="applyEditOn(edit, 'custom_recognizer')"
        invalid
      >
        识别器
      </ClearButton>
      <NInput
        :value="value.custom_recognizer ?? null"
        @update:value="v => updateEditOn(edit, 'custom_recognizer', v)"
        placeholder="recognizer"
      ></NInput>
      <ClearButton
        :value="value.custom_recognizer_param ?? null"
        :edit="applyEditOn(edit, 'custom_recognizer_param')"
      >
        识别参数
      </ClearButton>
      <JsonEdit
        :value="value.custom_recognizer_param ?? null"
        @update:value="v => updateEditOn(edit, 'custom_recognizer_param', v)"
      ></JsonEdit>
    </template>
  </div>
</template>
