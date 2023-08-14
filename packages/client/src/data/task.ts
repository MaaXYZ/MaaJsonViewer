import { computed } from 'vue'

import { filterTask } from '.'

import { fs, path } from '@/filesystem'
import type { PathKey } from '@/filesystem'
import type { Task, TaskData } from '@/types'

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

function wrapNext(v?: string | string[]) {
  return v ? (typeof v === 'string' ? [v] : v) : []
}

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
    return
  }
  const [, , hash] = path.divide(p)
  if (!hash) {
    return
  }
  const fd = fs.tree.openFile(p)
  const obj = JSON.parse(fd.value) as TaskData
  if (hash in obj) {
    delete obj[hash]
    fd.value = JSON.stringify(obj, null, 4)
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

export function duplicateTask(name: PathKey) {
  const [dir, file, hash] = path.divide(name)
  const task = getTask(name)
  if (!task) {
    return
  }
  for (let i = 0; ; i++) {
    const name2 = `${hash}${i}`
    if (!(name2 in taskIndex.value)) {
      setTask(path.joinkey(dir, file, name2), task)
      return
    }
  }
}

export function deleteTask(from: PathKey, to: PathKey | null) {
  const keys = ['target', 'begin', 'end', 'next', 'timeout_next', 'runout_next']

  const [fd, ff, fh] = path.divide(from)
  const th = to ? path.divide(to)[2] : null

  fs.scope(() => {
    filterTask(temp => {
      return temp === fh ? th : temp
    })
    delTask(from)
  })
}