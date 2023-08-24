<script setup lang="ts">
import { findLengthOfLCS } from '@algorithm.ts/lcs'
import { useVModel } from '@vueuse/core'
import { NAutoComplete } from 'naive-ui'
import { computed } from 'vue'

import { imageIndex } from '@/data'

const props = defineProps<{
  value: string
}>()

const emits = defineEmits<{
  'update:value': [string]
}>()

const value = useVModel(props, 'value', emits, {
  passive: true
})

const options = computed(() => {
  const low = value.value.toLowerCase()
  return Object.keys(imageIndex.value)
    .map(name => {
      const lowName = name.toLowerCase()
      return {
        name,
        point: findLengthOfLCS(
          low.length,
          lowName.length,
          (i, j) => low[i] === lowName[j]
        )
      }
    })
    .sort((a, b) => {
      if (a.point !== b.point) {
        return b.point - a.point
      } else {
        return a.name.localeCompare(b.name)
      }
    })
    .slice(0, 20)
    .map(x => ({
      label: x.name,
      value: x.name
    }))
})
</script>

<template>
  <NAutoComplete
    v-model:value="value"
    :input-props="{
      autocomplete: 'disabled'
    }"
    :options="options"
    placeholder="template"
  ></NAutoComplete>
</template>
