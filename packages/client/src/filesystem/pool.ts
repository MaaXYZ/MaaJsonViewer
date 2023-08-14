import CryptoES from 'crypto-es'

import type { FileContentRef } from './types'

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

let pool: Record<FileContentRef, ArrayBuffer> = {}
let objectUrlPool: Record<FileContentRef, string> = {}

export function put(data: ArrayBuffer): FileContentRef {
  const hash = CryptoES.SHA256(CryptoES.lib.WordArray.create(data)).toString(
    CryptoES.enc.Base64
  ) as FileContentRef
  if (hash in pool) {
    const oldData = pool[hash]
    if (!naiveCheck(data, oldData)) {
      throw 'SHA256 hash same for different data!'
    }
  } else {
    pool[hash] = data
  }

  return hash
}

export function get(hash: FileContentRef): ArrayBuffer | null {
  return pool[hash] ?? null
}

export function query(hash: FileContentRef): string | null {
  if (!(hash in pool)) {
    return null
  }
  if (hash in objectUrlPool) {
    return objectUrlPool[hash]
  } else {
    const buf = pool[hash]
    const url = URL.createObjectURL(
      new Blob([new Uint8Array(buf, 0, buf.byteLength)])
    )
    objectUrlPool[hash] = url
    return url
  }
}

export function clear() {
  Object.values(objectUrlPool).forEach(url => {
    URL.revokeObjectURL(url)
  })
  pool = {}
  objectUrlPool = {}
}
