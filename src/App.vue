<script setup lang="ts">
import DeviceFrame from './components/DeviceFrame.vue'
import ChatView from './components/ChatView.vue'
import ConfigPanel from './components/ConfigPanel.vue'
</script>

<template>
  <div class="min-h-screen bg-[#111827] text-white flex flex-col">
    
    <div class="flex-1 flex flex-col md:flex-row w-full h-full">
      <!-- Left: Preview Area (Takes more space now) -->
      <div class="flex-1 flex items-center justify-center p-4 bg-[#0b0f19] relative overflow-hidden">
        <!-- Background decoration -->
        <div class="absolute inset-0 bg-gradient-to-br from-green-900/10 to-blue-900/10 pointer-events-none"></div>
        
        <div class="transform scale-[0.85] md:scale-90 lg:scale-100 transition-transform duration-300 origin-center">
          <DeviceFrame>
            <ChatView />
          </DeviceFrame>
        </div>
      </div>

      <!-- Right: Control Panel (Fixed width) -->
      <div class="w-full md:w-[400px] bg-gray-900 border-l border-gray-800 flex flex-col h-[50vh] md:h-screen overflow-hidden">
        <div class="p-6 border-b border-gray-800">
          <h1 class="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
            WeChat Gen
          </h1>
          <p class="text-gray-500 text-xs mt-1">Chat Simulator & Generator</p>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <ConfigPanel />
          
           <!-- Footer in Panel -->
          <footer class="mt-8 pt-8 border-t border-gray-800 text-center">
            <p class="text-xs text-gray-500 mb-1">如果有问题, 请发</p>
            <a href="mailto:webkubor@163.com" class="text-sm font-medium text-gray-400 hover:text-green-400 transition-colors">webkubor@163.com</a>
            <p class="text-[10px] text-gray-600 mt-2 tracking-widest uppercase">© 2026 WeChat Gen</p>
          </footer>
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
  overflow: hidden; /* Prevent body scroll if we want app-like feel */
}

/* Custom Scrollbar */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 3px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}
</style>