import { ref } from 'vue'

export type ToastType = 'success' | 'error'

/**
 * 全局 Toast 提示逻辑
 */
export function useToast() {
  const toastMessage = ref('')
  const toastType = ref<ToastType>('success')
  let toastTimer: number | null = null

  const showToast = (message: string, type: ToastType = 'success') => {
    toastMessage.value = message
    toastType.value = type
    if (toastTimer) window.clearTimeout(toastTimer)
    toastTimer = window.setTimeout(() => {
      toastMessage.value = ''
    }, 2200)
  }

  return {
    toastMessage,
    toastType,
    showToast
  }
}