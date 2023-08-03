<script setup lang="ts">
import { NButton, NCode, NInput } from 'naive-ui'
import { ref } from 'vue'

const val = defineModel<unknown>('value', {
  required: true
})

const cache = ref(JSON.stringify(val.value, null, 2))

const editing = ref(false)

function enterEdit() {
  cache.value = JSON.stringify(val.value, null, 2)
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
  <div class="flex flex-col gap-2">
    <template v-if="editing">
      <div class="flex gap-2">
        <NButton @click="trySave"> 保存 </NButton>
        <NButton @click="cancelEdit"> 取消 </NButton>
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
        <NButton @click="enterEdit"> 编辑 </NButton>
      </div>
      <NCode language="json" :code="JSON.stringify(val, null, 2)"></NCode>
    </template>
  </div>
</template>
