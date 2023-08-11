<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { onMounted, watch } from 'vue'
import { RouterView } from 'vue-router'

import { config } from '@/data'
import { fs } from '@/filesystem'
import { loadCfg, loadFS, saveCfg } from '@/loader'

onMounted(async () => {
  await loadFS()
  await loadCfg()
  const doSave = useDebounceFn(() => {
    saveCfg()
  }, 500)
  watch(
    config,
    v => {
      doSave()
    },
    {
      deep: true
    }
  )
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
