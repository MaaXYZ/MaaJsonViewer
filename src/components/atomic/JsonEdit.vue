<script setup lang="ts">
import { CheckOutlined, CloseOutlined, EditOutlined } from '@vicons/material'
import { useVModel } from '@vueuse/core'
import { NButton, NCode, NIcon, NInput } from 'naive-ui'
import babel from 'prettier/plugins/babel'
import estree from 'prettier/plugins/estree'
import * as prettier from 'prettier/standalone'
import { ref, watch } from 'vue'

const props = defineProps<{
  value: unknown
}>()

const emits = defineEmits<{
  'update:value': [unknown]
}>()

const value = useVModel(props, 'value', emits, {
  passive: true,
  deep: true
})

async function stringify(v: unknown) {
  return await prettier.format(JSON.stringify(v), {
    parser: 'json',
    plugins: [babel, estree],
    tabWidth: 4,
    printWidth: 50
  })
}

const cache = ref('')
let counter = 0
let version = 0

watch(
  value,
  nv => {
    let id = ++counter
    stringify(nv).then(src => {
      if (id > version) {
        version = id
        cache.value = src
      }
    })
  },
  {
    immediate: true,
    deep: true
  }
)

const editing = ref(false)

async function enterEdit() {
  cache.value = await stringify(value.value)
  editing.value = true
}

function trySave() {
  try {
    value.value = JSON.parse(cache.value)
    editing.value = false
  } catch (_err) {}
}

function cancelEdit() {
  editing.value = false
}
</script>

<template>
  <div class="flex flex-col gap-2 p-2">
    <template v-if="editing">
      <div class="flex gap-2">
        <NButton @click="trySave">
          <template #icon>
            <NIcon>
              <CheckOutlined></CheckOutlined>
            </NIcon>
          </template>
        </NButton>
        <NButton @click="cancelEdit">
          <template #icon>
            <NIcon>
              <CloseOutlined></CloseOutlined>
            </NIcon>
          </template>
        </NButton>
      </div>
      <NInput
        type="textarea"
        v-model:value="cache"
        :autosize="{
          minRows: 5,
          maxRows: 10
        }"
      ></NInput>
    </template>
    <template v-else>
      <div class="flex">
        <NButton @click="enterEdit">
          <template #icon>
            <NIcon>
              <EditOutlined></EditOutlined>
            </NIcon>
          </template>
        </NButton>
      </div>
      <NCode language="json" :code="cache" word-wrap></NCode>
    </template>
  </div>
</template>
