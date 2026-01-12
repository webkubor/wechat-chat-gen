import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { auth } from './utils/cloudbase'
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
    const loginState = await auth.getLoginState()
    if (!loginState) {
      await (auth as any).anonymousAuthProvider().signIn()
      console.log('☁️ CloudBase 匿名登录成功')
    }
  } catch (e) {
    handleError(e) // 使用统一错误处理
  }
}

initCloudBase()

const app = createApp(App)
app.config.errorHandler = (err) => handleError(err)
app.use(createPinia())
app.use(router)
app.mount('#app')