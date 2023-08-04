<script setup lang="ts">
import { NButton, NIcon, NAutoComplete, NPopover } from 'naive-ui'
import { computed } from 'vue'
import {
  MovingOutlined,
  WavingHandOutlined,
  AdsClickOutlined,
  SwipeRightOutlined,
  TranslateOutlined
} from '@vicons/material'
import { taskData } from '@/data'
import ImageHover from './ImageHover.vue'

defineProps<{
  navigate?: (to: string) => void
}>()

const val = defineModel<string>('value', {
  required: true
})

const navTask = computed(() => {
  if (val.value in taskData.data) {
    return taskData.data[val.value]
  } else {
    return null
  }
})

const options = computed(() => {
  const lowerSearch = val.value.toLowerCase()
  return Object.keys(taskData.data)
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
    <NButton v-if="navigate" @click="navigate(value)">
      <template #icon>
        <NIcon>
          <MovingOutlined></MovingOutlined>
        </NIcon>
      </template>
    </NButton>
    <NAutoComplete
      v-model:value="val"
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
