<script setup lang="ts">
import { NSlider } from 'naive-ui'
import { computed } from 'vue'

import type { UseProducer } from '@/persis'
import type { Rect } from '@/types'

import SingleEdit from './SingleEdit.vue'
import SingleNavigateEdit from './SingleNavigateEdit.vue'
import ClearButton from '@/components/atomic/ClearButton.vue'
import RectEdit from '@/components/atomic/RectEdit.vue'

type TTarget = 1 | string | Rect | null
type TTargetOut = true | string | Rect | null
type TOffset = Rect | null

const props = defineProps<{
  name: string
  target: TTarget
  editTarget: UseProducer<TTargetOut>
  offset: TOffset
  editOffset: UseProducer<TOffset>
  required?: boolean
}>()

const state = computed<number>({
  set(v) {
    switch (v) {
      case 1:
        props.editTarget(() => true)
        break
      case 2:
        props.editTarget(() => '')
        break
      case 3:
        props.editTarget(() => [0, 0, 0, 0])
        break
    }
  },
  get() {
    if (props.target === 1 || props.target === null) {
      return 1
    } else if (typeof props.target === 'string') {
      return 2
    } else if (props.target instanceof Array) {
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
  <ClearButton :value="target" :edit="editTarget" :invalid="required">
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
      :value="target as string"
      :edit="editTarget as UseProducer<string>"
    ></SingleNavigateEdit>
    <RectEdit
      v-if="state === 3"
      :value="target as Rect"
      :edit="editTarget as UseProducer<Rect>"
    ></RectEdit>
  </div>
  <ClearButton :value="offset" :edit="editOffset"> {{ name }}偏移 </ClearButton>
  <SingleEdit
    :value="offset"
    :edit="editOffset"
    :def="() => [0, 0, 0, 0] as Rect"
    :is-t="
      v => v instanceof Array && v.length === 4 && typeof v[0] === 'number'
    "
  >
    <template #edit="{ value, edit }">
      <RectEdit :value="value" :edit="edit"></RectEdit>
    </template>
  </SingleEdit>
</template>
