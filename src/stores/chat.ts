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
    },
    batchAddJoinMessages(count: number) {
      for (let i = 0; i < count; i++) {
        const user = this.getRandomUser()
        this.messages.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'system',
          content: (this.systemTemplates[0] || '').replace('{name}', '管理员').replace('{invited}', user.name)
        })
      }
    },
    batchAddRandomDialog(count: number) {
      const hypes = [
        '终于等到这一天了！', '有人出杭州站的票吗？求两张！', '我在黄龙体育中心门口了，人超多！',
        '前排兜售瓜子饮料矿泉水~', '谁有歌单啊？求分享', '激动得睡不着觉',
        '今晚会有《稻香》吗？', '必须有啊！全场大合唱预定', '为了看杰伦特意请了假',
        '听说今晚有神秘嘉宾？', '真的假的？是谁啊？', '大家要注意防诈骗哦',
        '周董YYDS！', '已经在检票口排队了', '天气不错，适合听演唱会',
        '有没有组队入场的？', '刚才在门口看到保姆车了！', '心跳已经120了'
      ]
      
      for (let i = 0; i < count; i++) {
        const isMe = Math.random() > 0.8
        const content = hypes[Math.floor(Math.random() * hypes.length)] || '...'
        const sender = isMe ? { name: '我', avatar: '' } : this.getRandomUser()
        
        this.messages.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'text',
          content,
          sender,
          isMe
        })
      }
    }
  }
})
