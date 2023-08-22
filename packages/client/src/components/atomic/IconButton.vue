<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { type Component, h } from 'vue'

const props = withDefaults(
  defineProps<{
    icon: Component
    text?: boolean
    type?:
      | 'default'
      | 'tertiary'
      | 'primary'
      | 'info'
      | 'success'
      | 'warning'
      | 'error'
  }>(),
  {
    text: true,
    type: 'default'
  }
)

const emits = defineEmits<{
  click: []
}>()

function Icon() {
  return h(props.icon)
}
</script>

<template>
  <NButton
    :text="text"
    :type="type"
    @click="
      ev => {
        ev.stopPropagation()
        emits('click')
      }
    "
  >
    <template #icon>
      <NIcon>
        <Icon></Icon>
      </NIcon>
    </template>
  </NButton>
</template>
