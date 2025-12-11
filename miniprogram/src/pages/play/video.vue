<template>
  <view class="play-container">
    <!-- 视频区域 -->
    <view class="video-section">
      <video
        v-if="video?.video_url"
        :src="video.video_url"
        :poster="video.cover_url"
        :autoplay="true"
        :controls="true"
        :show-fullscreen-btn="true"
        :show-play-btn="true"
        :show-center-play-btn="true"
        :enable-progress-gesture="true"
        object-fit="contain"
        class="video-player"
        @play="onPlay"
        @pause="onPause"
        @ended="onEnded"
        @error="onError"
        @timeupdate="onTimeUpdate"
      />
      <view v-else class="video-placeholder">
        <text class="placeholder-icon">🎬</text>
        <text class="placeholder-text">视频加载中...</text>
      </view>
    </view>

    <!-- 视频信息 -->
    <view class="info-section">
      <view class="info-header">
        <text class="video-title">{{ video?.title || '视频播放' }}</text>
        <view class="info-meta">
          <text v-if="video?.duration" class="meta-item">{{ formatDuration(video.duration) }}</text>
          <text v-if="video?.personalization?.child_name" class="meta-item">
            {{ video.personalization.child_name }} 的专属视频
          </text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <view class="action-btn" @tap="handleDownload">
          <text class="action-icon">📥</text>
          <text class="action-text">保存</text>
        </view>
        <button class="action-btn share-btn" open-type="share">
          <text class="action-icon">📤</text>
          <text class="action-text">分享</text>
        </button>
        <view class="action-btn" @tap="handleReplay">
          <text class="action-icon">🔄</text>
          <text class="action-text">重播</text>
        </view>
      </view>

      <!-- 来源信息 -->
      <view v-if="video?.source_book_id" class="source-info">
        <text class="source-label">来源绘本</text>
        <view class="source-card" @tap="goToSourceBook">
          <text class="source-icon">📚</text>
          <text class="source-name">查看原绘本</text>
          <text class="source-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 顶部返回按钮 -->
    <view class="top-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="back-btn" @tap="handleClose">
        <text>‹</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-overlay">
      <view class="loading-content">
        <view class="loading-icon animate-spin">🎬</view>
        <text>加载中...</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import type { Video } from '@/api/content'
import { getContentDetail } from '@/api/content'

// 状态
const videoId = ref('')
const video = ref<Video | null>(null)
const loading = ref(true)
const isPlaying = ref(false)
const currentTime = ref(0)
const statusBarHeight = ref(20)

// 视频组件引用
let videoContext: UniApp.VideoContext | null = null

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function onPlay() {
  console.log('[video] 开始播放')
  isPlaying.value = true
}

function onPause() {
  console.log('[video] 暂停')
  isPlaying.value = false
}

function onEnded() {
  console.log('[video] 播放结束')
  isPlaying.value = false
}

function onError(e: any) {
  console.error('[video] 播放错误:', e)
  uni.showToast({ title: '视频播放失败', icon: 'none' })
}

function onTimeUpdate(e: any) {
  currentTime.value = e.detail.currentTime || 0
}

function handleReplay() {
  if (videoContext) {
    videoContext.seek(0)
    videoContext.play()
  }
}

function handleDownload() {
  if (!video.value?.video_url) {
    uni.showToast({ title: '视频地址不可用', icon: 'none' })
    return
  }

  uni.showLoading({ title: '正在保存...' })

  uni.downloadFile({
    url: video.value.video_url,
    success: (res) => {
      if (res.statusCode === 200) {
        uni.saveVideoToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            uni.hideLoading()
            uni.showToast({ title: '保存成功', icon: 'success' })
          },
          fail: (err) => {
            uni.hideLoading()
            console.error('保存视频失败:', err)
            if (err.errMsg?.includes('auth deny')) {
              uni.showModal({
                title: '提示',
                content: '需要您授权保存到相册',
                success: (res) => {
                  if (res.confirm) {
                    uni.openSetting()
                  }
                }
              })
            } else {
              uni.showToast({ title: '保存失败', icon: 'none' })
            }
          }
        })
      } else {
        uni.hideLoading()
        uni.showToast({ title: '下载失败', icon: 'none' })
      }
    },
    fail: () => {
      uni.hideLoading()
      uni.showToast({ title: '下载失败', icon: 'none' })
    }
  })
}

function goToSourceBook() {
  if (video.value?.source_book_id) {
    uni.navigateTo({
      url: `/pages/play/picture-book?id=${video.value.source_book_id}`
    })
  }
}

function handleClose() {
  uni.navigateBack()
}

async function loadContent() {
  loading.value = true

  try {
    // 优先从临时存储读取（刚生成的视频）
    const tempVideo = uni.getStorageSync('temp_video')
    if (tempVideo) {
      video.value = tempVideo
      uni.removeStorageSync('temp_video')
      loading.value = false
      initVideoContext()
      return
    }

    // 从 API 加载
    if (videoId.value) {
      const result = await getContentDetail(videoId.value)
      video.value = result as unknown as Video
      initVideoContext()
    }
  } catch (e) {
    console.error('加载视频失败:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
  } finally {
    loading.value = false
  }
}

function initVideoContext() {
  // 延迟初始化视频上下文
  setTimeout(() => {
    videoContext = uni.createVideoContext('video-player')
  }, 100)
}

// 分享配置
onShareAppMessage(() => ({
  title: video.value?.title || '来看这个有趣的视频',
  path: `/pages/play/video?id=${videoId.value}`,
  imageUrl: video.value?.cover_url || ''
}))

onShareTimeline(() => ({
  title: video.value?.title || '来看这个有趣的视频',
  query: `id=${videoId.value}`,
  imageUrl: video.value?.cover_url || ''
}))

onLoad((options) => {
  videoId.value = options?.id || ''

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
  if (videoContext) {
    videoContext.stop()
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.play-container {
  min-height: 100vh;
  background: #1a1a2e;
  display: flex;
  flex-direction: column;
}

// 顶部栏
.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: $spacing-sm $spacing-md;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  backdrop-filter: blur(10px);

  text {
    font-size: 48rpx;
    color: $text-white;
    line-height: 1;
  }
}

// 视频区域
.video-section {
  width: 750rpx;
  height: 422rpx; // 16:9 比例
  background: #000;
}

.video-player {
  width: 100%;
  height: 100%;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
}

.placeholder-icon {
  font-size: 80rpx;
}

.placeholder-text {
  font-size: $font-base;
  color: rgba(255, 255, 255, 0.6);
}

// 信息区域
.info-section {
  flex: 1;
  background: $bg-base;
  border-radius: $radius-xl $radius-xl 0 0;
  margin-top: -20rpx;
  padding: $spacing-xl $spacing-md;
  padding-bottom: calc(#{$spacing-xl} + env(safe-area-inset-bottom));
}

.info-header {
  margin-bottom: $spacing-lg;
}

.video-title {
  display: block;
  font-size: $font-xl;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.info-meta {
  display: flex;
  gap: $spacing-md;
}

.meta-item {
  font-size: $font-sm;
  color: $text-secondary;
}

// 操作按钮
.action-buttons {
  display: flex;
  justify-content: center;
  gap: $spacing-xl;
  padding: $spacing-lg 0;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.08);
  margin-bottom: $spacing-lg;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  padding: 0;
  margin: 0;
  background: transparent;
  border: none;
  line-height: 1;

  &::after {
    display: none;
  }

  &:active {
    opacity: 0.7;
  }
}

.action-icon {
  font-size: 48rpx;
}

.action-text {
  font-size: $font-xs;
  color: $text-secondary;
}

.share-btn {
  // 继承 action-btn 样式
}

// 来源信息
.source-info {
  margin-top: $spacing-md;
}

.source-label {
  display: block;
  font-size: $font-sm;
  color: $text-secondary;
  margin-bottom: $spacing-sm;
}

.source-card {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md;
  background: $bg-card;
  border-radius: $radius-md;

  &:active {
    background: darken(#fff, 3%);
  }
}

.source-icon {
  font-size: 32rpx;
}

.source-name {
  flex: 1;
  font-size: $font-base;
  color: $text-primary;
}

.source-arrow {
  font-size: 32rpx;
  color: $text-light;
}

// 加载状态
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
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

// 动画
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
