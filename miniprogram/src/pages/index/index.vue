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
      <!-- 欢迎区域 -->
      <view class="welcome-section animate-slideUp">
        <view class="welcome-card">
          <!-- 装饰元素 -->
          <view class="decor-blob decor-1"></view>
          <view class="decor-blob decor-2"></view>

          <view class="welcome-content">
            <view class="greeting">
              <text class="greeting-text">{{ greetingText }}</text>
              <text class="child-name">{{ childName }}</text>
            </view>

            <!-- 统计徽章区 -->
            <view class="stats-badges">
              <view class="badge badge-time">
                <view class="badge-icon-wrap">
                  <text class="badge-icon">⏱️</text>
                </view>
                <view class="badge-content">
                  <text class="badge-value">{{ todayDuration }}</text>
                  <text class="badge-label">今日学习</text>
                </view>
              </view>
              <view class="badge badge-streak">
                <view class="badge-icon-wrap">
                  <text class="badge-icon">🔥</text>
                </view>
                <view class="badge-content">
                  <text class="badge-value">{{ streakDays }}天</text>
                  <text class="badge-label">连续打卡</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 创作入口 - 独立突出显示 -->
          <view class="create-entrance" @tap="goToCreate">
            <view class="create-entrance-bg"></view>
            <view class="create-entrance-content">
              <view class="create-entrance-left">
                <text class="create-entrance-icon">📚</text>
                <view class="create-entrance-info">
                  <text class="create-entrance-title">创作专属绘本</text>
                  <text class="create-entrance-desc">AI 为 {{ childName }} 量身定制</text>
                </view>
              </view>
              <view class="create-entrance-btn">
                <text class="create-btn-icon">✨</text>
                <text class="create-btn-text">开始</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 功能入口 -->
      <view class="feature-section animate-slideUp delay-1">
        <view class="section-header">
          <text class="section-title">快速开始</text>
        </view>

        <view class="feature-grid">
          <view
            v-for="(feature, index) in features"
            :key="feature.id"
            class="feature-item"
            :class="`feature-${feature.id}`"
            @tap="handleFeature(feature)"
          >
            <view class="feature-icon">
              <text>{{ feature.icon }}</text>
            </view>
            <text class="feature-name">{{ feature.name }}</text>
            <text class="feature-desc">{{ feature.desc }}</text>
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

      <!-- 推荐主题 -->
      <view class="recommend-section animate-slideUp delay-3">
        <view class="section-header">
          <text class="section-title">今日推荐</text>
          <text class="section-sub">为 {{ childName }} 精选</text>
        </view>

        <view class="recommend-grid">
          <view
            v-for="theme in recommendThemes"
            :key="theme.id"
            class="recommend-item"
            @tap="goToCreateWithTheme(theme)"
          >
            <view class="recommend-icon" :style="{ background: theme.bgColor }">
              <text>{{ theme.icon }}</text>
            </view>
            <view class="recommend-info">
              <text class="recommend-name">{{ theme.name }}</text>
              <text class="recommend-desc">{{ theme.desc }}</text>
            </view>
            <view class="recommend-arrow">›</view>
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
import { useContentStore } from '@/stores/content'
import NavBar from '@/components/NavBar/NavBar.vue'
import ContentCard from '@/components/ContentCard/ContentCard.vue'
import type { PlayHistoryItem } from '@/api/play'
import { getPlayHistory, getPlayStats } from '@/api/play'

const userStore = useUserStore()
const childStore = useChildStore()
const contentStore = useContentStore()

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

// 功能入口
const features = [
  { id: 'book', icon: '📚', name: '绘本', desc: '个性化故事' },
  { id: 'song', icon: '🎵', name: '儿歌', desc: '欢乐旋律' },
  { id: 'child', icon: '👶', name: '儿童模式', desc: '安全播放' },
  { id: 'stats', icon: '📊', name: '学习报告', desc: '成长记录' }
]

// 推荐主题
const recommendThemes = ref([
  { id: 'brushing_teeth', icon: '🦷', name: '刷牙好习惯', desc: '培养口腔护理习惯', bgColor: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)' },
  { id: 'eating_vegetables', icon: '🥬', name: '爱上蔬菜', desc: '健康饮食启蒙', bgColor: 'linear-gradient(135deg, #4ECDC4 0%, #7EDDD6 100%)' },
  { id: 'sleeping_early', icon: '🌙', name: '早睡早起', desc: '规律作息养成', bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
])

// 方法
function goToProfile() {
  uni.switchTab({ url: '/pages/profile/index' })
}

function goToCreate() {
  uni.switchTab({ url: '/pages/create/index' })
}

function goToLibrary() {
  uni.switchTab({ url: '/pages/library/index' })
}

function goToAddChild() {
  showAddChildGuide.value = false
  uni.navigateTo({ url: '/pages/profile/add-child' })
}

function goToPlay(item: PlayHistoryItem) {
  uni.navigateTo({
    url: `/pages/play/picture-book?id=${item.content_id}`
  })
}

function goToCreateWithTheme(theme: any) {
  uni.navigateTo({
    url: `/pages/create/picture-book?theme=${theme.id}`
  })
}

function handleFeature(feature: any) {
  switch (feature.id) {
    case 'book':
      uni.navigateTo({ url: '/pages/create/picture-book' })
      break
    case 'song':
      uni.showToast({ title: '儿歌功能即将上线', icon: 'none' })
      break
    case 'child':
      uni.navigateTo({ url: '/pages/child/index' })
      break
    case 'stats':
      uni.navigateTo({ url: '/pages/settings/index' })
      break
  }
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
}

.main-content {
  padding: 0 $spacing-md;
}

// 欢迎区域
.welcome-section {
  margin-bottom: $spacing-lg;
}

.welcome-card {
  position: relative;
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  box-shadow: $shadow-lg;
  overflow: hidden;
}

.decor-blob {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;

  &.decor-1 {
    width: 200rpx;
    height: 200rpx;
    background: $accent-soft;
    top: -80rpx;
    right: -60rpx;
    opacity: 0.7;
  }

  &.decor-2 {
    width: 120rpx;
    height: 120rpx;
    background: rgba($secondary, 0.15);
    bottom: -40rpx;
    left: 20rpx;
    opacity: 0.8;
  }
}

.welcome-content {
  position: relative;
  z-index: 1;
}

.greeting {
  margin-bottom: $spacing-md;
}

.greeting-text {
  font-size: $font-sm;
  color: $text-secondary;
  letter-spacing: 2rpx;
}

.child-name {
  display: block;
  font-size: 56rpx;
  font-weight: $font-bold;
  color: $text-primary;
  margin-top: 8rpx;
  line-height: 1.2;
}

// 统计徽章区
.stats-badges {
  display: flex;
  gap: $spacing-sm;
}

.badge {
  flex: 1;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  border-radius: $radius-lg;
  background: $bg-base;
  border: 2rpx solid transparent;
  transition: all $duration-fast $ease-out;

  &.badge-time {
    background: linear-gradient(135deg, rgba(78, 205, 196, 0.08) 0%, rgba(78, 205, 196, 0.15) 100%);
    border-color: rgba(78, 205, 196, 0.2);
  }

  &.badge-streak {
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.08) 0%, rgba(255, 107, 107, 0.15) 100%);
    border-color: rgba(255, 107, 107, 0.2);
  }
}

.badge-icon-wrap {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  background: $bg-card;
  box-shadow: $shadow-sm;
}

.badge-icon {
  font-size: 32rpx;
}

.badge-content {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.badge-value {
  font-size: $font-md;
  font-weight: $font-bold;
  color: $text-primary;
  line-height: 1.2;
}

.badge-label {
  font-size: $font-xs;
  color: $text-secondary;
}

// 创作入口卡片
.create-entrance {
  position: relative;
  margin-top: $spacing-md;
  padding: $spacing-md;
  border-radius: $radius-lg;
  overflow: hidden;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 60%, #FFB7B7 100%);
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 107, 0.35);
  transition: transform $duration-fast $ease-out;

  &:active {
    transform: scale(0.98);
  }
}

.create-entrance-bg {
  position: absolute;
  top: -40rpx;
  right: -40rpx;
  width: 180rpx;
  height: 180rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    bottom: -60rpx;
    left: -80rpx;
    width: 120rpx;
    height: 120rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }
}

.create-entrance-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.create-entrance-left {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.create-entrance-icon {
  font-size: 56rpx;
  filter: drop-shadow(0 4rpx 8rpx rgba(0, 0, 0, 0.1));
}

.create-entrance-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.create-entrance-title {
  font-size: $font-md;
  font-weight: $font-bold;
  color: $text-white;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.create-entrance-desc {
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.85);
}

.create-entrance-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: $spacing-sm $spacing-md;
  background: $bg-card;
  border-radius: $radius-full;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.create-btn-icon {
  font-size: 28rpx;
}

.create-btn-text {
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $primary;
}

// 区块通用样式
.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: $spacing-sm;
  padding: 0 $spacing-xs;
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

// 功能入口
.feature-section {
  margin-bottom: $spacing-lg;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-sm;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-md $spacing-xs;
  background: $bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;
  transition: transform $duration-fast $ease-out;

  &:active {
    transform: scale(0.95);
  }
}

.feature-icon {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  margin-bottom: $spacing-xs;
  font-size: 40rpx;

  .feature-book & { background: rgba($primary, 0.1); }
  .feature-song & { background: rgba($secondary, 0.1); }
  .feature-child & { background: rgba($accent, 0.2); }
  .feature-stats & { background: rgba($info, 0.1); }
}

.feature-name {
  font-size: $font-sm;
  font-weight: $font-semibold;
  color: $text-primary;
}

.feature-desc {
  font-size: $font-xs;
  color: $text-light;
  margin-top: 4rpx;
}

// 最近播放
.recent-section {
  margin-bottom: $spacing-lg;
}

.recent-scroll {
  margin: 0 #{-$spacing-md};
  padding: 0 $spacing-md;
}

.recent-list {
  display: flex;
  gap: $spacing-sm;
  padding-right: $spacing-md;
}

.recent-card {
  flex-shrink: 0;
  width: 280rpx;
}

// 推荐主题
.recommend-section {
  margin-bottom: $spacing-lg;
}

.recommend-grid {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.recommend-item {
  display: flex;
  align-items: center;
  padding: $spacing-md;
  background: $bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;
  transition: transform $duration-fast $ease-out;

  &:active {
    transform: scale(0.98);
  }
}

.recommend-icon {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  font-size: 40rpx;
  flex-shrink: 0;
}

.recommend-info {
  flex: 1;
  margin-left: $spacing-md;
}

.recommend-name {
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

.recommend-arrow {
  font-size: $font-xl;
  color: $text-light;
}

// 底部安全区
.safe-bottom-space {
  height: calc(#{$spacing-xl} + 100rpx);
}

// 引导弹窗
.guide-overlay {
  position: fixed;
  inset: 0;
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
</style>
