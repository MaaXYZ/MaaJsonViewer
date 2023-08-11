<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { NTreeSelect } from 'naive-ui'

import { filesystemDirectoryTree } from '@/data'
import type { PathKey } from '@/filesystem'

const props = defineProps<{
  value: string
}>()

const emits = defineEmits<{
  'update:value': [string]
}>()

const value = useVModel(props, 'value', emits, {
  passive: true
})

const dirTree = filesystemDirectoryTree
</script>

<template>
  <NTreeSelect :options="[dirTree]" v-model:value="value"></NTreeSelect>
</template>
