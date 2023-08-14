<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { NInput } from 'naive-ui'

import ArrayEdit from './ArrayEdit.vue'

type T = string | string[] | null

const props = defineProps<{
  value: T
  def: string
  placeholder: string
  type?: 'both' | 'single' | 'multi'
  nullable?: boolean
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
    :type="type"
    :nullable="nullable"
    :def="() => def"
    :is-t="(v: string | string[]) => typeof v === 'string'"
  >
    <template #edit="{ value, update }">
      <div class="flex gap-2">
        <NInput
          :value="value"
          @update:value="update"
          :placeholder="placeholder"
        ></NInput>
      </div>
    </template>
  </ArrayEdit>
</template>
