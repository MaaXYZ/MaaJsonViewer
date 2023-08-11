import { type Ref, type WritableComputedRef, computed } from 'vue'

export function wrapProp<T extends {}, K extends keyof T>(
  obj: Ref<T> | WritableComputedRef<T | null>,
  key: K
) {
  return computed<NonNullable<T[K]> | null>({
    set(v) {
      if (obj.value === null) {
        return
      }
      if (v === null) {
        if (key in obj.value) {
          delete obj.value[key]
        }
      } else {
        obj.value[key] = v
      }
    },
    get() {
      return obj.value?.[key] ?? null
    }
  })
}

export function wrapPropEx<T extends {}, K extends keyof T, U>(
  obj: Ref<T>,
  key: K,
  fix: (v: T[K]) => U,
  unfix: (v: U) => T[K]
) {
  return computed<NonNullable<U> | null>({
    set(v) {
      if (v === null) {
        if (key in obj.value) {
          delete obj.value[key]
        }
      } else {
        obj.value[key] = unfix(v)
      }
    },
    get() {
      return fix(obj.value[key]) ?? null
    }
  })
}
