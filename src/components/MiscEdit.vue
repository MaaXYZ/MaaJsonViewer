<script setup lang="ts">
import { NInputNumber, NSwitch } from 'naive-ui'

import { type UseProducer, applyEditOn, updateEditOn } from '@/persis'
import type { Task } from '@/types'

import ArrayNavigateEdit from './task/ArrayNavigateEdit.vue'
import ClearButton from '@/components/atomic/ClearButton.vue'
import FreezeEdit from '@/components/task/FreezeEdit.vue'

defineProps<{
  value: Task
  edit: UseProducer<Task>
}>()
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
      propkey="next"
      :value="value.next ?? null"
      :edit="applyEditOn(edit, 'next')"
    >
      正常后续
    </ClearButton>
    <ArrayNavigateEdit
      :value="value.next ?? null"
      :edit="applyEditOn(edit, 'next')"
    ></ArrayNavigateEdit>
    <ClearButton
      propkey="is_sub"
      :value="value.is_sub ?? null"
      :edit="applyEditOn(edit, 'is_sub')"
    >
      子任务
    </ClearButton>
    <div>
      <NSwitch
        :value="value.is_sub ?? false"
        @update:value="v => updateEditOn(edit, 'is_sub', v)"
      ></NSwitch>
    </div>
    <ClearButton
      propkey="inverse"
      :value="value.inverse ?? null"
      :edit="applyEditOn(edit, 'inverse')"
    >
      识别反转
    </ClearButton>
    <div>
      <NSwitch
        :value="value.inverse ?? false"
        @update:value="v => updateEditOn(edit, 'inverse', v)"
      ></NSwitch>
    </div>
    <ClearButton
      propkey="timeout"
      :value="value.timeout ?? null"
      :edit="applyEditOn(edit, 'timeout')"
    >
      超时
    </ClearButton>
    <NInputNumber
      :value="value.timeout ?? null"
      @update:value="v => updateEditOn(edit, 'timeout', v)"
      placeholder="20000"
      :min="0"
    >
      <template #suffix>ms</template></NInputNumber
    >
    <ClearButton
      propkey="timeout_next"
      :value="value.timeout_next ?? null"
      :edit="applyEditOn(edit, 'timeout_next')"
    >
      超时后续
    </ClearButton>
    <ArrayNavigateEdit
      :value="value.timeout_next ?? null"
      :edit="applyEditOn(edit, 'timeout_next')"
    ></ArrayNavigateEdit>
    <ClearButton
      propkey="times_limit"
      :value="value.times_limit ?? null"
      :edit="applyEditOn(edit, 'times_limit')"
    >
      次数
    </ClearButton>
    <NInputNumber
      :value="value.times_limit ?? null"
      @update:value="v => updateEditOn(edit, 'times_limit', v)"
      placeholder="<UINT_MAX>"
      :min="0"
    ></NInputNumber>
    <ClearButton
      propkey="runout_next"
      :value="value.runout_next ?? null"
      :edit="applyEditOn(edit, 'runout_next')"
    >
      超次数后续
    </ClearButton>
    <ArrayNavigateEdit
      :value="value.runout_next ?? null"
      :edit="applyEditOn(edit, 'runout_next')"
    ></ArrayNavigateEdit>
    <ClearButton
      propkey="pre_delay"
      :value="value.pre_delay ?? null"
      :edit="applyEditOn(edit, 'pre_delay')"
    >
      前延时
    </ClearButton>
    <NInputNumber
      :value="value.pre_delay ?? null"
      @update:value="v => updateEditOn(edit, 'pre_delay', v)"
      placeholder="200"
      :min="0"
    >
      <template #suffix>ms</template></NInputNumber
    >
    <ClearButton
      propkey="post_delay"
      :value="value.post_delay ?? null"
      :edit="applyEditOn(edit, 'post_delay')"
    >
      后延时
    </ClearButton>
    <NInputNumber
      :value="value.post_delay ?? null"
      @update:value="v => updateEditOn(edit, 'post_delay', v)"
      placeholder="500"
      :min="0"
    >
      <template #suffix>ms</template>
    </NInputNumber>
    <FreezeEdit
      propkey="pre_wait_freezes"
      key="pre_wait_freezes"
      :value="value.pre_wait_freezes ?? null"
      :edit="applyEditOn(edit, 'pre_wait_freezes')"
    >
      前静止等待
    </FreezeEdit>
    <FreezeEdit
      propkey="post_wait_freezes"
      key="post_wait_freezes"
      :value="value.post_wait_freezes ?? null"
      :edit="applyEditOn(edit, 'post_wait_freezes')"
      >后静止等待
    </FreezeEdit>
    <ClearButton
      propkey="notify"
      :value="value.notify ?? null"
      :edit="applyEditOn(edit, 'notify')"
    >
      触发回调
    </ClearButton>
    <div>
      <NSwitch
        :value="value.notify ?? false"
        @update:value="v => updateEditOn(edit, 'notify', v)"
      ></NSwitch>
    </div>
  </div>
</template>
