import { computed } from 'vue'

import { history } from '@/data'
import type { PathKey } from '@/filesystem'

export * from './config'
export * from './filesystem'
export * from './history'
export * from './image'
export * from './refactor'
export * from './task'
export * from './validator'

export const active = computed(() => {
  return history.cur.value
})

export function navigate(task: PathKey) {
  history.push(task)
}
