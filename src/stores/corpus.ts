import { defineStore } from 'pinia'
import { db, isCloudEnabled } from '../utils/cloudbase'
import { localDB } from '../utils/localdb'
import { PRESET_DIALOGUES, PRESET_NICKNAMES } from '../config/presets'
import { type CorpusItem, type NicknameItem, DB_STORES } from '../types/database'

export type { CorpusItem, NicknameItem }

const getDialoguePresets = (): CorpusItem[] => {
  return PRESET_DIALOGUES.map((content, index) => ({
    id: -(index + 1),
    type: 'dialogue',
    content,
    preset: true
  }))
}

export const useCorpusStore = defineStore('corpus', {
  state: () => ({
    mode: 'local' as 'local' | 'cloud',
    dialogues: [] as CorpusItem[],
    nicknames: [] as NicknameItem[],
    isReady: false
  }),

  actions: {
    async init() {
      await localDB.init()
      await this.loadAll()
      this.isReady = true
    },

    async switchMode(mode: 'local' | 'cloud') {
      if (mode === 'cloud' && !isCloudEnabled()) return
      this.mode = mode
      await this.loadAll()
    },

    async loadAll() {
      const dialoguePresets = getDialoguePresets()
      const nicknamePresets = [...PRESET_NICKNAMES]

      const localDialogues = await this.fetchLocalDialogues()
      const localNicknames = await this.fetchLocalNicknames()

      this.dialogues = [...dialoguePresets, ...localDialogues]
      this.nicknames = [...nicknamePresets, ...localNicknames]
    },

    // --- 对话语料操作 ---

    async addDialogue(content: string) {
      if (!content.trim()) return
      if (this.mode === 'local') {
        await localDB.add({ type: 'dialogue', content, preset: false })
      } else {
        await this.addCloudDialogue(content)
      }
      await this.loadAll()
    },

    async deleteDialogue(item: CorpusItem) {
      if (item.preset) return
      if (this.mode === 'local') {
        if (item.id) await localDB.delete(item.id)
      } else {
        if (item._id) await this.deleteCloudDialogue(item._id)
      }
      await this.loadAll()
    },

    async clearDialogues() {
      if (this.mode === 'local') {
        await localDB.clear()
      } else {
        await this.clearCloudDialogues()
      }
      await this.loadAll()
    },

    // --- 昵称操作 ---

    async addNickname(content: string) {
      if (!content.trim()) return
      if (this.mode === 'local') {
        await localDB.addNickname({ type: 'nickname', content, preset: false })
      } else {
        await this.addCloudNickname(content)
      }
      await this.loadAll()
    },

    async deleteNickname(item: NicknameItem) {
      if (item.preset) return
      if (this.mode === 'local') {
        if (item.id) await localDB.deleteNickname(item.id)
      } else {
        if (item._id) await this.deleteCloudNickname(item._id)
      }
      await this.loadAll()
    },

    async clearNicknames() {
      if (this.mode === 'local') {
        await localDB.clearNicknames()
      } else {
        await this.clearCloudNicknames()
      }
      await this.loadAll()
    },

    // --- 导出导入 ---

    async exportAll() {
      return {
        dialogues: this.dialogues.map(i => i.content),
        nicknames: this.nicknames.map(i => i.content)
      }
    },

    async replaceAllDialogues(dialogues: string[]) {
      await this.clearDialogues()
      for (const t of dialogues) if (t.trim()) await this.addDialogue(t)
    },

    async replaceAllNicknames(nicknames: string[]) {
      await this.clearNicknames()
      for (const n of nicknames) if (n.trim()) await this.addNickname(n)
    },

    // --- 本地引擎 (IndexedDB) ---

    async fetchLocalDialogues(): Promise<CorpusItem[]> {
      const all = await localDB.getAll<CorpusItem>()
      return all.filter(i => i.type === 'dialogue')
    },

    async fetchLocalNicknames(): Promise<NicknameItem[]> {
      return await localDB.getAllNicknames()
    },

    // --- 云端引擎 (CloudBase) ---

    async fetchCloudDialogues(): Promise<CorpusItem[]> {
      if (!isCloudEnabled()) return []
      try {
        const { initCloudBase } = await import('../utils/cloudbase')
        await initCloudBase()
        const { data } = await db.collection(DB_STORES.CORPUS)
          .where({ type: 'dialogue' })
          .limit(1000)
          .get()
        return data as CorpusItem[]
      } catch (e) {
        console.error('云端获取失败', e)
        return []
      }
    },

    async fetchCloudNicknames(): Promise<NicknameItem[]> {
      if (!isCloudEnabled()) return []
      try {
        const { initCloudBase } = await import('../utils/cloudbase')
        await initCloudBase()
        const { data } = await db.collection(DB_STORES.NICKNAMES)
          .where({ type: 'nickname' })
          .limit(1000)
          .get()
        return data as NicknameItem[]
      } catch (e) {
        console.error('云端获取失败', e)
        return []
      }
    },

    async addCloudDialogue(content: string) {
      if (!isCloudEnabled()) return
      try {
        const { initCloudBase } = await import('../utils/cloudbase')
        await initCloudBase()
        await db.collection(DB_STORES.CORPUS).add({
          type: 'dialogue',
          content,
          created_at: new Date()
        })
      } catch (e) {
        console.error('云端添加失败', e)
      }
    },

    async addCloudNickname(content: string) {
      if (!isCloudEnabled()) return
      try {
        const { initCloudBase } = await import('../utils/cloudbase')
        await initCloudBase()
        await db.collection(DB_STORES.NICKNAMES).add({
          type: 'nickname',
          content,
          created_at: new Date()
        })
      } catch (e) {
        console.error('云端添加失败', e)
      }
    },

    async deleteCloudDialogue(_id: string) {
      if (!isCloudEnabled()) return
      try {
        const { initCloudBase } = await import('../utils/cloudbase')
        await initCloudBase()
        await db.collection(DB_STORES.CORPUS).doc(_id).remove()
      } catch (e) {
        console.error('云端删除失败', e)
      }
    },

    async deleteCloudNickname(_id: string) {
      if (!isCloudEnabled()) return
      try {
        const { initCloudBase } = await import('../utils/cloudbase')
        await initCloudBase()
        await db.collection(DB_STORES.NICKNAMES).doc(_id).remove()
      } catch (e) {
        console.error('云端删除失败', e)
      }
    },

    async clearCloudDialogues() {
      if (!isCloudEnabled()) return
      try {
        const { initCloudBase } = await import('../utils/cloudbase')
        await initCloudBase()
        const items = await this.fetchCloudDialogues()
        for (const item of items) {
          if (item._id) await db.collection(DB_STORES.CORPUS).doc(item._id).remove()
        }
      } catch (e) {
        console.error('云端清空失败', e)
      }
    },

    async clearCloudNicknames() {
      if (!isCloudEnabled()) return
      try {
        const { initCloudBase } = await import('../utils/cloudbase')
        await initCloudBase()
        const items = await this.fetchCloudNicknames()
        for (const item of items) {
          if (item._id) await db.collection(DB_STORES.NICKNAMES).doc(item._id).remove()
        }
      } catch (e) {
        console.error('云端清空失败', e)
      }
    }
  }
})
