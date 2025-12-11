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
      <!-- 调试信息（发布时删除） -->
      <view v-if="!song && !loading" class="debug-info">
        <text>数据未加载</text>
      </view>

      <!-- 封面 -->
      <view class="cover-section">
        <view class="cover-wrapper" :class="{ playing: isPlaying }">
          <image v-if="song?.cover_url" :src="song.cover_url" mode="aspectFill" class="cover-image" />
          <view v-else class="cover-placeholder">
            <text>🎵</text>
          </view>
        </view>
        <!-- 歌曲标题显示在封面下方 -->
        <text v-if="song?.title" class="cover-title">{{ song.title }}</text>
      </view>

      <!-- 歌词区域 -->
      <scroll-view class="lyrics-section" scroll-y>
        <view class="lyrics-content">
          <text class="lyrics-text">{{ formattedLyrics }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 底部控制区 -->
    <view class="bottom-bar">
      <!-- 进度条 -->
      <view class="progress-section">
        <text class="time current">{{ formatTime(currentTime) }}</text>
        <view class="progress-bar" @touchstart="seekTo" @tap="seekTo">
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

// 格式化歌词：处理各种换行符格式
const formattedLyrics = computed(() => {
  // 调试：检查 song 数据
  if (!song.value) {
    console.log('[nursery-rhyme] formattedLyrics: song.value 为空')
    return '歌词加载中...'
  }

  // 处理 lyrics 字段 - 可能是字符串或对象
  let lyricsText = ''
  const lyricsField = song.value.lyrics

  if (typeof lyricsField === 'string') {
    // 直接是字符串
    lyricsText = lyricsField
  } else if (lyricsField && typeof lyricsField === 'object') {
    // 是对象，尝试获取 full_text 或拼接 sections
    lyricsText = (lyricsField as any).full_text || ''
    if (!lyricsText && (lyricsField as any).sections) {
      // 从 sections 拼接
      lyricsText = (lyricsField as any).sections
        .map((s: any) => s.content)
        .join('\n\n')
    }
  }

  // 尝试其他字段名
  if (!lyricsText) {
    lyricsText = (song.value as any).lyric || (song.value as any).content || ''
  }

  if (!lyricsText) {
    console.log('[nursery-rhyme] formattedLyrics: 没有找到歌词字段, song keys:', Object.keys(song.value))
    return '暂无歌词'
  }

  // 统一处理各种换行符格式：\n, \\n, <br>, 实际换行
  // 移除歌词标签如 [Verse], [Chorus]
  return lyricsText
    .replace(/\[(?:Verse|Chorus|Bridge|Intro|Outro)\]\n?/gi, '')  // 移除歌词标签
    .replace(/\\n/g, '\n')  // 处理转义的 \n
    .replace(/<br\s*\/?>/gi, '\n')  // 处理 HTML <br> 标签
    .replace(/\r\n/g, '\n')  // 处理 Windows 换行
    .replace(/\r/g, '\n')    // 处理旧 Mac 换行
    .replace(/\n{3,}/g, '\n\n')  // 多个空行合并为两个
    .trim()
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

// 进度条宽度（用于计算跳转位置）
const progressBarWidth = ref(0)

function onProgressBarReady() {
  // 页面加载后获取进度条宽度
  const query = uni.createSelectorQuery()
  query.select('.progress-bar').boundingClientRect((rect: any) => {
    if (rect) {
      progressBarWidth.value = rect.width
    }
  })
  // 执行查询
  const execQuery = query as any
  execQuery['exec']()
}

function seekTo(e: any) {
  if (!audioContext || duration.value === 0) return

  // 微信小程序中使用 touches 或 changedTouches 获取点击位置
  const touch = e.touches?.[0] || e.changedTouches?.[0]
  const detail = e.detail || {}

  // 尝试多种方式获取点击位置
  let offsetX = 0
  if (touch) {
    // 触摸事件：计算相对于进度条的偏移
    // 使用 currentTarget 的数据集或默认值
    const barLeft = e.currentTarget?.offsetLeft || 0
    offsetX = (touch.pageX || touch.clientX || 0) - barLeft
  } else if (detail.x !== undefined) {
    offsetX = detail.x
  }

  // 使用缓存的宽度或默认值
  const barWidth = progressBarWidth.value || 500
  const percent = Math.max(0, Math.min(1, offsetX / barWidth))
  const seekTime = percent * duration.value

  console.log('[nursery-rhyme] 跳转到:', seekTime.toFixed(1), '秒 (', (percent * 100).toFixed(0), '%)')
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
  if (!song.value?.audio_url) {
    console.warn('[nursery-rhyme] 没有音频 URL')
    return
  }

  console.log('[nursery-rhyme] 初始化音频, URL:', song.value.audio_url)

  // 设置全局音频选项 - 确保静音开关不影响播放
  uni.setInnerAudioOption({
    obeyMuteSwitch: false,
    mixWithOther: false  // 改为 false，避免与其他音频冲突
  })

  // 销毁旧的音频实例
  if (audioContext) {
    audioContext.stop()
    audioContext.destroy()
    audioContext = null
  }

  audioContext = uni.createInnerAudioContext()
  audioContext.volume = 1.0

  // 处理 URL - 确保使用 HTTPS
  let audioUrl = song.value.audio_url
  if (audioUrl.startsWith('http://')) {
    audioUrl = audioUrl.replace('http://', 'https://')
  }

  // 不要对已编码的 URL 重复编码
  if (!audioUrl.includes('%')) {
    audioUrl = encodeURI(audioUrl)
  }

  console.log('[nursery-rhyme] 处理后的音频 URL:', audioUrl)

  // 先设置事件监听器，再设置 src
  audioContext.onCanplay(() => {
    console.log('[nursery-rhyme] 音频可以播放, duration:', audioContext?.duration)
    // 获取真实时长
    if (audioContext?.duration && audioContext.duration > 0) {
      duration.value = audioContext.duration
    }
  })

  audioContext.onPlay(() => {
    console.log('[nursery-rhyme] 开始播放')
    isPlaying.value = true
  })

  audioContext.onPause(() => {
    console.log('[nursery-rhyme] 暂停')
    isPlaying.value = false
  })

  audioContext.onStop(() => {
    console.log('[nursery-rhyme] 停止')
    isPlaying.value = false
  })

  audioContext.onEnded(() => {
    console.log('[nursery-rhyme] 播放结束')
    isPlaying.value = false
    currentTime.value = duration.value
  })

  audioContext.onTimeUpdate(() => {
    currentTime.value = audioContext?.currentTime || 0
    // 持续更新 duration，因为有些音频需要播放后才能获取真实时长
    if (audioContext?.duration && audioContext.duration > 0 && audioContext.duration !== Infinity) {
      duration.value = audioContext.duration
    }
  })

  audioContext.onError((err: any) => {
    console.error('[nursery-rhyme] 音频错误:', err)
    const errMsg = err?.errMsg || err?.message || '未知错误'
    uni.showToast({ title: `音频加载失败: ${errMsg}`, icon: 'none', duration: 3000 })
  })

  audioContext.onWaiting(() => {
    console.log('[nursery-rhyme] 音频缓冲中...')
  })

  // 设置音频源
  audioContext.src = audioUrl

  // 使用 onCanplay 后自动播放，而不是固定延时
  const playAttempt = () => {
    if (audioContext) {
      console.log('[nursery-rhyme] 尝试播放...')
      audioContext.play()
    }
  }

  // 等待 canplay 或超时后尝试播放
  setTimeout(playAttempt, 500)
}

async function loadContent() {
  loading.value = true

  try {
    // 优先从临时存储读取（刚生成的儿歌）
    const tempSong = uni.getStorageSync('temp_nursery_rhyme')
    console.log('[nursery-rhyme] 临时存储数据:', tempSong)
    console.log('[nursery-rhyme] 临时存储数据 keys:', tempSong ? Object.keys(tempSong) : 'null')
    if (tempSong) {
      song.value = tempSong
      console.log('[nursery-rhyme] 设置 song.value, lyrics:', song.value?.lyrics?.substring(0, 50))
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
  console.log('[nursery-rhyme] onLoad, options:', options)
  songId.value = options?.id || ''

  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 20

  // 立即尝试加载内容
  loadContent()
})

onMounted(() => {
  console.log('[nursery-rhyme] onMounted, song.value:', song.value ? 'loaded' : 'null')
  // 如果 onLoad 中没有加载成功，再尝试一次
  if (!song.value) {
    console.log('[nursery-rhyme] onMounted: 重新尝试加载')
    loadContent()
  }
  // 延迟获取进度条宽度，等待 DOM 渲染完成
  setTimeout(() => {
    onProgressBarReady()
  }, 100)
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

// === 主容器 ===
.play-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: $page-width;
  height: 100%;
  background: linear-gradient(180deg, #1a2a3a 0%, #0d1a26 100%);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

// === 背景 ===
.background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
}

.bg-image {
  width: 100%;
  height: 100%;
  filter: blur(50rpx) brightness(0.4) saturate(1.2);
  transform: scale(1.1);
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(13, 26, 38, 0.6) 0%,
    rgba(13, 26, 38, 0.85) 50%,
    rgba(13, 26, 38, 0.95) 100%
  );
}

// === 顶部栏 ===
.top-bar {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-sm $spacing-md;
  flex-shrink: 0;
}

.close-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  transition: background $duration-fast;

  text {
    font-size: 40rpx;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 300;
  }

  &:active {
    background: rgba(255, 255, 255, 0.25);
  }
}

.song-title {
  flex: 1;
  text-align: center;
  font-size: $font-md;
  color: rgba(255, 255, 255, 0.95);
  font-weight: $font-medium;
  padding: 0 $spacing-sm;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.placeholder {
  width: 72rpx;
}

// === 主内容 ===
.main-content {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: $spacing-md $spacing-lg;
  overflow: hidden;
  min-height: 0;
}

// === 调试信息 ===
.debug-info {
  background: rgba(255, 100, 100, 0.2);
  padding: $spacing-md;
  border-radius: $radius-md;
  margin-bottom: $spacing-md;
  text-align: center;
  border: 1rpx solid rgba(255, 100, 100, 0.3);

  text {
    color: rgba(255, 200, 200, 0.9);
    font-size: $font-sm;
  }
}

// === 封面区域 ===
.cover-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: $spacing-lg;
  flex-shrink: 0;
}

.cover-wrapper {
  position: relative;
  width: 360rpx;
  height: 360rpx;
  border-radius: 50%;
  overflow: hidden;
  box-shadow:
    0 16rpx 48rpx rgba(0, 0, 0, 0.4),
    0 0 0 8rpx rgba(255, 255, 255, 0.1),
    inset 0 0 60rpx rgba(0, 0, 0, 0.3);
  transition: transform 0.5s $ease-soft;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 80rpx;
    height: 80rpx;
    background: radial-gradient(circle, #1a2a3a 30%, transparent 70%);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    box-shadow: 0 0 0 4rpx rgba(255, 255, 255, 0.2);
  }

  &.playing {
    animation: vinyl-rotate 8s linear infinite;
  }
}

@keyframes vinyl-rotate {
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
  background: $song-gradient;

  text {
    font-size: 140rpx;
    filter: drop-shadow(0 4rpx 8rpx rgba(0,0,0,0.3));
  }
}

.cover-title {
  margin-top: $spacing-md;
  font-size: $font-lg;
  color: rgba(255, 255, 255, 0.95);
  font-weight: $font-semibold;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// === 歌词区域 ===
.lyrics-section {
  flex: 1;
  max-height: 350rpx;
  margin-bottom: $spacing-sm;
}

.lyrics-content {
  padding: $spacing-md $spacing-sm;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%);
  border-radius: $radius-xl;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
}

.lyrics-text {
  font-size: $font-base;
  color: rgba(255, 255, 255, 0.85);
  line-height: 2.2;
  white-space: pre-wrap;
  text-align: center;
}

// === 底部控制栏 ===
.bottom-bar {
  position: relative;
  z-index: 10;
  padding: $spacing-md $spacing-lg;
  padding-bottom: calc(#{$spacing-lg} + env(safe-area-inset-bottom));
  flex-shrink: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
}

// === 进度条 ===
.progress-section {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-lg;
}

.time {
  font-size: $font-xs;
  color: rgba(255, 255, 255, 0.5);
  min-width: 70rpx;
  font-variant-numeric: tabular-nums;

  &.current { text-align: right; }
  &.total { text-align: left; }
}

.progress-bar {
  flex: 1;
  height: 6rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: $radius-full;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: $song-gradient;
  border-radius: $radius-full;
  transition: width 0.15s linear;
}

.progress-dot {
  position: absolute;
  top: 50%;
  width: 24rpx;
  height: 24rpx;
  background: $text-white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.4);
}

// === 控制按钮 ===
.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xl;
  margin-bottom: $spacing-md;
}

.control-btn {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  transition: all $duration-fast $ease-out;

  text {
    font-size: 40rpx;
  }

  &:active {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(0.95);
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
  width: 128rpx;
  height: 128rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $song-gradient;
  border-radius: 50%;
  box-shadow:
    0 8rpx 32rpx rgba($song-primary, 0.5),
    0 0 0 6rpx rgba($song-primary, 0.15);
  transition: all $duration-base $ease-bounce;

  text {
    font-size: 52rpx;
    color: $text-white;
    margin-left: 6rpx;
  }

  &:active {
    transform: scale(0.92);
    box-shadow:
      0 4rpx 16rpx rgba($song-primary, 0.4),
      0 0 0 4rpx rgba($song-primary, 0.1);
  }
}

// === 风格标签 ===
.style-tag {
  text-align: center;

  text {
    display: inline-block;
    padding: $spacing-xs $spacing-md;
    background: rgba($song-primary, 0.15);
    border-radius: $radius-full;
    font-size: $font-xs;
    color: $song-secondary;
    border: 1rpx solid rgba($song-primary, 0.2);
  }
}

// === 加载状态 ===
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(13, 26, 38, 0.95);
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
  filter: drop-shadow(0 4rpx 12rpx rgba($song-primary, 0.4));
}

.loading-content text:last-child {
  font-size: $font-base;
  color: rgba(255, 255, 255, 0.8);
}

// === 动画 ===
.animate-spin {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
