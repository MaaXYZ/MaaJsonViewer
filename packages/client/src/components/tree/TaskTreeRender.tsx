import {
  AddOutlined,
  AddPhotoAlternateOutlined,
  CodeOutlined,
  CreateNewFolderOutlined,
  DataObjectOutlined,
  DeleteOutlined,
  FolderOutlined,
  ImageOutlined,
  InsertDriveFileOutlined
} from '@vicons/material'
import { NIcon, NInput, type TreeOption, useDialog } from 'naive-ui'

import {
  onDelete,
  onLeaveRename,
  onNewFolder,
  onNewJson,
  onNewTask,
  onUploadImage
} from './TaskTreeAction'

import { renameInto, renameKey } from '@/data'
import { type PathKey, path } from '@/filesystem'

import AutoFocusInput from '@/components/atomic/AutoFocusInput.vue'
import IconButton from '@/components/atomic/IconButton.vue'

export function renderLabel({ option }: { option: TreeOption }) {
  const key = option.key as PathKey

  if (renameKey.value === key) {
    return (
      <div class="flex items-center">
        <AutoFocusInput
          value={renameInto.value ?? ''}
          onUpdate:value={v => {
            renameInto.value = v
          }}
          onBlur={() => {
            onLeaveRename()
          }}
        ></AutoFocusInput>
      </div>
    )
  }

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
    } else if (file.endsWith('.json')) {
      return (
        <NIcon>
          <CodeOutlined></CodeOutlined>
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
        <IconButton
          icon={AddPhotoAlternateOutlined}
          onClick={() => {
            onUploadImage(dialog, key)
          }}
        ></IconButton>
        <IconButton
          icon={AddOutlined}
          onClick={() => {
            onNewJson(key)
          }}
        ></IconButton>
        <IconButton
          icon={CreateNewFolderOutlined}
          onClick={() => {
            onNewFolder(key)
          }}
        ></IconButton>
        {/* <IconButton
          icon={DeleteOutlined}
          onClick={() => {
            onDelete(key)
          }}
        ></IconButton> */}
      </div>
    )
  } else {
    const [dir, file, hash] = path.divide(key)
    if (!hash) {
      return (
        <div class="flex gap-2 mr-2">
          {file.endsWith('.json') ? (
            <IconButton
              icon={AddOutlined}
              onClick={() => {
                onNewTask(dir, file)
              }}
            ></IconButton>
          ) : (
            []
          )}
          <IconButton
            icon={DeleteOutlined}
            onClick={() => {
              onDelete(key)
            }}
          ></IconButton>
        </div>
      )
    } else {
      return (
        <div class="flex gap-2 mr-2">
          <IconButton
            icon={DeleteOutlined}
            onClick={() => {
              onDelete(key)
            }}
          ></IconButton>
        </div>
      )
    }
  }
}
