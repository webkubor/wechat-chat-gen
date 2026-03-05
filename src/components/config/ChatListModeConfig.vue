<script setup lang="ts">
import { computed } from 'vue'
import { useChatListStore } from '../../stores/chatList'

const chatListStore = useChatListStore()

const citiesText = computed({
  get: () => chatListStore.config.cities.join('、'),
  set: (val: string) => {
    const cities = val.split(/[、,，\s]+/).filter(Boolean)
    chatListStore.setConfig({ cities })
  }
})

const datesText = computed({
  get: () => chatListStore.config.dates.join('、'),
  set: (val: string) => {
    const dates = val.split(/[、,，\s]+/).filter(Boolean)
    chatListStore.setConfig({ dates })
  }
})

const itemCount = computed({
  get: () => chatListStore.config.itemCount,
  set: (val: number) => {
    chatListStore.setConfig({ itemCount: Math.max(1, Math.min(20, val)) })
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- 歌手名 -->
    <div class="space-y-2">
      <label class="block text-[11px] font-medium text-white/40 uppercase tracking-wider">
        歌手名
      </label>
      <input
        v-model="chatListStore.config.singerName"
        @blur="chatListStore.generateItems()"
        type="text"
        placeholder="例如：薛之谦"
        class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#7A9D8C]/50 transition-colors"
      />
    </div>

    <!-- 演唱会名 -->
    <div class="space-y-2">
      <label class="block text-[11px] font-medium text-white/40 uppercase tracking-wider">
        演唱会名
      </label>
      <input
        v-model="chatListStore.config.concertName"
        @blur="chatListStore.generateItems()"
        type="text"
        placeholder="例如：万兽之王"
        class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#7A9D8C]/50 transition-colors"
      />
    </div>

    <!-- 城市列表 -->
    <div class="space-y-2">
      <label class="block text-[11px] font-medium text-white/40 uppercase tracking-wider">
        城市列表（用、或空格分隔）
      </label>
      <textarea
        v-model="citiesText"
        rows="2"
        placeholder="北京、上海、广州、深圳"
        class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#7A9D8C]/50 transition-colors resize-none"
      ></textarea>
    </div>

    <!-- 日期列表 -->
    <div class="space-y-2">
      <label class="block text-[11px] font-medium text-white/40 uppercase tracking-wider">
        日期列表（用、或空格分隔）
      </label>
      <textarea
        v-model="datesText"
        rows="2"
        placeholder="7.10、8.15、6.30"
        class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#7A9D8C]/50 transition-colors resize-none"
      ></textarea>
    </div>

    <!-- 列表数量 -->
    <div class="space-y-2">
      <label class="block text-[11px] font-medium text-white/40 uppercase tracking-wider">
        生成数量（1-20）
      </label>
      <input
        v-model.number="itemCount"
        type="number"
        min="1"
        max="20"
        class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#7A9D8C]/50 transition-colors"
      />
    </div>

    <!-- 刷新按钮 -->
    <button
      @click="chatListStore.refreshItems()"
      class="w-full py-2.5 bg-[#7A9D8C]/20 hover:bg-[#7A9D8C]/30 border border-[#7A9D8C]/30 rounded-lg text-[#7A9D8C] text-sm font-medium transition-all active:scale-[0.98]"
    >
      重新生成列表
    </button>
  </div>
</template>
