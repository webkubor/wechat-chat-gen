import { ref, onBeforeUnmount } from 'vue'
import { toCanvas } from 'html-to-image'
import JSZip from 'jszip'

interface QueueItem {
  id: string
  blob: Blob
  url: string
  dataUrl: string
}

const STORAGE_KEY = 'wechat_preview_queue'

const dataUrlToBlob = (dataUrl: string) => {
  const [header, body] = dataUrl.split(',')
  if (!header || !body) throw new Error('无效的 data URL')
  const match = /data:(.*?);base64/.exec(header)
  const mime = match?.[1] || 'image/png'
  const binary = atob(body)
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

/**
 * 封装截图导出逻辑，使用全局 window.$message 进行提示
 */
export function useExport() {
  const isDownloading = ref(false)
  const exportIndex = ref(0)
  const queue = ref<QueueItem[]>([])

  const persistQueue = () => {
    const payload = queue.value.map(item => ({ id: item.id, dataUrl: item.dataUrl }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  const restoreQueue = () => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const items = JSON.parse(raw) as Array<{ id: string; dataUrl: string }>
      queue.value = items.map(item => {
        const blob = dataUrlToBlob(item.dataUrl)
        const url = URL.createObjectURL(blob)
        return { id: item.id, dataUrl: item.dataUrl, blob, url }
      })
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  restoreQueue()

  const triggerDownload = (name: string, blob: Blob) => {
    const link = document.createElement('a')
    link.download = name
    link.href = URL.createObjectURL(blob)
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
      link.remove()
      URL.revokeObjectURL(link.href)
    }, 100)
  }

  const capturePreviewCanvas = async () => {
    const element = document.getElementById('wechat-screen')
    if (!element) {
      window.$message.error('未找到预览区域，无法导出')
      return null
    }

    try {
      return await toCanvas(element, {
        cacheBust: true,
        backgroundColor: '#ededed',
        pixelRatio: 2,
        skipAutoScale: true
      })
    } catch (err) {
      console.error('渲染失败:', err)
      window.$message.error('渲染失败，请重试')
      return null
    }
  }

  const handleQuickDownload = async () => {
    const canvas = await capturePreviewCanvas()
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (!blob) return
      triggerDownload(`wechat-preview-${Date.now()}.png`, blob)
      window.$message.success('预览图导出成功')
    }, 'image/png')
  }

  const addToQueue = async () => {
    const canvas = await capturePreviewCanvas()
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    canvas.toBlob((blob) => {
      if (!blob) return
      const id = `queue_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const url = URL.createObjectURL(blob)
      queue.value.push({ id, blob, url, dataUrl })
      persistQueue()
      window.$message.success('已加入待下载队列')
    }, 'image/png')
  }

  const removeFromQueue = (id: string) => {
    const index = queue.value.findIndex(item => item.id === id)
    if (index === -1) return
    URL.revokeObjectURL(queue.value[index].url)
    queue.value.splice(index, 1)
    persistQueue()
  }

  const clearQueue = () => {
    queue.value.forEach(item => URL.revokeObjectURL(item.url))
    queue.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  const handleBatchDownload = async () => {
    if (isDownloading.value) return
    if (queue.value.length === 0) return
    isDownloading.value = true
    
    try {
      exportIndex.value = 0
      const zip = new JSZip()
      for (let i = 0; i < queue.value.length; i++) {
        exportIndex.value = i + 1
        const item = queue.value[i]
        zip.file(`wechat-queue-${Date.now()}-${i + 1}.png`, item.blob)
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      triggerDownload(`wechat-gen-${Date.now()}.zip`, zipBlob)
      window.$message.success('批量导出完成')
    } catch (e) {
      window.$message.error('批量导出失败')
    } finally {
      isDownloading.value = false
      exportIndex.value = 0
    }
  }

  onBeforeUnmount(() => {
    queue.value.forEach(item => URL.revokeObjectURL(item.url))
  })

  return {
    isDownloading,
    exportIndex,
    queue,
    handleQuickDownload,
    addToQueue,
    removeFromQueue,
    clearQueue,
    handleBatchDownload
  }
}
