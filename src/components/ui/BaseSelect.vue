<script setup lang="ts">
import { ref, computed } from 'vue'

interface Option {
  label: string
  value: string | number
}

const props = defineProps<{
  modelValue: string | number
  options: Option[]
  label?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const isOpen = ref(false)

const selectedLabel = computed(() => {
  const opt = props.options.find(o => o.value === props.modelValue)
  return opt ? opt.label : props.placeholder || '请选择'
})

const toggle = () => isOpen.value = !isOpen.value
const close = () => isOpen.value = false

const select = (value: string | number) => {
  emit('update:modelValue', value)
  close()
}
</script>

<template>
  <div class="group relative">
    <!-- Label -->
    <label v-if="label" class="block text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2 group-focus-within:text-[#7A9D8C] transition-colors">
      {{ label }}
    </label>

    <!-- Trigger Button -->
    <button 
      @click="toggle"
      class="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-transparent focus:border-[#7A9D8C]/50 rounded-xl px-4 py-3 text-[12px] md:text-sm text-white transition-all duration-300 outline-none active:scale-[0.99]"
      :class="{ 'border-[#7A9D8C]/50 bg-white/10': isOpen }"
    >
      <span class="truncate">{{ selectedLabel }}</span>
      <span class="text-white/30 text-[10px] transition-transform duration-300" :class="{ 'rotate-180': isOpen }">▼</span>
    </button>

    <!-- Backdrop (Mobile Only) -->
    <transition name="fade">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
        @click="close"
      ></div>
    </transition>

    <!-- Options Container -->
    <transition name="menu">
      <div 
        v-if="isOpen"
        class="
          fixed bottom-0 left-0 right-0 z-[101] max-h-[60vh] overflow-y-auto bg-[#1c1c1e] rounded-t-3xl border-t border-white/10 shadow-2xl p-4 safe-area-bottom
          lg:absolute lg:bottom-auto lg:top-[calc(100%+8px)] lg:left-0 lg:right-0 lg:max-h-[300px] lg:bg-[#2C3639]/95 lg:backdrop-blur-xl lg:rounded-xl lg:border lg:border-white/10 lg:shadow-xl lg:p-1.5 lg:z-50
        "
      >
        <!-- Mobile Handle -->
        <div class="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 lg:hidden"></div>

        <!-- Options List -->
        <ul class="space-y-1 lg:space-y-0.5">
          <li 
            v-for="opt in options" 
            :key="opt.value"
          >
            <button
              @click="select(opt.value)"
              class="w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between group active:scale-[0.98]"
              :class="modelValue === opt.value 
                ? 'bg-[#7A9D8C] text-white shadow-lg shadow-[#7A9D8C]/20' 
                : 'text-white/70 hover:bg-white/5 active:bg-white/10'"
            >
              {{ opt.label }}
              <span v-if="modelValue === opt.value" class="text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </span>
            </button>
          </li>
        </ul>
        
        <!-- Mobile Cancel Button -->
        <button 
          @click="close"
          class="w-full mt-4 py-3.5 bg-white/5 rounded-xl text-sm font-medium text-white/50 active:bg-white/10 lg:hidden"
        >
          取消
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 20px);
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Menu Transition (Combined Slide Up for Mobile, Fade/Scale for Desktop) */
.menu-enter-active,
.menu-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(100%); /* Mobile: Slide from bottom */
}

@media (min-width: 1024px) {
  .menu-enter-from,
  .menu-leave-to {
    opacity: 0;
    transform: translateY(-8px) scale(0.98); /* Desktop: Dropdown effect */
  }
}
</style>
