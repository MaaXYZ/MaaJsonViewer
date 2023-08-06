<script setup lang="ts" generic="T, U">
import { NButton, NPopover } from 'naive-ui'

import type { UseProducer } from '@/persis'

withDefaults(
  defineProps<{
    propkey: string
    value: T | null
    edit: UseProducer<U | null>
    invalid?: boolean
  }>(),
  {
    invalid: false
  }
)
</script>

<template>
  <NPopover trigger="hover">
    <template #trigger>
      <NButton
        secondary
        @click="
          () => {
            if (!invalid) {
              edit(() => null)
            }
          }
        "
        :type="value === null ? (invalid ? 'error' : 'default') : 'primary'"
        :style="{
          cursor: invalid ? 'not-allowed' : 'pointer'
        }"
      >
        <slot></slot>
      </NButton>
    </template>

    <span>{{ propkey }}</span>
  </NPopover>
</template>
