<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useChatStore } from '../stores/chat'

const chatStore = useChatStore()
const scrollContainer = ref<HTMLElement | null>(null)
const isDark = computed(() => chatStore.previewTheme === 'dark')
const backgroundStyle = computed(() => {
  const hasImage = Boolean(chatStore.backgroundImage)
  const imageLayer = hasImage ? `url(${chatStore.backgroundImage})` : 'none'
  const overlay = isDark.value ? 'linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45))' : 'none'
  const backgroundImage = hasImage && isDark.value ? `${overlay}, ${imageLayer}` : imageLayer

  return {
    backgroundImage,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: isDark.value ? '#0b0b0e' : '#ededed'
  }
})

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
          class="w-full h-full relative flex flex-col"
          :style="backgroundStyle"
        >
        <!-- Top Navigation Area (Status Bar + WeChat Header) -->
        <div
          class="relative z-30 border-b flex flex-col"
          :class="isDark ? 'bg-[#151517] border-white/5' : 'bg-[#ededed] border-black/5'"
        >
          
          <!-- iOS Status Bar -->
          <div v-if="chatStore.deviceType === 'ios'" class="w-full relative">
            <!-- Notch -->
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[160px] h-[32px] bg-black rounded-b-[20px] z-50"></div>
            <!-- Status Bar Items -->
            <div
              class="flex justify-between items-center px-6 pt-3 font-semibold text-[15px] h-[44px]"
              :class="chatStore.statusBarTheme === 'light' ? 'text-white' : 'text-black'"
            >
              <div class="flex items-center gap-2">
                <span>{{ chatStore.statusBarTime }}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" :class="chatStore.statusBarTheme === 'light' ? 'text-white/90' : 'text-black/90'">
                  <path d="M21 15.5A9.5 9.5 0 1 1 8.5 3a7.5 7.5 0 1 0 12.5 12.5Z"></path>
                </svg>
              </div>
              <div class="flex gap-2 items-center">
                <!-- Signal -->
                <div class="flex items-end gap-0.5">
                  <span :class="chatStore.statusBarTheme === 'light' ? 'bg-white/90' : 'bg-black/90'" class="w-1 h-1 rounded-full"></span>
                  <span :class="chatStore.statusBarTheme === 'light' ? 'bg-white/90' : 'bg-black/90'" class="w-1 h-2 rounded-full"></span>
                  <span :class="chatStore.statusBarTheme === 'light' ? 'bg-white/90' : 'bg-black/90'" class="w-1 h-3 rounded-full"></span>
                  <span :class="chatStore.statusBarTheme === 'light' ? 'bg-white/90' : 'bg-black/90'" class="w-1 h-4 rounded-full"></span>
                </div>
                <!-- WiFi -->
                <svg width="18" height="12" viewBox="0 0 24 16" fill="none" :class="chatStore.statusBarTheme === 'light' ? 'text-white/90' : 'text-black/90'">
                  <path d="M2 6.5C6.5 2.5 17.5 2.5 22 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                  <path d="M5 9.5C8.5 6.8 15.5 6.8 19 9.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                  <path d="M9 12.5C10.5 11.3 13.5 11.3 15 12.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                  <circle cx="12" cy="14" r="1.2" fill="currentColor"></circle>
                </svg>
                <!-- Battery -->
                <div class="w-7 h-[13px] rounded-[4px] relative" :class="chatStore.statusBarTheme === 'light' ? 'border border-white/90' : 'border border-black/80'">
                  <div class="absolute top-[1.5px] left-[1.5px] bottom-[1.5px] w-[70%] rounded-[3px]" :class="chatStore.statusBarTheme === 'light' ? 'bg-white/90' : 'bg-black/90'"></div>
                  <div class="absolute -right-[2.5px] top-[3.5px] w-[2px] h-[6px] rounded-sm" :class="chatStore.statusBarTheme === 'light' ? 'bg-white/90' : 'bg-black/80'"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Android Status Bar -->
          <div v-if="chatStore.deviceType === 'android'" class="w-full h-7 flex justify-between items-center px-4 text-xs font-medium" :class="chatStore.statusBarTheme === 'light' ? 'text-white/80' : 'text-black/70'">
            <span>{{ chatStore.statusBarTime }}</span>
            <div class="flex gap-2 items-center">
              <span>5G</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21l-12-18h24z"/></svg>
              <span>85%</span>
            </div>
          </div>

          <!-- WeChat Header Content -->
          <div
            id="wechat-titlebar"
            :class="[
              'flex items-center justify-between',
              isDark ? 'text-white' : 'text-[#181818]',
              chatStore.deviceType === 'ios' ? 'pb-2.5 px-2' : 'h-12 px-4'
            ]"
          >
            <div class="flex items-center w-12">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" :class="isDark ? 'text-white/85' : 'text-[#181818]'">
                <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            
            <div class="font-medium text-[16.5px] truncate max-w-[220px] text-center flex-1">
              {{ chatStore.groupTitle }}<span class="ml-0.5">({{ chatStore.memberCount }})</span>
            </div>
            
            <div class="w-12 flex justify-end pr-2">
               <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" :class="isDark ? 'text-white/85' : 'text-[#181818]'">
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
        <div id="wechat-input-bar" class="relative z-20">
          <div class="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>
        <div
          class="backdrop-blur-md border-t px-3 pt-2 pb-[max(12px,env(safe-area-inset-bottom))]"
          :class="isDark ? 'bg-[#151517]/95 border-white/10' : 'bg-[#f2f2f7]/95 border-black/10'"
        >
          <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full flex items-center justify-center" :class="chatStore.previewTheme === 'dark' ? 'text-white/80' : 'text-gray-600'">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" x2="12" y1="19" y2="22"></line>
                </svg>
              </div>
              <div
                class="flex-1 h-[36px] rounded-full border shadow-[inset_0_1px_1.5px_rgba(0,0,0,0.08)]"
                :class="chatStore.previewTheme === 'dark' ? 'bg-[#2a2a2e] border-white/10' : 'bg-white border-black/10'"
              ></div>
              <div class="w-8 h-8 flex items-center justify-center" :class="chatStore.previewTheme === 'dark' ? 'text-white/80' : 'text-gray-600'">
                <span class="text-[20px] leading-none">☺</span>
              </div>
              <div class="w-8 h-8 flex items-center justify-center">
                <span
                  class="text-[18px] rounded-full h-[22px] w-[22px] flex items-center justify-center font-light leading-none border"
                  :class="chatStore.previewTheme === 'dark' ? 'text-white/80 border-white/60' : 'text-gray-700 border-gray-500/70'"
                >+</span>
              </div>
            </div>
          </div>
        </div>

        <!-- iOS Home Indicator -->
        <div
          v-if="chatStore.deviceType === 'ios'"
          class="absolute bottom-2 left-1/2 -translate-x-1/2 w-[140px] h-[5px] rounded-full z-30 shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
          :class="isDark ? 'bg-white/70' : 'bg-black/80'"
        ></div>

        <!-- Android Navigation Bar -->
        <div v-if="chatStore.deviceType === 'android'" class="h-10 flex items-center justify-around opacity-90 z-30" :class="isDark ? 'bg-black' : 'bg-[#e6e6ea]'">
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
