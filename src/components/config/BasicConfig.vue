<script setup lang="ts">
import { useChatStore } from '../../stores/chat'
import BaseSelect from '../ui/BaseSelect.vue'

const chatStore = useChatStore()

const themeOptions = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' }
]

const deviceOptions = [
  { label: 'iOS 风格', value: 'ios' },
  { label: 'Android 风格', value: 'android' }
]

const fontOptions = [
  { label: '默认无衬线', value: 'sans-serif' },
  { label: '苹方 (Mac/iOS)', value: "'PingFang SC', sans-serif" },
  { label: '微软雅黑 (Win)', value: "'Microsoft YaHei', sans-serif" },
  { label: '衬线体 (优雅)', value: 'serif' },
  { label: '等宽体 (极客)', value: 'monospace' }
]
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center gap-2 mb-2">
       <div class="w-1 h-4 bg-[#7A9D8C] rounded-full"></div>
       <h3 class="text-sm font-medium text-white/80 tracking-wide">外观设置</h3>
    </div>
    
    <div class="group">
      <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">预览主题</label>
      <BaseSelect v-model="chatStore.previewTheme" :options="themeOptions" />
    </div>

    <details class="group">
      <summary class="flex items-center gap-2 cursor-pointer list-none text-[10px] text-white/40 uppercase tracking-widest hover:text-white/70 transition-colors">
        <svg viewBox="0 0 24 24" class="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
        展开更多
      </summary>

      <div class="mt-4 space-y-4 pt-4 border-t border-white/5">
        <div class="group">
          <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2 group-focus-within:text-[#7A9D8C] transition-colors">系统样式</label>
          <BaseSelect v-model="chatStore.deviceType" :options="deviceOptions" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">昵称颜色</label>
            <div class="flex items-center h-[46px] bg-white/5 rounded-xl px-2 gap-2">
              <input v-model="chatStore.nicknameColor" type="color" class="w-8 h-8 bg-transparent border-none cursor-pointer" />
              <span class="text-[10px] text-white/60 font-mono text-xs">{{ chatStore.nicknameColor }}</span>
            </div>
          </div>
          <div class="group">
            <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">昵称大小</label>
            <div class="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2">
              <input v-model.number="chatStore.nicknameSize" type="range" min="8" max="20" class="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#7A9D8C]" />
              <span class="text-xs text-white/60 font-mono w-6">{{ chatStore.nicknameSize }}</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="group">
            <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">昵称字体</label>
            <BaseSelect v-model="chatStore.nicknameFont" :options="fontOptions" />
          </div>
          <div class="group">
            <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">顶部时间</label>
            <input v-model="chatStore.statusBarTime" type="text" class="w-full bg-white/5 hover:bg-white/10 border border-transparent focus:border-[#7A9D8C]/50 rounded-xl px-4 py-3 text-[10px] text-white font-mono focus:outline-none transition-all" />
          </div>
        </div>

        <div class="group">
          <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">提示内昵称颜色</label>
          <div class="flex items-center h-[46px] bg-white/5 rounded-xl px-2 gap-2">
            <input v-model="chatStore.systemNameColor" type="color" class="w-8 h-8 bg-transparent border-none cursor-pointer" />
            <span class="text-[10px] text-white/60 font-mono text-xs">{{ chatStore.systemNameColor }}</span>
          </div>
        </div>
      </div>
    </details>
  </div>
</template>

