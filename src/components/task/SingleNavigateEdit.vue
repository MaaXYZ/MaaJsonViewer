<script setup lang="ts">
import {
  AdsClickOutlined,
  MovingOutlined,
  RepeatOutlined,
  SwipeRightOutlined,
  TranslateOutlined,
  WavingHandOutlined
} from '@vicons/material'
import { NAutoComplete, NButton, NIcon, NPopover } from 'naive-ui'
import { computed } from 'vue'

import { navigate } from '@/data'
import { getTask, taskIndex } from '@/data/task'
import type { UseProducer } from '@/persis'

import ImageHover from '@/components/atomic/ImageHover.vue'

type T = string

const props = defineProps<{
  value: T
  edit: UseProducer<T>
}>()

const navTask = computed(() => {
  return getTask(taskIndex.value[props.value] ?? null)
})

const options = computed(() => {
  const lowerSearch = props.value.toLowerCase()
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
      v-if="navTask"
      :disabled="!(value in taskIndex)"
      @click="navigate(taskIndex[value])"
    >
      <template #icon>
        <NIcon>
          <RepeatOutlined v-if="navTask.is_sub"></RepeatOutlined>
          <MovingOutlined v-else></MovingOutlined>
        </NIcon>
      </template>
    </NButton>
    <NAutoComplete
      :value="value"
      @update:value="
        v => {
          edit(() => v)
        }
      "
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
          </NIcon>
        </template>
      </NButton>
    </template>
  </div>
</template>
