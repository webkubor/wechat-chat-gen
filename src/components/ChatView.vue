<script setup lang="ts">
import { useChatStore } from '../stores/chat'

const chatStore = useChatStore()

const WECHAT_GREEN = '#95ec69'

const getPastelColor = (name: string = '') => {
  const colors = [
    'bg-red-200 text-red-700',
    'bg-orange-200 text-orange-700',
    'bg-amber-200 text-amber-700',
    'bg-yellow-200 text-yellow-700',
    'bg-lime-200 text-lime-700',
    'bg-green-200 text-green-700',
    'bg-emerald-200 text-emerald-700',
    'bg-teal-200 text-teal-700',
    'bg-cyan-200 text-cyan-700',
    'bg-sky-200 text-sky-700',
    'bg-blue-200 text-blue-700',
    'bg-indigo-200 text-indigo-700',
    'bg-violet-200 text-violet-700',
    'bg-purple-200 text-purple-700',
    'bg-fuchsia-200 text-fuchsia-700',
    'bg-pink-200 text-pink-700',
    'bg-rose-200 text-rose-700'
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
</script>

<template>
  <div class="p-4 space-y-4 pb-4 pt-2">
    <div v-for="msg in chatStore.messages" :key="msg.id" class="flex flex-col">
      <!-- System Message -->
      <div v-if="msg.type === 'system'" class="flex justify-center my-1.5">
        <span class="bg-[#dadada]/80 text-white text-[12px] px-2 py-0.5 rounded-[4px] leading-tight max-w-[80%] text-center shadow-sm backdrop-blur-[1px]">
          {{ msg.content }}
        </span>
      </div>

      <!-- Normal Message -->
      <div v-else :class="['flex gap-2.5 items-start', msg.isMe ? 'flex-row-reverse' : 'flex-row']">
        <!-- Avatar -->
        <div 
          class="w-10 h-10 rounded-[4px] overflow-hidden flex-shrink-0 shadow-sm border border-black/5 flex items-center justify-center font-bold text-sm"
          :class="msg.sender?.avatar ? 'bg-gray-300' : getPastelColor(msg.sender?.name)"
        >
          <img v-if="msg.sender?.avatar" :src="msg.sender.avatar" class="w-full h-full object-cover" />
          <span v-else>
            {{ msg.sender?.name?.charAt(0) || 'U' }}
          </span>
        </div>

        <!-- Content Wrapper -->
        <div class="flex flex-col" :class="msg.isMe ? 'items-end' : 'items-start'">
          <!-- Name for group chat (only others) -->
          <div v-if="!msg.isMe" class="text-[11px] text-[#adadad] mb-0.5 ml-0.5 scale-90 origin-bottom-left">
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
