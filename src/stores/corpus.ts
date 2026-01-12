import { defineStore } from 'pinia'
import { db } from '../utils/cloudbase'
import { localDB } from '../utils/localdb'
import { PRESET_DIALOGUES, PRESET_SYSTEMS } from '../config/presets'

export interface CorpusItem {
  _id?: string
  id?: number
  type: 'dialogue' | 'system'
  content: string
  preset?: boolean
}

type DialogueItem = CorpusItem & { type: 'dialogue' }
type SystemItem = CorpusItem & { type: 'system' }

const CLOUD_COLLECTION = 'corpus'

const getPresets = () => {
  const dialogues: DialogueItem[] = PRESET_DIALOGUES.map((content, index) => ({
    id: -(index + 1), // Negative ID for presets
    type: 'dialogue',
    content,
    preset: true
  }))
  const systems: SystemItem[] = PRESET_SYSTEMS.map((content, index) => ({
    id: -(index + 1),
    type: 'system',
    content,
    preset: true
  }))
  return { dialogues, systems }
}

export const useCorpusStore = defineStore('corpus', {
  state: () => ({
    mode: 'local' as 'local' | 'cloud',
    dialogues: [] as CorpusItem[],
    systems: [] as CorpusItem[],
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
      const { dialogues, systems } = getPresets()
      
      // 1. 优先展示预设
      this.dialogues = [...dialogues]
      this.systems = [...systems]

      let fetchedItems: CorpusItem[] = []

      if (this.mode === 'local') {
        fetchedItems = await this.fetchLocal()
      } else {
        fetchedItems = await this.fetchCloud()
      }

      const customDialogues = fetchedItems.filter(i => i.type === 'dialogue')
      const customSystems = fetchedItems.filter(i => i.type === 'system')

      // 2. 合并用户数据
      this.dialogues = [...dialogues, ...customDialogues]
      this.systems = [...systems, ...customSystems]
    },

    async addEntry(type: 'dialogue' | 'system', content: string) {
      if (!content.trim()) return
      if (this.mode === 'local') {
        await this.addLocal(type, content)
      } else {
        await this.addCloud(type, content)
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
      // 导出时包含所有可见数据（含预设）
      return {
        dialogues: this.dialogues.map(i => i.content),
        systems: this.systems.map(i => i.content)
      }
    },
    
    async replaceAll(dialogues: string[], systems: string[]) {
      await this.clearAll()
      for (const t of dialogues) if(t.trim()) await this.addEntry('dialogue', t)
      for (const t of systems) if(t.trim()) await this.addEntry('system', t)
    },

    // --- Local Engine ---
    async fetchLocal(): Promise<CorpusItem[]> {
      return (await localDB.getAll<CorpusItem>())
    },

    async addLocal(type: 'dialogue' | 'system', content: string) {
      await localDB.add({ type, content, preset: false })
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
        const { data } = await db.collection(CLOUD_COLLECTION).limit(1000).get()
        return data as CorpusItem[]
      } catch (e) {
        console.error('Cloud fetch failed', e)
        return []
      }
    },

    async addCloud(type: 'dialogue' | 'system', content: string) {
      try {
        await db.collection(CLOUD_COLLECTION).add({
          type,
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
