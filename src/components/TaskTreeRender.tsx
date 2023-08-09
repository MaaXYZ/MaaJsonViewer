import {
  AddOutlined,
  CreateNewFolderOutlined,
  DataObjectOutlined,
  DeleteOutlined,
  FolderOutlined,
  ImageOutlined,
  InsertDriveFileOutlined
} from '@vicons/material'
import {
  NButton,
  NIcon,
  NInput,
  NSwitch,
  type TreeOption,
  useDialog
} from 'naive-ui'
import { computed, ref } from 'vue'

import { deleteTask, setTask, taskIndex } from '@/data'
import { type PathKey, fs, path } from '@/filesystem'

export function renderLabel({ option }: { option: TreeOption }) {
  const key = option.key as PathKey

  if (!path.key_is_dir(key)) {
    const [dir, file, hash] = path.divide(key)
    if (hash) {
      return <span>{hash}</span>
    } else {
      if (file.endsWith('.json')) {
        return <span class=" text-green-600">{file}</span>
      } else {
        return <span>{file}</span>
      }
    }
  } else {
    return <span>{option.key === '/' ? '[ROOT]' : option.label}</span>
  }
}

export function renderPrefix({ option }: { option: TreeOption }) {
  const key = option.key as PathKey

  if (key.endsWith('/')) {
    return (
      <NIcon>
        <FolderOutlined></FolderOutlined>
      </NIcon>
    )
  } else {
    const [dir, file, hash] = path.divide(key)
    if (hash) {
      return (
        <NIcon>
          <DataObjectOutlined></DataObjectOutlined>
        </NIcon>
      )
    } else if (file.endsWith('.png')) {
      return (
        <NIcon>
          <ImageOutlined></ImageOutlined>
        </NIcon>
      )
    } else {
      return (
        <NIcon>
          <InsertDriveFileOutlined></InsertDriveFileOutlined>
        </NIcon>
      )
    }
  }
}

export function renderSuffix({ option }: { option: TreeOption }) {
  const dialog = useDialog()

  const key = option.key as PathKey
  if (path.key_is_dir(key)) {
    return (
      <div class="flex gap-2 mr-2">
        <NButton
          text
          onClick={e => {
            e.stopPropagation()

            const name = ref<string>('')
            const nameWithSfx = computed(() =>
              name.value.endsWith('.json') ? name.value : `${name.value}.json`
            )
            const dir = fs.tree.traceDir(fs.tree.root, key)
            const pathExists = computed(() => {
              return !!fs.tree.traceFile(dir, nameWithSfx.value)
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
                      fs.tree.traceFile(dir, nameWithSfx.value, '{}')
                      dlg.destroy()
                    }
                  }}
                >
                  确认
                </NButton>
              )
            })
          }}
        >
          {{
            default: () => (
              <NIcon>
                <AddOutlined></AddOutlined>
              </NIcon>
            )
          }}
        </NButton>
        <NButton
          text
          onClick={e => {
            e.stopPropagation()

            const name = ref<string>('')
            const p = computed(() => path.join(key, name.value))
            const pathExists = computed(() => {
              return !!fs.tree.traceDir(fs.tree.root, p.value)
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
                      fs.tree.traceDir(fs.tree.root, p.value, true)
                      dlg.destroy()
                    }
                  }}
                >
                  确认
                </NButton>
              )
            })
          }}
        >
          {{
            default: () => (
              <NIcon>
                <CreateNewFolderOutlined></CreateNewFolderOutlined>
              </NIcon>
            )
          }}
        </NButton>
      </div>
    )
  } else {
    const [dir, file, hash] = path.divide(key)
    if (!hash) {
      const isJson = file.endsWith('.json')
      return (
        <div class="flex gap-2 mr-2">
          {isJson ? (
            <NButton
              text
              onClick={e => {
                e.stopPropagation()

                for (let i = 0; ; i++) {
                  const name = `__NewTask${i}`
                  if (name in taskIndex.value) {
                    continue
                  }
                  setTask(path.joinkey(dir, file, name), {})
                  break
                }
              }}
            >
              {{
                default: () => (
                  <NIcon>
                    <AddOutlined></AddOutlined>
                  </NIcon>
                )
              }}
            </NButton>
          ) : (
            []
          )}
          <NButton
            text
            onClick={e => {
              e.stopPropagation()

              const remRef = ref(true)
              dialog.warning({
                title: '删除文件',
                content: () => {
                  if (isJson) {
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

                  const d = fs.tree.traceDir(fs.tree.root, dir)
                  const obj = JSON.parse(
                    fs.tree.traceFile(d, file)?.value ?? '{}'
                  )
                  for (const name in obj) {
                    deleteTask(taskIndex.value[name], null)
                  }

                  fs.tree.delFile(d, file)

                  fs.history.resume()
                  fs.history.commit()
                }
              })
            }}
          >
            {{
              default: () => (
                <NIcon>
                  <DeleteOutlined></DeleteOutlined>
                </NIcon>
              )
            }}
          </NButton>
        </div>
      )
    }
  }
}
