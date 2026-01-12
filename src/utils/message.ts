import { h, render } from 'vue'
import GlobalMessage, { type MessageType } from '../components/ui/GlobalMessage.vue'

/**
 * 初始化全局消息系统
 */
export function initMessage() {
  // 1. 创建挂载容器
  const container = document.createElement('div')
  container.id = 'global-message-container'
  document.body.appendChild(container)

  // 2. 创建并挂载组件实例
  const vnode = h(GlobalMessage)
  render(vnode, container)

  // 3. 获取暴露的方法
  const messageInstance = vnode.component?.exposed as { 
    add: (text: string, type: MessageType, duration?: number) => void 
  }

  // 4. 定义全局 API
  const $message = {
    success: (text: string, duration?: number) => messageInstance.add(text, 'success', duration),
    error: (text: string, duration?: number) => messageInstance.add(text, 'error', duration),
    info: (text: string, duration?: number) => messageInstance.add(text, 'info', duration)
  }

  // 5. 绑定到 window
  window.$message = $message

  return $message
}

// 为 TypeScript 声明全局变量
declare global {
  interface Window {
    $message: {
      success: (text: string, duration?: number) => void
      error: (text: string, duration?: number) => void
      info: (text: string, duration?: number) => void
    }
  }
}
