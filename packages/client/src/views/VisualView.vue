<script setup lang="ts">
import { Graphviz } from '@hpcc-js/wasm/graphviz'
import { NButton } from 'naive-ui'
import { computed, onActivated, onDeactivated, onMounted, ref } from 'vue'

import { getTask, jsonIndex, taskForwardIndex, taskIndex } from '@/data'
import type { PathKey } from '@/filesystem'

import NavigationButtons from '@/components/NavigationButtons.vue'
import MainLayout from '@/layout/MainLayout.vue'

type VertexInfo = {
  name: string
  ellipse: Record<string, string | null>
  text: Record<string, string | null>
}

type EdgeInfo = {
  from: string
  to: string
  path: Record<string, string | null>
  poly: Record<string, string | null>
  text: {
    attr: Record<string, string | null>
    text: string
  }
}

let graphviz: Graphviz | null = null
let loaded = ref(false)

function isSVGG(node: ChildNode | null): node is SVGGElement {
  return node?.nodeName === 'g'
}

function isSVGTitle(node: ChildNode | null): node is SVGTitleElement {
  return node?.nodeName === 'title'
}

const containerEl = ref<HTMLDivElement | null>(null)
const svgEl = ref<SVGElement | null>(null)

const viewWidth = ref(1000)
const viewHeight = ref(1000)
const width = ref(0)
const height = ref(0)
const scale = ref(1)
const base = ref<[number, number]>([0, 0])
const transform = ref('')
const viewBox = computed(() => {
  return [
    base.value[0],
    base.value[1],
    viewWidth.value * scale.value,
    viewHeight.value * scale.value
  ]
})

onMounted(async () => {
  viewWidth.value = containerEl.value?.clientWidth ?? 0
  viewHeight.value = containerEl.value?.clientHeight ?? 0
  new ResizeObserver(() => {
    viewWidth.value = containerEl.value?.clientWidth ?? 0
    viewHeight.value = containerEl.value?.clientHeight ?? 0
  }).observe(containerEl.value!)
  if (!graphviz) {
    graphviz = await Graphviz.load()
    loaded.value = true
  }
  updateSvg()
})

const vertexs = ref<VertexInfo[]>([])
const edges = ref<EdgeInfo[]>([])

const active = ref<string[]>([])

function dumpAttr(el: Element) {
  return Object.fromEntries(
    el.getAttributeNames().map(attr => [attr, el.getAttribute(attr)])
  )
}

function updateSvg() {
  const dotString = ['digraph {']

  const vertIndex = Object.keys(taskForwardIndex.value)
  for (const from of vertIndex) {
    for (const [idx, to] of taskForwardIndex.value[from].next.entries()) {
      dotString.push(`${from} -> ${to} [label="${idx}"]`)
    }
    for (const [idx, to] of taskForwardIndex.value[
      from
    ].runout_next.entries()) {
      dotString.push(`${from} -> ${to} [label="R${idx}"]`)
    }
    for (const [idx, to] of taskForwardIndex.value[
      from
    ].timeout_next.entries()) {
      dotString.push(`${from} -> ${to} [label="T${idx}"]`)
    }
  }

  dotString.push('}')

  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = graphviz?.layout(dotString.join('\n'), 'svg') ?? ''

  if (tempDiv.childElementCount >= 1) {
    const svgEl = tempDiv.firstElementChild?.firstElementChild as SVGGElement
    transform.value = svgEl.getAttribute('transform') ?? ''
    console.log(tempDiv.firstElementChild)
    width.value = parseFloat(tempDiv.firstElementChild?.getAttribute('width')!)
    height.value = parseFloat(
      tempDiv.firstElementChild?.getAttribute('height')!
    )
    for (const child of svgEl.childNodes) {
      if (isSVGG(child)) {
        if (isSVGTitle(child.firstElementChild)) {
          const name = child.firstElementChild.textContent
          if (!name) {
            continue
          }
          if (child.getAttribute('class') === 'node') {
            const ellipse = child.childNodes[3] as SVGEllipseElement
            const text = child.childNodes[5] as SVGTextElement
            vertexs.value.push({
              name,
              ellipse: dumpAttr(ellipse),
              text: dumpAttr(text)
            })
          } else if (child.getAttribute('class') === 'edge') {
            const match = /^(.+)->(.+)$/.exec(name)
            if (!match) {
              continue
            }
            const path = child.childNodes[3] as SVGPathElement
            const polygon = child.childNodes[5] as SVGPolygonElement
            const text = child.childNodes[7] as SVGTextElement
            edges.value.push({
              from: match[1],
              to: match[2],
              path: dumpAttr(path),
              poly: dumpAttr(polygon),
              text: {
                attr: dumpAttr(text),
                text: text.textContent ?? ''
              }
            })
          }
        }
      }
    }
  }
}

let saveBase: [number, number] | null = null
let saveX: number | null = null
let saveY: number | null = null

function handleDown(ev: PointerEvent) {
  if (ev.pointerId !== 1) {
    return
  }
  if (ev.buttons === 4) {
    ev.stopPropagation()
    svgEl.value?.setPointerCapture(1)
    saveBase = base.value
    saveX = ev.offsetX
    saveY = ev.offsetY
  }
}

function handleMove(ev: PointerEvent) {
  if (ev.pointerId !== 1) {
    return
  }
  if (saveBase && saveX && saveY) {
    ev.stopPropagation()
    base.value = [
      saveBase[0] + (saveX - ev.offsetX) * scale.value,
      saveBase[1] + (saveY - ev.offsetY) * scale.value
    ]
  }
}

function handleUp(ev: PointerEvent) {
  if (ev.pointerId !== 1) {
    return
  }
  if (saveBase) {
    ev.stopPropagation()
    svgEl.value?.releasePointerCapture(1)
    saveBase = null
    saveX = null
    saveY = null
  } else {
    active.value = []
  }
}

function handleWheel(ev: WheelEvent) {
  if (saveBase) {
    return
  }
  ev.stopPropagation()
  const dlt = ev.deltaY > 0 ? 1.1 : 1 / 1.1
  scale.value *= dlt
}

onActivated(() => {
  updateSvg()
})

onDeactivated(() => {
  vertexs.value = []
  edges.value = []
})
</script>

<template>
  <MainLayout>
    <template #action>
      <NavigationButtons></NavigationButtons>
      <NButton :disabled="!loaded" @click="updateSvg">计算</NButton>
    </template>

    <!-- <div ref="SvgContainerEl" v-html="svgContent"></div> -->
    <div ref="containerEl" class="w-full h-full">
      <svg
        ref="svgEl"
        :width="viewWidth"
        :height="viewHeight"
        :viewBox="viewBox.join(' ')"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        @wheel="handleWheel"
        @pointerdown="handleDown"
        @pointermove="handleMove"
        @pointerup="handleUp"
        style="user-select: none; background-color: wheat"
      >
        <g :transform="transform">
          <g
            v-for="vert in vertexs"
            :key="vert.name"
            @pointerup="
              ev => {
                ev.stopPropagation()
                active = [vert.name]
              }
            "
            @dblclick="
              ev => {
                active =
                  jsonIndex[taskIndex[vert.name].replace(/#.*$/, '') as PathKey]
              }
            "
          >
            <ellipse
              v-bind="vert.ellipse"
              :fill="
                getTask(taskIndex[vert.name])?.is_sub ? 'white' : 'lightgray'
              "
              :stroke="
                active.includes(vert.name) ? 'red' : vert.ellipse['stroke']!
              "
              :stroke-width="
                active.includes(vert.name) ? '2' : vert.ellipse['stroke-width']!
              "
            ></ellipse>
            <text v-bind="vert.text">
              {{ vert.name }}
            </text>
          </g>
          <g v-for="edge in edges" :key="`${edge.from}->${edge.to}`">
            <path
              v-bind="edge.path"
              :stroke="
                active.length
                  ? active.includes(edge.from)
                    ? active.includes(edge.to)
                      ? 'black'
                      : 'red'
                    : active.includes(edge.to)
                    ? 'blue'
                    : 'lightgray'
                  : edge.path.stroke!
              "
              :stroke-width="
                active.includes(edge.from) || active.includes(edge.to) ? 2 : 1
              "
            ></path>
            <polygon
              v-bind="edge.poly"
              fill="transparent"
              :stroke="
                active.length
                  ? active.includes(edge.from)
                    ? active.includes(edge.to)
                      ? 'black'
                      : 'red'
                    : active.includes(edge.to)
                    ? 'blue'
                    : 'lightgray'
                  : edge.poly.stroke!
              "
            ></polygon>
            <text
              v-if="active.length && active.includes(edge.from)"
              v-bind="edge.text.attr"
            >
              {{ edge.text.text }}
            </text>
          </g>
        </g>
      </svg>
    </div>
  </MainLayout>
</template>
