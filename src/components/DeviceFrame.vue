<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useChatStore } from '../stores/chat'

const chatStore = useChatStore()
const scrollContainer = ref<HTMLElement | null>(null)
const isDark = computed(() => chatStore.previewTheme === 'dark')

const backgroundStyle = computed(() => {
  const hasImage = Boolean(chatStore.backgroundImage)
  const imageLayer = hasImage ? `url(${chatStore.backgroundImage})` : 'none'
  const overlay = isDark.value ? 'linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45))' : 'none'
  const backgroundImage = hasImage && isDark.value ? `${overlay}, ${imageLayer}` : imageLayer

  return {
    backgroundImage,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: isDark.value ? '#111111' : '#ededed'
  }
})

watch(() => chatStore.messages.length, () => {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  })
})
</script>

<template>
  <div class="flex flex-col items-center p-4">
    <!-- 手机外壳 (高端金属工艺感) -->
    <div 
      id="wechat-screen"
      :class="[
        'relative transition-all duration-500 bg-[#121212] box-content',
        chatStore.isHighlightingCapture ? 'ring-4 ring-[#7A9D8C] ring-offset-8 animate-pulse' : '',
        chatStore.deviceType === 'ios' 
          ? 'w-[375px] h-[812px] rounded-[55px] shadow-[0_0_0_12px_#222,0_0_0_13px_#333,0_30px_60px_-15px_rgba(0,0,0,0.3)]' 
          : 'w-[360px] h-[780px] rounded-[35px] shadow-[0_0_0_12px_#222,0_0_0_13px_#333,0_30px_60px_-15px_rgba(0,0,0,0.3)]'
      ]"
    >
      <!-- 屏幕内阴影，增加深度感 -->
      <div class="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0_0_2px_rgba(255,255,255,0.1)] z-40"></div>

      <!-- 物理按键 (装饰性) -->
      <div class="absolute -left-[14px] top-32 w-[3px] h-8 bg-[#333] rounded-l-sm border-r border-black/20"></div>
      <div class="absolute -left-[14px] top-48 w-[3px] h-14 bg-[#333] rounded-l-sm border-r border-black/20"></div>
      <div class="absolute -left-[14px] top-64 w-[3px] h-14 bg-[#333] rounded-l-sm border-r border-black/20"></div>
      <div class="absolute -right-[14px] top-44 w-[3px] h-20 bg-[#333] rounded-r-sm border-l border-black/20"></div>

      <!-- 天线位置线 -->
      <div class="absolute top-10 -left-[12px] w-[12px] h-[2px] bg-black/40"></div>
      <div class="absolute bottom-10 -left-[12px] w-[12px] h-[2px] bg-black/40"></div>

      <!-- 屏幕内容容器 -->
      <div 
        class="w-full h-full relative flex flex-col overflow-hidden bg-[#ededed] shadow-[inset_0_0_40px_rgba(0,0,0,0.1)]"
        :class="chatStore.deviceType === 'ios' ? 'rounded-[43px]' : 'rounded-[25px]'"
        :style="backgroundStyle"
      >
        <!-- 1. 顶部导航区 -->
        <div
          class="relative z-30 flex flex-col transition-colors duration-300"
          :class="isDark ? 'bg-[#191919]/95 backdrop-blur-xl border-b border-white/[0.05]' : 'bg-[#ededed]/95 backdrop-blur-xl border-b border-black/[0.05]'"
        >
          <!-- iOS 状态栏 (像素级还原) -->
          <div v-if="chatStore.deviceType === 'ios'" class="w-full h-[44px] relative flex items-center px-8">
            <!-- 灵动岛 -->
            <div class="absolute top-3 left-1/2 -translate-x-1/2 w-[110px] h-[30px] bg-black rounded-[15px] z-50 flex items-center justify-end pr-3">
               <div class="w-2 h-2 rounded-full bg-[#0a0a0a] shadow-[inset_0_0_2px_rgba(255,255,255,0.2)]"></div>
            </div>
            
            <!-- 左侧: 时间 -->
            <div class="flex-1 text-[14px] font-bold tracking-tight" :class="chatStore.statusBarTheme === 'light' ? 'text-white' : 'text-black'">
              {{ chatStore.statusBarTime }}
            </div>
            
            <!-- 右侧: 图标 -->
            <div class="flex items-center gap-1.5 h-[12px]">
              <!-- 信号格 (微信风格) -->
              <svg width="18" height="10" viewBox="0 0 18 10" fill="currentColor" :class="chatStore.statusBarTheme === 'light' ? 'text-white' : 'text-black'">
                <rect x="0" y="7" width="3" height="3" rx="0.5" />
                <rect x="4.5" y="5" width="3" height="5" rx="0.5" />
                <rect x="9" y="2.5" width="3" height="7.5" rx="0.5" />
                <rect x="13.5" y="0" width="3" height="10" rx="0.5" />
              </svg>
              <!-- WiFi -->
              <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" :class="chatStore.statusBarTheme === 'light' ? 'text-white' : 'text-black'">
                <path d="M8 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                <path d="M13.2 6.8a7.4 7.4 0 00-10.4 0 .6.6 0 11-.8-.9 8.6 8.6 0 0112 0 .6.6 0 11-.8.9z" opacity="0.9"/>
                <path d="M15.5 4.3a10.6 10.6 0 00-15 0 .6.6 0 11-.8-.8 11.8 11.8 0 0116.6 0 .6.6 0 11-.8.8z" opacity="0.4"/>
              </svg>
              <!-- 电池 (iOS 标准样式) -->
              <div class="relative w-[22px] h-[10px] rounded-[2.5px] border transition-colors" :class="chatStore.statusBarTheme === 'light' ? 'border-white/40' : 'border-black/30'">
                <div class="absolute inset-[1px] rounded-[1px] bg-current" :style="{ width: '70%' }"></div>
                <div class="absolute -right-[3px] top-[2.5px] w-[1.5px] h-[4px] rounded-r-full bg-current opacity-40"></div>
              </div>
            </div>
          </div>

          <!-- 微信标题栏 (核心还原点) -->
          <div
            id="wechat-titlebar"
            class="flex items-center justify-between h-[48px] px-2"
            :class="isDark ? 'text-[#f5f5f5]' : 'text-[#181818]'"
          >
            <!-- 微信标准返回箭头 -->
            <div class="flex items-center w-12 pl-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 20l-8-8 8-8" />
              </svg>
            </div>
            
            <!-- 居中标题 -->
            <div class="font-bold text-[17px] truncate max-w-[200px] text-center flex-1 tracking-[-0.01em]">
              {{ chatStore.groupTitle }}<span class="ml-0.5 font-normal text-[16px] opacity-60">({{ chatStore.memberCount }})</span>
            </div>
            
            <!-- 微信标准 "..." 更多按钮 -->
            <div class="w-12 flex justify-end pr-3">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                 <circle cx="5" cy="12" r="1.5" />
                 <circle cx="12" cy="12" r="1.5" />
                 <circle cx="19" cy="12" r="1.5" />
               </svg>
            </div>
          </div>
        </div>

        <!-- 2. 聊天内容区域 -->
        <div ref="scrollContainer" class="flex-1 overflow-y-auto scrollbar-hide relative z-0 scroll-smooth">
          <slot></slot>
        </div>

        <!-- 3. 底部输入栏 (高保真模拟) -->
        <div id="wechat-input-bar" class="relative z-20">
          <div
            class="border-t px-3 pt-2 pb-[max(10px,env(safe-area-inset-bottom))] transition-colors duration-300"
            :class="isDark ? 'bg-[#191919] border-white/5' : 'bg-[#f7f7f7] border-black/5'"
          >
            <div class="flex items-center gap-3 h-[36px]">
              <!-- 语音图标 -->
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" :class="isDark ? 'text-white/80' : 'text-[#181818]'">
                <path d="M12 4a3 3 0 00-3 3v6a3 3 0 006 0V7a3 3 0 00-3-3z"/>
                <path d="M19 10v1a7 7 0 01-14 0v-1"/>
                <path d="M12 18v3M8 21h8" stroke-linecap="round"/>
              </svg>
              
              <!-- 输入框占位 -->
              <div
                class="flex-1 h-[36px] rounded-[4px] border transition-all duration-300"
                :class="isDark ? 'bg-[#2c2c2e] border-transparent' : 'bg-white border-black/[0.03]'"
              ></div>
              
              <!-- 表情图标 -->
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" :class="isDark ? 'text-white/80' : 'text-[#181818]'">
                <circle cx="12" cy="12" r="9"/>
                <path d="M8 13.5c1.5 2.5 6.5 2.5 8 0" stroke-linecap="round"/>
                <circle cx="9" cy="10" r="1" fill="currentColor"/>
                <circle cx="15" cy="10" r="1" fill="currentColor"/>
              </svg>
              
              <!-- 加号图标 -->
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" :class="isDark ? 'text-white/80' : 'text-[#181818]'">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 8v8M8 12h8" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- iOS Home Indicator -->
        <div
          v-if="chatStore.deviceType === 'ios'"
          class="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-current rounded-full z-30 opacity-20"
          :class="isDark ? 'text-white' : 'text-black'"
        ></div>

        <!-- Android 导航栏 (极简风格) -->
        <div v-if="chatStore.deviceType === 'android'" class="h-12 flex items-center justify-around z-30 opacity-40" :class="isDark ? 'text-white' : 'text-black'">
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M17.5 18.5l-6-6 6-6"/></svg>
          <svg width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/></svg>
          <svg width="16" height="16" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/></svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 模拟 iPhone 屏幕的圆角裁切效果，避免无 paint() 支持时整块不可见 */
#wechat-screen {
  overflow: hidden;
}

</style>
