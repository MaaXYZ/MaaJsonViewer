import { computed } from 'vue'

import { type FileContentRef, type PathZip, fs, path } from '@/filesystem'

export const imageIndex = computed(() => {
  const res: Record<PathZip, FileContentRef> = {}
  fs.tree.travel(
    fs.tree.root,
    () => void 0,
    (dir, name, ref) => {
      if (name.endsWith('.png')) {
        res[path.seg_to_zip(path.join(dir, name))] = ref
      }
    },
    void 0
  )
  return res
})
