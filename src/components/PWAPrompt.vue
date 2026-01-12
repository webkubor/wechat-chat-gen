<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { watch } from 'vue'

const {
  offlineReady,
  needRefresh,
  updateServiceWorker
} = useRegisterSW()

// 监听到有新版本需要刷新
watch(needRefresh, (need) => {
  if (need) {
    window.$message.info('发现新版本，点击【立即更新】以体验最新功能', 0) // 0 表示不自动关闭
  }
})

// 监听到离线可用
watch(offlineReady, (ready) => {
  if (ready) {
    window.$message.success('应用已准备就绪，支持离线使用')
  }
})

/**
 * 执行更新
 */
const handleUpdate = async () => {
  await updateServiceWorker(true)
}
</script>

<template>
  <!-- 当需要刷新时，显示一个全局覆盖层或悬浮按钮 -->
  <transition name="fade">
    <div v-if="needRefresh" class="fixed bottom-24 left-1/2 -translate-x-1/2 z-[10000]">
      <button 
        @click="handleUpdate"
        class="bg-[#7A9D8C] hover:bg-[#6B8E78] text-white px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-2 animate-bounce active:scale-95 transition-all"
      >
        <span>🚀 发现新版本，立即更新</span>
      </button>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
