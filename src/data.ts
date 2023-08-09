import { produce } from 'immer'
import { computed } from 'vue'

import { fs } from './data/fs'
import { delTask, getTask, setTask, taskIndex } from './data/task'
import { FS, Util } from './fs'
import { history } from './history'
import type { Task } from './types'

export interface TaskData {
  [task: string]: Task
}

export const active = computed(() => {
  return history.current.value
})

export function navigate(task: string) {
  history.push(task)
}

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

export function commitMove(from: string, to: string) {
  const keys = ['target', 'begin', 'end', 'next', 'timeout_next', 'runout_next']

  const [fd, ff, fh] = Util.pathdiv(from)
  const [td, tf, th] = Util.pathdiv(to)

  fs.enterBlock()

  for (const name in taskIndex.value) {
    const task = getTask(taskIndex.value[name])
    if (!task) {
      continue
    }
    const ntask = produce(task, dt => {
      for (const key of keys) {
        performRename(dt, key, fh!, th)
      }
    })
    if (name === fh) {
      delTask(from)
      setTask(to, ntask)
    } else {
      setTask(taskIndex.value[name], ntask)
    }
  }

  fs.leaveBlock()
}

export function commitDuplicate(name: string) {
  const [dir, file, hash] = Util.pathdiv(name)
  const task = produce(getTask(name)!, draft => draft)
  for (let i = 1; ; i++) {
    const name2 = `${hash}${i}`
    if (!(name2 in taskIndex.value)) {
      setTask(Util.pathjoin(dir, file, name2), task)
      return
    }
  }
}

export function commitDelete(from: string, to: string | null) {
  const keys = ['target', 'begin', 'end', 'next', 'timeout_next', 'runout_next']

  const [fd, ff, fh] = Util.pathdiv(from)
  const th = to ? Util.pathdiv(to)[2] : null

  fs.enterBlock()

  for (const name in taskIndex.value) {
    const task = getTask(taskIndex.value[name])
    if (!task) {
      continue
    }
    const ntask = produce(task, dt => {
      for (const key of keys) {
        performRename(dt, key, fh!, th)
      }
    })
    // console.log(name, ntask)
    if (name === fh) {
      delTask(from)
    } else {
      setTask(taskIndex.value[name], ntask)
    }
  }

  fs.leaveBlock()
}
