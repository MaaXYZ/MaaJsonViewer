<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { MusicNoteOutlined, QueueMusicOutlined } from '@vicons/material'

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
        <MusicNoteOutlined v-if="single"></MusicNoteOutlined>
        <QueueMusicOutlined v-else></QueueMusicOutlined>
      </NIcon>
    </template>
  </NButton>
</template>
