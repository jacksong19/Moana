<template>
  <div class="player-nursery-rhyme h-full flex flex-col">
    <!-- 顶部导航栏 -->
    <div class="flex items-center justify-between px-4 py-3 bg-black/20">
      <button
        @click="$emit('back')"
        class="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>返回</span>
      </button>
      <h1 class="text-white font-medium truncate max-w-[60%]">{{ title }}</h1>
      <div class="w-16"></div>
    </div>

    <!-- 主要内容区 -->
    <div class="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden">
      <!-- 封面图 -->
      <div class="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl bg-black/30">
        <img
          v-if="coverUrl"
          :src="coverUrl"
          :alt="title"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-white/50">
          <span class="text-8xl">🎵</span>
        </div>

        <!-- 播放状态指示 -->
        <div
          v-if="isPlaying"
          class="absolute inset-0 flex items-center justify-center bg-black/20"
        >
          <div class="flex gap-1">
            <span
              v-for="i in 4"
              :key="i"
              class="w-1 bg-white rounded-full animate-bounce"
              :style="{ height: '20px', animationDelay: `${i * 0.1}s` }"
            ></span>
          </div>
        </div>
      </div>

      <!-- 歌词区域 -->
      <div class="mt-6 max-w-2xl w-full max-h-40 overflow-y-auto">
        <p class="text-center text-white/80 leading-relaxed whitespace-pre-wrap">
          {{ lyricsText }}
        </p>
      </div>
    </div>

    <!-- 底部播放控制 -->
    <div class="px-4 py-6 bg-black/20">
      <!-- 进度条 -->
      <div class="max-w-2xl mx-auto mb-4">
        <div class="flex items-center gap-3">
          <span class="text-white/60 text-sm w-12 text-right">{{ formatTime(currentTime) }}</span>
          <div
            class="flex-1 h-2 bg-white/20 rounded-full cursor-pointer relative"
            @click="handleProgressClick"
            ref="progressBarRef"
          >
            <div
              class="h-full bg-primary-500 rounded-full transition-all"
              :style="{ width: `${progressPercent}%` }"
            ></div>
            <div
              class="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
              :style="{ left: `calc(${progressPercent}% - 8px)` }"
            ></div>
          </div>
          <span class="text-white/60 text-sm w-12">{{ formatTime(duration) }}</span>
        </div>
      </div>

      <!-- 播放按钮 -->
      <div class="flex items-center justify-center gap-8">
        <!-- 后退 10 秒 -->
        <button
          @click="seek(-10)"
          class="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
          </svg>
        </button>

        <!-- 播放/暂停 -->
        <button
          @click="togglePlay"
          class="w-16 h-16 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors shadow-lg"
        >
          <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 ml-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        </button>

        <!-- 前进 10 秒 -->
        <button
          @click="seek(10)"
          class="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 隐藏的音频播放器 -->
    <audio
      ref="audioRef"
      :src="audioUrl"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onEnded"
      @error="onError"
      @play="isPlaying = true"
      @pause="isPlaying = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { LyricsObject } from '@/api/types'

const props = defineProps<{
  title: string
  audioUrl: string
  coverUrl?: string
  lyrics: string | LyricsObject
}>()

defineEmits<{
  back: []
}>()

const audioRef = ref<HTMLAudioElement | null>(null)
const progressBarRef = ref<HTMLElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)

// 解析歌词文本
const lyricsText = computed(() => {
  if (!props.lyrics) return ''
  if (typeof props.lyrics === 'string') {
    return props.lyrics
  }
  return props.lyrics.full_text || ''
})

// 进度百分比
const progressPercent = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

// 格式化时间
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 播放/暂停
function togglePlay() {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play().catch((err) => {
      console.warn('音频播放失败:', err)
    })
  }
}

// 快进/快退
function seek(seconds: number) {
  if (!audioRef.value) return
  const newTime = Math.max(0, Math.min(duration.value, currentTime.value + seconds))
  audioRef.value.currentTime = newTime
}

// 点击进度条跳转
function handleProgressClick(e: MouseEvent) {
  if (!progressBarRef.value || !audioRef.value) return
  const rect = progressBarRef.value.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  audioRef.value.currentTime = percent * duration.value
}

// 音频事件处理
function onTimeUpdate() {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime
  }
}

function onLoadedMetadata() {
  if (audioRef.value) {
    duration.value = audioRef.value.duration
  }
}

function onEnded() {
  isPlaying.value = false
  // 循环播放
  if (audioRef.value) {
    audioRef.value.currentTime = 0
    audioRef.value.play().catch(() => {})
  }
}

function onError(e: Event) {
  console.warn('音频加载失败:', e)
}

// 键盘控制
function handleKeydown(e: KeyboardEvent) {
  if (e.code === 'Space') {
    e.preventDefault()
    togglePlay()
  } else if (e.key === 'ArrowLeft') {
    seek(-10)
  } else if (e.key === 'ArrowRight') {
    seek(10)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  // 清理音频
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.src = ''
  }
})
</script>

<style scoped>
.player-nursery-rhyme {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

@keyframes bounce {
  0%, 100% {
    transform: scaleY(0.5);
  }
  50% {
    transform: scaleY(1);
  }
}

.animate-bounce {
  animation: bounce 0.5s ease-in-out infinite;
}
</style>
