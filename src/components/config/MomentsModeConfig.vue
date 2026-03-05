<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useMomentsStore } from '../../stores/moments'
import { useSound } from '../../composables/useSound'
import AvatarLibrary from '../AvatarLibrary.vue'

const momentsStore = useMomentsStore()
const { playSuccess, playWater } = useSound()

const MIN_POST_COUNT = 1
const MAX_POST_COUNT = 12

const ownerName = ref(momentsStore.config.ownerName)
const postCount = ref(momentsStore.config.postCount)
const showAvatarLibrary = ref(false)

const topicsText = computed({
  get: () => momentsStore.config.topics.join('、'),
  set: (value: string) => {
    const topics = value.split(/[、,，\s]+/).filter(Boolean)
    if (topics.length > 0) {
      momentsStore.setConfig({ topics }, true)
    }
  }
})

const locationsText = computed({
  get: () => momentsStore.config.locations.join('、'),
  set: (value: string) => {
    const locations = value.split(/[、,，\s]+/).filter(Boolean)
    if (locations.length > 0) {
      momentsStore.setConfig({ locations }, true)
    }
  }
})

onMounted(async () => {
  await momentsStore.init()
  ownerName.value = momentsStore.config.ownerName
  postCount.value = momentsStore.config.postCount
})

watch(ownerName, (value) => {
  const nextName = value.trim() || '抢票情报站'
  momentsStore.updateOwnerName(nextName)
})

watch(postCount, (value) => {
  if (!Number.isFinite(value)) {
    postCount.value = MIN_POST_COUNT
    return
  }

  const normalized = Math.min(MAX_POST_COUNT, Math.max(MIN_POST_COUNT, Math.round(value)))
  if (normalized !== value) {
    postCount.value = normalized
  }
  momentsStore.setConfig({ postCount: normalized }, true)
})

const handleGenerate = () => {
  momentsStore.refreshPosts()
  playSuccess()
}

const handleClear = () => {
  momentsStore.clearPosts()
  playWater()
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center gap-2 mb-2">
      <div class="w-1 h-4 bg-[#7d8fc2] rounded-full"></div>
      <h3 class="text-sm font-medium text-white/80 tracking-wide">朋友圈设置</h3>
    </div>

    <div class="group">
      <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">发布人昵称</label>
      <input
        v-model="ownerName"
        type="text"
        placeholder="例如：上海场抢票情报站"
        class="w-full bg-white/5 hover:bg-white/10 border border-transparent focus:border-[#7d8fc2]/50 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-4 focus:ring-[#7d8fc2]/10 transition-all"
      />
    </div>

    <div>
      <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">发布人头像</label>
      <div class="flex items-center gap-3">
        <button
          @click="showAvatarLibrary = true"
          class="relative w-[46px] h-[46px] bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-xl cursor-pointer transition-all group hover:border-[#7d8fc2]/50 overflow-hidden"
        >
          <span v-if="!momentsStore.config.ownerAvatar" class="text-xs text-white/40 group-hover:text-[#7d8fc2] transition-colors">选择</span>
          <div v-else class="w-full h-full rounded-[10px] overflow-hidden">
            <img :src="momentsStore.config.ownerAvatar" class="w-full h-full object-cover object-center" />
          </div>
        </button>
        <button
          @click="showAvatarLibrary = true"
          class="text-xs text-white/40 hover:text-[#7d8fc2] transition-colors"
        >
          从头像库选择
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-2 items-end">
      <div>
        <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">动态条数</label>
        <input
          v-model.number="postCount"
          type="number"
          :min="MIN_POST_COUNT"
          :max="MAX_POST_COUNT"
          class="w-full bg-white/5 hover:bg-white/10 border border-transparent focus:border-[#7d8fc2]/50 rounded-xl px-4 py-3 text-sm text-white text-center focus:outline-none focus:ring-4 focus:ring-[#7d8fc2]/10 transition-all"
        />
      </div>
      <button
        @click="handleGenerate"
        class="h-[46px] bg-[#7d8fc2]/60 hover:bg-[#7d8fc2]/80 text-white rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
      >
        重新生成
      </button>
    </div>

    <div class="group">
      <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">话题词（、或空格分隔）</label>
      <textarea
        v-model="topicsText"
        rows="2"
        placeholder="开票倒计时、抢票攻略、场次官宣"
        class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#7d8fc2]/50 transition-colors resize-none"
      ></textarea>
    </div>

    <div class="group">
      <label class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">地点词（、或空格分隔）</label>
      <textarea
        v-model="locationsText"
        rows="2"
        placeholder="上海站、杭州站、深圳站"
        class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#7d8fc2]/50 transition-colors resize-none"
      ></textarea>
    </div>

    <button
      @click="handleClear"
      class="w-full py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-200 rounded-xl font-medium text-sm border border-red-400/20 transition-all active:scale-[0.98]"
    >
      清空朋友圈
    </button>

    <AvatarLibrary
      v-if="showAvatarLibrary"
      :model-value="momentsStore.config.ownerAvatar"
      @update:modelValue="momentsStore.updateOwnerAvatar"
      @close="showAvatarLibrary = false"
    />
  </div>
</template>
