import { Persis } from './persis'
import { type ComputedRef, computed } from 'vue'

class History {
  info: Persis<{ active: string | null }>
  current: ComputedRef<string | null>

  constructor() {
    this.info = new Persis<{ active: string | null }>({
      active: null
    })
    this.current = computed(() => {
      return this.info.now().value.active
    })
  }

  push(v: string) {
    this.info.change(h => {
      h.active = v
    })
  }
}

export const history = new History()
