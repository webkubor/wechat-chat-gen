<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useChatStore } from '../stores/chat'

const chatStore = useChatStore()
const currentMode = ref<'chat' | 'join'>('chat')
const genCount = ref(20)

onMounted(() => {
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

const handleGenerate = () => {
  if (currentMode.value === 'join') {
    chatStore.batchAddJoinMessages(genCount.value)
  } else {
    chatStore.batchAddRandomDialog(genCount.value)
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
          <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">昵称颜色</label>
          <div class="flex items-center h-[46px] bg-white/5 rounded-xl px-2 gap-2">
            <input 
              v-model="chatStore.nicknameColor" 
              type="color" 
              class="w-8 h-8 bg-transparent border-none cursor-pointer"
            />
            <span class="text-[10px] text-white/60 font-mono">{{ chatStore.nicknameColor }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Section: Generator -->
    <div class="space-y-5 pt-4 border-t border-white/5">
      <div class="flex items-center gap-2 mb-2">
         <div class="w-1 h-4 bg-[#A27B5C] rounded-full"></div>
         <h3 class="text-sm font-medium text-white/80 tracking-wide">生成模式</h3>
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
      <div class="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-5">
        <div>
          <div class="flex justify-between items-end mb-3">
             <label class="text-[10px] font-medium text-white/40 uppercase tracking-widest">生成数量</label>
             <span class="text-xs font-bold text-[#7A9D8C]">{{ genCount }} <span class="text-[10px] font-normal text-white/30">条</span></span>
          </div>
          <div class="flex items-center gap-4">
            <input 
              v-model.number="genCount" 
              type="range" min="1" max="100" 
              class="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#7A9D8C]"
            />
          </div>
        </div>

        <button 
          @click="handleGenerate" 
          class="w-full py-4 bg-[#7A9D8C] hover:bg-[#6B8E78] text-white rounded-xl font-medium text-sm shadow-[0_10px_30px_-10px_rgba(122,157,140,0.4)] hover:shadow-[0_15px_35px_-10px_rgba(122,157,140,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2 tracking-wide"
        >
          <span v-if="currentMode === 'chat'">一键生成群聊对话</span>
          <span v-else>一键生成入群记录</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="opacity-80">
            <path d="M12 2v20M2 12h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        
        <p class="text-center text-[10px] text-white/30 tracking-wide">
          根据选定模式自动生成逼真的群聊内容
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

