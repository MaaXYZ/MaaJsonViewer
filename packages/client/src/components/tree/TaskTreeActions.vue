<script setup lang="ts">
import {
  AddOutlined,
  AddPhotoAlternateOutlined,
  CreateNewFolderOutlined,
  DeleteOutlined,
  UnfoldLessOutlined
} from '@vicons/material'
import { useDialog } from 'naive-ui'
import { computed, ref } from 'vue'

import { onDelete, onNewFolder, onNewJson, onNewTask } from './TaskTreeAction'

import { active, expandKey } from '@/data'
import { type PathKey, path } from '@/filesystem'

import IconButton from '@/components/atomic/IconButton.vue'
import UploadImage from '@/components/filesystem/UploadImage.vue'

const dialog = useDialog()
const isTask = computed(() => {
  return (
    active.value &&
    path.key_is_file(active.value) &&
    path.divide(active.value)[2]
  )
})
const isJson = computed(() => {
  return (
    active.value &&
    path.key_is_file(active.value) &&
    path.divide(active.value)[1].endsWith('.json')
  )
})

const uploadEl = ref<InstanceType<typeof UploadImage> | null>(null)
</script>

<template>
  <UploadImage ref="uploadEl"></UploadImage>

  <div class="flex gap-2">
    <template v-if="active && path.key_is_dir(active)">
      <IconButton
        :icon="AddPhotoAlternateOutlined"
        @click="
          () => {
            if (active) {
              uploadEl?.popup(active)
            }
          }
        "
      ></IconButton>
      <IconButton
        :icon="AddOutlined"
        @click="
          () => {
            if (active) {
              onNewJson(active)
            }
          }
        "
      ></IconButton>
      <IconButton
        :icon="CreateNewFolderOutlined"
        @click="
          () => {
            if (active) {
              onNewFolder(active)
            }
          }
        "
      ></IconButton>
    </template>
    <template v-else-if="isTask">
      <IconButton
        :icon="DeleteOutlined"
        @click="
          () => {
            if (active) {
              onDelete(active)
            }
          }
        "
      ></IconButton>
    </template>
    <template v-else>
      <IconButton
        v-if="isJson"
        :icon="AddOutlined"
        @click="
          () => {
            if (active) {
              onNewTask(active)
            }
          }
        "
      ></IconButton>
      <IconButton
        :icon="DeleteOutlined"
        @click="
          () => {
            if (active) {
              onDelete(active)
            }
          }
        "
      ></IconButton>
    </template>
    <IconButton
      :icon="UnfoldLessOutlined"
      @click="expandKey = ['/' as PathKey]"
    ></IconButton>
  </div>
</template>
