import {
  CodeOutlined,
  DataObjectOutlined,
  FolderOutlined,
  ImageOutlined,
  InsertDriveFileOutlined
} from '@vicons/material'
import { NIcon, type TreeOption } from 'naive-ui'

import { onLeaveRename } from './TaskTreeAction'

import { active, renameInto, renameKey } from '@/data'
import { type PathKey, path } from '@/filesystem'

import AutoFocusInput from '@/components/atomic/AutoFocusInput.vue'

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

  const actived = active.value === key

  if (!path.key_is_dir(key)) {
    const [dir, file, hash] = path.divide(key)
    if (hash) {
      return <span class={actived ? 'underline' : ''}>{hash}</span>
    } else {
      if (file.endsWith('.json')) {
        return (
          <span class={actived ? 'underline text-green-600' : 'text-green-600'}>
            {file}
          </span>
        )
      } else {
        return <span class={actived ? 'underline' : ''}>{file}</span>
      }
    }
  } else {
    return (
      <span class={actived ? 'underline' : ''}>
        {option.key === '/' ? '[ROOT]' : option.label}
      </span>
    )
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
