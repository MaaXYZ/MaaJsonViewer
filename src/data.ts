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
