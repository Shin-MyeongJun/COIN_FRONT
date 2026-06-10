/**
 * localStorage wrapper.
 *
 * Direct `localStorage.*` access is forbidden elsewhere in the codebase
 * (rule #4) — always go through this module. It transparently handles:
 *   - SSR / non-browser environments (returns the fallback)
 *   - Safari private mode (where setItem can throw QuotaExceededError)
 *   - corrupted JSON (returns the fallback)
 *
 * Keys should follow the `coindata:<scope>:<name>` convention.
 */

const memoryStore = new Map<string, string>()

function hasLocalStorage(): boolean {
  try {
    if (typeof window === 'undefined') return false
    const probe = '__coin_front_storage_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

const available = hasLocalStorage()

function readRaw(key: string): string | null {
  if (!available) return memoryStore.get(key) ?? null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return memoryStore.get(key) ?? null
  }
}

function writeRaw(key: string, value: string): void {
  if (!available) {
    memoryStore.set(key, value)
    return
  }
  try {
    window.localStorage.setItem(key, value)
  } catch {
    memoryStore.set(key, value)
  }
}

function deleteRaw(key: string): void {
  if (!available) {
    memoryStore.delete(key)
    return
  }
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

export const storage = {
  isAvailable: available,

  getString(key: string, fallback: string | null = null): string | null {
    return readRaw(key) ?? fallback
  },

  setString(key: string, value: string): void {
    writeRaw(key, value)
  },

  getJson<T>(key: string, fallback: T): T {
    const raw = readRaw(key)
    if (raw === null) return fallback
    try {
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  },

  setJson<T>(key: string, value: T): void {
    try {
      writeRaw(key, JSON.stringify(value))
    } catch {
      /* unserializable — silently drop */
    }
  },

  remove(key: string): void {
    deleteRaw(key)
  },

  clear(): void {
    if (!available) {
      memoryStore.clear()
      return
    }
    try {
      window.localStorage.clear()
    } catch {
      memoryStore.clear()
    }
  },
}

export type Storage = typeof storage
