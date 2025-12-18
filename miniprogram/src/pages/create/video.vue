<template>
  <view class="page-container">
    <!-- 装饰背景 -->
    <view class="decor-bg">
      <view class="decor-shape shape-1"></view>
      <view class="decor-shape shape-2"></view>
      <view class="decor-shape shape-3"></view>
    </view>

    <!-- 导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="back-btn" @tap="goBack">
          <text>‹</text>
        </view>
        <text class="nav-title">创作视频</text>
        <view class="nav-right"></view>
      </view>
    </view>
    <view class="nav-placeholder" :style="{ height: navHeight + 'px' }"></view>

    <!-- 主内容 -->
    <scroll-view class="main-scroll" scroll-y>
      <!-- 步骤指示器 -->
      <view class="step-indicator">
        <view class="step" :class="{ active: true }">
          <view class="step-dot">1</view>
          <text class="step-text">选择绘本</text>
        </view>
        <view class="step-line" :class="{ active: selectedBook }"></view>
        <view class="step" :class="{ active: selectedBook }">
          <view class="step-dot">2</view>
          <text class="step-text">生成视频</text>
        </view>
      </view>

      <!-- 绘本列表 -->
      <view class="section">
        <text class="section-title">选择要转换的绘本</text>
        <text class="section-desc">将绘本故事转化为精彩动画视频</text>

        <!-- 加载状态 -->
        <view v-if="loading" class="loading-state">
          <text class="loading-icon animate-spin">🔄</text>
          <text>加载中...</text>
        </view>

        <!-- 空状态 -->
        <view v-else-if="pictureBooks.length === 0" class="empty-state">
          <text class="empty-icon">📚</text>
          <text class="empty-title">暂无绘本</text>
          <text class="empty-desc">请先创作一本绘本，再来生成视频</text>
          <view class="empty-action" @tap="goToCreateBook">
            <text>去创作绘本</text>
          </view>
        </view>

        <!-- 绘本列表 -->
        <view v-else class="book-list">
          <view
            v-for="book in pictureBooks"
            :key="book.id"
            class="book-card"
            :class="{ selected: selectedBook?.id === book.id }"
            @tap="selectBook(book)"
          >
            <view class="book-cover">
              <image v-if="book.cover_url" :src="book.cover_url" mode="aspectFill" class="cover-image" />
              <view v-else class="cover-placeholder">
                <text>📖</text>
              </view>
              <view v-if="selectedBook?.id === book.id" class="selected-badge">
                <text>✓</text>
              </view>
            </view>
            <view class="book-info">
              <text class="book-title">{{ book.title }}</text>
              <text class="book-meta">
                <text v-if="loadingDetail && selectedBook?.id === book.id">加载中...</text>
                <text v-else-if="book.pages && book.pages.length > 0">{{ book.pages.length }} 页</text>
                <text v-else-if="selectedBook?.id === book.id">获取详情中...</text>
                <text v-else>{{ formatDuration(book.total_duration) }}</text>
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 视频预览信息 -->
      <view v-if="selectedBook" class="preview-section">
        <text class="preview-title">视频预览</text>
        <view class="preview-card">
          <view class="preview-item">
            <text class="preview-label">绘本标题</text>
            <text class="preview-value">{{ selectedBook.title }}</text>
          </view>
          <view class="preview-item">
            <text class="preview-label">页数</text>
            <text class="preview-value">{{ selectedBook.pages?.length || 0 }} 页</text>
          </view>
          <view class="preview-item">
            <text class="preview-label">预计时长</text>
            <text class="preview-value">约 {{ estimatedDuration }} 秒</text>
          </view>
        </view>

        <!-- 宽高比选择 -->
        <view class="style-section">
          <text class="style-title">
            <text class="title-icon">📐</text>
            画面比例
          </text>
          <view class="aspect-ratio-list">
            <view
              v-for="ratio in aspectRatioOptions"
              :key="ratio.value"
              class="aspect-ratio-item"
              :class="{ active: selectedAspectRatio === ratio.value }"
              @tap="selectedAspectRatio = ratio.value"
            >
              <view class="ratio-preview" :style="{ aspectRatio: ratio.value.replace(':', '/') }"></view>
              <text class="ratio-label">{{ ratio.label }}</text>
              <text v-if="ratio.recommended" class="ratio-badge">推荐</text>
            </view>
          </view>
        </view>

        <!-- 运动模式选择 -->
        <view class="style-section">
          <text class="style-title">
            <text class="title-icon">🎬</text>
            运动模式
          </text>
          <view class="motion-mode-list">
            <view
              v-for="mode in motionModes"
              :key="mode.value"
              class="motion-mode-item"
              :class="{ active: selectedMotionMode === mode.value }"
              @tap="selectedMotionMode = mode.value"
            >
              <view class="mode-info">
                <text class="mode-name">{{ mode.label }}</text>
                <text class="mode-desc">{{ mode.desc }}</text>
              </view>
              <view v-if="mode.recommended" class="mode-badge">推荐</view>
              <view v-if="selectedMotionMode === mode.value" class="mode-check">
                <text>✓</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 分辨率选择 -->
        <view class="style-section">
          <text class="style-title">
            <text class="title-icon">🎞️</text>
            视频分辨率
          </text>
          <view class="resolution-tabs">
            <view
              v-for="res in resolutionOptions"
              :key="res.value"
              class="resolution-tab"
              :class="{ active: selectedResolution === res.value }"
              @tap="selectedResolution = res.value"
            >
              <text class="res-value">{{ res.label }}</text>
              <text v-if="res.note" class="res-note">{{ res.note }}</text>
              <text v-if="res.recommended" class="res-badge">推荐</text>
            </view>
          </view>
        </view>

        <!-- 视频时长选择 -->
        <view class="style-section">
          <text class="style-title">
            <text class="title-icon">⏱️</text>
            视频时长
          </text>
          <view class="duration-tabs">
            <view
              v-for="dur in durationOptions"
              :key="dur.value"
              class="duration-tab"
              :class="{ active: selectedDuration === dur.value }"
              @tap="selectedDuration = dur.value"
            >
              <text class="dur-value">{{ dur.label }}</text>
              <text class="dur-desc">{{ dur.desc }}</text>
            </view>
          </view>
        </view>

        <!-- 音效选择 -->
        <view class="style-section">
          <text class="style-title">
            <text class="title-icon">🔊</text>
            音效设置
          </text>
          <view class="audio-toggle-row">
            <view class="audio-info">
              <text class="audio-label">{{ audioEnabled ? '启用音效' : '静音模式' }}</text>
              <text class="audio-desc">{{ audioEnabled ? 'AI 生成配套环境音效' : '无声视频，适合后期配音' }}</text>
            </view>
            <switch
              :checked="audioEnabled"
              @change="audioEnabled = $event.detail.value"
              color="#FF6B6B"
            />
          </view>
        </view>

        <text class="preview-tip">视频生成需要 1-5 分钟，请耐心等待</text>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder"></view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <view
        class="generate-btn"
        :class="{ disabled: !canGenerate || generating || loadingDetail }"
        @tap="handleGenerate"
      >
        <text>{{ generateBtnText }}</text>
      </view>
    </view>

    <!-- 生成进度 -->
    <GeneratingProgress
      v-if="generating"
      :progress="generateProgress"
      :stage="generatingStage"
      :message="generatingMessage"
      type="video"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { PictureBook, Video, VideoPage, VideoTaskStatus } from '@/api/content'
import { getGeneratedList, getContentDetail, generateVideoAsync, getVideoTaskStatus } from '@/api/content'
import { useChildStore } from '@/stores/child'
import GeneratingProgress from '@/components/GeneratingProgress/GeneratingProgress.vue'

const childStore = useChildStore()

// 状态
const statusBarHeight = ref(20)
const navHeight = ref(88)
const loading = ref(true)
const loadingDetail = ref(false)
const generating = ref(false)
const generateProgress = ref(0)
const generatingStage = ref('')
const generatingMessage = ref('')
const pictureBooks = ref<PictureBook[]>([])
const selectedBook = ref<PictureBook | null>(null)
const currentTaskId = ref<string | null>(null)

// 宽高比选项
const aspectRatioOptions = [
  { value: '16:9', label: '横屏 16:9', desc: '视频、电影', recommended: true },
  { value: '9:16', label: '竖屏 9:16', desc: '手机、短视频' },
  { value: '4:3', label: '横屏 4:3', desc: '传统视频' },
  { value: '3:4', label: '竖屏 3:4', desc: '社交媒体' },
  { value: '1:1', label: '正方形', desc: '微信、Instagram' }
]
const selectedAspectRatio = ref('16:9')

// 分辨率选项
const resolutionOptions = [
  { value: '720P', label: '720P 高清', recommended: true },
  { value: '1080P', label: '1080P 全高清', note: '生成时间更长' }
]
const selectedResolution = ref('720P')

// 时长选项（单片段时长）
const durationOptions = [
  { value: 5, label: '5秒', desc: '快速预览', recommended: true },
  { value: 8, label: '8秒', desc: '标准时长' },
  { value: 10, label: '10秒', desc: '较长动画' },
  { value: 15, label: '15秒', desc: '完整片段' }
]
const selectedDuration = ref(5)

// 运动模式选项
const motionModes = [
  { value: 'static', label: '静态', desc: '几乎无运动，展示静态场景' },
  { value: 'slow', label: '缓慢', desc: '轻微运动，氛围感' },
  { value: 'normal', label: '正常', desc: '自然运动', recommended: true },
  { value: 'dynamic', label: '动态', desc: '较多运动，动作场景' },
  { value: 'cinematic', label: '电影感', desc: '电影级镜头运动' }
]
const selectedMotionMode = ref('normal')

// 音效选项
const audioEnabled = ref(true)

// 格式化时长
function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '点击查看'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  if (mins > 0) {
    return `约${mins}分${secs > 0 ? secs + '秒' : ''}`
  }
  return `约${secs}秒`
}

// 计算属性
const estimatedDuration = computed(() => {
  if (!selectedBook.value?.pages) return 0
  // 每页约 5 秒
  return selectedBook.value.pages.length * 5
})

// 是否可以生成视频
const canGenerate = computed(() => {
  return selectedBook.value &&
         selectedBook.value.pages &&
         selectedBook.value.pages.length > 0
})

// 按钮文字
const generateBtnText = computed(() => {
  if (generating.value) return '生成中...'
  if (loadingDetail.value) return '加载中...'
  if (!selectedBook.value) return '请选择绘本'
  if (!canGenerate.value) return '绘本无内容'
  return '开始生成视频'
})

function goBack() {
  if (generating.value) {
    uni.showModal({
      title: '提示',
      content: '视频正在生成中，确定要离开吗？',
      success: (res) => {
        if (res.confirm) {
          stopPolling()
          generating.value = false
          currentTaskId.value = null
          uni.navigateBack()
        }
      }
    })
  } else {
    uni.navigateBack()
  }
}

function goToCreateBook() {
  uni.navigateTo({ url: '/pages/create/picture-book' })
}

async function selectBook(book: PictureBook) {
  // 如果已经有完整的 pages 数据，直接使用
  if (book.pages && book.pages.length > 0) {
    selectedBook.value = book
    return
  }

  // 否则需要获取完整详情
  loadingDetail.value = true
  try {
    const fullBook = await getContentDetail(book.id)
    selectedBook.value = fullBook

    // 更新列表中的数据
    const index = pictureBooks.value.findIndex(b => b.id === book.id)
    if (index !== -1) {
      pictureBooks.value[index] = fullBook
    }
  } catch (e) {
    console.error('获取绘本详情失败:', e)
    uni.showToast({ title: '获取详情失败', icon: 'none' })
  } finally {
    loadingDetail.value = false
  }
}

async function loadPictureBooks() {
  loading.value = true
  try {
    const result = await getGeneratedList({ type: 'picture_book', limit: 50 })
    pictureBooks.value = result.items || []
  } catch (e) {
    console.error('加载绘本列表失败:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 轮询任务状态
let pollingTimer: number | null = null
let pollErrorCount = 0
const POLL_INTERVAL = 3000  // 3秒轮询一次
const MAX_POLL_ERRORS = 10  // 最大连续错误次数

function stopPolling() {
  if (pollingTimer) {
    clearTimeout(pollingTimer)
    pollingTimer = null
  }
  pollErrorCount = 0
}

async function pollTaskStatus(taskId: string) {
  try {
    const status = await getVideoTaskStatus(taskId)
    console.log('[视频生成] 状态:', status)

    // 重置错误计数
    pollErrorCount = 0

    // 更新进度
    generateProgress.value = status.progress || 0
    generatingStage.value = status.stage || ''
    generatingMessage.value = status.message || ''

    if (status.status === 'completed' && status.result) {
      // 生成完成
      stopPolling()
      generateProgress.value = 100
      generatingStage.value = 'completed'
      generatingMessage.value = '视频生成完成'

      // 保存到临时存储
      uni.setStorageSync('temp_video', status.result)

      // 延迟跳转
      setTimeout(() => {
        generating.value = false
        currentTaskId.value = null
        uni.navigateTo({
          url: `/pages/play/video?id=${status.result!.id}&fromGenerate=1`
        })
      }, 500)
      return
    }

    if (status.status === 'failed') {
      // 生成失败
      stopPolling()
      generating.value = false
      currentTaskId.value = null
      const errMsg = status.error || '视频生成失败'
      uni.showToast({ title: errMsg, icon: 'none', duration: 3000 })
      return
    }

    // 继续轮询
    pollingTimer = setTimeout(() => pollTaskStatus(taskId), POLL_INTERVAL) as unknown as number
  } catch (e: any) {
    console.error('[视频生成] 轮询错误:', e)
    pollErrorCount++

    // 更新提示
    generatingMessage.value = `网络不稳定，正在重试... (${pollErrorCount}/${MAX_POLL_ERRORS})`

    if (pollErrorCount >= MAX_POLL_ERRORS) {
      // 超过最大错误次数
      stopPolling()
      generating.value = false
      currentTaskId.value = null
      uni.showModal({
        title: '网络异常',
        content: '轮询超时次数过多，请检查网络后重试。任务可能仍在后台运行。',
        showCancel: false
      })
      return
    }

    // 网络错误时继续轮询，延长间隔
    const retryInterval = POLL_INTERVAL + pollErrorCount * 1000  // 逐渐延长
    pollingTimer = setTimeout(() => pollTaskStatus(taskId), retryInterval) as unknown as number
  }
}

async function handleGenerate() {
  if (!canGenerate.value || generating.value || loadingDetail.value) return

  const child = childStore.currentChild
  if (!child) {
    uni.showToast({ title: '请先添加宝贝信息', icon: 'none' })
    return
  }

  // 验证绘本有内容
  if (!selectedBook.value?.pages || selectedBook.value.pages.length === 0) {
    uni.showToast({ title: '绘本内容为空，无法生成视频', icon: 'none' })
    return
  }

  generating.value = true
  generateProgress.value = 0
  generatingStage.value = 'init'
  generatingMessage.value = '正在提交任务...'

  try {
    // 准备参数
    const pages: VideoPage[] = (selectedBook.value.pages || []).map((page, index) => ({
      page_num: index + 1,
      text: page.text,
      image_url: page.image_url,
      audio_url: page.audio_url
    }))

    const params = {
      picture_book: {
        title: selectedBook.value.title,
        pages
      },
      child_name: child.name,
      theme_topic: selectedBook.value.theme_topic || '',
      theme_category: 'habit', // 默认分类
      // 新视频配置参数
      aspect_ratio: selectedAspectRatio.value,
      resolution: selectedResolution.value,
      duration_seconds: selectedDuration.value,
      motion_mode: selectedMotionMode.value,
      enable_audio: audioEnabled.value
    }

    // 提交异步任务
    const response = await generateVideoAsync(params)
    console.log('[视频生成] 任务已提交:', response.task_id)

    currentTaskId.value = response.task_id
    generatingMessage.value = '任务已提交，正在生成...'

    // 开始轮询
    pollTaskStatus(response.task_id)

  } catch (e: any) {
    console.error('提交视频任务失败:', e)
    generating.value = false
    currentTaskId.value = null

    const errMsg = e?.message || '提交失败，请重试'
    uni.showToast({ title: errMsg, icon: 'none', duration: 3000 })
  }
}

onLoad(() => {
  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 20
  navHeight.value = statusBarHeight.value + 44
})

onMounted(() => {
  loadPictureBooks()
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page-container {
  min-height: 100vh;
  background: $bg-cream;
  width: 750rpx;
  box-sizing: border-box;
  overflow-x: hidden;
  position: relative;
}

// 装饰背景 - 温暖花园主题
.decor-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 750rpx;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.decor-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.12;
}

.shape-1 {
  width: 300rpx;
  height: 300rpx;
  background: radial-gradient(circle, $video-primary 0%, transparent 70%);
  top: -80rpx;
  right: -60rpx;
  animation: floatDecor 15s ease-in-out infinite;
}

.shape-2 {
  width: 200rpx;
  height: 200rpx;
  background: radial-gradient(circle, $song-primary 0%, transparent 70%);
  bottom: 30%;
  left: -40rpx;
  animation: floatDecor 18s ease-in-out infinite reverse;
}

.shape-3 {
  width: 150rpx;
  height: 150rpx;
  background: radial-gradient(circle, $book-primary 0%, transparent 70%);
  top: 40%;
  right: -30rpx;
  animation: floatDecor 20s ease-in-out infinite 2s;
}

@keyframes floatDecor {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20rpx, -15rpx) scale(1.05); }
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: $z-sticky;
  background: rgba($bg-card, 0.95);
  width: 750rpx;
  box-sizing: border-box;
  border-bottom: 1rpx solid $border-light;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 $spacing-md;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-card;
  border: 1rpx solid $border-light;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;

  text {
    font-size: 48rpx;
    color: $text-primary;
    line-height: 1;
  }
}

.nav-title {
  font-size: $font-md;
  font-weight: $font-semibold;
  color: $text-primary;
}

.nav-right {
  width: 64rpx;
}

.nav-placeholder {
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.main-scroll {
  width: 750rpx;
  padding: $spacing-lg $spacing-md;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

// 步骤指示器
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-xl;
  background: $bg-card;
  border: 1rpx solid $border-light;
  border-radius: $radius-lg;
  padding: $spacing-md;
  box-shadow: $shadow-card;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  opacity: 0.5;
  transition: opacity $duration-base;

  &.active {
    opacity: 1;
  }
}

.step-dot {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: $border-light;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-sm;
  font-weight: $font-bold;
  color: $text-tertiary;
  transition: all $duration-base;

  .active & {
    background: $video-primary;
    color: $text-white;
    box-shadow: $shadow-colored-video;
  }
}

.step-text {
  font-size: $font-xs;
  color: $text-tertiary;

  .active & {
    color: $text-primary;
  }
}

.step-line {
  width: 100rpx;
  height: 4rpx;
  background: $border-light;
  margin: 0 $spacing-sm;
  margin-bottom: 32rpx;
  transition: background $duration-base;
  border-radius: 2rpx;

  &.active {
    background: $video-primary;
  }
}

// 区块
.section {
  margin-bottom: $spacing-xl;
}

.section-title {
  display: block;
  font-size: $font-lg;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.section-desc {
  display: block;
  font-size: $font-sm;
  color: $text-tertiary;
  margin-bottom: $spacing-md;
}

// 加载状态
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xl;
  gap: $spacing-sm;

  text {
    font-size: $font-base;
    color: $text-tertiary;
  }
}

.loading-icon {
  font-size: 48rpx;
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xl;
  background: $bg-card;
  border: 1rpx solid $border-light;
  border-radius: $radius-lg;
  box-shadow: $shadow-card;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: $spacing-sm;
}

.empty-title {
  font-size: $font-md;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.empty-desc {
  font-size: $font-sm;
  color: $text-tertiary;
  margin-bottom: $spacing-md;
}

.empty-action {
  padding: $spacing-sm $spacing-lg;
  background: $video-gradient;
  border-radius: $radius-lg;
  box-shadow: $shadow-colored-video;

  text {
    font-size: $font-base;
    font-weight: $font-semibold;
    color: $text-white;
  }

  &:active {
    transform: scale(0.95);
  }
}

// 绘本列表
.book-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.book-card {
  display: flex;
  gap: $spacing-md;
  padding: $spacing-md;
  background: $bg-card;
  border: 1rpx solid $border-light;
  border-radius: $radius-lg;
  transition: all $duration-base;
  box-shadow: $shadow-card;

  &.selected {
    border-color: $video-primary;
    background: rgba($video-primary, 0.08);
    box-shadow: $shadow-colored-video;
  }

  &:active {
    transform: scale(0.98);
  }
}

.book-cover {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: $radius-md;
  overflow: hidden;
  flex-shrink: 0;
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
  background: $bg-soft;

  text {
    font-size: 64rpx;
  }
}

.selected-badge {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: $video-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-colored-video;

  text {
    font-size: 24rpx;
    color: $text-white;
    font-weight: $font-bold;
  }
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: $spacing-xs;
}

.book-title {
  font-size: $font-md;
  font-weight: $font-semibold;
  color: $text-primary;
}

.book-meta {
  font-size: $font-sm;
  color: $text-tertiary;
}

// 预览区块
.preview-section {
  margin-bottom: $spacing-xl;
}

.preview-title {
  display: block;
  font-size: $font-md;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.preview-card {
  background: $bg-card;
  border: 1rpx solid $border-light;
  border-radius: $radius-lg;
  padding: $spacing-md;
  box-shadow: $shadow-card;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  padding: $spacing-sm 0;
  border-bottom: 1rpx solid $border-light;

  &:last-child {
    border-bottom: none;
  }
}

.preview-label {
  font-size: $font-base;
  color: $text-tertiary;
}

.preview-value {
  font-size: $font-base;
  font-weight: $font-medium;
  color: $text-primary;
}

.preview-tip {
  display: block;
  font-size: $font-xs;
  color: $text-tertiary;
  text-align: center;
  margin-top: $spacing-sm;
}

// 风格选择区块
.style-section {
  margin-top: $spacing-lg;
}

.style-title {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: $spacing-md;

  .title-icon {
    font-size: $font-md;
  }
}

// 宽高比选择
.aspect-ratio-list {
  display: flex;
  gap: $spacing-xs;
  flex-wrap: wrap;
}

.aspect-ratio-item {
  flex: 1;
  min-width: 120rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-sm;
  background: $bg-card;
  border: 1rpx solid $border-light;
  border-radius: $radius-md;
  transition: all $duration-base;
  position: relative;
  box-shadow: $shadow-sm;

  &.active {
    border-color: $video-primary;
    background: rgba($video-primary, 0.08);
    box-shadow: $shadow-colored-video;
  }

  &:active {
    transform: scale(0.96);
  }
}

.ratio-preview {
  width: 48rpx;
  max-height: 48rpx;
  background: linear-gradient(135deg, rgba($video-primary, 0.3), rgba($video-primary, 0.1));
  border: 2rpx solid rgba($video-primary, 0.5);
  border-radius: $radius-xs;
}

.ratio-label {
  font-size: $font-xs;
  font-weight: $font-medium;
  color: $text-primary;
  text-align: center;
}

.ratio-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  padding: 4rpx 10rpx;
  background: $video-primary;
  border-radius: $radius-sm;
  font-size: 18rpx;
  color: $text-white;
  font-weight: $font-medium;
}

// 运动模式选择
.motion-mode-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.motion-mode-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: $bg-card;
  border: 1rpx solid $border-light;
  border-radius: $radius-md;
  transition: all $duration-base;
  position: relative;
  box-shadow: $shadow-sm;

  &.active {
    border-color: $video-primary;
    background: rgba($video-primary, 0.08);
    box-shadow: $shadow-colored-video;
  }

  &:active {
    transform: scale(0.98);
  }
}

.mode-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.mode-name {
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $text-primary;
}

.mode-desc {
  font-size: $font-xs;
  color: $text-tertiary;
  line-height: 1.4;
}

.mode-badge {
  padding: 4rpx 12rpx;
  background: rgba($video-primary, 0.15);
  border-radius: $radius-sm;
  font-size: 20rpx;
  color: $video-primary;
  font-weight: $font-medium;
}

.mode-check {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: $video-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: $shadow-colored-video;

  text {
    font-size: 24rpx;
    color: $text-white;
    font-weight: $font-bold;
  }
}

// 分辨率选择（Tab 样式）
.resolution-tabs {
  display: flex;
  gap: $spacing-sm;
}

.resolution-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  padding: $spacing-md;
  background: $bg-card;
  border: 1rpx solid $border-light;
  border-radius: $radius-md;
  transition: all $duration-base;
  position: relative;
  box-shadow: $shadow-sm;

  &.active {
    border-color: $video-primary;
    background: rgba($video-primary, 0.08);
    box-shadow: $shadow-colored-video;

    .res-value {
      color: $video-primary;
    }
  }

  &:active {
    transform: scale(0.96);
  }
}

.res-value {
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $text-primary;
  transition: color $duration-base;
}

.res-note {
  font-size: 20rpx;
  color: $text-tertiary;
}

.res-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  padding: 4rpx 12rpx;
  background: $video-primary;
  border-radius: $radius-sm;
  font-size: 20rpx;
  color: $text-white;
  font-weight: $font-medium;
}

// 时长选择
.duration-tabs {
  display: flex;
  gap: $spacing-xs;
  background: $bg-soft;
  padding: $spacing-xs;
  border-radius: $radius-md;
  border: 1rpx solid $border-light;
}

.duration-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  padding: $spacing-sm $spacing-xs;
  border-radius: $radius-sm;
  transition: all $duration-base;

  &.active {
    background: rgba($video-primary, 0.12);
    box-shadow: $shadow-sm;

    .dur-value {
      color: $video-primary;
    }
  }

  &:active {
    transform: scale(0.96);
  }
}

.dur-value {
  font-size: $font-sm;
  font-weight: $font-semibold;
  color: $text-primary;
  transition: color $duration-base;
}

.dur-desc {
  font-size: 20rpx;
  color: $text-tertiary;
}

// 音效开关
.audio-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md;
  background: $bg-card;
  border: 1rpx solid $border-light;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;
}

.audio-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.audio-label {
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $text-primary;
}

.audio-desc {
  font-size: $font-xs;
  color: $text-tertiary;
}

// 底部
.bottom-placeholder {
  height: 160rpx;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: $spacing-md;
  padding-bottom: calc(#{$spacing-md} + env(safe-area-inset-bottom));
  background: rgba($bg-card, 0.98);
  border-top: 1rpx solid $border-light;
  z-index: $z-sticky;
}

.generate-btn {
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $video-gradient;
  border-radius: $radius-lg;
  box-shadow: $shadow-colored-video;

  text {
    font-size: $font-md;
    font-weight: $font-bold;
    color: $text-white;
  }

  &.disabled {
    background: $border-light;
    box-shadow: none;

    text {
      color: $text-tertiary;
    }
  }

  &:active:not(.disabled) {
    transform: scale(0.98);
  }
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
