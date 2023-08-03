import type { TreeOption } from 'naive-ui'
import { computed, reactive } from 'vue'
import type { Task } from './types'
import { loadData } from './demo/loader'

export interface TaskData {
  [task: string]: Task
}

function getNext(prf: string, opt: TreeOption[], key: string): TreeOption[] {
  for (const o of opt) {
    if (o.key === `${prf}${key}.`) {
      if (!o.children) {
        o.children = []
      }
      return o.children
    }
  }
  const o: TreeOption = {
    key: `${prf}${key}.`,
    label: key,
    children: []
  }
  opt.push(o)
  return o.children!
}

export const taskData = reactive<{ data: TaskData }>({ data: {} })
export const taskTree = computed<TreeOption[]>(() => {
  const result: TreeOption[] = []

  for (const key in taskData.data) {
    const task = taskData.data[key]
    const path = (task.editor_info?.path ?? 'default').split('.')
    task.editor_info = {
      ...(task.editor_info ?? {}),
      path: path.join('.')
    }
    let opt = result
    let prf = ''
    for (const p of path) {
      opt = getNext(prf, opt, p)
      prf += `${p}.`
    }
    opt.push({
      key: `${path}.${key}`,
      label: key
    })
  }

  const doSort = (arr: TreeOption[]) => {
    arr.sort((a, b) => {
      return a.label!.localeCompare(b.label!)
    })
    for (const a of arr) {
      if (a.children) {
        doSort(a.children)
      }
    }
  }

  doSort(result)

  return result
})

loadData()

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
