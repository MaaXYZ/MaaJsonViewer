<script setup lang="ts">
import {
  BuildOutlined,
  CropOutlined,
  EditOutlined,
  MapOutlined
} from '@vicons/material'
import type { Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import IconButton from '@/components/atomic/IconButton.vue'

const route = useRoute()
const router = useRouter()

const infos: {
  name: string
  icon: Component
}[] = [
  {
    name: 'edit',
    icon: EditOutlined
  },
  {
    name: 'roi',
    icon: CropOutlined
  },
  {
    name: 'eval',
    icon: BuildOutlined
  },
  {
    name: 'visual',
    icon: MapOutlined
  }
]
</script>

<template>
  <IconButton
    v-for="info in infos"
    :key="info.name"
    :text="false"
    :icon="info.icon"
    :type="route.name === info.name ? 'primary' : 'default'"
    @click="
      router.push({
        name: info.name
      })
    "
  ></IconButton>
</template>
