import { type TreeOption } from 'naive-ui'
import { computed, reactive } from 'vue'
import type { Task } from './types'
import { history } from './history'
import { buildEntries, type FSEntry } from './fs'

export interface TaskData {
  [task: string]: Task
}

export const folderData = reactive<{ data: string[][] }>({ data: [] })
export const fileData = reactive<{ data: string[][] }>({ data: [] })

export const taskData = reactive<{ data: TaskData }>({ data: {} })
export const taskDataSaved = reactive<{ data: TaskData }>({ data: {} })

export function isModified(task: string) {
  return (
    JSON.stringify(taskData.data[task]) !==
    JSON.stringify(taskDataSaved.data[task])
  )
}

export const active = computed(() => {
  return history.current.value
})

export function navigate(task: string) {
  history.push(task)
}

export const taskTree = computed<TreeOption>(() => {
  const root = buildEntries(folderData.data, fileData.data)

  const viaKey = (a: TreeOption, b: TreeOption) => {
    return (a.key as string).localeCompare(b.key as string)
  }

  const makeFileOption = (prefix: string, name: string): TreeOption => {
    const key = `${prefix}${name}/`
    if (name.endsWith('.json')) {
      return {
        key,
        label: name,
        children: Object.keys(taskData.data)
          .map(key => [key, taskData.data[key]] as const)
          .filter(([, task]) => task.editor_info.path === key)
          .map(([name]) => ({
            key: `${key}${name}`,
            label: name
          }))
          .sort(viaKey)
      }
    } else {
      return {
        key,
        label: name
      }
    }
  }

  const makeOption = (prefix: string, entry: FSEntry): TreeOption => {
    return {
      key: `@${prefix}${entry.name}/`,
      label: entry.name,
      children: [
        ...entry.dir
          .map(sube => makeOption(`${prefix}${entry.name}/`, sube))
          .sort(viaKey),
        ...entry.file
          .map(file => makeFileOption(`${prefix}${entry.name}/`, file))
          .sort(viaKey)
      ]
    }
  }

  return makeOption('', root)
})

function performRename(
  task: Record<string, unknown>,
  key: string,
  from: string,
  to: string | null
) {
  if (!(key in task)) {
    return
  }
  const val = task[key]
  if (typeof val === 'string') {
    if (val === from) {
      if (to) {
        task[key] = to
      } else {
        delete task[key]
      }
      return
    }
  } else if (
    val instanceof Array &&
    val.length > 0 &&
    typeof val[0] === 'string'
  ) {
    if (to) {
      task[key] = val.map(x => {
        if (x === from) {
          return to
        } else {
          return x
        }
      })
    } else {
      task[key] = val.filter(x => x !== from)
    }
  }
}

export function commitRename(from: string, to: string) {
  const keys = ['target', 'begin', 'end', 'next', 'timeout_next', 'runout_next']
  const data: Record<string, Task> = {}
  for (const name in taskData.data) {
    const task = JSON.parse(JSON.stringify(taskData.data[name]))
    for (const key of keys) {
      performRename(task, key, from, to)
    }
    data[name === from ? to : name] = task
  }
  taskData.data = data
}

export function commitDuplicate(name: string) {
  const task = JSON.parse(JSON.stringify(taskData.data[name]))
  for (let i = 1; ; i++) {
    const name2 = `${name}${i}`
    if (!(name2 in taskData.data)) {
      taskData.data[name2] = task
      return
    }
  }
}

export function commitDelete(from: string, to: string | null) {
  const keys = ['target', 'begin', 'end', 'next', 'timeout_next', 'runout_next']
  const data: Record<string, Task> = {}
  for (const name in taskData.data) {
    if (from === name) {
      continue
    }
    const task = JSON.parse(JSON.stringify(taskData.data[name]))
    for (const key of keys) {
      performRename(task, key, from, to)
    }
    data[name] = task
  }
  taskData.data = data
}
