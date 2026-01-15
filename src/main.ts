import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { initCloudBase, isCloudEnabled } from './utils/cloudbase'
import { initMessage } from './utils/message'
import { initConfirm } from './utils/confirm'
import { initAudioOnClick } from './composables/useSound'

// 初始化全局消息提示 (window.$message)
const $message = initMessage()
initConfirm()
initAudioOnClick()

/**
 * 全局错误处理：提示 + 自动复制到剪贴板
 */
const handleError = (error: any) => {
  const message = error?.message || String(error)
  
  // 针对 CloudBase 常见的网络请求错误（通常是安全域名问题）进行优化提示
  if (message.includes('network request error')) {
    $message.error('网络请求失败：请检查 CloudBase 安全域名配置或网络连接')
  } else {
    $message.error(`系统错误: ${message}`)
  }
  
  // 自动复制到剪贴板 (用户偏好)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(message).catch(() => {})
  }
}

// 捕获同步/异步错误
window.onerror = (msg) => handleError(msg)
window.onunhandledrejection = (event) => handleError(event.reason)

// 预热 CloudBase 匿名登录
if (isCloudEnabled()) {
  initCloudBase().catch(() => {
    console.warn('☁️ CloudBase 初始化失败，云端功能可能受限')
  })
}

const app = createApp(App)
app.config.errorHandler = (err) => handleError(err)
app.use(createPinia())
app.use(router)
app.mount('#app')
