<script setup lang="ts">
import { ref } from 'vue'

export type MessageType = 'success' | 'error' | 'info'

interface MessageItem {
  id: number
  type: MessageType
  text: string
}

const messages = ref<MessageItem[]>([])
let seed = 0

/**
 * 添加一条消息
 */
const add = (text: string, type: MessageType = 'success', duration = 3000) => {
  const id = seed++
  messages.value.push({ id, type, text })
  
  setTimeout(() => {
    remove(id)
  }, duration)
}

/**
 * 移除一条消息
 */
const remove = (id: number) => {
  const index = messages.value.findIndex(m => m.id === id)
  if (index !== -1) {
    messages.value.splice(index, 1)
  }
}

// 暴露 API
defineExpose({ add })
</script>

<template>
  <div class="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 pointer-events-none">
    <transition-group name="msg-slide">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md border flex items-center gap-3 pointer-events-auto"
        :class="[
          msg.type === 'error' 
            ? 'bg-red-500/20 text-red-100 border-red-400/40' 
            : 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40'
        ]"
      >
        <!-- 图标 -->
        <span class="text-lg">
          <template v-if="msg.type === 'error'">✕</template>
          <template v-else>✓</template>
        </span>
        
        <!-- 文字 -->
        <span class="text-sm font-medium tracking-wide">{{ msg.text }}</span>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.msg-slide-enter-active,
.msg-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.msg-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.msg-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>
