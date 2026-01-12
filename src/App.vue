<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MusicPlayer from './components/MusicPlayer.vue'
import PWAPrompt from './components/PWAPrompt.vue'

const hasUpdate = ref(false)
const newVersion = ref('')

const checkUpdate = async () => {
  try {
    // 添加时间戳防止缓存
    const res = await fetch(`/version.json?t=${Date.now()}`)
    const data = await res.json()
    // 简单对比：如果不相等则认为有更新
    if (data.version !== __APP_VERSION__) {
      hasUpdate.value = true
      newVersion.value = data.version
    }
  } catch (e) {
    console.error('Check update failed', e)
  }
}

const handleRefresh = () => {
  window.location.reload()
}

onMounted(() => {
  // 初始检查
  checkUpdate()
  
  // 每隔 10 分钟检查一次
  setInterval(checkUpdate, 10 * 60 * 1000)
  
  // 页面重新获得焦点时检查
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkUpdate()
    }
  })
})
</script>

<template>
  <div class="min-h-screen w-full font-sans text-slate-200 overflow-x-hidden relative selection:bg-[#7A9D8C] selection:text-white">
    
    <MusicPlayer />
    <PWAPrompt />

    <!-- Update Notification -->
    <transition name="slide-up">
      <div v-if="hasUpdate" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-[#2C3639]/90 border border-[#7A9D8C]/30 backdrop-blur-md pl-5 pr-2 py-2 rounded-full shadow-2xl flex items-center gap-4 max-w-[90vw]">
        <div class="flex flex-col">
          <span class="text-xs text-[#7A9D8C] font-bold uppercase tracking-wider">New Version Available</span>
          <span class="text-xs text-white/80">v{{ newVersion }} 已发布，包含新功能与修复</span>
        </div>
        <button 
          @click="handleRefresh"
          class="bg-[#7A9D8C] hover:bg-[#6B8E78] text-white text-xs font-bold px-4 py-2 rounded-full transition-colors active:scale-95"
        >
          立即刷新
        </button>
      </div>
    </transition>

    <!-- Liquid Background -->
    <div class="fixed inset-0 z-0">
      <div class="absolute inset-0 bg-[#2C3639]"></div>
      <div class="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#3F4E4F] rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-blob"></div>
      <div class="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-[#A27B5C] rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
      <div class="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-[#7A9D8C] rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-blob animation-delay-4000"></div>
      <div class="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>
    </div>

    <!-- Main Content Router -->
    <div class="relative z-10">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
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

/* Route Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide Up Transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>