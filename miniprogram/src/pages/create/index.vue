<template>
  <view class="page-container">
    <NavBar />

    <view class="main-content">
      <!-- 页面标题 -->
      <view class="page-header">
        <view class="header-decor">
          <view class="decor-circle c1"></view>
          <view class="decor-circle c2"></view>
          <view class="decor-circle c3"></view>
        </view>
        <text class="header-title">创作中心</text>
        <text class="header-desc">为 {{ childName }} 创作专属内容</text>
      </view>

      <!-- 创作类型选择 - 使用网格布局 -->
      <view class="create-grid">
        <!-- 绘本卡片 - 主推 -->
        <view class="create-card card-book" @tap="goToPictureBook">
          <view class="card-glow"></view>
          <view class="card-content">
            <view class="card-icon-wrap">
              <view class="icon-bg"></view>
              <text class="card-icon">📚</text>
            </view>
            <view class="card-info">
              <view class="card-title-row">
                <text class="card-title">AI 绘本</text>
                <view class="card-badge badge-hot">推荐</view>
              </view>
              <text class="card-desc">个性化故事，独特插画，让宝贝成为故事主角</text>
            </view>
            <view class="card-arrow">
              <text>›</text>
            </view>
          </view>
          <view class="card-pattern pattern-book"></view>
        </view>

        <!-- 儿歌卡片 -->
        <view class="create-card card-song" @tap="goToNurseryRhyme">
          <view class="card-glow"></view>
          <view class="card-content">
            <view class="card-icon-wrap">
              <view class="icon-bg"></view>
              <text class="card-icon">🎵</text>
            </view>
            <view class="card-info">
              <view class="card-title-row">
                <text class="card-title">AI 儿歌</text>
                <view class="card-badge badge-new">New</view>
              </view>
              <text class="card-desc">原创旋律，专属歌词，唱出宝贝的故事</text>
            </view>
            <view class="card-arrow">
              <text>›</text>
            </view>
          </view>
          <view class="card-pattern pattern-song"></view>
        </view>

        <!-- 视频卡片 -->
        <view class="create-card card-video" @tap="goToVideo">
          <view class="card-glow"></view>
          <view class="card-content">
            <view class="card-icon-wrap">
              <view class="icon-bg"></view>
              <text class="card-icon">🎬</text>
            </view>
            <view class="card-info">
              <view class="card-title-row">
                <text class="card-title">AI 视频</text>
                <view class="card-badge badge-soon">即将上线</view>
              </view>
              <text class="card-desc">绘本动态化，让静态故事动起来</text>
            </view>
            <view class="card-arrow">
              <text>›</text>
            </view>
          </view>
          <view class="card-pattern pattern-video"></view>
        </view>
      </view>

      <!-- 智能创作入口 -->
      <view class="ai-section">
        <view class="section-header">
          <view class="section-icon">✨</view>
          <view class="section-title-wrap">
            <text class="section-title">智能创作</text>
            <text class="section-sub">告诉 AI 你的需求，自动匹配最佳创作方式</text>
          </view>
        </view>

        <view class="ai-input-card">
          <view class="input-wrapper">
            <textarea
              v-model="aiInput"
              class="ai-textarea"
              placeholder="例如：宝宝最近不爱吃蔬菜，帮我做一个关于吃蔬菜的绘本"
              :maxlength="200"
              auto-height
            />
            <text class="input-count">{{ aiInput.length }}/200</text>
          </view>

          <view class="input-tips">
            <view class="tip-item" @tap="fillTip('宝宝不爱刷牙')">
              <text class="tip-icon">💡</text>
              <text class="tip-text">宝宝不爱刷牙</text>
            </view>
            <view class="tip-item" @tap="fillTip('认识小动物')">
              <text class="tip-icon">🐰</text>
              <text class="tip-text">认识小动物</text>
            </view>
            <view class="tip-item" @tap="fillTip('学会分享')">
              <text class="tip-icon">🎁</text>
              <text class="tip-text">学会分享</text>
            </view>
          </view>

          <view
            class="ai-submit-btn"
            :class="{ disabled: !aiInput.trim() }"
            @tap="handleAICreate"
          >
            <view class="btn-glow"></view>
            <text class="btn-icon">✨</text>
            <text class="btn-text">智能生成</text>
          </view>
        </view>
      </view>

      <!-- 底部安全区 -->
      <view class="safe-bottom"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useChildStore } from '@/stores/child'
import { useContentStore } from '@/stores/content'
import NavBar from '@/components/NavBar/NavBar.vue'

const childStore = useChildStore()
const contentStore = useContentStore()

const aiInput = ref('')

const childName = computed(() => childStore.currentChild?.name || '宝贝')

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
  // TODO: 调用意图解析接口，跳转到对应创作页面
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
  background: $gradient-warm;
  width: $page-width;
  box-sizing: border-box;
  overflow-x: hidden;
}

.main-content {
  padding: 0 $content-padding $spacing-xl;
  width: 100%;
  box-sizing: border-box;
}

// === 页面标题 ===
.page-header {
  position: relative;
  padding: $spacing-lg 0 $spacing-md;
  overflow: visible;
}

.header-decor {
  position: absolute;
  top: 0;
  right: -20rpx;
  width: 200rpx;
  height: 200rpx;
}

.decor-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;

  &.c1 {
    width: 120rpx;
    height: 120rpx;
    background: $book-primary;
    top: 20rpx;
    right: 20rpx;
  }

  &.c2 {
    width: 80rpx;
    height: 80rpx;
    background: $song-primary;
    top: 80rpx;
    right: 100rpx;
  }

  &.c3 {
    width: 60rpx;
    height: 60rpx;
    background: $video-primary;
    top: 10rpx;
    right: 120rpx;
  }
}

.header-title {
  display: block;
  font-size: $font-xxl;
  font-weight: $font-bold;
  color: $text-primary;
  letter-spacing: 2rpx;
}

.header-desc {
  display: block;
  font-size: $font-base;
  color: $text-secondary;
  margin-top: $spacing-xs;
}

// === 创作类型网格 ===
.create-grid {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
}

.create-card {
  position: relative;
  border-radius: $radius-xl;
  overflow: hidden;
  transition: transform $duration-base $ease-bounce;

  &:active {
    transform: scale(0.98);
  }
}

.card-glow {
  position: absolute;
  top: -50%;
  right: -30%;
  width: 300rpx;
  height: 300rpx;
  border-radius: 50%;
  opacity: 0.3;
  filter: blur(40rpx);
}

.card-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  padding: $spacing-md $spacing-md $spacing-md $spacing-sm;
}

.card-icon-wrap {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: $radius-lg;
  opacity: 0.15;
}

.card-icon {
  position: relative;
  z-index: 1;
  font-size: 52rpx;
}

.card-info {
  flex: 1;
  margin-left: $spacing-sm;
  min-width: 0;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  margin-bottom: 6rpx;
}

.card-title {
  font-size: $font-md;
  font-weight: $font-bold;
  color: $text-primary;
}

.card-badge {
  padding: 4rpx 12rpx;
  border-radius: $radius-full;
  font-size: 20rpx;
  font-weight: $font-semibold;

  &.badge-hot {
    background: $gradient-primary;
    color: $text-white;
  }

  &.badge-new {
    background: $gradient-secondary;
    color: $text-white;
  }

  &.badge-soon {
    background: $text-light;
    color: $text-white;
  }
}

.card-desc {
  display: block;
  font-size: $font-sm;
  color: $text-secondary;
  line-height: 1.4;
}

.card-arrow {
  flex-shrink: 0;
  margin-left: $spacing-sm;

  text {
    font-size: $font-xl;
    color: $text-light;
    font-weight: 300;
  }
}

.card-pattern {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 160rpx;
  height: 80rpx;
  opacity: 0.08;
  z-index: 1;
}

// === 绘本卡片样式 ===
.card-book {
  background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F0 100%);
  box-shadow: $shadow-colored-book;

  .card-glow {
    background: $book-primary;
  }

  .icon-bg {
    background: $book-primary;
  }

  .card-arrow text {
    color: $book-secondary;
  }

  .pattern-book {
    background: repeating-linear-gradient(
      45deg,
      $book-primary,
      $book-primary 4rpx,
      transparent 4rpx,
      transparent 12rpx
    );
  }
}

// === 儿歌卡片样式 ===
.card-song {
  background: linear-gradient(135deg, #FFFFFF 0%, #F0FFFD 100%);
  box-shadow: $shadow-colored-song;

  .card-glow {
    background: $song-primary;
  }

  .icon-bg {
    background: $song-primary;
  }

  .card-arrow text {
    color: $song-secondary;
  }

  .pattern-song {
    background: repeating-linear-gradient(
      -45deg,
      $song-primary,
      $song-primary 4rpx,
      transparent 4rpx,
      transparent 12rpx
    );
  }
}

// === 视频卡片样式 ===
.card-video {
  background: linear-gradient(135deg, #FFFFFF 0%, #FFFBF0 100%);
  box-shadow: $shadow-colored-video;

  .card-glow {
    background: $video-primary;
  }

  .icon-bg {
    background: $video-primary;
  }

  .card-arrow text {
    color: $video-secondary;
  }

  .pattern-video {
    background: repeating-linear-gradient(
      90deg,
      $video-primary,
      $video-primary 4rpx,
      transparent 4rpx,
      transparent 12rpx
    );
  }
}

// === 智能创作区域 ===
.ai-section {
  margin-bottom: $spacing-lg;
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.section-icon {
  font-size: 36rpx;
  line-height: 1;
}

.section-title-wrap {
  flex: 1;
}

.section-title {
  display: block;
  font-size: $font-lg;
  font-weight: $font-bold;
  color: $text-primary;
}

.section-sub {
  display: block;
  font-size: $font-sm;
  color: $text-secondary;
  margin-top: 4rpx;
}

.ai-input-card {
  background: $bg-card;
  border-radius: $radius-xl;
  padding: $spacing-md;
  box-shadow: $shadow-soft;
  width: 100%;
  box-sizing: border-box;
}

.input-wrapper {
  position: relative;
}

.ai-textarea {
  width: 100%;
  min-height: 140rpx;
  padding: $spacing-sm;
  background: linear-gradient(145deg, #F8F9FA 0%, #FFFFFF 100%);
  border-radius: $radius-lg;
  font-size: $font-base;
  color: $text-primary;
  line-height: 1.6;
  box-sizing: border-box;
  border: 2rpx solid rgba($primary, 0.1);
  transition: border-color $duration-fast;

  &:focus {
    border-color: rgba($primary, 0.3);
  }
}

.input-count {
  position: absolute;
  right: $spacing-sm;
  bottom: $spacing-sm;
  font-size: $font-xs;
  color: $text-light;
}

.input-tips {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
  margin: $spacing-md 0;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: $spacing-xs $spacing-sm;
  background: linear-gradient(145deg, #FFF9F0 0%, #FFF5E6 100%);
  border-radius: $radius-full;
  transition: all $duration-fast $ease-out;

  &:active {
    transform: scale(0.95);
    background: $bg-warm;
  }
}

.tip-icon {
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
  gap: $spacing-xs;
  height: 96rpx;
  background: $gradient-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-button;
  overflow: hidden;
  transition: all $duration-base $ease-bounce;

  &:active {
    transform: scale(0.98);
  }

  &.disabled {
    background: $text-light;
    box-shadow: none;

    .btn-glow {
      display: none;
    }
  }
}

.btn-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
  animation: btn-shimmer 3s ease-in-out infinite;
}

@keyframes btn-shimmer {
  0%, 100% { transform: translateX(-30%) translateY(-30%); }
  50% { transform: translateX(30%) translateY(30%); }
}

.btn-icon {
  font-size: 32rpx;
  position: relative;
  z-index: 1;
}

.btn-text {
  font-size: $font-md;
  font-weight: $font-semibold;
  color: $text-white;
  position: relative;
  z-index: 1;
}

// === 底部安全区 ===
.safe-bottom {
  height: 120rpx;
}
</style>
