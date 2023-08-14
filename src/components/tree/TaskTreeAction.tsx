import {
  type DialogApi,
  NButton,
  NInput,
  NSwitch,
  NUpload,
  NUploadDragger,
  type UploadCustomRequestOptions,
  type UploadFileInfo
} from 'naive-ui'
import { computed, ref } from 'vue'

import { deleteTask, setTask, taskIndex } from '@/data'
import { type PathKey, type PathSegments, fs, path, pool } from '@/filesystem'

export function onUploadImage(dialog: DialogApi, key: PathKey) {
  const fl = ref<UploadFileInfo[]>([])
  const result: Record<string, ArrayBuffer> = {}
  const fakeRequest = async ({
    file,
    onFinish,
    onError
  }: UploadCustomRequestOptions) => {
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
  const dlg = dialog.create({
    title: '添加文件',
    content: () => (
      <NUpload
        accept="image/png"
        listType="image-card"
        fileList={fl.value}
        onUpdateFileList={data => {
          fl.value = data
        }}
        customRequest={fakeRequest}
      >
        <NUploadDragger>上传</NUploadDragger>
      </NUpload>
    ),
    action: () => (
      <NButton
        onClick={() => {
          fs.history.pause()

          for (const name in result) {
            fs.tree.writeBinary(path.joinkey(key, name), pool.put(result[name]))
          }

          fs.history.resume()
          fs.history.commit()

          dlg.destroy()
        }}
      >
        添加
      </NButton>
    )
  })
}

export function onNewFolder(dialog: DialogApi, key: PathKey) {
  const name = ref<string>('')
  const p = computed(() => path.joinkey(key, name.value))
  const pathExists = computed(() => {
    return !!fs.tree.existsDir(p.value)
  })

  const dlg = dialog.create({
    title: '创建目录',
    content: () => (
      <NInput
        value={name.value}
        onUpdateValue={v => (name.value = v)}
        placeholder={'文件名'}
      ></NInput>
    ),
    action: () => (
      <NButton
        disabled={pathExists.value}
        onClick={() => {
          if (!pathExists.value) {
            fs.tree.touchDir(p.value)
            dlg.destroy()
          }
        }}
      >
        确认
      </NButton>
    )
  })
}

export function onNewJson(dialog: DialogApi, key: PathKey) {
  const name = ref<string>('')
  const nameWithSfx = computed(() =>
    name.value.endsWith('.json') ? name.value : `${name.value}.json`
  )
  const to = computed(() => path.joinkey(key, nameWithSfx.value))
  const pathExists = computed(() => {
    return fs.tree.existsFile(to.value)
  })
  const dlg = dialog.create({
    title: '创建json',
    content: () => (
      <NInput
        value={name.value}
        onUpdateValue={v => (name.value = v)}
        placeholder={'文件名'}
      ></NInput>
    ),
    action: () => (
      <NButton
        disabled={!name.value || pathExists.value}
        onClick={() => {
          if (!pathExists.value) {
            fs.tree.writeFile(to.value, '{}')
            dlg.destroy()
          }
        }}
      >
        确认
      </NButton>
    )
  })
}

export function onNewTask(dir: PathSegments, file: string) {
  for (let i = 0; ; i++) {
    const name = `__NewTask${i}`
    if (name in taskIndex.value) {
      continue
    }
    setTask(path.joinkey(dir, file, name), {})
    break
  }
}

export function onDeleteFile(
  dialog: DialogApi,
  dir: PathSegments,
  file: string
) {
  const remRef = ref(true)
  dialog.warning({
    title: '删除文件',
    content: () => {
      if (file.endsWith('.json')) {
        return (
          <div class="flex flex-col gap-2">
            <span>{`是否要删除 ${file} ?`}</span>
            <div class="flex gap-2">
              <span>移除所有引用</span>
              <NSwitch
                value={remRef.value}
                onUpdate:value={v => (remRef.value = v)}
              ></NSwitch>
            </div>
          </div>
        )
      } else {
        return (
          <div class="flex flex-col gap-2">
            <span>{`是否要删除 ${file} ?`}</span>
          </div>
        )
      }
    },
    positiveText: '是',
    onPositiveClick: () => {
      const p = path.joinkey(dir, file)

      fs.history.pause()

      const obj = JSON.parse(fs.tree.readFile(p) ?? '{}')
      for (const name in obj) {
        deleteTask(taskIndex.value[name], null)
      }
      fs.tree.removeFile(p)

      fs.history.resume()
      fs.history.commit()
    }
  })
}
