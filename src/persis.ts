import { produce } from 'immer'
import { type Ref, type ShallowRef, ref, shallowRef } from 'vue'

export type Producer<T> = (target: T) => void | T
export type UseProducer<T> = (prod: Producer<T>) => void

export type ImmerInfo<T> = [ShallowRef<T>, UseProducer<T>]

export function useImmer<T>(init: T): ImmerInfo<T> {
  const state = shallowRef<T>(init)
  const update = (updater: (target: T) => void | T) => {
    state.value = produce(state.value, updater)
  }

  return [state, update]
}

type RemUndef<T> = T extends undefined ? never : T
export function applyEditOn<T, K extends keyof T>(
  edit: UseProducer<T>,
  key: K
) {
  return (p: Producer<RemUndef<T[K]> | null>) => {
    edit(draft => {
      const val = produce(draft[key] ?? null, p)
      if (val !== null) {
        draft[key] = val
      } else {
        delete draft[key]
      }
    })
  }
}

export function updateEditOn<T, K extends keyof T>(
  edit: UseProducer<T>,
  key: K,
  val: T[K]
) {
  edit(draft => {
    if ((val ?? null) === null) {
      delete draft[key]
    } else {
      draft[key] = val
    }
  })
}

export function updateEdit<T>(edit: UseProducer<T>, val: T) {
  edit(() => {
    return val
  })
}

export class Persis<T> {
  current: ImmerInfo<T>
  prev: Ref<T[]>
  next: Ref<T[]>

  block: number

  constructor(data: T) {
    this.current = useImmer(data)
    this.prev = ref([])
    this.next = ref([])
    this.block = 0
  }

  canUndo() {
    return this.prev.value.length > 0
  }

  canRedo() {
    return this.next.value.length > 0
  }

  now() {
    return this.current[0]
  }

  enterBlock() {
    this.block += 1
    if (this.block === 1) {
      this.next.value = []
      this.prev.value.push(this.current[0].value)
    }
  }

  leaveBlock() {
    this.block -= 1
  }

  change(proc: (v: T) => void | T) {
    if (this.block === 0) {
      this.next.value = []
      this.prev.value.push(this.current[0].value)
    }
    this.current[1](proc)
  }

  move(offset: number) {
    if (offset < 0) {
      if (this.prev.value.length < -offset) {
        return
      }

      this.next.value.push(this.current[0].value)
      if (-offset > 1) {
        this.next.value.push(...this.prev.value.slice(offset + 1).reverse())
      }

      this.current[0].value = this.prev.value[this.prev.value.length + offset]

      this.prev.value.splice(offset)
    } else if (offset > 0) {
      if (this.next.value.length < offset) {
        return
      }

      this.prev.value.push(this.current[0].value)
      if (offset > 1) {
        this.prev.value.push(...this.next.value.slice(-offset + 1).reverse())
      }

      this.current[0].value = this.next.value[this.next.value.length - offset]

      this.next.value.splice(-offset)
    }
  }

  undo() {
    if (this.canUndo()) {
      this.move(-1)
    }
  }

  redo() {
    if (this.canRedo()) {
      this.move(1)
    }
  }
}
