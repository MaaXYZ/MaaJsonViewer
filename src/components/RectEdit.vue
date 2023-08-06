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
  props.edit(draft => {
    const ns = s
      .split(/[^\d]+/)
      .filter(x => x)
      .map(x => parseInt(x))
    while (i < 3 && ns.length > 0) {
      draft[i] = ns.shift()!
      i += 1
    }
  })
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
