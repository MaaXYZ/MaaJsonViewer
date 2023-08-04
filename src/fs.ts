export type FSEntry = {
  name: string
  dir: FSEntry[]
  file: string[]
}

function getdir(entry: FSEntry, name: string, create?: false): FSEntry | null
function getdir(entry: FSEntry, name: string, create: true): FSEntry
function getdir(entry: FSEntry, name: string, create = false) {
  for (const dir of entry.dir) {
    if (dir.name === name) {
      return dir
    }
  }
  if (!create) {
    return null
  }
  const nd: FSEntry = {
    name,
    dir: [],
    file: []
  }
  entry.dir.push(nd)
  return nd
}

function locate(root: FSEntry, path: string[]) {
  let ptr: FSEntry | null = root
  for (const node of path) {
    ptr = getdir(ptr!, node)
    if (!ptr) {
      return null
    }
  }
  return ptr
}

export function buildEntries(dirs: string[][], files: string[][]) {
  const root: FSEntry = {
    name: '',
    dir: [],
    file: []
  }

  for (const dir of dirs) {
    let ptr: FSEntry = root
    for (const node of dir) {
      ptr = getdir(ptr, node, true)
    }
  }

  for (const file of files) {
    const dir = locate(root, file.slice(0, -1))
    if (!dir) {
      console.warn('cannot locate dir of', file.join('/'))
      continue
    }
    dir.file.push(file[file.length - 1])
  }

  return root
}
