<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useCorpusStore } from '../stores/corpus'

const corpusStore = useCorpusStore()
const activeTab = ref<'dialogue' | 'system'>('dialogue')
const newContent = ref('')
const isBusy = ref(false)
const importInput = ref<HTMLInputElement | null>(null)

const items = computed(() => {
  return activeTab.value === 'dialogue' ? corpusStore.dialogues : corpusStore.systems
})

onMounted(() => {
  corpusStore.initDB()
})

const handleAdd = async () => {
  if (!newContent.value) return
  await corpusStore.addEntry(activeTab.value, newContent.value)
  newContent.value = ''
}

const handleDelete = async (id: number) => {
  if (confirm('确定要删除这条语料吗？')) {
    await corpusStore.deleteEntry(id)
  }
}

const handleClearAll = async () => {
  if (!confirm('确定要清空本地语料库吗？此操作不可恢复。')) return
  isBusy.value = true
  try {
    await corpusStore.clearAll()
  } finally {
    isBusy.value = false
  }
}

const handleExport = async () => {
  isBusy.value = true
  try {
    const data = await corpusStore.exportAll()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = `wechat-corpus-${Date.now()}.json`
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
    const parsed = JSON.parse(text) as {
      dialogues?: string[]
      systems?: string[]
      items?: { type: 'dialogue' | 'system'; content: string }[]
    }
    const dialogues = Array.isArray(parsed.dialogues) ? parsed.dialogues : []
    const systems = Array.isArray(parsed.systems) ? parsed.systems : []
    const items = Array.isArray(parsed.items) ? parsed.items : []
    const mergedDialogues = dialogues.concat(items.filter(i => i.type === 'dialogue').map(i => i.content))
    const mergedSystems = systems.concat(items.filter(i => i.type === 'system').map(i => i.content))

    await corpusStore.replaceAll(mergedDialogues, mergedSystems)
  } catch (err) {
    alert('导入失败：请确认文件格式为 JSON')
  } finally {
    isBusy.value = false
    if (importInput.value) importInput.value.value = ''
  }
}
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden p-6 lg:p-10 max-w-5xl mx-auto w-full">
    
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-light text-[#E8F1F2] tracking-wide">
          Corpus<span class="font-bold text-[#7A9D8C]">Manager</span>
        </h1>
        <p class="text-white/40 text-sm tracking-widest mt-1">语料库管理</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="handleClearAll"
          :disabled="isBusy"
          class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs text-white transition-all disabled:opacity-50"
        >
          清空本地
        </button>
        <button
          @click="handleExport"
          :disabled="isBusy"
          class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs text-white transition-all disabled:opacity-50"
        >
          导出
        </button>
        <button
          @click="handleImportClick"
          :disabled="isBusy"
          class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs text-white transition-all disabled:opacity-50"
        >
          导入
        </button>
        <input ref="importInput" type="file" accept="application/json" class="hidden" @change="handleImport" />
        <router-link to="/" class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm text-white transition-all flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>
          返回生成器
        </router-link>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden flex flex-col shadow-2xl">
      
      <!-- Tabs -->
      <div class="flex border-b border-white/10">
        <button 
          v-for="tab in ['dialogue', 'system']" 
          :key="tab"
          @click="activeTab = tab as any"
          class="flex-1 py-4 text-sm font-medium tracking-wide transition-colors relative"
          :class="activeTab === tab ? 'text-[#7A9D8C]' : 'text-white/40 hover:text-white/60'"
        >
          {{ tab === 'dialogue' ? '对话语料 (Chat Hype)' : '入群文案 (Join Templates)' }}
          <div v-if="activeTab === tab" class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7A9D8C]"></div>
        </button>
      </div>

      <!-- Add Input -->
      <div class="p-6 border-b border-white/10 bg-black/10">
        <div class="flex gap-4">
          <input 
            v-model="newContent"
            @keyup.enter="handleAdd"
            type="text" 
            :placeholder="activeTab === 'dialogue' ? '输入新的对话内容...' : '输入入群模板 (支持 {name}, {invited})...'"
            class="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#7A9D8C]/50 transition-all"
          />
          <button 
            @click="handleAdd"
            class="px-6 py-2 bg-[#7A9D8C] hover:bg-[#6B8E78] text-white rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95"
          >
            添加
          </button>
        </div>
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-hide">
        <div 
          v-for="item in items" 
          :key="item.id"
          class="group flex items-center justify-between p-4 bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-all"
        >
          <p class="text-sm text-white/80 font-light tracking-wide select-all">{{ item.content }}</p>
          <button 
            @click="handleDelete(item.id)"
            class="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
        
        <div v-if="items.length === 0" class="text-center py-20 text-white/20 text-sm">
          暂无数据，请添加
        </div>
      </div>
    </div>
  </div>
</template>
