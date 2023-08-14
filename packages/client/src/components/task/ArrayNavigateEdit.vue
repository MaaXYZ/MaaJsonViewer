<script setup lang="ts">
import { useVModel } from '@vueuse/core'

import SingleNavigateEdit from './SingleNavigateEdit.vue'
import ArrayEdit from '@/components/array/ArrayEdit.vue'

type T = string | string[] | null

const props = defineProps<{
  value: T
  array?: boolean
  readonly?: boolean
}>()

const emits = defineEmits<{
  'update:value': [T]
}>()

const value = useVModel(props, 'value', emits, {
  passive: true,
  deep: true
})
</script>

<template>
  <ArrayEdit
    v-model:value="value"
    :nullable="true"
    :readonly="readonly"
    :type="array ? 'multi' : 'both'"
    :def="() => ''"
    :is-t="(v: string | string[]) => typeof v === 'string'"
  >
    <template #edit="{ value, update }">
      <SingleNavigateEdit
        :value="value"
        @update:value="update"
        :readonly="readonly"
      ></SingleNavigateEdit>
    </template>
  </ArrayEdit>
</template>
