<script setup lang="ts">
import { ref, watch } from 'vue'
import { useChatStore } from '../stores/chat'
import { useExport } from '../composables/useExport'

// 子组件导入
import BasicConfig from './config/BasicConfig.vue'
import ExportConfig from './config/ExportConfig.vue'
import ChatModeConfig from './config/ChatModeConfig.vue'
import JoinModeConfig from './config/JoinModeConfig.vue'

const chatStore = useChatStore()

// 核心状态
const currentMode = ref<'chat' | 'join'>('chat')

// 逻辑逻辑抽离 (现在不需要 showToast 了，由全局 window.$message 处理)
const { isDownloading, isQueueing, exportIndex, queue, handleQuickDownload, addToQueue, removeFromQueue, clearQueue, handleBatchDownload } = useExport()

// 监听模式切换
watch(currentMode, (newMode) => {
  chatStore.clearMessages()
  if (newMode === 'join') {
    chatStore.batchAddJoinMessages(10)
  } else {
    chatStore.batchAddRandomDialog(10)
  }
})
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
    <ChatModeConfig v-if="currentMode === 'chat'" />
    <JoinModeConfig v-if="currentMode === 'join'" />

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
