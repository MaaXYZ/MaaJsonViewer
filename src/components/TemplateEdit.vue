<script setup lang="ts">
import { DataArrayOutlined } from '@vicons/material'
import { useVModel } from '@vueuse/core'
import { computed, watch } from 'vue'

import ArrayEdit from '@/components/array/ArrayEdit.vue'
import ClearButton from '@/components/atomic/ClearButton.vue'
import FloatInput from '@/components/atomic/FloatInput.vue'
import ImageHover from '@/components/atomic/ImageHover.vue'
import SwitchButton from '@/components/atomic/SwitchButton.vue'
import SingleTemplateEdit from '@/components/task/SingleTemplateEdit.vue'

type TTemp = string | string[] | null
type TThre = number | number[] | null

const props = defineProps<{
  template: TTemp
  threshold: TThre
}>()

const emits = defineEmits<{
  'update:template': [TTemp]
  'update:threshold': [TThre]
}>()

const template = useVModel(props, 'template', emits, {
  passive: true,
  deep: true
})
const threshold = useVModel(props, 'threshold', emits, {
  passive: true,
  deep: true
})

const templDef = ''
const threDef = 0.7

const isTemplateSingle = computed(() => !(template.value instanceof Array))
const isThresholdSingle = computed(() => !(threshold.value instanceof Array))

watch(
  () => template.value,
  nv => {
    if (typeof nv === 'string' && !isThresholdSingle.value) {
      thresholdSingle.value = true
    }
  }
)

const thresholdSingle = computed<boolean>({
  set(v) {
    if (v === isThresholdSingle.value) {
      return
    }
    if (v) {
      threshold.value = (threshold.value as number[])[0]
    } else {
      if (isTemplateSingle.value) {
        return
      } else {
        const v =
          threshold.value === null ? threDef : (threshold.value as number)

        threshold.value = Array.from(
          {
            length: (template.value as string[]).length
          },
          () => v
        )
      }
    }
  },
  get() {
    return isThresholdSingle.value
  }
})

const fixThre = (v: number) => {
  return v < 0 ? 0 : v > 1 ? 1 : v
}
</script>

<template>
  <ClearButton :propkey="`template`" v-model:value="template" invalid>
    模板路径
  </ClearButton>
  <ArrayEdit
    v-model:value="template"
    :def="() => templDef"
    :is-t="(v: string | string[]) => typeof v === 'string'"
    :on-add="
      () => {
        if (!isThresholdSingle) {
          ;(threshold as number[]).push(threDef)
        }
      }
    "
    :on-del="
      idx => {
        if (!isThresholdSingle) {
          ;(threshold as number[]).splice(idx, 1)
        }
      }
    "
  >
    <template #edit="{ value, update, index }">
      <div class="flex gap-2">
        <SingleTemplateEdit
          :value="value"
          @update:value="update"
        ></SingleTemplateEdit>
        <FloatInput
          v-if="!isThresholdSingle"
          :nullable="false"
          :def="threDef"
          :value="(threshold as number[])[index]"
          @update:value="
            v => {
              ;(threshold as number[])[index] = v!
            }
          "
          :alter="fixThre"
        ></FloatInput>
        <ImageHover :url="value"></ImageHover>
      </div>
    </template>
  </ArrayEdit>
  <ClearButton :propkey="`threshold`" v-model:value="threshold">
    模板阈值
  </ClearButton>
  <div class="flex flex-col gap-2">
    <div class="flex gap-2">
      <SwitchButton
        v-model:value="thresholdSingle"
        :disabled="isTemplateSingle"
      >
        <DataArrayOutlined></DataArrayOutlined>
      </SwitchButton>
    </div>
    <FloatInput
      v-if="isThresholdSingle"
      :nullable="true"
      :def="threDef"
      v-model:value="threshold as number"
      :alter="fixThre"
    ></FloatInput>
  </div>
</template>
