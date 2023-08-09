<script setup lang="ts">
import { NInput, NInputNumber, NSelect } from 'naive-ui'
import { computed } from 'vue'

import { type UseProducer, applyEditOn, updateEditOn } from '@/persis'
import type { Task } from '@/types'

import ArrayEdit from '@/components/array/ArrayEdit.vue'
import SingleStringEdit from '@/components/array/SingleStringEdit.vue'
import ClearButton from '@/components/atomic/ClearButton.vue'
import JsonEdit from '@/components/atomic/JsonEdit.vue'
import TargetEdit from '@/components/task/TargetEdit.vue'
import FormLayout from '@/layout/FormLayout.vue'

const props = defineProps<{
  value: Task
  edit: UseProducer<Task>
}>()

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

const taskActValue = computed(() => props.value.action ?? 'DoNothing')
</script>

<template>
  <FormLayout>
    <ClearButton
      propkey="action"
      :value="value.action ?? null"
      :edit="applyEditOn(edit, 'action')"
    >
      动作
    </ClearButton>
    <NSelect
      :value="value.action ?? null"
      @update:value="v => updateEditOn(edit, 'action', v)"
      :options="actOptions"
      :placeholder="actOptions[0].label"
    ></NSelect>
    <template v-if="taskActValue === 'Click'">
      <TargetEdit
        propkey="target"
        name="目标"
        :target="value.target === true ? 1 : value.target ?? null"
        :edit-target="applyEditOn(edit, 'target')"
        :offset="value.target_offset ?? null"
        :edit-offset="applyEditOn(edit, 'target_offset')"
      ></TargetEdit>
    </template>
    <template v-else-if="taskActValue === 'Swipe'">
      <TargetEdit
        propkey="begin"
        name="起点"
        :target="value.begin === true ? 1 : value.begin ?? null"
        :edit-target="applyEditOn(edit, 'begin')"
        :offset="value.begin_offset ?? null"
        :edit-offset="applyEditOn(edit, 'begin_offset')"
      ></TargetEdit>
      <TargetEdit
        propkey="end"
        required
        name="终点"
        :target="value.end === true ? 1 : value.end ?? null"
        :edit-target="applyEditOn(edit, 'end')"
        :offset="value.end_offset ?? null"
        :edit-offset="applyEditOn(edit, 'end_offset')"
      ></TargetEdit>
    </template>
    <template v-else-if="taskActValue === 'Key'">
      <ClearButton
        propkey="key"
        :value="value.key ?? null"
        :edit="applyEditOn(edit, 'key')"
      >
        按键
      </ClearButton>
      <ArrayEdit
        :value="value.key ?? null"
        :edit="applyEditOn(edit, 'key')"
        :def="() => 0"
        :is-t="v => typeof v === 'number'"
      >
        <template #edit="{ value, edit }">
          <NInputNumber
            :value="value"
            @update:value="v => edit(() => v ?? 0)"
            :min="0"
          ></NInputNumber>
        </template>
      </ArrayEdit>
    </template>
    <template v-else-if="taskActValue === 'StartApp'">
      <ClearButton
        propkey="package"
        :value="value.package ?? null"
        :edit="applyEditOn(edit, 'package')"
      >
        包名
      </ClearButton>
      <SingleStringEdit
        type="single"
        :nullable="true"
        def=""
        :value="value.package ?? null"
        :edit="applyEditOn(edit, 'package')"
        placeholder="package/activity"
      ></SingleStringEdit>
    </template>
    <template v-else-if="taskActValue === 'StopApp'">
      <ClearButton
        propkey="package"
        :value="value.package ?? null"
        :edit="applyEditOn(edit, 'package')"
      >
        包名
      </ClearButton>
      <SingleStringEdit
        type="single"
        :nullable="true"
        def=""
        :value="value.package ?? null"
        :edit="applyEditOn(edit, 'package')"
        placeholder="package"
      ></SingleStringEdit>
    </template>
    <template v-else-if="taskActValue === 'Custom'">
      <ClearButton
        propkey="custom_action"
        :value="value.custom_action ?? null"
        :edit="applyEditOn(edit, 'custom_action')"
        invalid
      >
        任务名
      </ClearButton>
      <NInput
        :value="value.custom_action ?? null"
        @update:value="v => updateEditOn(edit, 'custom_action', v)"
        placeholder="task"
      ></NInput>
      <ClearButton
        propkey="custom_action_param"
        :value="value.custom_action_param ?? null"
        :edit="applyEditOn(edit, 'custom_action_param')"
      >
        任务参数
      </ClearButton>
      <JsonEdit
        :value="value.custom_action_param ?? null"
        @update:value="v => updateEditOn(edit, 'custom_action_param', v)"
      ></JsonEdit>
    </template>
  </FormLayout>
</template>
