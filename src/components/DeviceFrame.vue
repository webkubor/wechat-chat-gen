<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useChatStore } from '../stores/chat'

const chatStore = useChatStore()
const scrollContainer = ref<HTMLElement | null>(null)

watch(() => chatStore.messages.length, () => {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  })
})
</script>

<template>
  <div class="flex flex-col items-center p-4">
    <!-- Phone Frame -->
    <div 
      id="wechat-screen"
      :class="[
        'relative overflow-hidden transition-all duration-300 bg-black',
        chatStore.isHighlightingCapture ? 'ring-4 ring-red-500 ring-offset-4 ring-offset-black animate-pulse' : '',
        chatStore.deviceType === 'ios' 
          ? 'w-[375px] h-[812px] rounded-[50px] shadow-[0_0_0_12px_#111,0_0_0_14px_#333,0_20px_50px_-10px_rgba(0,0,0,0.5)]' 
          : 'w-[360px] h-[780px] rounded-[30px] shadow-[0_0_0_8px_#111,0_0_0_9px_#333,0_20px_50px_-10px_rgba(0,0,0,0.5)]'
      ]"
    >
      <!-- Screen Content Container -->
      <div 
        class="w-full h-full bg-[#ededed] relative flex flex-col"
        :style="{
          backgroundImage: chatStore.backgroundImage ? `url(${chatStore.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#ededed'
        }"
      >
        <!-- Top Navigation Area (Status Bar + WeChat Header) -->
        <div class="relative z-30 bg-[#ededed] border-b border-black/5 flex flex-col">
          
          <!-- iOS Status Bar -->
          <div v-if="chatStore.deviceType === 'ios'" class="w-full relative">
            <!-- Notch -->
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[160px] h-[32px] bg-black rounded-b-[20px] z-50"></div>
            <!-- Status Bar Items -->
            <div class="flex justify-between items-start px-6 pt-3 text-black font-semibold text-[15px] h-[44px]">
              <span>9:41</span>
              <div class="flex gap-1.5 items-center">
                <!-- Signal -->
                <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
                  <rect x="0" y="7" width="3" height="4" rx="0.5" />
                  <rect x="4" y="5" width="3" height="6" rx="0.5" />
                  <rect x="8" y="3" width="3" height="8" rx="0.5" />
                  <rect x="12" y="0" width="3" height="11" rx="0.5" />
                </svg>
                <!-- WiFi -->
                <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor">
                  <path d="M7.5 11C9.15685 11 10.5 9.65685 10.5 8C10.5 6.34315 9.15685 5 7.5 5C5.84315 5 4.5 6.34315 4.5 8C4.5 9.65685 5.84315 11 7.5 11Z" />
                  <path d="M7.5 0C3.35786 0 0 3.35786 0 7.5H2C2 4.46243 4.46243 2 7.5 2C10.5376 2 13 4.46243 13 7.5H15C15 3.35786 11.6421 0 7.5 0Z" opacity="0.3" />
                </svg>
                <!-- Battery -->
                <div class="w-6 h-3 border border-black/30 rounded-[3px] relative ml-0.5">
                   <div class="absolute top-0.5 left-0.5 bottom-0.5 w-[80%] bg-black rounded-[1px]"></div>
                   <div class="absolute -right-1 top-1 w-0.5 h-1 bg-black/30 rounded-r-sm"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Android Status Bar -->
          <div v-if="chatStore.deviceType === 'android'" class="w-full h-7 flex justify-between items-center px-4 text-xs text-black/70 font-medium">
            <span>12:30</span>
            <div class="flex gap-2 items-center">
              <span>5G</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21l-12-18h24z"/></svg>
              <span>85%</span>
            </div>
          </div>

          <!-- WeChat Header Content -->
          <div 
            :class="[
              'flex items-center justify-between text-[#181818]',
              chatStore.deviceType === 'ios' ? 'pb-2.5 px-2' : 'h-12 px-4'
            ]"
          >
            <div class="flex items-center w-12">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" class="text-[#181818]">
                <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            
            <div class="font-medium text-[16.5px] truncate max-w-[220px] text-center flex-1">
              {{ chatStore.groupTitle }}<span class="ml-0.5">({{ chatStore.memberCount }})</span>
            </div>
            
            <div class="w-12 flex justify-end pr-2">
               <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" class="text-[#181818]">
                 <circle cx="5" cy="12" r="2" />
                 <circle cx="12" cy="12" r="2" />
                 <circle cx="19" cy="12" r="2" />
               </svg>
            </div>
          </div>
        </div>

        <!-- Chat Content Area -->
        <div ref="scrollContainer" class="flex-1 overflow-y-auto pb-2 scrollbar-hide relative z-0 scroll-smooth">
          <slot></slot>
        </div>

        <!-- Bottom Input Bar (Simulated) -->
        <div class="relative z-20">
          <div class="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>
          <div class="bg-[#f4f4f4]/95 backdrop-blur-md border-t border-black/10 px-3 pt-2 pb-[max(14px,env(safe-area-inset-bottom))]">
            <div class="flex items-end gap-2.5">
              <div class="w-9 h-9 rounded-full bg-white border border-black/15 shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_-1px_0_rgba(0,0,0,0.06)] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" x2="12" y1="19" y2="22"></line>
                </svg>
              </div>
              <div class="flex-1 min-h-[38px] bg-white rounded-[10px] border border-black/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] mb-0.5"></div>
              <div class="w-9 h-9 rounded-full bg-white border border-black/15 shadow-[0_1px_2px_rgba(0,0,0,0.1)] flex items-center justify-center">
                <span class="text-[22px] text-gray-600 leading-none">☺</span>
              </div>
              <div class="w-9 h-9 rounded-full bg-white border border-black/15 shadow-[0_1px_2px_rgba(0,0,0,0.1)] flex items-center justify-center">
                <span class="text-[20px] text-gray-700 border border-gray-700/80 rounded-full h-[22px] w-[22px] flex items-center justify-center font-light leading-none pb-0.5">+</span>
              </div>
            </div>
          </div>
        </div>

        <!-- iOS Home Indicator -->
        <div v-if="chatStore.deviceType === 'ios'" class="absolute bottom-2 left-1/2 -translate-x-1/2 w-[140px] h-[5px] bg-black/80 rounded-full z-30 shadow-[0_1px_2px_rgba(0,0,0,0.35)]"></div>

        <!-- Android Navigation Bar -->
        <div v-if="chatStore.deviceType === 'android'" class="h-10 bg-black flex items-center justify-around opacity-90 z-30">
          <div class="w-4 h-4 border-2 border-gray-400 transform rotate-45 border-r-0 border-b-0 ml-4"></div>
          <div class="w-4 h-4 border-2 border-gray-400 rounded-full"></div>
          <div class="w-4 h-4 border-2 border-gray-400 rounded-[2px] mr-4"></div>
        </div>
      </div>
      
      <!-- Screen Reflection Overlay -->
      <div class="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent z-40 rounded-[inherit]"></div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
