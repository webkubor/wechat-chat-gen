import { DB_STORES, type ChatSession } from '../types/database'

const DB_NAME = 'wechat_gen_db'
const DB_VERSION = 3 // 升级版本以增加资源仓库
const STORE_CORPUS = DB_STORES.CORPUS
const STORE_CHAT = DB_STORES.CHAT_HISTORY
const STORE_RESOURCES = 'resources' // 新增图片资源表

class LocalDB {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      
      request.onerror = () => reject('本地数据库打开失败')
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        if (!db.objectStoreNames.contains(STORE_CORPUS)) {
          const store = db.createObjectStore(STORE_CORPUS, { keyPath: 'id', autoIncrement: true })
          store.createIndex('type', 'type', { unique: false })
        }

        if (!db.objectStoreNames.contains(STORE_CHAT)) {
          db.createObjectStore(STORE_CHAT, { keyPath: 'key' })
        }

        // 新增资源库：存储 File/Blob 对象
        if (!db.objectStoreNames.contains(STORE_RESOURCES)) {
          db.createObjectStore(STORE_RESOURCES, { keyPath: 'id' })
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
    if (!this.db) throw new Error('数据库未初始化')
    return this.db
  }

  // --- 资源存储 API (处理 Blob) ---

  async saveResource(id: string, blob: Blob | File): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RESOURCES, 'readwrite')
      tx.objectStore(STORE_RESOURCES).put({ id, blob })
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async getResource(id: string): Promise<Blob | null> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RESOURCES, 'readonly')
      const req = tx.objectStore(STORE_RESOURCES).get(id)
      req.onsuccess = () => resolve(req.result?.blob || null)
      req.onerror = () => reject(req.error)
    })
  }

  // --- 语料库 API ---

  async getAll<T>(): Promise<T[]> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CORPUS, 'readonly')
      const req = tx.objectStore(STORE_CORPUS).getAll()
      req.onsuccess = () => resolve(req.result as T[])
      req.onerror = () => reject(req.error)
    })
  }

  async add(item: any): Promise<void> {
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

  // --- 聊天记录 API ---

  async saveChatSession(data: ChatSession): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CHAT, 'readwrite')
      tx.objectStore(STORE_CHAT).put(data)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async loadChatSession(): Promise<ChatSession | null> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CHAT, 'readonly')
      const req = tx.objectStore(STORE_CHAT).get('current')
      req.onsuccess = () => resolve(req.result as ChatSession || null)
      req.onerror = () => reject(req.error)
    })
  }
}

export const localDB = new LocalDB()
