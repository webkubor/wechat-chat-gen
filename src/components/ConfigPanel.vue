<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useChatStore } from '../stores/chat'
import { useCorpusStore } from '../stores/corpus'
import html2canvas from 'html2canvas'

const chatStore = useChatStore()
const corpusStore = useCorpusStore()
const currentMode = ref<'chat' | 'join'>('chat')
const genCount = ref(20)
const downloadCount = ref(3)
const isDownloading = ref(false)

onMounted(async () => {
  await corpusStore.initDB()
  // 初始进入自动生成20条对话，避免空白
  chatStore.batchAddRandomDialog(20)
})

// 监听模式切换，自动刷新预览内容
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

const downloadImage = async (index: number) => {
  const element = document.getElementById('wechat-capture')
  if (!element) return

  try {
    const canvas = await html2canvas(element, {
      useCORS: true,
      scale: 2, // 高清导出
      backgroundColor: '#ededed',
      logging: false,
      allowTaint: true
    })

    const link = document.createElement('a')
    link.download = `wechat-gen-${Date.now()}-${index + 1}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (err) {
    console.error('Export failed:', err)
  }
}

const handleBatchDownload = async () => {
  if (isDownloading.value) return
  isDownloading.value = true
  
  try {
    for (let i = 0; i < downloadCount.value; i++) {
      // 1. 生成新内容
      handleGenerate()
      
      // 2. 等待 DOM 更新和头像图片加载
      await nextTick()
      // 增加延时确保图片加载完成
      await new Promise(resolve => setTimeout(resolve, 1500)) 
      
      // 3. 截图下载
      await downloadImage(i)
    }
  } finally {
    isDownloading.value = false
  }
}
</script>

<template>
  <div class="space-y-8">
    
    <!-- Section: Identity -->
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

      <div class="grid grid-cols-3 gap-4">
        <div class="group">
          <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2 group-focus-within:text-[#7A9D8C] transition-colors">系统样式</label>
          <div class="relative">
            <select v-model="chatStore.deviceType" class="w-full appearance-none bg-white/5 hover:bg-white/10 border border-transparent focus:border-[#7A9D8C]/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-4 focus:ring-[#7A9D8C]/10 transition-all duration-300 cursor-pointer">
              <option value="ios" class="text-gray-900">iOS 风格</option>
              <option value="android" class="text-gray-900">Android 风格</option>
            </select>
            <div class="absolute right-4 top-4 pointer-events-none text-white/30 text-[10px]">▼</div>
          </div>
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
          <div class="relative">
            <select v-model="chatStore.nicknameFont" class="w-full appearance-none bg-white/5 hover:bg-white/10 border border-transparent focus:border-[#7A9D8C]/50 rounded-xl px-4 py-3 text-[10px] text-white focus:outline-none transition-all cursor-pointer">
              <option value="sans-serif" class="text-gray-900">默认无衬线</option>
              <option value="'PingFang SC', sans-serif" class="text-gray-900">苹方 (Mac/iOS)</option>
              <option value="'Microsoft YaHei', sans-serif" class="text-gray-900">微软雅黑 (Win)</option>
              <option value="serif" class="text-gray-900">衬线体 (优雅)</option>
              <option value="monospace" class="text-gray-900">等宽体 (极客)</option>
            </select>
            <div class="absolute right-4 top-4 pointer-events-none text-white/30 text-[10px]">▼</div>
          </div>
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
          <div class="relative">
            <select v-model="chatStore.statusBarTheme" class="w-full appearance-none bg-white/5 hover:bg-white/10 border border-transparent focus:border-[#7A9D8C]/50 rounded-xl px-4 py-3 text-[10px] text-white focus:outline-none transition-all cursor-pointer">
              <option value="dark" class="text-gray-900">黑色图标</option>
              <option value="light" class="text-gray-900">白色图标</option>
            </select>
            <div class="absolute right-4 top-4 pointer-events-none text-white/30 text-[10px]">▼</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="group">
          <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">预览主题</label>
          <div class="relative">
            <select v-model="chatStore.previewTheme" class="w-full appearance-none bg-white/5 hover:bg-white/10 border border-transparent focus:border-[#7A9D8C]/50 rounded-xl px-4 py-3 text-[10px] text-white focus:outline-none transition-all cursor-pointer">
              <option value="light" class="text-gray-900">浅色</option>
              <option value="dark" class="text-gray-900">深色</option>
            </select>
            <div class="absolute right-4 top-4 pointer-events-none text-white/30 text-[10px]">▼</div>
          </div>
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
    </div>

    <!-- Section: Generator -->
    <div class="space-y-5 pt-4 border-t border-white/5">
      <div class="flex items-center gap-2 mb-2">
         <div class="w-1 h-4 bg-[#A27B5C] rounded-full"></div>
         <h3 class="text-sm font-medium text-white/80 tracking-wide">生成与导出</h3>
      </div>

      <!-- Mode Switcher (Glass Pill) -->
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
        
        <!-- Animated Background Pill -->
        <div 
          class="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#7A9D8C] rounded-xl transition-all duration-500 ease-spring"
          :class="currentMode === 'chat' ? 'left-1.5' : 'left-[calc(50%+3px)]'"
        ></div>
      </div>

      <!-- Unified Generation UI -->
      <div class="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-6">
        <div>
          <div class="flex justify-between items-end mb-3">
             <label class="text-[10px] font-medium text-white/40 uppercase tracking-widest">单张内容量</label>
             <span class="text-xs font-bold text-[#7A9D8C]">{{ genCount }} <span class="text-[10px] font-normal text-white/30">条</span></span>
          </div>
          <input 
            v-model.number="genCount" 
            type="range" min="5" max="50" 
            class="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#7A9D8C]"
          />
        </div>

        <div>
          <div class="flex justify-between items-end mb-3">
             <label class="text-[10px] font-medium text-white/40 uppercase tracking-widest">一键导出张数</label>
             <span class="text-xs font-bold text-[#A27B5C]">{{ downloadCount }} <span class="text-[10px] font-normal text-white/30">张</span></span>
          </div>
          <input 
            v-model.number="downloadCount" 
            type="range" min="1" max="10" 
            class="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#A27B5C]"
          />
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex gap-3">
            <button 
              @click="handleGenerate" 
              class="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl font-medium text-sm border border-white/10 transition-all active:scale-[0.98]"
            >
              仅刷新预览
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
        </div>
        
        <p class="text-center text-[10px] text-white/30 tracking-wide leading-relaxed">
          点击一键下载将自动循环生成新内容并导出高清图片<br/>
          (浏览器可能会拦截多文件下载，请注意允许)
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
