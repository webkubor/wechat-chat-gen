<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PRESET_QUOTES } from '../../config/presets'

const version = __APP_VERSION__
const currentQuote = ref('')

onMounted(() => {
  currentQuote.value = PRESET_QUOTES[Math.floor(Math.random() * PRESET_QUOTES.length)] || ''
})
</script>

<template>
  <footer class="mt-16 pt-10 pb-16 border-t border-white/5 flex flex-col items-center">
    <!-- Daily Inspiration (鸡汤逻辑回归) -->
    <div v-if="currentQuote" class="mb-12 px-6 max-w-[280px] text-center group">
      <div class="inline-flex items-center gap-2 mb-3 text-[#7A9D8C]/40 group-hover:text-[#7A9D8C]/60 transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <span class="text-[10px] uppercase tracking-[0.3em] font-black">Daily Inspiration</span>
      </div>
      <p class="text-[11px] text-white/30 leading-relaxed italic font-light tracking-wider leading-relaxed">
        “{{ currentQuote }}”
      </p>
    </div>

    <!-- 核心信息区 -->
    <div class="flex items-center gap-3 mb-5">
      <span class="text-[10px] px-2 py-0.5 rounded bg-[#7A9D8C]/10 text-[#7A9D8C] font-mono border border-[#7A9D8C]/20 shadow-sm">
        Build v{{ version }}
      </span>
      <span class="w-1 h-1 rounded-full bg-white/10"></span>
      <p class="text-[10px] text-white/40 tracking-[0.2em] font-medium">好易美票务公司</p>
    </div>
    
    <div class="flex flex-col items-center gap-2.5">
      <p class="text-[10px] text-white/15 uppercase tracking-[0.2em]">© 2026 Design by WebKubor</p>
      <a href="mailto:webkubor@163.com" class="text-[11px] font-medium text-white/20 hover:text-[#7A9D8C] transition-colors tracking-wide underline underline-offset-4 decoration-white/5">
        webkubor@163.com
      </a>
    </div>
  </footer>
</template>
