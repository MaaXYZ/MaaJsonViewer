<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'

import { fs } from '@/filesystem'
import { loadFS } from '@/loader'

onMounted(async () => {
  await loadFS()
  window.onkeydown = ev => {
    if (ev.ctrlKey && (ev.key === 'z' || ev.key === 'Z')) {
      ev.stopPropagation()
      ev.preventDefault()
      if (ev.shiftKey) {
        if (fs.history.canRedo.value) {
          fs.history.redo()
        }
      } else {
        if (fs.history.canUndo.value) {
          fs.history.undo()
        }
      }
    }
  }
})
</script>

<template>
  <RouterView v-slot="{ Component }">
    <KeepAlive>
      <component :is="Component"></component>
    </KeepAlive>
  </RouterView>
</template>
