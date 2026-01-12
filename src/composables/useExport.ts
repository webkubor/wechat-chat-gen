import { ref } from 'vue'
import { toBlob, toCanvas } from 'html-to-image'
import JSZip from 'jszip'

interface ExportOptions {
  handleGenerate: () => void
}

/**
 * 封装截图导出逻辑，使用全局 window.$message 进行提示
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
    setTimeout(() => {
      link.remove()
      URL.revokeObjectURL(link.href)
    }, 100)
  }

  const handleQuickDownload = async () => {
    const element = document.getElementById('wechat-screen')
    if (!element) {
      window.$message.error('未找到预览区域，无法导出')
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
      window.$message.success('预览图导出成功')
    } catch (err) {
      console.error('导出失败:', err)
      window.$message.error('导出失败，请重试')
    }
  }

  const renderImageBlob = async (index: number) => {
    const element = document.getElementById('wechat-screen')
    const header = document.getElementById('wechat-titlebar')
    const inputBar = document.getElementById('wechat-input-bar')
    if (!element || !header || !inputBar) {
      window.$message.error('导出失败：找不到截图区域')
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
      console.error('渲染失败:', err)
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
      window.$message.success('批量导出完成')
    } catch (e) {
      window.$message.error('批量导出失败')
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
