<script setup lang="ts">
import { NInput } from 'naive-ui'
import SingleArrayEdit from './SingleArrayEdit.vue'

defineProps<{
  type?: 'both' | 'single' | 'multi'
  nullable?: boolean
  def: string
  placeholder: string
}>()

const val = defineModel<string | string[] | null>('value', {
  required: true
})
</script>

<template>
  <SingleArrayEdit
    :type="type"
    v-model:value="val"
    :nullable="nullable"
    :def="() => def"
    :is-t="(v: string | string[]) => (typeof v === 'string')"
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
  </SingleArrayEdit>
</template>
