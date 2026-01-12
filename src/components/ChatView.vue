<script setup lang="ts">
import { computed } from 'vue'
import { useChatStore } from '../stores/chat'

const chatStore = useChatStore()

const WECHAT_GREEN = '#95ec69'
const isDark = computed(() => chatStore.previewTheme === 'dark')

const getBubbleStyle = (isMe?: boolean) => {
  if (isDark.value) {
    return {
      backgroundColor: isMe ? '#2f7a4a' : '#2a2a2e',
      color: '#f1f1f1'
    }
  }

  return {
    backgroundColor: isMe ? WECHAT_GREEN : '#ffffff',
    color: '#191919'
  }
}

const getArrowStyle = (isMe?: boolean) => {
  const backgroundColor = getBubbleStyle(isMe).backgroundColor
  return isMe
    ? {
        borderLeftColor: backgroundColor,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderRightColor: 'transparent'
      }
    : {
        borderRightColor: backgroundColor,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent'
      }
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
  <div class="p-4 space-y-4 pb-4 pt-2">
    <div v-for="msg in chatStore.messages" :key="msg.id" class="flex flex-col">
      <!-- System Message -->
      <div v-if="msg.type === 'system'" class="flex justify-center my-1">
        <div 
          class="text-[11px] px-2.5 py-0.5 rounded-[4px] leading-tight max-w-[85%] text-center inline-block"
          :class="isDark ? 'text-white/85' : 'text-[#4b4b4b]'"
          :style="{ backgroundColor: chatStore.systemBgColor }"
          v-html="msg.content"
        >
        </div>
      </div>

      <!-- Normal Message -->
      <div v-else :class="['flex gap-2.5 items-start', msg.isMe ? 'flex-row-reverse' : 'flex-row']">
        <!-- Avatar -->
        <div 
          class="w-10 h-10 rounded-[4px] overflow-hidden flex-shrink-0 bg-gray-100"
        >
          <img v-if="msg.sender?.avatar" :src="msg.sender.avatar" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500 font-bold text-sm">
            {{ msg.sender?.name?.charAt(0) || 'U' }}
          </div>
        </div>

        <!-- Content Wrapper -->
        <div class="flex flex-col" :class="msg.isMe ? 'items-end' : 'items-start'">
          <!-- Name for group chat (only others) -->
          <div 
            v-if="!msg.isMe" 
            class="mb-0.5 ml-0.5 scale-90 origin-bottom-left outline-none min-w-[20px]"
            contenteditable
            @blur="(e) => chatStore.updateMessage(msg.id, 'name', (e.target as HTMLElement).innerText)"
            @paste="handlePaste"
            :style="{ 
              color: chatStore.nicknameColor,
              fontSize: chatStore.nicknameSize + 'px',
              fontFamily: chatStore.nicknameFont
            }"
          >
            {{ msg.sender?.name }}
          </div>
          
          <!-- Bubble -->
          <div 
            :class="[
              'relative px-[11px] py-[9px] text-[15px] leading-[22px] rounded-[6px] max-w-[240px] break-words shadow-[0_1px_1px_rgba(0,0,0,0.05)] outline-none'
            ]"
            :style="getBubbleStyle(msg.isMe)"
            contenteditable
            @blur="(e) => chatStore.updateMessage(msg.id, 'content', (e.target as HTMLElement).innerText)"
            @paste="handlePaste"
          >
            {{ msg.content }}
            
            <!-- CSS Triangle Arrow -->
            <div 
              :class="[
                'absolute top-[13px] w-0 h-0 border-[6px]',
                msg.isMe ? 'right-[-5px]' : 'left-[-5px]'
              ]"
              :style="getArrowStyle(msg.isMe)"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.system-name) {
  color: v-bind('chatStore.systemNameColor');
  font-size: v-bind('chatStore.nicknameSize + "px"');
  font-family: v-bind('chatStore.nicknameFont');
  font-weight: 500;
}
</style>
