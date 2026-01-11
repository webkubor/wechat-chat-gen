<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '../stores/chat'

const chatStore = useChatStore()
const batchNames = ref('')
const batchDialogContent = ref('')
const singleMsgContent = ref('')

const handleBgUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      chatStore.setBg(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }
}

const batchJoin = () => {
  const names = batchNames.value ? batchNames.value.split('\n').filter(n => n.trim()) : []
  names.forEach(name => {
    chatStore.addMessage({
      id: Math.random().toString(36).substr(2, 9),
      type: 'system',
      content: (chatStore.systemTemplates[0] || '').replace('{name}', '管理员').replace('{invited}', name.trim())
    })
  })
  batchNames.value = ''
}

const handleBatchDialog = () => {
  if (!batchDialogContent.value) return
  chatStore.batchAddMessages(batchDialogContent.value.split('\n'))
  batchDialogContent.value = ''
}

const generateHype = () => {
  const hypes = [
    '终于等到这一天了！',
    '有人出杭州站的票吗？求两张！',
    '我在黄龙体育中心门口了，人超多！',
    '前排兜售瓜子饮料矿泉水~',
    '谁有歌单啊？求分享',
    '激动得睡不着觉',
    'Me: 我也到了！',
    'Me: 待会面基啊兄弟们',
    '今晚会有《稻香》吗？',
    '必须有啊！全场大合唱预定',
    '为了看杰伦特意请了假',
    '听说今晚有神秘嘉宾？',
    '真的假的？是谁啊？',
    '不管是通过什么渠道买的票，大家都要注意防诈骗哦',
    '管理员：请大家文明交流，不要刷屏'
  ]
  // Shuffle and pick 5-8 random messages
  const shuffled = hypes.sort(() => 0.5 - Math.random())
  const selected = shuffled.slice(0, Math.floor(Math.random() * 4) + 5)
  chatStore.batchAddMessages(selected)
}

const addTextMsg = (isMe = false) => {
  if (!singleMsgContent.value) return
  chatStore.addMessage({
    id: Math.random().toString(36).substr(2, 9),
    type: 'text',
    content: singleMsgContent.value,
    isMe,
    sender: isMe ? { name: '我', avatar: '' } : { name: '好友', avatar: '' }
  })
  singleMsgContent.value = ''
}
</script>

<template>
  <div class="space-y-6">
    
    <!-- Basic Config -->
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">明星姓名</label>
          <input 
            v-model="chatStore.starName" 
            @input="chatStore.updateGroupTitle"
            type="text" 
            placeholder="如：周杰伦"
            class="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">地方站</label>
          <input 
            v-model="chatStore.location" 
            @input="chatStore.updateGroupTitle"
            type="text" 
            placeholder="如：杭州"
            class="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">最终预览群名</label>
        <div class="flex gap-2">
          <input 
            v-model="chatStore.groupTitle" 
            type="text" 
            class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-green-400 font-medium focus:outline-none"
            readonly
          />
          <div class="w-24">
            <input 
              v-model.number="chatStore.memberCount" 
              type="number" 
              class="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="人数"
            />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">系统样式</label>
          <div class="relative">
            <select v-model="chatStore.deviceType" class="w-full appearance-none bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="ios">🍎 iOS</option>
              <option value="android">🤖 Android</option>
            </select>
            <div class="absolute right-3 top-2.5 pointer-events-none text-gray-400 text-xs">▼</div>
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">更换壁纸</label>
          <label class="flex items-center justify-center w-full h-[38px] bg-gray-900/50 border border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors">
            <span class="text-xs text-gray-400">点击上传图片</span>
            <input type="file" @change="handleBgUpload" accept="image/*" class="hidden" />
          </label>
        </div>
      </div>
    </div>

    <!-- Batch Join -->
    <div class="pt-4 border-t border-gray-700">
      <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">批量拉人 (一行一个名字)</label>
      <div class="relative group">
        <textarea 
          v-model="batchNames" 
          rows="2" 
          class="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          placeholder="张三&#10;李四"
        ></textarea>
        <button 
          @click="batchJoin" 
          class="absolute bottom-2 right-2 bg-gray-700 text-white text-xs px-3 py-1.5 rounded-md hover:bg-gray-600 shadow-lg transition-all"
        >
          入群
        </button>
      </div>
    </div>

    <!-- Batch Dialogue -->
    <div class="pt-4 border-t border-gray-700">
      <div class="flex justify-between items-center mb-2">
        <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider">批量对话</label>
        <button 
          @click="generateHype" 
          class="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded transition-colors flex items-center gap-1"
        >
          ✨ 一键生成氛围组
        </button>
      </div>
      <div class="relative group">
        <textarea 
          v-model="batchDialogContent" 
          rows="5" 
          class="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none font-mono"
          placeholder="UserA: 大家好&#10;UserB: 来了来了&#10;Me: 我到了&#10;直接输入内容则随机分配角色"
        ></textarea>
        <button 
          @click="handleBatchDialog" 
          class="absolute bottom-2 right-2 bg-green-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-green-500 shadow-lg transition-all transform active:scale-95"
        >
          🚀 生成对话
        </button>
      </div>
    </div>

    <!-- Single Message -->
    <div class="pt-4 border-t border-gray-700">
      <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">模拟对话</label>
      <input 
        v-model="singleMsgContent" 
        type="text" 
        class="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 mb-3" 
        placeholder="输入消息内容..." 
        @keyup.enter="addTextMsg(true)"
      />
      <div class="flex gap-3">
        <button 
          @click="addTextMsg(false)" 
          class="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-medium transition-colors border border-gray-600"
        >
          ⬅️ 对方发送
        </button>
        <button 
          @click="addTextMsg(true)" 
          class="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-green-900/20"
        >
          我发送 ➡️
        </button>
      </div>
    </div>

    <!-- Actions -->
    <div class="pt-4 mt-2">
      <button 
        @click="chatStore.clearMessages()" 
        class="w-full border border-red-500/50 text-red-400 hover:bg-red-500/10 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        🗑️ 清空所有记录
      </button>
    </div>
  </div>
</template>

