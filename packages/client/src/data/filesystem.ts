import type { TreeOption, TreeSelectOption } from 'naive-ui'
import { computed, ref } from 'vue'

import {
  type Path,
  type PathKey,
  type PathSegments,
  fs,
  path,
  pool
} from '@/filesystem'
import type { TaskData } from '@/types'

export const expandKey = ref<PathKey[]>(['/' as PathKey])
export const renameKey = ref<string | null>(null)
export const renameInto = ref<string | null>(null)

export function makePngUrl(v: string | null) {
  const fallback = '/favicon-32x32.png'
  if (v && v.endsWith('.png')) {
    // TODO: maybe check?
    const hash = fs.tree.readFile(v as Path)
    if (hash) {
      const url = pool.query(hash)
      if (url) {
        return url
      }
    }
  }
  return fallback
}

export const filesystemTree = computed<TreeOption>(() => {
  const rootOption: TreeOption = {
    key: '/',
    label: '[ROOT]',
    children: []
  }

  fs.tree.travel<TreeOption>(
    fs.tree.root,
    (dir, name, param) => {
      const opt: TreeOption = {
        key: path.dir_to_key(path.seg_to_path([...dir, name] as PathSegments)),
        label: name,
        children: []
      }
      param.children?.push(opt)
      return opt
    },
    (dir, name, content, param) => {
      if (name.endsWith('.json')) {
        const key = path.joinkey(dir, name)
        const obj = JSON.parse(content) as TaskData
        param.children?.push({
          key,
          label: name,
          children: Object.keys(obj)
            .sort()
            .map(hash => ({
              key: path.joinkey(dir, name, hash),
              label: hash
            }))
        })
      } else {
        param.children?.push({
          key: path.joinkey(dir, name),
          label: name
        })
      }
    },
    rootOption
  )

  return rootOption
})

export const filesystemDirectoryTree = computed<TreeSelectOption>(() => {
  const rootOption: TreeSelectOption = {
    key: '/',
    label: '[ROOT]',
    children: []
  }

  fs.tree.travel<TreeSelectOption>(
    fs.tree.root,
    (dir, name, param) => {
      const opt: TreeSelectOption = {
        key: path.dir_to_key(path.seg_to_path([...dir, name] as PathSegments)),
        label: name,
        children: []
      }
      param.children?.push(opt)
      return opt
    },
    (dir, name, content, param) => {},
    rootOption
  )

  return rootOption
})
