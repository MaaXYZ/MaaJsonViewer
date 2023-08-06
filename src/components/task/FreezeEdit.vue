<script setup lang="ts">
import { DataObjectOutlined } from '@vicons/material'
import { NInputNumber, NSelect } from 'naive-ui'
import { computed } from 'vue'

import { type UseProducer, applyEditOn, updateEditOn } from '@/persis'
import type { WaitFreezes } from '@/types'

import ClearButton from '@/components/atomic/ClearButton.vue'
import FloatInput from '@/components/atomic/FloatInput.vue'
import SwitchButton from '@/components/atomic/SwitchButton.vue'
import TargetEdit from '@/components/task/TargetEdit.vue'

type T = null | number | WaitFreezes

const props = defineProps<{
  value: T
  edit: UseProducer<T>
}>()

const notObject = computed({
  set(nv: boolean) {
    if (nv) {
      props.edit(() => {
        return (props.value as WaitFreezes).time ?? 1
      })
    } else {
      props.edit(() => {
        return {
          time: (props.value as number | null) ?? 0
        } satisfies WaitFreezes
      })
    }
  },
  get() {
    return props.value === null || typeof props.value === 'number'
  }
})

const wfv = computed(() => {
  return props.value as WaitFreezes
})
const wfe = computed(() => {
  return props.edit as UseProducer<WaitFreezes>
})

const fixThre = (v: number) => {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

const templMethodOptions = [1, 3, 5].map(x => ({
  label: `${x}`,
  value: x
}))
</script>

<template>
  <div class="flex flex-col gap-2">
    <div>
      <SwitchButton v-model:value="notObject">
        <DataObjectOutlined></DataObjectOutlined>
      </SwitchButton>
    </div>
    <div
      class="grid items-center"
      style="
        grid-template-columns: max-content minmax(0, 1fr);
        column-gap: 0.5rem;
        row-gap: 1rem;
      "
    >
      <template v-if="notObject">
        <ClearButton :value="value" :edit="() => edit(() => null)">
          延时
        </ClearButton>
        <NInputNumber
          :value="value as number | null"
          @update:value="v => edit(() => v)"
          placeholder="0"
        >
          <template #suffix> ms </template>
        </NInputNumber>
      </template>
      <template v-else>
        <ClearButton :value="wfv.time ?? null" :edit="applyEditOn(wfe, 'time')">
          延时
        </ClearButton>
        <NInputNumber
          :value="wfv.time ?? null"
          @update:value="v => updateEditOn(wfe, 'time', v)"
          placeholder="1"
        >
          <template #suffix> ms </template>
        </NInputNumber>
        <TargetEdit
          name="目标"
          :target="wfv.target === true ? 1 : wfv.target ?? null"
          :edit-target="applyEditOn(wfe, 'target')"
          :offset="wfv.target_offset ?? null"
          :edit-offset="applyEditOn(wfe, 'target_offset')"
        >
        </TargetEdit>
        <ClearButton
          :value="wfv.threshold ?? null"
          :edit="applyEditOn(wfe, 'threshold')"
        >
          阈值
        </ClearButton>
        <FloatInput
          :value="wfv.threshold ?? null"
          @update:value="v => updateEditOn(wfe, 'threshold', v)"
          nullable
          :def="0.95"
          :alter="fixThre"
        >
        </FloatInput>
        <ClearButton
          :value="wfv.method ?? null"
          :edit="applyEditOn(wfe, 'method')"
        >
          匹配算法
        </ClearButton>
        <NSelect
          :options="templMethodOptions"
          :value="wfv.method ?? null"
          @update:value="(v: 1 | 3 | 5) => updateEditOn(wfe, 'method', v)"
          placeholder="5"
        ></NSelect>
      </template>
    </div>
  </div>
</template>
