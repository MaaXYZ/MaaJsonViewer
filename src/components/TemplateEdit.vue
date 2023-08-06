<script setup lang="ts">
import { computed, watch } from 'vue'

import { type UseProducer, updateEdit } from '@/persis'

import SingleArrayEdit from './SingleArrayEdit.vue'
import SingleTemplateEdit from './SingleTemplateEdit.vue'
import SwitchButton from '@/components/array/SwitchButton.vue'
import ClearButton from '@/components/atomic/ClearButton.vue'
import FloatInput from '@/components/atomic/FloatInput.vue'
import ImageHover from '@/components/atomic/ImageHover.vue'

type TTemp = string | string[] | null
type TThre = number | number[] | null

const props = defineProps<{
  template: TTemp
  editTemplate: UseProducer<TTemp>
  threshold: TThre
  editThreshold: UseProducer<TThre>
}>()

const templDef = ''
const threDef = 0.7

const isTemplateSingle = computed(() => !(props.template instanceof Array))
const isThresholdSingle = computed(() => !(props.threshold instanceof Array))

watch(
  () => props.template,
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
      props.editThreshold(() => {
        return (props.threshold as number[])[0]
      })
    } else {
      if (isTemplateSingle.value) {
        return
      } else {
        const v =
          props.threshold === null ? threDef : (props.threshold as number)

        props.editThreshold(() => {
          return Array.from(
            {
              length: (props.template as string[]).length
            },
            () => v
          )
        })
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
  <ClearButton :value="template" :edit="editTemplate" invalid>
    模板路径
  </ClearButton>
  <SingleArrayEdit
    :value="template"
    :edit="editTemplate"
    :def="() => templDef"
    :is-t="(v: string | string[]) => typeof v === 'string'"
    :on-add="
      () => {
        if (!isThresholdSingle) {
          editThreshold(draft => {
            ;(draft as number[]).push(threDef)
          })
        }
      }
    "
    :on-del="
      idx => {
        if (!isThresholdSingle) {
          editThreshold(draft => {
            ;(draft as number[]).splice(idx, 1)
          })
        }
      }
    "
  >
    <template #edit="{ value, edit, index }">
      <div class="flex gap-2">
        <SingleTemplateEdit :value="value" :edit="edit"></SingleTemplateEdit>
        <FloatInput
          v-if="!isThresholdSingle"
          :nullable="false"
          :def="threDef"
          :value="(threshold as number[])[index]"
          @update:value="
            v => {
              editThreshold(draft => {
                ;(draft as number[])[index] = v
              })
            }
          "
          :alter="fixThre"
        ></FloatInput>
        <ImageHover :url="value"></ImageHover>
      </div>
    </template>
  </SingleArrayEdit>
  <ClearButton :value="threshold" :edit="editThreshold"> 模板阈值 </ClearButton>
  <div class="flex flex-col gap-2">
    <div class="flex gap-2">
      <SwitchButton
        v-model:value="thresholdSingle"
        :disabled="isTemplateSingle"
      ></SwitchButton>
    </div>
    <FloatInput
      v-if="isThresholdSingle"
      :nullable="true"
      :def="threDef"
      :value="threshold as number"
      @update:value="v => updateEdit(editThreshold, v)"
      :alter="fixThre"
    ></FloatInput>
  </div>
</template>
