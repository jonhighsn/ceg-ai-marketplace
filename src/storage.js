import { STORAGE_GITHUB_PAT_KEY, STORAGE_CATALOG_SHA_KEY } from './constants'

const storage = {
  async get(key, _shared = false) {
    void _shared
    try {
      const val = localStorage.getItem(key)
      return val !== null ? { key, value: val } : null
    } catch {
      return null
    }
  },
  async set(key, value, _shared = false) {
    void _shared
    try {
      localStorage.setItem(key, String(value))
      return { key, value }
    } catch {
      return null
    }
  },
  async delete(key, _shared = false) {
    void _shared
    try {
      localStorage.removeItem(key)
      return { key, deleted: true }
    } catch {
      return null
    }
  },
}

export const getGitHubPAT = () => localStorage.getItem(STORAGE_GITHUB_PAT_KEY)
export const setGitHubPAT = (token) => localStorage.setItem(STORAGE_GITHUB_PAT_KEY, token)
export const getCatalogSHA = () => localStorage.getItem(STORAGE_CATALOG_SHA_KEY)
export const setCatalogSHA = (sha) => localStorage.setItem(STORAGE_CATALOG_SHA_KEY, sha)

export default storage
