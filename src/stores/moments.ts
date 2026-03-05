import { defineStore } from 'pinia'
import { localDB } from '../utils/localdb'
import { useAvatarStore } from './avatar'
import { randomAvatarService } from '../utils/randomAvatar'
import type { MomentsConfig, MomentsPost, MomentsComment, MomentsSession } from '../types/database'

const PRESET_TOPICS = [
  '开票倒计时',
  '抢票攻略',
  '场次官宣',
  '粉丝应援',
  '周边清单',
  '进场路线',
  '散场拼车'
]

const PRESET_LOCATIONS = ['上海站', '北京站', '深圳站', '杭州站', '成都站', '广州站']

const PRESET_NAMES = [
  '谦友一号', '看台蹲票', '内场候补', '抢票小能手', '演唱会搭子', '老薛歌迷', '前排许愿', '场控小助手', '追星小分队', '票务情报员'
]

const COMMENT_TEMPLATES = [
  '这个场次我也冲',
  '求开票时间截图',
  '我在这场，拉我进群',
  '蹲一个抢票搭子',
  '这个攻略太实用了',
  '看到就开始紧张了'
]

const CONTENT_TEMPLATES = [
  '{topic}更新：这场我先建群了，想一起抢票的评论区集合。',
  '{topic}进度同步，大家把实名信息先核对好，开票别慌。',
  '今天整理了{topic}，按这个节奏冲会稳很多。',
  '{topic}已开冲，捡漏和候补都别放弃。',
  '{topic}提醒：进场证件、路线、集合点都先确认。'
]

const IMAGE_COUNT_OPTIONS = [1, 3, 4, 6, 9]

const formatTime = () => {
  const dayOffset = Math.floor(Math.random() * 4)
  const hours = Math.floor(Math.random() * 24).toString().padStart(2, '0')
  const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0')

  if (dayOffset === 0) return `今天 ${hours}:${minutes}`
  if (dayOffset === 1) return `昨天 ${hours}:${minutes}`
  return `${dayOffset + 1}天前 ${hours}:${minutes}`
}

const createImageToken = (seed: number, topic: string) => `${seed}|${topic}`

const pickRandom = <T>(list: T[], fallback: T): T => {
  if (list.length === 0) return fallback
  return list[Math.floor(Math.random() * list.length)] || fallback
}

const makeComments = (count: number): MomentsComment[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `comment_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 8)}`,
    userName: pickRandom(PRESET_NAMES, '微信好友'),
    content: pickRandom(COMMENT_TEMPLATES, '赞')
  }))
}

export const useMomentsStore = defineStore('moments', {
  state: () => ({
    config: {
      ownerName: '抢票情报站',
      ownerAvatar: '',
      postCount: 6,
      topics: ['开票倒计时', '抢票攻略', '场次官宣'],
      locations: ['上海站', '杭州站', '深圳站']
    } as MomentsConfig,
    posts: [] as MomentsPost[]
  }),

  actions: {
    async init() {
      try {
        const avatarStore = useAvatarStore()
        await avatarStore.init()

        const saved = await localDB.loadMomentsSession()
        if (saved) {
          this.config = saved.config || this.config
          this.posts = saved.posts || []
        }

        if (!this.config.ownerAvatar) {
          const firstAvatar = avatarStore.customAvatars[0]?.url
          this.config.ownerAvatar = firstAvatar || randomAvatarService.generateRandomAvatar()
        }

        if (this.posts.length === 0) {
          this.generatePosts()
        }
      } catch (error) {
        console.error('加载朋友圈会话失败', error)
        this.generatePosts()
      }
    },

    async save() {
      try {
        const payload: MomentsSession = {
          key: 'current',
          config: JSON.parse(JSON.stringify(this.config)),
          posts: JSON.parse(JSON.stringify(this.posts)),
          updated_at: new Date()
        }
        await localDB.saveMomentsSession(payload)
      } catch (error) {
        console.error('保存朋友圈会话失败', error)
      }
    },

    setConfig(config: Partial<MomentsConfig>, shouldRegenerate = false) {
      this.config = { ...this.config, ...config }
      if (shouldRegenerate) {
        this.generatePosts()
        return
      }
      this.save()
    },

    updateOwnerName(name: string) {
      this.config.ownerName = name
      this.posts = this.posts.map((post) => ({
        ...post,
        userName: name
      }))
      this.save()
    },

    updateOwnerAvatar(avatar: string) {
      this.config.ownerAvatar = avatar
      this.posts = this.posts.map((post) => ({
        ...post,
        avatar
      }))
      this.save()
    },

    updatePostContent(id: string, content: string) {
      const post = this.posts.find(item => item.id === id)
      if (!post) return
      post.content = content
      this.save()
    },

    clearPosts() {
      this.posts = []
      this.save()
    },

    refreshPosts() {
      this.generatePosts()
    },

    generatePosts() {
      const { ownerName, ownerAvatar, postCount, topics, locations } = this.config
      const nextPosts: MomentsPost[] = []

      for (let i = 0; i < postCount; i++) {
        const topic = pickRandom(topics, pickRandom(PRESET_TOPICS, '日常记录'))
        const location = pickRandom(locations, pickRandom(PRESET_LOCATIONS, '中国'))
        const template = pickRandom(CONTENT_TEMPLATES, '记录一下{topic}')
        const content = template.replace('{topic}', topic)

        const imageCount = pickRandom(IMAGE_COUNT_OPTIONS, 3)
        const images = Array.from({ length: imageCount }, (_, index) => createImageToken(i * 17 + index + 1, topic))

        const likesCount = Math.floor(Math.random() * 5)
        const likesPool = [...PRESET_NAMES].sort(() => Math.random() - 0.5)
        const likes = likesPool.slice(0, likesCount)

        const comments = makeComments(Math.floor(Math.random() * 3))

        nextPosts.push({
          id: `moment_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 8)}`,
          userName: ownerName || '微信用户',
          avatar: ownerAvatar || randomAvatarService.generateRandomAvatar(),
          content,
          images,
          location,
          time: formatTime(),
          likes,
          comments
        })
      }

      this.posts = nextPosts
      this.save()
    }
  }
})
