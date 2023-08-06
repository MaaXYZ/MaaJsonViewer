<script setup lang="ts">
import { NInput } from 'naive-ui'

import { type UseProducer, updateEdit } from '@/persis'

import SingleArrayEdit from './SingleArrayEdit.vue'

type T = string | string[] | null

defineProps<{
  value: T
  edit: UseProducer<T>
  def: string
  placeholder: string
  type?: 'both' | 'single' | 'multi'
  nullable?: boolean
}>()
</script>

<template>
  <SingleArrayEdit
    :value="value"
    :edit="edit"
    :type="type"
    :nullable="nullable"
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
