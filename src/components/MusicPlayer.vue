<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const volume = ref(0.5)
const hasFile = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const position = ref({ x: 40, y: 40 })
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

// SVG 环形参数
const radius = 24
const circumference = 2 * Math.PI * radius
const progressOffset = computed(() => {
  if (duration.value === 0) return circumference
  const progress = currentTime.value / duration.value
  return circumference * (1 - progress)
})

const handleFile = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file && audioRef.value) {
    const url = URL.createObjectURL(file)
    audioRef.value.src = url
    hasFile.value = true
    isPlaying.value = false // 重置状态
  }
}

const togglePlay = () => {
  if (!audioRef.value || !hasFile.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play()
  }
}

const onTimeUpdate = () => {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime
    duration.value = audioRef.value.duration
  }
}

const updateVolume = () => {
  if (audioRef.value) audioRef.value.volume = volume.value
}

// 拖拽逻辑
const startDrag = (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('.no-drag')) return
  isDragging.value = true
  dragOffset.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  }
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  position.value = {
    x: e.clientX - dragOffset.value.x,
    y: e.clientY - dragOffset.value.y
  }
}

const stopDrag = () => {
  isDragging.value = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
}

onMounted(() => {
  if (audioRef.value) audioRef.value.volume = volume.value
})
</script>

<template>
  <div 
    class="fixed z-[100] group select-none"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @mousedown="startDrag"
  >
    <audio 
      ref="audioRef" 
      loop 
      @timeupdate="onTimeUpdate"
      @play="isPlaying = true"
      @pause="isPlaying = false"
    ></audio>

    <!-- 播放器主体 -->
    <div class="relative w-16 h-16 flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95">
      
      <!-- 背景环 (轨道) -->
      <svg class="absolute inset-0 w-full h-full -rotate-90">
        <circle 
          cx="32" cy="32" :r="radius"
          fill="none" 
          stroke="rgba(255,255,255,0.05)" 
          stroke-width="3"
        />
        <!-- 进度环 (边框进度) -->
        <circle 
          cx="32" cy="32" :r="radius"
          fill="none" 
          :stroke="hasFile ? '#7A9D8C' : 'rgba(255,255,255,0.2)'" 
          stroke-width="3"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :style="{ 
            strokeDashoffset: progressOffset,
            transition: isPlaying ? 'stroke-dashoffset 0.3s linear' : 'none'
          }"
        />
      </svg>

      <!-- 中心按钮区 -->
      <div class="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full shadow-xl flex items-center justify-center overflow-hidden cursor-pointer no-drag hover:bg-white/20 transition-colors">
        
        <!-- 未上传状态 -->
        <label v-if="!hasFile" class="cursor-pointer flex items-center justify-center w-full h-full">
          <input type="file" accept="audio/*" class="hidden" @change="handleFile" />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-white/40">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
          </svg>
        </label>

        <!-- 已上传状态 -->
        <div v-else @click.stop="togglePlay" class="flex items-center justify-center w-full h-full">
          <svg v-if="!isPlaying" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="text-white/80 translate-x-0.5">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <div v-else class="flex gap-1">
            <div class="w-1.5 h-5 bg-[#7A9D8C] rounded-full animate-music-bar"></div>
            <div class="w-1.5 h-5 bg-[#7A9D8C] rounded-full animate-music-bar animation-delay-200"></div>
          </div>
        </div>
      </div>

      <!-- 音量调节 (侧边弹出) -->
      <div class="absolute left-full ml-4 opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100 transition-all duration-500 origin-left no-drag">
        <div class="bg-white/10 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 shadow-2xl">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-white/40">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 10 0 0 1 0 7.07"></path>
          </svg>
          <input 
            type="range" min="0" max="1" step="0.01" 
            v-model.number="volume" 
            @input="updateVolume"
            @mousedown.stop
            class="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#7A9D8C]"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 音乐跳动动画 */
@keyframes music-bar {
  0%, 100% { height: 8px; }
  50% { height: 20px; }
}
.animate-music-bar {
  animation: music-bar 0.8s ease-in-out infinite;
}
.animation-delay-200 {
  animation-delay: 0.2s;
}

/* 滑块样式定制 */
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 8px;
  width: 8px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
}

.no-drag {
  cursor: pointer;
}
</style>