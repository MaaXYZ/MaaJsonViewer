<script setup lang="ts">
import {
  ChangeCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  PendingOutlined,
  PlayArrowOutlined
} from '@vicons/material'
import { NButton, NCard, NCheckbox, NIcon } from 'naive-ui'
import { onActivated, onDeactivated, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import * as api from '@/api'
import { config, taskIndex } from '@/data'
import { DispatcherStatus, type TaskRunInfo } from '@/types'

import ConfigEdit from '@/components/ConfigEdit.vue'
import NavigationButtons from '@/components/NavigationButtons.vue'
import ArrayEdit from '@/components/array/ArrayEdit.vue'
import ClearButton from '@/components/atomic/ClearButton.vue'
import MonitorView from '@/components/framework/MonitorView.vue'
import SingleNavigateEdit from '@/components/task/SingleNavigateEdit.vue'
import FormLayout from '@/layout/FormLayout.vue'
import MainLayout from '@/layout/MainLayout.vue'

const alive = ref(false)

onActivated(() => {
  alive.value = true
})

onDeactivated(() => {
  alive.value = false
})

const router = useRouter()
const runInfo = ref<TaskRunInfo[]>([])

let instance: WebSocket
const inited = ref(false)

onMounted(async () => {
  inited.value = false
  instance = await api.instance()
  instance.onmessage = ev => {
    const obj = JSON.parse(ev.data) as {
      type: 'inited' | 'callback' | 'status'
      msg: string
      detail: string
      task: string
      status: DispatcherStatus
    }
    switch (obj.type) {
      case 'inited':
        inited.value = true
        break
      case 'callback':
        console.log(obj.msg, JSON.parse(obj.detail))
        break
      case 'status': {
        const idx = runInfo.value.findIndex(x => x.task === obj.task)
        if (idx !== -1) {
          runInfo.value[idx].status = translateStatus(obj.status)
        }
        break
      }
    }
  }
})

function translateStatus(status: DispatcherStatus) {
  switch (status) {
    case DispatcherStatus.Invalid:
      return 'skipped'
    case DispatcherStatus.Pending:
      return 'pending'
    case DispatcherStatus.Started:
      return 'running'
    case DispatcherStatus.Completed:
      return 'success'
    case DispatcherStatus.Failed:
      return 'error'
    case DispatcherStatus.Stopped:
      return 'skipped'
  }
}

onUnmounted(() => {
  if (instance) {
    instance.close()
  }
})

async function tryStart() {
  if (inited) {
    instance.send(
      JSON.stringify({
        action: 'start',
        task: runInfo.value
          .filter(x => x.enable && x.task in taskIndex.value)
          .map(x => x.task)
      })
    )
  }
}
</script>

<template>
  <MainLayout>
    <template #action>
      <NavigationButtons></NavigationButtons>
      <NButton @click="tryStart" :disabled="!inited">
        <template #icon>
          <NIcon>
            <PlayArrowOutlined></PlayArrowOutlined>
          </NIcon>
        </template>
      </NButton>
    </template>

    <div class="flex gap-2">
      <NCard>
        <div class="flex flex-col gap-2 items-start">
          <ConfigEdit v-if="config" v-model:value="config"></ConfigEdit>
          <FormLayout>
            <ClearButton propkey="" :value="null"> 任务列表 </ClearButton>
            <ArrayEdit
              v-model:value="runInfo"
              type="multi"
              :nullable="true"
              :def="() => ({ task: '', enable: true, status: 'skipped' })"
              :is-t="v => !(v instanceof Array)"
            >
              <template #edit="{ value, update }">
                <div class="flex gap-2 items-center">
                  <NCheckbox
                    :checked="value.enable"
                    @update:checked="
                      v => {
                        update({
                          ...value,
                          enable: v
                        })
                      }
                    "
                  ></NCheckbox>
                  <NButton :disabled="value.status === 'skipped'" text>
                    <!-- 'skipped' | 'pending' | 'running' | 'success' | 'error' -->
                    <template #icon>
                      <NIcon>
                        <PendingOutlined
                          v-if="
                            value.status === 'skipped' ||
                            value.status === 'pending'
                          "
                        ></PendingOutlined>
                        <ChangeCircleOutlined
                          v-else-if="value.status === 'running'"
                        ></ChangeCircleOutlined>
                        <CheckOutlined
                          v-else-if="value.status === 'success'"
                        ></CheckOutlined>
                        <CloseOutlined
                          v-else-if="value.status === 'error'"
                        ></CloseOutlined>
                      </NIcon>
                    </template>
                  </NButton>
                  <SingleNavigateEdit
                    :value="value.task"
                    @update:value="
                      v => {
                        update({
                          ...value,
                          task: v
                        })
                      }
                    "
                  ></SingleNavigateEdit>
                </div>
              </template>
            </ArrayEdit>
          </FormLayout>
        </div>
      </NCard>

      <MonitorView v-if="alive" :width="640" :height="360"></MonitorView>
    </div>
  </MainLayout>
</template>
