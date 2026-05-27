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

export default storage
