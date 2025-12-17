<template>
  <view class="page-container">
    <!-- 装饰背景 -->
    <view class="decor-bg">
      <view class="decor-shape shape-1"></view>
      <view class="decor-shape shape-2"></view>
      <view class="decor-shape shape-3"></view>
    </view>

    <!-- 主内容区 -->
    <scroll-view class="main-scroll" scroll-y enhanced :show-scrollbar="false">
      <!-- 顶部返回按钮区 -->
      <view class="top-bar">
        <view class="back-btn" @tap="goBack">
          <text>←</text>
        </view>
      </view>

      <!-- 页面标题区 -->
      <view class="header-section">
        <view class="header-badge">
          <text class="badge-icon">✨</text>
          <text class="badge-text">创作工坊</text>
        </view>
        <text class="header-title">魔法创作中心</text>
        <text class="header-desc">为 {{ childName }} 创造独一无二的内容</text>
      </view>

      <!-- 三大创作入口 -->
      <view class="creation-cards">
        <!-- 绘本卡片 -->
        <view class="creation-card card-book" @tap="goToPictureBook">
          <view class="card-bg-pattern"></view>
          <view class="card-glow-effect"></view>
          <view class="card-content">
            <view class="card-badge">
              <text>推荐</text>
            </view>
            <view class="card-icon-container">
              <view class="icon-ring ring-1"></view>
              <view class="icon-ring ring-2"></view>
              <view class="card-main-icon">📚</view>
            </view>
            <view class="card-info">
              <text class="card-title">AI 绘本</text>
              <text class="card-subtitle">个性化故事，独特插画</text>
              <text class="card-detail">让宝贝成为故事主角</text>
            </view>
            <view class="card-action">
              <view class="action-circle">
                <text>→</text>
              </view>
            </view>
          </view>
          <view class="card-decoration">
            <view class="deco-star d1">✦</view>
            <view class="deco-star d2">✧</view>
            <view class="deco-star d3">✦</view>
          </view>
        </view>

        <!-- 儿歌卡片 -->
        <view class="creation-card card-song" @tap="goToNurseryRhyme">
          <view class="card-bg-pattern"></view>
          <view class="card-glow-effect"></view>
          <view class="card-content">
            <view class="card-badge badge-new">
              <text>New</text>
            </view>
            <view class="card-icon-container">
              <view class="icon-ring ring-1"></view>
              <view class="icon-ring ring-2"></view>
              <view class="card-main-icon">🎵</view>
              <view class="music-notes">
                <text class="note n1">♪</text>
                <text class="note n2">♫</text>
              </view>
            </view>
            <view class="card-info">
              <text class="card-title">AI 儿歌</text>
              <text class="card-subtitle">原创旋律，专属歌词</text>
              <text class="card-detail">唱出宝贝的故事</text>
            </view>
            <view class="card-action">
              <view class="action-circle">
                <text>→</text>
              </view>
            </view>
          </view>
          <view class="card-decoration">
            <view class="deco-star d1">✦</view>
            <view class="deco-star d2">✧</view>
            <view class="deco-star d3">✦</view>
          </view>
        </view>

        <!-- 视频卡片 -->
        <view class="creation-card card-video" @tap="goToVideo">
          <view class="card-bg-pattern"></view>
          <view class="card-glow-effect"></view>
          <view class="card-content">
            <view class="card-badge badge-new">
              <text>New</text>
            </view>
            <view class="card-icon-container">
              <view class="icon-ring ring-1"></view>
              <view class="icon-ring ring-2"></view>
              <view class="card-main-icon">🎬</view>
            </view>
            <view class="card-info">
              <text class="card-title">AI 视频</text>
              <text class="card-subtitle">绘本动态化</text>
              <text class="card-detail">让静态故事动起来</text>
            </view>
            <view class="card-action">
              <view class="action-circle">
                <text>→</text>
              </view>
            </view>
          </view>
          <view class="card-decoration">
            <view class="deco-star d1">✦</view>
            <view class="deco-star d2">✧</view>
            <view class="deco-star d3">✦</view>
          </view>
        </view>
      </view>

      <!-- 智能创作区 -->
      <view class="ai-creation-section">
        <view class="ai-header">
          <view class="ai-icon-wrap">
            <view class="ai-pulse"></view>
            <text class="ai-icon">🔮</text>
          </view>
          <view class="ai-title-wrap">
            <text class="ai-title">智能创作</text>
            <text class="ai-subtitle">告诉 AI 你的需求，自动匹配最佳创作方式</text>
          </view>
        </view>

        <view class="ai-input-area">
          <view class="input-glow"></view>
          <view class="input-container">
            <textarea
              v-model="aiInput"
              class="ai-input"
              placeholder="例如：宝宝最近不爱吃蔬菜，帮我做一个关于吃蔬菜的绘本"
              :maxlength="200"
              auto-height
            />
            <view class="input-footer">
              <text class="char-count">{{ aiInput.length }}/200</text>
            </view>
          </view>

          <!-- 快捷提示 -->
          <view class="quick-tips">
            <view class="tip-item" @tap="fillTip('宝宝不爱刷牙，需要一个刷牙主题的绘本')">
              <text class="tip-emoji">🦷</text>
              <text class="tip-text">刷牙习惯</text>
            </view>
            <view class="tip-item" @tap="fillTip('做一首认识小动物的儿歌')">
              <text class="tip-emoji">🐰</text>
              <text class="tip-text">认识动物</text>
            </view>
            <view class="tip-item" @tap="fillTip('宝宝不愿意和小朋友分享玩具')">
              <text class="tip-emoji">🎁</text>
              <text class="tip-text">学会分享</text>
            </view>
          </view>

          <!-- 提交按钮 -->
          <view
            class="ai-submit-btn"
            :class="{ disabled: !aiInput.trim() }"
            @tap="handleAICreate"
          >
            <view class="btn-shine"></view>
            <view class="btn-content">
              <text class="btn-icon">✨</text>
              <text class="btn-text">开始魔法创作</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部安全区 -->
      <view class="safe-bottom"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useChildStore } from '@/stores/child'

const childStore = useChildStore()

const aiInput = ref('')

const childName = computed(() => childStore.currentChild?.name || '宝贝')

function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.switchTab({ url: '/pages/index/index' })
    }
  })
}

function goToPictureBook() {
  uni.navigateTo({ url: '/pages/create/picture-book' })
}

function goToNurseryRhyme() {
  uni.navigateTo({ url: '/pages/create/nursery-rhyme' })
}

function goToVideo() {
  uni.navigateTo({ url: '/pages/create/video' })
}

function fillTip(text: string) {
  aiInput.value = text
}

async function handleAICreate() {
  if (!aiInput.value.trim()) return
  uni.navigateTo({
    url: `/pages/create/picture-book?input=${encodeURIComponent(aiInput.value)}`
  })
}

onShow(() => {
  // 页面显示时的逻辑
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
  opacity: 0.5;

  &.shape-1 {
    width: 300rpx;
    height: 300rpx;
    background: $book-light;
    top: -80rpx;
    right: -60rpx;
  }

  &.shape-2 {
    width: 250rpx;
    height: 250rpx;
    background: $song-light;
    top: 35%;
    left: -80rpx;
  }

  &.shape-3 {
    width: 200rpx;
    height: 200rpx;
    background: $video-light;
    bottom: 15%;
    right: -40rpx;
  }
}

// === 主滚动区 ===
.main-scroll {
  position: relative;
  z-index: 1;
  height: 100vh;
  padding: 0 32rpx;
  width: 750rpx;
  box-sizing: border-box;
}

// === 顶部返回栏 ===
.top-bar {
  padding-top: calc(env(safe-area-inset-top) + 20rpx);
  padding-bottom: 16rpx;
}

.back-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-card;
  border: 1rpx solid $border-light;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;

  text {
    font-size: 36rpx;
    color: $text-secondary;
  }

  &:active {
    transform: scale(0.92);
    background: $bg-soft;
  }
}

// === 页面标题区 ===
.header-section {
  text-align: center;
  padding: 24rpx 0 48rpx;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 20rpx;
  background: rgba($accent, 0.12);
  border: 1rpx solid rgba($accent, 0.25);
  border-radius: $radius-full;
  margin-bottom: 20rpx;
}

.badge-icon {
  font-size: 24rpx;
}

.badge-text {
  font-size: 24rpx;
  color: $accent;
  font-weight: $font-medium;
}

.header-title {
  display: block;
  font-size: 52rpx;
  font-weight: $font-bold;
  color: $text-primary;
  letter-spacing: 2rpx;
  margin-bottom: 12rpx;
}

.header-desc {
  display: block;
  font-size: 28rpx;
  color: $text-tertiary;
}

// === 创作卡片 ===
.creation-cards {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-bottom: 48rpx;
}

.creation-card {
  position: relative;
  border-radius: $radius-lg;
  overflow: hidden;
  transition: transform $duration-base $ease-out;
  box-shadow: $shadow-card;

  &:active {
    transform: scale(0.98);
  }
}

.card-bg-pattern {
  display: none;
}

.card-glow-effect {
  display: none;
}

.card-book {
  background: $bg-card;
  border: 1rpx solid $border-light;
  border-left: 6rpx solid $book-primary;

  .card-badge { background: $book-primary; }
  .icon-ring { border-color: rgba($book-primary, 0.3); }
  .action-circle { background: $book-gradient; box-shadow: $shadow-colored-book; }
}

.card-song {
  background: $bg-card;
  border: 1rpx solid $border-light;
  border-left: 6rpx solid $song-primary;

  .card-badge { background: $song-primary; }
  .icon-ring { border-color: rgba($song-primary, 0.3); }
  .action-circle { background: $song-gradient; box-shadow: $shadow-colored-song; }
}

.card-video {
  background: $bg-card;
  border: 1rpx solid $border-light;
  border-left: 6rpx solid $video-primary;

  .card-badge { background: $video-primary; }
  .icon-ring { border-color: rgba($video-primary, 0.3); }
  .action-circle { background: $video-gradient; box-shadow: $shadow-colored-video; }
}

.card-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  padding: 32rpx;
}

.card-badge {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: $radius-sm;

  text {
    font-size: 22rpx;
    color: $text-white;
    font-weight: $font-semibold;
  }

  &.badge-new {
    background: $song-gradient;
  }
}

.card-icon-container {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-ring {
  position: absolute;
  border-radius: 50%;
  border: 2rpx solid;

  &.ring-1 {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    animation: ringPulse 2s ease-out infinite;
  }

  &.ring-2 {
    top: -10rpx;
    left: -10rpx;
    right: -10rpx;
    bottom: -10rpx;
    opacity: 0.5;
    animation: ringPulse 2s ease-out infinite 0.5s;
  }
}

@keyframes ringPulse {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.3); opacity: 0; }
}

.card-main-icon {
  position: relative;
  z-index: 1;
  font-size: 52rpx;
}

.music-notes {
  position: absolute;
  top: 0;
  right: -20rpx;
}

.note {
  position: absolute;
  font-size: 20rpx;
  color: $song-primary;
  animation: noteFloat 2s ease-in-out infinite;

  &.n1 {
    top: 0;
    right: 0;
    animation-delay: 0s;
  }

  &.n2 {
    top: 20rpx;
    right: -16rpx;
    animation-delay: 0.5s;
  }
}

@keyframes noteFloat {
  0%, 100% { opacity: 0; transform: translateY(0) rotate(0deg); }
  50% { opacity: 1; transform: translateY(-16rpx) rotate(15deg); }
}

.card-info {
  flex: 1;
  margin-left: 24rpx;
  padding-right: 60rpx;
}

.card-title {
  display: block;
  font-size: $font-lg;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: 6rpx;
}

.card-subtitle {
  display: block;
  font-size: 26rpx;
  color: $text-secondary;
  margin-bottom: 4rpx;
}

.card-detail {
  display: block;
  font-size: $font-sm;
  color: $text-tertiary;
}

.card-action {
  position: absolute;
  right: 32rpx;
  top: 50%;
  transform: translateY(-50%);
}

.action-circle {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  text {
    font-size: 28rpx;
    color: $text-white;
    font-weight: $font-bold;
  }
}

.card-decoration {
  display: none;
}

.deco-star {
  display: none;
}

// === 智能创作区 ===
.ai-creation-section {
  margin-bottom: 32rpx;
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.ai-icon-wrap {
  position: relative;
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-pulse {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: $radius-md;
  background: $gradient-dreamy;
  animation: aiPulse 2s ease-in-out infinite;
}

@keyframes aiPulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.1); opacity: 0.4; }
}

.ai-icon {
  position: relative;
  z-index: 1;
  font-size: 40rpx;
}

.ai-title-wrap {
  flex: 1;
}

.ai-title {
  display: block;
  font-size: $font-md;
  font-weight: $font-bold;
  color: $text-primary;
}

.ai-subtitle {
  display: block;
  font-size: $font-sm;
  color: $text-tertiary;
  margin-top: 4rpx;
}

.ai-input-area {
  position: relative;
  background: $bg-card;
  border: 1rpx solid $border-light;
  border-radius: $radius-lg;
  padding: 24rpx;
  box-shadow: $shadow-card;
}

.input-glow {
  display: none;
}

.input-container {
  position: relative;
  margin-bottom: 20rpx;
}

.ai-input {
  width: 100%;
  min-height: 120rpx;
  padding: 20rpx;
  background: $bg-soft;
  border: 1rpx solid $border-light;
  border-radius: $radius-md;
  font-size: $font-base;
  color: $text-primary;
  line-height: 1.6;
  box-sizing: border-box;

  &::placeholder {
    color: $text-placeholder;
  }
}

.input-footer {
  position: absolute;
  bottom: 12rpx;
  right: 16rpx;
}

.char-count {
  font-size: 22rpx;
  color: $text-placeholder;
}

.quick-tips {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background: $bg-soft;
  border: 1rpx solid $border-light;
  border-radius: $radius-full;
  transition: all $duration-base $ease-out;

  &:active {
    transform: scale(0.95);
    background: rgba($primary, 0.08);
    border-color: $primary-light;
  }
}

.tip-emoji {
  font-size: 24rpx;
}

.tip-text {
  font-size: $font-sm;
  color: $text-secondary;
}

.ai-submit-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100rpx;
  background: $gradient-primary;
  border-radius: $radius-xl;
  box-shadow: $shadow-button;
  overflow: hidden;
  transition: all $duration-base $ease-out;

  &:active {
    transform: scale(0.98);
  }

  &.disabled {
    background: $bg-soft;
    box-shadow: none;

    .btn-shine {
      display: none;
    }

    .btn-text {
      color: $text-placeholder;
    }
  }
}

.btn-shine {
  display: none;
}

.btn-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.btn-icon {
  font-size: 32rpx;
}

.btn-text {
  font-size: $font-md;
  font-weight: $font-semibold;
  color: $text-white;
}

// === 底部安全区 ===
.safe-bottom {
  height: calc(env(safe-area-inset-bottom) + 100rpx);
}
</style>
