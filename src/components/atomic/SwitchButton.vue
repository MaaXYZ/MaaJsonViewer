<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { NButton, NIcon } from 'naive-ui'
import { computed } from 'vue'

const props = defineProps<{
  value: boolean
  disabled?: boolean
  inverse?: boolean
}>()

const emits = defineEmits<{
  'update:value': [boolean]
}>()

const value = useVModel(props, 'value', emits)

const realValue = computed(() => {
  return props.inverse ? props.value : !props.value
})
</script>

<template>
  <NButton
    :type="realValue ? 'default' : 'primary'"
    :disabled="disabled"
    @click="value = !value"
  >
    <template #icon>
      <NIcon>
        <slot></slot>
      </NIcon>
    </template>
  </NButton>
</template>
