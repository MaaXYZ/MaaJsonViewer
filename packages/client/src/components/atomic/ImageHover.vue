<script setup lang="ts">
import { NAvatar, NPopover } from 'naive-ui'
import { computed } from 'vue'

import { makePngUrl } from '@/data'

const props = defineProps<{
  url: string | string[]
}>()

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
        <NAvatar object-fit="contain" :src="makePngUrl(first)"></NAvatar>
      </div>
    </template>

    <div class="flex flex-col items-center">
      <template v-if="props.url instanceof Array">
        <img v-for="(u, i) in props.url" :key="i" :src="makePngUrl(u)" />
      </template>
      <img v-else :src="makePngUrl(first)" />
    </div>
  </NPopover>
</template>
