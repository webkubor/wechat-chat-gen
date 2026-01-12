<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useChatStore } from '../stores/chat'
import { useCorpusStore } from '../stores/corpus'
import { toBlob, toCanvas } from 'html-to-image'
import BaseSelect from './ui/BaseSelect.vue'
import JSZip from 'jszip'

const chatStore = useChatStore()
const corpusStore = useCorpusStore()
const currentMode = ref<'chat' | 'join'>('chat')
const genCount = ref(20)
const downloadCount = ref(3)
const isDownloading = ref(false)
const exportIndex = ref(0)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')
const version = __APP_VERSION__
let toastTimer: number | null = null

// Option Constants
const themeOptions = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' }
]

const deviceOptions = [
  { label: 'iOS 风格', value: 'ios' },
  { label: 'Android 风格', value: 'android' }
]

const fontOptions = [
  { label: '默认无衬线', value: 'sans-serif' },
  { label: '苹方 (Mac/iOS)', value: "'PingFang SC', sans-serif" },
  { label: '微软雅黑 (Win)', value: "'Microsoft YaHei', sans-serif" },
  { label: '衬线体 (优雅)', value: 'serif' },
  { label: '等宽体 (极客)', value: 'monospace' }
]

const statusBarThemeOptions = [
  { label: '黑色图标', value: 'dark' },
  { label: '白色图标', value: 'light' }
]

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message
  toastType.value = type
  if (toastTimer) window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toastMessage.value = ''
  }, 2200)
}

onMounted(async () => {
  await corpusStore.init()
  // 初始进入自动生成20条对话，避免空白
  chatStore.batchAddRandomDialog(20)
})

watch(currentMode, (newMode) => {
  chatStore.clearMessages()
  if (newMode === 'join') {
    chatStore.batchAddJoinMessages(20)
  } else {
    chatStore.batchAddRandomDialog(20)
  }
})

watch(() => chatStore.previewTheme, (theme) => {
  chatStore.statusBarTheme = theme === 'dark' ? 'light' : 'dark'
})

const handleBgUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      chatStore.setBg(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }
}

const handleAvatarUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      chatStore.setCurrentUserAvatar(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }
}

const handleGenerate = () => {
  chatStore.clearMessages()
  if (currentMode.value === 'join') {
    chatStore.batchAddJoinMessages(genCount.value)
  } else {
    chatStore.batchAddRandomDialog(genCount.value)
  }
}

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
    showToast('未找到预览区域，无法导出', 'error')
    return
  }

  try {
    const blob = await toBlob(element, {
      cacheBust: true,
      backgroundColor: '#ededed',
      pixelRatio: 2,
      skipAutoScale: true
    })

    if (!blob) {
      showToast('导出失败：无法生成图片', 'error')
      return
    }

    triggerDownload(`wechat-preview-${Date.now()}.png`, blob)
  } catch (err) {
    console.error('Export failed:', err)
    const message = err instanceof Error ? err.message : '导出失败，请重试'
    showToast(message, 'error')
  }
}

const renderImageBlob = async (index: number) => {
  const element = document.getElementById('wechat-screen')
  const header = document.getElementById('wechat-titlebar')
  const inputBar = document.getElementById('wechat-input-bar')
  if (!element || !header || !inputBar) {
    showToast('导出失败：找不到截图区域', 'error')
    return
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

    const blob = await new Promise<Blob | null>((resolve) => {
      cropCanvas.toBlob(resolve, 'image/png')
    })

    if (!blob) {
      showToast('导出失败：无法生成图片', 'error')
      return
    }

    return {
      name: `wechat-gen-${Date.now()}-${index + 1}.png`,
      blob
    }
  } catch (err) {
    console.error('Export failed:', err)
    const message = err instanceof Error ? err.message : '导出失败，请重试'
    showToast(message, 'error')
  }
}

const handleBatchDownload = async () => {
  if (isDownloading.value) return
  isDownloading.value = true
  
  try {
    exportIndex.value = 0
    const zip = new JSZip()
    for (let i = 0; i < downloadCount.value; i++) {
      exportIndex.value = i + 1
      handleGenerate()
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 800)) 
      const image = await renderImageBlob(i)
      if (image?.blob) zip.file(image.name, image.blob)
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    triggerDownload(`wechat-gen-${Date.now()}.zip`, zipBlob)
    showToast('导出完成，已下载 ZIP', 'success')
  } finally {
    isDownloading.value = false
    exportIndex.value = 0
  }
}
</script>

<template>
  <div class="space-y-8 relative">
    <transition name="toast">
      <div
        v-if="toastMessage"
        class="fixed top-6 right-6 z-[100] px-4 py-2 rounded-xl text-xs font-medium shadow-2xl backdrop-blur-md border"
        :class="toastType === 'error' ? 'bg-red-500/20 text-red-100 border-red-400/40' : 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40'"
      >
        {{ toastMessage }}
      </div>
    </transition>
    
    <!-- Section: Basics -->
    <div class="space-y-5">
      <div class="flex items-center gap-2 mb-2">
         <div class="w-1 h-4 bg-[#7A9D8C] rounded-full"></div>
         <h3 class="text-sm font-medium text-white/80 tracking-wide">基础设置</h3>
      </div>
      
      <div class="group">
        <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2 group-focus-within:text-[#7A9D8C] transition-colors">群聊标题</label>
        <div class="flex gap-3">
          <input 
            v-model="chatStore.groupTitle" 
            type="text" 
            placeholder="群聊名称"
            class="flex-1 bg-white/5 hover:bg-white/10 border border-transparent focus:border-[#7A9D8C]/50 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-4 focus:ring-[#7A9D8C]/10 transition-all duration-300"
          />
          <div class="w-24 relative">
             <input 
              v-model.number="chatStore.memberCount" 
              type="number" 
              class="w-full bg-white/5 hover:bg-white/10 border border-transparent focus:border-[#7A9D8C]/50 rounded-xl px-3 py-3 text-sm text-white text-center focus:outline-none focus:ring-4 focus:ring-[#7A9D8C]/10 transition-all duration-300"
              placeholder="188"
            />
            <span class="absolute right-3 top-3.5 text-[10px] text-white/30 pointer-events-none">人</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="group">
          <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">对话模式</label>
          <div class="bg-black/20 p-1.5 rounded-2xl flex relative overflow-hidden backdrop-blur-sm">
            <button 
              @click="currentMode = 'chat'"
              class="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all duration-500 relative z-10"
              :class="currentMode === 'chat' ? 'text-white shadow-lg' : 'text-white/40 hover:text-white/60'"
            >
              对话模式
            </button>
            <button 
              @click="currentMode = 'join'"
              class="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all duration-500 relative z-10"
              :class="currentMode === 'join' ? 'text-white shadow-lg' : 'text-white/40 hover:text-white/60'"
            >
              拉人模式
            </button>
            <div 
              class="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#7A9D8C] rounded-xl transition-all duration-500 ease-spring"
              :class="currentMode === 'chat' ? 'left-1.5' : 'left-[calc(50%+3px)]'"
            ></div>
          </div>
        </div>
        <div class="group">
          <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">预览主题</label>
          <BaseSelect 
            v-model="chatStore.previewTheme" 
            :options="themeOptions" 
          />
        </div>
      </div>
    </div>

    <!-- Section: Advanced (Collapsed) -->
    <details class="group space-y-5">
      <summary class="flex items-center justify-between gap-3 cursor-pointer list-none">
        <div class="flex items-center gap-2">
           <div class="w-1 h-4 bg-[#A27B5C] rounded-full"></div>
           <h3 class="text-sm font-medium text-white/80 tracking-wide">高级设置</h3>
        </div>
        <span class="text-xs text-white/40 group-open:rotate-180 transition-transform">▼</span>
      </summary>

      <div class="grid grid-cols-3 gap-4">
        <div class="group">
          <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2 group-focus-within:text-[#7A9D8C] transition-colors">系统样式</label>
          <BaseSelect 
            v-model="chatStore.deviceType" 
            :options="deviceOptions" 
          />
        </div>
        <div>
          <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">聊天背景</label>
          <label class="flex items-center justify-center w-full h-[46px] bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-xl cursor-pointer transition-all duration-300 group hover:border-[#7A9D8C]/50">
            <span class="text-xs text-white/40 group-hover:text-[#7A9D8C] transition-colors">上传图片</span>
            <input type="file" @change="handleBgUpload" accept="image/*" class="hidden" />
          </label>
        </div>
        <div>
          <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">我的头像</label>
          <label class="flex items-center justify-center w-full h-[46px] bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-xl cursor-pointer transition-all duration-300 group hover:border-[#7A9D8C]/50 overflow-hidden">
            <span v-if="!chatStore.currentUser.avatar" class="text-xs text-white/40 group-hover:text-[#7A9D8C] transition-colors">上传头像</span>
            <div v-else class="w-10 h-10 rounded-[10px] overflow-hidden">
              <img :src="chatStore.currentUser.avatar" class="w-full h-full object-cover object-center" />
            </div>
            <input type="file" @change="handleAvatarUpload" accept="image/*" class="hidden" />
          </label>
        </div>
        <div>
          <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">昵称颜色</label>
          <div class="flex items-center h-[46px] bg-white/5 rounded-xl px-2 gap-2">
            <input 
              v-model="chatStore.nicknameColor" 
              type="color" 
              class="w-8 h-8 bg-transparent border-none cursor-pointer"
            />
            <span class="text-[10px] text-white/60 font-mono text-xs">{{ chatStore.nicknameColor }}</span>
          </div>
        </div>
      </div>

      <!-- New row for Nickname styles -->
      <div class="grid grid-cols-2 gap-4">
        <div class="group">
          <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">昵称大小</label>
          <div class="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2">
            <input 
              v-model.number="chatStore.nicknameSize" 
              type="range" min="8" max="20" 
              class="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#7A9D8C]"
            />
            <span class="text-xs text-white/60 font-mono w-6">{{ chatStore.nicknameSize }}</span>
          </div>
        </div>
        <div class="group">
          <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">昵称字体</label>
          <BaseSelect 
            v-model="chatStore.nicknameFont" 
            :options="fontOptions" 
          />
        </div>
      </div>

      <!-- New row for Status Bar -->
      <div class="grid grid-cols-2 gap-4">
        <div class="group">
          <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">顶部时间</label>
          <input
            v-model="chatStore.statusBarTime"
            type="text"
            placeholder="23:30"
            class="w-full bg-white/5 hover:bg-white/10 border border-transparent focus:border-[#7A9D8C]/50 rounded-xl px-4 py-3 text-[10px] text-white font-mono focus:outline-none transition-all"
          />
        </div>
        <div class="group">
          <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">顶部主题</label>
          <BaseSelect 
            v-model="chatStore.statusBarTheme" 
            :options="statusBarThemeOptions" 
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">单张内容量</label>
          <div class="flex justify-between items-end mb-3">
             <span class="text-xs font-bold text-[#7A9D8C]">{{ genCount }} <span class="text-[10px] font-normal text-white/30">条</span></span>
          </div>
          <input 
            v-model.number="genCount" 
            type="range" min="5" max="50" 
            class="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#7A9D8C]"
          />
        </div>
      </div>

      <!-- New row for System Message Colors -->
      <div class="grid grid-cols-2 gap-4">
        <div class="group">
          <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">提示背景 (RGBA)</label>
          <input 
            v-model="chatStore.systemBgColor" 
            type="text" 
            placeholder="rgba(255,255,255,0.15)"
            class="w-full bg-white/5 hover:bg-white/10 border border-transparent focus:border-[#7A9D8C]/50 rounded-xl px-4 py-3 text-[10px] text-white font-mono focus:outline-none transition-all"
          />
        </div>
        <div>
          <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">提示内昵称</label>
          <div class="flex items-center h-[46px] bg-white/5 rounded-xl px-2 gap-2">
            <input 
              v-model="chatStore.systemNameColor" 
              type="color" 
              class="w-8 h-8 bg-transparent border-none cursor-pointer"
            />
            <span class="text-[10px] text-white/60 font-mono text-xs">{{ chatStore.systemNameColor }}</span>
          </div>
        </div>
      </div>
    </details>

    <!-- Section: Export -->
    <div class="space-y-5 pt-4 border-t border-white/5">
      <div class="flex items-center gap-2 mb-2">
         <div class="w-1 h-4 bg-[#A27B5C] rounded-full"></div>
         <h3 class="text-sm font-medium text-white/80 tracking-wide">导出设置</h3>
      </div>

      <!-- Unified Generation UI -->
      <div class="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-6">

        <div>
          <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">一键导出张数</label>
          <div class="flex items-center gap-3">
            <input
              v-model.number="downloadCount"
              type="number"
              min="1"
              max="10"
              class="w-24 bg-white/5 hover:bg-white/10 border border-transparent focus:border-[#A27B5C]/50 rounded-xl px-3 py-3 text-sm text-white text-center focus:outline-none focus:ring-4 focus:ring-[#A27B5C]/10 transition-all duration-300"
            />
            <span class="text-xs text-white/40">张</span>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex gap-3">
            <button 
              @click="handleGenerate" 
              class="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl font-medium text-sm border border-white/10 transition-all active:scale-[0.98]"
            >
              刷新
            </button>
            <button 
              @click="handleQuickDownload" 
              class="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl font-medium text-sm border border-white/10 transition-all active:scale-[0.98]"
            >
              下载当前 PNG
            </button>
            <button 
              @click="chatStore.isHighlightingCapture = !chatStore.isHighlightingCapture" 
              class="flex-1 py-3.5 rounded-xl font-medium text-sm border border-white/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              :class="chatStore.isHighlightingCapture ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-white/5 hover:bg-white/10 text-white/80'"
            >
              <span v-if="chatStore.isHighlightingCapture">🔆 停止闪烁</span>
              <span v-else>👁️ 预览截图区</span>
            </button>
          </div>
          
            <button 
              @click="handleBatchDownload" 
              :disabled="isDownloading"
              class="w-full py-4 bg-gradient-to-r from-[#7A9D8C] to-[#6B8E78] disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-bold text-sm shadow-[0_10px_30px_-10px_rgba(122,157,140,0.4)] transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span v-if="!isDownloading">🚀 一键批量下载成品图</span>
              <span v-else class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                正在导出中...
              </span>
            </button>
            <div v-if="isDownloading" class="text-center text-xs text-white/50">
              已导出 {{ exportIndex }} / {{ downloadCount }} 张
            </div>
          </div>
        
        <p class="text-center text-[10px] text-white/30 tracking-wide leading-relaxed">
          点击一键下载将自动循环生成新内容并导出高清图片<br/>
          (浏览器可能会拦截多文件下载，请注意允许)
        </p>
      </div>
      
       <!-- Footer -->
        <footer class="mt-12 pt-8 border-t border-white/5 text-center">
          <p class="text-xs text-white/30 mb-1">Feedback & Support</p>
          <a href="mailto:webkubor@163.com" class="text-sm font-medium text-[#7A9D8C] hover:text-[#A27B5C] transition-colors tracking-wide">webkubor@163.com</a>
          <p class="text-[10px] text-white/35 mt-3 tracking-widest">好易美票务公司</p>
          <p class="text-[9px] text-white/20 mt-3 tracking-[0.2em] uppercase">
            © 2026 Design by WebKubor · 
            <router-link to="/changelog" class="hover:text-white/40 transition-colors">v{{ version }}</router-link>
          </p>
        </footer>
    </div>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Custom Range Slider Styling */
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #7A9D8C;
  border: 2px solid #2C3639;
  cursor: pointer;
  box-shadow: 0 0 0 4px rgba(122, 157, 140, 0.2);
  transition: all 0.2s;
}

input[type=range]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 0 6px rgba(122, 157, 140, 0.3);
}

.ease-spring {
  transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>