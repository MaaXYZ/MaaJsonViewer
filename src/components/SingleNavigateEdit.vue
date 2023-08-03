<script setup lang="ts">
import { NButton, NIcon, NAutoComplete } from 'naive-ui'
import { computed } from 'vue'
import { NavigateNextOutlined } from '@vicons/material'
import { taskData } from '@/data'

defineProps<{
  navigate: (to: string) => void
}>()

const val = defineModel<string>('value', {
  required: true
})

const options = computed(() => {
  const lowerSearch = val.value.toLowerCase()
  return Object.keys(taskData.data)
    .map(name => ({
      name,
      type: name.toLowerCase().startsWith(lowerSearch)
        ? 0
        : name.toLowerCase().indexOf(lowerSearch) !== -1
        ? 1
        : 2
    }))
    .filter(({ type }) => type < 2)
    .sort((a, b) => a.type - b.type)
    .map(x => ({
      label: x.name,
      value: x.name
    }))
})
</script>

<template>
  <div class="flex gap-2">
    <NButton @click="navigate(value)">
      <template #icon>
        <NIcon>
          <NavigateNextOutlined></NavigateNextOutlined>
        </NIcon>
      </template>
      🚀
    </NButton>
    <NAutoComplete
      v-model:value="val"
      :input-props="{
        autocomplete: 'disabled'
      }"
      :options="options"
      placeholder="task"
    ></NAutoComplete>
  </div>
</template>
