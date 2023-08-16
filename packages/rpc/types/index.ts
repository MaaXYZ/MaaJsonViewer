import type { Buffer } from 'buffer'

type AcceptFunction = (...args: AcceptType[]) => AcceptType

type AcceptType =
  | number
  | string
  | boolean
  | Buffer
  | AcceptFunction
  | AcceptType[]
  | {
      [key in string | number]: AcceptType
    }
