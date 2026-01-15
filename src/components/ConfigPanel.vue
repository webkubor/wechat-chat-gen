<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useChatStore } from '../stores/chat'
import { useCorpusStore } from '../stores/corpus'
import { useExport } from '../composables/useExport'
import { useSound } from '../composables/useSound'

// 子组件导入
import BasicConfig from './config/BasicConfig.vue'
import ExportConfig from './config/ExportConfig.vue'

const chatStore = useChatStore()
const corpusStore = useCorpusStore()
const { playClick, playSuccess, playError, playWater } = useSound()

// 核心状态
const currentMode = ref<'chat' | 'join'>('chat')
const genCount = ref(10)
const MIN_GEN_COUNT = 5
const MAX_GEN_COUNT = 60
const hasMessages = computed(() => chatStore.messages.length > 0)

// 逻辑逻辑抽离 (现在不需要 showToast 了，由全局 window.$message 处理)
const { isDownloading, isQueueing, exportIndex, queue, handleQuickDownload, addToQueue, removeFromQueue, clearQueue, handleBatchDownload } = useExport()

onMounted(async () => {
  await corpusStore.init()
  // 仅在消息为空时初始自动生成消息
  if (chatStore.messages.length === 0) {
    chatStore.batchAddRandomDialog(genCount.value)
  }
})

watch(genCount, (value) => {
  if (!Number.isFinite(value)) {
    genCount.value = MIN_GEN_COUNT
    return
  }
  const normalized = Math.min(MAX_GEN_COUNT, Math.max(MIN_GEN_COUNT, Math.round(value)))
  if (normalized !== value) {
    genCount.value = normalized
  }
})

// 监听模式切换
watch(currentMode, (newMode) => {
  chatStore.clearMessages()
  if (newMode === 'join') {
    chatStore.batchAddJoinMessages(genCount.value)
  } else {
    chatStore.batchAddRandomDialog(genCount.value)
  }
})

// 刷新生成逻辑
const handleGenerate = () => {
  if (currentMode.value === 'join') {
    chatStore.batchAddJoinMessages(genCount.value)
  } else {
    chatStore.batchAddRandomDialog(genCount.value)
  }
}

const onGenerateClick = () => {
  handleGenerate()
  playSuccess()
}

const handleClearAll = async () => {
  if (!hasMessages.value) {
    window.$message?.info('暂无可清空的内容')
    return
  }

  const confirmed = window.$confirm
    ? await window.$confirm({
        title: '确认清空？',
        message: '此操作会删除当前聊天内容，无法撤销。',
        confirmText: '确认清空',
        cancelText: '取消',
        confirmType: 'danger'
      })
    : false

  if (!confirmed) return

  chatStore.clearMessages()
  window.$message?.success('聊天内容已清空')
}

const onClearAllClick = async () => {
  await handleClearAll()
  playWater()
}

const handleAvatarUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => chatStore.setCurrentUserAvatar(ev.target?.result as string)
    reader.readAsDataURL(file)
  }
}

const handleBgUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => chatStore.setBg(ev.target?.result as string)
    reader.readAsDataURL(file)
  }
}

const idiomText = ref('')
const handleIdiomReplace = () => {
  const text = idiomText.value.trim()
  if (!text) {
    window.$message?.info('请输入内容')
    return
  }
  if (chatStore.messages.length === 0) {
    window.$message?.info('暂无消息可替换')
    return
  }

  chatStore.messages.forEach((msg) => {
    if (msg.type === 'text') {
      msg.content = text
    }
  })
  chatStore.save()
  window.$message?.success('已将所有消息替换为输入内容')
  idiomText.value = ''
}

const onIdiomReplaceClick = () => {
  handleIdiomReplace()
  playSuccess()
}
</script>

<template>
  <div class="space-y-8 relative">
    <!-- 对话模式 -->
    <div class="group">
      <div class="bg-black/20 p-1.5 rounded-2xl flex relative overflow-hidden backdrop-blur-sm">
        <button @click="currentMode = 'chat'" class="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all duration-500 relative z-10" :class="currentMode === 'chat' ? 'text-white shadow-lg' : 'text-white/40 hover:text-white/60'">对话模式</button>
        <button @click="currentMode = 'join'" class="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all duration-500 relative z-10" :class="currentMode === 'join' ? 'text-white shadow-lg' : 'text-white/40 hover:text-white/60'">拉人模式</button>
        <div class="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#7A9D8C] rounded-xl transition-all duration-500 ease-spring" :class="currentMode === 'chat' ? 'left-1.5' : 'left-[calc(50%+3px)]'"></div>
      </div>
    </div>

    <!-- 1. 内容设置模块 -->
    <div class="space-y-5">
      <div class="flex items-center gap-2 mb-2">
         <div class="w-1 h-4 bg-[#6B8E78] rounded-full"></div>
         <h3 class="text-sm font-medium text-white/80 tracking-wide">内容设置</h3>
      </div>

      <div class="group">
        <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2 group-focus-within:text-[#7A9D8C] transition-colors">群聊标题</label>
        <div class="flex gap-3">
          <input
            v-model="chatStore.groupTitle"
            type="text"
            placeholder="群聊名称"
            class="flex-1 bg-white/5 hover:bg-white/10 border border-transparent focus:border-[#7A9D8C]/50 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-4 focus:ring-[#7A9D8C]/10 transition-all duration-300"
          />
          <div class="w-24 relative">
             <input
              v-model.number="chatStore.memberCount"
              type="number"
              class="w-full bg-white/5 hover:bg-white/10 border border-transparent focus:border-[#7A9D8C]/50 rounded-xl px-3 py-3 text-sm text-white text-center focus:outline-none focus:ring-4 focus:ring-[#7A9D8C]/10 transition-all duration-300"
              placeholder="188"
            />
            <span class="absolute right-3 top-3.5 text-[10px] text-white/30 pointer-events-none">人</span>
          </div>
        </div>
      </div>

      <div>
        <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">我的头像</label>
        <label class="flex items-center justify-center w-[46px] h-[46px] bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-xl cursor-pointer transition-all duration-300 group hover:border-[#7A9D8C]/50 overflow-hidden">
          <span v-if="!chatStore.currentUser.avatar" class="text-xs text-white/40 group-hover:text-[#7A9D8C] transition-colors">上传</span>
          <div v-else class="w-full h-full rounded-[10px] overflow-hidden">
            <img :src="chatStore.currentUser.avatar" class="w-full h-full object-cover object-center" />
          </div>
          <input type="file" @change="handleAvatarUpload" accept="image/*" class="hidden" />
        </label>
      </div>

      <div>
        <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">聊天背景</label>
        <label class="flex items-center justify-center w-full h-[46px] bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-xl cursor-pointer transition-all duration-300 group hover:border-[#7A9D8C]/50">
          <span class="text-xs text-white/40 group-hover:text-[#7A9D8C] transition-colors">上传图片</span>
          <input type="file" @change="handleBgUpload" accept="image/*" class="hidden" />
        </label>
      </div>

      <div class="flex gap-2 items-center">
        <div class="group flex-1">
          <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">发言条数</label>
          <input
            v-model.number="genCount"
            type="number"
            :min="MIN_GEN_COUNT"
            :max="MAX_GEN_COUNT"
            class="w-full bg-white/5 hover:bg-white/10 border border-transparent focus:border-[#7A9D8C]/50 rounded-xl px-4 py-3 text-sm text-white text-center focus:outline-none focus:ring-4 focus:ring-[#7A9D8C]/10 transition-all duration-300"
          />
        </div>
        <button
          @click="onGenerateClick"
          class="mt-5 px-4 py-3 bg-[#7A9D8C]/60 hover:bg-[#7A9D8C]/80 text-white rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
        >
          生成
        </button>
      </div>

      <div class="group">
        <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">统一内容（成语接龙）</label>
        <div class="flex gap-2">
          <input
            v-model="idiomText"
            type="text"
            placeholder="输入内容后替换所有消息"
            class="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#7A9D8C]/50 transition-all"
            @keydown.enter="handleIdiomReplace"
          />
          <button
            @click="onIdiomReplaceClick"
            :disabled="!idiomText.trim()"
            class="px-4 py-3 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl text-sm font-medium border border-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            替换
          </button>
        </div>
      </div>

      <button
        @click="onClearAllClick"
        :disabled="!hasMessages"
        title="清空所有聊天内容"
        class="w-full py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-200 rounded-xl font-medium text-sm border border-red-400/20 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        清屏
      </button>
    </div>

    <!-- 2. 外观设置模块 -->


    <BasicConfig />

    <!-- 3. 导出与操作模块 -->
    <ExportConfig 
      v-model:exportIndex="exportIndex"
      v-model:isDownloading="isDownloading"
      v-model:isQueueing="isQueueing"
      v-model:queue="queue"
      @quick-download="handleQuickDownload"
      @add-to-queue="addToQueue"
      @remove-from-queue="removeFromQueue"
      @clear-queue="clearQueue"
      @batch-download="handleBatchDownload"
    />
  </div>
</template>

<style scoped>
.ease-spring {
  transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
