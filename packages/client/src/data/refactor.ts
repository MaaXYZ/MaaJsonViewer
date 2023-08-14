import { getTask, setTask, taskIndex } from '.'

import type { Task } from '@/types'

export function editAllTask(mapper: (task: Task) => Task) {
  for (const name in taskIndex.value) {
    const key = taskIndex.value[name]
    const task = getTask(key)!
    setTask(key, mapper(task))
  }
}

const taskKeys = [
  'target',
  'begin',
  'end',
  'next',
  'timeout_next',
  'runout_next'
] as const

export function filterTask(mapper: (from: string) => string | null) {
  editAllTask(task => {
    const temp: Task = {
      ...task
    }
    for (const key of taskKeys) {
      const value = task[key]
      if (typeof value === 'string') {
        const nt = mapper(value)
        if (nt) {
          temp[key] = nt
        } else {
          delete temp[key]
        }
      } else if (
        value instanceof Array &&
        value.length > 0 &&
        typeof value[0] === 'string'
      ) {
        ;(temp[key] as string[]) = (value as string[])
          .map(mapper)
          .filter((x): x is string => !!x)
      }
    }
    return temp
  })
}

export function filterTemplate(mapper: (from: string) => string | null) {
  editAllTask(task => {
    if (task.template) {
      if (typeof task.template === 'string') {
        const nt = mapper(task.template)
        if (nt) {
          return {
            ...task,
            template: nt
          }
        } else {
          const temp = {
            ...task
          }
          delete temp.template
          return temp
        }
      } else {
        return {
          ...task,
          template: task.template.map(mapper).filter((x): x is string => !!x)
        }
      }
    } else {
      return task
    }
  })
}
