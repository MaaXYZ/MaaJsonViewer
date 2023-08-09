<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { NSlider } from 'naive-ui'
import { computed } from 'vue'

import type { Rect } from '@/types'

import SingleEdit from '@/components/array/SingleEdit.vue'
import ClearButton from '@/components/atomic/ClearButton.vue'
import RectEdit from '@/components/atomic/RectEdit.vue'
import SingleNavigateEdit from '@/components/task/SingleNavigateEdit.vue'

type TTarget = 1 | string | Rect | null
type TOffset = Rect | null

const props = defineProps<{
  target: TTarget
  offset: TOffset
  propkey: string
  name: string
  required?: boolean
}>()

const emits = defineEmits<{
  'update:target': [TTarget]
  'update:offset': [TOffset]
}>()

const target = useVModel(props, 'target', emits, {
  passive: true,
  deep: true
})

const offset = useVModel(props, 'offset', emits, {
  passive: true,
  deep: true
})

const state = computed<number>({
  set(v) {
    switch (v) {
      case 1:
        target.value = 1
        break
      case 2:
        target.value = ''
        break
      case 3:
        target.value = [0, 0, 0, 0]
        break
    }
  },
  get() {
    if (target.value === 1 || target.value === null) {
      return 1
    } else if (typeof target.value === 'string') {
      return 2
    } else if (target.value instanceof Array) {
      return 3
    } else {
      return 0
    }
  }
})

const marks = {
  1: '当前任务',
  2: '特定任务',
  3: '固定区域'
}
</script>

<template>
  <ClearButton :propkey="propkey" v-model:value="target" :invalid="required">
    {{ name }}
  </ClearButton>
  <div class="flex flex-col">
    <div class="flex">
      <div class="w-64 mx-8">
        <NSlider
          v-model:value="state"
          :default-value="1"
          :min="1"
          :max="3"
          :tooltip="false"
          :step="'mark'"
          :marks="marks"
        ></NSlider>
      </div>
    </div>
    <SingleNavigateEdit
      v-if="state === 2"
      value="(target as string)"
      @update:value="
        v => {
          target = v
        }
      "
    ></SingleNavigateEdit>
    <RectEdit
      v-if="state === 3"
      :value="target as Rect"
      @update:value="
        v => {
          target = v
        }
      "
    ></RectEdit>
  </div>
  <ClearButton :propkey="`${propkey}_offset`" v-model:value="offset">
    {{ name }}偏移
  </ClearButton>
  <SingleEdit
    v-model:value="offset"
    :def="() => [0, 0, 0, 0] as Rect"
    :is-t="
      v => v instanceof Array && v.length === 4 && typeof v[0] === 'number'
    "
  >
    <template #edit="{ value, update }">
      <RectEdit :value="value" @value:update="update"></RectEdit>
    </template>
  </SingleEdit>
</template>
