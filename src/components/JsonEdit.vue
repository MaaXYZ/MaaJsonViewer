<script setup lang="ts">
import { NButton, NCode, NInput } from 'naive-ui'
import { ref } from 'vue'

const val = defineModel<unknown>('value', {
  required: true
})

function stringify(v: unknown) {
  return JSON.stringify(v, null, 4)
}

const cache = ref(stringify(val.value))

const editing = ref(false)

function enterEdit() {
  cache.value = stringify(val.value)
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
        <NButton @click="trySave"> 💾 </NButton>
        <NButton @click="cancelEdit"> 🗙 </NButton>
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
        <NButton @click="enterEdit"> ✏️ </NButton>
      </div>
      <NCode language="json" :code="stringify(val)"></NCode>
    </template>
  </div>
</template>
