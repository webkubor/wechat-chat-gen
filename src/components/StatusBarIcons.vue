<script setup lang="ts">
import { useChatStore } from '../stores/chat'

const chatStore = useChatStore()
</script>

<template>
  <div class="flex items-center gap-1.5 h-[12px]">
    <!-- 信号格 (微信风格) -->
    <svg width="18" height="10" viewBox="0 0 18 10" fill="currentColor" :class="chatStore.statusBarTheme === 'light' ? 'text-white' : 'text-black'">
      <rect x="0" y="7" width="3" height="3" rx="0.5" />
      <rect x="4.5" y="5" width="3" height="5" rx="0.5" />
      <rect x="9" y="2.5" width="3" height="7.5" rx="0.5" />
      <rect x="13.5" y="0" width="3" height="10" rx="0.5" />
    </svg>
    <!-- WiFi -->
    <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" :class="chatStore.statusBarTheme === 'light' ? 'text-white' : 'text-black'">
      <path d="M8 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
      <path d="M13.2 6.8a7.4 7.4 0 00-10.4 0 .6.6 0 11-.8-.9 8.6 8.6 0 0112 0 .6.6 0 11-.8.9z" opacity="0.9"/>
      <path d="M15.5 4.3a10.6 10.6 0 00-15 0 .6.6 0 11-.8-.8 11.8 11.8 0 0116.6 0 .6.6 0 11-.8.8z" opacity="0.4"/>
    </svg>
    <!-- 电池 (iOS 标准样式) -->
    <div class="relative w-[22px] h-[10px] rounded-[2.5px] border transition-colors" :class="chatStore.statusBarTheme === 'light' ? 'border-white/40' : 'border-black/30'">
      <div class="absolute inset-[1px] rounded-[1px] bg-current" :style="{ width: '70%' }"></div>
      <div class="absolute -right-[3px] top-[2.5px] w-[1.5px] h-[4px] rounded-r-full bg-current opacity-40"></div>
    </div>
  </div>
</template>
