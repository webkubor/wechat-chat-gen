import { ref, onBeforeUnmount } from 'vue'
import { toBlob } from 'html-to-image'
import JSZip from 'jszip'
import { localDB } from '../utils/localdb'

interface QueueItem {
  id: string
  blob: Blob
  url: string
}

/**
 * 封装截图导出逻辑，使用全局 window.$message 进行提示
 */
export function useExport() {
  const isDownloading = ref(false)
  const exportIndex = ref(0)
  const queue = ref<QueueItem[]>([])

  const restoreQueue = async () => {
    try {
      const items = await localDB.getAllPreviewQueueItems()
      queue.value = items.map(item => {
        const url = URL.createObjectURL(item.blob)
        return { id: item.id, blob: item.blob, url }
      })
    } catch (e) {
      console.error('预览队列恢复失败', e)
      window.$message.error('预览队列恢复失败')
    }
  }

  localDB.init().then(() => restoreQueue()).catch(() => {})

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

  const capturePreviewBlob = async () => {
    const element = document.getElementById('wechat-screen')
    if (!element) {
      window.$message.error('未找到预览区域，无法导出')
      return null
    }

    try {
      return await toBlob(element, {
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
    const blob = await capturePreviewBlob()
    if (!blob) {
      window.$message.error('导出失败，请重试')
      return
    }
    triggerDownload(`wechat-preview-${Date.now()}.png`, blob)
    window.$message.success('预览图导出成功')
  }

  const addToQueue = async () => {
    const blob = await capturePreviewBlob()
    if (!blob) {
      window.$message.error('加入队列失败，请重试')
      return
    }
    const id = `queue_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const url = URL.createObjectURL(blob)
    queue.value.push({ id, blob, url })
    try {
      await localDB.savePreviewQueueItem({ id, blob, created_at: new Date() })
    } catch (e) {
      console.error('队列持久化失败', e)
      window.$message.error('队列持久化失败，刷新后会丢失')
    }
    window.$message.success('已加入待下载队列')
  }

  const removeFromQueue = (id: string) => {
    const index = queue.value.findIndex(item => item.id === id)
    if (index === -1) return
    URL.revokeObjectURL(queue.value[index].url)
    queue.value.splice(index, 1)
    localDB.deletePreviewQueueItem(id).catch((e) => {
      console.error('队列删除失败', e)
      window.$message.error('队列删除失败')
    })
  }

  const clearQueue = () => {
    queue.value.forEach(item => URL.revokeObjectURL(item.url))
    queue.value = []
    localDB.clearPreviewQueue().catch((e) => {
      console.error('队列清空失败', e)
      window.$message.error('队列清空失败')
    })
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
