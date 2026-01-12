<script setup lang="ts">
import { useChatStore } from '../../stores/chat'
import BaseSelect from '../ui/BaseSelect.vue'

const chatStore = useChatStore()

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

const statusBarThemeOptions = [
  { label: '黑色图标', value: 'dark' },
  { label: '白色图标', value: 'light' }
]

const handleBgUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => chatStore.setBg(ev.target?.result as string)
    reader.readAsDataURL(file)
  }
}

const handleAvatarUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => chatStore.setCurrentUserAvatar(ev.target?.result as string)
    reader.readAsDataURL(file)
  }
}
</script>

<template>
  <details class="group space-y-5">
    <summary class="flex items-center justify-between gap-3 cursor-pointer list-none">
      <div class="flex items-center gap-2">
         <div class="w-1 h-4 bg-[#A27B5C] rounded-full"></div>
         <h3 class="text-sm font-medium text-white/80 tracking-wide">高级设置</h3>
      </div>
      <span class="text-xs text-white/40 group-open:rotate-180 transition-transform">▼</span>
    </summary>

    <div class="grid grid-cols-3 gap-4">
      <div class="group">
        <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2 group-focus-within:text-[#7A9D8C] transition-colors">系统样式</label>
        <BaseSelect v-model="chatStore.deviceType" :options="deviceOptions" />
      </div>
      <div>
        <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">聊天背景</label>
        <label class="flex items-center justify-center w-full h-[46px] bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-xl cursor-pointer transition-all duration-300 group hover:border-[#7A9D8C]/50">
          <span class="text-xs text-white/40 group-hover:text-[#7A9D8C] transition-colors">上传图片</span>
          <input type="file" @change="handleBgUpload" accept="image/*" class="hidden" />
        </label>
      </div>
      <div>
        <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">我的头像</label>
        <label class="flex items-center justify-center w-full h-[46px] bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-xl cursor-pointer transition-all duration-300 group hover:border-[#7A9D8C]/50 overflow-hidden">
          <span v-if="!chatStore.currentUser.avatar" class="text-xs text-white/40 group-hover:text-[#7A9D8C] transition-colors">上传头像</span>
          <div v-else class="w-10 h-10 rounded-[10px] overflow-hidden">
            <img :src="chatStore.currentUser.avatar" class="w-full h-full object-cover object-center" />
          </div>
          <input type="file" @change="handleAvatarUpload" accept="image/*" class="hidden" />
        </label>
      </div>
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

    <div class="grid grid-cols-2 gap-4">
      <div class="group text-center flex flex-col items-center justify-center">
        <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2 w-full text-left">系统状态</label>
        <span class="text-[10px] text-[#7A9D8C]/60 italic">状态栏配色已自动联动预览主题</span>
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
</template>
