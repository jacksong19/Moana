<template>
  <view class="page-container">
    <NavBar />

    <view class="main-content">
      <!-- 页面标题 -->
      <view class="page-header animate-slideUp">
        <text class="header-title">创作中心</text>
        <text class="header-desc">为 {{ childName }} 创作专属内容</text>
      </view>

      <!-- 创作类型选择 -->
      <view class="create-types">
        <view
          class="type-card type-book animate-slideUp delay-1"
          @tap="goToPictureBook"
        >
          <view class="type-bg"></view>
          <view class="type-icon">
            <text>📚</text>
          </view>
          <view class="type-info">
            <text class="type-name">AI 绘本</text>
            <text class="type-desc">个性化故事，独特插画</text>
          </view>
          <view class="type-tag">
            <text>推荐</text>
          </view>
          <view class="type-arrow">
            <text>›</text>
          </view>
        </view>

        <view
          class="type-card type-song animate-slideUp delay-2"
          @tap="goToNurseryRhyme"
        >
          <view class="type-bg"></view>
          <view class="type-icon">
            <text>🎵</text>
          </view>
          <view class="type-info">
            <text class="type-name">AI 儿歌</text>
            <text class="type-desc">欢乐旋律，朗朗上口</text>
          </view>
          <view class="type-tag type-tag-soon">
            <text>即将上线</text>
          </view>
          <view class="type-arrow">
            <text>›</text>
          </view>
        </view>

        <view
          class="type-card type-video animate-slideUp delay-3"
          @tap="goToVideo"
        >
          <view class="type-bg"></view>
          <view class="type-icon">
            <text>🎬</text>
          </view>
          <view class="type-info">
            <text class="type-name">AI 视频</text>
            <text class="type-desc">绘本转视频，动态呈现</text>
          </view>
          <view class="type-tag type-tag-soon">
            <text>即将上线</text>
          </view>
          <view class="type-arrow">
            <text>›</text>
          </view>
        </view>
      </view>

      <!-- AI 智能输入 -->
      <view class="ai-input-section animate-slideUp delay-4">
        <view class="section-header">
          <text class="section-title">智能创作</text>
          <text class="section-sub">告诉 AI 你的需求</text>
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
              <text>💡 宝宝不爱刷牙</text>
            </view>
            <view class="tip-item" @tap="fillTip('认识小动物')">
              <text>💡 认识小动物</text>
            </view>
            <view class="tip-item" @tap="fillTip('学会分享')">
              <text>💡 学会分享</text>
            </view>
          </view>

          <view
            class="ai-submit-btn"
            :class="{ disabled: !aiInput.trim() }"
            @tap="handleAICreate"
          >
            <text class="btn-icon">✨</text>
            <text class="btn-text">智能生成</text>
          </view>
        </view>
      </view>

      <!-- 历史创作 -->
      <view v-if="recentCreations.length > 0" class="history-section">
        <view class="section-header">
          <text class="section-title">最近创作</text>
          <text class="section-more" @tap="goToLibrary">全部</text>
        </view>

        <view class="history-list">
          <view
            v-for="item in recentCreations"
            :key="item.id"
            class="history-item"
            @tap="goToContent(item)"
          >
            <view class="history-cover">
              <image v-if="item.cover_url" :src="item.cover_url" mode="aspectFill" />
              <text v-else class="cover-emoji">📚</text>
            </view>
            <view class="history-info">
              <text class="history-title">{{ item.title }}</text>
              <text class="history-time">{{ formatTime(item.created_at) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useChildStore } from '@/stores/child'
import { useContentStore } from '@/stores/content'
import NavBar from '@/components/NavBar/NavBar.vue'
import type { PictureBook } from '@/api/content'

const childStore = useChildStore()
const contentStore = useContentStore()

const aiInput = ref('')
const recentCreations = ref<PictureBook[]>([])

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

function goToLibrary() {
  uni.switchTab({ url: '/pages/library/index' })
}

function goToContent(item: PictureBook) {
  uni.navigateTo({
    url: `/pages/play/picture-book?id=${item.id}`
  })
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

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

async function loadData() {
  // 历史创作功能暂时禁用，等待后端 /content/list 接口实现
  // try {
  //   await contentStore.fetchGeneratedList()
  //   recentCreations.value = contentStore.generatedList.slice(0, 3)
  // } catch (e) {
  //   console.log('加载历史创作失败')
  // }
}

onMounted(loadData)
onShow(loadData)
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

.main-content {
  padding: 0 $spacing-md $spacing-xl;
  width: 100%;
  box-sizing: border-box;
}

// 页面标题
.page-header {
  padding: $spacing-md 0;
}

.header-title {
  display: block;
  font-size: $font-xxl;
  font-weight: $font-bold;
  color: $text-primary;
}

.header-desc {
  display: block;
  font-size: $font-base;
  color: $text-secondary;
  margin-top: $spacing-xs;
}

// 创作类型卡片
.create-types {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  margin-bottom: $spacing-lg;
}

.type-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: $spacing-md;
  background: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-card;
  overflow: hidden;
  transition: transform $duration-fast $ease-out;

  &:active {
    transform: scale(0.98);
  }
}

.type-bg {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  opacity: 0.1;

  .type-book & { background: $primary; }
  .type-song & { background: $secondary; }
  .type-video & { background: $accent; }
}

.type-icon {
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  font-size: 48rpx;
  flex-shrink: 0;

  .type-book & { background: rgba($primary, 0.12); }
  .type-song & { background: rgba($secondary, 0.12); }
  .type-video & { background: rgba($accent, 0.2); }
}

.type-info {
  flex: 1;
  margin-left: $spacing-md;
}

.type-name {
  display: block;
  font-size: $font-md;
  font-weight: $font-bold;
  color: $text-primary;
}

.type-desc {
  display: block;
  font-size: $font-sm;
  color: $text-secondary;
  margin-top: 4rpx;
}

.type-tag {
  padding: 6rpx 16rpx;
  background: $gradient-primary;
  border-radius: $radius-full;
  margin-right: $spacing-sm;

  text {
    font-size: $font-xs;
    color: $text-white;
    font-weight: $font-medium;
  }

  &.type-tag-soon {
    background: $text-light;
  }
}

.type-arrow {
  font-size: $font-xl;
  color: $text-light;
}

// AI 输入区域
.ai-input-section {
  margin-bottom: $spacing-lg;
}

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
}

.section-more {
  font-size: $font-sm;
  color: $primary;
}

.ai-input-card {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-md;
  box-shadow: $shadow-sm;
  width: 100%;
  box-sizing: border-box;
}

.input-wrapper {
  position: relative;
}

.ai-textarea {
  width: 100%;
  min-height: 120rpx;
  padding: $spacing-sm;
  background: $bg-base;
  border-radius: $radius-md;
  font-size: $font-base;
  color: $text-primary;
  line-height: 1.6;
  box-sizing: border-box;
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
  margin: $spacing-sm 0;
}

.tip-item {
  padding: $spacing-xs $spacing-sm;
  background: $bg-base;
  border-radius: $radius-full;
  transition: background $duration-fast;

  &:active {
    background: $bg-warm;
  }

  text {
    font-size: $font-sm;
    color: $text-secondary;
  }
}

.ai-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  height: 88rpx;
  background: $gradient-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-button;
  transition: all $duration-fast $ease-out;

  &:active {
    transform: scale(0.98);
  }

  &.disabled {
    background: $text-light;
    box-shadow: none;
  }

  .btn-icon {
    font-size: 32rpx;
  }

  .btn-text {
    font-size: $font-md;
    font-weight: $font-semibold;
    color: $text-white;
  }
}

// 历史创作
.history-section {
  margin-top: $spacing-lg;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.history-item {
  display: flex;
  align-items: center;
  padding: $spacing-sm;
  background: $bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;

  &:active {
    background: $bg-warm;
  }
}

.history-cover {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-sm;
  background: $gradient-warm;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  image {
    width: 100%;
    height: 100%;
  }

  .cover-emoji {
    font-size: 36rpx;
  }
}

.history-info {
  flex: 1;
  margin-left: $spacing-sm;
}

.history-title {
  display: block;
  font-size: $font-base;
  font-weight: $font-medium;
  color: $text-primary;
}

.history-time {
  display: block;
  font-size: $font-xs;
  color: $text-light;
  margin-top: 4rpx;
}
</style>
