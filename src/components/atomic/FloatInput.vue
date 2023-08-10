<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { NInput } from 'naive-ui'
import { computed, ref } from 'vue'

const props = defineProps<{
  value: number | null
  nullable: boolean
  def: number
  alter: (v: number) => number
}>()

const emits = defineEmits<{
  'update:value': [number | null]
}>()

const value = useVModel(props, 'value', emits, {
  passive: true
})

function nullVal() {
  return props.nullable ? null : props.def
}

const cacheStr = ref<string | null>(
  value.value === null ? null : `${value.value}`
)

const strVal = computed<string | null>({
  set(v: string | null) {
    cacheStr.value = v
    if (!v || v === '') {
      value.value = nullVal()
    } else {
      const nv = parseFloat(v)
      if (isNaN(nv)) {
        value.value = nullVal()
      } else {
        const anv = props.alter(nv)
        value.value = anv
        if (anv !== nv) {
          cacheStr.value = `${anv}`
        }
      }
    }
  },
  get() {
    return value.value === null ? null : cacheStr.value
  }
})
</script>

<template>
  <NInput v-model:value="strVal" :placeholder="`${def}`">
    <template #prefix>
      <slot></slot>
    </template>
  </NInput>
</template>
