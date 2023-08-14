<script setup lang="ts">
import { NAvatar, NPopover } from 'naive-ui'
import { computed } from 'vue'

import { type Path, fs, pool } from '@/filesystem'

const props = defineProps<{
  url: string | string[]
}>()

function makeUrl(v: string | null) {
  const fallback = '/favicon-32x32.png'
  if (v && v.endsWith('.png')) {
    // TODO: maybe check?
    const hash = fs.tree.readFile(v as Path)
    if (hash) {
      const url = pool.query(hash)
      if (url) {
        return url
      }
    }
  }
  return fallback
}

const first = computed(() => {
  return props.url instanceof Array
    ? props.url.length > 0
      ? props.url[0]
      : null
    : props.url
})
</script>

<template>
  <NPopover trigger="hover">
    <template #trigger>
      <!-- <img :src="url" /> -->
      <div class="w-8 h-8 flex justify-center items-center">
        <NAvatar object-fit="contain" :src="makeUrl(first)"></NAvatar>
      </div>
    </template>

    <div class="flex flex-col items-center">
      <template v-if="props.url instanceof Array">
        <img v-for="(u, i) in props.url" :key="i" :src="makeUrl(u)" />
      </template>
      <img v-else :src="makeUrl(first)" />
    </div>
  </NPopover>
</template>
