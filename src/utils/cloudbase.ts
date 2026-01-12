import cloudbase from '@cloudbase/js-sdk'

const envId = import.meta.env.VITE_CLOUDBASE_ENV_ID
const region = import.meta.env.VITE_CLOUDBASE_REGION

if (!envId) {
  console.warn('⚠️ CloudBase 未配置，云端同步功能将不可用。请在 .env 中配置 VITE_CLOUDBASE_ENV_ID')
}

// 初始化 CloudBase
export const tcb = cloudbase.init({
  env: envId || 'placeholder',
  region: region || 'ap-shanghai'
})

// 初始化数据库
export const db = tcb.database()

// 初始化鉴权
export const auth = tcb.auth()