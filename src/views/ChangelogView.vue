<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface LogItem {
  version: string
  date: string
  features: string[]
}

interface VersionData {
  version: string
  updatedAt: string
  changelog: LogItem[]
}

const router = useRouter()
const logs = ref<LogItem[]>([])
const currentVersion = ref('')

onMounted(async () => {
  try {
    const res = await fetch('/version.json')
    const data: VersionData = await res.json()
    logs.value = data.changelog
    currentVersion.value = data.version
  } catch (e) {
    console.error('Failed to load changelog', e)
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#2C3639] text-white/90 font-sans selection:bg-[#7A9D8C] selection:text-white flex flex-col items-center py-12 px-6">
    
    <!-- Header -->
    <div class="w-full max-w-2xl mb-12 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-light tracking-wide text-[#E8F1F2] mb-2">
          Update<span class="font-bold text-[#7A9D8C]">Log</span>
        </h1>
        <p class="text-white/40 text-xs tracking-wider uppercase">Project Changelog & History</p>
      </div>
      <button 
        @click="router.back()"
        class="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium border border-white/10 transition-all flex items-center gap-2 text-white/60 hover:text-white"
      >
        <span>← 返回</span>
      </button>
    </div>

    <!-- Timeline -->
    <div class="w-full max-w-2xl space-y-8 relative">
      <!-- Vertical Line -->
      <div class="absolute left-[19px] top-4 bottom-4 w-[2px] bg-white/5 z-0"></div>

      <div 
        v-for="(log, index) in logs" 
        :key="log.version"
        class="relative z-10 pl-10 group"
      >
        <!-- Dot -->
        <div 
          class="absolute left-0 top-1.5 w-10 h-10 flex items-center justify-center"
        >
          <div 
            class="w-2.5 h-2.5 rounded-full border-2 transition-colors duration-300 bg-[#2C3639]"
            :class="index === 0 ? 'border-[#7A9D8C] scale-125' : 'border-white/20 group-hover:border-white/40'"
          ></div>
        </div>

        <!-- Content Card -->
        <div class="bg-white/5 hover:bg-white/[0.07] border border-white/5 rounded-2xl p-6 transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <span class="text-xl font-bold tracking-tight">v{{ log.version }}</span>
              <span v-if="index === 0" class="px-2 py-0.5 bg-[#7A9D8C]/20 text-[#7A9D8C] text-[10px] font-bold rounded uppercase tracking-wider">Latest</span>
            </div>
            <span class="text-sm text-white/30 font-mono">{{ log.date }}</span>
          </div>

          <ul class="space-y-3">
            <li 
              v-for="(feature, fIndex) in log.features" 
              :key="fIndex"
              class="flex items-start gap-3 text-sm text-white/70 leading-relaxed"
            >
              <span class="mt-1.5 w-1 h-1 rounded-full bg-white/30 shrink-0"></span>
              {{ feature }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="mt-20 text-center">
      <p class="text-[10px] text-white/20 tracking-[0.2em] uppercase">© 2026 WeChat Gen</p>
    </footer>

  </div>
</template>
