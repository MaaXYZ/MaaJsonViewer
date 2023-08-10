<script setup lang="ts">
import {
  AdsClickOutlined,
  ErrorOutlineOutlined,
  MovingOutlined,
  RepeatOutlined,
  StartOutlined,
  StopOutlined,
  SwipeRightOutlined,
  TranslateOutlined,
  WavingHandOutlined
} from '@vicons/material'
import { useVModel } from '@vueuse/core'
import { NAutoComplete, NButton, NIcon, NInput, NPopover } from 'naive-ui'
import { computed } from 'vue'

import { getTask, navigate, taskIndex } from '@/data'

import ImageHover from '@/components/atomic/ImageHover.vue'

type T = string

const props = defineProps<{
  value: T
  readonly?: boolean
}>()

const emits = defineEmits<{
  'update:value': [T]
}>()

const value = useVModel(props, 'value', emits, {
  passive: true
})

const navTask = computed(() => {
  return getTask(taskIndex.value[value.value] ?? null)
})

const options = computed(() => {
  const lowerSearch = value.value.toLowerCase()
  return Object.keys(taskIndex.value)
    .map(name => ({
      name,
      type: name.toLowerCase().startsWith(lowerSearch)
        ? 0
        : name.toLowerCase().indexOf(lowerSearch) !== -1
        ? 1
        : 2
    }))
    .filter(({ type }) => type < 2)
    .sort((a, b) => a.type - b.type)
    .map(x => ({
      label: x.name,
      value: x.name
    }))
})
</script>

<template>
  <div class="flex gap-2">
    <NButton
      :disabled="!(value in taskIndex)"
      @click="navigate(taskIndex[value])"
    >
      <template #icon>
        <NIcon>
          <RepeatOutlined v-if="navTask?.is_sub"></RepeatOutlined>
          <MovingOutlined v-else-if="navTask"></MovingOutlined>
          <ErrorOutlineOutlined v-else></ErrorOutlineOutlined>
        </NIcon>
      </template>
    </NButton>
    <NInput v-if="readonly" readonly :value="value"></NInput>
    <NAutoComplete
      v-else
      v-model:value="value"
      :input-props="{
        autocomplete: 'disabled'
      }"
      :options="options"
      placeholder="task"
    ></NAutoComplete>
    <template v-if="navTask">
      <template v-if="navTask.template">
        <ImageHover :url="navTask.template"></ImageHover>
      </template>
      <template v-else-if="navTask.text">
        <NPopover trigger="hover">
          <template #trigger>
            <NButton>
              <template #icon>
                <NIcon>
                  <TranslateOutlined></TranslateOutlined>
                </NIcon>
              </template>
            </NButton>
          </template>

          <span>
            {{ navTask.text }}
          </span>
        </NPopover>
      </template>
      <NButton>
        <template #icon>
          <NIcon>
            <WavingHandOutlined
              v-if="!navTask.action || navTask.action === 'DoNothing'"
            ></WavingHandOutlined>
            <AdsClickOutlined
              v-else-if="navTask.action === 'Click'"
            ></AdsClickOutlined>
            <SwipeRightOutlined
              v-else-if="navTask.action === 'Swipe'"
            ></SwipeRightOutlined>
            <StartOutlined
              v-else-if="navTask.action === 'StartApp'"
            ></StartOutlined>
            <StopOutlined
              v-else-if="
                navTask.action === 'StopApp' || navTask.action === 'StopTask'
              "
            ></StopOutlined>
          </NIcon>
        </template>
      </NButton>
    </template>
  </div>
</template>
