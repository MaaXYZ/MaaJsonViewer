import type { Path, PathKey, PathSegments, PathZip } from './types'

export function to_seg(path: Path | PathKey | PathZip): PathSegments {
  return path.split(/\/+/).filter(x => x) as PathSegments
}

export function seg_to_path(seg: PathSegments): Path {
  return ('/' + seg.join('/')).replace(/\/+/, '/') as Path
}

export function seg_to_zip(seg: PathSegments): PathZip {
  return seg.join('/').replace(/\/+/, '/') as PathZip
}

export function dir_to_key(path: Path): PathKey {
  return (path.replace(/\/+/, '/') + '/') as PathKey
}

export function file_to_key(path: Path, hash?: string): PathKey {
  return (path + (hash ? '#' + hash : '')) as PathKey
}

export function key_is_dir(key: PathKey) {
  return key.endsWith('/')
}

export function key_is_file(key: PathKey) {
  return !key_is_dir(key)
}

// cannot perform on root
export function to_zip(path: Path): PathZip {
  return path.replace(/^\/+/, '') as PathZip
}

export function zip_to_path(zip: PathZip): Path {
  return ('/' + zip).replace(/\/+/, '/') as Path
}

// cannot perform on root
export function divide(
  path: Path | PathKey | PathZip
): [dir: PathSegments, file: string, hash: string | null] {
  const seg = to_seg(path)
  const file = seg.pop()!
  const filehash = file.split('#')
  if (filehash.length === 2) {
    return [seg, filehash[0], filehash[1]]
  } else {
    return [seg, file, null]
  }
}

export function join(
  dir: PathSegments | Path | PathKey | PathZip,
  file: string | null
): PathSegments {
  if (typeof dir === 'string') {
    dir = to_seg(dir)
  }
  const seg = [...dir] as PathSegments
  if (file) {
    seg.push(file)
  }
  return seg
}

// only file
export function joinkey(
  dir: PathSegments | Path | PathKey,
  file: string,
  hash?: string
): PathKey {
  const seg = join(dir, file)
  return (seg_to_path(seg) + (hash ? '#' + hash : '')) as PathKey
}
