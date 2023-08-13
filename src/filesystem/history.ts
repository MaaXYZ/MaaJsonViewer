import { useRefHistory } from '@vueuse/core'
import JSZip from 'jszip'
import { parse, stringify } from 'zipson'

import { divide, zip_to_path } from './path'
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
            tree.traceDir(zip_to_path(path), true)
          } else {
            const [dir, file] = divide(zip_to_path(path))
            let de = tree.traceDir(dir)
            if (!de) {
              console.warn('found file', p, 'but dir not created before')
              de = tree.traceDir(dir, true)!
            }
            if (file.endsWith('.json')) {
              tree.traceFile(de, file, await entry.async('string'))
            } else {
              tree.traceBinary(
                de,
                file,
                pool.put(await entry.async('arraybuffer'))
              )
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
        zip.file(name, content)
      },
      (dir, name, content, zip) => {
        zip.file(name, pool.get(content)!)
      },
      zip
    )
    return zip.generateAsync({
      type: 'blob'
    })
  }

  return { tree, history, loadZip, saveZip }
}
