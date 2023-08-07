<script setup lang="ts">
import type { UseProducer } from '@/persis'

import SingleNavigateEdit from './SingleNavigateEdit.vue'
import ArrayEdit from '@/components/array/ArrayEdit.vue'

type T = string | string[] | null

defineProps<{
  value: T
  edit: UseProducer<T>
  array?: boolean
  readonly?: boolean
}>()
</script>

<template>
  <ArrayEdit
    :value="value"
    :edit="edit"
    :nullable="true"
    :readonly="readonly"
    :type="array ? 'multi' : 'both'"
    :def="() => ''"
    :is-t="(v: string | string[]) => typeof v === 'string'"
  >
    <template #edit="{ value, edit }">
      <SingleNavigateEdit
        :value="value"
        :edit="edit"
        :readonly="readonly"
      ></SingleNavigateEdit>
    </template>
  </ArrayEdit>
</template>
