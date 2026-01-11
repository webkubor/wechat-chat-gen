<script setup lang="ts">
import DeviceFrame from './components/DeviceFrame.vue'
import ChatView from './components/ChatView.vue'
import ConfigPanel from './components/ConfigPanel.vue'
</script>

<template>
  <div class="min-h-screen w-full font-sans text-slate-200 overflow-x-hidden relative selection:bg-[#7A9D8C] selection:text-white">
    
    <!-- Liquid Background -->
    <div class="fixed inset-0 z-0">
      <div class="absolute inset-0 bg-[#2C3639]"></div>
      <div class="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#3F4E4F] rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-blob"></div>
      <div class="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-[#A27B5C] rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
      <div class="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-[#7A9D8C] rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-blob animation-delay-4000"></div>
      <div class="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 flex flex-col lg:flex-row h-screen overflow-hidden">
      
      <!-- Left: Preview Area -->
      <div class="flex-1 flex items-center justify-center p-6 lg:p-10 relative transition-all duration-500 ease-out">
        <div class="transform scale-[0.75] sm:scale-[0.85] md:scale-95 lg:scale-100 transition-transform duration-500 drop-shadow-2xl">
          <DeviceFrame>
            <ChatView />
          </DeviceFrame>
        </div>
      </div>

      <!-- Right: Control Panel (Glassmorphism) -->
      <div class="w-full lg:w-[420px] h-[45vh] lg:h-auto flex flex-col bg-white/5 backdrop-blur-2xl border-t lg:border-l border-white/10 shadow-[-10px_0_30px_rgba(0,0,0,0.2)] transition-all duration-300">
        
        <!-- Header -->
        <div class="px-8 py-6 border-b border-white/5">
          <h1 class="text-2xl font-light tracking-wide text-[#E8F1F2]">
            WeChat<span class="font-bold text-[#7A9D8C]">Gen</span>
          </h1>
          <p class="text-white/40 text-xs tracking-wider mt-1 uppercase">Atmosphere Generator</p>
        </div>
        
        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <ConfigPanel />
          
           <!-- Footer -->
          <footer class="mt-12 pt-8 border-t border-white/5 text-center">
            <p class="text-xs text-white/30 mb-1">Feedback & Support</p>
            <a href="mailto:webkubor@163.com" class="text-sm font-medium text-[#7A9D8C] hover:text-[#A27B5C] transition-colors tracking-wide">webkubor@163.com</a>
            <p class="text-[9px] text-white/20 mt-3 tracking-[0.2em] uppercase">© 2026 Design by WebKubor</p>
          </footer>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Morandi Theme Utilities */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

body {
  font-family: 'Inter', sans-serif;
  margin: 0;
  background-color: #2C3639;
}

.bg-noise {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E");
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Blob Animation */
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}
</style>