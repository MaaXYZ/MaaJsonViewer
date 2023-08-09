export type PathSegments = string[] & { __key: 'PathSegments' }
// /abc/def/ghi
export type Path = string & { __key: 'Path' }
/**
 * file: /abc/def/ghi
 * dir: /abc/def/ghi/
 * withHash: /abc/def/ghi#jkl
 */
export type PathKey = string & { __key: 'PathKey' }
// abc/def/ghi
export type PathZip = string & { __key: 'PathZip' }

export type FileContentRef = string & { __key: 'FileContentRef' }

export type DirEntry = {
  dir: Record<string, DirEntry>
  file: Record<string, string>
  bin: Record<string, FileContentRef>
}
