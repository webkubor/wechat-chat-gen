<script setup lang="ts">
import { onMounted } from 'vue'
import { useChatListStore } from '../stores/chatList'
import ChatListItem from './ChatListItem.vue'

const chatListStore = useChatListStore()

onMounted(() => {
  chatListStore.init()
})
</script>

<template>
  <div class="flex flex-col h-full bg-[#ededed]">
    <!-- 顶部搜索栏 -->
    <div class="bg-[#f7f7f7] px-3 py-2 border-b border-[#e5e5e5]">
      <div class="flex items-center bg-white rounded-[4px] px-3 py-1.5">
        <svg class="w-4 h-4 text-[#b2b2b2] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <span class="text-[14px] text-[#b2b2b2]">搜索</span>
      </div>
    </div>
    
    <!-- 群聊列表 -->
    <div class="flex-1 overflow-y-auto">
      <div 
        v-for="(item, index) in chatListStore.items" 
        :key="item.id"
      >
        <ChatListItem :item="item" />
        <!-- 分隔线 -->
        <div 
          v-if="index < chatListStore.items.length - 1" 
          class="h-[1px] bg-[#e5e5e5] ml-[66px]"
        ></div>
      </div>
    </div>
  </div>
</template>
