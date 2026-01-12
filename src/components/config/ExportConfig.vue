<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '../../stores/chat'

const chatStore = useChatStore()
const exportIndex = defineModel<number>('exportIndex', { required: true })
const isDownloading = defineModel<boolean>('isDownloading', { required: true })
const queue = defineModel<Array<{ id: string; url: string }>>('queue', { required: true })
const isQueueing = defineModel<boolean>('isQueueing', { required: true })
const previewUrl = ref<string | null>(null)

const openPreview = (url: string) => {
  previewUrl.value = url
}

const closePreview = () => {
  previewUrl.value = null
}

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
       <h3 class="text-sm font-medium text-white/80 tracking-wide">操作与导出</h3>
    </div>

    <div class="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-6">
      <div class="flex flex-col gap-3">
        <div class="flex gap-3">
          <button @click="$emit('generate')" class="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl font-medium text-sm border border-white/10 transition-all active:scale-[0.98]">生成预览</button>
          <button @click="chatStore.clearMessages()" class="flex-1 py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium text-sm border border-red-500/20 transition-all active:scale-[0.98]">清空消息</button>
          <button @click="$emit('quickDownload')" class="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl font-medium text-sm border border-white/10 transition-all active:scale-[0.98]">下载当前</button>
        </div>
        
        <button @click="chatStore.isHighlightingCapture = !chatStore.isHighlightingCapture" class="w-full py-3.5 rounded-xl font-medium text-sm border border-white/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2" :class="chatStore.isHighlightingCapture ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-white/5 hover:bg-white/10 text-white/80'">
          <span>{{ chatStore.isHighlightingCapture ? '隐藏截图范围' : '显示截图范围' }}</span>
        </button>

        <button @click="$emit('addToQueue')" :disabled="isQueueing" class="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl font-medium text-sm border border-white/10 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <svg v-if="isQueueing" class="animate-spin h-4 w-4 text-white/70" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span>{{ isQueueing ? '正在加入队列...' : '加入队列' }}</span>
        </button>

        <div class="rounded-xl border border-white/10 bg-black/10 p-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] text-white/40 uppercase tracking-widest">待下载队列</span>
            <button v-if="queue.length" @click="$emit('clearQueue')" class="text-[10px] text-white/40 hover:text-white/70 transition-colors">清空队列</button>
          </div>
          <div v-if="queue.length" class="grid grid-cols-4 gap-2">
            <div v-for="item in queue" :key="item.id" class="relative rounded-md overflow-hidden border border-white/10 bg-white/5">
              <button type="button" class="w-full text-left cursor-zoom-in" @click="openPreview(item.url)">
                <div class="w-full" :class="chatStore.exportRatio === '3:4' ? 'aspect-[3/4]' : 'aspect-[9/16]'">
                  <img :src="item.url" class="w-full h-full object-cover" />
                </div>
              </button>
              <button @click="$emit('removeFromQueue', item.id)" class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] leading-5">×</button>
            </div>
          </div>
          <div v-if="queue.length" class="text-center text-[10px] text-white/30 mt-3">点击缩略图预览</div>
          <div v-else class="text-center text-[10px] text-white/30 py-3">暂无队列预览</div>
        </div>

        <button @click="$emit('batchDownload')" :disabled="isDownloading || queue.length === 0" class="w-full py-4 bg-gradient-to-r from-[#7A9D8C] to-[#6B8E78] disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-bold text-sm shadow-[0_10px_30px_-10px_rgba(122,157,140,0.4)] transition-all transform active:scale-[0.98] flex items-center justify-center gap-2">
          <span v-if="!isDownloading">批量下载（{{ queue.length }}）</span>
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

    <Teleport to="body">
      <div v-if="previewUrl" class="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" @click.self="closePreview">
        <div class="relative max-w-[92vw] max-h-[92vh] rounded-2xl bg-black/40 border border-white/10 shadow-2xl p-4">
          <button type="button" class="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-black/80 text-white text-lg leading-8 text-center" @click="closePreview">×</button>
          <img :src="previewUrl" class="max-w-[88vw] max-h-[84vh] object-contain rounded-xl" />
        </div>
      </div>
    </Teleport>
  </div>
</template>
