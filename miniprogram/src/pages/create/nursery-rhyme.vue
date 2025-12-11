<template>
  <view class="page-container">
    <!-- 导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="back-btn" @tap="goBack">
          <text>‹</text>
        </view>
        <text class="nav-title">创作儿歌</text>
        <view class="nav-right"></view>
      </view>
    </view>
    <view class="nav-placeholder" :style="{ height: navHeight + 'px' }"></view>

    <!-- 主内容 -->
    <scroll-view class="main-scroll" scroll-y>
      <!-- 功能开发中提示 -->
      <view class="coming-soon">
        <text class="coming-icon">🎵</text>
        <text class="coming-title">儿歌创作功能开发中</text>
        <text class="coming-desc">
          我们正在努力开发 AI 儿歌创作功能，
          即将为宝贝带来个性化的欢乐旋律！
        </text>

        <view class="feature-preview">
          <text class="preview-title">即将支持</text>
          <view class="preview-list">
            <view class="preview-item">
              <text class="preview-icon">✨</text>
              <text>自定义儿歌主题</text>
            </view>
            <view class="preview-item">
              <text class="preview-icon">🎤</text>
              <text>AI 智能作词作曲</text>
            </view>
            <view class="preview-item">
              <text class="preview-icon">👶</text>
              <text>融入宝贝名字</text>
            </view>
            <view class="preview-item">
              <text class="preview-icon">🎧</text>
              <text>多种音乐风格</text>
            </view>
          </view>
        </view>

        <view class="back-action" @tap="goBack">
          <text>返回创作中心</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const statusBarHeight = ref(20)
const navHeight = ref(88)

function goBack() {
  uni.navigateBack()
}

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 20
  navHeight.value = statusBarHeight.value + 44
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

.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: $spacing-xl 0;
}

.coming-icon {
  font-size: 120rpx;
  margin-bottom: $spacing-md;
}

.coming-title {
  font-size: $font-xl;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: $spacing-sm;
}

.coming-desc {
  font-size: $font-base;
  color: $text-secondary;
  line-height: 1.6;
  max-width: 500rpx;
  margin-bottom: $spacing-xl;
}

.feature-preview {
  width: 100%;
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-xl;
}

.preview-title {
  display: block;
  font-size: $font-md;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm;
  background: $bg-base;
  border-radius: $radius-md;

  text {
    font-size: $font-base;
    color: $text-primary;
  }
}

.preview-icon {
  font-size: 28rpx;
}

.back-action {
  padding: $spacing-sm $spacing-lg;
  background: $gradient-secondary;
  border-radius: $radius-lg;
  box-shadow: $shadow-button;

  text {
    font-size: $font-base;
    font-weight: $font-semibold;
    color: $text-white;
  }

  &:active {
    transform: scale(0.95);
  }
}
</style>
