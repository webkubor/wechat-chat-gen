<script setup lang="ts">
import { computed } from 'vue'
import { useChatListStore } from '../stores/chatList'
import type { ChatListItem } from '../types/database'

const props = defineProps<{
  item: ChatListItem
}>()

const chatListStore = useChatListStore()

const truncatedMessage = computed(() => {
  const fullMessage = `${props.item.lastSender}:${props.item.lastMessage}`
  return fullMessage.length > 24 ? fullMessage.slice(0, 24) + '...' : fullMessage
})

const handleTitleEdit = (e: Event) => {
  const target = e.target as HTMLElement
  chatListStore.updateItemField(props.item.id, 'title', target.innerText)
}

const handleMessageEdit = (e: Event) => {
  const target = e.target as HTMLElement
  chatListStore.updateItemField(props.item.id, 'lastMessage', target.innerText)
}

const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const text = e.clipboardData?.getData('text/plain')
  if (text) {
    document.execCommand('insertText', false, text)
  }
}
</script>

<template>
  <div 
    :class="[
      'flex items-center px-4 py-3 bg-white cursor-pointer hover:bg-[#f5f5f5] transition-colors relative',
      item.isPinned ? 'bg-[#fafafa]' : ''
    ]"
  >
    <!-- 置顶标识 -->
    <div v-if="item.isPinned" class="absolute left-0 top-0 bottom-0 w-[2px] bg-[#07c160]"></div>
    
    <!-- 群聊头像（九宫格） -->
    <div class="relative w-[50px] h-[50px] rounded-[6px] overflow-hidden flex-shrink-0 bg-[#e5e5e5] mr-3">
      <div class="grid grid-cols-3 gap-[1px] w-full h-full p-[2px]">
        <div 
          v-for="(avatar, index) in item.avatars.slice(0, 9)" 
          :key="index"
          class="w-full h-full overflow-hidden"
        >
          <img 
            v-if="avatar" 
            :src="avatar" 
            class="w-full h-full object-cover"
            alt=""
          />
          <div v-else class="w-full h-full bg-[#d9d9d9]"></div>
        </div>
      </div>
      
      <!-- 未读数角标 -->
      <div 
        v-if="item.unreadCount && item.unreadCount > 0"
        class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-[5px] bg-[#fa5151] rounded-full flex items-center justify-center text-white text-[11px] font-medium z-10"
      >
        {{ item.unreadCount > 99 ? '99+' : item.unreadCount }}
      </div>
    </div>
    
    <!-- 内容区域 -->
    <div class="flex-1 min-w-0 flex flex-col justify-center">
      <!-- 标题 -->
      <div 
        class="text-[16px] text-[#111] font-medium leading-[22px] mb-1 truncate outline-none"
        contenteditable
        @blur="handleTitleEdit"
        @paste="handlePaste"
      >
        {{ item.title }}
      </div>
      
      <!-- 最后消息 -->
      <div 
        class="text-[13px] text-[#999] leading-[18px] truncate outline-none"
        contenteditable
        @blur="handleMessageEdit"
        @paste="handlePaste"
      >
        {{ truncatedMessage }}
      </div>
    </div>
    
    <!-- 时间 -->
    <div class="flex-shrink-0 ml-2 text-[11px] text-[#b2b2b2] self-start mt-[2px]">
      {{ item.time }}
    </div>
  </div>
</template>
