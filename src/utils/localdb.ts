const DB_NAME = 'wechat_gen_db'
const DB_VERSION = 2 // Upgrade version to trigger schema change
const STORE_CORPUS = 'corpus'
const STORE_CHAT = 'chat_history'

export interface LocalItem {
  id?: number | string
  [key: string]: any
}

class LocalDB {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      
      request.onerror = () => reject('LocalDB Open Error')
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Store 1: Corpus (Existing)
        if (!db.objectStoreNames.contains(STORE_CORPUS)) {
          const store = db.createObjectStore(STORE_CORPUS, { keyPath: 'id', autoIncrement: true })
          store.createIndex('type', 'type', { unique: false })
        }

        // Store 2: Chat History (New)
        if (!db.objectStoreNames.contains(STORE_CHAT)) {
          // 单例模式：只存一条记录，key 为 'current_session'
          db.createObjectStore(STORE_CHAT, { keyPath: 'key' })
        }
      }
      
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        resolve()
      }
    })
  }

  private async getDB(): Promise<IDBDatabase> {
    if (!this.db) await this.init()
    if (!this.db) throw new Error('DB not initialized')
    return this.db
  }

  // --- Corpus Specific APIs (Keep compatible) ---

  async getAll<T>(): Promise<T[]> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CORPUS, 'readonly')
      const req = tx.objectStore(STORE_CORPUS).getAll()
      req.onsuccess = () => resolve(req.result as T[])
      req.onerror = () => reject(req.error)
    })
  }

  async add(item: Omit<LocalItem, 'id'>): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CORPUS, 'readwrite')
      tx.objectStore(STORE_CORPUS).add(item)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async delete(id: number): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CORPUS, 'readwrite')
      tx.objectStore(STORE_CORPUS).delete(id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async clear(): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CORPUS, 'readwrite')
      tx.objectStore(STORE_CORPUS).clear()
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  // --- Chat History APIs (New) ---

  async saveChatSession(data: any): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CHAT, 'readwrite')
      // Save as a single object with key 'current'
      tx.objectStore(STORE_CHAT).put({ key: 'current', ...data })
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async loadChatSession(): Promise<any> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CHAT, 'readonly')
      const req = tx.objectStore(STORE_CHAT).get('current')
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }
}

export const localDB = new LocalDB()