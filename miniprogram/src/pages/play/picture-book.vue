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
        <button class="share-btn" open-type="share">
          <text>📤</text>
        </button>
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
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
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
const playHistoryId = ref('')  // 后端返回的 play_history_id
const showInteraction = ref(false)
const playStartTime = ref(0)   // 播放开始时间戳
const lastUpdateTime = ref(0)  // 上次更新进度的时间戳
const UPDATE_INTERVAL = 5000   // 进度更新间隔 5秒

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
const totalPages = computed(() => content.value?.pages?.length || 0)
const progressPercent = computed(() => {
  if (totalPages.value === 0) return 0
  return ((currentPage.value + 1) / totalPages.value) * 100
})
const remainingTime = computed(() => {
  const info = timeLimitManager.getRemainingInfo()
  return timeLimitManager.formatMinutes(info.sessionRemaining)
})

// 标记音频是否已初始化
const audioReady = ref(false)

// 方法
function onPageChange(e: any) {
  currentPage.value = e.detail.current
  // 停止当前播放的音频（如果有）
  stopCurrentAudio()
  playCurrentPageAudio()
  updatePlayProgress()
}

// 安全停止当前音频
function stopCurrentAudio() {
  if (audioContext) {
    try {
      if (audioReady.value) {
        audioContext.pause()
      }
    } catch (e) {
      console.log('[stopCurrentAudio] 暂停失败，忽略')
    }
  }
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
    stopCurrentAudio()
    stopAutoPlay()
  }
}

function playCurrentPageAudio() {
  if (!content.value?.pages?.length) return

  // 清除之前的定时器
  stopAutoPlay()

  const page = content.value.pages[currentPage.value]
  if (!page) return

  if (page.audio_url && isPlaying.value) {
    console.log('[playCurrentPageAudio] 播放音频，页:', currentPage.value, page.audio_url)

    // 销毁旧的音频实例
    if (audioContext) {
      try {
        audioContext.destroy()
      } catch (e) {
        console.log('[playCurrentPageAudio] 销毁旧实例失败，忽略')
      }
      audioContext = null
    }
    audioReady.value = false

    // 延迟创建新实例，确保旧实例完全销毁
    setTimeout(() => {
      if (!isPlaying.value) return  // 如果已暂停，不再创建

      // 【重要】使用 wx.setInnerAudioOption 设置全局音频选项
      // 从微信 2.3.0 开始，innerAudioContext.obeyMuteSwitch 已失效
      // 必须使用此接口才能在 iOS 静音模式下播放声音
      uni.setInnerAudioOption({
        obeyMuteSwitch: false,  // iOS 静音模式下也能播放
        mixWithOther: true      // 可与其他音频混播
      })

      // 创建新的音频实例
      audioContext = uni.createInnerAudioContext()
      audioContext.volume = 1.0

      // 绑定事件 - 必须在设置 src 之前
      audioContext.onPlay(() => {
        console.log('[onPlay] 音频开始播放')
        audioReady.value = true
      })

      audioContext.onEnded(() => {
        console.log('[onEnded] 音频播放完成')
        onAudioEnded()
      })

      audioContext.onError((err: any) => {
        console.error('[audioContext] 音频错误:', err)
        audioReady.value = false
        // 音频错误时使用定时器
        startFallbackTimer()
      })

      // 设置音频源
      // 1. 强制使用 HTTPS（微信小程序真机要求）
      // 2. 使用 encodeURI 处理可能包含中文的 URL
      let audioUrl = page.audio_url!
      if (audioUrl.startsWith('http://')) {
        audioUrl = audioUrl.replace('http://', 'https://')
        console.log('[playCurrentPageAudio] 已将 HTTP 转换为 HTTPS')
      }
      audioContext.src = encodeURI(audioUrl)
      console.log('[playCurrentPageAudio] 已设置 src, 准备播放')

      // 延迟播放，确保 src 设置完成
      setTimeout(() => {
        if (audioContext && isPlaying.value) {
          console.log('[playCurrentPageAudio] 调用 play()')
          audioContext.play()
        }
      }, 100)
    }, 50)
  } else if (!page.audio_url) {
    // 没有音频时，使用定时器翻页
    console.log('[playCurrentPageAudio] 无音频，页:', currentPage.value)
    if (isPlaying.value) {
      startFallbackTimer()
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

// 音频播放完成后自动翻页
function onAudioEnded() {
  console.log('[onAudioEnded] 音频播放完成，当前页:', currentPage.value)
  if (!isPlaying.value) return

  // 延迟一小段时间再翻页，给用户看图的时间
  setTimeout(() => {
    if (currentPage.value < totalPages.value - 1) {
      nextPage()
    } else {
      handleComplete()
    }
  }, 500)
}

// 没有音频时的备用定时器
function startFallbackTimer() {
  stopAutoPlay()

  if (!content.value?.pages?.length) return

  const page = content.value.pages[currentPage.value]
  if (!page) return

  const duration = (page.duration || 5) * 1000

  console.log('[startFallbackTimer] 无音频，使用定时器:', duration, 'ms')

  playTimer = setTimeout(() => {
    if (currentPage.value < totalPages.value - 1) {
      nextPage()
    } else {
      handleComplete()
    }
  }, duration)
}

function startAutoPlay() {
  // 自动播放模式：播放当前页音频
  // 翻页由 onAudioEnded 控制
  playCurrentPageAudio()
}

function stopAutoPlay() {
  if (playTimer) {
    clearTimeout(playTimer)
    playTimer = null
  }
}

async function updatePlayProgress(force = false) {
  if (!playHistoryId.value) return

  // 防抖：5秒内不重复更新（除非强制更新）
  const now = Date.now()
  if (!force && now - lastUpdateTime.value < UPDATE_INTERVAL) return
  lastUpdateTime.value = now

  try {
    const timeSpent = Math.round((now - playStartTime.value) / 1000)
    await updateProgress(
      playHistoryId.value,
      currentPage.value + 1,  // 当前页码 (1-based)
      timeSpent               // 已播放秒数
    )

    // 本地缓存进度（用于离线恢复）
    uni.setStorageSync(`play_progress_${contentId.value}`, {
      page: currentPage.value,
      time: timeSpent,
      updatedAt: now
    })
  } catch (e) {
    console.log('更新进度失败，已本地缓存')
    // 即使后端更新失败，也保存本地缓存
    const timeSpent = Math.round((now - playStartTime.value) / 1000)
    uni.setStorageSync(`play_progress_${contentId.value}`, {
      page: currentPage.value,
      time: timeSpent,
      updatedAt: now
    })
  }
}

async function handleComplete() {
  isPlaying.value = false
  stopAutoPlay()

  if (playHistoryId.value) {
    try {
      await completePlay(playHistoryId.value)
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
  if (!page.interaction || !playHistoryId.value) return

  showInteraction.value = false
  const startTime = Date.now()

  try {
    await submitInteraction({
      play_history_id: playHistoryId.value,
      page_number: pageIndex + 1,
      interaction_type: page.interaction.type,
      response_data: { completed: true },
      response_time_ms: Date.now() - startTime
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
    stopCurrentAudio()

    warningType.value = result.type || 'session'
    warningTitle.value = result.type === 'daily' ? '今日时间到' : '休息时间到'
    warningMessage.value = result.message
    showTimeWarning.value = true
  } else if (result.reminder) {
    isPlaying.value = false
    stopAutoPlay()
    stopCurrentAudio()

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
  stopCurrentAudio()

  timeLimitManager.endSession()
  uni.navigateBack()
}

// 加载内容
async function loadContent() {
  // 如果已经有内容（从生成页面跳转），跳过加载
  if (content.value) return

  if (!contentId.value) return

  loading.value = true

  try {
    console.log('[loadContent] 开始加载内容, contentId:', contentId.value)
    await contentStore.fetchContentDetail(contentId.value)
    content.value = contentStore.currentContent
    console.log('[loadContent] 内容加载成功:', content.value?.title, 'pages:', content.value?.pages?.length)

    // 开始播放会话
    if (childStore.currentChild && content.value) {
      console.log('[loadContent] 开始播放会话, childId:', childStore.currentChild.id)
      try {
        const res = await startPlay(childStore.currentChild.id, content.value.id, 'picture_book')
        playHistoryId.value = res.play_history_id
        playStartTime.value = Date.now()
        console.log('[loadContent] 播放会话创建成功:', res.play_history_id)

        // 断点续播：如果有上次的进度，恢复到那个位置
        if (res.resumed_from && res.resumed_from.page > 0) {
          currentPage.value = res.resumed_from.page - 1  // 转为 0-based index
        }
      } catch (playErr) {
        // 播放会话创建失败不影响内容展示
        console.warn('[loadContent] 播放会话创建失败，继续播放:', playErr)
      }
    } else {
      console.log('[loadContent] 跳过播放会话: currentChild=', !!childStore.currentChild, 'content=', !!content.value)
    }

    // 音频实例会在 playCurrentPageAudio 中按需创建
    // 不需要在这里预先创建

    // 开始计时
    timeLimitManager.startSession()

    // 定时检查时间限制
    checkTimer = setInterval(checkTimeLimit, 30000)
  } catch (e: any) {
    console.error('[loadContent] 加载失败:', e?.message || e)
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

  // 如果是从生成页面跳转过来，直接使用 store 中的内容
  if (options?.fromGenerate === '1') {
    content.value = contentStore.currentContent
    loading.value = false
    // 音频实例会在 playCurrentPageAudio 中按需创建
    // 不在这里预先创建，避免状态问题
    timeLimitManager.startSession()
    checkTimer = setInterval(checkTimeLimit, 30000) as unknown as number
  }
})

onMounted(() => {
  loadContent()
})

// 分享配置
onShareAppMessage(() => {
  return {
    title: content.value?.title || '来看这个有趣的绘本',
    path: `/pages/play/picture-book?id=${contentId.value}`,
    imageUrl: content.value?.cover_url || ''
  }
})

onShareTimeline(() => {
  return {
    title: content.value?.title || '来看这个有趣的绘本',
    query: `id=${contentId.value}`,
    imageUrl: content.value?.cover_url || ''
  }
})

onUnmounted(() => {
  // 强制保存最后进度
  updatePlayProgress(true)

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

.top-left {
  width: 80rpx;
}

.top-right {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
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

.share-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(10px);
  border: none;
  padding: 0;
  margin: 0;
  line-height: 1;

  &::after {
    display: none;  // 移除微信按钮默认边框
  }

  text {
    font-size: 32rpx;
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
