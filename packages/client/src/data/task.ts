import { computed } from 'vue'

import { fs, path } from '@/filesystem'
import type { PathKey } from '@/filesystem'
import type { Task, TaskData } from '@/types'

export const jsonIndex = computed(() => {
  const res: Record<PathKey, string[]> = {}
  fs.tree.travel(
    fs.tree.root,
    () => void 0,
    (dir, name, content) => {
      if (name.endsWith('.json')) {
        const data = JSON.parse(content) as TaskData
        res[path.joinkey(dir, name)] = Object.keys(data)
      }
    },
    () => {},
    void 0
  )
  return res
})

export const taskIndex = computed(() => {
  const res: Record<string, PathKey> = {}
  fs.tree.travel(
    fs.tree.root,
    () => void 0,
    (dir, name, content) => {
      if (name.endsWith('.json')) {
        const data = JSON.parse(content) as TaskData
        for (const hash in data) {
          if (hash in res) {
            console.warn('duplicated task detected', name)
            continue
          }
          res[hash] = path.joinkey(dir, name, hash)
        }
      }
    },
    () => {},
    void 0
  )
  return res
})

const keys = ['next', 'timeout_next', 'runout_next'] as const
type NaviKey = (typeof keys)[number]

function wrapNext(v?: string | string[]) {
  return v ? (typeof v === 'string' ? [v] : v) : []
}

export const taskForwardIndex = computed(() => {
  const res: Record<string, Record<NaviKey, string[]>> = {}
  for (const name in taskIndex.value) {
    const r: Record<NaviKey, string[]> = {
      next: [],
      timeout_next: [],
      runout_next: []
    }
    const task = getTask(taskIndex.value[name])
    if (!task) {
      continue
    }
    for (const key of keys) {
      let arr = wrapNext(task[key])
      for (const to of arr) {
        r[key].push(to)
      }
    }
    res[name] = r
  }
  return res
})

export const taskBackwardIndex = computed(() => {
  const res: Record<string, string[]> = {}
  for (const name in taskIndex.value) {
    const keys = ['next', 'timeout_next', 'runout_next'] as const
    const task = getTask(taskIndex.value[name])
    if (!task) {
      continue
    }
    for (const key of keys) {
      let arr = wrapNext(task[key])
      for (const to of arr) {
        if (!(to in res)) {
          res[to] = []
        }
        res[to].push(name)
      }
    }
  }
  return res
})

export function setTask(p: PathKey | null, v: Task) {
  if (!p) {
    return
  }
  const [, , hash] = path.divide(p)
  if (!hash) {
    return
  }
  const fd = fs.tree.openFile(p)
  const obj = JSON.parse(fd.value) as TaskData
  obj[hash] = v
  fd.value = JSON.stringify(obj, null, 4)
}

export function delTask(p: PathKey | null) {
  if (!p) {
    return null
  }
  const [, , hash] = path.divide(p)
  if (!hash) {
    return null
  }
  const fd = fs.tree.openFile(p)
  const obj = JSON.parse(fd.value) as TaskData
  if (hash in obj) {
    const task = obj[hash]
    delete obj[hash]
    fd.value = JSON.stringify(obj, null, 4)
    return task
  } else {
    return null
  }
}

export function getTask(p: PathKey | null) {
  if (!p || p === '/') {
    return
  }
  const [dir, file, hash] = path.divide(p)
  if (!hash) {
    return
  }
  const f = fs.tree.readFile(path.joinkey(dir, file))
  if (!f) {
    return
  }
  const obj = JSON.parse(f) as TaskData
  return obj[hash] ?? null
}
