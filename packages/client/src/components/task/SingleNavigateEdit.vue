<script setup lang="ts">
import { findLengthOfLCS } from '@algorithm.ts/lcs'
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
  const low = value.value.toLowerCase()
  return Object.keys(taskIndex.value)
    .map(name => {
      const lowName = name.toLowerCase()
      return {
        name,
        point: findLengthOfLCS(
          low.length,
          lowName.length,
          (i, j) => low[i] === lowName[j]
        )
      }
    })
    .sort((a, b) => {
      if (a.point !== b.point) {
        return b.point - a.point
      } else {
        return a.name.localeCompare(b.name)
      }
    })
    .slice(0, 20)
    .map(x => ({
      label: x.name,
      value: x.name
    }))
})
</script>

<template>
  <div class="flex gap-2 w-full">
    <NButton
      secondary
      :disabled="!(value in taskIndex)"
      :type="value in taskIndex ? 'default' : 'error'"
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
