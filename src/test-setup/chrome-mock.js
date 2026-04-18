// Minimal chrome extension API mock for Vitest
// Provides storage, runtime, and declarativeNetRequest stubs.

const storage = {}

global.chrome = {
  storage: {
    local: {
      get(keys, callback) {
        const result = {}
        const ks = Array.isArray(keys) ? keys : typeof keys === 'string' ? [keys] : Object.keys(keys)
        for (const k of ks) result[k] = storage[k]
        if (callback) callback(result)
        return Promise.resolve(result)
      },
      set(data, callback) {
        Object.assign(storage, data)
        if (callback) callback()
        return Promise.resolve()
      },
      clear(callback) {
        Object.keys(storage).forEach(k => delete storage[k])
        if (callback) callback()
        return Promise.resolve()
      },
    },
  },
  runtime: {
    sendMessage: vi.fn(),
    lastError: null,
  },
}

// Reset storage before each test so tests are isolated.
beforeEach(() => {
  Object.keys(storage).forEach(k => delete storage[k])
  vi.clearAllMocks()
})
