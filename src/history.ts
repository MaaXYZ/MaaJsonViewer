import { computed, reactive } from 'vue'

const history = reactive<{
  backward: string[]
  forward: string[]
}>({ backward: [], forward: [] })

export function historyPush(v: string) {
  history.backward.push(v)
  history.forward = []
  return [v]
}

export const canUndo = computed(() => history.backward.length > 0)
export const canRedo = computed(() => history.forward.length > 0)

export function historyUndo() {
  history.forward.push(history.backward.pop()!)
  return history.backward.length === 0
    ? []
    : [history.backward[history.backward.length - 1]]
}

export function historyRedo() {
  const v = history.forward.pop()!
  history.backward.push(v)
  return [v]
}
