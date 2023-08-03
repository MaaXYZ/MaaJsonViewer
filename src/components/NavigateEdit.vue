<script setup lang="ts">
import SingleArrayEdit from './SingleArrayEdit.vue'
import SingleNavigateEdit from './SingleNavigateEdit.vue'

defineProps<{
  navigate: (to: string) => void
}>()

const val = defineModel<string | string[] | null>('value', {
  required: true
})
</script>

<template>
  <SingleArrayEdit
    v-model:value="val"
    :nullable="true"
    :no-single="true"
    :def="() => 'FakeTask'"
    :is-t="(v: string | string[]) => (typeof v === 'string')"
  >
    <template #edit="{ value, update }">
      <SingleNavigateEdit
        :value="value"
        @update:value="update"
        :navigate="navigate"
      ></SingleNavigateEdit>
    </template>
  </SingleArrayEdit>
</template>
