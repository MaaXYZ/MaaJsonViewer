<script setup lang="ts" generic="T, U">
import { NButton } from 'naive-ui'

import type { UseProducer } from '@/persis'

withDefaults(
  defineProps<{
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
