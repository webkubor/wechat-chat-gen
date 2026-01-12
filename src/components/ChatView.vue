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

const getSystemMsgStyle = () => {
  if (isDark.value) {
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: 'rgba(255, 255, 255, 0.5)'
    }
  }
  return {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    color: '#adadad'
  }
}

const getSystemNameColor = computed(() => {
  return isDark.value ? '#7d90a9' : '#576b95'
})

const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const text = e.clipboardData?.getData('text/plain')
  if (text) {
    document.execCommand('insertText', false, text)
  }
}

/**
 * 快捷切换发送人（左右位置）
 */
const toggleSide = (msgId: string) => {
  const msg = chatStore.messages.find(m => m.id === msgId)
  if (msg) {
    msg.isMe = !msg.isMe
    // 如果切到了“我”，强制使用我的头像
    if (msg.isMe) {
      msg.sender = { name: '我', avatar: chatStore.currentUser.avatar }
    } else {
      const randomUser = chatStore.getRandomUser()
      msg.sender = { name: randomUser.name, avatar: randomUser.avatar }
    }
    chatStore.save()
  }
}
</script>

<template>
  <div class="p-4 space-y-4 pb-10 pt-2">
    <div v-for="msg in chatStore.messages" :key="msg.id" class="flex flex-col group/msg relative">
      
      <!-- 快捷操作悬浮按钮 (仅 PC 展示) -->
      <div class="absolute -top-2 right-0 hidden lg:group-hover/msg:flex items-center gap-1 z-20">
        <button @click="toggleSide(msg.id)" class="p-1 bg-white/90 shadow rounded-md text-[10px] text-gray-600 hover:text-blue-500 transition-colors">⇄ 换边</button>
        <button @click="chatStore.removeMessage(msg.id)" class="p-1 bg-white/90 shadow rounded-md text-[10px] text-gray-600 hover:text-red-500 transition-colors">✕ 删除</button>
      </div>

      <!-- 系统消息 -->
      <div v-if="msg.type === 'system'" class="flex justify-center my-1 relative">
        <div 
          class="text-[11px] px-2.5 py-0.5 rounded-[4px] leading-tight max-w-[85%] text-center inline-block cursor-text transition-colors duration-300"
          :style="getSystemMsgStyle()"
          v-html="msg.content"
          contenteditable
          @blur="(e) => chatStore.updateMessage(msg.id, 'content', (e.target as HTMLElement).innerText)"
        ></div>
        <!-- 移动端长按删除提示可以放在这里，目前先通过 PC 悬浮按钮实现 -->
      </div>

      <!-- 普通消息 -->
      <div v-else :class="['flex gap-2.5 items-start', msg.isMe ? 'flex-row-reverse' : 'flex-row']">
        <!-- 头像 -->
        <div 
          class="w-10 h-10 rounded-[4px] overflow-hidden flex-shrink-0 bg-gray-100 shadow-[0_0_1px_rgba(0,0,0,0.1)] active:opacity-70 transition-opacity cursor-pointer"
          @click="toggleSide(msg.id)"
          title="点击切换左右"
        >
          <img v-if="msg.sender?.avatar" :src="msg.sender.avatar" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500 font-bold text-sm">
            {{ msg.sender?.name?.charAt(0) || 'U' }}
          </div>
        </div>

        <!-- 内容容器 -->
        <div class="flex flex-col" :class="msg.isMe ? 'items-end' : 'items-start'">
          <!-- 昵称 -->
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
          
          <!-- 气泡 -->
          <div 
            :class="[
              'relative px-[11px] py-[9px] text-[15px] leading-[22px] rounded-[6px] max-w-[240px] break-words shadow-[0_1px_1px_rgba(0,0,0,0.05)] outline-none cursor-text'
            ]"
            :style="getBubbleStyle(msg.isMe)"
            contenteditable
            @blur="(e) => chatStore.updateMessage(msg.id, 'content', (e.target as HTMLElement).innerText)"
            @paste="handlePaste"
          >
            {{ msg.content }}
            
            <!-- 小尖角图标 -->
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
  color: v-bind('getSystemNameColor');
  font-size: v-bind('chatStore.nicknameSize + "px"');
  font-family: v-bind('chatStore.nicknameFont');
  font-weight: 500;
}

:deep(.system-link) {
  color: #576b95;
  cursor: pointer;
}
</style>