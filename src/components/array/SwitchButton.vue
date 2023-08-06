<script setup lang="ts">
import { DataArrayOutlined } from '@vicons/material'
import { NButton, NIcon } from 'naive-ui'

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
    <template #icon>
      <NIcon>
        <DataArrayOutlined></DataArrayOutlined>
      </NIcon>
    </template>
  </NButton>
</template>
