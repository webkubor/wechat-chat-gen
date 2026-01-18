import { ref } from 'vue'

const R2_WORKER_URL = import.meta.env.VITE_R2_WORKER_URL || ''

export interface UploadResult {
  url: string
  error: string
}

const DEFAULT_MAX_SIZE_MB = 5

export function useUpload() {
  const isUploading = ref(false)
  const uploadResult = ref<UploadResult>({ url: '', error: '' })

  const processFile = async (file: File, maxSizeMb = DEFAULT_MAX_SIZE_MB): Promise<string> => {
    if (!file.type.startsWith('image/')) {
      const msg = 'Please upload an image file'
      uploadResult.value.error = msg
      window.$message?.error(msg)
      return ''
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      const msg = `Image must be smaller than ${maxSizeMb}MB`
      uploadResult.value.error = msg
      window.$message?.error(msg)
      return ''
    }

    if (!R2_WORKER_URL) {
      const msg = 'Upload configuration missing'
      uploadResult.value.error = msg
      window.$message?.error(msg)
      return ''
    }

    try {
      isUploading.value = true
      uploadResult.value.error = ''
      uploadResult.value.url = ''

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(R2_WORKER_URL, {
        method: 'POST',
        body: formData,
        signal: new AbortController().signal
      })

      const result = await response.json()

      if (response.ok && result.success) {
        uploadResult.value.url = result.url
        window.$message?.success('Upload successful')
        return result.url
      } else {
        const errorMsg = result.error || 'Upload failed'
        uploadResult.value.error = errorMsg
        window.$message?.error(errorMsg)
        return ''
      }
    } catch (err: any) {
      const errorMsg = 'Upload error'
      uploadResult.value.error = errorMsg
      window.$message?.error(errorMsg)
      console.error(err)
      return ''
    } finally {
      isUploading.value = false
    }
  }

  return {
    isUploading,
    uploadResult,
    processFile
  }
}
