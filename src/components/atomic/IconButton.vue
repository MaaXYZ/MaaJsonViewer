<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { type Component, h } from 'vue'

const props = defineProps<{
  icon: Component
}>()

const emits = defineEmits<{
  click: []
}>()

function Icon() {
  return h(props.icon)
}
</script>

<template>
  <NButton
    text
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
