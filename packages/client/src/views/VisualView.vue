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
  console.log(result)
  const vertArray: VertInfo[] = []
  const vertMapper: Record<number, VertInfo> = {}
  const edgeArray: EdgeInfo[] = []
  for (const part of result.vert) {
    for (const [yy, layer] of part.entries()) {
      for (const [xx, id] of layer.entries()) {
        const vi: VertInfo = {
          name: id < vertIndex.length ? vertIndex[id] : '',
          x: xx,
          y: yy
        }
        vertMapper[id] = vi
        vertArray.push(vi)
      }
    }
  }
  for (const part of result.edge) {
    for (const [from, to] of part) {
      const vf = vertMapper[from]
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
  return x * 20 + 10
}

function mY(y: number) {
  return y * 20 + 10
}
</script>

<template>
  <MainLayout>
    <template #action>
      <NavigationButtons></NavigationButtons>
      <NButton @click="render">计算</NButton>
    </template>

    <div>
      <svg width="1500" height="1000">
        <circle
          v-for="(info, idx) in vertInfo"
          :key="info.name ?? idx"
          :cx="mX(info.x)"
          :cy="mY(info.y)"
          r="5"
          :fill="info.name ? 'red' : 'white'"
          stroke="black"
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
