import { ref } from 'vue'
import { toBlob, toCanvas } from 'html-to-image'
import JSZip from 'jszip'

interface ExportOptions {
  showToast: (msg: string, type?: 'success' | 'error') => void
  handleGenerate: () => void
}

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
    setTimeout(() => {
      link.remove()
      URL.revokeObjectURL(link.href)
    }, 100)
  }

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

      if (!blob) throw new Error('Blob generation failed')
      triggerDownload(`wechat-preview-${Date.now()}.png`, blob)
    } catch (err) {
      console.error('Export failed:', err)
      options.showToast('导出失败，请重试', 'error')
    }
  }

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

      const fullCanvas = await toCanvas(element, {
        cacheBust: true,
        backgroundColor: '#ededed',
        pixelRatio: 2,
        skipAutoScale: true
      })

      const cropCanvas = document.createElement('canvas')
      cropCanvas.width = cropWidth * 2
      cropCanvas.height = exportHeight * 2
      const ctx = cropCanvas.getContext('2d')
      if (!ctx) throw new Error('Canvas Context 创建失败')

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
      console.error('Render failed:', err)
      return null
    }
  }

  const handleBatchDownload = async (downloadCount: number) => {
    if (isDownloading.value) return
    isDownloading.value = true
    
    try {
      exportIndex.value = 0
      const zip = new JSZip()
      for (let i = 0; i < downloadCount; i++) {
        exportIndex.value = i + 1
        options.handleGenerate()
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
