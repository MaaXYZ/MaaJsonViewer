import { commitDelete } from '@/data'
import { fs } from '@/data/fs'
import { setTask, taskIndex } from '@/data/task'
import { Util } from '@/fs'
import {
  AddOutlined,
  CreateNewFolderOutlined,
  DataObjectOutlined,
  DeleteOutlined,
  FolderOutlined,
  InsertDriveFileOutlined
} from '@vicons/material'
import {
  NButton,
  NIcon,
  useDialog,
  type TreeOption,
  NInput,
  NSwitch
} from 'naive-ui'
import { computed, ref } from 'vue'

export function renderLabel({ option }: { option: TreeOption }) {
  const key = option.key as string

  if (!key.endsWith('/')) {
    const [dir, file, hash] = Util.pathdiv(key)
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
    return <span>{option.label}</span>
  }
}

export function renderPrefix({ option }: { option: TreeOption }) {
  const key = option.key as string

  if (key.endsWith('/')) {
    return (
      <NIcon>
        <FolderOutlined></FolderOutlined>
      </NIcon>
    )
  } else {
    const [dir, file, hash] = Util.pathdiv(key)
    if (hash) {
      return (
        <NIcon>
          <DataObjectOutlined></DataObjectOutlined>
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

  const key = option.key as string
  if (key.endsWith('/')) {
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
            const path = computed(() => Util.pathjoin(key, nameWithSfx.value))
            const pathExists = computed(() => {
              return !!fs.now().value?.getFile(path.value)
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
                      fs.change(draft => {
                        draft?.addTextFileViaEntry(
                          draft.trace(key)!,
                          nameWithSfx.value,
                          '{}'
                        )
                      })
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
            const path = computed(() => Util.pathjoin(key, name.value))
            const pathExists = computed(() => {
              return !!fs.now().value?.trace(path.value)
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
                      fs.change(draft => {
                        draft?.trace(path.value, true)
                      })
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
    const [dir, file, hash] = Util.pathdiv(key)
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
                  setTask(Util.pathjoin(dir, file, name), {})
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
                  const path = Util.pathjoin(dir, file)

                  fs.enterBlock()

                  const obj = JSON.parse(
                    fs.now().value?.getFile(path)?.data ?? '{}'
                  )
                  for (const name in obj) {
                    commitDelete(taskIndex.value[name], null)
                  }
                  fs.change(draft => {
                    draft!.removeFile(path)
                  })

                  fs.leaveBlock()
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
