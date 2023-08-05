<script setup lang="ts">
import type { Rect } from '@/types'
import IntInput from './IntInput.vue'
import { ref } from 'vue'
import type { UseProducer } from '@/persis'

const props = defineProps<{
  value: Rect
  edit: UseProducer<Rect>
}>()

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
      :value="value[i - 1]"
      @update:value="
        (v: number) => {
          edit(draft => {
            draft[i - 1] = v
          })
        }
      "
      @overflow-input="s => handleOverflow(s, i - 1)"
    >
    </IntInput>
  </div>
</template>
