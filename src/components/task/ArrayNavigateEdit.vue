<script setup lang="ts">
import { navigate } from '@/data'
import type { UseProducer } from '@/persis'

import SingleNavigateEdit from './SingleNavigateEdit.vue'
import ArrayEdit from '@/components/array/ArrayEdit.vue'

type T = string | string[] | null

defineProps<{
  value: T
  edit: UseProducer<T>
}>()
</script>

<template>
  <ArrayEdit
    :value="value"
    :edit="edit"
    :nullable="true"
    :def="() => ''"
    :is-t="(v: string | string[]) => typeof v === 'string'"
  >
    <template #edit="{ value, edit }">
      <SingleNavigateEdit
        :value="value"
        :edit="edit"
        :navigate="navigate"
      ></SingleNavigateEdit>
    </template>
  </ArrayEdit>
</template>
