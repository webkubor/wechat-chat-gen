import { defineStore } from 'pinia'
import defaultBg from '../assets/bg.jpg'

export type MessageType = 'text' | 'system' | 'image'
export type DeviceType = 'ios' | 'android'

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
    starName: '周杰伦',
    location: '杭州',
    groupTitle: '周杰伦杭州站粉丝交流群',
    memberCount: 188,
    backgroundImage: defaultBg,
    deviceType: 'ios' as DeviceType,
    messages: [] as Message[],
    systemTemplates: [
      '"{name}"邀请"{invited}"加入了群聊',
      '"{name}"通过扫描二维码加入群聊',
      '"{name}"修改群名为"{title}"',
      '你邀请"{name}"加入了群聊'
    ]
  }),
  actions: {
    updateGroupTitle() {
      this.groupTitle = `${this.starName}${this.location}站粉丝交流群`
    },
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
    getRandomUser() {
      // Realistic WeChat Nicknames
      const names = [
        'AAA建材王总', '水晶女孩', 'Jay迷-小凯', '晴天', '一路向北', 
        '简单爱', '范特西', '告白气球', '七里香', '稻香', 
        '夜曲', '以父之名', '搁浅', '东风破', '发如雪',
        '快乐小狗', 'momo', '用户88291', '卡布奇诺', '往事随风',
        '花开富贵', '除了帅一无所有', '只是近黄昏', '小仙女', '大魔王',
        '我是你的优乐美', '周杰伦的奶茶', '叶惠美', '半岛铁盒', '龙卷风'
      ]
      const name = names[Math.floor(Math.random() * names.length)] || 'User'
      
      // Use Pravatar for real-person avatars (img 1-70 are valid real faces)
      const avatarId = Math.floor(Math.random() * 70) + 1
      const avatar = `https://i.pravatar.cc/300?img=${avatarId}`

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
    }
  }
})
