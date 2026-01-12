<script setup lang="ts">
import { computed } from 'vue'
import { useChatStore } from '../stores/chat'

const chatStore = useChatStore()
const textColor = computed(() => (chatStore.statusBarTheme === 'light' ? 'text-white' : 'text-black'))
</script>

<template>
  <div class="relative flex justify-between items-center px-6 pt-3 pb-1 select-none z-50" :class="textColor">
    <!-- Time -->
    <div class="w-20 text-[15px] font-semibold tracking-tight pl-2">
      {{ chatStore.statusBarTime }}
    </div>

    <!-- Dynamic Island -->
    <div class="absolute left-1/2 -translate-x-1/2 top-3 w-[120px] h-[35px] bg-black rounded-[18px] flex items-center justify-end px-4 shadow-inner">
      <!-- Camera Hole -->
      <div class="w-3 h-3 bg-[#1a1a1a] rounded-full border border-white/5 mr-1"></div>
    </div>

    <!-- Right Side Icons -->
    <div class="flex items-center gap-1.5 w-20 justify-end pr-1">
      <!-- Cellular -->
      <div class="flex items-end gap-[1.5px] h-[10px]">
        <div class="w-[3px] h-[30%] bg-current rounded-[0.5px]"></div>
        <div class="w-[3px] h-[50%] bg-current rounded-[0.5px]"></div>
        <div class="w-[3px] h-[75%] bg-current rounded-[0.5px]"></div>
        <div class="w-[3px] h-[100%] bg-current rounded-[0.5px]"></div>
      </div>
      
      <!-- WiFi -->
      <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
        <path d="M8 12C9.10457 12 10 11.1046 10 10C10 8.89543 9.10457 8 8 8C6.89543 8 6 8.89543 6 10C6 11.1046 6.89543 12 8 12Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M8 0C4.30561 0 1.05432 1.5796 -1.19209e-07 4.09139L1.4443 5.43577C2.26871 3.51862 4.90327 2.18182 8 2.18182C11.0967 2.18182 13.7313 3.51862 14.5557 5.43577L16 4.09139C14.9457 1.5796 11.6944 0 8 0Z" fill="currentColor"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M8 4.36364C5.8166 4.36364 3.86873 5.18731 2.88859 6.44284L4.33289 7.78722C4.94436 7.1121 6.36531 6.54545 8 6.54545C9.63469 6.54545 11.0556 7.1121 11.6671 7.78722L13.1114 6.44284C12.1313 5.18731 10.1834 4.36364 8 4.36364Z" fill="currentColor"/>
      </svg>

      <!-- Battery -->
      <div class="relative w-[24px] h-[11.5px] border-[1px] border-current/30 rounded-[3px] p-[1px]">
        <div class="bg-current h-full w-[85%] rounded-[1px]"></div>
        <div class="absolute -right-[3px] top-[3.5px] w-[2px] h-[4.5px] bg-current/30 rounded-r-full"></div>
      </div>
    </div>
  </div>
</template>
