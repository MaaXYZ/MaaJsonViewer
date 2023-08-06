<script setup lang="ts">
import { NInput } from 'naive-ui'

import { type UseProducer, updateEdit } from '@/persis'

import SingleArrayEdit from './SingleArrayEdit.vue'

type T = string | string[] | null
type V = string | null

defineProps<{
  value: V
  edit: UseProducer<V>
  def: string
  placeholder: string
}>()
</script>

<template>
  <SingleArrayEdit
    :value="value as T"
    :edit="edit as UseProducer<T>"
    type="single"
    :nullable="true"
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
  </SingleArrayEdit>
</template>
