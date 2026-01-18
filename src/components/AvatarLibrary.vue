<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUpload } from '../composables/useUpload'
import { useAvatarStore, AVATAR_MESSAGES, MAX_AVATAR_SIZE_MB, MAX_CUSTOM_AVATARS } from '../stores/avatar'

interface Props {
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { isUploading, processFile } = useUpload()
const avatarStore = useAvatarStore()
const uploadHint = '上传中，请勿离开页面'

const searchQuery = ref('')
const customFileInput = ref<HTMLInputElement | null>(null)

onMounted(() => {
  avatarStore.init()
})

const filteredCustomAvatars = computed(() => {
  if (!searchQuery.value) return avatarStore.customAvatars
  const query = searchQuery.value.toLowerCase()
  return avatarStore.customAvatars.filter(item => item.url.toLowerCase().includes(query))
})

const canDeleteAvatar = computed(() => avatarStore.canDeleteAvatar)

const canUploadMore = computed(() => avatarStore.canAddMore)
const customCountLabel = computed(() => `${avatarStore.totalCustomCount}/${MAX_CUSTOM_AVATARS}`)
const isUploadDisabled = computed(() => isUploading.value || !canUploadMore.value)

const handleSelectAvatar = (url: string) => {
  emit('update:modelValue', url)
  emit('close')
}

const handleDeleteAvatar = async (id: string) => {
  if (!canDeleteAvatar.value) {
    window.$message?.info(AVATAR_MESSAGES.DELETE_LIMIT)
    return
  }
  const confirmed = window.$confirm
    ? await window.$confirm({
        title: '确认删除？',
        message: '删除后将无法恢复。',
        confirmText: '删除',
        cancelText: '取消',
        confirmType: 'danger'
      })
    : false

  if (!confirmed) return

  const removed = await avatarStore.removeCustomAvatar(id)
  if (!removed) {
    window.$message?.info(AVATAR_MESSAGES.DELETE_LIMIT)
  }
}

const handleCustomUpload = async (e: Event) => {
  if (!avatarStore.canAddMore) {
    window.$message?.error(AVATAR_MESSAGES.UPLOAD_LIMIT)
    return
  }

  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const url = await processFile(file, MAX_AVATAR_SIZE_MB)
  if (url) {
    const added = await avatarStore.addCustomAvatar(url)
    if (!added) {
      window.$message?.error(AVATAR_MESSAGES.UPLOAD_LIMIT)
      return
    }
    emit('update:modelValue', url)
    emit('close')
  }
  input.value = ''
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  if (!avatarStore.canAddMore) {
    window.$message?.error(AVATAR_MESSAGES.UPLOAD_LIMIT)
    return
  }

  const file = e.dataTransfer?.files[0]
  if (!file) return

  const url = await processFile(file, MAX_AVATAR_SIZE_MB)
  if (url) {
    const added = await avatarStore.addCustomAvatar(url)
    if (!added) {
      window.$message?.error(AVATAR_MESSAGES.UPLOAD_LIMIT)
      return
    }
    emit('update:modelValue', url)
    emit('close')
  }
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const triggerFileInput = () => {
  customFileInput.value?.click()
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="emit('close')">
    <div class="w-full max-w-md bg-[#1a1a2e] rounded-2xl shadow-2xl overflow-hidden border border-white/10">
      <div class="flex items-center justify-between p-4 border-b border-white/10">
        <h3 class="text-lg font-medium text-white">头像库</h3>
        <button @click="emit('close')" class="p-2 text-white/40 hover:text-white transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-4 border-b border-white/10">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索头像..."
          class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#7A9D8C]/50 transition-all"
        />
      </div>

      <div
        class="p-4 max-h-[420px] overflow-y-auto"
        @drop="handleDrop"
        @dragover="handleDragOver"
      >
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] text-white/30">{{ customCountLabel }}</span>
          </div>
          <div v-if="filteredCustomAvatars.length" class="grid grid-cols-4 gap-3">
            <div
              v-for="avatar in filteredCustomAvatars"
              :key="avatar.id"
              class="relative aspect-square rounded-xl overflow-hidden ring-2 ring-transparent hover:ring-[#7A9D8C] transition-all hover:scale-105 group"
              :class="{ 'ring-[#7A9D8C]': modelValue === avatar.url }"
            >
              <button
                type="button"
                @click="handleSelectAvatar(avatar.url)"
                class="absolute inset-0"
              >
                <img :src="avatar.url" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
              </button>
              <button
                type="button"
                @click="handleDeleteAvatar(avatar.id)"
                :disabled="!canDeleteAvatar"
                class="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white/80 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                title="删除"
              >
                ×
              </button>
            </div>
          </div>
          <div v-else class="text-xs text-white/20 text-center py-8">暂无头像，请上传</div>
        </div>
      </div>

      <div class="p-4 border-t border-white/10">
        <button
          @click="triggerFileInput"
          :disabled="isUploadDisabled"
          class="w-full py-3 bg-[#7A9D8C]/60 hover:bg-[#7A9D8C]/80 disabled:opacity-50 text-white rounded-xl font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <svg v-if="isUploading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isUploading ? uploadHint : '上传自定义头像' }}</span>
        </button>
        <input
          ref="customFileInput"
          type="file"
          accept="image/*"
          @change="handleCustomUpload"
          class="hidden"
        />
        <p class="mt-2 text-xs text-white/30 text-center">{{ AVATAR_MESSAGES.RULES }}</p>
      </div>
    </div>
  </div>
</template>
