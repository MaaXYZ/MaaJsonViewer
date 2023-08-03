import { computed, type Ref } from 'vue'

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

  key?: string | number | number[]

  package?: string

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

type RemUndefined<T> = T extends undefined ? never : T
export function wrapProp<T extends Record<string, unknown>, K extends string>(
  obj: Ref<T>,
  key: K
) {
  return computed<RemUndefined<T[K]> | null>({
    set(v: RemUndefined<T[K]> | null) {
      if (v === null) {
        if (key in obj.value) {
          delete obj.value[key]
        }
      } else {
        obj.value[key] = v
      }
    },
    get(): RemUndefined<T[K]> | null {
      return (obj.value[key] ?? null) as RemUndefined<T[K]> | null
    }
  })
}
