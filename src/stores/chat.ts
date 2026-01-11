import { defineStore } from 'pinia'
import { useCorpusStore } from './corpus'
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
    currentUser: { name: '我', avatar: '' }, // Placeholder, init in action or getter if needed, but simple obj here is fine if we init in getRandomUser logic context
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
    addMessage(msg: Message) {
      this.messages.push(msg)
    },
    removeMessage(id: string) {
      this.messages = this.messages.filter(m => m.id !== id)
    },
    clearMessages() {
      this.messages = []
    },
    setBg(url: string) {
      this.backgroundImage = url
    },
    setCurrentUserAvatar(avatar: string) {
      this.currentUser = { ...this.currentUser, avatar }
    },
    getRandomUser() {
      // 真实微信昵称库
      const names = [
        'AAA建材王总', '水晶女孩', '追光者', '晚风', '向日葵',
        '简单快乐', '星光收集者', '小幸运', '纸飞机', '晴空',
        '夜行者', '以梦为马', '搁浅的鲸', '东篱', '发光体',
        '快乐小狗', 'momo', '用户88291', '卡布奇诺', '往事随风',
        '花开富贵', '除了帅一无所有', '只是近黄昏', '小仙女', '大魔王',
        '我的奶茶', '山川与海', '半岛来信', '风筝与猫', '龙卷风',
        '淡泊人生', '云淡风轻', '往事如烟', '奋斗中的小李', '逆流而上',
        'Cc', 'David', 'Lisa', 'Mike', 'Tom', 'Jerry'
      ]
      
      // 精选高质感头像库 (Unsplash IDs)
      const avatarPool = [
        // 人像 (Portraits)
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        // 萌宠/静物 (Pets/Objects)
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=100&h=100&fit=crop',
        // 风景/花卉 (Scenery/Flowers - 非常符合某些用户习惯)
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=100&h=100&fit=crop'
      ]

      const name = names[Math.floor(Math.random() * names.length)] || '用户'
      const avatar = avatarPool[Math.floor(Math.random() * avatarPool.length)] || ''

      return {
        name,
        avatar
      }
    },
    batchAddMessages(lines: string[]) {
      lines.forEach(line => {
        if (!line.trim()) return
        
        // Check if line has format "Name: Content"
        const parts = line.split(/[:：]/)
        let sender = this.getRandomUser()
        let content = line
        let isMe = false

        if (parts.length > 1) {
          const namePart = parts[0]
          // Ensure name is a valid string
          if (namePart) {
            const name = namePart.trim()
            content = parts.slice(1).join(':').trim()
            if (name === 'Me' || name === '我') {
              isMe = true
              sender = { name: '我', avatar: '' }
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
    },
    batchAddRandomDialog(count: number) {
      // Ensure 'Me' has a consistent avatar for this session
      if (!this.currentUser.avatar) {
        const randomMe = this.getRandomUser()
        this.currentUser = { name: '我', avatar: randomMe.avatar }
      }

      const corpusStore = useCorpusStore()
      const corpusDialogues = corpusStore.dialogues.map(item => item.content).filter(Boolean)
      const hypes = corpusDialogues.length ? corpusDialogues : [
        '终于等到这一天了！', '有人出本场的票吗？求两张！', '我在场馆门口了，人超多！',
        '前排兜售瓜子饮料矿泉水~', '谁有歌单啊？求分享', '激动得睡不着觉',
        '今晚会有新歌吗？', '必须有啊！全场大合唱预定', '为了看演出特意请了假',
        '听说今晚有神秘嘉宾？', '真的假的？是谁啊？', '大家要注意防诈骗哦',
        '舞台效果太顶了！', '已经在检票口排队了', '天气不错，适合听演唱会',
        '有没有组队入场的？', '刚才在门口看到保姆车了！', '心跳已经120了'
      ]
      
      for (let i = 0; i < count; i++) {
        const isMe = Math.random() > 0.8
        const content = hypes[Math.floor(Math.random() * hypes.length)] || '...'
        
        // Use consistent current user for 'Me', random user for others
        const sender = isMe ? this.currentUser : this.getRandomUser()
        
        this.messages.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'text',
          content,
          sender,
          isMe
        })
      }
    },
    updateMessage(id: string, field: 'content' | 'name', value: string) {
      const msg = this.messages.find(m => m.id === id)
      if (msg) {
        if (field === 'content') {
          msg.content = value
        } else if (field === 'name' && msg.sender) {
          msg.sender.name = value
        }
      }
    }
  }
})
