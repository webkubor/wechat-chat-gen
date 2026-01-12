import cloudbase from '@cloudbase/js-sdk'

const envId = import.meta.env.VITE_CLOUDBASE_ENV_ID
const region = import.meta.env.VITE_CLOUDBASE_REGION
export const isCloudEnabled = () => import.meta.env.VITE_CLOUD_SYNC_ENABLED === 'true'

if (!envId) {
  console.warn('⚠️ CloudBase 未配置，云端同步功能将不可用。请在 .env 中配置 VITE_CLOUDBASE_ENV_ID')
}

type CloudbaseInitConfig = cloudbase.ICloudbaseConfig & { proxyUrl?: string }

// 初始化 CloudBase
const cloudbaseConfig: CloudbaseInitConfig = {
  env: envId || 'placeholder',
  region: region || 'ap-shanghai'
}

// 开发模式下使用 Vite 代理
if (import.meta.env.DEV) cloudbaseConfig.proxyUrl = '/tcb-api'

export const tcb = cloudbase.init(cloudbaseConfig)

// 登录初始化状态记录
let loginPromise: Promise<void> | null = null

export const initCloudBase = async () => {
  if (!isCloudEnabled()) return
  if (loginPromise) return loginPromise

  loginPromise = (async () => {
    try {
      const auth = tcb.auth()
      const loginState = await auth.getLoginState()
      if (!loginState) {
        await auth.signInAnonymously()
        console.log('☁️ CloudBase 匿名登录成功 (用于共享数据)')
      }
    } catch (e) {
      console.error('☁️ CloudBase 登录失败', e)
      throw e
    }
  })()

  return loginPromise
}

// 按需初始化数据库
export const db = tcb.database()
