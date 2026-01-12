import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { tcb } from './utils/cloudbase'
import { initMessage } from './utils/message'

// 初始化全局消息提示 (window.$message)
const $message = initMessage()

/**
 * 全局错误处理：提示 + 自动复制到剪贴板
 */
const handleError = (error: any) => {
  const message = error?.message || String(error)
  $message.error(`系统错误: ${message}`)
  
  // 自动复制到剪贴板 (用户偏好)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(message).catch(() => {})
  }
}

// 捕获同步/异步错误
window.onerror = (msg) => handleError(msg)
window.onunhandledrejection = (event) => handleError(event.reason)

// CloudBase 匿名登录初始化
const initCloudBase = async () => {
  try {
    const auth = tcb.auth()
    const loginState = await auth.getLoginState()
    if (!loginState) {
      // 兼容不同版本的 SDK：有的版本是函数，有的版本是对象
      const provider = (auth as any).anonymousAuthProvider
      
      if (typeof provider === 'function') {
        await provider().signIn()
      } else if (provider && typeof provider.signIn === 'function') {
        await provider.signIn()
      } else if (typeof (auth as any).signInAnonymously === 'function') {
        await (auth as any).signInAnonymously()
      } else {
        throw new Error('当前 CloudBase SDK 环境不支持匿名登录，请检查控制台配置或 SDK 版本')
      }
      console.log('☁️ CloudBase 匿名登录成功')
    }
  } catch (e) {
    handleError(e)
  }
}

initCloudBase()

const app = createApp(App)
app.config.errorHandler = (err) => handleError(err)
app.use(createPinia())
app.use(router)
app.mount('#app')