<template>
  <view class="play-container">
    <!-- 绘本播放器 -->
    <swiper
      v-if="content"
      class="book-swiper"
      :current="currentPage"
      :circular="false"
      @change="onPageChange"
    >
      <swiper-item v-for="(page, index) in content.pages" :key="index">
        <view class="page-content">
          <!-- 页面图片 -->
          <image
            v-if="page.image_url"
            class="page-image"
            :src="page.image_url"
            mode="aspectFill"
          />
          <view v-else class="page-placeholder">
            <text>📖</text>
          </view>

          <!-- 文字内容 -->
          <view class="page-text-area">
            <text class="page-text">{{ page.text }}</text>
          </view>

          <!-- 互动区域 -->
          <view
            v-if="page.interaction"
            class="interaction-area"
            :class="{ active: showInteraction && currentPage === index }"
            @tap="handleInteraction(page, index)"
          >
            <view class="interaction-btn animate-pulse">
              <text class="interaction-icon">👆</text>
              <text class="interaction-text">{{ page.interaction.prompt }}</text>
            </view>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <!-- 顶部控制栏 -->
    <view class="top-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="top-left">
        <view class="close-btn" @tap="handleClose">
          <text>×</text>
        </view>
      </view>
      <view class="top-center">
        <text class="book-title">{{ content?.title }}</text>
      </view>
      <view class="top-right">
        <view class="child-mode-btn" @tap="goToChildMode">
          <text>👶</text>
        </view>
      </view>
    </view>

    <!-- 底部控制栏 -->
    <view class="bottom-bar">
      <!-- 进度条 -->
      <view class="progress-section">
        <view class="progress-bar">
          <view
            class="progress-fill"
            :style="{ width: progressPercent + '%' }"
          ></view>
        </view>
        <text class="progress-text">{{ currentPage + 1 }} / {{ totalPages }}</text>
      </view>

      <!-- 控制按钮 -->
      <view class="controls">
        <view class="control-btn" @tap="prevPage">
          <text>‹</text>
        </view>
        <view class="play-btn" @tap="togglePlay">
          <text>{{ isPlaying ? '⏸' : '▶' }}</text>
        </view>
        <view class="control-btn" @tap="nextPage">
          <text>›</text>
        </view>
      </view>

      <!-- 时间信息 -->
      <view class="time-info">
        <text class="time-remaining">剩余 {{ remainingTime }}</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-overlay">
      <view class="loading-content">
        <view class="loading-icon animate-spin">🌊</view>
        <text>加载中...</text>
      </view>
    </view>

    <!-- 时间提醒弹窗 -->
    <view v-if="showTimeWarning" class="time-warning-overlay">
      <view class="time-warning-modal animate-scaleIn">
        <text class="warning-emoji">{{ warningType === 'rest' ? '😊' : '😴' }}</text>
        <text class="warning-title">{{ warningTitle }}</text>
        <text class="warning-desc">{{ warningMessage }}</text>
        <view class="warning-actions">
          <view
            v-if="warningType === 'rest'"
            class="warning-btn btn-secondary"
            @tap="continuePlay"
          >
            <text>继续看</text>
          </view>
          <view class="warning-btn btn-primary" @tap="handleWarningConfirm">
            <text>{{ warningType === 'rest' ? '休息一下' : '好的' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useChildStore } from '@/stores/child'
import { useContentStore } from '@/stores/content'
import { startPlay, updateProgress, completePlay, submitInteraction } from '@/api/play'
import timeLimitManager from '@/utils/time-limit'
import type { PictureBook, PictureBookPage } from '@/api/content'

const childStore = useChildStore()
const contentStore = useContentStore()

// 状态
const contentId = ref('')
const content = ref<PictureBook | null>(null)
const loading = ref(true)
const currentPage = ref(0)
const isPlaying = ref(false)
const sessionId = ref('')
const showInteraction = ref(false)

// 时间提醒
const showTimeWarning = ref(false)
const warningType = ref<'rest' | 'session' | 'daily'>('rest')
const warningTitle = ref('')
const warningMessage = ref('')

// 导航栏
const statusBarHeight = ref(20)

// 音频
let audioContext: UniApp.InnerAudioContext | null = null
let playTimer: number | null = null
let checkTimer: number | null = null

// 计算属性
const totalPages = computed(() => content.value?.pages.length || 0)
const progressPercent = computed(() => {
  if (totalPages.value === 0) return 0
  return ((currentPage.value + 1) / totalPages.value) * 100
})
const remainingTime = computed(() => {
  const info = timeLimitManager.getRemainingInfo()
  return timeLimitManager.formatMinutes(info.sessionRemaining)
})

// 方法
function onPageChange(e: any) {
  currentPage.value = e.detail.current
  playCurrentPageAudio()
  updatePlayProgress()
}

function prevPage() {
  if (currentPage.value > 0) {
    currentPage.value--
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++
  } else {
    // 播放完成
    handleComplete()
  }
}

function togglePlay() {
  isPlaying.value = !isPlaying.value

  if (isPlaying.value) {
    playCurrentPageAudio()
    startAutoPlay()
  } else {
    audioContext?.pause()
    stopAutoPlay()
  }
}

function playCurrentPageAudio() {
  if (!content.value || !audioContext) return

  const page = content.value.pages[currentPage.value]
  if (page.audio_url) {
    audioContext.src = page.audio_url
    if (isPlaying.value) {
      audioContext.play()
    }
  }

  // 显示互动
  if (page.interaction) {
    setTimeout(() => {
      showInteraction.value = true
    }, 1000)
  } else {
    showInteraction.value = false
  }
}

function startAutoPlay() {
  stopAutoPlay()

  if (!content.value) return

  const page = content.value.pages[currentPage.value]
  const duration = (page.duration || 5) * 1000

  playTimer = setTimeout(() => {
    if (currentPage.value < totalPages.value - 1) {
      nextPage()
      startAutoPlay()
    } else {
      handleComplete()
    }
  }, duration)
}

function stopAutoPlay() {
  if (playTimer) {
    clearTimeout(playTimer)
    playTimer = null
  }
}

async function updatePlayProgress() {
  if (!sessionId.value) return

  try {
    await updateProgress(
      sessionId.value,
      (currentPage.value + 1) / totalPages.value,
      Math.round(timeLimitManager.getSessionMinutes() * 60)
    )
  } catch (e) {
    console.log('更新进度失败')
  }
}

async function handleComplete() {
  isPlaying.value = false
  stopAutoPlay()

  if (sessionId.value) {
    try {
      await completePlay(
        sessionId.value,
        Math.round(timeLimitManager.getSessionMinutes() * 60)
      )
    } catch (e) {
      console.log('完成播放失败')
    }
  }

  timeLimitManager.endSession()

  uni.showToast({
    title: '绘本看完啦！',
    icon: 'success'
  })

  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}

async function handleInteraction(page: PictureBookPage, pageIndex: number) {
  if (!page.interaction || !sessionId.value) return

  showInteraction.value = false

  try {
    await submitInteraction(sessionId.value, {
      interaction_type: page.interaction.type,
      page_number: pageIndex + 1,
      response_time: 2.0,
      correct: true
    })

    uni.showToast({ title: '太棒了！', icon: 'success' })
  } catch (e) {
    console.log('提交互动失败')
  }
}

function checkTimeLimit() {
  const result = timeLimitManager.checkLimits()

  if (result.exceeded) {
    isPlaying.value = false
    stopAutoPlay()
    audioContext?.pause()

    warningType.value = result.type || 'session'
    warningTitle.value = result.type === 'daily' ? '今日时间到' : '休息时间到'
    warningMessage.value = result.message
    showTimeWarning.value = true
  } else if (result.reminder) {
    isPlaying.value = false
    stopAutoPlay()
    audioContext?.pause()

    warningType.value = 'rest'
    warningTitle.value = '眼睛休息'
    warningMessage.value = result.message
    showTimeWarning.value = true
  }
}

function continuePlay() {
  showTimeWarning.value = false
  timeLimitManager.resetReminder()
  isPlaying.value = true
  playCurrentPageAudio()
  startAutoPlay()
}

function handleWarningConfirm() {
  showTimeWarning.value = false

  if (warningType.value !== 'rest') {
    timeLimitManager.endSession()
    uni.navigateBack()
  } else {
    // 休息确认
    timeLimitManager.resetReminder()
  }
}

function goToChildMode() {
  uni.navigateTo({
    url: `/pages/child/index?contentId=${contentId.value}`
  })
}

function handleClose() {
  isPlaying.value = false
  stopAutoPlay()
  audioContext?.pause()

  timeLimitManager.endSession()
  uni.navigateBack()
}

// 加载内容
async function loadContent() {
  if (!contentId.value) return

  loading.value = true

  try {
    await contentStore.fetchContentDetail(contentId.value)
    content.value = contentStore.currentContent

    // 开始播放会话
    if (childStore.currentChild && content.value) {
      const res = await startPlay(childStore.currentChild.id, content.value.id)
      sessionId.value = res.session_id
    }

    // 初始化音频
    audioContext = uni.createInnerAudioContext()
    audioContext.onEnded(() => {
      // 音频播放完成
    })

    // 开始计时
    timeLimitManager.startSession()

    // 定时检查时间限制
    checkTimer = setInterval(checkTimeLimit, 30000)
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
  } finally {
    loading.value = false
  }
}

onLoad((options) => {
  contentId.value = options?.id || ''

  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 20

  if (options?.autoplay === '1') {
    isPlaying.value = true
  }
})

onMounted(() => {
  loadContent()
})

onUnmounted(() => {
  stopAutoPlay()
  if (checkTimer) clearInterval(checkTimer)
  audioContext?.destroy()
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.play-container {
  position: fixed;
  inset: 0;
  background: #1a1a2e;
}

.book-swiper {
  width: 100%;
  height: 100%;
}

.page-content {
  width: 100%;
  height: 100%;
  position: relative;
}

.page-image {
  width: 100%;
  height: 100%;
}

.page-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #2d2d44 0%, #1a1a2e 100%);

  text {
    font-size: 200rpx;
    opacity: 0.3;
  }
}

.page-text-area {
  position: absolute;
  bottom: 200rpx;
  left: 0;
  right: 0;
  padding: $spacing-lg;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
}

.page-text {
  font-size: $font-lg;
  color: $text-white;
  line-height: 1.8;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.5);
}

.interaction-area {
  position: absolute;
  bottom: 350rpx;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity $duration-base;

  &.active {
    opacity: 1;
  }
}

.interaction-btn {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-lg;
  background: $gradient-primary;
  border-radius: $radius-full;
  box-shadow: $shadow-button;
}

.interaction-icon {
  font-size: 32rpx;
}

.interaction-text {
  font-size: $font-base;
  color: $text-white;
  font-weight: $font-medium;
}

// 顶部栏
.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-sm $spacing-md;
  background: linear-gradient(rgba(0, 0, 0, 0.5), transparent);
  z-index: 10;
}

.top-left,
.top-right {
  width: 80rpx;
}

.close-btn,
.child-mode-btn {
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

.book-title {
  font-size: $font-md;
  color: $text-white;
  font-weight: $font-medium;
}

// 底部栏
.bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $spacing-md;
  padding-bottom: calc(#{$spacing-md} + env(safe-area-inset-bottom));
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  z-index: 10;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.progress-bar {
  flex: 1;
  height: 8rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: $radius-full;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: $primary;
  border-radius: $radius-full;
  transition: width $duration-base;
}

.progress-text {
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.8);
  min-width: 80rpx;
  text-align: right;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-lg;
  margin-bottom: $spacing-sm;
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
    font-size: 48rpx;
    color: $text-white;
    line-height: 1;
  }

  &:active {
    background: rgba(255, 255, 255, 0.25);
  }
}

.play-btn {
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $gradient-primary;
  border-radius: 50%;
  box-shadow: $shadow-button;

  text {
    font-size: 40rpx;
    color: $text-white;
  }

  &:active {
    transform: scale(0.95);
  }
}

.time-info {
  text-align: center;
}

.time-remaining {
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.6);
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

// 时间提醒弹窗
.time-warning-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: $spacing-lg;
}

.time-warning-modal {
  width: 100%;
  max-width: 560rpx;
  background: $bg-card;
  border-radius: $radius-xl;
  padding: $spacing-xl $spacing-lg;
  text-align: center;
}

.warning-emoji {
  display: block;
  font-size: 100rpx;
  margin-bottom: $spacing-md;
}

.warning-title {
  display: block;
  font-size: $font-xl;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.warning-desc {
  display: block;
  font-size: $font-base;
  color: $text-secondary;
  margin-bottom: $spacing-lg;
}

.warning-actions {
  display: flex;
  gap: $spacing-sm;
}

.warning-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-lg;

  text {
    font-size: $font-base;
    font-weight: $font-medium;
  }

  &.btn-secondary {
    background: $bg-base;

    text { color: $text-secondary; }
  }

  &.btn-primary {
    background: $gradient-primary;

    text { color: $text-white; }
  }

  &:active {
    transform: scale(0.95);
  }
}
</style>
