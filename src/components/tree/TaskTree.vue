<script setup lang="ts">
import { SearchOutlined } from '@vicons/material'
import { useVModel } from '@vueuse/core'
import { NIcon, NInput, NTree } from 'naive-ui'
import { computed, ref } from 'vue'

import { renderLabel, renderPrefix, renderSuffix } from './TaskTreeRender'

import { active, filesystemTree, navigate } from '@/data'
import { type PathKey, path } from '@/filesystem'

const props = defineProps<{
  expand: PathKey[]
}>()

const emits = defineEmits<{
  'update:expand': [PathKey[]]
}>()

const expand = useVModel(props, 'expand', emits, {
  passive: true,
  deep: true
})

const searchText = ref('')

const selectedKeys = computed(() => {
  return active.value ? [active.value] : []
})

const selectedKeysFilter = computed({
  set(v: string[]) {
    if (v.length === 0) {
      return
    } else {
      const s = v[0] as PathKey
      if (path.key_is_dir(s)) {
        return
      }
      navigate(s)
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
    <NInput v-model:value="searchText" placeholder="task">
      <template #prefix>
        <NIcon>
          <SearchOutlined></SearchOutlined>
        </NIcon>
      </template>
    </NInput>
    <div ref="treeParentEl" class="flex flex-col flex-1 min-h-0">
      <NTree
        :style="{
          height: treeHeight
        }"
        :data="[filesystemTree]"
        v-model:expanded-keys="expand"
        v-model:selected-keys="selectedKeysFilter"
        block-line
        selectable
        expand-on-click
        :pattern="searchText"
        :show-irrelevant-nodes="false"
        :cancelable="false"
        virtual-scroll
        :render-label="renderLabel"
        :render-prefix="renderPrefix"
        :render-suffix="renderSuffix"
      ></NTree>
    </div>
  </div>
</template>
