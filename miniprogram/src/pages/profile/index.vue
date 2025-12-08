<template>
  <view class="page-container">
    <NavBar />

    <scroll-view class="main-scroll" scroll-y>
      <!-- 用户信息卡片 -->
      <view class="user-card animate-slideUp">
        <view class="card-bg">
          <view class="bg-blob b1"></view>
          <view class="bg-blob b2"></view>
        </view>

        <view class="user-info">
          <view class="avatar-wrapper">
            <image
              v-if="userStore.user?.avatar_url"
              class="avatar"
              :src="userStore.user.avatar_url"
              mode="aspectFill"
            />
            <view v-else class="avatar-placeholder">
              <text>👤</text>
            </view>
          </view>
          <view class="user-detail">
            <text class="user-name">{{ userStore.user?.nickname || '未登录' }}</text>
            <text class="user-id">ID: {{ userStore.user?.id?.slice(0, 8) || '--' }}</text>
          </view>
        </view>
      </view>

      <!-- 当前孩子 -->
      <view class="section animate-slideUp delay-1">
        <view class="section-header">
          <text class="section-title">👶 我的宝贝</text>
          <text class="section-action" @tap="goToAddChild">+ 添加</text>
        </view>

        <view v-if="childStore.children.length === 0" class="empty-child">
          <text class="empty-icon">👶</text>
          <text class="empty-text">还没有添加宝贝</text>
          <view class="empty-btn" @tap="goToAddChild">
            <text>添加宝贝</text>
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
              <text class="child-age">{{ getChildAge(child.age_months) }}</text>
            </view>
            <view v-if="childStore.currentChild?.id === child.id" class="child-check">
              <text>✓</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 功能菜单 -->
      <view class="section animate-slideUp delay-2">
        <view class="section-header">
          <text class="section-title">⚙️ 功能</text>
        </view>

        <view class="menu-card">
          <view class="menu-item" @tap="goToSettings">
            <view class="menu-icon">⏱️</view>
            <text class="menu-label">时间设置</text>
            <text class="menu-arrow">›</text>
          </view>

          <view class="menu-item" @tap="goToHistory">
            <view class="menu-icon">📊</view>
            <text class="menu-label">学习报告</text>
            <text class="menu-arrow">›</text>
          </view>

          <view class="menu-item" @tap="goToFavorites">
            <view class="menu-icon">❤️</view>
            <text class="menu-label">我的收藏</text>
            <view class="menu-badge">即将上线</view>
          </view>

          <view class="menu-item" @tap="goToFeedback">
            <view class="menu-icon">💬</view>
            <text class="menu-label">意见反馈</text>
            <text class="menu-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 更多 -->
      <view class="section animate-slideUp delay-3">
        <view class="menu-card">
          <view class="menu-item" @tap="showAbout">
            <view class="menu-icon">ℹ️</view>
            <text class="menu-label">关于 Moana</text>
            <text class="menu-arrow">›</text>
          </view>

          <view class="menu-item logout" @tap="handleLogout">
            <view class="menu-icon">🚪</view>
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
import NavBar from '@/components/NavBar/NavBar.vue'

const userStore = useUserStore()
const childStore = useChildStore()

function getChildAge(months: number): string {
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
  uni.showToast({ title: '学习报告开发中', icon: 'none' })
}

function goToFavorites() {
  uni.showToast({ title: '收藏功能即将上线', icon: 'none' })
}

function goToFeedback() {
  uni.showToast({ title: '感谢您的反馈！', icon: 'none' })
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
  background: $gradient-warm;
}

.main-scroll {
  padding: 0 $spacing-md;
}

// 用户卡片
.user-card {
  position: relative;
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-lg;
  box-shadow: $shadow-lg;
  overflow: hidden;
}

.card-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  opacity: 0.5;

  &.b1 {
    width: 200rpx;
    height: 200rpx;
    background: $accent-soft;
    top: -80rpx;
    right: -60rpx;
  }

  &.b2 {
    width: 150rpx;
    height: 150rpx;
    background: rgba($secondary, 0.15);
    bottom: -50rpx;
    left: -30rpx;
  }
}

.user-info {
  position: relative;
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.avatar-wrapper {
  flex-shrink: 0;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 6rpx solid $bg-card;
  box-shadow: $shadow-md;
}

.avatar-placeholder {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: $gradient-warm;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56rpx;
  border: 6rpx solid $bg-card;
  box-shadow: $shadow-md;
}

.user-detail {
  flex: 1;
}

.user-name {
  display: block;
  font-size: $font-xl;
  font-weight: $font-bold;
  color: $text-primary;
}

.user-id {
  display: block;
  font-size: $font-sm;
  color: $text-secondary;
  margin-top: 4rpx;
}

// 区块
.section {
  margin-bottom: $spacing-lg;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-sm;
  padding: 0 $spacing-xs;
}

.section-title {
  font-size: $font-md;
  font-weight: $font-bold;
  color: $text-primary;
}

.section-action {
  font-size: $font-sm;
  color: $primary;
}

// 孩子列表
.empty-child {
  background: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-xl;
  text-align: center;
}

.empty-icon {
  display: block;
  font-size: 80rpx;
  margin-bottom: $spacing-sm;
}

.empty-text {
  display: block;
  font-size: $font-base;
  color: $text-secondary;
  margin-bottom: $spacing-md;
}

.empty-btn {
  display: inline-flex;
  padding: $spacing-sm $spacing-lg;
  background: $gradient-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-button;

  text {
    font-size: $font-base;
    color: $text-white;
    font-weight: $font-medium;
  }

  &:active {
    transform: scale(0.95);
  }
}

.child-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.child-card {
  display: flex;
  align-items: center;
  padding: $spacing-md;
  background: $bg-card;
  border-radius: $radius-md;
  border: 2rpx solid transparent;
  box-shadow: $shadow-sm;
  transition: all $duration-fast;

  &.active {
    border-color: $primary;
    background: rgba($primary, 0.05);
  }

  &:active {
    transform: scale(0.98);
  }
}

.child-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-md;
  background: $gradient-warm;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.child-info {
  flex: 1;
  margin-left: $spacing-sm;
}

.child-name {
  display: block;
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $text-primary;
}

.child-age {
  display: block;
  font-size: $font-sm;
  color: $text-secondary;
}

.child-check {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: $primary;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 24rpx;
    color: $text-white;
  }
}

// 菜单
.menu-card {
  background: $bg-card;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: $spacing-md;
  border-bottom: 1rpx solid $uni-border-color;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: $bg-warm;
  }

  &.logout {
    .menu-label {
      color: $error;
    }
  }
}

.menu-icon {
  font-size: 36rpx;
  margin-right: $spacing-sm;
}

.menu-label {
  flex: 1;
  font-size: $font-base;
  color: $text-primary;
}

.menu-arrow {
  font-size: $font-lg;
  color: $text-light;
}

.menu-badge {
  padding: 4rpx 12rpx;
  background: $text-light;
  border-radius: $radius-full;
  font-size: $font-xs;
  color: $text-white;
}

.safe-bottom {
  height: calc(#{$spacing-xl} + 100rpx);
}
</style>
