<template>
  <view class="page-container">
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
import type { PictureBook, Video, VideoPage } from '@/api/content'
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
      theme_category: 'habit' // 默认分类
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
  background: $gradient-warm;
  width: 750rpx;
  box-sizing: border-box;
  overflow-x: hidden;
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: $z-sticky;
  background: rgba(255, 249, 240, 0.95);
  backdrop-filter: blur(10px);
  width: 750rpx;
  box-sizing: border-box;
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
}

.main-scroll {
  width: 750rpx;
  padding: $spacing-lg $spacing-md;
  box-sizing: border-box;
}

// 步骤指示器
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-xl;
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
  background: $text-light;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-sm;
  font-weight: $font-bold;
  color: $text-white;
  transition: background $duration-base;

  .active & {
    background: $primary;
  }
}

.step-text {
  font-size: $font-xs;
  color: $text-secondary;
}

.step-line {
  width: 100rpx;
  height: 4rpx;
  background: $text-light;
  margin: 0 $spacing-sm;
  margin-bottom: 32rpx;
  transition: background $duration-base;

  &.active {
    background: $primary;
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
  color: $text-secondary;
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
    color: $text-secondary;
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
  border-radius: $radius-lg;
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
  color: $text-secondary;
  margin-bottom: $spacing-md;
}

.empty-action {
  padding: $spacing-sm $spacing-lg;
  background: $gradient-primary;
  border-radius: $radius-lg;

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
  border-radius: $radius-lg;
  border: 4rpx solid transparent;
  transition: all $duration-base;

  &.selected {
    border-color: $primary;
    background: rgba($primary, 0.05);
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
  background: $bg-base;

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
  background: $success;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 24rpx;
    color: $text-white;
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
  color: $text-secondary;
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
  border-radius: $radius-lg;
  padding: $spacing-md;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  padding: $spacing-sm 0;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.08);

  &:last-child {
    border-bottom: none;
  }
}

.preview-label {
  font-size: $font-base;
  color: $text-secondary;
}

.preview-value {
  font-size: $font-base;
  font-weight: $font-medium;
  color: $text-primary;
}

.preview-tip {
  display: block;
  font-size: $font-xs;
  color: $text-light;
  text-align: center;
  margin-top: $spacing-sm;
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
  background: rgba(255, 249, 240, 0.95);
  backdrop-filter: blur(10px);
}

.generate-btn {
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $gradient-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-button;

  text {
    font-size: $font-md;
    font-weight: $font-bold;
    color: $text-white;
  }

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
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
