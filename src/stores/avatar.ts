import { defineStore } from 'pinia'
import { localDB } from '../utils/localdb'
import type { AvatarItem } from '../types/database'

export const MAX_CUSTOM_AVATARS = 100
export const MIN_CUSTOM_AVATARS = 10
export const MAX_AVATAR_SIZE_MB = 5

export const AVATAR_MESSAGES = {
  RULES: '自定义头像最多 100 个，单张不超过 5MB，少于 10 个不可删除',
  DELETE_LIMIT: '头像少于 10 个时不允许删除',
  UPLOAD_LIMIT: '头像库已满（最多 100 个）',
  DUPLICATE: '该头像已存在',
  UPLOAD_RULE: '支持拖拽上传，单张不超过 5MB'
} as const

export const useAvatarStore = defineStore('avatar', {
  state: () => ({
    avatars: [] as AvatarItem[]
  }),
  getters: {
    customAvatars: (state) => state.avatars,
    totalCustomCount: (state) => state.avatars.length,
    canAddMore: (state) => state.avatars.length < MAX_CUSTOM_AVATARS,
    canDeleteAvatar: (state) => state.avatars.length > MIN_CUSTOM_AVATARS
  },
  actions: {
    async init() {
      await localDB.init()
      await this.loadCustomAvatars()
    },

    async loadCustomAvatars() {
      const items = await localDB.getAllAvatars()
      this.avatars = this.deduplicateAvatars(
        items
          .map(item => ({
            ...item,
            created_at: item.created_at instanceof Date ? item.created_at : new Date(item.created_at)
          }))
          .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      )
    },

    deduplicateAvatars(avatars: AvatarItem[]): AvatarItem[] {
      const map = new Map<string, AvatarItem>()
      for (const a of avatars) {
        const key = a.url
        if (!map.has(key)) {
          map.set(key, a)
        } else {
          const existing = map.get(key)!
          const aTime = a.created_at instanceof Date ? a.created_at.getTime() : new Date(a.created_at).getTime()
          const eTime = existing.created_at instanceof Date ? existing.created_at.getTime() : new Date(existing.created_at).getTime()
          if (aTime < eTime) {
            map.set(key, a)
          }
        }
      }
      return Array.from(map.values())
    },

    async addCustomAvatar(url: string) {
      if (!url) return false
      if (this.avatars.length >= MAX_CUSTOM_AVATARS) return false

      const existing = this.avatars.find(a => a.url === url)
      if (existing) {
        window.$message?.info(AVATAR_MESSAGES.DUPLICATE)
        return false
      }

      const item: AvatarItem = {
        id: `avatar_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        url,
        created_at: new Date()
      }

      await localDB.saveAvatar(item)
      await this.loadCustomAvatars()
      return true
    },

    async removeCustomAvatar(id: string) {
      if (this.avatars.length <= MIN_CUSTOM_AVATARS) return false
      await localDB.deleteAvatar(id)
      await this.loadCustomAvatars()
      return true
    },

    async clearCustomAvatars() {
      await localDB.clearAvatars()
      await this.loadCustomAvatars()
    }
  }
})
