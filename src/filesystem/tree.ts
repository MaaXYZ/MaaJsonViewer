import { type Ref, ref, toRef } from 'vue'

import * as path from './path'
import type {
  DirEntry,
  FileContentRef,
  Path,
  PathKey,
  PathSegments
} from './types'

export function useTree() {
  const root: Ref<DirEntry> = ref({
    dir: {},
    file: {},
    bin: {}
  })

  function reset() {
    root.value = {
      dir: {},
      file: {},
      bin: {}
    }
  }

  function traceDir(dir: PathSegments | Path | PathKey, create = false) {
    const segs = dir instanceof Array ? dir : path.to_seg(dir)

    let now: Ref<DirEntry> = root
    for (const seg of segs) {
      if (!(seg in now.value.dir)) {
        if (create) {
          now.value.dir[seg] = {
            dir: {},
            file: {},
            bin: {}
          }
        } else {
          return null
        }
      }
      now = toRef(now.value.dir, seg)
    }

    return now
  }

  function traceFile(
    entry: Ref<DirEntry> | null,
    name: string,
    create: string | null = null
  ) {
    if (!entry) {
      return null
    }
    if (!(name in entry.value.file)) {
      if (create !== null) {
        entry.value.file[name] = create
      } else {
        return null
      }
    }
    return toRef(entry.value.file, name)
  }

  function traceBinary(
    entry: Ref<DirEntry> | null,
    name: string,
    create: FileContentRef | null = null
  ) {
    if (!entry) {
      return null
    }
    if (!(name in entry.value.bin)) {
      if (create !== null) {
        entry.value.bin[name] = create
      } else {
        return null
      }
    }
    return toRef(entry.value.bin, name)
  }

  function delDir(dir: Path, name: string) {
    const entry = traceDir(dir)
    if (!entry) {
      return false
    }
    if (name in entry.value.dir) {
      delete entry.value.dir[name]
      return true
    } else {
      return false
    }
  }

  function delFile(entry: Ref<DirEntry> | null, name: string) {
    if (!entry) {
      return false
    }
    if (name in entry.value.file) {
      delete entry.value.file[name]
      return true
    } else {
      return false
    }
  }

  function delBinary(entry: Ref<DirEntry> | null, name: string) {
    if (!entry) {
      return false
    }
    if (name in entry.value.bin) {
      delete entry.value.bin[name]
      return true
    } else {
      return false
    }
  }

  function travel<T>(
    root: Ref<DirEntry>,
    ondir: (dir: PathSegments, name: string, param: T) => T,
    onfile: (
      dir: PathSegments,
      name: string,
      content: string,
      param: T
    ) => void,
    onbinary: (
      dir: PathSegments,
      name: string,
      content: FileContentRef,
      param: T
    ) => void,
    param: T,
    prefix: PathSegments = [] as string[] as PathSegments
  ) {
    for (const dir of Object.keys(root.value.dir).sort()) {
      const val = ondir(prefix, dir, param)
      travel(toRef(root.value.dir, dir), ondir, onfile, onbinary, val, [
        ...prefix,
        dir
      ] as PathSegments)
    }
    for (const file of Object.keys(root.value.file).sort()) {
      onfile(prefix, file, root.value.file[file], param)
    }
    for (const bin of Object.keys(root.value.bin).sort()) {
      onbinary(prefix, bin, root.value.bin[bin], param)
    }
  }

  return {
    root,
    reset,
    traceDir,
    traceFile,
    traceBinary,
    delDir,
    delFile,
    delBinary,
    travel
  }
}
