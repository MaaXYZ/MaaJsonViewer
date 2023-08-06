import { fs } from './fs'
import { type Ref, computed } from 'vue'

import { type TaskData } from '@/data'
import { FS, Util } from '@/fs'
import type { Task } from '@/types'

export const taskIndex = computed(() => {
  const res: Record<string, string> = {}
  fs.now().value?.enumFile((dir, entry) => {
    if (entry.name.endsWith('.json') && entry.data) {
      const data: TaskData = JSON.parse(entry.data)
      for (const name in data) {
        if (name in res) {
          console.warn('duplicated task detected', name)
          continue
        }
        res[name] = Util.pathjoin(dir, entry.name, name)
      }
    }
  })
  return res
})

export function setTask(path: string | null, v: Task) {
  if (!path) {
    return
  }
  const [dir, file, hash] = Util.pathdiv(path)
  if (!hash) {
    return
  }
  fs.change(draft => {
    if (!draft) {
      return
    }
    const de = draft.trace(dir)
    if (!de) {
      return
    }
    const json = draft.getFileViaEntry(de, file)?.[1]?.data
    if (!json) {
      return
    }
    const obj = JSON.parse(json) as TaskData
    obj[hash] = v
    draft.addTextFileViaEntry(
      draft.trace(dir)!,
      file,
      JSON.stringify(obj, null, 4),
      true
    )
  })
}

export function delTask(path: string | null) {
  if (!path) {
    return
  }
  const [dir, file, hash] = Util.pathdiv(path)
  if (!hash) {
    return
  }
  fs.change(draft => {
    if (!draft) {
      return
    }
    const de = draft.trace(dir)
    if (!de) {
      return
    }
    const json = draft.getFileViaEntry(de, file)?.[1]?.data
    if (!json) {
      return
    }
    const obj = JSON.parse(json) as TaskData
    if (hash in obj) {
      delete obj[hash]
    }
    draft.addTextFileViaEntry(
      draft.trace(dir)!,
      file,
      JSON.stringify(obj, null, 4),
      true
    )
  })
}

export function getTask(path: string | null) {
  if (!path) {
    return null
  }
  const [dir, file, hash] = Util.pathdiv(path)
  if (!hash) {
    return null
  }
  const f = fs.now().value
  if (!f) {
    return null
  }
  const de = f.trace(dir)
  if (!de) {
    return null
  }
  const json = f.getFileViaEntry(de, file)?.[1]?.data
  if (!json) {
    return null
  }
  const obj = JSON.parse(json) as TaskData
  return obj[hash] ?? null
}
