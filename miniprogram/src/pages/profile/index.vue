<template>
  <view class="page-container">
    <!-- 装饰背景 -->
    <view class="decor-bg">
      <view class="decor-shape shape-1"></view>
      <view class="decor-shape shape-2"></view>
    </view>

    <!-- 自定义导航栏 -->
    <view class="nav-bar">
      <view class="nav-title">
        <text class="title-icon">👤</text>
        <text class="title-text">我的</text>
      </view>
    </view>

    <scroll-view class="main-scroll" scroll-y>
      <!-- 用户信息卡片 -->
      <view class="user-card">
        <view class="user-info">
          <view class="avatar-wrapper">
            <view class="avatar-ring"></view>
            <image
              v-if="userStore.user?.avatar_url"
              class="avatar"
              :src="userStore.user.avatar_url"
              mode="aspectFill"
            />
            <view v-else class="avatar-placeholder">
              <text>{{ (userStore.user?.nickname || '用')[0] }}</text>
            </view>
          </view>
          <view class="user-detail">
            <text class="user-name">{{ userStore.user?.nickname || '未登录' }}</text>
            <text class="user-id">ID: {{ userStore.user?.id?.slice(0, 8) || '--' }}</text>
          </view>
        </view>
      </view>

      <!-- 当前孩子 -->
      <view class="section">
        <view class="section-header">
          <view class="section-title-wrap">
            <text class="section-icon">👶</text>
            <text class="section-title">我的宝贝</text>
          </view>
          <text class="section-action" @tap="goToAddChild">+ 添加</text>
        </view>

        <view v-if="childStore.children.length === 0" class="empty-child">
          <view class="empty-illustration">
            <text>👶</text>
          </view>
          <text class="empty-text">还没有添加宝贝</text>
          <view class="empty-btn" @tap="goToAddChild">
            <text>✨ 添加宝贝</text>
          </view>
        </view>

        <view v-else class="child-list">
          <view
            v-for="child in childStore.children"
            :key="child.id"
            class="child-card"
            :class="{ active: childStore.currentChild?.id === child.id }"
            @tap="selectChild(child)"
          >
            <view class="child-avatar">
              <text>👶</text>
            </view>
            <view class="child-info">
              <text class="child-name">{{ child.name }}</text>
              <text class="child-age">{{ getChildAge(child.birth_date) }}</text>
            </view>
            <view v-if="childStore.currentChild?.id === child.id" class="child-check">
              <text>✓</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 功能菜单 -->
      <view class="section">
        <view class="section-header">
          <view class="section-title-wrap">
            <text class="section-icon">⚙️</text>
            <text class="section-title">功能</text>
          </view>
        </view>

        <view class="menu-card">
          <view class="menu-item" @tap="goToSettings">
            <view class="menu-icon-wrap icon-time">
              <text class="menu-icon">⏱️</text>
            </view>
            <text class="menu-label">时间设置</text>
            <text class="menu-arrow">›</text>
          </view>

          <view class="menu-item" @tap="goToHistory">
            <view class="menu-icon-wrap icon-report">
              <text class="menu-icon">📊</text>
            </view>
            <text class="menu-label">学习报告</text>
            <text class="menu-arrow">›</text>
          </view>

          <view class="menu-item" @tap="goToFavorites">
            <view class="menu-icon-wrap icon-heart">
              <text class="menu-icon">❤️</text>
            </view>
            <text class="menu-label">我的收藏</text>
            <text class="menu-arrow">›</text>
          </view>

          <view class="menu-item" @tap="goToFeedback">
            <view class="menu-icon-wrap icon-chat">
              <text class="menu-icon">💬</text>
            </view>
            <text class="menu-label">意见反馈</text>
            <text class="menu-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 更多 -->
      <view class="section">
        <view class="menu-card">
          <view class="menu-item" @tap="showAbout">
            <view class="menu-icon-wrap icon-info">
              <text class="menu-icon">ℹ️</text>
            </view>
            <text class="menu-label">关于 Moana</text>
            <text class="menu-arrow">›</text>
          </view>

          <view class="menu-item logout" @tap="handleLogout">
            <view class="menu-icon-wrap icon-logout">
              <text class="menu-icon">🚪</text>
            </view>
            <text class="menu-label">退出登录</text>
          </view>
        </view>
      </view>

      <!-- 底部安全区 -->
      <view class="safe-bottom"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useChildStore, type Child } from '@/stores/child'

const userStore = useUserStore()
const childStore = useChildStore()

function getChildAge(birthDate: string | undefined | null): string {
  if (!birthDate) return '未知'

  const birth = new Date(birthDate)
  const now = new Date()
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())

  if (months <= 0) return '刚出生'

  const years = Math.floor(months / 12)
  const remainMonths = months % 12
  if (years === 0) return `${remainMonths}个月`
  if (remainMonths === 0) return `${years}岁`
  return `${years}岁${remainMonths}个月`
}

function selectChild(child: Child) {
  childStore.setCurrentChild(child)
  uni.showToast({ title: `已切换到 ${child.name}`, icon: 'success' })
}

function goToAddChild() {
  uni.navigateTo({ url: '/pages/profile/add-child' })
}

function goToSettings() {
  uni.navigateTo({ url: '/pages/settings/index' })
}

function goToHistory() {
  uni.navigateTo({ url: '/pages/report/index' })
}

function goToFavorites() {
  uni.navigateTo({ url: '/pages/favorites/index' })
}

function goToFeedback() {
  uni.navigateTo({ url: '/pages/feedback/index' })
}

function showAbout() {
  uni.showModal({
    title: '关于 Moana',
    content: 'Moana 是一款 AI 原生的早教内容生成平台，为 1-6 岁儿童提供个性化绘本、儿歌和视频内容。\n\n版本：1.0.0',
    showCancel: false,
    confirmText: '好的'
  })
}

function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.reLaunch({ url: '/pages/index/index' })
      }
    }
  })
}

onShow(() => {
  if (userStore.checkLogin() && !userStore.user) {
    userStore.fetchUser()
  }
  childStore.fetchChildren()
})
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
    width: 280rpx;
    height: 280rpx;
    background: $book-light;
    top: -80rpx;
    right: -60rpx;
  }

  &.shape-2 {
    width: 200rpx;
    height: 200rpx;
    background: $song-light;
    bottom: 200rpx;
    left: -50rpx;
  }
}

// === 导航栏 ===
.nav-bar {
  position: relative;
  z-index: 10;
  padding: calc(env(safe-area-inset-top) + 48rpx) 32rpx 20rpx;
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
  font-weight: $font-bold;
  color: $text-primary;
}

// === 主滚动区 ===
.main-scroll {
  position: relative;
  z-index: 1;
  height: calc(100vh - 88rpx);
  padding: 0 32rpx;
  width: 750rpx;
  box-sizing: border-box;
}

// === 用户卡片 ===
.user-card {
  position: relative;
  background: $bg-card;
  border-radius: $radius-lg;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: $shadow-card;
  overflow: hidden;
}

.user-info {
  position: relative;
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.avatar-ring {
  position: absolute;
  top: -6rpx;
  left: -6rpx;
  right: -6rpx;
  bottom: -6rpx;
  border-radius: 50%;
  background: $gradient-primary;
  opacity: 0.8;
}

.avatar {
  position: relative;
  z-index: 1;
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid $bg-card;
}

.avatar-placeholder {
  position: relative;
  z-index: 1;
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: $gradient-dreamy;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid $bg-card;

  text {
    font-size: 48rpx;
    color: $text-primary;
    font-weight: $font-bold;
  }
}

.user-detail {
  flex: 1;
}

.user-name {
  display: block;
  font-size: $font-lg;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: 4rpx;
}

.user-id {
  display: block;
  font-size: $font-sm;
  color: $text-tertiary;
}

// === 区块 ===
.section {
  margin-bottom: 32rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
  padding: 0 8rpx;
}

.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.section-icon {
  font-size: 28rpx;
}

.section-title {
  font-size: $font-md;
  font-weight: $font-bold;
  color: $text-primary;
}

.section-action {
  font-size: 26rpx;
  color: $primary;
  font-weight: $font-medium;
}

// === 孩子列表 ===
.empty-child {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: 48rpx;
  text-align: center;
  box-shadow: $shadow-card;
}

.empty-illustration {
  width: 100rpx;
  height: 100rpx;
  margin: 0 auto 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $gradient-dreamy;
  border-radius: 50%;
  box-shadow: $shadow-sm;

  text {
    font-size: 48rpx;
  }
}

.empty-text {
  display: block;
  font-size: $font-base;
  color: $text-tertiary;
  margin-bottom: 24rpx;
}

.empty-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 200rpx;
  height: 80rpx;
  background: $gradient-primary;
  border-radius: $radius-xl;
  box-shadow: $shadow-button;

  text {
    font-size: $font-base;
    font-weight: $font-semibold;
    color: $text-white;
  }

  &:active {
    transform: scale(0.96);
  }
}

.child-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.child-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background: $bg-card;
  border: 2rpx solid $border-light;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;
  transition: all $duration-base $ease-out;

  &.active {
    border-color: $primary;
    background: rgba($primary, 0.04);
  }

  &:active {
    transform: scale(0.98);
  }
}

.child-avatar {
  position: relative;
  width: 72rpx;
  height: 72rpx;
  border-radius: $radius-md;
  background: $gradient-dreamy;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 36rpx;
  }
}

.child-info {
  flex: 1;
  margin-left: 16rpx;
}

.child-name {
  display: block;
  font-size: $font-md;
  font-weight: $font-semibold;
  color: $text-primary;
}

.child-age {
  display: block;
  font-size: $font-sm;
  color: $text-tertiary;
  margin-top: 2rpx;
}

.child-check {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: $gradient-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-button;

  text {
    font-size: 24rpx;
    color: $text-white;
    font-weight: $font-bold;
  }
}

// === 菜单 ===
.menu-card {
  background: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-card;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid $border-light;
  transition: background $duration-fast $ease-out;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: $bg-soft;
  }

  &.logout {
    .menu-label {
      color: $error;
    }
  }
}

.menu-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;

  &.icon-time { background: $video-light; }
  &.icon-report { background: rgba(91, 164, 217, 0.15); }
  &.icon-heart { background: $book-light; }
  &.icon-chat { background: $song-light; }
  &.icon-info { background: $bg-soft; }
  &.icon-logout { background: rgba($error, 0.1); }
}

.menu-icon {
  font-size: 28rpx;
}

.menu-label {
  flex: 1;
  font-size: $font-md;
  color: $text-primary;
}

.menu-arrow {
  font-size: 32rpx;
  color: $text-placeholder;
}

// === 底部安全区 ===
.safe-bottom {
  height: calc(env(safe-area-inset-bottom) + 120rpx);
}
</style>
