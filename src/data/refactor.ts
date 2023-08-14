import { getTask, setTask, taskIndex } from '.'

import type { Task } from '@/types'

export function editAllTask(mapper: (task: Task) => Task) {
  for (const name in taskIndex.value) {
    const key = taskIndex.value[name]
    const task = getTask(key)!
    setTask(key, mapper(task))
  }
}

export function filterTemplate(mapper: (from: string) => string) {
  editAllTask(task => {
    if (task.template) {
      if (typeof task.template === 'string') {
        return {
          ...task,
          template: mapper(task.template)
        }
      } else {
        return {
          ...task,
          template: task.template.map(mapper)
        }
      }
    } else {
      return task
    }
  })
}
