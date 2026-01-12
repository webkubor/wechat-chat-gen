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
  <footer class="mt-12 pt-8 border-t border-white/5 text-center">
    <!-- Daily Inspiration -->
    <div v-if="currentQuote" class="mb-8 px-4">
      <div class="inline-flex items-center gap-2 mb-2 text-[#7A9D8C] opacity-50">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <span class="text-[10px] uppercase tracking-[0.2em] font-medium">Daily Inspiration</span>
      </div>
      <p class="text-xs text-white/50 leading-relaxed italic font-light tracking-wide">
        “{{ currentQuote }}”
      </p>
    </div>

    <p class="text-xs text-white/30 mb-1">Feedback & Support</p>
    <a href="mailto:webkubor@163.com" class="text-sm font-medium text-[#7A9D8C] hover:text-[#A27B5C] transition-colors tracking-wide">webkubor@163.com</a>
    <p class="text-[10px] text-white/35 mt-3 tracking-widest">好易美票务公司</p>
    <p class="text-[9px] text-white/20 mt-3 tracking-[0.2em] uppercase">
      © 2026 Design by WebKubor · 
      <router-link to="/changelog" class="hover:text-white/40 transition-colors">v{{ version }}</router-link>
    </p>
  </footer>
</template>
