<script setup lang="ts">
import { NInput } from 'naive-ui'
import { computed, ref } from 'vue'

const props = defineProps<{
  idx: number
}>()
const emits = defineEmits<{
  overflowInput: [string]
}>()
const val = defineModel<number>('value', {
  required: true
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
      val.value = parseInt(m[1])
      if (m[2]) {
        emits('overflowInput', m[2])
      }
    }
  },
  get() {
    return `${val.value}`
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
