<script setup lang="ts" generic="T">
import { NButton, NIcon } from 'naive-ui'
import { DeleteOutlined, AddOutlined } from '@vicons/material'
import { computed, ref } from 'vue'
import SingleArrayButton from './SingleArrayButton.vue'
import type { UseProducer } from '@/persis'
import { produce } from 'immer'

type U = T | T[] | null

const props = withDefaults(
  defineProps<{
    value: U
    edit: UseProducer<U>
    def: () => T
    isT: (v: T | T[]) => boolean
    nullable?: boolean
    type?: 'both' | 'single' | 'multi'
    onAdd?: () => void
    onDel?: (idx: number) => void
  }>(),
  {
    nullable: false,
    type: 'both'
  }
)

function nullVal(): null | T {
  return props.nullable ? null : props.def()
}

const isSingle = computed(() => {
  const v = props.value
  return v === null || props.isT(v)
})

const valarr = computed(() => {
  return isSingle.value
    ? props.value !== null
      ? [props.value as T]
      : props.nullable
      ? []
      : [props.def()]
    : (props.value as T[])
})

const single = computed({
  set(nv: boolean) {
    if (nv === isSingle.value) {
      return
    }
    const v = props.value
    if (nv) {
      const varr = v as T[]
      props.edit(() => {
        return varr.length === 0 ? nullVal() : varr[0]
      })
    } else {
      props.edit(() => {
        return v ? [v as T] : props.nullable ? [] : [props.def()]
      })
    }
  },
  get() {
    return isSingle.value
  }
})

function add() {
  if (isSingle.value) {
    if (props.nullable && props.value === null) {
      if (props.type === 'multi') {
        props.edit(() => {
          return [props.def()]
        })
      } else {
        props.edit(() => {
          return props.def()
        })
      }
    }
  } else {
    props.edit(draft => {
      ;(draft as T[]).push(props.def())
    })
    props.onAdd?.()
  }
}

function set(idx: number, v: T) {
  if (isSingle.value) {
    props.edit(() => {
      return v
    })
  } else {
    props.edit(draft => {
      ;(draft as T[])[idx] = v
    })
  }
}

function remove(idx: number) {
  if (isSingle.value) {
    if (props.nullable) {
      props.edit(() => {
        return null
      })
      props.onDel?.(idx)
    }
  } else {
    props.edit(draft => {
      ;(draft as T[]).splice(idx, 1)
    })
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
      <NButton :disabled="single && value !== null" @click="add">
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
          :edit="
            (p => {
              edit(draft => {
                if (isSingle) {
                  return produce(v, p)
                } else {
                  ;(draft as T[])[i] = produce(v, p)
                }
              })
            }) as UseProducer<T>
          "
        ></slot>
        <NButton
          :disabled="!nullable && (single || valarr.length === 1)"
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
