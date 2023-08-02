import type { TreeOption } from 'naive-ui'
import { computed, reactive } from 'vue'

type Rect = [number, number, number, number]
type TextRepl = [string, string]

type DirectHit = {
  recognition?: 'DirectHit'
  roi?: Rect | Rect[]
}

type TemplateMatch = {
  recognition: 'TemplateMatch'
  roi?: Rect | Rect[]
  template: string | string[]
  threshold?: number | number[]
  method?: 1 | 3 | 5
  green_mask?: boolean
}

type OCR = {
  recognition: 'OCR'
  roi?: Rect | Rect[]
  text?: string | string[]
  replace?: TextRepl | TextRepl[]
  only_rec?: boolean
}

type RecCustom = {
  recognition: 'Custom'
  custom_recognizer: string
  custom_recognizer_param: unknown
}

type DoNothing = {
  action?: 'DoNothing'
}

type Click = {
  action: 'Click'
  target?: true | string | Rect
  target_offset?: Rect
}

type Swipe = {
  action: 'Swipe'
  begin?: true | string | Rect
  begin_offset?: Rect
  end: true | string | Rect
  end_offset?: Rect
  duration?: number
}

type Key = {
  action: 'Key'
  key: string | number | number[]
}

type StartApp = {
  action: 'StartApp'
  package?: string
}

type StopApp = {
  action: 'StopApp'
  package?: string
}

type StopTask = {
  action: 'StopTask'
}

type ActCustom = {
  action: 'Custom'
  custom_action: string
  custom_action_param: unknown
}

type WaitFreezes = {
  time?: number
  target?: true | string | Rect
  target_offset?: Rect
  threshold?: number
  method?: 1 | 3 | 5
}

type Recognition = DirectHit | TemplateMatch | OCR | RecCustom
type Action =
  | DoNothing
  | Click
  | Swipe
  | Key
  | StartApp
  | StopApp
  | StopTask
  | ActCustom

type Task = Recognition &
  Action & {
    next?: string | string[]
    is_sub?: boolean
    timeout?: number
    timeout_next?: string | string[]
    times_limit?: number
    runout_next?: string | string[]
    pre_delay?: number
    post_delay?: number
    pre_wait_freezes?: number | WaitFreezes
    post_wait_freezes?: number | WaitFreezes
    notify?: boolean

    editor_info?: {
      path?: string
    }
  }

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

  return result
})
