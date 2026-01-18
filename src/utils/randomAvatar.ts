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

// 国内网图头像库 - 从各种来源收集的真实头像
const CHINESE_AVATAR_PACK_1: string[] = [
  // 这里可以添加大量网图头像URL - 示例数据
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
  'https://randomuser.me/api/portraits/women/6.jpg',
  'https://randomuser.me/api/portraits/men/6.jpg',
  'https://randomuser.me/api/portraits/women/7.jpg',
  'https://randomuser.me/api/portraits/men/7.jpg',
  'https://randomuser.me/api/portraits/women/8.jpg',
  'https://randomuser.me/api/portraits/men/8.jpg',
  'https://randomuser.me/api/portraits/women/9.jpg',
  'https://randomuser.me/api/portraits/men/9.jpg',
  'https://randomuser.me/api/portraits/women/10.jpg',
  'https://randomuser.me/api/portraits/men/10.jpg',
]

const CHINESE_AVATAR_PACK_2: string[] = [
  // 另一个头像包 - 示例数据
  'https://randomuser.me/api/portraits/women/11.jpg',
  'https://randomuser.me/api/portraits/men/11.jpg',
  'https://randomuser.me/api/portraits/women/12.jpg',
  'https://randomuser.me/api/portraits/men/12.jpg',
  'https://randomuser.me/api/portraits/women/13.jpg',
  'https://randomuser.me/api/portraits/men/13.jpg',
  'https://randomuser.me/api/portraits/women/14.jpg',
  'https://randomuser.me/api/portraits/men/14.jpg',
  'https://randomuser.me/api/portraits/women/15.jpg',
  'https://randomuser.me/api/portraits/men/15.jpg',
]

const FOREIGN_AVATAR_PACK: string[] = [
  // 国外头像包 - 示例数据
  'https://randomuser.me/api/portraits/women/16.jpg',
  'https://randomuser.me/api/portraits/men/16.jpg',
  'https://randomuser.me/api/portraits/women/17.jpg',
  'https://randomuser.me/api/portraits/men/17.jpg',
  'https://randomuser.me/api/portraits/women/18.jpg',
  'https://randomuser.me/api/portraits/men/18.jpg',
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