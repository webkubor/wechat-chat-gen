<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MusicPlayer from './components/MusicPlayer.vue'
import PWAPrompt from './components/PWAPrompt.vue'

const hasUpdate = ref(false)
const newVersion = ref('')
const isDismissed = ref(false) // 是否手动忽略了本次更新

/**
 * 语义化版本比对: v1 > v2 返回 1, v1 < v2 返回 -1, 相等返回 0
 */
const compareVersions = (v1: string, v2: string) => {
  const parts1 = v1.replace(/^v/, '').split('.').map(Number)
  const parts2 = v2.replace(/^v/, '').split('.').map(Number)
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0
    const num2 = parts2[i] || 0
    if (num1 > num2) return 1
    if (num1 < num2) return -1
  }
  return 0
}

const checkUpdate = async () => {
  // 如果当前已经显示更新提示或已经手动忽略，则不再检查
  if (hasUpdate.value || isDismissed.value) return

  try {
    // 添加时间戳防止缓存
    const res = await fetch(`/version.json?t=${Date.now()}`)
    const data = await res.json()
    
    // 只有当服务器版本号 > 当前运行时版本号时，才触发更新提示
    if (compareVersions(data.version, __APP_VERSION__) === 1) {
      hasUpdate.value = true
      newVersion.value = data.version
    }
  } catch (e) {
    console.error('Check update failed', e)
  }
}

const handleRefresh = () => {
  // 立即隐藏 UI，防止重复点击
  hasUpdate.value = false
  
  // 彻底清理并强力刷新
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister()
      }
      // 增加时间戳参数，强制浏览器从服务器拉取最新 index.html
      const url = new URL(window.location.href)
      url.searchParams.set('reload_t', Date.now().toString())
      window.location.replace(url.toString())
    })
  } else {
    window.location.reload()
  }
}

const dismissUpdate = () => {
  hasUpdate.value = false
  isDismissed.value = true
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
    
    <div class="hidden md:block">
      <MusicPlayer />
    </div>
    <PWAPrompt />

    <!-- Update Notification -->
    <transition name="slide-up">
      <div v-if="hasUpdate && !isDismissed" class="fixed bottom-10 left-1/2 -translate-x-1/2 z-[10001] bg-[#2C3639]/95 border border-[#7A9D8C]/40 backdrop-blur-xl p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-center gap-4 w-[90vw] sm:w-auto min-w-[300px] group">
        <!-- Close Button -->
        <button 
          @click="dismissUpdate"
          class="absolute -top-3 -right-3 w-8 h-8 bg-[#2C3639] border border-white/10 text-white/50 rounded-full flex items-center justify-center text-xs hover:text-white transition-all shadow-lg active:scale-90"
        >
          ✕
        </button>

        <div class="flex-1 text-center sm:text-left">
          <span class="text-[10px] text-[#7A9D8C] font-black uppercase tracking-[0.2em]">New Update</span>
          <p class="text-sm text-white/90 font-medium leading-tight mt-0.5">v{{ newVersion }} 已经发布</p>
          <p class="text-[11px] text-white/40 mt-1">包含交互优化与系统稳定性提升</p>
        </div>
        <button 
          @click="handleRefresh"
          class="w-full sm:w-auto bg-[#7A9D8C] hover:bg-[#6B8E78] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-[#7A9D8C]/20"
        >
          立即更新
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
