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
  }
}

function checkTask(name: string, task: Task) {
  checkRecognition(name, task)
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
