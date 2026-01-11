<script setup lang="ts">
import MusicPlayer from './components/MusicPlayer.vue'
</script>

<template>
  <div class="min-h-screen w-full font-sans text-slate-200 overflow-x-hidden relative selection:bg-[#7A9D8C] selection:text-white">
    
    <MusicPlayer />

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
</style>