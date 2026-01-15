<script setup lang="ts">
import { computed, ref } from 'vue'

type ConfirmOptions = {
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  confirmType?: 'danger' | 'primary'
}

const isOpen = ref(false)
const options = ref<Required<ConfirmOptions>>({
  title: '确认操作',
  message: '',
  confirmText: '确认',
  cancelText: '取消',
  confirmType: 'primary'
})

let resolver: ((value: boolean) => void) | null = null

const open = (payload: ConfirmOptions = {}) => {
  options.value = {
    title: payload.title ?? '确认操作',
    message: payload.message ?? '',
    confirmText: payload.confirmText ?? '确认',
    cancelText: payload.cancelText ?? '取消',
    confirmType: payload.confirmType ?? 'primary'
  }
  isOpen.value = true
  return new Promise<boolean>((resolve) => {
    resolver = resolve
  })
}

const close = (result: boolean) => {
  isOpen.value = false
  resolver?.(result)
  resolver = null
}

const handleConfirm = () => close(true)
const handleCancel = () => close(false)

const confirmButtonClass = computed(() => {
  return options.value.confirmType === 'danger'
    ? 'text-red-200 bg-red-500/20 hover:bg-red-500/30'
    : 'text-white bg-[#7A9D8C]/70 hover:bg-[#7A9D8C]/80'
})

defineExpose({ open })
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
      @click.self="handleCancel"
    >
      <div class="w-full max-w-[360px] rounded-2xl bg-[#2C3639] border border-white/10 shadow-2xl p-6 text-white">
        <h4 class="text-base font-medium">{{ options.title }}</h4>
        <p v-if="options.message" class="text-xs text-white/50 mt-2">{{ options.message }}</p>
        <div class="mt-5 flex gap-3">
          <button
            type="button"
            class="flex-1 py-2.5 rounded-xl text-xs font-medium text-white/60 bg-white/5 hover:bg-white/10 transition-all"
            @click="handleCancel"
          >
            {{ options.cancelText }}
          </button>
          <button
            type="button"
            :class="['flex-1 py-2.5 rounded-xl text-xs font-medium transition-all', confirmButtonClass]"
            @click="handleConfirm"
          >
            {{ options.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
