import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { auth } from './utils/cloudbase'
import { initMessage } from './utils/message'

// 初始化全局消息提示 (window.$message)
initMessage()

// CloudBase 匿名登录初始化
const initCloudBase = async () => {
  try {
    const loginState = await auth.getLoginState()
    if (!loginState) {
      await (auth as any).anonymousAuthProvider().signIn()
      console.log('☁️ CloudBase 匿名登录成功')
    }
  } catch (e) {
    console.error('☁️ CloudBase 初始化失败', e)
  }
}

initCloudBase()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')