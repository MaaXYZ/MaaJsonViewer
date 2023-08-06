<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { MusicNoteOutlined, DataArrayOutlined } from '@vicons/material'

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
