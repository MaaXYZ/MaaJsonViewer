import { produce } from 'immer'
import { shallowRef, type ComputedRef, type ShallowRef, computed } from 'vue'

type ImmerInfo<T> = [ShallowRef<T>, (updater: (target: T) => void) => void]

function useImmer<T>(init: T): ImmerInfo<T> {
  const state = shallowRef<T>(init)
  const update = (updater: (target: T) => void) => {
    state.value = produce(state.value, updater)
  }

  return [state, update]
}

export class Persis<T> {
  current: ImmerInfo<T>
  prev: ImmerInfo<T[]>
  next: ImmerInfo<T[]>

  canUndo: ComputedRef<boolean>
  canRedo: ComputedRef<boolean>

  constructor(data: T) {
    this.current = useImmer(data)
    this.prev = useImmer([])
    this.next = useImmer([])

    this.canUndo = computed(() => {
      return this.prev[0].value.length > 0
    })
    this.canRedo = computed(() => {
      return this.next[0].value.length > 0
    })
  }

  now() {
    return this.current[0]
  }

  change(proc: (v: T) => void) {
    this.next[0].value = []
    this.prev[1](draft => {
      draft.push(this.current[0].value)
    })
    this.current[1](proc)
  }

  move(offset: number) {
    if (offset < 0) {
      if (this.prev[0].value.length < -offset) {
        return
      }

      this.next[1](draft => {
        draft.push(this.current[0].value)
        if (-offset > 1) {
          draft.push(...this.prev[0].value.slice(offset + 1).reverse())
        }
      })

      this.current[0].value =
        this.prev[0].value[this.prev[0].value.length + offset]

      this.prev[1](draft => {
        draft.splice(offset)
      })
    } else if (offset > 0) {
      if (this.next[0].value.length < offset) {
        return
      }

      this.prev[1](draft => {
        draft.push(this.current[0].value)
        if (offset > 1) {
          draft.push(...this.next[0].value.slice(-offset + 1).reverse())
        }
      })

      this.current[0].value =
        this.next[0].value[this.next[0].value.length - offset]

      this.next[1](draft => {
        draft.splice(-offset)
      })
    }
  }

  undo() {
    if (this.canUndo.value) {
      this.move(-1)
    }
  }

  redo() {
    if (this.canRedo.value) {
      this.move(1)
    }
  }
}
