<script setup lang="ts" generic="T">
import { useVModel } from '@vueuse/core'
import { NButton, NPopover } from 'naive-ui'

const props = withDefaults(
  defineProps<{
    value: T | null
    propkey: string
    invalid?: boolean
  }>(),
  {
    invalid: false
  }
)

const emits = defineEmits<{
  'update:value': [T | null]
}>()

const value = useVModel(props, 'value', emits, {
  passive: true,
  deep: true
})

function clean() {
  if (!props.invalid) {
    ;(value.value as T | null) = null
  }
}
</script>

<template>
  <NPopover trigger="hover" :disabled="!propkey">
    <template #trigger>
      <NButton
        secondary
        @click="clean"
        :type="value === null ? (invalid ? 'error' : 'default') : 'primary'"
        :style="{
          cursor: invalid ? 'not-allowed' : 'pointer'
        }"
      >
        <slot></slot>
      </NButton>
    </template>

    <span>{{ propkey }}</span>
  </NPopover>
</template>
