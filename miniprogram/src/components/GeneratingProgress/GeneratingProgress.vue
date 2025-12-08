<template>
  <view class="generating-overlay">
    <view class="generating-modal">
      <!-- 装饰背景 -->
      <view class="modal-decor">
        <view class="decor-circle c1"></view>
        <view class="decor-circle c2"></view>
        <view class="decor-circle c3"></view>
      </view>

      <!-- 动画图标 -->
      <view class="generating-icon">
        <view class="icon-ring ring-1"></view>
        <view class="icon-ring ring-2"></view>
        <view class="icon-center">
          <text>{{ currentEmoji }}</text>
        </view>
      </view>

      <!-- 状态文字 -->
      <text class="generating-title">{{ statusText }}</text>
      <text class="generating-desc">{{ statusDesc }}</text>

      <!-- 进度条 -->
      <view class="progress-wrapper">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progress + '%' }">
            <view class="progress-glow"></view>
          </view>
        </view>
        <text class="progress-text">{{ Math.round(progress) }}%</text>
      </view>

      <!-- 阶段指示器 -->
      <view class="stages">
        <view
          v-for="(stage, index) in stages"
          :key="stage.id"
          class="stage-item"
          :class="{ active: currentStage >= index, done: currentStage > index }"
        >
          <view class="stage-dot">
            <text v-if="currentStage > index">✓</text>
          </view>
          <text class="stage-name">{{ stage.name }}</text>
        </view>
      </view>

      <!-- 提示文字 -->
      <text class="generating-tip">{{ currentTip }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  progress: number
}>()

const stages = [
  { id: 'story', name: '编写故事' },
  { id: 'image', name: '生成插画' },
  { id: 'audio', name: '合成语音' }
]

const tips = [
  '正在为宝贝编织一个温馨的故事...',
  'AI 正在创作独一无二的插画...',
  '每一页都充满爱与想象力...',
  '即将完成，敬请期待...',
  '好故事值得等待～'
]

const emojis = ['✨', '📚', '🎨', '🎵', '🌟']

const currentTipIndex = ref(0)
const currentEmojiIndex = ref(0)
let tipInterval: number
let emojiInterval: number

const currentStage = computed(() => {
  if (props.progress < 30) return 0
  if (props.progress < 70) return 1
  if (props.progress < 95) return 2
  return 3
})

const statusText = computed(() => {
  if (props.progress < 30) return '故事创作中'
  if (props.progress < 70) return '插画生成中'
  if (props.progress < 95) return '语音合成中'
  return '即将完成'
})

const statusDesc = computed(() => {
  if (props.progress < 30) return 'AI 正在为宝贝编写专属故事'
  if (props.progress < 70) return '正在绘制精美的插画'
  if (props.progress < 95) return '为每一页配上温柔的声音'
  return '最后的润色中'
})

const currentTip = computed(() => tips[currentTipIndex.value])
const currentEmoji = computed(() => emojis[currentEmojiIndex.value])

onMounted(() => {
  tipInterval = setInterval(() => {
    currentTipIndex.value = (currentTipIndex.value + 1) % tips.length
  }, 3000)

  emojiInterval = setInterval(() => {
    currentEmojiIndex.value = (currentEmojiIndex.value + 1) % emojis.length
  }, 800)
})

onUnmounted(() => {
  clearInterval(tipInterval)
  clearInterval(emojiInterval)
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.generating-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-modal;
  padding: $spacing-lg;
}

.generating-modal {
  position: relative;
  width: 100%;
  max-width: 600rpx;
  background: $bg-card;
  border-radius: $radius-xl;
  padding: $spacing-xl $spacing-lg;
  text-align: center;
  overflow: hidden;
}

.modal-decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.decor-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.5;

  &.c1 {
    width: 200rpx;
    height: 200rpx;
    background: $accent-soft;
    top: -80rpx;
    right: -60rpx;
  }

  &.c2 {
    width: 150rpx;
    height: 150rpx;
    background: rgba($secondary, 0.2);
    bottom: -50rpx;
    left: -30rpx;
  }

  &.c3 {
    width: 100rpx;
    height: 100rpx;
    background: rgba($primary, 0.15);
    top: 50%;
    left: 80%;
  }
}

.generating-icon {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  margin: 0 auto $spacing-lg;
}

.icon-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 4rpx solid transparent;

  &.ring-1 {
    border-top-color: $primary;
    animation: spin 1.5s linear infinite;
  }

  &.ring-2 {
    inset: 16rpx;
    border-right-color: $secondary;
    animation: spin 2s linear infinite reverse;
  }
}

.icon-center {
  position: absolute;
  inset: 32rpx;
  background: $gradient-warm;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 56rpx;
    animation: pulse 1s ease-in-out infinite;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.generating-title {
  display: block;
  font-size: $font-xl;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.generating-desc {
  display: block;
  font-size: $font-base;
  color: $text-secondary;
  margin-bottom: $spacing-lg;
}

.progress-wrapper {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-lg;
}

.progress-bar {
  flex: 1;
  height: 16rpx;
  background: rgba($primary, 0.15);
  border-radius: $radius-full;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: $gradient-primary;
  border-radius: $radius-full;
  position: relative;
  transition: width 0.5s ease-out;
}

.progress-glow {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 40rpx;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6));
  animation: glow 1.5s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.progress-text {
  font-size: $font-md;
  font-weight: $font-bold;
  color: $primary;
  min-width: 80rpx;
  text-align: right;
}

.stages {
  display: flex;
  justify-content: center;
  gap: $spacing-lg;
  margin-bottom: $spacing-lg;
}

.stage-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  opacity: 0.4;
  transition: opacity $duration-base;

  &.active {
    opacity: 1;
  }

  &.done .stage-dot {
    background: $success;
    border-color: $success;
  }
}

.stage-dot {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 4rpx solid $text-light;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $duration-base;

  .active & {
    border-color: $primary;
    background: $primary;
  }

  text {
    font-size: 20rpx;
    color: $text-white;
  }
}

.stage-name {
  font-size: $font-xs;
  color: $text-secondary;
}

.generating-tip {
  display: block;
  font-size: $font-sm;
  color: $text-light;
  font-style: italic;
}
</style>
