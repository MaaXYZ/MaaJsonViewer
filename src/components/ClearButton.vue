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
    :type="val === null ? 'default' : 'primary'"
  >
    <slot></slot>
  </NButton>
</template>
