import { ref } from 'vue'
import { toBlob, toCanvas } from 'html-to-image'
import JSZip from 'jszip'

interface ExportOptions {
  showToast: (msg: string, type?: 'success' | 'error') => void
  handleGenerate: () => void
}

/**
 * 封装截图导出逻辑
 */
export function useExport(options: ExportOptions) {
  const isDownloading = ref(false)
  const exportIndex = ref(0)

  const triggerDownload = (name: string, blob: Blob) => {
    const link = document.createElement('a')
    link.download = name
    link.href = URL.createObjectURL(blob)
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    // 延时释放，确保浏览器已开始处理下载
    setTimeout(() => {
      link.remove()
      URL.revokeObjectURL(link.href)
    }, 100)
  }

  /**
   * 快捷导出当前 PNG
   */
  const handleQuickDownload = async () => {
    const element = document.getElementById('wechat-screen')
    if (!element) {
      options.showToast('未找到预览区域，无法导出', 'error')
      return
    }

    try {
      const blob = await toBlob(element, {
        cacheBust: true,
        backgroundColor: '#ededed',
        pixelRatio: 2,
        skipAutoScale: true
      })

      if (!blob) throw new Error('Blob 生成失败')
      triggerDownload(`wechat-preview-${Date.now()}.png`, blob)
    } catch (err) {
      console.error('导出失败:', err)
      options.showToast('导出失败，请重试', 'error')
    }
  }

  /**
   * 渲染单张裁切后的图片 Blob
   */
  const renderImageBlob = async (index: number) => {
    const element = document.getElementById('wechat-screen')
    const header = document.getElementById('wechat-titlebar')
    const inputBar = document.getElementById('wechat-input-bar')
    if (!element || !header || !inputBar) {
      options.showToast('导出失败：找不到截图区域', 'error')
      return null
    }

    try {
      const cropTop = Math.max(0, header.offsetTop)
      const cropBottom = Math.max(0, inputBar.offsetTop)
      const cropHeight = Math.max(0, cropBottom - cropTop)
      const cropWidth = element.offsetWidth
      const exportHeight = cropHeight > 0 ? cropHeight : element.offsetHeight

      // 1. 生成全图 Canvas
      const fullCanvas = await toCanvas(element, {
        cacheBust: true,
        backgroundColor: '#ededed',
        pixelRatio: 2,
        skipAutoScale: true
      })

      // 2. 创建裁切 Canvas (2x 适配)
      const cropCanvas = document.createElement('canvas')
      cropCanvas.width = cropWidth * 2
      cropCanvas.height = exportHeight * 2
      const ctx = cropCanvas.getContext('2d')
      if (!ctx) throw new Error('Canvas Context 创建失败')

      // 3. 绘制指定区域
      ctx.drawImage(
        fullCanvas,
        0, cropTop * 2, cropWidth * 2, exportHeight * 2,
        0, 0, cropWidth * 2, exportHeight * 2
      )

      return new Promise<{ name: string; blob: Blob } | null>((resolve) => {
        cropCanvas.toBlob((blob) => {
          if (!blob) resolve(null)
          else resolve({ name: `wechat-gen-${Date.now()}-${index + 1}.png`, blob })
        }, 'image/png')
      })
    } catch (err) {
      console.error('渲染失败:', err)
      return null
    }
  }

  /**
   * 批量导出 ZIP
   */
  const handleBatchDownload = async (downloadCount: number) => {
    if (isDownloading.value) return
    isDownloading.value = true
    
    try {
      exportIndex.value = 0
      const zip = new JSZip()
      for (let i = 0; i < downloadCount; i++) {
        exportIndex.value = i + 1
        options.handleGenerate()
        // 等待 DOM 更新和图片加载
        await new Promise(resolve => setTimeout(resolve, 800)) 
        const image = await renderImageBlob(i)
        if (image?.blob) zip.file(image.name, image.blob)
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      triggerDownload(`wechat-gen-${Date.now()}.zip`, zipBlob)
      options.showToast('导出完成，已下载 ZIP', 'success')
    } catch (e) {
      options.showToast('批量导出失败', 'error')
    } finally {
      isDownloading.value = false
      exportIndex.value = 0
    }
  }

  return {
    isDownloading,
    exportIndex,
    handleQuickDownload,
    handleBatchDownload
  }
}