import * as api from '@/api'
import { fs } from '@/filesystem'

export async function loadFS() {
  const zip = await api.load()
  await fs.loadZip(zip)
}

export async function saveFS() {
  const zip = await fs.saveZip()
  await api.save(zip)
}
