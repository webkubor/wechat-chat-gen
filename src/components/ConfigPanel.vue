<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '../stores/chat'

const chatStore = useChatStore()
const currentMode = ref<'join' | 'chat'>('chat')
const genCount = ref(20)

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
  <div class="space-y-6">
    
    <!-- Basic Config -->
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">明星姓名</label>
          <input 
            v-model="chatStore.starName" 
            @input="chatStore.updateGroupTitle"
            type="text" 
            placeholder="如：周杰伦"
            class="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">地方站</label>
          <input 
            v-model="chatStore.location" 
            @input="chatStore.updateGroupTitle"
            type="text" 
            placeholder="如：杭州"
            class="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">最终预览群名</label>
        <div class="flex gap-2">
          <input 
            v-model="chatStore.groupTitle" 
            type="text" 
            class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-green-400 font-medium focus:outline-none"
            readonly
          />
          <div class="w-24">
            <input 
              v-model.number="chatStore.memberCount" 
              type="number" 
              class="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="人数"
            />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">系统样式</label>
          <div class="relative">
            <select v-model="chatStore.deviceType" class="w-full appearance-none bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="ios">🍎 iOS</option>
              <option value="android">🤖 Android</option>
            </select>
            <div class="absolute right-3 top-2.5 pointer-events-none text-gray-400 text-xs">▼</div>
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">更换壁纸</label>
          <label class="flex items-center justify-center w-full h-[38px] bg-gray-900/50 border border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors">
            <span class="text-xs text-gray-400">点击上传图片</span>
            <input type="file" @change="handleBgUpload" accept="image/*" class="hidden" />
          </label>
        </div>
      </div>
    </div>

    <!-- Mode Switcher -->
    <div class="bg-gray-900/50 p-1 rounded-lg flex text-sm font-medium border border-gray-700">
      <button 
        @click="currentMode = 'chat'"
        :class="[
          'flex-1 py-1.5 rounded-md transition-all text-center',
          currentMode === 'chat' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
        ]"
      >
        💬 对话模式
      </button>
      <button 
        @click="currentMode = 'join'"
        :class="[
          'flex-1 py-1.5 rounded-md transition-all text-center',
          currentMode === 'join' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
        ]"
      >
        👋 拉人模式
      </button>
    </div>

    <!-- Unified Generation UI -->
    <div class="pt-4 border-t border-gray-700 space-y-4">
      <div>
        <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">生成数量</label>
        <div class="flex gap-4">
          <input 
            v-model.number="genCount" 
            type="range" min="1" max="100" 
            class="flex-1 accent-green-500"
          />
          <input 
            v-model.number="genCount" 
            type="number" 
            class="w-20 bg-gray-900/50 border border-gray-600 rounded-lg px-2 py-1 text-sm text-center text-white"
          />
        </div>
      </div>

      <button 
        @click="handleGenerate" 
        class="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-green-900/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <span v-if="currentMode === 'chat'">🚀 一键批量生产对话</span>
        <span v-else>👋 一键批量拉人入群</span>
      </button>
      
      <p class="text-center text-[11px] text-gray-500">
        点击按钮将按照当前选定的模式自动生成 {{ genCount }} 条记录
      </p>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(2px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

