<script setup lang="ts">
import { useChatStore } from '../../stores/chat'

const chatStore = useChatStore()
const exportIndex = defineModel<number>('exportIndex', { required: true })
const isDownloading = defineModel<boolean>('isDownloading', { required: true })
const queue = defineModel<Array<{ id: string; url: string; dataUrl?: string }>>('queue', { required: true })

defineEmits<{
  (e: 'generate'): void
  (e: 'quickDownload'): void
  (e: 'addToQueue'): void
  (e: 'removeFromQueue', id: string): void
  (e: 'clearQueue'): void
  (e: 'batchDownload'): void
}>()
</script>

<template>
  <div class="space-y-5 pt-4 border-t border-white/5">
    <div class="flex items-center gap-2 mb-2">
       <div class="w-1 h-4 bg-[#A27B5C] rounded-full"></div>
       <h3 class="text-sm font-medium text-white/80 tracking-wide">导出设置</h3>
    </div>

    <div class="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-6">
      <div class="flex flex-col gap-3">
        <div class="flex gap-3">
          <button @click="$emit('generate')" class="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl font-medium text-sm border border-white/10 transition-all active:scale-[0.98]">刷新</button>
          <button @click="chatStore.clearMessages()" class="flex-1 py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium text-sm border border-red-500/20 transition-all active:scale-[0.98]">清空</button>
          <button @click="$emit('quickDownload')" class="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl font-medium text-sm border border-white/10 transition-all active:scale-[0.98]">下载 PNG</button>
        </div>
        
        <button @click="chatStore.isHighlightingCapture = !chatStore.isHighlightingCapture" class="w-full py-3.5 rounded-xl font-medium text-sm border border-white/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2" :class="chatStore.isHighlightingCapture ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-white/5 hover:bg-white/10 text-white/80'">
          <span>{{ chatStore.isHighlightingCapture ? '🔆 停止闪烁预览截图区' : '👁️ 预览截图区' }}</span>
        </button>

        <button @click="$emit('addToQueue')" class="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl font-medium text-sm border border-white/10 transition-all active:scale-[0.98]">加入待下载队列</button>

        <div class="rounded-xl border border-white/10 bg-black/10 p-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] text-white/40 uppercase tracking-widest">待下载队列</span>
            <button v-if="queue.length" @click="$emit('clearQueue')" class="text-[10px] text-white/40 hover:text-white/70 transition-colors">清空队列</button>
          </div>
          <div v-if="queue.length" class="grid grid-cols-4 gap-2">
            <div v-for="item in queue" :key="item.id" class="relative rounded-md overflow-hidden border border-white/10 bg-white/5">
              <img :src="item.url" class="w-full h-14 object-cover" />
              <button @click="$emit('removeFromQueue', item.id)" class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] leading-5">×</button>
            </div>
          </div>
          <div v-else class="text-center text-[10px] text-white/30 py-3">暂无队列预览</div>
        </div>

        <button @click="$emit('batchDownload')" :disabled="isDownloading || queue.length === 0" class="w-full py-4 bg-gradient-to-r from-[#7A9D8C] to-[#6B8E78] disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-bold text-sm shadow-[0_10px_30px_-10px_rgba(122,157,140,0.4)] transition-all transform active:scale-[0.98] flex items-center justify-center gap-2">
          <span v-if="!isDownloading">🚀 一键批量下载成品图</span>
          <span v-else class="flex items-center gap-2">
            <svg class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            正在导出中...
          </span>
        </button>
        <div v-if="isDownloading" class="text-center text-xs text-white/50">已导出 {{ exportIndex }} / {{ queue.length }} 张</div>
      </div>
      
      <p class="text-center text-[10px] text-white/30 tracking-wide leading-relaxed">
        将满意的预览加入队列后再批量下载<br/>
        (浏览器可能会拦截多文件下载，请注意允许)
      </p>
    </div>
  </div>
</template>
