import { fs } from './fs'
import { computed } from 'vue'

import { Util } from '@/fs'

export const imgIndex = computed(() => {
  const res: string[] = []
  fs.now().value?.enumFile((dir, entry) => {
    if (entry.name.endsWith('.png') && entry.ref) {
      res.push(Util.path2zip(Util.pathjoin(dir, entry.name)))
    }
  })
  return res
})
