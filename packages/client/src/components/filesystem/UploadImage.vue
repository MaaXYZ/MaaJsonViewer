<script setup lang="ts">
import {
  NButton,
  NCard,
  NModal,
  NUpload,
  NUploadDragger,
  type UploadCustomRequestOptions,
  type UploadFileInfo
} from 'naive-ui'
import { reactive, ref } from 'vue'

import { type PathKey, fs, path, pool } from '@/filesystem'

const under = ref<PathKey | null>(null)
const show = ref(false)
const fileList = ref<UploadFileInfo[]>([])
const result = reactive<Record<string, ArrayBuffer>>({})

async function fakeRequest({
  file,
  onFinish,
  onError
}: UploadCustomRequestOptions) {
  if (file.name in result) {
    onError()
    return
  }
  if (file.file) {
    const buf = await file.file.arrayBuffer()
    result[file.name] = buf
    onFinish()
  } else {
    onError()
  }
}

function editFS() {
  if (!under.value) {
    return
  }
  fs.scope(() => {
    for (const name in result) {
      fs.tree.writeFile(
        path.joinkey(under.value!, name),
        pool.put(result[name])
      )
    }
  })
  show.value = false
}

function popup(at: PathKey) {
  under.value = at
  show.value = true
}

defineExpose({
  popup
})
</script>

<template>
  <NModal v-model:show="show">
    <NCard style="width: 60vw" title="添加图片">
      <NUpload
        accept="image/png"
        listType="image-card"
        v-model:fileList="fileList"
        :custom-request="fakeRequest"
      >
        <NUploadDragger>上传</NUploadDragger>
      </NUpload>

      <template #action>
        <NButton @click="editFS"> 添加 </NButton>
      </template>
    </NCard>
  </NModal>
</template>
