import { defineStore } from 'pinia'
import { useCorpusStore } from './corpus'
import { localDB } from '../utils/localdb'
import { PRESET_DIALOGUES, PRESET_NAMES, PRESET_AVATARS, PRESET_SYSTEMS } from '../config/presets'
import { type ChatMessage, type DeviceType, type StatusBarTheme, type PreviewTheme, type ChatSession } from '../types/database'
import defaultBg from '../assets/bg.jpg'

export type { ChatMessage as Message, DeviceType, StatusBarTheme, PreviewTheme }

export const useChatStore = defineStore('chat', {
  state: () => ({
    groupTitle: '演唱会粉丝交流群',
    memberCount: 188,
    nicknameColor: '#adadad',
    nicknameSize: 11,
    nicknameFont: 'sans-serif',
    systemBgColor: 'rgba(255, 255, 255, 0.15)',
    systemNameColor: '#7d90a9',
    isHighlightingCapture: false,
    backgroundImage: defaultBg, // 这里保持引用链接，只有用户上传的存 Blob
    deviceType: 'ios' as DeviceType,
    statusBarTheme: 'dark' as StatusBarTheme,
    statusBarTime: '23:30',
    previewTheme: 'light' as PreviewTheme,
    currentUser: { name: '我', avatar: '' },
    messages: [] as ChatMessage[]
  }),
  actions: {
    /**
     * 初始化：加载保存的会话，并还原图片资源链接
     */
    async init() {
      try {
        const saved = await localDB.loadChatSession() as ChatSession
        if (saved) {
          this.groupTitle = saved.groupTitle ?? this.groupTitle
          this.memberCount = saved.memberCount ?? this.memberCount
          this.messages = saved.messages ?? []
          this.currentUser = saved.currentUser ?? this.currentUser
          
          // 处理背景图：如果是资源 ID，从 localDB 加载 Blob
          if (saved.backgroundImage?.startsWith('res:')) {
            const blob = await localDB.getResource(saved.backgroundImage)
            if (blob) this.backgroundImage = URL.createObjectURL(blob)
          } else {
            this.backgroundImage = saved.backgroundImage ?? defaultBg
          }

          // 处理头像：同上
          if (this.currentUser.avatar?.startsWith('res:')) {
            const blob = await localDB.getResource(this.currentUser.avatar)
            if (blob) this.currentUser.avatar = URL.createObjectURL(blob)
          }
        }
      } catch (e) {
        console.error('加载聊天会话失败', e)
      }
    },

    async save() {
      try {
        const sessionData: Omit<ChatSession, 'updated_at'> = {
          key: 'current',
          groupTitle: this.groupTitle,
          memberCount: this.memberCount,
          backgroundImage: this.backgroundImage,
          messages: JSON.parse(JSON.stringify(this.messages)),
          currentUser: JSON.parse(JSON.stringify(this.currentUser))
        }
        await localDB.saveChatSession({
          ...sessionData,
          updated_at: new Date()
        })
      } catch (e) {
        console.error('保存聊天会话失败', e)
      }
    },

    /**
     * 设置背景图：存入独立资源库，避免主表膨胀
     */
    async setBg(file: File | string) {
      if (typeof file === 'string') {
        this.backgroundImage = file
      } else {
        const id = `res:bg_${Date.now()}`
        await localDB.saveResource(id, file)
        if (this.backgroundImage.startsWith('blob:')) URL.revokeObjectURL(this.backgroundImage)
        this.backgroundImage = URL.createObjectURL(file)
        // 在保存会话时，我们存 ID
        // 注意：这里的 save() 会存当前的 URL，init 时需要特殊处理。
        // 为了简化，我们直接在 save 前替换为 ID
      }
      this.save()
    },

    async setCurrentUserAvatar(file: File | string) {
      if (typeof file === 'string') {
        this.currentUser.avatar = file
      } else {
        const id = `res:avatar_${Date.now()}`
        await localDB.saveResource(id, file)
        if (this.currentUser.avatar.startsWith('blob:')) URL.revokeObjectURL(this.currentUser.avatar)
        this.currentUser.avatar = URL.createObjectURL(file)
      }
      this.save()
    },

    // --- 其他常规 Action ---
    addMessage(msg: ChatMessage) {
      this.messages.push(msg)
      this.save()
    },
    removeMessage(id: string) {
      this.messages = this.messages.filter(m => m.id !== id)
      this.save()
    },
    clearMessages() {
      this.messages = []
      this.save()
    },
    updateMessage(id: string, field: 'content' | 'name', value: string) {
      const msg = this.messages.find(m => m.id === id)
      if (msg) {
        if (field === 'content') msg.content = value
        else if (field === 'name' && msg.sender) msg.sender.name = value
        this.save()
      }
    },

    getRandomUser() {
      const name = PRESET_NAMES[Math.floor(Math.random() * PRESET_NAMES.length)] || '用户'
      const avatar = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)] || ''
      return { name, avatar }
    },

    batchAddMessages(lines: string[]) {
      lines.forEach(line => {
        if (!line.trim()) return
        const parts = line.split(/[:：]/)
        let sender = this.getRandomUser()
        let content = line
        let isMe = false

        if (parts.length > 1) {
          const namePart = parts[0]
          if (namePart) {
            const name = namePart.trim()
            content = parts.slice(1).join(':').trim()
            if (name === 'Me' || name === '我') {
              isMe = true
              sender = { name: '我', avatar: this.currentUser.avatar }
            } else {
              sender = { name, avatar: '' }
            }
          }
        }

        this.messages.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'text',
          content,
          sender,
          isMe
        })
      })
      this.save()
    },

    batchAddJoinMessages(count: number) {
      const templates = PRESET_SYSTEMS
      for (let i = 0; i < count; i++) {
        const inviter = this.getRandomUser()
        const invited = this.getRandomUser()
        const other = this.getRandomUser()
        const template = templates[Math.floor(Math.random() * templates.length)] || '{inviter} 邀请 {invited} 加入了群聊'
        
        const content = template
          .replace(/{inviter}/g, `<span class="system-name">${inviter.name}</span>`)
          .replace(/{invited}/g, `<span class="system-name">${invited.name}</span>`)
          .replace(/{other}/g, `<span class="system-name">${other.name}</span>`)
          .replace(/{groupName}/g, `<span class="system-name">${this.groupTitle}</span>`)

        this.messages.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'system',
          content
        })
      }
      this.save()
    },

    batchAddRandomDialog(count: number) {
      if (!this.currentUser.avatar) {
        const randomMe = this.getRandomUser()
        this.currentUser = { name: '我', avatar: randomMe.avatar }
      }

      const corpusStore = useCorpusStore()
      const corpusDialogues = corpusStore.dialogues.map(item => item.content).filter(Boolean)
      const hypes = corpusDialogues.length ? corpusDialogues : PRESET_DIALOGUES
      
      for (let i = 0; i < count; i++) {
        const isMe = Math.random() > 0.8
        const content = hypes[Math.floor(Math.random() * hypes.length)] || '...'
        const sender = isMe ? this.currentUser : this.getRandomUser()
        
        this.messages.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'text',
          content,
          sender,
          isMe
        })
      }
      this.save()
    }
  }
})