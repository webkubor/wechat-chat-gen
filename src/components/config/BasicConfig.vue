<script setup lang="ts">
import { useChatStore } from '../../stores/chat'
import BaseSelect from '../ui/BaseSelect.vue'

const chatStore = useChatStore()
const currentMode = defineModel<'chat' | 'join'>('mode', { required: true })

const themeOptions = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' }
]

const exportRatioOptions = [
  { label: '完整截图', value: 'full' },
  { label: '3:4 高度截图', value: '3:4' }
]

const handleBgUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => chatStore.setBg(ev.target?.result as string)
    reader.readAsDataURL(file)
  }
}
</script>

<template>
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

    <div>
      <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">聊天背景</label>
      <label class="flex items-center justify-center w-full h-[46px] bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-xl cursor-pointer transition-all duration-300 group hover:border-[#7A9D8C]/50">
        <span class="text-xs text-white/40 group-hover:text-[#7A9D8C] transition-colors">上传图片</span>
        <input type="file" @change="handleBgUpload" accept="image/*" class="hidden" />
      </label>
    </div>

    <div class="group">
      <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">导出比例</label>
      <BaseSelect v-model="chatStore.exportRatio" :options="exportRatioOptions" />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="group">
        <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">对话模式</label>
        <div class="bg-black/20 p-1.5 rounded-2xl flex relative overflow-hidden backdrop-blur-sm">
          <button @click="currentMode = 'chat'" class="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all duration-500 relative z-10" :class="currentMode === 'chat' ? 'text-white shadow-lg' : 'text-white/40 hover:text-white/60'">对话模式</button>
          <button @click="currentMode = 'join'" class="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all duration-500 relative z-10" :class="currentMode === 'join' ? 'text-white shadow-lg' : 'text-white/40 hover:text-white/60'">拉人模式</button>
          <div class="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#7A9D8C] rounded-xl transition-all duration-500 ease-spring" :class="currentMode === 'chat' ? 'left-1.5' : 'left-[calc(50%+3px)]'"></div>
        </div>
      </div>
      <div class="group">
        <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">预览主题</label>
        <BaseSelect v-model="chatStore.previewTheme" :options="themeOptions" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ease-spring { transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); }
</style>
