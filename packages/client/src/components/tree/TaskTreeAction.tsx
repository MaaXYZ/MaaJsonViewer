import {
  type DialogApi,
  NButton,
  NUpload,
  NUploadDragger,
  type UploadCustomRequestOptions,
  type UploadFileInfo
} from 'naive-ui'
import { ref } from 'vue'

import {
  delTask,
  filterTask,
  filterTemplate,
  getTask,
  renameInto,
  renameKey,
  setTask,
  taskIndex
} from '@/data'
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
    title: '添加图片',
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
            fs.tree.writeFile(path.joinkey(key, name), pool.put(result[name]))
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

export function onNewFolder(key: PathKey) {
  for (let i = 0; ; i++) {
    const name = `__NewFolder${i}`
    const to = path.joinkey(key, name)
    if (fs.tree.existsDir(to)) {
      continue
    }
    fs.tree.touchDir(to)
    break
  }
}

export function onNewJson(key: PathKey) {
  for (let i = 0; ; i++) {
    const name = `__NewJson${i}.json`
    const to = path.joinkey(key, name)
    if (fs.tree.existsFile(to)) {
      continue
    }
    fs.tree.writeFile(to, '{}')
    break
  }
}

export function onNewTask(key: PathKey) {
  const [dir, file] = path.divide(key)
  for (let i = 0; ; i++) {
    const name = `__NewTask${i}`
    if (name in taskIndex.value) {
      continue
    }
    setTask(path.joinkey(dir, file, name), {})
    break
  }
}

export function onDelete(key: PathKey) {
  const [dir, file, hash] = path.divide(key)
  if (path.key_is_dir(key)) {
    // TODO: not supported yet
  } else {
    if (hash) {
      fs.scope(() => {
        filterTask(temp => {
          return temp === hash ? null : temp
        })
        delTask(taskIndex.value[hash])
      })
    } else {
      const isJson = file.endsWith('.json')
      const p = path.joinkey(dir, file)

      fs.scope(() => {
        if (isJson) {
          const obj = JSON.parse(fs.tree.readFile(p) ?? '{}')
          for (const name in obj) {
            filterTask(temp => {
              return temp === name ? null : temp
            })
            delTask(taskIndex.value[name])
          }
        }
        fs.tree.removeFile(p)
      })
    }
  }
}

export function onEnterRename(key: PathKey) {
  if (key === '/') {
    return
  }
  const [, file, hash] = path.divide(key)
  renameKey.value = key
  renameInto.value = hash ?? file
}

export function onLeaveRename() {
  const key = renameKey.value as PathKey | null
  renameKey.value = null
  if (!key) {
    return
  }
  if (path.key_is_dir(key)) {
    const [dir, file] = path.divide(key)
    const tk = path.joinkey(dir, renameInto.value!)
    const zf = path.seg_to_zip(path.to_seg(key)) + '/'
    const tf = path.seg_to_zip(path.to_seg(tk)) + '/'

    fs.scope(() => {
      fs.tree.renameDir(key, tk)
      filterTemplate(temp => {
        return temp.startsWith(zf) ? temp.replace(zf, tf) : temp
      })
    })
  } else {
    const [dir, file, hash] = path.divide(key)
    if (hash) {
      const into = renameInto.value!
      const to = path.joinkey(dir, file, into)
      fs.scope(() => {
        filterTask(temp => {
          return temp === hash ? into : temp
        })
        const task = getTask(key)
        if (task) {
          delTask(key)
          setTask(to, task)
        }
      })
    } else {
      const to = path.joinkey(dir, renameInto.value!)
      fs.scope(() => {
        fs.tree.renameFile(key, to)

        if (file.endsWith('.png')) {
          const zf = path.seg_to_zip(path.to_seg(key))
          const zt = path.seg_to_zip(path.join(dir, renameInto.value!))

          filterTemplate(temp => {
            return temp === zf ? zt : temp
          })
        }
      })
    }
  }
}
