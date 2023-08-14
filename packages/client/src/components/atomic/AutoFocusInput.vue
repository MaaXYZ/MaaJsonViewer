<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { NInput } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{
  value: string
}>()

const emits = defineEmits<{
  'update:value': [string]
  blur: []
}>()

const value = useVModel(props, 'value', emits)
const base = computed(() => {
  return /^([\s\S]*?)(?:\.[a-z]+)?$/.exec(value.value)?.[1] ?? value.value
})
const suffix = computed(() => {
  return /(\.[a-z]+)$/.exec(value.value)?.[1] ?? ''
})

const el = ref<InstanceType<typeof NInput> | null>(null)

onMounted(() => {
  el.value?.focus()
})
</script>

<template>
  <NInput
    ref="el"
    :value="base"
    @update:value="
      v => {
        value = `${v}${suffix}`
      }
    "
    size="tiny"
    class="outline-none bg-transparent"
    @blur="emits('blur')"
  >
    <template #suffix>
      {{ suffix }}
    </template>
  </NInput>
</template>
