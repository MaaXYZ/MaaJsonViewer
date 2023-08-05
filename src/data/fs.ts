import { type TaskData } from '@/data'
import {
  Util,
  type DirEntry,
  type FS,
  type PathSegment,
  type FileEntry
} from '@/fs'
import { Persis } from '@/persis'
import type { TreeOption } from 'naive-ui'
import { computed } from 'vue'

export const fs = new Persis<FS | null>(null)

function buildFSTree(): TreeOption | null {
  const f = fs.now()
  if (f.value === null) {
    return null
  }

  const buildFileEntry = (sg: PathSegment, e: FileEntry): TreeOption => {
    const curSeg = [...sg, e.name]
    if (e.name.endsWith('.json')) {
      const key = Util.fileseg2key(curSeg)
      const obj = JSON.parse(e.data!) as TaskData
      return {
        key,
        label: e.name,
        children: Object.keys(obj)
          .map(name => ({
            key: Util.pathjoin(sg, e.name, name!),
            label: name!
          }))
          .sort((a, b) => a.key.localeCompare(b.key))
      }
    } else {
      return {
        key: Util.fileseg2key(curSeg),
        label: e.name
      }
    }
  }

  const buildDirEntry = (sg: PathSegment, e: DirEntry): TreeOption => {
    const curSeg = [...sg, e.name].filter(x => x)
    return {
      key: Util.dirseg2key(curSeg),
      label: e.name,
      children: [
        ...e.dir.map(se => {
          return buildDirEntry(curSeg, se)
        }),
        ...e.file.map(se => {
          return buildFileEntry(curSeg, se)
        })
      ]
    }
  }

  return buildDirEntry([], f.value.root)
}

export const fsTree = computed(buildFSTree)
