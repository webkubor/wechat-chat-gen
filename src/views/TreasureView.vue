<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useCorpusStore, type CorpusItem, type NicknameItem } from '../stores/corpus'
import { isCloudEnabled } from '../utils/cloudbase'
import NicknameGrid from '../components/ui/NicknameGrid.vue'
import { useSound } from '../composables/useSound'

type TabType = 'dialogues' | 'nicknames'

const corpusStore = useCorpusStore()
const { playSuccess, playClick, playWater } = useSound()
const newContent = ref('')
const isBusy = ref(false)
const importInput = ref<HTMLInputElement | null>(null)
const currentTab = ref<TabType>('dialogues')

const dialogueItems = computed(() => corpusStore.dialogues)
const nicknameItems = computed(() => corpusStore.nicknames)
const currentModeLabel = computed(() => corpusStore.mode === 'local' ? '本地私享' : '云端同步')
const cloudEnabled = isCloudEnabled()

onMounted(() => {
  corpusStore.init()
})

const handleModeSwitch = (mode: 'local' | 'cloud') => {
  if (mode === 'cloud' && !cloudEnabled) {
    window.$message.info('云端同步暂时关闭，当前为本地私享模式')
    return
  }
  corpusStore.switchMode(mode)
}

const handleAdd = async () => {
  if (!newContent.value) return
  if (currentTab.value === 'dialogues') {
    await corpusStore.addDialogue(newContent.value)
  } else {
    await corpusStore.addNickname(newContent.value)
  }
  newContent.value = ''
}

const handleDelete = async (item: CorpusItem | NicknameItem) => {
  if (item.preset) return
  const typeLabel = currentTab.value === 'dialogues' ? '语料' : '昵称'
  const confirmed = window.$confirm
    ? await window.$confirm({
        title: '确认删除？',
        message: `确定要从【${currentModeLabel.value}】删除这条${typeLabel}吗？`,
        confirmText: '删除',
        cancelText: '取消',
        confirmType: 'danger'
      })
    : false

  if (!confirmed) return
  
  if (currentTab.value === 'dialogues') {
    await corpusStore.deleteDialogue(item as CorpusItem)
  } else {
    await corpusStore.deleteNickname(item as NicknameItem)
  }
}

const handleClearAll = async () => {
  const typeLabel = currentTab.value === 'dialogues' ? '语料' : '昵称'
  const msg = corpusStore.mode === 'local' 
    ? `确定要清空【本地】所有自定义${typeLabel}吗？` 
    : `确定要清空【云端】所有${typeLabel}吗？这会影响所有用户！`
  
  const confirmed = window.$confirm
    ? await window.$confirm({
        title: '确认清空？',
        message: msg,
        confirmText: '清空',
        cancelText: '取消',
        confirmType: 'danger'
      })
    : false

  if (!confirmed) return
  
  isBusy.value = true
  try {
    if (currentTab.value === 'dialogues') {
      await corpusStore.clearDialogues()
    } else {
      await corpusStore.clearNicknames()
    }
  } finally {
    isBusy.value = false
  }
}

const handleExport = async () => {
  isBusy.value = true
  try {
    const data = await corpusStore.exportAll()
    const exportData = currentTab.value === 'dialogues' 
      ? { dialogues: data.dialogues }
      : { nicknames: data.nicknames }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = `wechat-${currentTab.value}-${corpusStore.mode}-${Date.now()}.json`
    link.href = URL.createObjectURL(blob)
    link.click()
    URL.revokeObjectURL(link.href)
  } finally {
    isBusy.value = false
  }
}

const handleImportClick = () => {
  importInput.value?.click()
}

const handleImport = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  isBusy.value = true
  try {
    const text = await file.text()
    const parsed = JSON.parse(text)
    const list = Array.isArray(parsed) ? parsed : (parsed.dialogues || parsed.nicknames || [])
    
    if (currentTab.value === 'dialogues') {
      await corpusStore.replaceAllDialogues(list)
    } else {
      await corpusStore.replaceAllNicknames(list)
    }
    window.$message.success(`成功导入到【${currentModeLabel.value}】`)
  } catch (err) {
    window.$message.error('导入失败：请确认文件格式为 JSON 数组')
  } finally {
    isBusy.value = false
    if (importInput.value) importInput.value.value = ''
  }
}

const placeholderText = computed(() => currentTab.value === 'dialogues' ? '输入新的对话语料...' : '输入新的昵称...')

const onClearAllClick = async () => {
  await handleClearAll()
  playWater()
}

const onExportClick = async () => {
  await handleExport()
  playSuccess()
}

const onImportClick = () => {
  handleImportClick()
  playClick()
}

const onAddClick = async () => {
  await handleAdd()
  playSuccess()
}
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden p-6 lg:p-10 max-w-5xl mx-auto w-full">
    
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <div class="flex items-center gap-4 mb-1">
          <h1 class="text-3xl font-light text-[#E8F1F2] tracking-wide">
            藏宝<span class="font-bold text-[#7A9D8C]">库</span>
          </h1>
          <div class="bg-black/20 p-1 rounded-lg flex text-[10px] font-medium backdrop-blur-sm border border-white/5">
            <button @click="handleModeSwitch('local')" class="px-3 py-1 rounded-md transition-all duration-300" :class="corpusStore.mode === 'local' ? 'bg-[#7A9D8C] text-white shadow-lg' : 'text-white/40 hover:text-white/60'">本地私享</button>
            <button
              @click="handleModeSwitch('cloud')"
              :disabled="!cloudEnabled"
              class="px-3 py-1 rounded-md transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
              :class="corpusStore.mode === 'cloud' ? 'bg-[#A27B5C] text-white shadow-lg' : 'text-white/40 hover:text-white/60'"
            >
              云端同步
            </button>
          </div>
          <span v-if="!cloudEnabled" class="text-[10px] text-white/30 tracking-widest">云端同步暂时关闭</span>
        </div>
        <p class="text-white/40 text-sm tracking-widest flex items-center gap-2">
          <span class="w-2 h-2 rounded-full" :class="corpusStore.mode === 'local' ? 'bg-[#7A9D8C]' : 'bg-[#A27B5C]'"></span>
          {{ currentModeLabel }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="onClearAllClick" :disabled="isBusy" class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs text-white transition-all disabled:opacity-50">清空</button>
        <button @click="onExportClick" :disabled="isBusy" class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs text-white transition-all disabled:opacity-50">导出</button>
        <button @click="onImportClick" :disabled="isBusy" class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs text-white transition-all disabled:opacity-50">导入</button>
        <input ref="importInput" type="file" accept="application/json" class="hidden" @change="handleImport" />
        <router-link to="/" class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm text-white transition-all flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>
          返回
        </router-link>
      </div>
    </div>

    <!-- Tab Switcher -->
    <div class="flex gap-2 mb-4">
      <button
        @click="currentTab = 'dialogues'"
        class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
        :class="currentTab === 'dialogues' ? 'bg-[#7A9D8C] text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'"
      >
        语料库
      </button>
      <button
        @click="currentTab = 'nicknames'"
        class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
        :class="currentTab === 'nicknames' ? 'bg-[#7A9D8C] text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'"
      >
        昵称库
      </button>
    </div>

    <!-- Main Content -->
    <div class="flex-1 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden flex flex-col shadow-2xl relative transition-colors duration-500">
      
      <!-- Add Input -->
      <div class="p-6 border-b border-white/10 bg-black/10 relative z-10">
        <div class="flex gap-4">
          <input 
            v-model="newContent"
            @keyup.enter="onAddClick"
            type="text" 
            :placeholder="placeholderText"
            class="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all"
            :class="corpusStore.mode === 'local' ? 'focus:border-[#7A9D8C]/50' : 'focus:border-[#A27B5C]/50'"
          />
          <button 
            @click="onAddClick"
            class="px-6 py-2 text-white rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95"
            :class="corpusStore.mode === 'local' ? 'bg-[#7A9D8C] hover:bg-[#6B8E78]' : 'bg-[#A27B5C] hover:bg-[#8B6B4C]'"
          >
            添加
          </button>
        </div>
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto p-6 scrollbar-hide relative z-10">
        <!-- 语料库：列表形式 -->
        <div v-if="currentTab === 'dialogues'" class="space-y-3">
          <div 
            v-for="item in dialogueItems" 
            :key="item._id || item.id"
            class="group flex items-center justify-between p-4 bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-all"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span 
                class="px-2 py-0.5 text-[10px] rounded-full border uppercase tracking-widest"
                :class="item.preset ? 'border-white/20 text-white/40' : (corpusStore.mode === 'local' ? 'border-[#7A9D8C]/50 text-[#7A9D8C]' : 'border-[#A27B5C]/50 text-[#A27B5C]')"
              >
                {{ item.preset ? '系统' : '用户' }}
              </span>
              <p class="text-sm text-white/80 font-light tracking-wide select-all truncate">{{ item.content }}</p>
            </div>
            <button 
              v-if="!item.preset"
              @click="handleDelete(item)"
              class="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
          
          <div v-if="dialogueItems.length === 0" class="text-center py-20 text-white/20 text-sm">
            暂无语料，请添加
          </div>
        </div>

        <!-- 昵称库：标签形式 -->
        <div v-else class="pb-4">
          <NicknameGrid 
            :items="nicknameItems" 
            :mode="corpusStore.mode"
            @delete="handleDelete"
          />
          <div v-if="nicknameItems.length === 0" class="text-center py-20 text-white/20 text-sm">
            暂无昵称，请添加
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
