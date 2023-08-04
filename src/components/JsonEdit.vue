<script setup lang="ts">
import { NButton, NCode, NInput, NIcon } from 'naive-ui'
import { CheckOutlined, CloseOutlined, EditOutlined } from '@vicons/material'
import { ref, watch } from 'vue'
import * as prettier from 'prettier/standalone'
import babel from 'prettier/plugins/babel'
import estree from 'prettier/plugins/estree'

const val = defineModel<unknown>('value', {
  required: true
})

async function stringify(v: unknown) {
  return await prettier.format(JSON.stringify(v), {
    parser: 'json',
    plugins: [babel, estree],
    tabWidth: 4
  })
}

const cache = ref('')
let counter = 0
let version = 0

watch(
  val,
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
  cache.value = await stringify(val.value)
  editing.value = true
}

function trySave() {
  try {
    val.value = JSON.parse(cache.value)
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
