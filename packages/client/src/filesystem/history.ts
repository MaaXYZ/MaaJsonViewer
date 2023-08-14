import { useRefHistory } from '@vueuse/core'
import JSZip from 'jszip'
import { parse, stringify } from 'zipson'

import { divide } from './path'
import * as pool from './pool'
import { useTree } from './tree'
import { type PathZip } from './types'

export function initFilesystem() {
  const tree = useTree()
  const history = useRefHistory(tree.root, {
    deep: true,
    dump: stringify,
    parse: parse
  })

  async function loadZip(data: ArrayBuffer) {
    history.pause()
    tree.reset()
    const zip = new JSZip()
    await zip.loadAsync(data)

    const pros: Promise<void>[] = []
    zip.forEach((p, entry) => {
      const path = p as PathZip
      pros.push(
        (async () => {
          if (entry.dir) {
            tree.touchDir(path)
          } else {
            const [, file] = divide(path)
            if (file.endsWith('.json')) {
              tree.writeFile(path, await entry.async('string'))
            } else {
              tree.writeFile(path, pool.put(await entry.async('arraybuffer')))
            }
          }
        })()
      )
    })
    await Promise.all(pros)

    history.resume()
    history.commit()
  }

  function saveZip() {
    const zip = new JSZip()
    tree.travel(
      tree.root,
      (dir, name, zip) => {
        return zip.folder(name)!
      },
      (dir, name, content, zip) => {
        if (name.endsWith('.json')) {
          zip.file(name, content)
        } else {
          zip.file(name, pool.get(content)!)
        }
      },
      zip
    )
    return zip.generateAsync({
      type: 'blob'
    })
  }

  let level = 0
  function scope(action: () => void) {
    if (level === 0) {
      history.pause()
    }
    level += 1
    action()
    level -= 1
    if (level == 0) {
      history.resume(true)
    }
  }

  return { tree, history, loadZip, saveZip, scope }
}
