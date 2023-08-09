import { initFilesystem } from './history'
import * as path from './path'
import * as pool from './pool'

export type * from './types'
export { path, pool }
export const fs = initFilesystem()
