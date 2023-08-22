<script setup lang="ts">
import { NButton } from 'naive-ui'
import { ref } from 'vue'

import { taskForwardIndex } from '@/data'

import NavigationButtons from '@/components/NavigationButtons.vue'
import MainLayout from '@/layout/MainLayout.vue'

type VertInfo = {
  name: string
  x: number
  y: number
}

type EdgeInfo = {
  x1: number
  y1: number
  x2: number
  y2: number
}

const vertInfo = ref<VertInfo[]>([])

const edgeInfo = ref<EdgeInfo[]>([])

function render() {
  const vertIndex = Object.keys(taskForwardIndex.value)
  const edges: number[] = []
  for (const [idx, name] of vertIndex.entries()) {
    for (const to of taskForwardIndex.value[name]) {
      edges.push(idx)
      edges.push(vertIndex.indexOf(to))
    }
  }
  const result = Module.layoutGraph(vertIndex.length, edges, vertIndex)
  const vertArray: VertInfo[] = []
  const vertMapper: Record<string, VertInfo> = {}
  const edgeArray: EdgeInfo[] = []
  for (const part of result) {
    for (const [yy, layer] of part.entries()) {
      for (const [xx, id] of layer.entries()) {
        const vi: VertInfo = {
          name: vertIndex[id],
          x: xx,
          y: yy
        }
        vertMapper[vertIndex[id]] = vi
        vertArray.push(vi)
      }
    }
  }
  for (const from of vertIndex) {
    const vf = vertMapper[from]
    for (const to of taskForwardIndex.value[from]) {
      const vt = vertMapper[to]
      edgeArray.push({
        x1: vf.x,
        y1: vf.y,
        x2: vt.x,
        y2: vt.y
      })
    }
  }
  vertInfo.value = vertArray
  edgeInfo.value = edgeArray
}

function mX(x: number) {
  return x * 40 + 20
}

function mY(y: number) {
  return y * 40 + 20
}
</script>

<template>
  <MainLayout>
    <template #action>
      <NavigationButtons></NavigationButtons>
      <NButton @click="render">计算</NButton>
    </template>

    <div>
      <svg width="1000" height="1000">
        <circle
          v-for="info in vertInfo"
          :key="info.name"
          :cx="mX(info.x)"
          :cy="mY(info.y)"
          r="5"
          fill="wheat"
          @mouseover="() => console.log(info.name)"
        ></circle>
        <line
          v-for="(info, idx) in edgeInfo"
          :key="idx"
          :x1="mX(info.x1)"
          :y1="mY(info.y1)"
          :x2="mX(info.x2)"
          :y2="mY(info.y2)"
          style="stroke: rgb(0, 0, 0); stroke-width: 1"
        ></line>
      </svg>
    </div>
  </MainLayout>
</template>
