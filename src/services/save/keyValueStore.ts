export interface KeyValueStore {
  get(key: string): Promise<unknown>
  set(key: string, value: unknown): Promise<void>
}

const DB_NAME = 'ananse-run'
const STORE_NAME = 'kv'

const request = <T>(req: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
    req.onblocked = () => reject(new Error('IndexedDB blocked'))
  })

export const createIndexedDbStore = (): KeyValueStore => {
  let db: Promise<IDBDatabase> | null = null
  const store = async (mode: IDBTransactionMode) => {
    db ??= openDatabase()
    return (await db).transaction(STORE_NAME, mode).objectStore(STORE_NAME)
  }
  return {
    get: async (key) => request((await store('readonly')).get(key)),
    set: async (key, value) => {
      await request((await store('readwrite')).put(value, key))
    },
  }
}

export const createMemoryStore = (): KeyValueStore => {
  const data = new Map<string, unknown>()
  return {
    get: async (key) => structuredClone(data.get(key)),
    set: async (key, value) => {
      data.set(key, structuredClone(value))
    },
  }
}

export const createBrowserStore = (): KeyValueStore =>
  typeof indexedDB === 'undefined' ? createMemoryStore() : createIndexedDbStore()
