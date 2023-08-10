<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { NInput } from 'naive-ui'
import { computed, ref } from 'vue'

const props = defineProps<{
  value: number
  idx: number
}>()

const emits = defineEmits<{
  'update:value': [number]
  overflowInput: [string]
}>()

const value = useVModel(props, 'value', emits, {
  passive: true
})

const strVal = computed({
  set(v: string | null) {
    if (v) {
      v = v.replace(/^[^\d]*/, '')
    }
    if (!v || v === '') {
      v = '0'
    }
    const m = /^([0-9]+)(.*)$/.exec(v)
    if (m) {
      if (m[2]) {
        emits('overflowInput', v)
      } else {
        value.value = parseInt(m[1])
      }
    }
  },
  get() {
    return `${value.value}`
  }
})

const el = ref<InstanceType<typeof NInput> | null>(null)

function setValue(v: string | null) {
  if (v) {
    v = v.replace(/^[^\d]*/, '')
  }
  if (v && v.length > 0) {
    strVal.value = v
  } else {
    el.value?.focus()
  }
}

function getIndex() {
  return props.idx
}

defineExpose({ setValue, getIndex })
</script>

<template>
  <NInput ref="el" v-model:value="strVal"></NInput>
</template>
