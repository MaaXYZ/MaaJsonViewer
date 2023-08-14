<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { NInput, NInputNumber, NSelect } from 'naive-ui'
import { computed } from 'vue'

import { wrapProp, wrapPropEx } from '@/misc'
import type { Task } from '@/types'

import ArrayEdit from '@/components/array/ArrayEdit.vue'
import SingleStringEdit from '@/components/array/SingleStringEdit.vue'
import ClearButton from '@/components/atomic/ClearButton.vue'
import JsonEdit from '@/components/atomic/JsonEdit.vue'
import TargetEdit from '@/components/task/TargetEdit.vue'
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

const tAct = wrapProp(value, 'action')
const tActValue = computed(() => tAct.value ?? 'DoNothing')
const tTarget = wrapPropEx(
  value,
  'target',
  v => (v === true ? 1 : v),
  v => (v === 1 ? true : v)
)
const tTargetOfs = wrapProp(value, 'target_offset')
const tBegin = wrapPropEx(
  value,
  'begin',
  v => (v === true ? 1 : v),
  v => (v === 1 ? true : v)
)
const tBeginOfs = wrapProp(value, 'begin_offset')
const tEnd = wrapPropEx(
  value,
  'end',
  v => (v === true ? 1 : v),
  v => (v === 1 ? true : v)
)
const tEndOfs = wrapProp(value, 'end_offset')
const tKey = wrapProp(value, 'key')
const tPackage = wrapProp(value, 'package')
const tCust = wrapProp(value, 'custom_action')
const tCustParam = wrapProp(value, 'custom_action_param')
</script>

<template>
  <FormLayout>
    <ClearButton propkey="action" v-model:value="tAct"> 动作 </ClearButton>
    <NSelect
      v-model:value="tAct"
      :options="actOptions"
      :placeholder="actOptions[0].label"
    ></NSelect>
    <template v-if="tActValue === 'Click'">
      <TargetEdit
        propkey="target"
        name="目标"
        v-model:target="tTarget"
        v-model:offset="tTargetOfs"
      ></TargetEdit>
    </template>
    <template v-else-if="tActValue === 'Swipe'">
      <TargetEdit
        propkey="begin"
        name="起点"
        v-model:target="tBegin"
        v-model:offset="tBeginOfs"
      ></TargetEdit>
      <TargetEdit
        propkey="end"
        required
        name="终点"
        v-model:target="tEnd"
        v-model:offset="tEndOfs"
      ></TargetEdit>
    </template>
    <template v-else-if="tActValue === 'Key'">
      <ClearButton propkey="key" v-model:value="tKey"> 按键 </ClearButton>
      <ArrayEdit
        v-model:value="tKey"
        :def="() => 0"
        :is-t="v => typeof v === 'number'"
      >
        <template #edit="{ value, update }">
          <NInputNumber
            :value="value"
            @update:value="v => update(v!)"
            :min="0"
          ></NInputNumber>
        </template>
      </ArrayEdit>
    </template>
    <template v-else-if="tActValue === 'StartApp'">
      <ClearButton propkey="package" v-model:value="tPackage">
        包名
      </ClearButton>
      <SingleStringEdit
        type="single"
        :nullable="true"
        def=""
        v-model:value="tPackage"
        placeholder="package/activity"
      ></SingleStringEdit>
    </template>
    <template v-else-if="tActValue === 'StopApp'">
      <ClearButton propkey="package" v-model:value="tPackage">
        包名
      </ClearButton>
      <SingleStringEdit
        type="single"
        :nullable="true"
        def=""
        v-model:value="tPackage"
        placeholder="package"
      ></SingleStringEdit>
    </template>
    <template v-else-if="tActValue === 'Custom'">
      <ClearButton propkey="custom_action" v-model:value="tCust" invalid>
        任务名
      </ClearButton>
      <NInput v-model:value="tCust" placeholder="task"></NInput>
      <ClearButton propkey="custom_action_param" v-model:value="tCustParam">
        任务参数
      </ClearButton>
      <JsonEdit v-model:value="tCustParam"></JsonEdit>
    </template>
  </FormLayout>
</template>
