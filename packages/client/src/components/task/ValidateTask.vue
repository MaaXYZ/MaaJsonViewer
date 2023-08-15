<script setup lang="ts">
import { NCard, NModal } from 'naive-ui'
import { ref } from 'vue'

import { getTask, taskIndex } from '@/data'
import { type PathZip, fs } from '@/filesystem'
import type { Task } from '@/types'

const show = ref(false)
const msg = ref<[string, string, unknown][]>([])

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
    msg.value.push([name, 'roi should be Rect | Rect[]', roi])
    return
  }
  if (roi.length > 0) {
    if (typeof roi[0] === 'number') {
      if (!checkRect(roi)) {
        msg.value.push([name, 'roi should be Rect', roi])
        return
      }
    } else {
      for (const [idx, rc] of roi.entries()) {
        if (!checkRect(rc)) {
          msg.value.push([name, `roi[${idx}] should be Rect`, rc])
          return
        }
      }
    }
  }
}

function checkTemplate(name: string, template: unknown, idx?: number) {
  const prop = idx ? `template[${idx}]` : 'template'
  if (typeof template !== 'string') {
    msg.value.push([name, `${prop} should be string`, template])
    return
  }
  if (!template.endsWith('.png')) {
    msg.value.push([name, `${prop} should be png`, template])
    return
  }
  if (!fs.tree.existsFile(template as PathZip)) {
    msg.value.push([name, `${prop} not exists`, template])
    return
  }
}

function checkThreshold(name: string, threshold: unknown, prop = 'threshold') {
  if (typeof threshold !== 'number') {
    msg.value.push([name, `${prop} should be number`, threshold])
    return
  }
  if (threshold < 0 || threshold > 1) {
    msg.value.push([name, `${prop} should be inside [0, 1]`, threshold])
    return
  }
}

function checkTemplateThreshold(
  name: string,
  template?: unknown,
  threshold?: unknown
) {
  if (template === undefined) {
    msg.value.push([name, 'template is required', undefined])
    return
  }
  if (typeof template === 'string') {
    checkTemplate(name, template)
  } else if (template instanceof Array) {
    for (const [idx, tpl] of template.entries()) {
      checkTemplate(name, tpl, idx)
    }
  } else {
    msg.value.push([name, 'template should be string | string[]', template])
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
      msg.value.push([name, 'threshold should be number | number[]', threshold])
      return
    }

    if (typeof template === 'string' && threshold instanceof Array) {
      msg.value.push([
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
      msg.value.push([
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
    msg.value.push([name, `${prop} should be 1 | 3 | 5`, method])
    return
  }
}

function checkBool(name: string, value: unknown | undefined, prop: string) {
  if (value === undefined) {
    return
  }
  if (typeof value !== 'boolean') {
    msg.value.push([name, `${prop} should be boolean`, value])
    return
  }
}

function checkText(name: string, text?: unknown) {
  if (text === undefined) {
    msg.value.push([name, `text is required`, undefined])
    return
  }
  if (typeof text !== 'string' && !(text instanceof Array)) {
    msg.value.push([name, `text should be string | string[]`, text])
    return
  }
  if (text instanceof Array) {
    for (const [idx, txt] of text.entries()) {
      msg.value.push([name, `text[${idx}] should be string`, txt])
      return
    }
  }
}

function checkReplace(name: string, replace?: unknown) {
  if (replace === undefined) {
    return
  }
  if (!(replace instanceof Array)) {
    msg.value.push([name, 'replace should be TextRepl | TextRepl[]', replace])
    return
  }
  if (replace.length > 0) {
    if (typeof replace[0] === 'string') {
      if (!checkRepl(replace)) {
        msg.value.push([name, 'replace should be TextRepl', replace])
        return
      }
    } else {
      for (const [idx, rpl] of replace.entries()) {
        if (!checkRepl(rpl)) {
          msg.value.push([name, `replace[${idx}] should be TextRepl`, rpl])
          return
        }
      }
    }
  }
}

function checkCustom(name: string, value: unknown | undefined, prop: string) {
  if (value === undefined) {
    msg.value.push([name, `${prop} is required`, undefined])
    return
  }
  if (typeof value !== 'string') {
    msg.value.push([name, `text should be string`, undefined])
    return
  }
  if (value.length === 0) {
    msg.value.push([name, `text should be non-empty`, undefined])
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
  prop: 'target' | 'begin' | 'end'
) {
  const value = task[prop]
  if (value === undefined || value === true) {
    if (task.inverse) {
      msg.value.push([
        name,
        `${prop} shouldn't be true when inverse is set`,
        value
      ])
      return
    }
    if (task.recognition ?? 'DirectHit' === 'DirectHit') {
      msg.value.push([
        name,
        `${prop} shouldn't be true when recognition is 'DirectHit'`,
        value
      ])
      return
    }
  } else if (typeof value === 'string') {
    if (!(value in taskIndex.value)) {
      msg.value.push([name, `${prop} not exists in task index`, value])
      return
    }
  } else if (value instanceof Array) {
    if (!checkRect(value)) {
      msg.value.push([name, `${prop} should be true | string | Rect`, value])
      return
    }
  } else {
    msg.value.push([name, `${prop} should be true | string | Rect`, value])
    return
  }
}

function checkOffset(name: string, value: unknown | undefined, prop: string) {
  if (value === undefined) {
    return
  }
  if (!checkRect(value)) {
    msg.value.push([name, `${prop} should be Rect`, value])
    return
  }
}

function checkDuration(name: string, value?: unknown) {
  if (value === undefined) {
    return
  }
  if (typeof value !== 'number') {
    msg.value.push([name, 'duration should be Rect', value])
    return
  }
  if (value <= 0) {
    msg.value.push([name, 'duration should be positive', value])
    return
  }
  if (Math.floor(value) !== value) {
    msg.value.push([name, 'duration should be integer', value])
    return
  }
}

function checkSingleKey(
  name: string,
  value: unknown | undefined,
  prop: string
) {
  if (typeof value !== 'number') {
    msg.value.push([name, `${prop} should be number`, value])
    return
  }
  if (value <= 0 || value >= 128) {
    msg.value.push([name, `${prop} should be inside [1, 127]`, value])
    return
  }
  if (Math.floor(value) !== value) {
    msg.value.push([name, `${prop} should be integer`, value])
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
    msg.value.push([name, 'key should be number | number[]', value])
  }
}

function checkPackageEntry(name: string, entry?: unknown) {
  if (entry === undefined) {
    return
  }
  if (typeof entry !== 'string') {
    msg.value.push([name, 'package should be string', entry])
    return
  }
  if (
    !/^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*\/[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*$/.test(
      entry
    )
  ) {
    msg.value.push([
      name,
      'package should match /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*\/[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*$/',
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
    msg.value.push([name, 'package should be string', entry])
    return
  }
  if (!/^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*$/.test(entry)) {
    msg.value.push([
      name,
      'package should match /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*$/',
      entry
    ])
    return
  }
}

function checkAction(name: string, task: Task) {
  switch (task.action ?? 'DoNothing') {
    case 'Click':
      checkTarget(name, task, 'target')
      checkOffset(name, task.target_offset, 'target_offset')
      break
    case 'Swipe':
      checkTarget(name, task, 'begin')
      checkOffset(name, task.begin_offset, 'begin_offset')
      checkTarget(name, task, 'end')
      checkOffset(name, task.end_offset, 'end_offset')
      checkDuration(name, task.duration)
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

function checkTask(name: string, task: Task) {
  checkRecognition(name, task)
  checkAction(name, task)
}

function performValidate() {
  show.value = true
  msg.value = []
  for (const name in taskIndex.value) {
    const task = getTask(taskIndex.value[name])!
    checkTask(name, task)
  }
}

defineExpose({
  performValidate
})
</script>

<template>
  <NModal v-model:show="show">
    <NCard style="width: 60vw"> {{ msg }} </NCard>
  </NModal>
</template>
