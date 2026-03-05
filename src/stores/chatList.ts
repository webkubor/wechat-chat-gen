import { defineStore } from 'pinia'
import { localDB } from '../utils/localdb'
import { useAvatarStore } from './avatar'
import { randomAvatarService } from '../utils/randomAvatar'
import type { ChatListItem } from '../types/database'

export interface ChatListConfig {
  singerName: string
  concertName: string
  cities: string[]
  dates: string[]
  itemCount: number
}

const PRESET_CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '南京', '武汉', '西安', '重庆']

const PRESET_MESSAGES = [
  '谦友们进群进群蹲开票时间',
  '欢迎新人，大家一起来看演唱会！',
  '有人知道具体座位图吗？',
  '开票时间确定了通知一下',
  '大家一起抢票呀',
  '有没有群友一起从机场过去的？',
  '求组队求搭子',
  '这次票价怎么样？',
  '想坐前排，有没有攻略',
  '主办方给力点',
  '酒店定好了吗大家',
  '有出票的吗？',
  '终于等到官宣了',
  '有没有深圳场的群？'
]

const PRESET_SENDERS = [
  '谦友一号', '薛之谦的小迷妹', '演唱会达人', '抢票小能手',
  '音乐狂热粉', '周末看演出', '快乐追星', '演唱会门票收集者',
  '老薛的歌迷', '认真的雪', '演员', '丑八怪', '天外来物'
]

export const useChatListStore = defineStore('chatList', {
  state: () => ({
    config: {
      singerName: '薛之谦',
      concertName: '万兽之王',
      cities: ['北京', '上海', '广州', '深圳', '杭州', '成都'],
      dates: ['7.10', '8.15', '6.30', '9.20', '10.05', '11.11'],
      itemCount: 7
    } as ChatListConfig,
    items: [] as ChatListItem[]
  }),

  actions: {
    async init() {
      try {
        const saved = await localDB.loadChatListSession()
        if (saved) {
          this.config = saved.config || this.config
          this.items = saved.items || []
        }
        if (this.items.length === 0) {
          this.generateItems()
        }
      } catch (e) {
        console.error('加载群聊列表失败', e)
        this.generateItems()
      }
    },

    async save() {
      try {
        await localDB.saveChatListSession({
          config: JSON.parse(JSON.stringify(this.config)),
          items: JSON.parse(JSON.stringify(this.items)),
          updated_at: new Date()
        })
      } catch (e) {
        console.error('保存群聊列表失败', e)
      }
    },

    setConfig(config: Partial<ChatListConfig>) {
      this.config = { ...this.config, ...config }
      this.generateItems()
      this.save()
    },

    generateItems() {
      const avatarStore = useAvatarStore()
      const items: ChatListItem[] = []
      const { singerName, concertName, cities, dates, itemCount } = this.config

      for (let i = 0; i < itemCount; i++) {
        const city = cities[i % cities.length] || PRESET_CITIES[i % PRESET_CITIES.length]
        const date = dates[i % dates.length] || `${Math.floor(Math.random() * 12) + 1}.${Math.floor(Math.random() * 28) + 1}`
        const isGeneral = i % 3 === 0
        
        // 生成群聊标题
        let title: string
        if (isGeneral) {
          title = `${singerName}《${concertName}》总群`
        } else if (Math.random() > 0.5) {
          title = `${city} ${singerName}《${concertName}》${date}`
        } else {
          title = `${singerName}《${concertName}》${city} ${date}`
        }

        // 生成群聊头像（9个头像拼接）
        const avatars: string[] = []
        const randomAvatarEnabled = localStorage.getItem('randomAvatarEnabled') !== 'false'
        
        for (let j = 0; j < 9; j++) {
          if (randomAvatarEnabled) {
            avatars.push(randomAvatarService.generateRandomAvatar())
          } else {
            const customAvatars = avatarStore.customAvatars
            if (customAvatars.length > 0) {
              const avatarUrl = customAvatars[j % customAvatars.length]?.url
              avatars.push(avatarUrl || randomAvatarService.generateRandomAvatar())
            } else {
              avatars.push(randomAvatarService.generateRandomAvatar())
            }
          }
        }

        // 生成最后一条消息
        const sender = PRESET_SENDERS[Math.floor(Math.random() * PRESET_SENDERS.length)] || '谦友'
        const message = PRESET_MESSAGES[Math.floor(Math.random() * PRESET_MESSAGES.length)] || '欢迎大家进群！'
        
        // 生成时间
        const hours = Math.floor(Math.random() * 12) + 1
        const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0')
        const period = Math.random() > 0.5 ? '上午' : '下午'
        const time = `${period}${hours}:${minutes}`

        items.push({
          id: `chat_${i}_${Date.now()}`,
          title,
          lastMessage: message,
          lastSender: sender,
          time,
          avatars,
          unreadCount: Math.random() > 0.7 ? Math.floor(Math.random() * 99) + 1 : 0,
          isPinned: i < 2
        })
      }

      this.items = items
      this.save()
    },

    refreshItems() {
      this.generateItems()
    },

    updateItemField(id: string, field: keyof ChatListItem, value: string) {
      const item = this.items.find(item => item.id === id)
      if (item) {
        (item as any)[field] = value
        this.save()
      }
    }
  }
})
