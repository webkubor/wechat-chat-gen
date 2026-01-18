// 网图随机头像库
export interface RandomAvatarSource {
  name: string
  avatars: string[]
  description: string
  totalCount: number
}

function isValidRandomAvatarSource(obj: any): obj is RandomAvatarSource {
  return obj &&
         typeof obj === 'object' &&
         typeof obj.name === 'string' &&
         Array.isArray(obj.avatars) &&
         typeof obj.description === 'string' &&
         typeof obj.totalCount === 'number'
}

// 中国用户头像库 - 使用可靠的头像资源
const CHINESE_AVATAR_PACK_1: string[] = [
  // 使用GitHub头像API和一些可靠的头像服务
  'https://avatars.githubusercontent.com/u/1?v=4',
  'https://avatars.githubusercontent.com/u/2?v=4',
  'https://avatars.githubusercontent.com/u/3?v=4',
  'https://avatars.githubusercontent.com/u/4?v=4',
  'https://avatars.githubusercontent.com/u/5?v=4',
  'https://avatars.githubusercontent.com/u/6?v=4',
  'https://avatars.githubusercontent.com/u/7?v=4',
  'https://avatars.githubusercontent.com/u/8?v=4',
  'https://avatars.githubusercontent.com/u/9?v=4',
  'https://avatars.githubusercontent.com/u/10?v=4',
  'https://avatars.githubusercontent.com/u/11?v=4',
  'https://avatars.githubusercontent.com/u/12?v=4',
  'https://avatars.githubusercontent.com/u/13?v=4',
  'https://avatars.githubusercontent.com/u/14?v=4',
  'https://avatars.githubusercontent.com/u/15?v=4',
  'https://avatars.githubusercontent.com/u/16?v=4',
  'https://avatars.githubusercontent.com/u/17?v=4',
  'https://avatars.githubusercontent.com/u/18?v=4',
  'https://avatars.githubusercontent.com/u/19?v=4',
  'https://avatars.githubusercontent.com/u/20?v=4',
]

const CHINESE_AVATAR_PACK_2: string[] = [
  // 使用DiceBear的动漫风格头像，适合中国用户审美
  'https://api.dicebear.com/7.x/avataaars/svg?seed=chinese1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=chinese2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=chinese3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=chinese4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=chinese5',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=chinese6',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=chinese7',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=chinese8',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=chinese9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=chinese10',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=chinese11',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=chinese12',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=chinese13',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=chinese14',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=chinese15',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=chinese16',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=chinese17',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=chinese18',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=chinese19',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=chinese20',
]

const FOREIGN_AVATAR_PACK: string[] = [
  // 国际头像包 - 各种风格
  'https://randomuser.me/api/portraits/women/1.jpg',
  'https://randomuser.me/api/portraits/men/1.jpg',
  'https://randomuser.me/api/portraits/women/2.jpg',
  'https://randomuser.me/api/portraits/men/2.jpg',
  'https://randomuser.me/api/portraits/women/3.jpg',
  'https://randomuser.me/api/portraits/men/3.jpg',
  'https://randomuser.me/api/portraits/women/4.jpg',
  'https://randomuser.me/api/portraits/men/4.jpg',
  'https://randomuser.me/api/portraits/women/5.jpg',
  'https://randomuser.me/api/portraits/men/5.jpg',
]

export const RANDOM_AVATAR_SOURCES: RandomAvatarSource[] = [
  {
    name: '国内头像库1',
    avatars: CHINESE_AVATAR_PACK_1,
    description: '精选国内用户头像',
    totalCount: CHINESE_AVATAR_PACK_1.length
  },
  {
    name: '国内头像库2',
    avatars: CHINESE_AVATAR_PACK_2,
    description: '更多国内用户头像',
    totalCount: CHINESE_AVATAR_PACK_2.length
  },
  {
    name: '国际头像库',
    avatars: FOREIGN_AVATAR_PACK,
    description: '全球用户头像合集',
    totalCount: FOREIGN_AVATAR_PACK.length
  }
]

export class RandomAvatarService {
  private currentSource: RandomAvatarSource = RANDOM_AVATAR_SOURCES[0]!
  private shuffledAvatars: string[] = []

  constructor() {
    // 从 localStorage 恢复选择的平台
    const saved = localStorage.getItem('randomAvatarSource')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (isValidRandomAvatarSource(parsed)) {
          this.currentSource = parsed
          this.shuffleAvatars()
        }
      } catch (e) {
        console.warn('Failed to parse saved avatar source:', e)
      }
    } else {
      this.shuffleAvatars()
    }
  }

  private shuffleAvatars() {
    // Fisher-Yates 洗牌算法
    this.shuffledAvatars = [...this.currentSource.avatars]
    for (let i = this.shuffledAvatars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffledAvatars[i]!, this.shuffledAvatars[j]!] = [this.shuffledAvatars[j]!, this.shuffledAvatars[i]!]
    }
  }

  setSource(source: RandomAvatarSource) {
    this.currentSource = source
    this.shuffleAvatars()
    localStorage.setItem('randomAvatarSource', JSON.stringify({
      name: source.name,
      avatars: source.avatars,
      description: source.description,
      totalCount: source.totalCount
    }))
  }

  getCurrentSource(): RandomAvatarSource {
    return this.currentSource
  }

  getSources(): RandomAvatarSource[] {
    return RANDOM_AVATAR_SOURCES
  }

  // 获取随机头像URL
  generateRandomAvatar(): string {
    if (this.shuffledAvatars.length === 0) {
      return '' // 没有头像时的fallback
    }
    return this.shuffledAvatars[Math.floor(Math.random() * this.shuffledAvatars.length)]!
  }

  // 批量获取随机头像
  generateBatch(count: number = 20): string[] {
    const avatars: string[] = []
    for (let i = 0; i < count && i < this.shuffledAvatars.length; i++) {
      avatars.push(this.shuffledAvatars[i]!)
    }
    return avatars
  }

  // 获取所有头像（用于头像库显示）
  getAllAvatars(): string[] {
    return this.shuffledAvatars
  }

  // 重新洗牌
  reshuffle() {
    this.shuffleAvatars()
  }
}

// 创建单例实例
export const randomAvatarService = new RandomAvatarService()