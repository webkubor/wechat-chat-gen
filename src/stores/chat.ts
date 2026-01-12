import { defineStore } from 'pinia'
import { useCorpusStore } from './corpus'
import { localDB } from '../utils/localdb'
import { PRESET_DIALOGUES, PRESET_NAMES, PRESET_AVATARS } from '../config/presets'
import defaultBg from '../assets/bg.jpg'

export type MessageType = 'text' | 'system' | 'image'
export type DeviceType = 'ios' | 'android'
export type StatusBarTheme = 'light' | 'dark'
export type PreviewTheme = 'light' | 'dark'

export interface Message {
  id: string
  type: MessageType
  content: string
  sender?: {
    name: string
    avatar: string
  }
  isMe?: boolean
  timestamp?: string
}

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
    backgroundImage: defaultBg,
    deviceType: 'ios' as DeviceType,
    statusBarTheme: 'dark' as StatusBarTheme,
    statusBarTime: '23:30',
    previewTheme: 'light' as PreviewTheme,
    currentUser: { name: '我', avatar: '' },
    messages: [] as Message[],
    systemTemplates: [
      '{name}邀请{invited}加入了群聊',
      '{invited}通过扫描{name}分享的二维码加入群聊',
      '{invited}通过群成员{name}分享的二维码加入群聊',
      '{name}邀请{invited}、{other}加入了群聊',
      '{invited}加入了群聊'
    ]
  }),
  actions: {
    // --- Persistence ---
    async init() {
      try {
        const saved = await localDB.loadChatSession()
        if (saved) {
          this.groupTitle = saved.groupTitle ?? this.groupTitle
          this.memberCount = saved.memberCount ?? this.memberCount
          this.backgroundImage = saved.backgroundImage ?? this.backgroundImage
          this.messages = saved.messages ?? []
          this.currentUser = saved.currentUser ?? this.currentUser
        }
      } catch (e) {
        console.error('Failed to load chat session', e)
      }
    },

    async save() {
      try {
        await localDB.saveChatSession({
          groupTitle: this.groupTitle,
          memberCount: this.memberCount,
          backgroundImage: this.backgroundImage,
          messages: JSON.parse(JSON.stringify(this.messages)),
          currentUser: JSON.parse(JSON.stringify(this.currentUser))
        })
      } catch (e) {
        console.error('Failed to save chat session', e)
      }
    },

    // --- Mutators ---
    addMessage(msg: Message) {
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
    setBg(url: string) {
      this.backgroundImage = url
      this.save()
    },
    setCurrentUserAvatar(avatar: string) {
      this.currentUser = { ...this.currentUser, avatar }
      this.save()
    },
    updateMessage(id: string, field: 'content' | 'name', value: string) {
      const msg = this.messages.find(m => m.id === id)
      if (msg) {
        if (field === 'content') {
          msg.content = value
        } else if (field === 'name' && msg.sender) {
          msg.sender.name = value
        }
        this.save()
      }
    },

    // --- Generators ---
    getRandomUser() {
      const name = PRESET_NAMES[Math.floor(Math.random() * PRESET_NAMES.length)] || '用户'
      const avatar = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)] || ''

      return {
        name,
        avatar
      }
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
      const corpusStore = useCorpusStore()
      const templates = corpusStore.systems.length
        ? corpusStore.systems.map(item => item.content)
        : this.systemTemplates

      for (let i = 0; i < count; i++) {
        const inviter = this.getRandomUser()
        const invited = this.getRandomUser()
        const other = this.getRandomUser()
        const template = templates[Math.floor(Math.random() * templates.length)] || '"{name}"邀请"{invited}"加入了群聊'
        
        const content = template
          .replace('{name}', `<span class="system-name">${inviter.name}</span>`)
          .replace('{invited}', `<span class="system-name">${invited.name}</span>`)
          .replace('{other}', `<span class="system-name">${other.name}</span>`)

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
