export type Rect = [number, number, number, number]
export type TextRepl = [string, string]

// type DirectHit = {
//   recognition?: 'DirectHit'
//   roi?: Rect | Rect[]
// }

// type TemplateMatch = {
//   recognition: 'TemplateMatch'
//   roi?: Rect | Rect[]
//   template: string | string[]
//   threshold?: number | number[]
//   method?: 1 | 3 | 5
//   green_mask?: boolean
// }

// type OCR = {
//   recognition: 'OCR'
//   roi?: Rect | Rect[]
//   text?: string | string[]
//   replace?: TextRepl | TextRepl[]
//   only_rec?: boolean
// }

// type RecCustom = {
//   recognition: 'Custom'
//   custom_recognizer: string
//   custom_recognizer_param: unknown
// }

type Recognition = {
  recognition?: 'DirectHit' | 'TemplateMatch' | 'OCR' | 'Custom'

  roi?: Rect | Rect[]
  template?: string | string[]
  threshold?: number | number[]
  method?: 1 | 3 | 5
  green_mask?: boolean

  text?: string | string[]
  replace?: TextRepl | TextRepl[]
  only_rec?: boolean

  custom_recognizer?: string
  custom_recognizer_param?: unknown
}

// type DoNothing = {
//   action?: 'DoNothing'
// }

// type Click = {
//   action: 'Click'
//   target?: true | string | Rect
//   target_offset?: Rect
// }

// type Swipe = {
//   action: 'Swipe'
//   begin?: true | string | Rect
//   begin_offset?: Rect
//   end: true | string | Rect
//   end_offset?: Rect
//   duration?: number
// }

// type Key = {
//   action: 'Key'
//   key: string | number | number[]
// }

// type StartApp = {
//   action: 'StartApp'
//   package?: string
// }

// type StopApp = {
//   action: 'StopApp'
//   package?: string
// }

// type StopTask = {
//   action: 'StopTask'
// }

// type ActCustom = {
//   action: 'Custom'
//   custom_action: string
//   custom_action_param: unknown
// }

type Action = {
  action?:
    | 'DoNothing'
    | 'Click'
    | 'Swipe'
    | 'Key'
    | 'StartApp'
    | 'StopApp'
    | 'StopTask'
    | 'Custom'

  target?: true | string | Rect
  target_offset?: Rect

  begin?: true | string | Rect
  begin_offset?: Rect
  end?: true | string | Rect
  end_offset?: Rect
  duration?: number

  key?: number | number[]

  package?: string

  custom_action?: string
  custom_action_param?: unknown
}

export type WaitFreezes = {
  time?: number
  target?: true | string | Rect
  target_offset?: Rect
  threshold?: number
  method?: 1 | 3 | 5
}

// type Recognition = DirectHit | TemplateMatch | OCR | RecCustom
// type Action =
//   | DoNothing
//   | Click
//   | Swipe
//   | Key
//   | StartApp
//   | StopApp
//   | StopTask
//   | ActCustom

export type Task = Recognition &
  Action & {
    next?: string | string[]
    is_sub?: boolean
    inverse?: boolean
    timeout?: number
    timeout_next?: string | string[]
    times_limit?: number
    runout_next?: string | string[]
    pre_delay?: number
    post_delay?: number
    pre_wait_freezes?: number | WaitFreezes
    post_wait_freezes?: number | WaitFreezes
    notify?: boolean
  }

export interface TaskData {
  [task: string]: Task
}

export interface TaskRunInfo {
  task: string
  enable: boolean
  status: 'skipped' | 'pending' | 'running' | 'success' | 'error'
}

export const enum DispatcherStatus {
  Invalid,
  Pending,
  Started,
  Completed,
  Failed,
  Stopped
}
