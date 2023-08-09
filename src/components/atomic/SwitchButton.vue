<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { NButton, NIcon } from 'naive-ui'

const props = defineProps<{
  value: boolean
  disabled?: boolean
}>()

const emits = defineEmits<{
  'update:value': [boolean]
}>()

const value = useVModel(props, 'value', emits)
</script>

<template>
  <NButton
    :type="value ? 'default' : 'primary'"
    :disabled="disabled"
    @click="value = !value"
  >
    <template #icon>
      <NIcon>
        <slot></slot>
      </NIcon>
    </template>
  </NButton>
</template>
