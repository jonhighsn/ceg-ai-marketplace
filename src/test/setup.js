import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

const createStorage = () => {
  let values = new Map()

  return {
    get length() {
      return values.size
    },
    clear() {
      values = new Map()
    },
    getItem(key) {
      return values.has(String(key)) ? values.get(String(key)) : null
    },
    key(index) {
      return Array.from(values.keys())[index] ?? null
    },
    removeItem(key) {
      values.delete(String(key))
    },
    setItem(key, value) {
      values.set(String(key), String(value))
    },
  }
}

const storage = createStorage()

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: storage,
})

if (globalThis.window) {
  Object.defineProperty(globalThis.window, 'localStorage', {
    configurable: true,
    value: storage,
  })
}
