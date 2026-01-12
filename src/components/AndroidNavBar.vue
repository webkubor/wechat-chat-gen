<script setup lang="ts">
import { useChatStore } from '../stores/chat'

const chatStore = useChatStore()
</script>

<template>
  <div class="h-12 flex items-center justify-around z-30 opacity-40" :class="chatStore.previewTheme === 'dark' ? 'text-white' : 'text-black'">
    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M17.5 18.5l-6-6 6-6"/></svg>
    <svg width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/></svg>
    <svg width="16" height="16" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/></svg>
  </div>
</template>
