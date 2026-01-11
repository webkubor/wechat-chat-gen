<script setup lang="ts">
import { ref, onMounted } from 'vue'

const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const volume = ref(0.5)
const hasFile = ref(false)
const position = ref({ x: 20, y: 100 })
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

const handleFile = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file && audioRef.value) {
    const url = URL.createObjectURL(file)
    audioRef.value.src = url
    hasFile.value = true
    play()
  }
}

const togglePlay = () => {
  if (!audioRef.value || !hasFile.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const play = () => {
  audioRef.value?.play()
  isPlaying.value = true
}

const updateVolume = () => {
  if (audioRef.value) {
    audioRef.value.volume = volume.value
  }
}

// Drag Logic
const startDrag = (e: MouseEvent) => {
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
    class="fixed z-50 flex items-center gap-3 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-2xl cursor-grab active:cursor-grabbing transition-shadow hover:bg-white/15 group select-none"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @mousedown="startDrag"
  >
    <audio ref="audioRef" loop @ended="isPlaying = false"></audio>
    
    <!-- Upload / Icon -->
    <label class="relative w-10 h-10 flex items-center justify-center bg-black/20 rounded-full cursor-pointer hover:bg-black/30 transition-colors overflow-hidden">
      <input type="file" accept="audio/*" class="hidden" @change="handleFile" />
      <div 
        class="text-white/80 transition-transform duration-[3s] ease-linear"
        :class="isPlaying ? 'animate-spin-slow' : ''"
      >
        <svg v-if="hasFile" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
      </div>
    </label>

    <!-- Controls -->
    <div class="flex items-center gap-2" v-if="hasFile">
      <button 
        @click.stop="togglePlay"
        class="w-8 h-8 flex items-center justify-center text-white/90 hover:text-white transition-colors"
      >
        <svg v-if="isPlaying" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
      </button>
      
      <!-- Volume Slider (Hidden until hover) -->
      <div class="w-0 overflow-hidden group-hover:w-20 transition-all duration-300 flex items-center">
        <input 
          type="range" min="0" max="1" step="0.01" 
          v-model.number="volume" 
          @input="updateVolume"
          class="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#7A9D8C]"
          @mousedown.stop
        />
      </div>
    </div>
    
    <div v-else class="text-xs text-white/50 pr-2">
      BGM Player
    </div>
  </div>
</template>

<style scoped>
.animate-spin-slow {
  animation: spin 4s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Range Slider Reset */
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 10px;
  width: 10px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  box-shadow: 0 0 5px rgba(0,0,0,0.2);
}
</style>