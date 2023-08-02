<script setup lang="ts">
import type { Rect } from '@/types'
import IntInput from './IntInput.vue'

const rect = defineModel<Rect>('value', {
  required: true
})
const prefixs = ['X:', 'Y:', 'W:', 'H:']
</script>

<template>
  <div class="flex gap-2">
    <IntInput
      v-for="i in 4"
      :key="i"
      :value="rect[i - 1]"
      @update:value="(v: number) => {
        rect[i - 1] = v
      }"
    >
      {{ prefixs[i - 1] }}
    </IntInput>
  </div>
</template>
