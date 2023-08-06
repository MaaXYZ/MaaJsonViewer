<script setup lang="ts">
import { NAutoComplete } from 'naive-ui'
import { computed } from 'vue'
import type { UseProducer } from '@/persis'
import { imgIndex } from '@/data/image'

const props = defineProps<{
  value: string
  edit: UseProducer<string>
}>()

const options = computed(() => {
  const lowerSearch = props.value.toLowerCase().split(/ +/)
  if (lowerSearch.length === 0) {
    return []
  }
  return imgIndex.value
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
    :value="value"
    @update:value="
      (v: string) => {
        edit(() => v)
      }
    "
    :input-props="{
      autocomplete: 'disabled'
    }"
    :options="options"
    placeholder="template"
  ></NAutoComplete>
</template>
