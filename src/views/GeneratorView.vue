<script setup lang="ts">
import { onMounted } from 'vue'
import { useChatStore } from '../stores/chat'
import DeviceFrame from '../components/DeviceFrame.vue'
import ChatView from '../components/ChatView.vue'
import ConfigPanel from '../components/ConfigPanel.vue'

const chatStore = useChatStore()

onMounted(() => {
  chatStore.init()
})
</script>

<template>
  <div class="flex flex-col lg:flex-row h-screen overflow-hidden">
    <!-- Left: Preview Area -->
    <div class="flex-1 flex items-center justify-center p-6 lg:p-10 relative transition-all duration-500 ease-out">
      <div class="transform scale-[0.75] sm:scale-[0.85] md:scale-95 lg:scale-100 transition-transform duration-500 drop-shadow-2xl">
        <DeviceFrame>
          <ChatView />
        </DeviceFrame>
      </div>
    </div>

    <!-- Right: Control Panel (Glassmorphism) -->
    <div class="w-full lg:w-[420px] h-[55vh] lg:h-auto flex flex-col bg-white/5 backdrop-blur-2xl border-t lg:border-l border-white/10 shadow-[-10px_0_30px_rgba(0,0,0,0.2)] transition-all duration-300">
      
      <!-- Header -->
      <div class="px-8 py-6 border-b border-white/5 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-light tracking-wide text-[#E8F1F2]">
            WeChat<span class="font-bold text-[#7A9D8C]">Gen</span>
          </h1>
          <p class="text-white/40 text-xs tracking-wider mt-1 uppercase">Atmosphere Generator</p>
        </div>
        <router-link to="/corpus" class="text-xs text-[#7A9D8C] hover:text-white transition-colors flex items-center gap-1">
          <span>📚 语料库</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </router-link>
      </div>
      
      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto p-8 scrollbar-hide">
        <ConfigPanel />
        
         <!-- Footer -->
        <footer class="mt-12 pt-8 border-t border-white/5 text-center">
          <p class="text-xs text-white/30 mb-1">Feedback & Support</p>
          <a href="mailto:webkubor@163.com" class="text-sm font-medium text-[#7A9D8C] hover:text-[#A27B5C] transition-colors tracking-wide">webkubor@163.com</a>
          <p class="text-[10px] text-white/35 mt-3 tracking-widest">好易美票务公司</p>
          <p class="text-[9px] text-white/20 mt-3 tracking-[0.2em] uppercase">© 2026 Design by WebKubor</p>
        </footer>
      </div>
    </div>
  </div>
</template>
