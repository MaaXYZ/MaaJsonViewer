<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { onMounted, watch } from 'vue'
import { RouterView } from 'vue-router'

import { config } from '@/data'
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
})
</script>

<template>
  <RouterView v-slot="{ Component }">
    <KeepAlive>
      <component :is="Component"></component>
    </KeepAlive>
  </RouterView>
</template>
