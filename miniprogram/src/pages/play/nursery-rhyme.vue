<template>
  <view class="play-container">
    <!-- 背景 -->
    <view class="background">
      <image v-if="song?.cover_url" :src="song.cover_url" mode="aspectFill" class="bg-image" />
      <view class="bg-overlay"></view>
    </view>

    <!-- 顶部控制栏 -->
    <view class="top-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="close-btn" @tap="handleClose">
        <text>×</text>
      </view>
      <text class="song-title">{{ song?.title || '儿歌播放' }}</text>
      <view class="placeholder"></view>
    </view>

    <!-- 主内容 -->
    <view class="main-content">
      <!-- 封面 -->
      <view class="cover-section">
        <view class="cover-wrapper" :class="{ playing: isPlaying }">
          <image v-if="song?.cover_url" :src="song.cover_url" mode="aspectFill" class="cover-image" />
          <view v-else class="cover-placeholder">
            <text>🎵</text>
          </view>
        </view>
      </view>

      <!-- 歌词区域 -->
      <scroll-view class="lyrics-section" scroll-y>
        <view class="lyrics-content">
          <text class="lyrics-text">{{ song?.lyrics || '歌词加载中...' }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 底部控制区 -->
    <view class="bottom-bar">
      <!-- 进度条 -->
      <view class="progress-section">
        <text class="time current">{{ formatTime(currentTime) }}</text>
        <view class="progress-bar" @tap="seekTo">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
          <view class="progress-dot" :style="{ left: progressPercent + '%' }"></view>
        </view>
        <text class="time total">{{ formatTime(duration) }}</text>
      </view>

      <!-- 控制按钮 -->
      <view class="controls">
        <view class="control-btn" @tap="handleReplay">
          <text>🔄</text>
        </view>
        <view class="play-btn" @tap="togglePlay">
          <text>{{ isPlaying ? '⏸' : '▶' }}</text>
        </view>
        <button class="control-btn share-btn" open-type="share">
          <text>📤</text>
        </button>
      </view>

      <!-- 音乐风格标签 -->
      <view v-if="song?.music_style" class="style-tag">
        <text>{{ getStyleName(song.music_style) }}</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-overlay">
      <view class="loading-content">
        <view class="loading-icon animate-spin">🎵</view>
        <text>加载中...</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import type { NurseryRhyme, MusicStyle } from '@/api/content'
import { getContentDetail } from '@/api/content'

// 状态
const songId = ref('')
const song = ref<NurseryRhyme | null>(null)
const loading = ref(true)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const statusBarHeight = ref(20)

// 音频实例
let audioContext: UniApp.InnerAudioContext | null = null

// 计算属性
const progressPercent = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

// 音乐风格名称映射
const styleNames: Record<MusicStyle, string> = {
  cheerful: '欢快活泼',
  gentle: '温柔舒缓',
  playful: '俏皮可爱',
  lullaby: '摇篮曲风',
  educational: '启蒙教育'
}

function getStyleName(style: MusicStyle): string {
  return styleNames[style] || style
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function togglePlay() {
  if (!audioContext) return

  if (isPlaying.value) {
    audioContext.pause()
    isPlaying.value = false
  } else {
    audioContext.play()
    isPlaying.value = true
  }
}

function handleReplay() {
  if (!audioContext) return
  audioContext.seek(0)
  audioContext.play()
  isPlaying.value = true
}

function seekTo(e: any) {
  if (!audioContext || duration.value === 0) return

  const rect = e.currentTarget.getBoundingClientRect?.() || { width: 500 }
  const percent = e.detail.x / rect.width
  const seekTime = percent * duration.value
  audioContext.seek(seekTime)
}

function handleClose() {
  if (audioContext) {
    audioContext.stop()
    audioContext.destroy()
  }
  uni.navigateBack()
}

function initAudio() {
  if (!song.value?.audio_url) return

  // 设置全局音频选项
  uni.setInnerAudioOption({
    obeyMuteSwitch: false,
    mixWithOther: true
  })

  audioContext = uni.createInnerAudioContext()
  audioContext.volume = 1.0

  // 处理 URL
  let audioUrl = song.value.audio_url
  if (audioUrl.startsWith('http://')) {
    audioUrl = audioUrl.replace('http://', 'https://')
  }
  audioContext.src = encodeURI(audioUrl)

  audioContext.onPlay(() => {
    console.log('[nursery-rhyme] 开始播放')
    isPlaying.value = true
  })

  audioContext.onPause(() => {
    isPlaying.value = false
  })

  audioContext.onStop(() => {
    isPlaying.value = false
  })

  audioContext.onEnded(() => {
    isPlaying.value = false
    currentTime.value = duration.value
  })

  audioContext.onTimeUpdate(() => {
    currentTime.value = audioContext?.currentTime || 0
    if (audioContext?.duration && audioContext.duration > 0) {
      duration.value = audioContext.duration
    }
  })

  audioContext.onError((err: any) => {
    console.error('[nursery-rhyme] 音频错误:', err)
    uni.showToast({ title: '音频加载失败', icon: 'none' })
  })

  // 自动开始播放
  setTimeout(() => {
    audioContext?.play()
  }, 300)
}

async function loadContent() {
  loading.value = true

  try {
    // 优先从临时存储读取（刚生成的儿歌）
    const tempSong = uni.getStorageSync('temp_nursery_rhyme')
    if (tempSong) {
      song.value = tempSong
      uni.removeStorageSync('temp_nursery_rhyme')
      duration.value = tempSong.duration || 0
      initAudio()
      loading.value = false
      return
    }

    // 从 API 加载
    if (songId.value) {
      const result = await getContentDetail(songId.value)
      // 转换为 NurseryRhyme 类型
      song.value = result as unknown as NurseryRhyme
      duration.value = song.value.duration || 0
      initAudio()
    }
  } catch (e) {
    console.error('加载儿歌失败:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
  } finally {
    loading.value = false
  }
}

// 分享配置
onShareAppMessage(() => ({
  title: song.value?.title || '来听这首有趣的儿歌',
  path: `/pages/play/nursery-rhyme?id=${songId.value}`,
  imageUrl: song.value?.cover_url || ''
}))

onShareTimeline(() => ({
  title: song.value?.title || '来听这首有趣的儿歌',
  query: `id=${songId.value}`,
  imageUrl: song.value?.cover_url || ''
}))

onLoad((options) => {
  songId.value = options?.id || ''

  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 20

  if (options?.fromGenerate === '1') {
    // 从生成页跳转，内容已在 storage 中
  }
})

onMounted(() => {
  loadContent()
})

onUnmounted(() => {
  if (audioContext) {
    audioContext.stop()
    audioContext.destroy()
    audioContext = null
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.play-container {
  position: fixed;
  inset: 0;
  background: #1a1a2e;
  display: flex;
  flex-direction: column;
}

// 背景
.background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.bg-image {
  width: 100%;
  height: 100%;
  filter: blur(30px) brightness(0.5);
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(26, 26, 46, 0.8) 0%, rgba(26, 26, 46, 0.95) 100%);
}

// 顶部栏
.top-bar {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-sm $spacing-md;
}

.close-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(10px);

  text {
    font-size: 36rpx;
    color: $text-white;
  }
}

.song-title {
  font-size: $font-md;
  color: $text-white;
  font-weight: $font-medium;
}

.placeholder {
  width: 64rpx;
}

// 主内容
.main-content {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: $spacing-lg;
  overflow: hidden;
}

// 封面
.cover-section {
  display: flex;
  justify-content: center;
  margin-bottom: $spacing-xl;
}

.cover-wrapper {
  width: 400rpx;
  height: 400rpx;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.4);
  transition: transform 0.3s ease;

  &.playing {
    animation: rotate 20s linear infinite;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.cover-image {
  width: 100%;
  height: 100%;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $secondary 0%, $primary 100%);

  text {
    font-size: 160rpx;
  }
}

// 歌词区域
.lyrics-section {
  flex: 1;
  max-height: 400rpx;
}

.lyrics-content {
  padding: $spacing-md;
  background: rgba(255, 255, 255, 0.1);
  border-radius: $radius-lg;
}

.lyrics-text {
  font-size: $font-base;
  color: rgba(255, 255, 255, 0.9);
  line-height: 2;
  white-space: pre-wrap;
}

// 底部栏
.bottom-bar {
  position: relative;
  z-index: 10;
  padding: $spacing-lg;
  padding-bottom: calc(#{$spacing-lg} + env(safe-area-inset-bottom));
}

// 进度条
.progress-section {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-lg;
}

.time {
  font-size: $font-xs;
  color: rgba(255, 255, 255, 0.6);
  min-width: 60rpx;

  &.current { text-align: right; }
  &.total { text-align: left; }
}

.progress-bar {
  flex: 1;
  height: 8rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: $radius-full;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: $secondary;
  border-radius: $radius-full;
  transition: width 0.1s linear;
}

.progress-dot {
  position: absolute;
  top: 50%;
  width: 20rpx;
  height: 20rpx;
  background: $text-white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
}

// 控制按钮
.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xl;
  margin-bottom: $spacing-md;
}

.control-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  backdrop-filter: blur(10px);

  text {
    font-size: 36rpx;
  }

  &:active {
    background: rgba(255, 255, 255, 0.25);
  }
}

.share-btn {
  border: none;
  padding: 0;
  margin: 0;
  line-height: 1;

  &::after {
    display: none;
  }
}

.play-btn {
  width: 120rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $gradient-secondary;
  border-radius: 50%;
  box-shadow: 0 8rpx 24rpx rgba($secondary, 0.4);

  text {
    font-size: 48rpx;
    color: $text-white;
  }

  &:active {
    transform: scale(0.95);
  }
}

// 风格标签
.style-tag {
  text-align: center;

  text {
    display: inline-block;
    padding: $spacing-xs $spacing-md;
    background: rgba($secondary, 0.2);
    border-radius: $radius-full;
    font-size: $font-xs;
    color: $secondary;
  }
}

// 加载状态
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-md;
}

.loading-icon {
  font-size: 80rpx;
}

.loading-content text:last-child {
  font-size: $font-base;
  color: $text-white;
}
</style>
