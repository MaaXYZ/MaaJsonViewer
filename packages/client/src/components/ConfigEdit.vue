<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { NInput } from 'naive-ui'

import { wrapProp } from '@/misc'
import type { Config } from '@/types'

import ClearButton from '@/components/atomic/ClearButton.vue'
import FormLayout from '@/layout/FormLayout.vue'

const props = defineProps<{
  value: Config
}>()

const emits = defineEmits<{
  'update:value': [Config]
}>()

const config = useVModel(props, 'value', emits, {
  passive: true,
  deep: true
})

const fw = wrapProp(config, 'maaframework')
const adb = wrapProp(fw, 'adb')
const address = wrapProp(fw, 'address')
</script>

<template>
  <div class="flex flex-col gap-2">
    <span class="font-bold">下列配置需要重启才能生效</span>
    <FormLayout>
      <ClearButton propkey="adb" v-model:value="adb"> ADB路径 </ClearButton>
      <NInput v-model:value="adb" placeholder="adb"></NInput>
      <ClearButton propkey="address" v-model:value="address">
        连接地址
      </ClearButton>
      <NInput v-model:value="address" placeholder="127.0.0.1:5555"></NInput>
    </FormLayout>
  </div>
</template>
