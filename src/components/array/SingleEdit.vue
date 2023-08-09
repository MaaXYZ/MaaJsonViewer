<script setup lang="ts" generic="T">
import { useVModel } from '@vueuse/core'

import ArrayEdit from './ArrayEdit.vue'

type U = T | T[] | null
type V = T | null

const props = defineProps<{
  value: V
  def: () => T
  isT: (v: T | T[]) => boolean
}>()

const emits = defineEmits<{
  'update:value': [V]
}>()

const value = useVModel(props, 'value', emits, {
  passive: true,
  deep: true
})

function update(val: U) {
  ;(value.value as V) = val as V
}
</script>

<template>
  <ArrayEdit
    :value="value as U"
    @update:value="update"
    type="single"
    :nullable="true"
    :def="def"
    :is-t="isT"
  >
    <template #edit="{ value, update }">
      <slot name="edit" :value="value" :update="update"></slot>
    </template>
  </ArrayEdit>
</template>
