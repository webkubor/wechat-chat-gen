<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useChatStore } from '../stores/chat'
import { useCorpusStore } from '../stores/corpus'
import { useExport } from '../composables/useExport'

// 子组件导入
import BasicConfig from './config/BasicConfig.vue'
import AdvancedConfig from './config/AdvancedConfig.vue'
import ExportConfig from './config/ExportConfig.vue'
import ConfigFooter from './config/ConfigFooter.vue'

const chatStore = useChatStore()
const corpusStore = useCorpusStore()

// 核心状态
const currentMode = ref<'chat' | 'join'>('chat')
const genCount = ref(20)

// 逻辑逻辑抽离 (现在不需要 showToast 了，由全局 window.$message 处理)
const { isDownloading, exportIndex, queue, handleQuickDownload, addToQueue, removeFromQueue, clearQueue, handleBatchDownload } = useExport()

onMounted(async () => {
  await corpusStore.init()
  // 仅在消息为空时初始自动生成消息
  if (chatStore.messages.length === 0) {
    chatStore.batchAddRandomDialog(20)
  }
})

// 监听模式切换
watch(currentMode, (newMode) => {
  chatStore.clearMessages()
  if (newMode === 'join') {
    chatStore.batchAddJoinMessages(20)
  } else {
    chatStore.batchAddRandomDialog(20)
  }
})

// 刷新生成逻辑
const handleGenerate = () => {
  chatStore.clearMessages()
  if (currentMode.value === 'join') {
    chatStore.batchAddJoinMessages(genCount.value)
  } else {
    chatStore.batchAddRandomDialog(genCount.value)
  }
}
</script>

<template>
  <div class="space-y-8 relative">
    <!-- 1. 基础设置模块 -->
    <BasicConfig v-model:mode="currentMode" />

    <!-- 2. 高级设置模块 -->
    <AdvancedConfig />

    <!-- 3. 导出与操作模块 -->
    <ExportConfig 
      v-model:exportIndex="exportIndex"
      v-model:isDownloading="isDownloading"
      v-model:queue="queue"
      @generate="handleGenerate"
      @quick-download="handleQuickDownload"
      @add-to-queue="addToQueue"
      @remove-from-queue="removeFromQueue"
      @clear-queue="clearQueue"
      @batch-download="handleBatchDownload"
    />

    <!-- 4. 页脚信息模块 -->
    <ConfigFooter />
  </div>
</template>
