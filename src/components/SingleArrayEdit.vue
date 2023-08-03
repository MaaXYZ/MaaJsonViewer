<script setup lang="ts" generic="T">
import { NButton, NIcon } from 'naive-ui'
import { DeleteOutlined, AddOutlined } from '@vicons/material'
import { computed, ref } from 'vue'
import SingleArrayButton from './SingleArrayButton.vue'

const props = withDefaults(
  defineProps<{
    nullable?: boolean
    type?: 'both' | 'single' | 'multi'
    def: () => T
    isT: (v: T | T[]) => boolean
    onAdd?: () => void
    onDel?: (idx: number) => void
  }>(),
  {
    nullable: false,
    type: 'both'
  }
)

const val = defineModel<T | T[] | null>('value', {
  required: true
})

function nullVal(): null | T {
  return props.nullable ? null : props.def()
}

const isSingle = computed(() => {
  const v = val.value
  return v === null || props.isT(v)
})

const valarr = computed(() => {
  return isSingle.value
    ? val.value !== null
      ? [val.value as T]
      : props.nullable
      ? []
      : [props.def()]
    : (val.value as T[])
})

const single = computed({
  set(nv: boolean) {
    if (nv === isSingle.value) {
      return
    }
    const v = val.value
    if (nv) {
      const varr = v as T[]
      val.value = varr.length === 0 ? nullVal() : varr[0]
    } else {
      val.value = v ? [v as T] : props.nullable ? [] : [props.def()]
    }
  },
  get() {
    return isSingle.value
  }
})

function add() {
  if (isSingle.value) {
    if (props.nullable && val.value === null) {
      if (props.type === 'multi') {
        val.value = [props.def()]
      } else {
        val.value = props.def()
      }
    }
  } else {
    ;(val.value as T[]).push(props.def())
    props.onAdd?.()
  }
}

function set(idx: number, v: T) {
  if (isSingle.value) {
    val.value = v
  } else {
    ;(val.value as T[])[idx] = v
  }
}

function remove(idx: number) {
  if (isSingle.value) {
    if (props.nullable) {
      val.value = null
      props.onDel?.(idx)
    }
  } else {
    ;(val.value as T[]).splice(idx, 1)
    props.onDel?.(idx)
  }
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex gap-2">
      <SingleArrayButton
        v-if="type === 'both'"
        v-model:value="single"
      ></SingleArrayButton>
      <NButton :disabled="single && val !== null" @click="add">
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
          :update="(x: T) => set(i, x)"
        ></slot>
        <NButton
          :disabled="!props.nullable && (single || valarr.length === 1)"
          @click="remove(i)"
        >
          <template #icon>
            <NIcon>
              <DeleteOutlined></DeleteOutlined>
            </NIcon>
          </template>
        </NButton>
      </template>
    </div>
  </div>
</template>
