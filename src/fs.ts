import JSZip from 'jszip'
import CryptoES from 'crypto-es'
import { immerable } from 'immer'

export type DirEntry = {
  name: string
  dir: DirEntry[]
  file: FileEntry[]
}

export type TextFileEntry = {
  name: string
  data: string
  ref?: never
}

export type BinFileEntry = {
  name: string
  data?: never
  ref: string
}

export type FileEntry = TextFileEntry | BinFileEntry

export type PathSegment = string[] // ['abc', 'def', 'ghi']
export type Path = string // /abc/def/ghi
/**
 * file: /abc/def/ghi
 * dir:  /abc/def/ghi/
 * task: /abc/def/ghi#jkl
 */
export type PathKey = string
export type PathZip = string // abc/def/ghi

export const Util = {
  seg2path(seg: PathSegment): Path {
    return `/${seg.filter(x => x).join('/')}`
  },
  path2seg(path: Path): PathSegment {
    return path.split('/').filter(x => x)
  },
  zip2path(path: PathZip): Path {
    return `/${path}`.replace(/\/+/g, '/')
  },
  path2zip(path: Path): PathZip {
    return path.replace(/\/+/g, '/').replace(/^\//, '')
  },
  fileseg2key(seg: PathSegment): PathKey {
    return Util.seg2path(seg)
  },
  dirseg2key(seg: PathSegment): PathKey {
    return (Util.seg2path(seg) + '/').replace(/\/+/g, '/')
  },
  keyIsDir(key: PathKey) {
    return key.endsWith('/')
  },
  keyIsFile(key: PathKey) {
    return !Util.keyIsDir(key)
  },

  pathdiv(path: Path): [Path, string, string | null] {
    const seg = Util.path2seg(path)
    if (seg.length > 0) {
      const file = seg.pop()!
      const fh = file.split('#')
      if (fh.length === 2) {
        return [Util.seg2path(seg), fh[0], fh[1]]
      } else {
        return [Util.seg2path(seg), file, null]
      }
    } else {
      throw 'dividing root!'
    }
  },
  pathjoin(dir: PathSegment | Path, file: string, hash?: string): string {
    if (typeof dir === 'string') {
      dir = Util.path2seg(dir)
    }
    const seg = [...dir]
    if (file !== '') {
      seg.push(file)
    }
    return Util.seg2path(seg) + (hash ? `#${hash}` : '')
  }
}

// TODO: maybe change to full compare
function naiveCheck(a: ArrayBuffer, b: ArrayBuffer) {
  if (a.byteLength !== b.byteLength) {
    return false
  }
  const len = a.byteLength
  if (len === 0) {
    return true
  }
  const va = new Uint8Array(a)
  const vb = new Uint8Array(b)
  return va[0] === vb[0] && va[len - 1] === vb[len - 1]
}

export class FS {
  static pool: Record<string, ArrayBuffer> = {}
  static objectUrlPool: Record<string, string> = {};

  [immerable] = true
  root: DirEntry

  static addBuffer(data: ArrayBuffer): string {
    const hash = CryptoES.SHA256(CryptoES.lib.WordArray.create(data)).toString(
      CryptoES.enc.Base64
    )
    if (hash in FS.pool) {
      const oldData = FS.pool[hash]
      if (!naiveCheck(data, oldData)) {
        throw 'SHA256 hash same for different data!'
      }
    } else {
      FS.pool[hash] = data
    }

    return hash
  }

  static getBufferUrl(hash: string): string | null {
    if (!(hash in FS.pool)) {
      return null
    }
    if (hash in FS.objectUrlPool) {
      return FS.objectUrlPool[hash]
    } else {
      const buf = FS.pool[hash]
      const url = URL.createObjectURL(
        new Blob([new Uint8Array(buf, 0, buf.byteLength)])
      )
      FS.objectUrlPool[hash] = url
      return url
    }
  }

  static async fromZip(data: ArrayBuffer) {
    const fs = new FS()
    const zip = new JSZip()
    await zip.loadAsync(data)
    const pros: Promise<void>[] = []
    zip.forEach((p, f) => {
      pros.push(
        (async () => {
          if (f.dir) {
            fs.trace(Util.zip2path(p), true)
          } else {
            const [dir, file] = Util.pathdiv(Util.zip2path(p))
            let de = fs.trace(dir)
            if (!de) {
              console.warn('found file', p, 'but dir not created before')
              de = fs.trace(dir, true)!
            }
            if (file.endsWith('.json')) {
              fs.addTextFileViaEntry(de, file, await f.async('string'), true)
            } else {
              fs.addBinFileViaEntry(
                de,
                file,
                await f.async('arraybuffer'),
                true
              )
            }
          }
        })()
      )
    })
    await Promise.all(pros)
    return fs
  }

  constructor() {
    this.root = {
      name: '',
      dir: [],
      file: []
    }
  }

  async zip() {
    const zip = new JSZip()
    this.enumAll(
      (dir, entry, parent) => {
        if (entry.data) {
          parent.file(entry.name, entry.data)
        } else if (entry.ref) {
          parent.file(entry.name, FS.pool[entry.ref])
        }
      },
      (dir, entry, parent) => {
        return parent.folder(entry.name)!
      },
      zip
    )
    return await zip.generateAsync({
      type: 'blob'
    })
  }

  trace(path: Path, create = false) {
    const segs = Util.path2seg(path)

    let now: DirEntry = this.root
    for (const seg of segs) {
      const idx = now.dir.findIndex(entry => entry.name === seg)
      if (idx === -1) {
        if (create) {
          const ndir: DirEntry = {
            name: seg,
            dir: [],
            file: []
          }
          now.dir.push(ndir)
          now = ndir
        } else {
          return null
        }
      } else {
        now = now.dir[idx]
      }
    }
    return now
  }

  getFileViaEntry(
    entry: DirEntry,
    name: string
  ): [number, FileEntry] | [-1, null] {
    for (const [i, f] of entry.file.entries()) {
      if (f.name === name) {
        return [i, entry.file[i]]
      }
    }
    return [-1, null]
  }

  addTextFileViaEntry(
    entry: DirEntry,
    name: string,
    data: string,
    override = false
  ) {
    const [idx] = this.getFileViaEntry(entry, name)
    if (idx !== -1) {
      if (override) {
        // console.log(JSON.parse(entry.file[idx].data ?? '{}'), JSON.parse(data))
        const fe = entry.file[idx] as TextFileEntry
        fe.name = name
        fe.data = data
        if (fe.ref) {
          delete fe.ref
        }
      }
      return entry.file[idx]
    } else {
      const fe: FileEntry = {
        name,
        data
      }
      entry.file.push(fe)
      return fe
    }
  }

  addBinFileViaEntry(
    entry: DirEntry,
    name: string,
    data: ArrayBuffer,
    override = false
  ) {
    const [idx] = this.getFileViaEntry(entry, name)
    if (idx !== -1) {
      if (override) {
        const fe = entry.file[idx] as BinFileEntry
        fe.name = name
        fe.ref = FS.addBuffer(data)
        if (fe.data) {
          delete fe.data
        }
      }
      return entry.file[idx]
    } else {
      const fe: FileEntry = {
        name,
        ref: FS.addBuffer(data)
      }
      entry.file.push(fe)
      return fe
    }
  }

  getFile(path: Path) {
    const [dir, file] = Util.pathdiv(path)
    const de = this.trace(dir)
    if (!de) {
      return null
    }
    const [, fe] = this.getFileViaEntry(de, file)
    return fe
  }

  removeFile(path: Path) {
    const [dir, file] = Util.pathdiv(path)
    const de = this.trace(dir)
    if (!de) {
      return null
    }
    const [idx, fe] = this.getFileViaEntry(de, file)
    if (idx !== -1) {
      de.file.splice(idx, 1)
    }
    return fe
  }

  enumFile(func: (dir: PathSegment, entry: FileEntry) => void) {
    const enumUnderDir = (prf: PathSegment, dir: DirEntry) => {
      const cur = [...prf, dir.name].filter(x => x)
      dir.file.forEach(fe => func(cur, fe))
      dir.dir.forEach(de => enumUnderDir(cur, de))
    }

    enumUnderDir([], this.root)
  }

  enumAll<T>(
    func: (dir: PathSegment, entry: FileEntry, param: T) => void,
    dirfunc: (dir: PathSegment, entry: DirEntry, param: T) => T,
    init: T
  ) {
    const enumUnderDir = (prf: PathSegment, dir: DirEntry, param: T) => {
      const cur = [...prf, dir.name].filter(x => x)
      const val = dirfunc(prf, dir, param)
      dir.file.forEach(fe => func(cur, fe, val))
      dir.dir.forEach(de => enumUnderDir(cur, de, val))
    }

    enumUnderDir([], this.root, init)
  }
}
