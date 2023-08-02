<script setup lang="ts" generic="T">
import { NButton } from 'naive-ui'
import { computed, ref } from 'vue'
import SingleArrayButton from './SingleArrayButton.vue'

const props = defineProps<{
  def: () => T
  isT: (v: T | T[]) => boolean
  onAdd?: () => void
  onDel?: (idx: number) => void
}>()

const val = defineModel<T | T[] | null>('value', {
  required: true
})

const isSingle = computed(() => {
  const v = val.value
  return v === null || props.isT(v)
})

const valarr = computed(() => {
  return isSingle.value ? [(val.value ?? props.def()) as T] : (val.value as T[])
})

const single = computed({
  set(nv: boolean) {
    if (nv === isSingle.value) {
      return
    }
    const v = val.value
    if (nv) {
      const varr = v as T[]
      val.value = varr.length === 0 ? props.def() : varr[0]
    } else {
      val.value = v ? [v as T] : [props.def()]
    }
  },
  get() {
    return isSingle.value
  }
})

function add() {
  if (isSingle.value) {
    return
  }
  ;(val.value as T[]).push(props.def())
  props.onAdd?.()
}

function set(idx: number, v: T) {
  if (isSingle.value || valarr.value.length === 1) {
    return
  }
  ;(val.value as T[])[idx] = v
}

function remove(idx: number) {
  if (isSingle.value || valarr.value.length === 1) {
    return
  }
  ;(val.value as T[]).splice(idx, 1)
  props.onDel?.(idx)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex gap-2">
      <SingleArrayButton v-model:value="single"></SingleArrayButton>
      <NButton :disabled="single" @click="add"> 添加 </NButton>
    </div>
    <div class="grid gap-2" style="grid-template-columns: 1fr max-content">
      <template v-for="(v, i) in valarr" :key="i">
        <slot
          name="edit"
          :index="i"
          :value="v"
          :update="(x: T) => set(i, x)"
        ></slot>
        <NButton :disabled="single || valarr.length === 1" @click="remove(i)">
          删除
        </NButton>
      </template>
    </div>
  </div>
</template>
