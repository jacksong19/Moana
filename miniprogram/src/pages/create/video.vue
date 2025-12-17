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

        <!-- 动效风格选择 -->
        <view class="style-section">
          <text class="style-title">
            <text class="title-icon">🎬</text>
            动效风格
          </text>
          <view class="motion-style-carousel">
            <view
              v-for="style in motionStyles"
              :key="style.value"
              class="motion-card"
              :class="{ active: selectedMotionStyle === style.value }"
              @tap="selectedMotionStyle = style.value"
            >
              <view class="motion-preview" :class="style.value">
                <view class="preview-element element-1"></view>
                <view class="preview-element element-2"></view>
                <view class="preview-element element-3"></view>
              </view>
              <view class="motion-info">
                <text class="motion-name">{{ style.label }}</text>
                <text class="motion-desc">{{ style.desc }}</text>
              </view>
              <view v-if="selectedMotionStyle === style.value" class="motion-check">
                <text>✓</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 分辨率选择 -->
        <view class="style-section">
          <text class="style-title">
            <text class="title-icon">📐</text>
            视频分辨率
          </text>
          <view class="resolution-list">
            <view
              v-for="res in resolutionOptions"
              :key="res.value"
              class="resolution-item"
              :class="{ active: selectedResolution === res.value }"
              @tap="selectedResolution = res.value"
            >
              <view class="res-ratio" :style="{ aspectRatio: res.ratio }"></view>
              <text class="res-label">{{ res.label }}</text>
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

        <!-- 镜头类型选择 -->
        <view class="style-section">
          <text class="style-title">
            <text class="title-icon">🎥</text>
            镜头类型
          </text>
          <view class="shot-type-grid">
            <view
              v-for="shot in shotTypeOptions"
              :key="shot.value"
              class="shot-type-item"
              :class="{ active: selectedShotType === shot.value }"
              @tap="selectedShotType = shot.value"
            >
              <text class="shot-icon">{{ shot.icon }}</text>
              <text class="shot-label">{{ shot.label }}</text>
            </view>
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
    <GeneratingProgress v-if="generating" :progress="generateProgress" type="video" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { PictureBook, Video, VideoPage, MotionStyle } from '@/api/content'
import { getGeneratedList, getContentDetail, generateVideo } from '@/api/content'
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
const pictureBooks = ref<PictureBook[]>([])
const selectedBook = ref<PictureBook | null>(null)

// 动效风格选项
const motionStyles = [
  { value: 'gentle' as MotionStyle, label: '柔和流动', desc: '轻柔缓慢的过渡动画，适合睡前故事' },
  { value: 'dynamic' as MotionStyle, label: '活泼跳跃', desc: '生动明快的动态效果，适合冒险故事' },
  { value: 'static' as MotionStyle, label: '静态展示', desc: '稳定优雅的图片展示，专注画面欣赏' }
]
const selectedMotionStyle = ref<MotionStyle>('gentle')

// 分辨率选项
const resolutionOptions = [
  { value: '720p', label: '720P', ratio: '16/9', recommended: false },
  { value: '1080p', label: '1080P', ratio: '16/9', recommended: true },
  { value: '9:16', label: '竖屏', ratio: '9/16', recommended: false }
]
const selectedResolution = ref('1080p')

// 时长选项
const durationOptions = [
  { value: 'auto', label: '自动', desc: '根据内容' },
  { value: '30s', label: '30秒', desc: '精简版' },
  { value: '60s', label: '60秒', desc: '标准版' },
  { value: '90s', label: '90秒', desc: '完整版' }
]
const selectedDuration = ref('auto')

// 镜头类型选项
const shotTypeOptions = [
  { value: 'zoom', label: '缩放', icon: '🔍' },
  { value: 'pan', label: '平移', icon: '↔️' },
  { value: 'fade', label: '淡入淡出', icon: '🌓' },
  { value: 'mixed', label: '混合', icon: '🎭' }
]
const selectedShotType = ref('mixed')

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

// 模拟进度
let progressTimer: number | null = null

function startProgressSimulation() {
  generateProgress.value = 0
  progressTimer = setInterval(() => {
    if (generateProgress.value < 90) {
      // 缓慢增长到 90%
      const increment = Math.random() * 2 + 0.5
      generateProgress.value = Math.min(90, generateProgress.value + increment)
    }
  }, 1000)
}

function stopProgressSimulation() {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
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
  startProgressSimulation()

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
      motion_style: selectedMotionStyle.value
    }

    const video = await generateVideo(params)

    // 完成进度
    stopProgressSimulation()
    generateProgress.value = 100

    // 保存到临时存储，供播放页使用
    uni.setStorageSync('temp_video', video)

    // 延迟跳转
    setTimeout(() => {
      generating.value = false
      uni.navigateTo({
        url: `/pages/play/video?id=${video.id}&fromGenerate=1`
      })
    }, 500)

  } catch (e: any) {
    console.error('生成视频失败:', e)
    stopProgressSimulation()
    generating.value = false

    const errMsg = e?.message || '生成失败，请重试'
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

// 动效风格卡片轮播
.motion-style-carousel {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.motion-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: $bg-card;
  border: 1rpx solid $border-light;
  border-radius: $radius-lg;
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

.motion-preview {
  width: 120rpx;
  height: 80rpx;
  border-radius: $radius-sm;
  background: linear-gradient(135deg, rgba($video-primary, 0.12), rgba($video-primary, 0.04));
  position: relative;
  overflow: hidden;
  flex-shrink: 0;

  .preview-element {
    position: absolute;
    border-radius: $radius-xs;
    background: $video-primary;
  }

  &.gentle {
    .element-1 {
      width: 40rpx;
      height: 40rpx;
      top: 20rpx;
      left: 20rpx;
      animation: gentleFloat 3s ease-in-out infinite;
    }
    .element-2 {
      width: 24rpx;
      height: 24rpx;
      top: 30rpx;
      right: 20rpx;
      animation: gentleFloat 3s ease-in-out infinite 0.5s;
      opacity: 0.7;
    }
    .element-3 {
      width: 16rpx;
      height: 16rpx;
      bottom: 15rpx;
      left: 50rpx;
      animation: gentleFloat 3s ease-in-out infinite 1s;
      opacity: 0.5;
    }
  }

  &.dynamic {
    .element-1 {
      width: 30rpx;
      height: 30rpx;
      top: 25rpx;
      left: 15rpx;
      animation: dynamicBounce 0.8s ease-in-out infinite;
    }
    .element-2 {
      width: 24rpx;
      height: 24rpx;
      top: 20rpx;
      left: 55rpx;
      animation: dynamicBounce 0.8s ease-in-out infinite 0.2s;
      opacity: 0.8;
    }
    .element-3 {
      width: 20rpx;
      height: 20rpx;
      top: 30rpx;
      right: 15rpx;
      animation: dynamicBounce 0.8s ease-in-out infinite 0.4s;
      opacity: 0.6;
    }
  }

  &.static {
    .element-1 {
      width: 50rpx;
      height: 35rpx;
      top: 22rpx;
      left: 35rpx;
      opacity: 0.9;
    }
    .element-2, .element-3 {
      display: none;
    }
  }
}

@keyframes gentleFloat {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-8rpx) scale(1.05); }
}

@keyframes dynamicBounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-15rpx) scale(1.15); }
}

.motion-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.motion-name {
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $text-primary;
}

.motion-desc {
  font-size: $font-xs;
  color: $text-tertiary;
  line-height: 1.4;
}

.motion-check {
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

// 分辨率选择
.resolution-list {
  display: flex;
  gap: $spacing-sm;
}

.resolution-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-md $spacing-sm;
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

.res-ratio {
  width: 60rpx;
  max-height: 50rpx;
  background: linear-gradient(135deg, rgba($video-primary, 0.3), rgba($video-primary, 0.1));
  border: 2rpx solid rgba($video-primary, 0.5);
  border-radius: $radius-xs;
}

.res-label {
  font-size: $font-sm;
  font-weight: $font-semibold;
  color: $text-primary;
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

// 镜头类型选择
.shot-type-grid {
  display: flex;
  gap: $spacing-sm;
}

.shot-type-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-md $spacing-sm;
  background: $bg-card;
  border: 1rpx solid $border-light;
  border-radius: $radius-md;
  transition: all $duration-base;
  box-shadow: $shadow-sm;

  &.active {
    border-color: $video-primary;
    background: rgba($video-primary, 0.08);
    box-shadow: $shadow-colored-video;

    .shot-icon {
      transform: scale(1.1);
    }
  }

  &:active {
    transform: scale(0.96);
  }
}

.shot-icon {
  font-size: 36rpx;
  transition: transform $duration-base;
}

.shot-label {
  font-size: $font-xs;
  font-weight: $font-medium;
  color: $text-primary;
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
