<script setup lang="ts">
import { NCard, NSelect, NCode, NButton } from 'naive-ui'
import { computed, type Ref } from 'vue'
import type { Task, Rect } from '@/types'
import ClearButton from '@/components/ClearButton.vue'
import SingleArrayEdit from '@/components/SingleArrayEdit.vue'
import RectEdit from '@/components/RectEdit.vue'
import TemplateEdit from '@/components/TemplateEdit.vue'

defineEmits<{
  navigate: [string]
}>()

const task = defineModel<Task>('value', {
  required: true
})

type RemUndefined<T> = T extends undefined ? never : T

function wrapProp<T extends Record<string, unknown>, K extends string>(
  obj: Ref<T>,
  key: K
) {
  return computed<RemUndefined<T[K]> | null>({
    set(v: RemUndefined<T[K]> | null) {
      if (v === null) {
        if (key in obj.value) {
          delete obj.value[key]
        }
      } else {
        obj.value[key] = v
      }
    },
    get(): RemUndefined<T[K]> | null {
      return (obj.value[key] ?? null) as RemUndefined<T[K]> | null
    }
  })
}

const recoOptions = ['DirectHit', 'TemplateMatch', 'OCR', 'Custom'].map(x => ({
  label: x,
  value: x
}))

const taskReco = wrapProp(task, 'recognition')
const taskRecoValue = computed(() => taskReco.value ?? 'DirectHit')

const taskRoi = wrapProp(task, 'roi')

const taskTemplate = wrapProp(task, 'template')
const taskThreshold = wrapProp(task, 'threshold')

const taskNext = wrapProp(task, 'next')
const taskNextArr = computed(() =>
  typeof taskNext.value === 'string'
    ? [taskNext.value]
    : taskNext.value === null
    ? []
    : taskNext.value
)
</script>

<template>
  <NCard>
    <div class="flex flex-col gap-2">
      <div
        class="grid items-center"
        style="
          grid-template-columns: max-content minmax(0, 1fr);
          column-gap: 0.5rem;
          row-gap: 1rem;
        "
      >
        <ClearButton v-model="taskReco"> 识别 </ClearButton>
        <NSelect
          v-model:value="taskReco"
          :options="recoOptions"
          :placeholder="recoOptions[0].label"
        ></NSelect>
        <template v-if="taskRecoValue !== 'Custom'">
          <ClearButton v-model="taskRoi"> 区域 </ClearButton>
          <SingleArrayEdit
            v-model:value="taskRoi"
            :def="() => [0, 0, 0, 0] as Rect"
            :is-t="
              v =>
                v instanceof Array && v.length === 4 && typeof v[0] === 'number'
            "
          >
            <template #edit="{ value, update }">
              <RectEdit :value="value" @update:value="update"></RectEdit>
            </template>
          </SingleArrayEdit>
        </template>
        <TemplateEdit
          v-if="taskRecoValue === 'TemplateMatch'"
          v-model:template="taskTemplate"
          v-model:threshold="taskThreshold"
        ></TemplateEdit>
        <ClearButton v-model="taskNext"> 导航 </ClearButton>
        <div class="flex flex-col gap-2">
          <div v-for="(s, i) in taskNextArr" :key="i" class="flex">
            <NButton @click="$emit('navigate', s)">
              {{ s }}
            </NButton>
          </div>
        </div>
      </div>
      <NCode language="json" :code="JSON.stringify(task, null, 2)"></NCode>
    </div>
  </NCard>
</template>
