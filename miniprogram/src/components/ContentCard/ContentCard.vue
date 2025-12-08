<template>
  <view class="content-card" :class="{ 'card-large': large }" @tap="$emit('tap')">
    <!-- 封面图 -->
    <view class="card-cover">
      <image
        v-if="coverUrl"
        class="cover-image"
        :src="coverUrl"
        mode="aspectFill"
      />
      <view v-else class="cover-placeholder">
        <text class="placeholder-emoji">{{ placeholderEmoji }}</text>
      </view>

      <!-- 类型标签 -->
      <view class="type-tag" :class="`tag-${type}`">
        <text>{{ typeLabel }}</text>
      </view>

      <!-- 时长标签 -->
      <view v-if="duration" class="duration-tag">
        <text>{{ formatDuration(duration) }}</text>
      </view>
    </view>

    <!-- 卡片信息 -->
    <view class="card-info">
      <text class="card-title">{{ title }}</text>
      <view class="card-meta">
        <text v-if="childName" class="meta-child">{{ childName }}的专属</text>
        <text v-if="createdAt" class="meta-time">{{ formatTime(createdAt) }}</text>
      </view>
    </view>

    <!-- 播放按钮 -->
    <view v-if="showPlay" class="play-btn" @tap.stop="$emit('play')">
      <text class="play-icon">▶</text>
    </view>

    <!-- 进度条 -->
    <view v-if="progress > 0 && progress < 1" class="progress-bar">
      <view class="progress-fill" :style="{ width: progress * 100 + '%' }"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  type: 'picture_book' | 'nursery_rhyme' | 'video'
  coverUrl?: string
  duration?: number
  childName?: string
  createdAt?: string
  progress?: number
  large?: boolean
  showPlay?: boolean
}>()

defineEmits(['tap', 'play'])

const typeLabel = computed(() => {
  const labels = {
    picture_book: '绘本',
    nursery_rhyme: '儿歌',
    video: '视频'
  }
  return labels[props.type] || '内容'
})

const placeholderEmoji = computed(() => {
  const emojis = {
    picture_book: '📚',
    nursery_rhyme: '🎵',
    video: '🎬'
  }
  return emojis[props.type] || '📖'
})

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`

  return `${date.getMonth() + 1}/${date.getDate()}`
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.content-card {
  position: relative;
  background: $bg-card;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: $shadow-card;
  transition: transform $duration-base $ease-out;

  &:active {
    transform: scale(0.98);
  }
}

.card-cover {
  position: relative;
  width: 100%;
  padding-top: 65%; // 宽高比
  background: $gradient-warm;
  overflow: hidden;
}

.cover-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.cover-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $bg-warm 0%, $accent-soft 100%);

  .placeholder-emoji {
    font-size: 80rpx;
    opacity: 0.8;
  }
}

.type-tag {
  position: absolute;
  top: $spacing-sm;
  left: $spacing-sm;
  padding: 6rpx 16rpx;
  border-radius: $radius-full;
  font-size: $font-xs;
  font-weight: $font-medium;

  &.tag-picture_book {
    background: rgba($primary, 0.9);
    color: $text-white;
  }

  &.tag-nursery_rhyme {
    background: rgba($secondary, 0.9);
    color: $text-white;
  }

  &.tag-video {
    background: rgba($accent, 0.9);
    color: #8B7000;
  }
}

.duration-tag {
  position: absolute;
  bottom: $spacing-sm;
  right: $spacing-sm;
  padding: 4rpx 12rpx;
  border-radius: $radius-sm;
  background: rgba(0, 0, 0, 0.6);
  font-size: $font-xs;
  color: $text-white;
}

.card-info {
  padding: $spacing-sm;
}

.card-title {
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $text-primary;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  margin-top: $spacing-xs;
  font-size: $font-xs;
  color: $text-secondary;
}

.meta-child {
  padding: 2rpx 8rpx;
  background: rgba($primary, 0.1);
  border-radius: $radius-xs;
  color: $primary;
}

.play-btn {
  position: absolute;
  right: $spacing-md;
  bottom: calc(#{$spacing-sm} + 80rpx);
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: $gradient-primary;
  box-shadow: $shadow-button;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform $duration-fast $ease-out;

  &:active {
    transform: scale(0.9);
  }

  .play-icon {
    color: $text-white;
    font-size: 28rpx;
    margin-left: 4rpx;
  }
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  background: rgba($primary, 0.2);
}

.progress-fill {
  height: 100%;
  background: $primary;
  border-radius: 0 3rpx 3rpx 0;
  transition: width $duration-base ease-out;
}

// 大卡片样式
.card-large {
  .card-cover {
    padding-top: 56%; // 16:9
  }

  .cover-placeholder .placeholder-emoji {
    font-size: 120rpx;
  }

  .card-title {
    font-size: $font-md;
  }
}
</style>
