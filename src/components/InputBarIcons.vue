<script setup lang="ts">
import { computed } from 'vue'
import { useChatStore } from '../stores/chat'

type IconType = 'voice' | 'emoji' | 'plus'

const props = defineProps<{
  type: IconType
}>()

const chatStore = useChatStore()
const iconClass = computed(() => (chatStore.previewTheme === 'dark' ? 'text-white/80' : 'text-[#181818]'))
</script>

<template>
  <svg v-if="props.type === 'voice'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" :class="iconClass" aria-hidden="true">
    <path d="M12 4a3 3 0 00-3 3v6a3 3 0 006 0V7a3 3 0 00-3-3z"/>
    <path d="M19 10v1a7 7 0 01-14 0v-1"/>
    <path d="M12 18v3M8 21h8" stroke-linecap="round"/>
  </svg>

  <svg v-else-if="props.type === 'emoji'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" :class="iconClass" aria-hidden="true">
    <circle cx="12" cy="12" r="9"/>
    <path d="M8 13.5c1.5 2.5 6.5 2.5 8 0" stroke-linecap="round"/>
    <circle cx="9" cy="10" r="1" fill="currentColor"/>
    <circle cx="15" cy="10" r="1" fill="currentColor"/>
  </svg>

  <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" :class="iconClass" aria-hidden="true">
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 8v8M8 12h8" stroke-linecap="round"/>
  </svg>
</template>
