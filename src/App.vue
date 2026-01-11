<script setup lang="ts">
import DeviceFrame from './components/DeviceFrame.vue'
import ChatView from './components/ChatView.vue'
import ConfigPanel from './components/ConfigPanel.vue'
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-4 md:p-8 gap-8 md:gap-16">
    
    <div class="flex flex-col md:flex-row w-full max-w-7xl items-start justify-center gap-12">
      <!-- Left: Preview Area -->
      <div class="flex-1 flex flex-col items-center sticky top-8">
        <div class="mb-6 text-center">
          <h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-2">
            WeChat Gen
          </h1>
          <p class="text-gray-400 text-sm">Real-time Preview</p>
        </div>
        
        <DeviceFrame>
          <ChatView />
        </DeviceFrame>
      </div>

      <!-- Right: Control Panel -->
      <div class="flex-1 w-full max-w-lg">
        <div class="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
          <div class="mb-6 pb-4 border-b border-gray-700">
            <h2 class="text-xl font-bold text-white flex items-center gap-2">
              <span>⚙️</span> 编辑器配置
            </h2>
            <p class="text-gray-400 text-xs mt-1">Custom your chat details</p>
          </div>
          
          <ConfigPanel />

          <!-- Tips Section -->
          <div class="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg text-sm text-blue-300">
            <p class="font-semibold mb-2 flex items-center gap-2">💡 Pro Tips:</p>
            <ul class="list-disc ml-4 space-y-1.5 opacity-80 text-xs">
              <li>推荐上传 <strong>9:19</strong> 比例的图片作为壁纸效果最佳</li>
              <li>使用 "截图工具" 或直接保存网页图片即可导出</li>
              <li>支持批量粘贴姓名，一行一个自动生成入群消息</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: #111827;
}

/* Custom Scrollbar for the whole page if needed, though we hide it in frame */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}
</style>