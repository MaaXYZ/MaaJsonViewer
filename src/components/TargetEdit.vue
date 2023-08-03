<script setup lang="ts">
import { NSlider, NInput } from 'naive-ui'
import { computed } from 'vue'
import type { Rect } from '@/types'
import ClearButton from './ClearButton.vue'
import SingleNavigateEdit from './SingleNavigateEdit.vue'
import RectEdit from './RectEdit.vue'
import SingleArrayEdit from './SingleArrayEdit.vue'

defineProps<{
  name: string
  navigate: (to: string) => void
  required?: boolean
}>()

const val = defineModel<1 | string | Rect | null>('value', {
  required: true
})

const ofs = defineModel<Rect | null>('offset', {
  required: true
})

const state = computed<number>({
  set(v) {
    switch (v) {
      case 1:
        val.value = 1
        break
      case 2:
        val.value = ''
        break
      case 3:
        val.value = [0, 0, 0, 0]
        break
    }
  },
  get() {
    if (val.value === 1 || val.value === null) {
      return 1
    } else if (typeof val.value === 'string') {
      return 2
    } else if (val.value instanceof Array) {
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
  <ClearButton v-model="val" :invalid="required"> {{ name }} </ClearButton>
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
      :value="(val as string)"
      @update:value="
        v => {
          val = v
        }
      "
      :navigate="navigate"
    ></SingleNavigateEdit>
    <RectEdit
      v-if="state === 3"
      :value="(val as Rect)"
      @update:value="
        v => {
          val = v
        }
      "
    ></RectEdit>
  </div>
  <ClearButton v-model="ofs"> {{ name }}偏移 </ClearButton>
  <SingleArrayEdit
    v-model:value="ofs"
    type="single"
    :nullable="true"
    :def="() => [0, 0, 0, 0] as Rect"
    :is-t="
      v => v instanceof Array && v.length === 4 && typeof v[0] === 'number'
    "
  >
    <template #edit="{ value, update }">
      <RectEdit :value="value" @update:value="update"></RectEdit>
    </template>
  </SingleArrayEdit>
</template>
