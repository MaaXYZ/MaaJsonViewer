<script setup lang="ts">
import { NInput, NPopover, NButton, NIcon } from 'naive-ui'
import { SearchOutlined } from '@vicons/material'
import { computed, ref, watch } from 'vue'
import SingleArrayEdit from './SingleArrayEdit.vue'
import ClearButton from './ClearButton.vue'
import SingleArrayButton from './SingleArrayButton.vue'
import FloatInput from './FloatInput.vue'

const templDef = ''
const threDef = 0.7

const taskTemplate = defineModel<string | string[] | null>('template', {
  required: true
})
const taskThreshold = defineModel<number | number[] | null>('threshold', {
  required: true
})

const isTemplateSingle = computed(() => !(taskTemplate.value instanceof Array))
const isThresholdSingle = computed(
  () => !(taskThreshold.value instanceof Array)
)

watch(taskTemplate, nv => {
  if (typeof nv === 'string' && !isThresholdSingle.value) {
    thresholdSingle.value = true
  }
})

const thresholdSingle = computed<boolean>({
  set(v) {
    if (v === isThresholdSingle.value) {
      return
    }
    if (v) {
      taskThreshold.value = (taskThreshold.value as number[])[0]
    } else {
      if (isTemplateSingle.value) {
        return
      } else {
        const v =
          taskThreshold.value === null
            ? threDef
            : (taskThreshold.value as number)
        taskThreshold.value = Array.from(
          {
            length: (taskTemplate.value as string[]).length
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
  <ClearButton v-model="taskTemplate" invalid> 模板路径 </ClearButton>
  <SingleArrayEdit
    v-model:value="taskTemplate"
    :def="() => templDef"
    :is-t="(v: string | string[]) => (typeof v === 'string')"
    :on-add="() => {
      if (!isThresholdSingle) {
        (taskThreshold as number[]).push(threDef)
      }
    }"
    :on-del="idx => {
      if (!isThresholdSingle) {
        (taskThreshold as number[]).splice(idx, 1)
      }
    }"
  >
    <template #edit="{ value, update, index }">
      <div class="flex gap-2">
        <NInput
          :value="value"
          @update:value="update"
          placeholder="template"
        ></NInput>
        <FloatInput
          v-if="!isThresholdSingle"
          :nullable="false"
          :def="threDef"
          :value="(taskThreshold as number[])[index]"
          @update:value="v => {
            (taskThreshold as number[])[index] = v
          }"
          :alter="fixThre"
        ></FloatInput>
        <NPopover trigger="hover" placement="bottom">
          <template #trigger>
            <NButton>
              <template #icon>
                <NIcon>
                  <SearchOutlined></SearchOutlined>
                </NIcon>
              </template>
            </NButton>
          </template>

          <img :src="`/res/${value}`" />
        </NPopover>
      </div>
    </template>
  </SingleArrayEdit>
  <ClearButton v-model="taskThreshold"> 模板阈值 </ClearButton>
  <div class="flex flex-col gap-2">
    <div class="flex gap-2">
      <SingleArrayButton
        v-model:value="thresholdSingle"
        :disabled="isTemplateSingle"
      ></SingleArrayButton>
    </div>
    <FloatInput
      v-if="isThresholdSingle"
      :nullable="true"
      :def="threDef"
      :value="(taskThreshold as number)"
      @update:value="
        v => {
          taskThreshold = v
        }
      "
      :alter="fixThre"
    ></FloatInput>
  </div>
</template>
