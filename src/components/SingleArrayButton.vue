<script setup lang="ts">
import { NButton } from 'naive-ui'

defineProps<{
  disabled?: boolean
}>()

const single = defineModel<boolean>('value', {
  required: true
})
</script>

<template>
  <NButton
    :type="single ? 'default' : 'primary'"
    :disabled="disabled"
    @click="single = !single"
  >
    {{ single ? '🎵' : '🎶' }}
  </NButton>
</template>
