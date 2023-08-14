import {
  delTask,
  filterTask,
  filterTemplate,
  getTask,
  history,
  renameInto,
  renameKey,
  setTask,
  taskIndex
} from '@/data'
import { type PathKey, fs, path } from '@/filesystem'

export function onNewFolder(key: PathKey) {
  for (let i = 0; ; i++) {
    const name = `__NewFolder${i}`
    const to = path.joinkey(key, name)
    if (fs.tree.existsDir(to)) {
      continue
    }
    fs.tree.touchDir(to)
    break
  }
}

export function onNewJson(key: PathKey) {
  for (let i = 0; ; i++) {
    const name = `__NewJson${i}.json`
    const to = path.joinkey(key, name)
    if (fs.tree.existsFile(to)) {
      continue
    }
    fs.tree.writeFile(to, '{}')
    break
  }
}

export function onNewTask(key: PathKey) {
  const [dir, file] = path.divide(key)
  for (let i = 0; ; i++) {
    const name = `__NewTask${i}`
    if (name in taskIndex.value) {
      continue
    }
    setTask(path.joinkey(dir, file, name), {})
    break
  }
}

export function onDelete(key: PathKey) {
  const [dir, file, hash] = path.divide(key)
  if (path.key_is_dir(key)) {
    // TODO: not supported yet
  } else {
    if (hash) {
      fs.scope(() => {
        filterTask(temp => {
          return temp === hash ? null : temp
        })
        delTask(taskIndex.value[hash])
      })
      history.pop()
    } else {
      const isJson = file.endsWith('.json')
      const p = path.joinkey(dir, file)

      fs.scope(() => {
        if (isJson) {
          const obj = JSON.parse(fs.tree.readFile(p) ?? '{}')
          for (const name in obj) {
            filterTask(temp => {
              return temp === name ? null : temp
            })
            delTask(taskIndex.value[name])
          }
        }
        fs.tree.removeFile(p)
      })
      history.pop()
    }
  }
}

export function onEnterRename(key: PathKey) {
  if (key === '/') {
    return
  }
  const [, file, hash] = path.divide(key)
  renameKey.value = key
  renameInto.value = hash ?? file
}

export function onLeaveRename() {
  const key = renameKey.value as PathKey | null
  renameKey.value = null
  if (!key) {
    return
  }
  if (path.key_is_dir(key)) {
    const [dir, file] = path.divide(key)
    const tk = path.joinkey(dir, renameInto.value!)
    const zf = path.seg_to_zip(path.to_seg(key)) + '/'
    const tf = path.seg_to_zip(path.to_seg(tk)) + '/'

    fs.scope(() => {
      fs.tree.renameDir(key, tk)
      filterTemplate(temp => {
        return temp.startsWith(zf) ? temp.replace(zf, tf) : temp
      })
    })
  } else {
    const [dir, file, hash] = path.divide(key)
    if (hash) {
      const into = renameInto.value!
      const to = path.joinkey(dir, file, into)
      fs.scope(() => {
        filterTask(temp => {
          return temp === hash ? into : temp
        })
        const task = getTask(key)
        if (task) {
          delTask(key)
          setTask(to, task)
        }
      })
    } else {
      const to = path.joinkey(dir, renameInto.value!)
      fs.scope(() => {
        fs.tree.renameFile(key, to)

        if (file.endsWith('.png')) {
          const zf = path.seg_to_zip(path.to_seg(key))
          const zt = path.seg_to_zip(path.join(dir, renameInto.value!))

          filterTemplate(temp => {
            return temp === zf ? zt : temp
          })
        }
      })
    }
  }
}
