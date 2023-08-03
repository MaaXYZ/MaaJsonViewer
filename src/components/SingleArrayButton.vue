<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { FolderOutlined, FolderCopyOutlined } from '@vicons/material'

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
        <FolderOutlined v-if="single"></FolderOutlined>
        <FolderCopyOutlined v-else></FolderCopyOutlined>
      </NIcon>
    </template>
  </NButton>
</template>
