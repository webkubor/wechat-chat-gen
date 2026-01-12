import { defineStore } from 'pinia'
import { db } from '../utils/cloudbase'
import { localDB } from '../utils/localdb'
import { PRESET_DIALOGUES } from '../config/presets'

export interface CorpusItem {
  _id?: string
  id?: number
  type: 'dialogue'
  content: string
  preset?: boolean
}

const CLOUD_COLLECTION = 'corpus'

const getPresets = () => {
  return PRESET_DIALOGUES.map((content, index) => ({
    id: -(index + 1),
    type: 'dialogue' as const,
    content,
    preset: true
  }))
}

export const useCorpusStore = defineStore('corpus', {
  state: () => ({
    mode: 'local' as 'local' | 'cloud',
    dialogues: [] as CorpusItem[],
    isReady: false
  }),
  
  actions: {
    async init() {
      await localDB.init()
      await this.loadAll()
      this.isReady = true
    },

    async switchMode(mode: 'local' | 'cloud') {
      this.mode = mode
      await this.loadAll()
    },

    async loadAll() {
      const presets = getPresets()
      
      // 1. 优先展示预设
      this.dialogues = [...presets]

      let fetchedItems: CorpusItem[] = []

      if (this.mode === 'local') {
        fetchedItems = await this.fetchLocal()
      } else {
        fetchedItems = await this.fetchCloud()
      }

      // 2. 合并用户自定义对话
      this.dialogues = [...presets, ...fetchedItems]
    },

    async addEntry(content: string) {
      if (!content.trim()) return
      if (this.mode === 'local') {
        await this.addLocal(content)
      } else {
        await this.addCloud(content)
      }
      await this.loadAll()
    },

    async deleteEntry(item: CorpusItem) {
      if (item.preset) return
      if (this.mode === 'local') {
        if (item.id) await this.deleteLocal(item.id)
      } else {
        if (item._id) await this.deleteCloud(item._id)
      }
      await this.loadAll()
    },

    async clearAll() {
      if (this.mode === 'local') {
        await this.clearLocal()
      } else {
        await this.clearCloud()
      }
      await this.loadAll()
    },

    async exportAll() {
      return {
        dialogues: this.dialogues.map(i => i.content)
      }
    },
    
    async replaceAll(dialogues: string[]) {
      await this.clearAll()
      for (const t of dialogues) if(t.trim()) await this.addEntry(t)
    },

    // --- Local Engine ---
    async fetchLocal(): Promise<CorpusItem[]> {
      const all = await localDB.getAll<CorpusItem>()
      return all.filter(i => i.type === 'dialogue')
    },

    async addLocal(content: string) {
      await localDB.add({ type: 'dialogue', content, preset: false })
    },

    async deleteLocal(id: number) {
      await localDB.delete(id)
    },

    async clearLocal() {
      await localDB.clear()
    },

    // --- Cloud Engine ---
    async fetchCloud(): Promise<CorpusItem[]> {
      try {
        const { data } = await db.collection(CLOUD_COLLECTION)
          .where({ type: 'dialogue' })
          .limit(1000)
          .get()
        return data as CorpusItem[]
      } catch (e) {
        console.error('Cloud fetch failed', e)
        return []
      }
    },

    async addCloud(content: string) {
      try {
        await db.collection(CLOUD_COLLECTION).add({
          type: 'dialogue',
          content,
          created_at: new Date()
        })
      } catch (e) {
        console.error('Cloud add failed', e)
      }
    },

    async deleteCloud(_id: string) {
      try {
        await db.collection(CLOUD_COLLECTION).doc(_id).remove()
      } catch (e) {
        console.error('Cloud delete failed', e)
      }
    },

    async clearCloud() {
      try {
        const items = await this.fetchCloud()
        for (const item of items) {
          if (item._id) await db.collection(CLOUD_COLLECTION).doc(item._id).remove()
        }
      } catch (e) {
        console.error('Cloud clear failed', e)
      }
    }
  }
})