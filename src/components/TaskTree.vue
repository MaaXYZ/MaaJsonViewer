<script setup lang="ts">
import { NInput, NTree, NIcon, type TreeOption } from 'naive-ui'
import { ref, computed, h } from 'vue'
import { ChangeCircleOutlined, SearchOutlined } from '@vicons/material'
import { navigate, active } from '@/data'
import { fsTree } from '@/data/fs'
import { renderLabel, renderPrefix, renderSuffix } from './TaskTreeRender'
import { Util } from '@/fs'

const expand = defineModel<string[]>('expand', {
  required: true
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
      const s = v[0]
      if (s.endsWith('/')) {
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
        v-if="fsTree"
        :style="{
          height: treeHeight
        }"
        :data="[fsTree]"
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
