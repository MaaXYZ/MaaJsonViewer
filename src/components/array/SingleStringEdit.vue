<script setup lang="ts">
import { NInput } from 'naive-ui'

import { type UseProducer, updateEdit } from '@/persis'

import SingleEdit from './SingleEdit.vue'

type T = string | null

defineProps<{
  value: T
  edit: UseProducer<T>
  def: string
  placeholder: string
}>()
</script>

<template>
  <SingleEdit
    :value="value"
    :edit="edit"
    :def="() => def"
    :is-t="(v: string | string[]) => typeof v === 'string'"
  >
    <template #edit="{ value, edit }">
      <div class="flex gap-2">
        <NInput
          :value="value"
          @update:value="v => updateEdit(edit, v)"
          :placeholder="placeholder"
        ></NInput>
      </div>
    </template>
  </SingleEdit>
</template>
