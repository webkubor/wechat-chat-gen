import { DB_STORES, type ChatSession } from '../types/database'

const DB_NAME = 'wechat_gen_db'
const DB_VERSION = 2

class LocalDB {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      
      request.onerror = () => reject('LocalDB Open Error')
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Store 1: Corpus
        if (!db.objectStoreNames.contains(DB_STORES.CORPUS)) {
          const store = db.createObjectStore(DB_STORES.CORPUS, { keyPath: 'id', autoIncrement: true })
          store.createIndex('type', 'type', { unique: false })
        }

        // Store 2: Chat History
        if (!db.objectStoreNames.contains(DB_STORES.CHAT_HISTORY)) {
          db.createObjectStore(DB_STORES.CHAT_HISTORY, { keyPath: 'key' })
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

  // --- Corpus Specific APIs ---

  async getAll<T>(): Promise<T[]> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORES.CORPUS, 'readonly')
      const req = tx.objectStore(DB_STORES.CORPUS).getAll()
      req.onsuccess = () => resolve(req.result as T[])
      req.onerror = () => reject(req.error)
    })
  }

  async add(item: any): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORES.CORPUS, 'readwrite')
      tx.objectStore(DB_STORES.CORPUS).add(item)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async delete(id: number): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORES.CORPUS, 'readwrite')
      tx.objectStore(DB_STORES.CORPUS).delete(id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async clear(): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORES.CORPUS, 'readwrite')
      tx.objectStore(DB_STORES.CORPUS).clear()
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  // --- Chat History APIs ---

  async saveChatSession(data: ChatSession): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORES.CHAT_HISTORY, 'readwrite')
      tx.objectStore(DB_STORES.CHAT_HISTORY).put(data)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async loadChatSession(): Promise<ChatSession | null> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORES.CHAT_HISTORY, 'readonly')
      const req = tx.objectStore(DB_STORES.CHAT_HISTORY).get('current')
      req.onsuccess = () => resolve(req.result as ChatSession || null)
      req.onerror = () => reject(req.error)
    })
  }
}

export const localDB = new LocalDB()
