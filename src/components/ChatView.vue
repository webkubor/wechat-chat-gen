<script setup lang="ts">
import { useChatStore } from '../stores/chat'

const chatStore = useChatStore()

const WECHAT_GREEN = '#95ec69'
</script>

<template>
  <div class="p-4 space-y-4 pb-4 pt-2">
    <div v-for="msg in chatStore.messages" :key="msg.id" class="flex flex-col">
      <!-- System Message -->
      <div v-if="msg.type === 'system'" class="flex justify-center my-1">
        <div 
          class="text-white/90 text-[11px] px-2.5 py-0.5 rounded-[4px] leading-tight max-w-[85%] text-center inline-block"
          :style="{ backgroundColor: chatStore.systemBgColor }"
          v-html="msg.content"
        >
        </div>
      </div>

      <!-- Normal Message -->
      <div v-else :class="['flex gap-2.5 items-start', msg.isMe ? 'flex-row-reverse' : 'flex-row']">
        <!-- Avatar -->
        <div 
          class="w-10 h-10 rounded-[4px] overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200/50"
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
            class="mb-0.5 ml-0.5 scale-90 origin-bottom-left"
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
              'relative px-[11px] py-[9px] text-[15px] leading-[22px] rounded-[6px] max-w-[240px] break-words shadow-[0_1px_1px_rgba(0,0,0,0.05)] text-[#191919]',
              msg.isMe ? `bg-[${WECHAT_GREEN}]` : 'bg-white'
            ]"
            :style="msg.isMe ? `background-color: ${WECHAT_GREEN}` : ''"
          >
            {{ msg.content }}
            
            <!-- CSS Triangle Arrow -->
            <div 
              :class="[
                'absolute top-[13px] w-0 h-0 border-[6px]',
                msg.isMe 
                  ? 'right-[-5px] border-l-[#95ec69] border-t-transparent border-b-transparent border-r-transparent' 
                  : 'left-[-5px] border-r-white border-t-transparent border-b-transparent border-l-transparent'
              ]"
              :style="msg.isMe ? `border-left-color: ${WECHAT_GREEN}` : ''"
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
