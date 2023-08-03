<script setup lang="ts" generic="T">
import { NButton } from 'naive-ui'

withDefaults(
  defineProps<{
    invalid?: boolean
  }>(),
  {
    invalid: false
  }
)

const val = defineModel<T | null>({
  required: true
})
</script>

<template>
  <NButton
    secondary
    @click="invalid || (val = null)"
    :type="val === null ? (invalid ? 'error' : 'default') : 'primary'"
    :style="{
      cursor: invalid ? 'not-allowed' : 'pointer'
    }"
  >
    <slot></slot>
  </NButton>
</template>
