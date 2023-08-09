<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { NInput } from 'naive-ui'

import SingleEdit from './SingleEdit.vue'

type T = string | null

const props = defineProps<{
  value: T
  def: string
  placeholder: string
}>()

const emits = defineEmits<{
  'update:value': [T]
}>()

const value = useVModel(props, 'value', emits)
</script>

<template>
  <SingleEdit
    v-model:value="value"
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
  </SingleEdit>
</template>
