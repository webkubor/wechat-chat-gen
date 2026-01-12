<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useChatStore } from '../stores/chat'
import { useCorpusStore } from '../stores/corpus'
import { useToast } from '../composables/useToast'
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
const downloadCount = ref(3)

// 逻辑逻辑抽离
const { toastMessage, toastType, showToast } = useToast()
const { isDownloading, exportIndex, handleQuickDownload, handleBatchDownload } = useExport({
  showToast,
  handleGenerate: () => handleGenerate()
})

onMounted(async () => {
  await corpusStore.init()
  // 初始自动生成消息
  chatStore.batchAddRandomDialog(20)
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
    <!-- Toast 提示通知 -->
    <transition name="toast">
      <div
        v-if="toastMessage"
        class="fixed top-6 right-6 z-[100] px-4 py-2 rounded-xl text-xs font-medium shadow-2xl backdrop-blur-md border"
        :class="toastType === 'error' ? 'bg-red-500/20 text-red-100 border-red-400/40' : 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40'"
      >
        {{ toastMessage }}
      </div>
    </transition>
    
    <!-- 1. 基础设置模块 -->
    <BasicConfig v-model:mode="currentMode" />

    <!-- 2. 高级设置模块 -->
    <AdvancedConfig />

    <!-- 3. 导出与操作模块 -->
    <ExportConfig 
      v-model:downloadCount="downloadCount"
      v-model:exportIndex="exportIndex"
      v-model:isDownloading="isDownloading"
      @generate="handleGenerate"
      @quick-download="handleQuickDownload"
      @batch-download="handleBatchDownload(downloadCount)"
    />

    <!-- 4. 页脚信息模块 -->
    <ConfigFooter />
  </div>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
