<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { ref } from 'vue'

import type { Rect } from '@/types'

import IntInput from '@/components/atomic/IntInput.vue'

const props = defineProps<{
  value: Rect
}>()

const emits = defineEmits<{
  'update:value': [Rect]
}>()

const value = useVModel(props, 'value', emits, {
  passive: true,
  deep: true
})

type IntInputType = InstanceType<typeof IntInput>
const inputEl = ref<IntInputType[]>([])
function handleOverflow(s: string, i: number) {
  const ns = s
    .split(/[^\d]+/)
    .filter(x => x)
    .map(x => parseInt(x))
  while (i < 4 && ns.length > 0) {
    value.value[i] = ns.shift()!
    i += 1
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
      v-model:value="value[i - 1]"
      @overflow-input="s => handleOverflow(s, i - 1)"
    >
    </IntInput>
  </div>
</template>
