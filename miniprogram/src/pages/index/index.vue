<template>
  <view class="page-container">
    <!-- 温暖背景装饰 -->
    <view class="warm-bg">
      <view class="bg-shape shape-1"></view>
      <view class="bg-shape shape-2"></view>
      <view class="bg-shape shape-3"></view>
    </view>

    <!-- 主内容区 -->
    <scroll-view class="main-scroll" scroll-y enhanced :show-scrollbar="false">
      <!-- 英雄区域 -->
      <view class="hero-section">
        <view class="hero-content">
          <view class="avatar-wrapper" @tap="goToProfile">
            <image
              v-if="childStore.currentChild?.avatar_url"
              :src="childStore.currentChild.avatar_url"
              class="avatar-img"
              mode="aspectFill"
            />
            <view v-else class="avatar-placeholder">
              <text>{{ childName.slice(0, 1) }}</text>
            </view>
            <view class="avatar-badge">
              <text>👋</text>
            </view>
          </view>
          <view class="hero-text">
            <text class="greeting-label">{{ greetingText }}</text>
            <text class="child-name-display">{{ childName }}</text>
          </view>
        </view>

        <view class="hero-stats">
          <view class="stat-card">
            <view class="stat-icon-wrap stat-time">
              <text class="stat-icon">⏱️</text>
            </view>
            <view class="stat-info">
              <text class="stat-value">{{ todayDuration }}</text>
              <text class="stat-label">今日学习</text>
            </view>
          </view>
          <view class="stat-card">
            <view class="stat-icon-wrap stat-streak">
              <text class="stat-icon">🔥</text>
            </view>
            <view class="stat-info">
              <text class="stat-value">{{ streakDays }}天</text>
              <text class="stat-label">连续学习</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 创作入口 -->
      <view class="create-section">
        <view class="section-header">
          <text class="section-title">开启创作魔法</text>
          <text class="section-hint">为 {{ childName }} 量身定制</text>
        </view>

        <view class="create-grid">
          <!-- 绘本入口 -->
          <view class="create-card create-book" @tap="goToCreateBook">
            <view class="create-icon-wrap">
              <text class="create-icon">📚</text>
            </view>
            <view class="create-content">
              <text class="create-title">AI 绘本</text>
              <text class="create-desc">个性化故事插画</text>
            </view>
            <view class="create-arrow">
              <text>→</text>
            </view>
          </view>

          <!-- 儿歌入口 -->
          <view class="create-card create-song" @tap="goToCreateSong">
            <view class="create-icon-wrap">
              <text class="create-icon">🎵</text>
            </view>
            <view class="create-content">
              <text class="create-title">AI 儿歌</text>
              <text class="create-desc">专属旋律伴成长</text>
            </view>
            <view class="create-arrow">
              <text>→</text>
            </view>
          </view>

          <!-- 视频入口 -->
          <view class="create-card create-video" @tap="goToCreateVideo">
            <view class="create-icon-wrap">
              <text class="create-icon">🎬</text>
            </view>
            <view class="create-content">
              <text class="create-title">AI 视频</text>
              <text class="create-desc">绘本转精彩动画</text>
            </view>
            <view class="create-arrow">
              <text>→</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 继续观看区 -->
      <view v-if="recentPlays.length > 0" class="continue-section">
        <view class="section-header">
          <text class="section-title">继续探索</text>
          <text class="section-more" @tap="goToLibrary">查看全部 →</text>
        </view>

        <scroll-view class="continue-scroll" scroll-x enable-flex :show-scrollbar="false">
          <view class="continue-list">
            <view
              v-for="item in recentPlays"
              :key="item.id"
              class="continue-card"
              :class="'continue-' + item.content_type"
              @tap="goToPlay(item)"
            >
              <view class="continue-cover">
                <image v-if="item.cover_url" :src="item.cover_url" mode="aspectFill" class="cover-img" />
                <view v-else class="cover-placeholder">
                  <text>{{ getTypeIcon(item.content_type) }}</text>
                </view>
                <view class="progress-bar">
                  <view class="progress-fill" :style="{ width: (item.progress * 100) + '%' }"></view>
                </view>
              </view>
              <text class="continue-title">{{ item.content_title }}</text>
              <view class="continue-type-badge" :class="'badge-' + item.content_type">
                <text>{{ getTypeLabel(item.content_type) }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 今日灵感推荐 -->
      <view class="inspiration-section">
        <view class="section-header">
          <text class="section-title">今日灵感</text>
        </view>

        <view class="inspiration-grid">
          <view
            v-for="item in mixedRecommendations.slice(0, 4)"
            :key="item.id"
            class="inspiration-card"
            :class="'inspiration-' + item.type"
            @tap="handleRecommend(item)"
          >
            <view class="insp-icon" :class="'insp-icon-' + item.type">
              <text>{{ item.icon }}</text>
            </view>
            <view class="insp-info">
              <text class="insp-title">{{ item.title }}</text>
              <text class="insp-desc">{{ item.desc }}</text>
            </view>
            <view class="insp-type-tag" :class="'tag-' + item.type">
              <text>{{ item.typeLabel }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 快捷工具栏 -->
      <view class="tools-section">
        <view class="tools-grid">
          <view class="tool-item" @tap="goToChildMode">
            <view class="tool-icon tool-child">
              <text>👶</text>
            </view>
            <text class="tool-label">儿童模式</text>
          </view>
          <view class="tool-item" @tap="goToStats">
            <view class="tool-icon tool-stats">
              <text>📊</text>
            </view>
            <text class="tool-label">学习报告</text>
          </view>
          <view class="tool-item" @tap="goToFavorites">
            <view class="tool-icon tool-favorites">
              <text>❤️</text>
            </view>
            <text class="tool-label">我的收藏</text>
          </view>
          <view class="tool-item" @tap="goToSettings">
            <view class="tool-icon tool-settings">
              <text>⚙️</text>
            </view>
            <text class="tool-label">设置</text>
          </view>
        </view>
      </view>

      <!-- 底部安全区 -->
      <view class="safe-bottom"></view>
    </scroll-view>

    <!-- 新用户引导 -->
    <view v-if="showAddChildGuide" class="guide-overlay">
      <view class="guide-modal">
        <view class="guide-decor">
          <view class="decor-circle c1"></view>
          <view class="decor-circle c2"></view>
          <view class="decor-circle c3"></view>
        </view>
        <view class="guide-avatar">
          <text>👶</text>
        </view>
        <text class="guide-title">欢迎来到 Moana</text>
        <text class="guide-subtitle">开启童话创作之旅</text>
        <text class="guide-desc">添加宝贝信息，为 Ta 量身定制早教内容</text>
        <view class="guide-btn" @tap="goToAddChild">
          <text>✨ 添加宝贝</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useChildStore } from '@/stores/child'
import type { PlayHistoryItem } from '@/api/play'
import { getPlayHistory, getPlayStats } from '@/api/play'

const userStore = useUserStore()
const childStore = useChildStore()

// 状态
const recentPlays = ref<PlayHistoryItem[]>([])
const streakDays = ref(0)
const showAddChildGuide = ref(false)

// 计算属性
const childName = computed(() => childStore.currentChild?.name || '宝贝')

const greetingText = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  if (hour < 22) return '晚上好'
  return '夜深了'
})

const todayDuration = computed(() => {
  const mins = childStore.todayDuration || 0
  if (!mins || mins < 1) return '0分钟'
  if (mins < 60) return `${Math.round(mins)}分钟`
  const hours = Math.floor(mins / 60)
  const remainMins = Math.round(mins % 60)
  return remainMins > 0 ? `${hours}小时${remainMins}分` : `${hours}小时`
})

// 混合推荐列表
const mixedRecommendations = ref([
  {
    id: 'book_teeth',
    type: 'book',
    typeIcon: '📚',
    typeLabel: '绘本',
    icon: '🦷',
    title: '刷牙好习惯',
    desc: '培养口腔护理习惯',
    theme: 'brushing_teeth'
  },
  {
    id: 'song_abc',
    type: 'song',
    typeIcon: '🎵',
    typeLabel: '儿歌',
    icon: '🔤',
    title: 'ABC字母歌',
    desc: '轻松学习英文字母',
    theme: 'abc_song'
  },
  {
    id: 'book_veggie',
    type: 'book',
    typeIcon: '📚',
    typeLabel: '绘本',
    icon: '🥬',
    title: '爱上蔬菜',
    desc: '健康饮食启蒙',
    theme: 'eating_vegetables'
  },
  {
    id: 'song_sleep',
    type: 'song',
    typeIcon: '🎵',
    typeLabel: '儿歌',
    icon: '🌙',
    title: '摇篮曲',
    desc: '温柔旋律助眠',
    theme: 'lullaby'
  }
])

// 辅助方法
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

// 导航方法
function goToProfile() {
  uni.switchTab({ url: '/pages/profile/index' })
}

function goToCreateBook() {
  uni.navigateTo({ url: '/pages/create/picture-book' })
}

function goToCreateSong() {
  uni.navigateTo({ url: '/pages/create/nursery-rhyme' })
}

function goToCreateVideo() {
  uni.navigateTo({ url: '/pages/create/video' })
}

function goToLibrary() {
  uni.switchTab({ url: '/pages/library/index' })
}

function goToAddChild() {
  showAddChildGuide.value = false
  uni.navigateTo({ url: '/pages/profile/add-child' })
}

function goToPlay(item: PlayHistoryItem) {
  const contentType = item.content_type
  if (contentType === 'nursery_rhyme') {
    uni.navigateTo({ url: `/pages/play/nursery-rhyme?id=${item.content_id}` })
  } else if (contentType === 'video') {
    uni.navigateTo({ url: `/pages/play/video?id=${item.content_id}` })
  } else {
    uni.navigateTo({ url: `/pages/play/picture-book?id=${item.content_id}` })
  }
}

function handleRecommend(item: any) {
  if (item.type === 'book') {
    uni.navigateTo({ url: `/pages/create/picture-book?theme=${item.theme}` })
  } else if (item.type === 'song') {
    uni.navigateTo({ url: `/pages/create/nursery-rhyme?theme=${item.theme}` })
  } else if (item.type === 'video') {
    uni.navigateTo({ url: '/pages/create/video' })
  }
}

function goToChildMode() {
  uni.navigateTo({ url: '/pages/child/index' })
}

function goToStats() {
  uni.navigateTo({ url: '/pages/settings/index' })
}

function goToFavorites() {
  uni.switchTab({ url: '/pages/library/index' })
}

function goToSettings() {
  uni.navigateTo({ url: '/pages/settings/index' })
}

// 加载数据
async function loadData() {
  if (!userStore.checkLogin()) {
    await userStore.login()
  }

  await childStore.fetchChildren()

  if (!childStore.hasChild) {
    showAddChildGuide.value = true
    return
  }

  if (childStore.currentChild) {
    try {
      const [historyRes, statsRes] = await Promise.all([
        getPlayHistory(childStore.currentChild.id, { limit: 5 }),
        getPlayStats(childStore.currentChild.id)
      ])
      recentPlays.value = historyRes.items.filter(item => item.progress < 1)
      streakDays.value = statsRes.streak_days
      childStore.todayDuration = statsRes.today_duration
    } catch (e) {
      console.log('加载数据失败:', e)
    }
  }
}

onMounted(loadData)
onShow(loadData)
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page-container {
  min-height: 100vh;
  background: $bg-cream;
  width: 750rpx;
  position: relative;
  overflow: hidden;
}

// === 温暖背景装饰 ===
.warm-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.6;

  &.shape-1 {
    width: 400rpx;
    height: 400rpx;
    background: radial-gradient(circle, $book-light 0%, transparent 70%);
    top: -100rpx;
    right: -100rpx;
  }

  &.shape-2 {
    width: 300rpx;
    height: 300rpx;
    background: radial-gradient(circle, $song-light 0%, transparent 70%);
    top: 40%;
    left: -80rpx;
  }

  &.shape-3 {
    width: 250rpx;
    height: 250rpx;
    background: radial-gradient(circle, $video-light 0%, transparent 70%);
    bottom: 10%;
    right: -60rpx;
  }
}

// === 主滚动区 ===
.main-scroll {
  position: relative;
  z-index: 1;
  height: 100vh;
  padding: 0 $spacing-lg;
  box-sizing: border-box;
  width: 750rpx;
}

// === 英雄区域 ===
.hero-section {
  padding-top: calc(env(safe-area-inset-top) + 80rpx);
  padding-bottom: $spacing-xl;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
}

.avatar-wrapper {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4rpx solid #fff;
  box-shadow: $shadow-md;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: $gradient-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid #fff;
  box-shadow: $shadow-md;

  text {
    font-size: 40rpx;
    color: #fff;
    font-weight: 700;
  }
}

.avatar-badge {
  position: absolute;
  bottom: -4rpx;
  right: -4rpx;
  width: 36rpx;
  height: 36rpx;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-sm;

  text {
    font-size: 20rpx;
  }
}

.hero-text {
  flex: 1;
}

.greeting-label {
  display: block;
  font-size: $font-sm;
  color: $text-tertiary;
  margin-bottom: 4rpx;
}

.child-name-display {
  display: block;
  font-size: $font-hero;
  font-weight: 800;
  color: $text-primary;
  line-height: 1.2;
}

.hero-stats {
  display: flex;
  gap: $spacing-md;
}

.stat-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md;
  background: #fff;
  border-radius: $radius-lg;
  box-shadow: $shadow-card;
}

.stat-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;

  &.stat-time {
    background: rgba($accent, 0.15);
  }

  &.stat-streak {
    background: rgba($book-primary, 0.15);
  }
}

.stat-icon {
  font-size: 28rpx;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: $font-md;
  font-weight: 700;
  color: $text-primary;
}

.stat-label {
  font-size: $font-xs;
  color: $text-tertiary;
}

// === 区块标题 ===
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-md;
}

.section-title {
  font-size: $font-lg;
  font-weight: 700;
  color: $text-primary;
}

.section-hint {
  font-size: $font-sm;
  color: $text-tertiary;
  margin-left: $spacing-sm;
}

.section-more {
  font-size: $font-sm;
  color: $primary;
  font-weight: 500;
}

// === 创作入口 ===
.create-section {
  margin-bottom: $spacing-xl;
}

.create-grid {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.create-card {
  display: flex;
  align-items: center;
  padding: $spacing-md;
  background: #fff;
  border-radius: $radius-lg;
  box-shadow: $shadow-card;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  &.create-book {
    border-left: 6rpx solid $book-primary;
    .create-icon-wrap { background: $book-light; }
    .create-arrow { color: $book-primary; }
  }

  &.create-song {
    border-left: 6rpx solid $song-primary;
    .create-icon-wrap { background: $song-light; }
    .create-arrow { color: $song-primary; }
  }

  &.create-video {
    border-left: 6rpx solid $video-primary;
    .create-icon-wrap { background: $video-light; }
    .create-arrow { color: $video-primary; }
  }
}

.create-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.create-icon {
  font-size: 36rpx;
}

.create-content {
  flex: 1;
  margin-left: $spacing-md;
}

.create-title {
  display: block;
  font-size: $font-md;
  font-weight: 700;
  color: $text-primary;
}

.create-desc {
  display: block;
  font-size: $font-sm;
  color: $text-tertiary;
  margin-top: 4rpx;
}

.create-arrow {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-lg;
  font-weight: 600;
}

// === 继续观看 ===
.continue-section {
  margin-bottom: $spacing-xl;
}

.continue-scroll {
  margin: 0 -#{$spacing-lg};
  padding: 0 $spacing-lg;
}

.continue-list {
  display: flex;
  gap: $spacing-md;
  padding-right: $spacing-lg;
}

.continue-card {
  flex-shrink: 0;
  width: 220rpx;
  background: #fff;
  border-radius: $radius-lg;
  padding: $spacing-sm;
  box-shadow: $shadow-card;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.96);
  }
}

.continue-cover {
  position: relative;
  width: 100%;
  height: 140rpx;
  border-radius: $radius-md;
  overflow: hidden;
  margin-bottom: $spacing-sm;
}

.cover-img {
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
    font-size: 40rpx;
  }
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  background: rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  background: $gradient-accent;
  border-radius: 3rpx;
}

.continue-title {
  display: block;
  font-size: $font-sm;
  font-weight: 600;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: $spacing-xs;
}

.continue-type-badge {
  display: inline-flex;
  padding: 4rpx 12rpx;
  border-radius: $radius-xs;

  text {
    font-size: 20rpx;
    font-weight: 500;
  }

  &.badge-picture_book {
    background: $book-light;
    text { color: $book-primary; }
  }

  &.badge-nursery_rhyme {
    background: $song-light;
    text { color: $song-primary; }
  }

  &.badge-video {
    background: $video-light;
    text { color: $video-primary; }
  }
}

// === 今日灵感 ===
.inspiration-section {
  margin-bottom: $spacing-xl;
}

.inspiration-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-sm;
}

.inspiration-card {
  background: #fff;
  border-radius: $radius-lg;
  padding: $spacing-md;
  box-shadow: $shadow-card;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.96);
  }
}

.insp-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-sm;

  text {
    font-size: 28rpx;
  }

  &.insp-icon-book { background: $book-light; }
  &.insp-icon-song { background: $song-light; }
  &.insp-icon-video { background: $video-light; }
}

.insp-info {
  margin-bottom: $spacing-sm;
}

.insp-title {
  display: block;
  font-size: $font-base;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 4rpx;
}

.insp-desc {
  display: block;
  font-size: $font-xs;
  color: $text-tertiary;
}

.insp-type-tag {
  display: inline-flex;
  padding: 4rpx 12rpx;
  border-radius: $radius-xs;

  text {
    font-size: 20rpx;
    font-weight: 500;
  }

  &.tag-book {
    background: $book-light;
    text { color: $book-primary; }
  }

  &.tag-song {
    background: $song-light;
    text { color: $song-primary; }
  }

  &.tag-video {
    background: $video-light;
    text { color: $video-primary; }
  }
}

// === 工具栏 ===
.tools-section {
  margin-bottom: $spacing-lg;
}

.tools-grid {
  display: flex;
  justify-content: space-between;
  padding: $spacing-md;
  background: #fff;
  border-radius: $radius-lg;
  box-shadow: $shadow-card;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  flex: 1;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.9);
  }
}

.tool-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 28rpx;
  }

  &.tool-child { background: rgba($accent, 0.15); }
  &.tool-stats { background: rgba($info, 0.15); }
  &.tool-favorites { background: rgba($book-primary, 0.15); }
  &.tool-settings { background: $bg-soft; }
}

.tool-label {
  font-size: $font-xs;
  color: $text-secondary;
}

// === 底部安全区 ===
.safe-bottom {
  height: calc(env(safe-area-inset-bottom) + 120rpx);
}

// === 引导弹窗 ===
.guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(61, 41, 20, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: $spacing-xl;
}

.guide-modal {
  position: relative;
  width: 100%;
  max-width: 560rpx;
  background: #fff;
  border-radius: $radius-2xl;
  padding: 80rpx $spacing-xl $spacing-xl;
  text-align: center;
  box-shadow: $shadow-xl;
  overflow: hidden;
}

.guide-decor {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  overflow: hidden;
}

.decor-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.6;

  &.c1 {
    width: 100rpx;
    height: 100rpx;
    background: $book-light;
    top: -30rpx;
    left: 40rpx;
  }

  &.c2 {
    width: 60rpx;
    height: 60rpx;
    background: $song-light;
    top: 20rpx;
    right: 60rpx;
  }

  &.c3 {
    width: 40rpx;
    height: 40rpx;
    background: $video-light;
    top: 60rpx;
    left: 50%;
  }
}

.guide-avatar {
  width: 120rpx;
  height: 120rpx;
  margin: 0 auto $spacing-md;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $gradient-dreamy;
  border-radius: 50%;
  box-shadow: $shadow-md;

  text {
    font-size: 56rpx;
  }
}

.guide-title {
  display: block;
  font-size: $font-xxl;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.guide-subtitle {
  display: block;
  font-size: $font-base;
  color: $primary;
  font-weight: 500;
  margin-bottom: $spacing-sm;
}

.guide-desc {
  display: block;
  font-size: $font-sm;
  color: $text-tertiary;
  margin-bottom: $spacing-xl;
  line-height: 1.6;
}

.guide-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 280rpx;
  height: 96rpx;
  background: $gradient-primary;
  border-radius: $radius-2xl;
  box-shadow: $shadow-button;

  text {
    font-size: $font-md;
    font-weight: 600;
    color: #fff;
  }

  &:active {
    transform: scale(0.96);
  }
}
</style>
