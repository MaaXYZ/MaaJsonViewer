<script setup lang="ts">
import { NButton } from 'naive-ui'

import { taskForwardIndex } from '@/data'

import NavigationButtons from '@/components/NavigationButtons.vue'
import MainLayout from '@/layout/MainLayout.vue'

function render() {
  const vertIndex = Object.keys(taskForwardIndex.value)
  const edges: number[] = []
  for (const [idx, name] of vertIndex.entries()) {
    for (const to of taskForwardIndex.value[name]) {
      edges.push(idx)
      edges.push(vertIndex.indexOf(to))
    }
  }
  Module.layoutGraph(vertIndex.length, edges, vertIndex)
}
</script>

<template>
  <MainLayout>
    <template #action>
      <NavigationButtons></NavigationButtons>
      <NButton @click="render">计算</NButton>
    </template>
  </MainLayout>
</template>
