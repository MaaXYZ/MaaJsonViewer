<script setup lang="ts">
import { SearchOutlined } from '@vicons/material'
import { NIcon, NInput, NTree, type TreeDropInfo } from 'naive-ui'
import { computed, ref } from 'vue'

import { renderLabel, renderPrefix } from './TaskTreeRender'

import {
  active,
  delTask,
  expandKey,
  filesystemTree,
  filterTemplate,
  navigate,
  setTask
} from '@/data'
import { type PathKey, fs, path } from '@/filesystem'

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

function handleDrop({ node, dragNode, dropPosition }: TreeDropInfo) {
  if (node.key === '/') {
    return
  }
  const fromKey = dragNode.key as PathKey
  const toKey = node.key as PathKey
  console.log('drag', fromKey, toKey, dropPosition)
  const [fd, ff, fh] = path.divide(fromKey)
  const [td, tf, th] = path.divide(toKey)
  if (path.key_is_dir(fromKey)) {
    // dragging directory

    switch (dropPosition) {
      case 'inside': {
        if (!path.key_is_dir(toKey)) {
          return
        }
        // dir -> inside dir
        fs.scope(() => {
          fs.tree.renameDir(fromKey, path.joinkey(toKey, ff))
          const from = path.seg_to_zip(path.to_seg(fromKey))
          const to = path.seg_to_zip(path.join(toKey, ff))
          filterTemplate(temp => {
            return temp.startsWith(from) ? temp.replace(from, to) : temp
          })
        })
        break
      }
      case 'before':
      case 'after': {
        if (th) {
          return
        }
        // dir -> around file/dir
        fs.scope(() => {
          fs.tree.renameDir(fromKey, path.joinkey(td, ff))
          const from = path.seg_to_zip(path.to_seg(fromKey))
          const to = path.seg_to_zip(path.join(td, ff))
          filterTemplate(temp => {
            return temp.startsWith(from) ? temp.replace(from, to) : temp
          })
        })
        break
      }
    }
  } else if (fh) {
    // dragging task
    switch (dropPosition) {
      case 'inside': {
        if (!path.key_is_file(toKey) || th) {
          return
        }
        // task -> inside json
        const task = delTask(fromKey)
        if (task) {
          setTask(path.joinkey(td, tf, fh), task)
        }
        break
      }
      case 'before':
      case 'after': {
        if (!th) {
          return
        }
        // task -> around task
        const task = delTask(fromKey)
        if (task) {
          setTask(path.joinkey(td, tf, fh), task)
        }
        break
      }
    }
  } else {
    // dragging file
    switch (dropPosition) {
      case 'inside': {
        if (!path.key_is_dir(toKey)) {
          return
        }
        // file -> inside dir
        fs.scope(() => {
          fs.tree.renameFile(fromKey, path.joinkey(toKey, ff))
          if (ff.endsWith('.png')) {
            const from = path.seg_to_zip(path.to_seg(fromKey))
            const to = path.seg_to_zip(path.join(toKey, ff))
            filterTemplate(temp => {
              return temp === from ? to : temp
            })
          }
        })
        break
      }
      case 'before':
      case 'after': {
        if (!path.key_is_file(toKey) || th) {
          return
        }
        // file -> around file
        fs.scope(() => {
          fs.tree.renameFile(fromKey, path.joinkey(td, ff))
          if (ff.endsWith('.png')) {
            const from = path.seg_to_zip(path.to_seg(fromKey))
            const to = path.seg_to_zip(path.join(td, ff))
            filterTemplate(temp => {
              return temp === from ? to : temp
            })
          }
        })
        break
      }
    }
  }
}
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
        @drop="handleDrop"
        draggable
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
