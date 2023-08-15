import { ref } from 'vue'

import { getTask, taskIndex } from '@/data'
import { type PathZip, fs } from '@/filesystem'
import type { Task } from '@/types'

export const validateResult = ref<[string, string, unknown][]>([])

function checkRect(rect: unknown) {
  return (
    rect instanceof Array &&
    rect.length === 4 &&
    rect.every(x => typeof x === 'number' && x >= 0 && Math.floor(x) === x)
  )
}

function checkRepl(repl: unknown) {
  return (
    repl instanceof Array &&
    repl.length === 2 &&
    repl.every(x => typeof x === 'string') &&
    repl[0].length > 0 &&
    repl[0] !== repl[1]
  )
}

function checkRoi(name: string, roi?: unknown) {
  if (roi === undefined) {
    return
  }
  if (!(roi instanceof Array)) {
    validateResult.value.push([name, 'roi should be Rect | Rect[]', roi])
    return
  }
  if (roi.length > 0) {
    if (typeof roi[0] === 'number') {
      if (!checkRect(roi)) {
        validateResult.value.push([name, 'roi should be Rect', roi])
        return
      }
    } else {
      for (const [idx, rc] of roi.entries()) {
        if (!checkRect(rc)) {
          validateResult.value.push([name, `roi[${idx}] should be Rect`, rc])
          return
        }
      }
    }
  }
}

function checkTemplate(name: string, template: unknown, idx?: number) {
  const prop = idx ? `template[${idx}]` : 'template'
  if (typeof template !== 'string') {
    validateResult.value.push([name, `${prop} should be string`, template])
    return
  }
  if (!template.endsWith('.png')) {
    validateResult.value.push([name, `${prop} should be png`, template])
    return
  }
  if (!fs.tree.existsFile(template as PathZip)) {
    validateResult.value.push([name, `${prop} not exists`, template])
    return
  }
}

function checkThreshold(name: string, threshold: unknown, prop = 'threshold') {
  if (typeof threshold !== 'number') {
    validateResult.value.push([name, `${prop} should be number`, threshold])
    return
  }
  if (threshold < 0 || threshold > 1) {
    validateResult.value.push([
      name,
      `${prop} should be inside [0, 1]`,
      threshold
    ])
    return
  }
}

function checkTemplateThreshold(
  name: string,
  template?: unknown,
  threshold?: unknown
) {
  if (template === undefined) {
    validateResult.value.push([name, 'template is required', undefined])
    return
  }
  if (typeof template === 'string') {
    checkTemplate(name, template)
  } else if (template instanceof Array) {
    for (const [idx, tpl] of template.entries()) {
      checkTemplate(name, tpl, idx)
    }
  } else {
    validateResult.value.push([
      name,
      'template should be string | string[]',
      template
    ])
    return
  }

  if (threshold !== undefined) {
    if (typeof threshold === 'number') {
      checkThreshold(name, threshold)
    } else if (threshold instanceof Array) {
      for (const [idx, thr] of threshold.entries()) {
        checkThreshold(name, thr, `threshold[${idx}]`)
      }
    } else {
      validateResult.value.push([
        name,
        'threshold should be number | number[]',
        threshold
      ])
      return
    }

    if (typeof template === 'string' && threshold instanceof Array) {
      validateResult.value.push([
        name,
        'threshold should be number if template is string',
        threshold
      ])
      return
    }

    if (
      template instanceof Array &&
      threshold instanceof Array &&
      template.length !== threshold.length
    ) {
      validateResult.value.push([
        name,
        'threshold should have the same length as template',
        [template.length, threshold.length]
      ])
      return
    }
  }
}

function checkMethod(name: string, method?: unknown, prop = 'method') {
  if (method === undefined) {
    return
  }
  if (typeof method !== 'number' || ![1, 3, 5].includes(method)) {
    validateResult.value.push([name, `${prop} should be 1 | 3 | 5`, method])
    return
  }
}

function checkBool(name: string, value: unknown | undefined, prop: string) {
  if (value === undefined) {
    return
  }
  if (typeof value !== 'boolean') {
    validateResult.value.push([name, `${prop} should be boolean`, value])
    return
  }
}

function checkText(name: string, text?: unknown) {
  if (text === undefined) {
    validateResult.value.push([name, `text is required`, undefined])
    return
  }
  if (typeof text !== 'string' && !(text instanceof Array)) {
    validateResult.value.push([name, `text should be string | string[]`, text])
    return
  }
  if (text instanceof Array) {
    for (const [idx, txt] of text.entries()) {
      if (typeof txt !== 'string') {
        validateResult.value.push([name, `text[${idx}] should be string`, txt])
        return
      }
      if (txt.length === 0) {
        validateResult.value.push([
          name,
          `text[${idx}] should be non-empty`,
          txt
        ])
        return
      }
    }
  }
}

function checkReplace(name: string, replace?: unknown) {
  if (replace === undefined) {
    return
  }
  if (!(replace instanceof Array)) {
    validateResult.value.push([
      name,
      'replace should be TextRepl | TextRepl[]',
      replace
    ])
    return
  }
  if (replace.length > 0) {
    if (typeof replace[0] === 'string') {
      if (!checkRepl(replace)) {
        validateResult.value.push([name, 'replace should be TextRepl', replace])
        return
      }
    } else {
      for (const [idx, rpl] of replace.entries()) {
        if (!checkRepl(rpl)) {
          validateResult.value.push([
            name,
            `replace[${idx}] should be TextRepl`,
            rpl
          ])
          return
        }
      }
    }
  }
}

function checkCustom(name: string, value: unknown | undefined, prop: string) {
  if (value === undefined) {
    validateResult.value.push([name, `${prop} is required`, undefined])
    return
  }
  if (typeof value !== 'string') {
    validateResult.value.push([name, `text should be string`, undefined])
    return
  }
  if (value.length === 0) {
    validateResult.value.push([name, `text should be non-empty`, undefined])
    return
  }
}

function checkRecognition(name: string, task: Task) {
  switch (task.recognition ?? 'DirectHit') {
    case 'DirectHit':
      checkRoi(name, task.roi)
      break
    case 'TemplateMatch':
      checkRoi(name, task.roi)
      checkTemplateThreshold(name, task.template, task.threshold)
      checkMethod(name, task.method)
      checkBool(name, task.green_mask, 'green_mask')
      break
    case 'OCR':
      checkRoi(name, task.roi)
      checkText(name, task.text)
      checkReplace(name, task.replace)
      checkBool(name, task.only_rec, 'only_rec')
      break
    case 'Custom':
      checkCustom(name, task.custom_recognizer, 'custom_recognizer')
      break
  }
}

function checkTarget(
  name: string,
  task: Task,
  value: unknown | undefined,
  prop: string
) {
  if (value === undefined || value === true) {
    if (task.inverse) {
      validateResult.value.push([
        name,
        `${prop} shouldn't be true when inverse is set`,
        value
      ])
      return
    }
    if ((task.recognition ?? 'DirectHit') === 'DirectHit') {
      console.log(task, task.recognition)
      validateResult.value.push([
        name,
        `${prop} shouldn't be true when recognition is 'DirectHit'`,
        value
      ])
      return
    }
  } else if (typeof value === 'string') {
    if (!(value in taskIndex.value)) {
      validateResult.value.push([
        name,
        `${prop} not exists in task index`,
        value
      ])
      return
    }
  } else if (value instanceof Array) {
    if (!checkRect(value)) {
      validateResult.value.push([
        name,
        `${prop} should be true | string | Rect`,
        value
      ])
      return
    }
  } else {
    validateResult.value.push([
      name,
      `${prop} should be true | string | Rect`,
      value
    ])
    return
  }
}

function checkOffset(name: string, value: unknown | undefined, prop: string) {
  if (value === undefined) {
    return
  }
  if (!checkRect(value)) {
    validateResult.value.push([name, `${prop} should be Rect`, value])
    return
  }
}

function checkUInt(name: string, value: unknown | undefined, prop: string) {
  if (value === undefined) {
    return
  }
  if (typeof value !== 'number') {
    validateResult.value.push([name, `${prop} should be number`, value])
    return
  }
  if (value < 0) {
    validateResult.value.push([name, `${prop} should be non-negative`, value])
    return
  }
  if (Math.floor(value) !== value) {
    validateResult.value.push([name, `${prop} should be integer`, value])
    return
  }
}

function checkSingleKey(
  name: string,
  value: unknown | undefined,
  prop: string
) {
  if (typeof value !== 'number') {
    validateResult.value.push([name, `${prop} should be number`, value])
    return
  }
  if (value <= 0 || value >= 128) {
    validateResult.value.push([
      name,
      `${prop} should be inside [1, 127]`,
      value
    ])
    return
  }
  if (Math.floor(value) !== value) {
    validateResult.value.push([name, `${prop} should be integer`, value])
    return
  }
}

function checkKey(name: string, value?: unknown) {
  if (typeof value === 'number') {
    checkSingleKey(name, value, 'key')
  } else if (value instanceof Array) {
    for (const [idx, dur] of value.entries()) {
      checkSingleKey(name, dur, `key[${idx}]`)
    }
  } else {
    validateResult.value.push([name, 'key should be number | number[]', value])
  }
}

function checkPackageEntry(name: string, entry?: unknown) {
  if (entry === undefined) {
    return
  }
  if (typeof entry !== 'string') {
    validateResult.value.push([name, 'package should be string', entry])
    return
  }
  if (
    !/^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*\/[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*$/.test(
      entry
    )
  ) {
    validateResult.value.push([
      name,
      'package should match /^[a-zA-Z0-9]+(.[a-zA-Z0-9]+)*/[a-zA-Z0-9]+(.[a-zA-Z0-9]+)*$/',
      entry
    ])
    return
  }
}

function checkPackage(name: string, entry?: unknown) {
  if (entry === undefined) {
    return
  }
  if (typeof entry !== 'string') {
    validateResult.value.push([name, 'package should be string', entry])
    return
  }
  if (!/^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*$/.test(entry)) {
    validateResult.value.push([
      name,
      'package should match /^[a-zA-Z0-9]+(.[a-zA-Z0-9]+)*$/',
      entry
    ])
    return
  }
}

function checkAction(name: string, task: Task) {
  switch (task.action ?? 'DoNothing') {
    case 'Click':
      checkTarget(name, task, task.target, 'target')
      checkOffset(name, task.target_offset, 'target_offset')
      break
    case 'Swipe':
      checkTarget(name, task, task.begin, 'begin')
      checkOffset(name, task.begin_offset, 'begin_offset')
      checkTarget(name, task, task.end, 'end')
      checkOffset(name, task.end_offset, 'end_offset')
      checkUInt(name, task.duration, 'duration')
      break
    case 'Key':
      checkKey(name, task.key)
      break
    case 'StartApp':
      checkPackageEntry(name, task.package)
      break
    case 'StopApp':
      checkPackage(name, task.package)
      break
    case 'Custom':
      checkCustom(name, task.custom_action, 'custom_action')
      break
  }
}

function checkNext(name: string, value: unknown | undefined, prop: string) {
  if (value === undefined) {
    return
  }
  if (typeof value === 'string') {
    if (!(value in taskIndex.value)) {
      validateResult.value.push([
        name,
        `${prop} not exists in task index`,
        value
      ])
      return
    }
  } else if (value instanceof Array) {
    for (const [idx, nxt] of value.entries()) {
      if (typeof nxt !== 'string') {
        validateResult.value.push([
          name,
          `${prop}[${idx}] should be string`,
          nxt
        ])
        return
      }
      if (!(nxt in taskIndex.value)) {
        validateResult.value.push([
          name,
          `${prop}[${idx}] not exists in task index`,
          nxt
        ])
        return
      }
    }
  }
}

function checkWaitFreeze(
  name: string,
  task: Task,
  prop: 'pre_wait_freezes' | 'post_wait_freezes'
) {
  const value = task[prop]
  if (value === undefined) {
    return
  }
  if (typeof value === 'number') {
    checkUInt(name, value, prop)
    return
  }
  if (typeof value !== 'object') {
    validateResult.value.push([
      name,
      `${prop} should be number | WaitFreezes`,
      value
    ])
    return
  }
  checkUInt(name, value.time, `${prop}.time`)
  checkTarget(name, task, value.target, `${prop}.target`)
  checkOffset(name, value.target_offset, `${prop}.target_offset`)
  checkThreshold(name, value.threshold, `${prop}.threshold`)
  checkMethod(name, value.method, `${prop}.method`)
}

function checkTask(name: string, task: Task) {
  checkRecognition(name, task)
  checkAction(name, task)
  checkNext(name, task.next, 'next')
  checkBool(name, task.is_sub, 'is_sub')
  checkBool(name, task.inverse, 'inverse')
  checkUInt(name, task.timeout, 'timeout')
  checkNext(name, task.timeout_next, 'timeout_next')
  checkUInt(name, task.times_limit, 'times_limit')
  checkNext(name, task.runout_next, 'runout_next')
  checkUInt(name, task.pre_delay, 'pre_delay')
  checkUInt(name, task.post_delay, 'post_delay')
  checkBool(name, task.notify, 'notify')
}

export function performValidate() {
  validateResult.value = []
  for (const name in taskIndex.value) {
    const task = getTask(taskIndex.value[name])!
    checkTask(name, task)
  }
}
