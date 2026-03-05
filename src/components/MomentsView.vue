<script setup lang="ts">
import { onMounted } from 'vue'
import { useMomentsStore } from '../stores/moments'

const momentsStore = useMomentsStore()

onMounted(() => {
  momentsStore.init()
})

const parseImageToken = (token: string) => {
  const [seedRaw, ...topicParts] = token.split('|')
  const seed = Number(seedRaw) || 1
  const topic = topicParts.join('|') || '日常'
  const hueA = (seed * 37) % 360
  const hueB = (hueA + 56) % 360

  return {
    label: topic.length > 4 ? `${topic.slice(0, 4)}...` : topic,
    style: {
      background: `linear-gradient(150deg, hsl(${hueA} 72% 76%), hsl(${hueB} 68% 62%))`
    }
  }
}

const getGridClass = (count: number) => {
  if (count <= 1) return 'grid-cols-1 max-w-[220px]'
  if (count === 2 || count === 4) return 'grid-cols-2 max-w-[220px]'
  return 'grid-cols-3 max-w-[250px]'
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const text = event.clipboardData?.getData('text/plain')
  if (text) {
    document.execCommand('insertText', false, text)
  }
}

const onContentBlur = (id: string, event: Event) => {
  const target = event.target as HTMLElement
  momentsStore.updatePostContent(id, target.innerText)
}
</script>

<template>
  <div class="h-full overflow-y-auto bg-[#f4f5f7]">
    <div class="relative h-[220px] bg-gradient-to-br from-[#7a9d8c] via-[#8ea99d] to-[#b5a088] overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.28),transparent_55%)]"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_82%_82%,rgba(0,0,0,0.18),transparent_48%)]"></div>
      <div class="absolute right-4 bottom-4 flex items-end gap-3 z-10">
        <div class="text-right">
          <p class="text-white text-[17px] font-semibold tracking-wide">{{ momentsStore.config.ownerName }}</p>
          <p class="text-white/75 text-[11px] mt-1">朋友圈</p>
        </div>
        <div class="w-[62px] h-[62px] rounded-[14px] bg-white/30 backdrop-blur-sm p-[2px]">
          <img
            v-if="momentsStore.config.ownerAvatar"
            :src="momentsStore.config.ownerAvatar"
            alt="avatar"
            class="w-full h-full rounded-[12px] object-cover"
          />
          <div v-else class="w-full h-full rounded-[12px] bg-[#d5d6da]"></div>
        </div>
      </div>
    </div>

    <div class="px-3 py-4 space-y-5">
      <article
        v-for="post in momentsStore.posts"
        :key="post.id"
        class="bg-white rounded-2xl px-3.5 py-3 shadow-[0_6px_18px_rgba(31,41,55,0.08)] border border-black/[0.03]"
      >
        <div class="flex gap-2.5">
          <div class="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#d9dce1]">
            <img :src="post.avatar" class="w-full h-full object-cover" alt="avatar" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <p class="text-[15px] font-semibold text-[#5a6f8d]">{{ post.userName }}</p>
              <button class="w-6 h-6 rounded-full bg-[#f2f3f7] text-[#8a8f98] text-[12px]">•••</button>
            </div>

            <div
              class="mt-1 text-[14px] leading-[1.55] text-[#191f28] whitespace-pre-wrap break-words outline-none"
              contenteditable
              @blur="(event) => onContentBlur(post.id, event)"
              @paste="handlePaste"
            >
              {{ post.content }}
            </div>

            <div
              v-if="post.images.length > 0"
              class="grid gap-1.5 mt-2"
              :class="getGridClass(post.images.length)"
            >
              <div
                v-for="(imageToken, imageIndex) in post.images"
                :key="`${post.id}-${imageIndex}`"
                class="aspect-square rounded-lg overflow-hidden relative"
                :style="parseImageToken(imageToken).style"
              >
                <div class="absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-white/20"></div>
                <span class="absolute left-2 bottom-1.5 text-[10px] text-white/90 tracking-wide">
                  {{ parseImageToken(imageToken).label }}
                </span>
              </div>
            </div>

            <div class="mt-2 flex items-center gap-2 text-[11px] text-[#8890a0]">
              <span>{{ post.time }}</span>
              <span>·</span>
              <span>{{ post.location }}</span>
            </div>

            <div v-if="post.likes.length || post.comments.length" class="mt-2 rounded-lg bg-[#f5f6f8] px-2.5 py-2 space-y-1.5">
              <p v-if="post.likes.length" class="text-[12px] text-[#5a6f8d]">
                赞 {{ post.likes.join('、') }}
              </p>
              <div v-if="post.comments.length" class="space-y-1">
                <p
                  v-for="comment in post.comments"
                  :key="comment.id"
                  class="text-[12px] text-[#2f3440]"
                >
                  <span class="text-[#5a6f8d]">{{ comment.userName }}：</span>{{ comment.content }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>

      <p v-if="momentsStore.posts.length === 0" class="text-center text-[12px] text-[#949aa6] py-12">
        暂无抢票动态，去右侧点击生成
      </p>
    </div>
  </div>
</template>
