<script setup lang="ts">
import { DataObjectOutlined } from '@vicons/material'
import { useVModel } from '@vueuse/core'
import { NInputNumber, NSelect } from 'naive-ui'
import { type Ref, computed } from 'vue'

import { wrapProp, wrapPropEx } from '@/misc'
import type { WaitFreezes } from '@/types'

import ClearButton from '@/components/atomic/ClearButton.vue'
import FloatInput from '@/components/atomic/FloatInput.vue'
import SwitchButton from '@/components/atomic/SwitchButton.vue'
import TargetEdit from '@/components/task/TargetEdit.vue'
import FormLayout from '@/layout/FormLayout.vue'

type T = null | number | WaitFreezes

const props = defineProps<{
  value: T
  propkey: string
}>()

const emits = defineEmits<{
  'update:value': [T]
}>()

const value = useVModel(props, 'value', emits, {
  passive: true,
  deep: true
})

const notObject = computed({
  set(nv: boolean) {
    if (nv) {
      value.value = (value.value as WaitFreezes).time ?? 1
    } else {
      value.value = {
        time: (value.value as number | null) ?? 0
      } satisfies WaitFreezes
    }
  },
  get() {
    return value.value === null || typeof value.value === 'number'
  }
})

const fixThre = (v: number) => {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

const templMethodOptions = [1, 3, 5].map(x => ({
  label: `${x}`,
  value: x
}))

const wfTime = wrapProp(value as Ref<WaitFreezes>, 'time')
const wfTarget = wrapPropEx(
  value as Ref<WaitFreezes>,
  'target',
  v => (v === true ? 1 : v),
  v => (v === 1 ? true : v)
)
const wfOffset = wrapProp(value as Ref<WaitFreezes>, 'target_offset')
const wfThreshold = wrapProp(value as Ref<WaitFreezes>, 'threshold')
const wfMethod = wrapProp(value as Ref<WaitFreezes>, 'method')
</script>

<template>
  <ClearButton :propkey="propkey" v-model:value="value">
    <slot></slot>
  </ClearButton>
  <div class="flex flex-col gap-2">
    <div>
      <SwitchButton v-model:value="notObject">
        <DataObjectOutlined></DataObjectOutlined>
      </SwitchButton>
    </div>
    <FormLayout>
      <template v-if="notObject">
        <NInputNumber v-model:value="value as number | null" placeholder="0">
          <template #suffix> ms </template>
        </NInputNumber>
      </template>
      <template v-else>
        <ClearButton :propkey="`${propkey}.time`" v-model:value="wfTime">
          延时
        </ClearButton>
        <NInputNumber v-model:value="wfTime" placeholder="1">
          <template #suffix> ms </template>
        </NInputNumber>
        <TargetEdit
          propkey="target"
          name="目标"
          v-model:target="wfTarget"
          v-model:offset="wfOffset"
        >
        </TargetEdit>
        <ClearButton
          :propkey="`${propkey}.threshold`"
          v-model:value="wfThreshold"
        >
          阈值
        </ClearButton>
        <FloatInput
          v-model:value="wfThreshold"
          nullable
          :def="0.95"
          :alter="fixThre"
        >
        </FloatInput>
        <ClearButton :propkey="`${propkey}.method`" v-model:value="wfMethod">
          匹配算法
        </ClearButton>
        <NSelect
          :options="templMethodOptions"
          v-model:value="wfMethod"
          placeholder="5"
        ></NSelect>
      </template>
    </FormLayout>
  </div>
</template>
