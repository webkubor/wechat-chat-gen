<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useChatStore } from '../stores/chat'
import DeviceFrame from '../components/DeviceFrame.vue'
import ChatView from '../components/ChatView.vue'
import ConfigPanel from '../components/ConfigPanel.vue'

const chatStore = useChatStore()
const isEditorOpen = ref(false) // 移动端控制编辑器展开/收起

const toggleEditor = () => {
  isEditorOpen.value = !isEditorOpen.value
}

onMounted(() => {
  chatStore.init()
})
</script>

<template>
  <div class="flex flex-col lg:flex-row h-screen overflow-hidden bg-[#2C3639]">
    <!-- Left: Preview Area -->
    <div class="flex-1 flex items-center justify-center relative transition-all duration-500 ease-out">
      <div class="transform scale-[0.75] sm:scale-[0.85] md:scale-95 lg:scale-100 transition-transform duration-500 drop-shadow-2xl">
        <DeviceFrame>
          <ChatView />
        </DeviceFrame>
      </div>
      
      <!-- Mobile Toggle Button (Floating Action Button) -->
      <button 
        @click="toggleEditor"
        class="lg:hidden fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-[#7A9D8C] text-white shadow-xl flex items-center justify-center transition-all active:scale-90 hover:bg-[#6B8E78]"
      >
        <svg v-if="!isEditorOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <!-- Right: Control Panel (PC: Static, Mobile: Bottom Sheet) -->
    <div 
      :class="[
        'fixed lg:relative bottom-0 left-0 w-full lg:w-[420px] bg-[#2C3639]/95 backdrop-blur-2xl border-t lg:border-l border-white/10 shadow-[-10px_0_30px_rgba(0,0,0,0.4)] transition-all duration-500 z-50 flex flex-col',
        isEditorOpen ? 'h-[85vh]' : 'h-0 lg:h-full overflow-hidden lg:overflow-visible'
      ]"
    >
      <!-- Mobile Handle Bar -->
      <div @click="toggleEditor" class="lg:hidden w-full h-8 flex items-center justify-center cursor-pointer">
        <div class="w-12 h-1 bg-white/20 rounded-full"></div>
      </div>
      
      <!-- Header -->
      <div class="px-8 py-4 lg:py-6 border-b border-white/5 flex justify-between items-center shrink-0">
        <div>
          <h1 class="text-xl lg:text-2xl font-light tracking-wide text-[#E8F1F2]">
            WeChat<span class="font-bold text-[#7A9D8C]">Gen</span>
          </h1>
          <p class="text-white/40 text-[10px] tracking-wider mt-0.5 uppercase">Atmosphere Generator</p>
        </div>
        <router-link to="/corpus" class="text-xs text-[#7A9D8C] hover:text-white transition-colors flex items-center gap-1">
          <span>📚 语料库</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </router-link>
      </div>
      
      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-hide">
        <ConfigPanel />
        
         <!-- Footer -->
        <footer class="mt-12 pt-8 border-t border-white/5 text-center">
          <p class="text-xs text-white/30 mb-1">Feedback & Support</p>
          <a href="mailto:webkubor@163.com" class="text-sm font-medium text-[#7A9D8C] hover:text-[#A27B5C] transition-colors tracking-wide">webkubor@163.com</a>
          <div class="mt-4 flex flex-col items-center">
            <span class="text-[10px] px-2 py-0.5 rounded bg-white/5 text-[#7A9D8C] font-mono border border-white/5">v{{ __APP_VERSION__ }}</span>
            <p class="text-[10px] text-white/35 mt-3 tracking-widest">好易美票务公司</p>
            <p class="text-[9px] text-white/20 mt-3 tracking-[0.2em] uppercase">© 2026 Design by WebKubor</p>
          </div>
        </footer>
      </div>
    </div>
    
    <!-- Mobile Backdrop -->
    <div 
      v-if="isEditorOpen" 
      @click="toggleEditor"
      class="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
    ></div>
  </div>
</template>
