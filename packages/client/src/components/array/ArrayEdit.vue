<script setup lang="ts" generic="T">
import {
  AddOutlined,
  DataArrayOutlined,
  DeleteOutlined
} from '@vicons/material'
import { useVModel } from '@vueuse/core'
import { NButton, NIcon } from 'naive-ui'
import { computed } from 'vue'

import SwitchButton from '@/components/atomic/SwitchButton.vue'

type U = T | T[] | null

const props = withDefaults(
  defineProps<{
    value: U
    def: () => T
    isT: (v: T | T[]) => boolean
    nullable?: boolean
    readonly?: boolean
    type?: 'both' | 'single' | 'multi'
    onAdd?: () => void
    onDel?: (idx: number) => void
  }>(),
  {
    type: 'both'
  }
)

const emits = defineEmits<{
  'update:value': [U]
}>()

const value = useVModel(props, 'value', emits, {
  passive: true,
  deep: true
})

function nullVal(): null | T {
  return props.nullable ? null : props.def()
}

const isSingle = computed(() => {
  const v = value.value as U
  return v === null || props.isT(v)
})

const valarr = computed(() => {
  return isSingle.value
    ? value.value !== null
      ? [value.value as T]
      : props.nullable
      ? []
      : [props.def()]
    : (value.value as T[])
})

const single = computed({
  set(nv: boolean) {
    if (nv === isSingle.value) {
      return
    }
    const v = value.value as U
    if (nv) {
      const varr = v as T[]
      ;(value.value as U) = varr.length === 0 ? nullVal() : varr[0]
    } else {
      ;(value.value as U) = v ? [v as T] : props.nullable ? [] : [props.def()]
    }
  },
  get() {
    return isSingle.value
  }
})

function add() {
  if (isSingle.value) {
    if (props.nullable && (value.value as U) === null) {
      if (props.type === 'multi') {
        ;(value.value as U) = [props.def()]
      } else {
        ;(value.value as U) = props.def()
      }
    }
  } else {
    ;(value.value as T[]).push(props.def())
    props.onAdd?.()
  }
}

function set(idx: number, val: T) {
  if (isSingle.value) {
    ;(value.value as U) = val
  } else {
    ;(value.value as T[])[idx] = val
  }
}

function remove(idx: number) {
  if (isSingle.value) {
    if (props.nullable) {
      ;(value.value as U) = null
      props.onDel?.(idx)
    }
  } else {
    ;(value.value as T[]).splice(idx, 1)
    props.onDel?.(idx)
  }
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      class="flex gap-2"
      v-if="!readonly && (type === 'both' || !single || value === null)"
    >
      <SwitchButton v-if="type === 'both'" v-model:value="single">
        <DataArrayOutlined></DataArrayOutlined>
      </SwitchButton>
      <NButton v-if="!single || value === null" @click="add">
        <template #icon>
          <NIcon>
            <AddOutlined></AddOutlined>
          </NIcon>
        </template>
      </NButton>
    </div>
    <div
      v-if="valarr.length > 0"
      class="grid gap-2"
      style="grid-template-columns: 1fr max-content"
    >
      <template v-for="(v, i) in valarr" :key="i">
        <slot
          name="edit"
          :index="i"
          :value="v"
          :update="(v: T) => set(i, v)"
        ></slot>
        <div>
          <NButton
            v-if="!readonly"
            :disabled="!nullable && (single || valarr.length === 1)"
            @click="remove(i)"
          >
            <template #icon>
              <NIcon>
                <DeleteOutlined></DeleteOutlined>
              </NIcon>
            </template>
          </NButton>
        </div>
      </template>
    </div>
  </div>
</template>
