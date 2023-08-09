import type { TreeOption } from 'naive-ui'
import { computed } from 'vue'

import { type PathSegments, fs, path } from '@/filesystem'
import type { TaskData } from '@/types'

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
        key: path.seg_to_path([...dir, name] as PathSegments),
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
    (dir, name, content, param) => {
      param.children?.push({
        key: path.joinkey(dir, name),
        label: name
      })
    },
    rootOption
  )

  return rootOption
})
