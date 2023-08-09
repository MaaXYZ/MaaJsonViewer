<script setup lang="ts">
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

const value = useVModel(props, 'value', emits)

const options = computed(() => {
  const lowerSearch = value.value
    .toLowerCase()
    .split(/[ /]+/)
    .filter(x => x)
  if (lowerSearch.length === 0) {
    return []
  }
  return Object.keys(imageIndex.value)
    .map(name => ({
      name,
      type: lowerSearch
        .map(key => (name.toLowerCase().indexOf(key) !== -1 ? 0 : 1) as number)
        .reduce((a, b) => a + b, 0)
    }))
    .filter(({ type }) => type < 2)
    .sort((a, b) => a.type - b.type)
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
