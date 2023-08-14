<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { NInput } from 'naive-ui'
import { onMounted, ref } from 'vue'

const props = defineProps<{
  value: string
}>()

const emits = defineEmits<{
  'update:value': [string]
  blur: []
}>()

const value = useVModel(props, 'value', emits)
const el = ref<InstanceType<typeof NInput> | null>(null)

onMounted(() => {
  el.value?.focus()
})
</script>

<template>
  <NInput
    ref="el"
    v-model:value="value"
    size="tiny"
    class="outline-none bg-transparent"
    @blur="emits('blur')"
  ></NInput>
</template>
