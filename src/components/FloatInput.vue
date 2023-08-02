<script setup lang="ts">
import { NInput } from 'naive-ui'
import { computed, ref } from 'vue'

const props = defineProps<{
  nullable: boolean
  def: number
  alter: (v: number) => number
}>()

const val = defineModel<number | null>('value', {
  required: true
})

function nullVal() {
  return props.nullable ? null : props.def
}

const cacheStr = ref<string | null>(val.value === null ? null : `${val.value}`)

const strVal = computed<string | null>({
  set(v: string | null) {
    cacheStr.value = v
    if (!v || v === '') {
      val.value = nullVal()
    } else {
      const nv = parseFloat(v)
      if (isNaN(nv)) {
        val.value = nullVal()
      } else {
        const anv = props.alter(nv)
        val.value = anv
        if (anv !== nv) {
          cacheStr.value = `${anv}`
        }
      }
    }
  },
  get() {
    return val.value === null ? null : cacheStr.value
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
