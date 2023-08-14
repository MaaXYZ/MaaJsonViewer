import { type Ref, ref, toRef } from 'vue'

import * as path from './path'
import type { DirEntry, Path, PathKey, PathSegments, PathZip } from './types'

export function useTree() {
  const root: Ref<DirEntry> = ref({
    dir: {},
    file: {}
  })

  function reset() {
    root.value = {
      dir: {},
      file: {}
    }
  }

  function traceDir(
    dir: PathSegments | Path | PathKey | PathZip,
    create = false
  ) {
    const segs = dir instanceof Array ? dir : path.to_seg(dir)

    let now: Ref<DirEntry> = root
    for (const seg of segs) {
      if (!(seg in now.value.dir)) {
        if (create) {
          now.value.dir[seg] = {
            dir: {},
            file: {}
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

  function delDir(dir: PathSegments | Path | PathKey | PathZip, name: string) {
    const entry = traceDir(dir)
    if (!entry) {
      return null
    }
    if (name in entry.value.dir) {
      const e = entry.value.dir[name]
      delete entry.value.dir[name]
      return e
    } else {
      return null
    }
  }

  function delFile(entry: Ref<DirEntry> | null, name: string) {
    if (!entry) {
      return null
    }
    if (name in entry.value.file) {
      const e = entry.value.file[name]
      delete entry.value.file[name]
      return e
    } else {
      return null
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
    param: T,
    prefix: PathSegments = [] as string[] as PathSegments
  ) {
    for (const dir of Object.keys(root.value.dir).sort()) {
      const val = ondir(prefix, dir, param)
      travel(toRef(root.value.dir, dir), ondir, onfile, val, [
        ...prefix,
        dir
      ] as PathSegments)
    }
    for (const file of Object.keys(root.value.file).sort()) {
      onfile(prefix, file, root.value.file[file], param)
    }
  }

  function copyFile(
    from: Path | PathKey | PathZip,
    to: Path | PathKey | PathZip
  ) {
    const fp = path.divide(from)
    const tp = path.divide(to)
    if (fp[2] || tp[2]) {
      return false
    }
    const fd = traceDir(fp[0])
    const td = traceDir(tp[0])
    const ff = traceFile(fd, fp[1])
    if (!ff || !fd) {
      return false
    }
    traceFile(td, tp[1], '')!.value = ff.value
    return true
  }

  function copyDir(
    from: Path | PathKey | PathZip,
    to: Path | PathKey | PathZip
  ) {
    const [, name] = path.divide(from)
    const fd = traceDir(from)
    const td = traceDir(path.join(to, name), true)!
    if (!fd) {
      return false
    }
    travel(
      fd,
      (dir, name, param) => {
        return traceDir(path.join(dir, name), true)!
      },
      (dir, name, content, param) => {
        traceFile(param, name, '')!.value = content
      },
      td
    )
    return true
  }

  function existsDir(file: Path | PathKey | PathZip) {
    return !!traceDir(file)
  }

  function existsFile(file: Path | PathKey | PathZip) {
    const fp = path.divide(file)
    return !!traceFile(traceDir(fp[0]), fp[1])
  }

  function openFile(file: Path | PathKey | PathZip) {
    const fp = path.divide(file)
    const de = traceDir(fp[0])
    return traceFile(de, fp[1], '')!
  }

  function readDir(
    path: Path | PathKey | PathZip
  ): null | [string[], string[]] {
    const de = traceDir(path)
    if (!de) {
      return null
    }
    return [Object.keys(de.value.dir).sort(), Object.keys(de.value.file).sort()]
  }

  function readFile(file: Path | PathKey | PathZip) {
    const fp = path.divide(file)
    const de = traceDir(fp[0])
    const fe = traceFile(de, fp[1])
    return fe?.value ?? null
  }

  function removeDir(file: Path | PathKey | PathZip) {
    const fp = path.divide(file)
    return delDir(fp[0], fp[1])
  }

  function removeFile(file: Path | PathKey | PathZip) {
    const fp = path.divide(file)
    return delFile(traceDir(fp[0]), fp[1])
  }

  function renameDir(
    from: Path | PathKey | PathZip,
    to: Path | PathKey | PathZip
  ) {
    const fp = path.divide(from)
    const de = delDir(fp[0], fp[1])
    if (!de) {
      return false
    }
    const te = traceDir(to, true)!
    te.value = de
    return true
  }

  function renameFile(
    from: Path | PathKey | PathZip,
    to: Path | PathKey | PathZip
  ) {
    const fp = path.divide(from)
    const de = delFile(traceDir(fp[0]), fp[1])
    if (!de) {
      return false
    }
    const tp = path.divide(to)
    const te = traceFile(traceDir(tp[0]), tp[1], '')
    if (!te) {
      return false
    }
    te.value = de
    return true
  }

  function touchDir(file: Path | PathKey | PathZip) {
    traceDir(file, true)
  }

  function touchFile(file: Path | PathKey | PathZip) {
    const fp = path.divide(file)
    traceFile(traceDir(fp[0]), fp[1], '')
  }

  function writeFile(file: Path | PathKey | PathZip, content: string) {
    const fp = path.divide(file)
    const fe = traceFile(traceDir(fp[0]), fp[1], '')
    if (!fe) {
      return false
    }
    fe.value = content
    return true
  }

  return {
    root,
    reset,
    traceDir,
    traceFile,
    delDir,
    delFile,
    travel,

    copyDir,
    copyFile,
    existsDir,
    existsFile,
    openFile,
    readDir,
    readFile,
    removeDir,
    removeFile,
    renameDir,
    renameFile,
    touchDir,
    touchFile,
    writeFile
  }
}
