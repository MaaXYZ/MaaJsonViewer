import { computed, reactive } from 'vue'

export const history = reactive<{
  backward: string[]
  forward: string[]
}>({ backward: [], forward: [] })

export function historyPush(v: string) {
  history.backward.push(v)
  history.forward = []
}

export const canUndo = computed(() => history.backward.length > 0)
export const canRedo = computed(() => history.forward.length > 0)

export function historyUndo() {
  history.forward.push(history.backward.pop()!)
}

export function historyRedo() {
  const v = history.forward.pop()!
  history.backward.push(v)
}
