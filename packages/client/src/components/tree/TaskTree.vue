<script setup lang="ts">
import { SearchOutlined } from '@vicons/material'
import { NIcon, NInput, NTree } from 'naive-ui'
import { computed, ref } from 'vue'

import { renderLabel, renderPrefix } from './TaskTreeRender'

import { active, expandKey, filesystemTree, navigate } from '@/data'
import { type PathKey } from '@/filesystem'

import TaskTreeActions from './TaskTreeActions.vue'

const searchText = ref('')

const selectedKeys = computed(() => {
  return active.value ? [active.value] : []
})

const selectedKeysFilter = computed({
  set(v: string[]) {
    if (v.length === 0) {
      return
    } else {
      navigate(v[0] as PathKey)
    }
  },
  get() {
    return selectedKeys.value
  }
})

const treeParentEl = ref<HTMLDivElement | null>(null)
const treeHeight = computed(() => {
  return treeParentEl.value?.clientHeight ?? 600
})
</script>

<template>
  <div class="flex flex-col gap-2 flex-1 min-h-0">
    <div class="flex gap-2">
      <NInput v-model:value="searchText" placeholder="task">
        <template #prefix>
          <NIcon>
            <SearchOutlined></SearchOutlined>
          </NIcon>
        </template>
      </NInput>
      <TaskTreeActions></TaskTreeActions>
    </div>
    <div ref="treeParentEl" class="flex flex-col flex-1 min-h-0">
      <NTree
        :style="{
          height: treeHeight
        }"
        :data="[filesystemTree]"
        v-model:expanded-keys="expandKey"
        v-model:selected-keys="selectedKeysFilter"
        block-line
        selectable
        expand-on-click
        :keyboard="false"
        :pattern="searchText"
        :show-irrelevant-nodes="false"
        :cancelable="false"
        virtual-scroll
        :render-label="renderLabel"
        :render-prefix="renderPrefix"
      ></NTree>
    </div>
  </div>
</template>
