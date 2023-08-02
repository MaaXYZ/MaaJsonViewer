<script setup lang="ts">
import { NInput } from 'naive-ui'
import { computed } from 'vue'
const val = defineModel<number>('value', {
  required: true
})

const strVal = computed({
  set(v: string | null) {
    v = v ?? '0'
    if (v === '') {
      v = '0'
    }
    if (/^(?:[0-9]+)$/.test(v)) {
      val.value = parseInt(v)
    }
  },
  get() {
    return `${val.value}`
  }
})
</script>

<template>
  <NInput v-model:value="strVal">
    <template #prefix>
      <slot></slot>
    </template>
  </NInput>
</template>
