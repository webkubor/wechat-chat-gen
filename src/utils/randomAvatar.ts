// 随机头像服务
export interface RandomAvatarSource {
  name: string
  url: string
  description: string
}

function isValidRandomAvatarSource(obj: any): obj is RandomAvatarSource {
  return obj &&
         typeof obj === 'object' &&
         typeof obj.name === 'string' &&
         typeof obj.url === 'string' &&
         typeof obj.description === 'string'
}

// 国内随机头像平台配置
export const RANDOM_AVATAR_SOURCES: RandomAvatarSource[] = [
  {
    name: '随机头像生成器',
    url: 'https://api.multiavatar.com/',
    description: '多风格头像生成'
  },
  {
    name: 'DiceBear',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=',
    description: '冒险者风格头像'
  },
  {
    name: 'RoboHash',
    url: 'https://robohash.org/',
    description: '机器人风格头像'
  },
  {
    name: '头像API',
    url: 'https://api.avatars.io/',
    description: '通用头像服务'
  }
]

export class RandomAvatarService {
  private currentSource: RandomAvatarSource = RANDOM_AVATAR_SOURCES[0]!

  constructor() {
    // 从 localStorage 恢复选择的平台
    const saved = localStorage.getItem('randomAvatarSource')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (isValidRandomAvatarSource(parsed)) {
          this.currentSource = parsed
        }
      } catch (e) {
        console.warn('Failed to parse saved avatar source:', e)
      }
    }
  }

  setSource(source: RandomAvatarSource) {
    this.currentSource = source
    localStorage.setItem('randomAvatarSource', JSON.stringify(source))
  }

  getCurrentSource(): RandomAvatarSource {
    return this.currentSource
  }

  getSources(): RandomAvatarSource[] {
    return RANDOM_AVATAR_SOURCES
  }

  // 生成随机头像URL
  generateRandomAvatar(seed?: string): string {
    const randomSeed = seed || Math.random().toString(36).substr(2, 9)

    switch (this.currentSource.name) {
      case '随机头像生成器':
        return `${this.currentSource.url}${randomSeed}.png`

      case 'DiceBear':
        return `${this.currentSource.url}${randomSeed}`

      case 'RoboHash':
        return `${this.currentSource.url}${randomSeed}.png?size=200x200`

      case '头像API':
        return `${this.currentSource.url}avatars/random/${randomSeed}`

      default:
        return `${this.currentSource.url}${randomSeed}.png`
    }
  }

  // 批量生成随机头像
  generateBatch(count: number = 20): string[] {
    const avatars: string[] = []
    for (let i = 0; i < count; i++) {
      avatars.push(this.generateRandomAvatar())
    }
    return avatars
  }
}

// 创建单例实例
export const randomAvatarService = new RandomAvatarService()