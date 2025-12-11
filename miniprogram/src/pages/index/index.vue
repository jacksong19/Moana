<template>
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <NavBar
      :show-avatar="true"
      :avatar-url="childStore.currentChild?.avatar_url"
      @avatar-tap="goToProfile"
    />

    <!-- 主内容区 -->
    <view class="main-content">
      <!-- 欢迎区域 - 精简版 -->
      <view class="welcome-section animate-slideUp">
        <view class="welcome-header">
          <view class="greeting">
            <text class="greeting-text">{{ greetingText }}</text>
            <text class="child-name">{{ childName }}</text>
          </view>
          <view class="stats-mini">
            <view class="stat-item">
              <text class="stat-icon">⏱️</text>
              <text class="stat-value">{{ todayDuration }}</text>
            </view>
            <view class="stat-divider"></view>
            <view class="stat-item">
              <text class="stat-icon">🔥</text>
              <text class="stat-value">{{ streakDays }}天</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 三大内容类型入口 -->
      <view class="content-types-section animate-slideUp delay-1">
        <view class="section-header">
          <text class="section-title">开始创作</text>
          <text class="section-sub">为 {{ childName }} 量身定制</text>
        </view>

        <view class="content-types-grid">
          <!-- 绘本入口 -->
          <view class="content-type-card card-book" @tap="goToCreateBook">
            <view class="card-glow"></view>
            <view class="card-inner">
              <view class="card-icon-area">
                <view class="icon-ring"></view>
                <text class="card-icon">📚</text>
              </view>
              <view class="card-info">
                <text class="card-title">AI 绘本</text>
                <text class="card-desc">个性化故事插画</text>
              </view>
              <view class="card-arrow">
                <text>›</text>
              </view>
            </view>
          </view>

          <!-- 儿歌入口 -->
          <view class="content-type-card card-song" @tap="goToCreateSong">
            <view class="card-glow"></view>
            <view class="card-inner">
              <view class="card-icon-area">
                <view class="icon-ring"></view>
                <text class="card-icon">🎵</text>
              </view>
              <view class="card-info">
                <text class="card-title">AI 儿歌</text>
                <text class="card-desc">专属旋律伴成长</text>
              </view>
              <view class="card-arrow">
                <text>›</text>
              </view>
            </view>
          </view>

          <!-- 视频入口 -->
          <view class="content-type-card card-video" @tap="goToCreateVideo">
            <view class="card-glow"></view>
            <view class="card-inner">
              <view class="card-icon-area">
                <view class="icon-ring"></view>
                <text class="card-icon">🎬</text>
              </view>
              <view class="card-info">
                <text class="card-title">AI 视频</text>
                <text class="card-desc">绘本转精彩动画</text>
              </view>
              <view class="card-arrow">
                <text>›</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 最近播放 -->
      <view v-if="recentPlays.length > 0" class="recent-section animate-slideUp delay-2">
        <view class="section-header">
          <text class="section-title">继续观看</text>
          <text class="section-more" @tap="goToLibrary">查看全部</text>
        </view>

        <scroll-view class="recent-scroll" scroll-x enable-flex>
          <view class="recent-list">
            <ContentCard
              v-for="item in recentPlays"
              :key="item.id"
              class="recent-card"
              :title="item.content_title"
              :type="item.content_type"
              :cover-url="item.cover_url"
              :progress="item.progress"
              :show-play="true"
              @tap="goToPlay(item)"
              @play="goToPlay(item)"
            />
          </view>
        </scroll-view>
      </view>

      <!-- 今日推荐 - 混合类型 -->
      <view class="recommend-section animate-slideUp delay-3">
        <view class="section-header">
          <text class="section-title">今日推荐</text>
        </view>

        <view class="recommend-list">
          <view
            v-for="item in mixedRecommendations"
            :key="item.id"
            class="recommend-card"
            :class="`recommend-${item.type}`"
            @tap="handleRecommend(item)"
          >
            <view class="recommend-type-tag">
              <text class="tag-icon">{{ item.typeIcon }}</text>
              <text class="tag-text">{{ item.typeLabel }}</text>
            </view>
            <view class="recommend-content">
              <view class="recommend-icon-wrap" :style="{ background: item.iconBg }">
                <text class="recommend-icon">{{ item.icon }}</text>
              </view>
              <view class="recommend-info">
                <text class="recommend-title">{{ item.title }}</text>
                <text class="recommend-desc">{{ item.desc }}</text>
              </view>
            </view>
            <view class="recommend-action">
              <text class="action-text">{{ item.actionText }}</text>
              <text class="action-arrow">›</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 快捷工具 -->
      <view class="tools-section animate-slideUp delay-4">
        <view class="tools-grid">
          <view class="tool-item" @tap="goToChildMode">
            <view class="tool-icon tool-child">
              <text>👶</text>
            </view>
            <text class="tool-name">儿童模式</text>
          </view>
          <view class="tool-item" @tap="goToStats">
            <view class="tool-icon tool-stats">
              <text>📊</text>
            </view>
            <text class="tool-name">学习报告</text>
          </view>
          <view class="tool-item" @tap="goToFavorites">
            <view class="tool-icon tool-favorites">
              <text>❤️</text>
            </view>
            <text class="tool-name">我的收藏</text>
          </view>
          <view class="tool-item" @tap="goToSettings">
            <view class="tool-icon tool-settings">
              <text>⚙️</text>
            </view>
            <text class="tool-name">设置</text>
          </view>
        </view>
      </view>

      <!-- 底部安全区 -->
      <view class="safe-bottom-space"></view>
    </view>

    <!-- 新用户引导 - 添加孩子 -->
    <view v-if="showAddChildGuide" class="guide-overlay">
      <view class="guide-modal animate-scaleIn">
        <view class="guide-decor"></view>
        <text class="guide-emoji">👶</text>
        <text class="guide-title">欢迎使用 Moana</text>
        <text class="guide-desc">添加宝贝信息，开始个性化早教之旅</text>
        <view class="guide-btn" @tap="goToAddChild">
          <text>添加宝贝</text>
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
import NavBar from '@/components/NavBar/NavBar.vue'
import ContentCard from '@/components/ContentCard/ContentCard.vue'
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

// 混合推荐列表 - 包含三种内容类型
const mixedRecommendations = ref([
  {
    id: 'book_teeth',
    type: 'book',
    typeIcon: '📚',
    typeLabel: '绘本',
    icon: '🦷',
    iconBg: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
    title: '刷牙好习惯',
    desc: '培养口腔护理习惯',
    actionText: '创作',
    theme: 'brushing_teeth'
  },
  {
    id: 'song_abc',
    type: 'song',
    typeIcon: '🎵',
    typeLabel: '儿歌',
    icon: '🔤',
    iconBg: 'linear-gradient(135deg, #4ECDC4 0%, #7EDDD6 100%)',
    title: 'ABC字母歌',
    desc: '轻松学习英文字母',
    actionText: '创作',
    theme: 'abc_song'
  },
  {
    id: 'book_veggie',
    type: 'book',
    typeIcon: '📚',
    typeLabel: '绘本',
    icon: '🥬',
    iconBg: 'linear-gradient(135deg, #00B894 0%, #55EFC4 100%)',
    title: '爱上蔬菜',
    desc: '健康饮食启蒙',
    actionText: '创作',
    theme: 'eating_vegetables'
  },
  {
    id: 'song_sleep',
    type: 'song',
    typeIcon: '🎵',
    typeLabel: '儿歌',
    icon: '🌙',
    iconBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    title: '摇篮曲',
    desc: '温柔旋律助眠',
    actionText: '创作',
    theme: 'lullaby'
  }
])

// 方法
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
  } else {
    uni.showToast({ title: '视频功能即将上线', icon: 'none' })
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
  // 检查登录状态
  if (!userStore.checkLogin()) {
    await userStore.login()
  }

  // 加载孩子列表
  await childStore.fetchChildren()

  // 如果没有孩子，显示引导
  if (!childStore.hasChild) {
    showAddChildGuide.value = true
    return
  }

  // 加载播放历史和统计
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
  background: $gradient-warm;
  width: $page-width;
  box-sizing: border-box;
}

.main-content {
  padding: 0 $content-padding;
  width: 100%;
  box-sizing: border-box;
}

// === 欢迎区域 ===
.welcome-section {
  margin-bottom: $spacing-md;
}

.welcome-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: $spacing-sm 0;
}

.greeting {
  display: flex;
  flex-direction: column;
}

.greeting-text {
  font-size: $font-sm;
  color: $text-secondary;
  letter-spacing: 2rpx;
}

.child-name {
  font-size: 48rpx;
  font-weight: $font-bold;
  color: $text-primary;
  margin-top: 4rpx;
  line-height: 1.2;
}

.stats-mini {
  display: flex;
  align-items: center;
  background: $bg-card;
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-full;
  box-shadow: $shadow-sm;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.stat-icon {
  font-size: 24rpx;
}

.stat-value {
  font-size: $font-sm;
  font-weight: $font-semibold;
  color: $text-primary;
}

.stat-divider {
  width: 2rpx;
  height: 24rpx;
  background: $text-light;
  margin: 0 $spacing-sm;
  opacity: 0.3;
}

// === 区块通用样式 ===
.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: $spacing-sm;
}

.section-title {
  font-size: $font-lg;
  font-weight: $font-bold;
  color: $text-primary;
}

.section-sub {
  font-size: $font-sm;
  color: $text-secondary;
  margin-left: $spacing-sm;
}

.section-more {
  font-size: $font-sm;
  color: $primary;
}

// === 三大内容类型入口 ===
.content-types-section {
  margin-bottom: $spacing-lg;
}

.content-types-grid {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.content-type-card {
  position: relative;
  border-radius: $radius-lg;
  overflow: hidden;
  transition: transform $duration-fast $ease-bounce;

  &:active {
    transform: scale(0.98);
  }
}

.card-glow {
  position: absolute;
  top: -50%;
  right: -30%;
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  opacity: 0.3;
  pointer-events: none;
}

.card-inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  padding: $spacing-md;
}

.card-icon-area {
  position: relative;
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-ring {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: $radius-md;
  opacity: 0.15;
}

.card-icon {
  font-size: 48rpx;
  position: relative;
  z-index: 1;
}

.card-info {
  flex: 1;
  margin-left: $spacing-md;
}

.card-title {
  display: block;
  font-size: $font-md;
  font-weight: $font-bold;
  color: $text-white;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.card-desc {
  display: block;
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 4rpx;
}

.card-arrow {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: $radius-full;
  font-size: 32rpx;
  color: $text-white;
}

.card-badge {
  padding: 6rpx 16rpx;
  background: rgba(255, 255, 255, 0.25);
  border-radius: $radius-full;
  font-size: $font-xs;
  color: $text-white;
}

// 绘本卡片 - 珊瑚红
.card-book {
  background: $book-gradient;
  box-shadow: $shadow-colored-book;

  .card-glow { background: rgba(255, 255, 255, 0.4); }
  .icon-ring { background: $text-white; }
}

// 儿歌卡片 - 薄荷绿
.card-song {
  background: $song-gradient;
  box-shadow: $shadow-colored-song;

  .card-glow { background: rgba(255, 255, 255, 0.4); }
  .icon-ring { background: $text-white; }
}

// 视频卡片 - 琥珀橙
.card-video {
  background: $video-gradient;
  box-shadow: $shadow-colored-video;

  .card-glow { background: rgba(255, 255, 255, 0.4); }
  .icon-ring { background: $text-white; }
}

// === 最近播放 ===
.recent-section {
  margin-bottom: $spacing-lg;
}

.recent-scroll {
  margin: 0 #{-$content-padding};
  padding: 0 $content-padding;
}

.recent-list {
  display: flex;
  gap: $spacing-sm;
  padding-right: $content-padding;
}

.recent-card {
  flex-shrink: 0;
  width: 280rpx;
}

// === 今日推荐 ===
.recommend-section {
  margin-bottom: $spacing-lg;
}

.recommend-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.recommend-card {
  position: relative;
  background: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  box-shadow: $shadow-soft;
  overflow: hidden;
  transition: transform $duration-fast $ease-out;

  &:active {
    transform: scale(0.98);
  }
}

.recommend-type-tag {
  position: absolute;
  top: $spacing-sm;
  right: $spacing-sm;
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 4rpx 12rpx;
  border-radius: $radius-full;
  font-size: $font-xs;
}

.recommend-book .recommend-type-tag {
  background: rgba($book-primary, 0.1);
  color: $book-primary;
}

.recommend-song .recommend-type-tag {
  background: rgba($song-primary, 0.1);
  color: $song-primary;
}

.recommend-video .recommend-type-tag {
  background: rgba($video-primary, 0.1);
  color: $video-primary;
}

.tag-icon {
  font-size: 18rpx;
}

.tag-text {
  font-weight: $font-medium;
}

.recommend-content {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-sm;
}

.recommend-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  flex-shrink: 0;
}

.recommend-icon {
  font-size: 36rpx;
}

.recommend-info {
  flex: 1;
  margin-left: $spacing-md;
  padding-right: 100rpx;
}

.recommend-title {
  display: block;
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $text-primary;
}

.recommend-desc {
  display: block;
  font-size: $font-sm;
  color: $text-secondary;
  margin-top: 4rpx;
}

.recommend-action {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4rpx;
}

.action-text {
  font-size: $font-sm;
  font-weight: $font-medium;
}

.action-arrow {
  font-size: $font-lg;
}

.recommend-book .recommend-action {
  color: $book-primary;
}

.recommend-song .recommend-action {
  color: $song-primary;
}

.recommend-video .recommend-action {
  color: $video-primary;
}

// === 快捷工具 ===
.tools-section {
  margin-bottom: $spacing-lg;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-sm;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-md $spacing-xs;
  background: $bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;
  transition: transform $duration-fast $ease-out;

  &:active {
    transform: scale(0.95);
  }
}

.tool-icon {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  font-size: 32rpx;

  &.tool-child { background: rgba($accent, 0.15); }
  &.tool-stats { background: rgba($info, 0.15); }
  &.tool-favorites { background: rgba($primary, 0.1); }
  &.tool-settings { background: rgba($text-secondary, 0.1); }
}

.tool-name {
  font-size: $font-xs;
  color: $text-secondary;
}

// === 底部安全区 ===
.safe-bottom-space {
  height: calc(#{$spacing-xl} + 100rpx);
}

// === 引导弹窗 ===
.guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-modal;
  padding: $spacing-lg;
}

.guide-modal {
  position: relative;
  width: 100%;
  max-width: 600rpx;
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-xl $spacing-lg;
  text-align: center;
  overflow: hidden;
}

.guide-decor {
  position: absolute;
  top: -100rpx;
  right: -100rpx;
  width: 250rpx;
  height: 250rpx;
  background: $accent-soft;
  border-radius: 50%;
  opacity: 0.5;
}

.guide-emoji {
  display: block;
  font-size: 100rpx;
  margin-bottom: $spacing-md;
}

.guide-title {
  display: block;
  font-size: $font-xl;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: $spacing-sm;
}

.guide-desc {
  display: block;
  font-size: $font-base;
  color: $text-secondary;
  margin-bottom: $spacing-lg;
}

.guide-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 240rpx;
  height: 88rpx;
  background: $gradient-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-button;

  text {
    font-size: $font-md;
    font-weight: $font-semibold;
    color: $text-white;
  }

  &:active {
    transform: scale(0.95);
  }
}

// === 动画 ===
.animate-slideUp {
  animation: slideUp 0.5s $ease-out forwards;
  opacity: 0;
}

.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }
.delay-4 { animation-delay: 0.4s; }

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-scaleIn {
  animation: scaleIn 0.3s $ease-bounce forwards;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
