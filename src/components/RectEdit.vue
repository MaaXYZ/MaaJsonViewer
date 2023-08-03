<script setup lang="ts">
import type { Rect } from '@/types'
import IntInput from './IntInput.vue'
import { ref } from 'vue'

const rect = defineModel<Rect>('value', {
  required: true
})
const prefixs = ['X:', 'Y:', 'W:', 'H:']

type IntInputType = InstanceType<typeof IntInput>
const inputEl = ref<IntInputType[]>([])
function handleOverflow(s: string, i: number) {
  if (i < 3) {
    for (const el of inputEl.value) {
      if (el.getIndex() === i + 1) {
        el.setValue(s)
        break
      }
    }
  }
}
// 123, 456, 789, 122
</script>

<template>
  <div class="flex gap-2">
    <IntInput
      v-for="i in 4"
      :key="i"
      :idx="i - 1"
      ref="inputEl"
      :value="rect[i - 1]"
      @update:value="(v: number) => {
        rect[i - 1] = v
      }"
      @overflow-input="s => handleOverflow(s, i - 1)"
    >
      {{ prefixs[i - 1] }}
    </IntInput>
  </div>
</template>
