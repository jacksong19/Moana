<template>
  <view class="page-container">
    <!-- 装饰背景 -->
    <view class="decor-bg">
      <view class="decor-shape shape-1"></view>
      <view class="decor-shape shape-2"></view>
      <view class="decor-shape shape-3"></view>
    </view>

    <!-- 自定义导航栏 -->
    <view class="nav-bar">
      <view class="nav-title">
        <text class="title-icon">📚</text>
        <text class="title-text">内容库</text>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view
        v-for="filter in filters"
        :key="filter.value"
        class="filter-item"
        :class="{ active: currentFilter === filter.value, [`filter-${filter.value}`]: true }"
        @tap="currentFilter = filter.value"
      >
        <text class="filter-icon">{{ filter.icon }}</text>
        <text class="filter-name">{{ filter.name }}</text>
      </view>
    </view>

    <!-- 内容列表 -->
    <scroll-view
      class="content-scroll"
      scroll-y
      @scrolltolower="loadMore"
    >
      <!-- 骨架屏加载状态 -->
      <view v-if="loading && contentList.length === 0" class="skeleton-grid">
        <SkeletonCard v-for="i in 4" :key="i" type="vertical" />
      </view>

      <view v-else-if="contentList.length === 0" class="empty-state">
        <view class="empty-illustration">
          <text class="empty-icon">📚</text>
        </view>
        <text class="empty-title">还没有内容</text>
        <text class="empty-desc">去创作中心生成第一个绘本吧</text>
        <view class="empty-btn" @tap="goToCreate">
          <text>✨ 开始创作</text>
        </view>
      </view>

      <view v-else class="content-grid">
        <view
          v-for="item in contentList"
          :key="item.id"
          class="content-card"
          :class="'card-' + (item.content_type || 'picture_book')"
          @tap="goToDetail(item)"
          @longpress="showActionSheet(item)"
        >
          <view class="card-cover">
            <!-- 绘本类型：图片轮播预览 -->
            <swiper
              v-if="(item as any).content_type === 'picture_book' && item.pages && item.pages.length > 1"
              class="cover-swiper"
              :autoplay="true"
              :interval="2000"
              :duration="500"
              :circular="true"
              :indicator-dots="false"
            >
              <swiper-item v-for="(page, pageIndex) in item.pages" :key="pageIndex">
                <image :src="page.image_url" mode="aspectFill" class="swiper-img" />
              </swiper-item>
            </swiper>
            <!-- 视频类型：无声自动播放预览 -->
            <video
              v-else-if="(item as any).content_type === 'video' && (item as any).video_url"
              :src="(item as any).video_url"
              :autoplay="true"
              :loop="true"
              :muted="true"
              :controls="false"
              :show-play-btn="false"
              :show-center-play-btn="false"
              :show-fullscreen-btn="false"
              :show-progress="false"
              :enable-progress-gesture="false"
              object-fit="cover"
              class="cover-video"
              @error="(e: any) => console.error('[video preview] 加载失败:', item.title, e)"
            />
            <!-- 其他类型或无详情：显示封面图 -->
            <image
              v-else-if="item.cover_url"
              :src="item.cover_url"
              mode="aspectFill"
              class="cover-img"
            />
            <!-- 无封面：显示占位符 -->
            <view v-else class="cover-placeholder">
              <text>{{ getTypeIcon((item as any).content_type) }}</text>
            </view>
            <view class="card-type-badge">
              <text>{{ getTypeLabel((item as any).content_type) }}</text>
            </view>
            <view class="play-btn" @tap.stop="goToPlay(item)">
              <text>▶</text>
            </view>
          </view>
          <view class="card-info">
            <text class="card-title">{{ item.title }}</text>
            <view class="card-meta">
              <text v-if="item.personalization?.child_name" class="meta-child">👶 {{ item.personalization.child_name }}</text>
              <text class="meta-time">{{ formatTime(item.created_at) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="loading && contentList.length > 0" class="loading-more">
        <view class="loading-dot"></view>
        <text>加载更多...</text>
      </view>

      <view v-if="!hasMore && contentList.length > 0" class="no-more">
        <view class="no-more-line"></view>
        <text>已经到底啦</text>
        <view class="no-more-line"></view>
      </view>

      <!-- 底部安全区 -->
      <view class="safe-bottom"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useContentStore } from '@/stores/content'
import { getContentDetail, type PictureBook } from '@/api/content'
import SkeletonCard from '@/components/SkeletonCard/SkeletonCard.vue'

const contentStore = useContentStore()

const filters = [
  { name: '全部', value: 'all', icon: '🌟' },
  { name: '绘本', value: 'picture_book', icon: '📚' },
  { name: '儿歌', value: 'nursery_rhyme', icon: '🎵' },
  { name: '视频', value: 'video', icon: '🎬' }
]

const currentFilter = ref('all')
const loading = ref(false)
const hasMore = ref(true)

const contentList = computed(() => {
  if (currentFilter.value === 'all') {
    return contentStore.generatedList
  }
  return contentStore.generatedList.filter(
    item => (item as any).content_type === currentFilter.value
  )
})

function getTypeIcon(type: string) {
  const icons: Record<string, string> = {
    picture_book: '📚',
    nursery_rhyme: '🎵',
    video: '🎬'
  }
  return icons[type] || '📚'
}

function getTypeLabel(type: string) {
  const labels: Record<string, string> = {
    picture_book: '绘本',
    nursery_rhyme: '儿歌',
    video: '视频'
  }
  return labels[type] || '绘本'
}

function formatTime(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return `${date.getMonth() + 1}/${date.getDate()}`
}

async function loadData(refresh = false) {
  if (loading.value) return

  loading.value = true
  try {
    await contentStore.fetchGeneratedList(refresh)
    hasMore.value = contentStore.generatedList.length >= 20

    // 获取绘本详情用于轮播预览（视频已由列表接口返回 video_url）
    await fetchPictureBookDetails()
  } catch (e) {
    console.error('加载失败:', e)
  } finally {
    loading.value = false
  }
}

// 获取绘本详情（列表接口不返回 pages，用于轮播预览）
async function fetchPictureBookDetails() {
  // 只获取绘本的详情（视频已由列表接口返回 video_url）
  const pictureBooks = contentStore.generatedList.filter((item: any) =>
    item.content_type === 'picture_book' && (!item.pages || item.pages.length === 0)
  )

  if (pictureBooks.length === 0) return

  // 并行获取所有绘本详情
  const detailPromises = pictureBooks.map(async (book) => {
    try {
      const detail = await getContentDetail(book.id)
      const index = contentStore.generatedList.findIndex(item => item.id === book.id)
      if (index !== -1) {
        contentStore.generatedList[index] = { ...contentStore.generatedList[index], ...detail }
      }
    } catch (e) {
      console.error('[library] 获取绘本详情失败:', book.title, e)
    }
  })

  await Promise.all(detailPromises)
}

function loadMore() {
  if (!hasMore.value || loading.value) return
  // 加载更多逻辑
}

function goToCreate() {
  uni.switchTab({ url: '/pages/create/index' })
}

function goToDetail(item: PictureBook) {
  const contentType = (item as any).content_type
  if (contentType === 'nursery_rhyme') {
    uni.navigateTo({ url: `/pages/play/nursery-rhyme?id=${item.id}` })
  } else if (contentType === 'video') {
    uni.navigateTo({ url: `/pages/play/video?id=${item.id}` })
  } else {
    uni.navigateTo({ url: `/pages/play/picture-book?id=${item.id}` })
  }
}

function goToPlay(item: PictureBook) {
  const contentType = (item as any).content_type
  if (contentType === 'nursery_rhyme') {
    uni.navigateTo({ url: `/pages/play/nursery-rhyme?id=${item.id}&autoplay=1` })
  } else if (contentType === 'video') {
    uni.navigateTo({ url: `/pages/play/video?id=${item.id}` })
  } else {
    uni.navigateTo({ url: `/pages/play/picture-book?id=${item.id}&autoplay=1` })
  }
}

function showActionSheet(item: PictureBook) {
  uni.showActionSheet({
    itemList: ['删除'],
    itemColor: '#E85D4A',
    success: (res) => {
      if (res.tapIndex === 0) {
        confirmDelete(item)
      }
    }
  })
}

function confirmDelete(item: PictureBook) {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除「${item.title}」吗？删除后无法恢复。`,
    confirmColor: '#E85D4A',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '删除中...' })
          await contentStore.removeContent(item.id)
          uni.hideLoading()
          uni.showToast({ title: '删除成功', icon: 'success' })
        } catch (e) {
          uni.hideLoading()
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

watch(currentFilter, () => {
  // 筛选变化时可以重新加载
})

onShow(() => {
  loadData(true)
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page-container {
  min-height: 100vh;
  background: $bg-cream;
  display: flex;
  flex-direction: column;
  width: 750rpx;
  overflow: hidden;
  position: relative;
}

// === 装饰背景 ===
.decor-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.decor-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.4;

  &.shape-1 {
    width: 300rpx;
    height: 300rpx;
    background: $book-light;
    top: -100rpx;
    right: -80rpx;
  }

  &.shape-2 {
    width: 200rpx;
    height: 200rpx;
    background: $song-light;
    bottom: 300rpx;
    left: -60rpx;
  }

  &.shape-3 {
    width: 150rpx;
    height: 150rpx;
    background: $video-light;
    bottom: 150rpx;
    right: 40rpx;
  }
}

// === 导航栏 ===
.nav-bar {
  position: relative;
  z-index: 10;
  padding: calc(env(safe-area-inset-top) + 80rpx) 32rpx 20rpx;
}

.nav-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.title-icon {
  font-size: 36rpx;
}

.title-text {
  font-size: $font-xl;
  font-weight: 700;
  color: $text-primary;
}

// === 筛选栏 ===
.filter-bar {
  position: relative;
  z-index: 10;
  display: flex;
  gap: 16rpx;
  padding: 16rpx 32rpx;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 14rpx 24rpx;
  background: $bg-card;
  border: 1rpx solid $border-light;
  border-radius: $radius-full;
  box-shadow: $shadow-sm;
  transition: all $duration-base $ease-out;

  &.active {
    border-color: $primary;
    background: rgba($primary, 0.08);

    .filter-name {
      color: $primary;
      font-weight: $font-medium;
    }
  }

  &.filter-picture_book.active {
    border-color: $book-primary;
    background: rgba($book-primary, 0.08);
    .filter-name { color: $book-primary; }
  }

  &.filter-nursery_rhyme.active {
    border-color: $song-primary;
    background: rgba($song-primary, 0.08);
    .filter-name { color: $song-primary; }
  }

  &.filter-video.active {
    border-color: $video-primary;
    background: rgba($video-primary, 0.08);
    .filter-name { color: $video-primary; }
  }
}

.filter-icon {
  font-size: 24rpx;
}

.filter-name {
  font-size: 26rpx;
  color: $text-secondary;
  transition: color $duration-base $ease-out;
}

// === 内容滚动区 ===
.content-scroll {
  flex: 1;
  position: relative;
  z-index: 1;
  padding: 16rpx 32rpx;
  width: 750rpx;
  box-sizing: border-box;
}

// === 内容网格 ===
.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.content-card {
  position: relative;
  background: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-card;
  transition: transform $duration-base $ease-out, box-shadow $duration-base $ease-out;

  &:active {
    transform: scale(0.97);
    box-shadow: $shadow-sm;
  }

  &.card-picture_book {
    .card-type-badge { background: $book-primary; }
    .play-btn { background: $book-gradient; }
  }

  &.card-nursery_rhyme {
    .card-type-badge { background: $song-primary; }
    .play-btn { background: $song-gradient; }
  }

  &.card-video {
    .card-type-badge { background: $video-primary; }
    .play-btn { background: $video-gradient; }
  }
}

.card-cover {
  position: relative;
  width: 100%;
  height: 200rpx;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 200rpx;
  pointer-events: none; // 防止点击视频触发控件
}

.cover-swiper {
  width: 100%;
  height: 200rpx;
}

.swiper-img {
  width: 100%;
  height: 100%;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $gradient-dreamy;

  text {
    font-size: 56rpx;
  }
}

.card-type-badge {
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  padding: 6rpx 14rpx;
  border-radius: $radius-sm;

  text {
    font-size: 20rpx;
    color: $text-white;
    font-weight: $font-medium;
  }
}

.play-btn {
  position: absolute;
  bottom: 12rpx;
  right: 12rpx;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-md;

  text {
    font-size: 20rpx;
    color: $text-white;
    margin-left: 4rpx;
  }

  &:active {
    transform: scale(0.9);
  }
}

.card-info {
  padding: 16rpx;
}

.card-title {
  display: block;
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 8rpx;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.meta-child {
  font-size: $font-xs;
  color: $text-secondary;
}

.meta-time {
  font-size: $font-xs;
  color: $text-tertiary;
}

// === 骨架屏加载状态 ===
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

// === 空状态 ===
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 150rpx 48rpx;
}

.empty-illustration {
  width: 160rpx;
  height: 160rpx;
  background: $gradient-dreamy;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
  box-shadow: $shadow-md;
}

.empty-icon {
  font-size: 72rpx;
}

.empty-title {
  font-size: $font-lg;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: $font-base;
  color: $text-tertiary;
  margin-bottom: 40rpx;
}

.empty-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 240rpx;
  height: 88rpx;
  background: $gradient-primary;
  border-radius: $radius-xl;
  box-shadow: $shadow-button;

  text {
    font-size: $font-md;
    font-weight: $font-semibold;
    color: $text-white;
  }

  &:active {
    transform: scale(0.96);
  }
}

// === 加载更多 ===
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 32rpx;
}

.loading-dot {
  width: 12rpx;
  height: 12rpx;
  background: $primary;
  border-radius: 50%;
  animation: pulse 1s ease-in-out infinite;
}

.loading-more text {
  font-size: 26rpx;
  color: $text-tertiary;
}

// === 没有更多 ===
.no-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 32rpx;
}

.no-more-line {
  width: 60rpx;
  height: 1rpx;
  background: linear-gradient(90deg, transparent 0%, $border-medium 50%, transparent 100%);
}

.no-more text {
  font-size: $font-sm;
  color: $text-placeholder;
}

// === 底部安全区 ===
.safe-bottom {
  height: calc(env(safe-area-inset-bottom) + 120rpx);
}
</style>
