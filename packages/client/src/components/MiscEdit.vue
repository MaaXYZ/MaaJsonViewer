<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { NInputNumber, NSwitch } from 'naive-ui'

import { wrapProp, wrapPropEx } from '@/misc'
import type { Task } from '@/types'

import ArrayNavigateEdit from './task/ArrayNavigateEdit.vue'
import ClearButton from '@/components/atomic/ClearButton.vue'
import FreezeEdit from '@/components/task/FreezeEdit.vue'
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

const tNext = wrapProp(value, 'next')
const tSub = wrapProp(value, 'is_sub')
const tInv = wrapProp(value, 'inverse')
const tEnable = wrapProp(value, 'enabled')
const tTimeout = wrapProp(value, 'timeout')
const tTimeoutNext = wrapProp(value, 'timeout_next')
const tTimes = wrapProp(value, 'times_limit')
const tRunoutNext = wrapProp(value, 'runout_next')
const tPreDelay = wrapProp(value, 'pre_delay')
const tPostDelay = wrapProp(value, 'post_delay')
const tPreWf = wrapProp(value, 'pre_wait_freezes')
const tPostWf = wrapProp(value, 'post_wait_freezes')
const tNotify = wrapProp(value, 'notify')
</script>

<template>
  <FormLayout>
    <ClearButton propkey="next" v-model:value="tNext"> 正常后续 </ClearButton>
    <ArrayNavigateEdit v-model:value="tNext"></ArrayNavigateEdit>
    <ClearButton propkey="is_sub" v-model:value="tSub"> 子任务 </ClearButton>
    <div>
      <NSwitch
        :value="tSub ?? false"
        @update:value="
          v => {
            tSub = v
          }
        "
      ></NSwitch>
    </div>
    <ClearButton propkey="inverse" v-model:value="tInv"> 识别反转 </ClearButton>
    <div>
      <NSwitch
        :value="tInv ?? false"
        @update:value="
          v => {
            tInv = v
          }
        "
      ></NSwitch>
    </div>
    <ClearButton propkey="enabled" v-model:value="tEnable"> 启用 </ClearButton>
    <div>
      <NSwitch
        :value="tEnable ?? true"
        @update:value="
          v => {
            tEnable = v
          }
        "
      ></NSwitch>
    </div>
    <ClearButton propkey="timeout" v-model:value="tTimeout"> 超时 </ClearButton>
    <NInputNumber v-model:value="tTimeout" placeholder="20000" :min="0">
      <template #suffix>ms</template></NInputNumber
    >
    <ClearButton propkey="timeout_next" v-model:value="tTimeoutNext">
      超时后续
    </ClearButton>
    <ArrayNavigateEdit v-model:value="tTimeoutNext"></ArrayNavigateEdit>
    <ClearButton propkey="times_limit" v-model:value="tTimes">
      次数
    </ClearButton>
    <NInputNumber
      v-model:value="tTimes"
      placeholder="<UINT_MAX>"
      :min="0"
    ></NInputNumber>
    <ClearButton propkey="runout_next" v-model:value="tRunoutNext">
      超次数后续
    </ClearButton>
    <ArrayNavigateEdit v-model:value="tRunoutNext"></ArrayNavigateEdit>
    <ClearButton propkey="pre_delay" v-model:value="tPreDelay">
      前延时
    </ClearButton>
    <NInputNumber v-model:value="tPreDelay" placeholder="200" :min="0">
      <template #suffix>ms</template></NInputNumber
    >
    <ClearButton propkey="post_delay" v-model:value="tPostDelay">
      后延时
    </ClearButton>
    <NInputNumber v-model:value="tPostDelay" placeholder="500" :min="0">
      <template #suffix>ms</template>
    </NInputNumber>
    <FreezeEdit
      propkey="pre_wait_freezes"
      key="pre_wait_freezes"
      v-model:value="tPreWf"
    >
      前静止等待
    </FreezeEdit>
    <FreezeEdit
      propkey="post_wait_freezes"
      key="post_wait_freezes"
      v-model:value="tPostWf"
      >后静止等待
    </FreezeEdit>
    <ClearButton propkey="notify" v-model:value="tNotify">
      触发回调
    </ClearButton>
    <div>
      <NSwitch
        :value="tNotify ?? false"
        @update:value="
          v => {
            tNotify = v
          }
        "
      ></NSwitch>
    </div>
  </FormLayout>
</template>
