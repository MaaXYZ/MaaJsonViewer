<script setup lang="ts" generic="T">
import type { UseProducer } from '@/persis'
import SingleArrayEdit from './SingleArrayEdit.vue'

type U = T | T[] | null
type V = T | null

defineProps<{
  value: V
  edit: UseProducer<V>
  def: () => T
  isT: (v: T | T[]) => boolean
}>()
</script>

<template>
  <SingleArrayEdit
    :value="value as U"
    :edit="edit as UseProducer<U>"
    type="single"
    :nullable="true"
    :def="def"
    :is-t="isT"
  >
    <template #edit="{ value, edit }">
      <slot name="edit" :value="value" :edit="edit"></slot>
    </template>
  </SingleArrayEdit>
</template>
