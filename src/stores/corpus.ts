import { defineStore } from 'pinia'

export interface CorpusItem {
  id: number
  type: 'dialogue' | 'system'
  content: string
  preset?: boolean
}

const DB_NAME = 'wechat_gen_db'
const DB_VERSION = 1
const STORE_NAME = 'corpus'
const DEPRECATED_DIALOGUES = new Set([
  '终于等到这一天了！', '有人出杭州站的票吗？求两张！', '我在黄龙体育中心门口了，人超多！',
  '前排兜售瓜子饮料矿泉水~', '谁有歌单啊？求分享', '激动得睡不着觉',
  '今晚会有《稻香》吗？', '必须有啊！全场大合唱预定', '为了看杰伦特意请了假',
  '听说今晚有神秘嘉宾？', '真的假的？是谁啊？', '大家要注意防诈骗哦',
  '周董YYDS！', '已经在检票口排队了', '天气不错，适合听演唱会',
  '有没有组队入场的？', '刚才在门口看到保姆车了！', '心跳已经120了'
])
const PRESET_DIALOGUES = [
  '终于等到这一天了！', '有人出本场的票吗？求两张！', '我在场馆门口了，人超多！',
  '前排兜售瓜子饮料矿泉水~', '谁有歌单啊？求分享', '激动得睡不着觉',
  '今晚会有新歌吗？', '必须有啊！全场大合唱预定', '为了看演出特意请了假',
  '听说今晚有神秘嘉宾？', '真的假的？是谁啊？', '大家要注意防诈骗哦',
  '舞台效果太顶了！', '已经在检票口排队了', '天气不错，适合听演唱会',
  '有没有组队入场的？', '刚才在门口看到保姆车了！', '心跳已经120了'
]
const PRESET_SYSTEMS = [
  '{name}邀请{invited}加入了群聊',
  '{invited}通过扫描{name}分享的二维码加入群聊',
  '{invited}通过群成员{name}分享的二维码加入群聊',
  '{name}邀请{invited}、{other}加入了群聊',
  '{invited}加入了群聊'
]

export const useCorpusStore = defineStore('corpus', {
  state: () => ({
    dialogues: [] as CorpusItem[],
    systems: [] as CorpusItem[],
    isReady: false
  }),
  
  actions: {
    async openDB() {
      return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)
        request.onerror = () => reject('DB Open Error')
        request.onsuccess = (event) => {
          resolve((event.target as IDBOpenDBRequest).result)
        }
      })
    },
    async initDB() {
      return new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)
        
        request.onerror = () => reject('DB Open Error')
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
            objectStore.createIndex('type', 'type', { unique: false })
            
            // Seed Default Data
            const defaultDialogues = [
              '终于等到这一天了！', '有人出本场的票吗？求两张！', '我在场馆门口了，人超多！',
              '前排兜售瓜子饮料矿泉水~', '谁有歌单啊？求分享', '激动得睡不着觉',
              '今晚会有新歌吗？', '必须有啊！全场大合唱预定', '为了看演出特意请了假',
              '听说今晚有神秘嘉宾？', '真的假的？是谁啊？', '大家要注意防诈骗哦',
              '舞台效果太顶了！', '已经在检票口排队了', '天气不错，适合听演唱会',
              '有没有组队入场的？', '刚才在门口看到保姆车了！', '心跳已经120了'
            ]
            const defaultSystems = [
              '{name}邀请{invited}加入了群聊',
              '{invited}通过扫描{name}分享的二维码加入群聊',
              '{invited}通过群成员{name}分享的二维码加入群聊',
              '{name}邀请{invited}、{other}加入了群聊',
              '{invited}加入了群聊'
            ]
            
            defaultDialogues.forEach(text => objectStore.add({ type: 'dialogue', content: text }))
            defaultSystems.forEach(text => objectStore.add({ type: 'system', content: text }))
          }
        }
        
        request.onsuccess = async () => {
          this.isReady = true
          await this.loadAll()
          await this.purgeDeprecated()
          resolve()
        }
      })
    },

    async loadAll() {
      return new Promise<void>((resolve) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          const tx = db.transaction(STORE_NAME, 'readonly')
          const store = tx.objectStore(STORE_NAME)
          
          const getAll = store.getAll()
          getAll.onsuccess = () => {
            const allItems = getAll.result as CorpusItem[]
            const customDialogues = allItems.filter(i => i.type === 'dialogue').map(i => ({ ...i, preset: false }))
            const customSystems = allItems.filter(i => i.type === 'system').map(i => ({ ...i, preset: false }))
            const presetDialogues = PRESET_DIALOGUES.map((content, index) => ({
              id: -(index + 1),
              type: 'dialogue' as const,
              content,
              preset: true
            }))
            const presetSystems = PRESET_SYSTEMS.map((content, index) => ({
              id: -(index + 1),
              type: 'system' as const,
              content,
              preset: true
            }))
            this.dialogues = presetDialogues.concat(customDialogues)
            this.systems = presetSystems.concat(customSystems)
            resolve()
          }
        }
      })
    },
    async purgeDeprecated() {
      const db = await this.openDB()
      return new Promise<void>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const getAll = store.getAll()
        getAll.onsuccess = () => {
          const allItems = getAll.result as CorpusItem[]
          allItems
            .filter(item => item.type === 'dialogue' && DEPRECATED_DIALOGUES.has(item.content))
            .forEach(item => store.delete(item.id))
        }
        tx.oncomplete = async () => {
          await this.loadAll()
          resolve()
        }
      })
    },
    async clearAll() {
      const db = await this.openDB()
      return new Promise<void>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const getAll = store.getAll()
        getAll.onsuccess = () => {
          const allItems = getAll.result as CorpusItem[]
          allItems.forEach(item => {
            if (!item.preset) {
              store.delete(item.id)
            }
          })
        }
        tx.oncomplete = async () => {
          await this.loadAll()
          resolve()
        }
      })
    },
    async exportAll() {
      const db = await this.openDB()
      return new Promise<{ dialogues: string[]; systems: string[] }>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)
        const getAll = store.getAll()
        getAll.onsuccess = () => {
          const allItems = getAll.result as CorpusItem[]
          resolve({
            dialogues: allItems.filter(i => i.type === 'dialogue').map(i => i.content),
            systems: allItems.filter(i => i.type === 'system').map(i => i.content)
          })
        }
      })
    },
    async replaceAll(dialogues: string[], systems: string[]) {
      const db = await this.openDB()
      return new Promise<void>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        store.clear()
        dialogues.forEach(text => {
          if (text && text.trim()) store.add({ type: 'dialogue', content: text })
        })
        systems.forEach(text => {
          if (text && text.trim()) store.add({ type: 'system', content: text })
        })
        tx.oncomplete = async () => {
          await this.loadAll()
          resolve()
        }
      })
    },

    async addEntry(type: 'dialogue' | 'system', content: string) {
      if (!content.trim()) return
      return new Promise<void>((resolve) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          const tx = db.transaction(STORE_NAME, 'readwrite')
          const store = tx.objectStore(STORE_NAME)
          
          store.add({ type, content, preset: false })
          
          tx.oncomplete = async () => {
            await this.loadAll()
            resolve()
          }
        }
      })
    },

    async deleteEntry(id: number) {
      if (id < 0) return
      return new Promise<void>((resolve) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          const tx = db.transaction(STORE_NAME, 'readwrite')
          const store = tx.objectStore(STORE_NAME)
          
          store.delete(id)
          
          tx.oncomplete = async () => {
            await this.loadAll()
            resolve()
          }
        }
      })
    }
  }
})
