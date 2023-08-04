import {
  commitDelete,
  fileData,
  folderData,
  isModified,
  taskData
} from '@/data'
import {
  AddOutlined,
  CreateNewFolderOutlined,
  DataObjectOutlined,
  DeleteOutlined,
  FolderOutlined,
  InsertDriveFileOutlined
} from '@vicons/material'
import { NButton, NIcon, useDialog, type TreeOption, NInput } from 'naive-ui'
import { computed, ref } from 'vue'

export function renderLabel({ option }: { option: TreeOption }) {
  const label = option.label!
  const text = isModified(label) ? label + '*' : label
  if (label.endsWith('.json')) {
    return <span class=" text-green-600">{text}</span>
  } else {
    return <span>{text}</span>
  }
}

export function renderPrefix({ option }: { option: TreeOption }) {
  const key = option.key as string

  if (key.endsWith('/')) {
    if (key.startsWith('@')) {
      return (
        <NIcon>
          <FolderOutlined></FolderOutlined>
        </NIcon>
      )
    } else {
      return (
        <NIcon>
          <InsertDriveFileOutlined></InsertDriveFileOutlined>
        </NIcon>
      )
    }
  } else {
    return (
      <NIcon>
        <DataObjectOutlined></DataObjectOutlined>
      </NIcon>
    )
  }
}

export function renderSuffix({ option }: { option: TreeOption }) {
  const dialog = useDialog()

  const key = option.key as string
  if (key.endsWith('/')) {
    if (key.startsWith('@')) {
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
              const path = computed(
                () => `${key.replace(/^@/, '')}${nameWithSfx.value}/`
              )
              const pathExists = computed(() => {
                return !fileData.data.every(
                  k => `/${k.join('/')}/` !== path.value
                )
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
                        fileData.data.push(path.value.split('/').filter(x => x))
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
              const path = computed(() => `${key}${name.value}/`)
              const pathExists = computed(() => {
                return !folderData.data.every(
                  k => `@/${k.join('/')}/` !== path.value
                )
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
                      console.log(path.value)
                      if (!pathExists.value) {
                        folderData.data.push(
                          path.value
                            .replace(/^@/, '')
                            .split('/')
                            .filter(x => x)
                        )
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
    } else if (key.endsWith('.json/')) {
      return (
        <div class="flex gap-2 mr-2">
          <NButton
            text
            onClick={e => {
              e.stopPropagation()
              for (let i = 0; ; i++) {
                const name = `__NewTask${i}`
                if (name in taskData.data) {
                  continue
                }
                taskData.data[name] = {
                  editor_info: {
                    path: key
                  }
                }
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
          <NButton
            text
            onClick={e => {
              e.stopPropagation()
              dialog.warning({
                title: '删除json',
                content: `是否要删除${key.split('/').slice(-2)[0]}?`,
                positiveText: '是',
                onPositiveClick: () => {
                  fileData.data = fileData.data.filter(
                    keys => `/${keys.join('/')}/` !== key
                  )
                  for (const name in taskData.data) {
                    const task = taskData.data[name]
                    if (task.editor_info.path === key) {
                      commitDelete(name, null)
                    }
                  }
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
