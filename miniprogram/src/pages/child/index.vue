<template>
  <view class="wonderland">
    <!-- 梦幻背景层 -->
    <view class="bg-layer">
      <view class="bg-gradient"></view>
      <view class="clouds">
        <view class="cloud c1"></view>
        <view class="cloud c2"></view>
        <view class="cloud c3"></view>
      </view>
      <view class="stars">
        <view v-for="i in 12" :key="i" class="star" :class="'s' + i"></view>
      </view>
      <view class="rainbow"></view>
    </view>

    <!-- 顶部时间气球 -->
    <view class="time-balloon">
      <view class="balloon-body">
        <view class="balloon-shine"></view>
        <view class="balloon-time">
          <text class="time-num">{{ remainingMinutes }}</text>
          <text class="time-unit">分钟</text>
        </view>
      </view>
      <view class="balloon-string"></view>
      <view class="balloon-bow">🎀</view>
    </view>

    <!-- 主播放区域 - 魔法电视机 -->
    <view class="magic-tv" v-if="currentContent" @tap="startPlay">
      <view class="tv-frame">
        <view class="tv-antenna left"></view>
        <view class="tv-antenna right"></view>
        <view class="tv-screen">
          <image
            v-if="currentContent.cover_url"
            :src="currentContent.cover_url"
            mode="aspectFill"
            class="screen-image"
          />
          <view v-else class="screen-placeholder">
            <text class="placeholder-emoji">{{ getContentEmoji(currentContent) }}</text>
          </view>
          <!-- 播放按钮在屏幕中心 -->
          <view class="play-button">
            <view class="play-pulse"></view>
            <view class="play-icon">▶</view>
          </view>
          <!-- 类型角标 -->
          <view class="screen-badge" :class="getContentTypeClass(currentContent)">
            {{ getContentTypeBadge(currentContent) }}
          </view>
        </view>
        <view class="tv-controls">
          <view class="tv-dial"></view>
          <view class="tv-speaker">
            <view class="speaker-line" v-for="i in 5" :key="i"></view>
          </view>
        </view>
      </view>
      <!-- 标题在电视机下方 -->
      <view class="tv-title">
        <text class="title-text">{{ currentContent.title }}</text>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-magic">
      <view class="empty-wand">
        <text>🪄</text>
      </view>
      <text class="empty-title">等待魔法内容</text>
      <text class="empty-hint">请家长添加绘本或儿歌</text>
    </view>

    <!-- 素材选择区 - 旋转木马 -->
    <view class="carousel-section" v-if="allContentList.length > 0">
      <view class="carousel-header">
        <view class="header-star">⭐</view>
        <text class="header-title">选一个玩具</text>
        <view class="header-star">⭐</view>
      </view>

      <!-- 类型筛选按钮 -->
      <view class="type-filter">
        <view
          class="filter-btn"
          :class="{ active: currentFilter === 'all' }"
          @tap="setFilter('all')"
        >
          <text class="filter-icon">🎁</text>
          <text class="filter-label">全部</text>
        </view>
        <view
          class="filter-btn"
          :class="{ active: currentFilter === 'picture_book' }"
          @tap="setFilter('picture_book')"
        >
          <text class="filter-icon">📚</text>
          <text class="filter-label">绘本</text>
        </view>
        <view
          class="filter-btn"
          :class="{ active: currentFilter === 'nursery_rhyme' }"
          @tap="setFilter('nursery_rhyme')"
        >
          <text class="filter-icon">🎵</text>
          <text class="filter-label">儿歌</text>
        </view>
        <view
          class="filter-btn"
          :class="{ active: currentFilter === 'video' }"
          @tap="setFilter('video')"
        >
          <text class="filter-icon">🎬</text>
          <text class="filter-label">视频</text>
        </view>
      </view>

      <scroll-view
        class="carousel-track"
        scroll-x
        :show-scrollbar="false"
        enhanced
        :scroll-with-animation="true"
      >
        <view class="carousel-inner">
          <view
            v-for="(item, index) in filteredContentList"
            :key="item.id"
            class="carousel-item"
            :class="[
              getContentTypeClass(item),
              { active: currentContent?.id === item.id }
            ]"
            :style="{ animationDelay: index * 0.1 + 's' }"
            @tap="selectContent(item)"
          >
            <!-- 玩具盒子 -->
            <view class="toy-box">
              <view class="box-lid"></view>
              <view class="box-front">
                <view class="toy-icon">
                  <text>{{ getContentEmoji(item) }}</text>
                </view>
              </view>
              <view class="box-shine"></view>
            </view>
            <!-- 标签 -->
            <view class="item-label">
              <text>{{ formatTitle(item.title) }}</text>
            </view>
            <!-- 选中星星 -->
            <view class="select-star" v-if="currentContent?.id === item.id">
              <text>⭐</text>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 滚动提示 -->
      <view class="scroll-hint">
        <text>👈 滑动看更多 👉</text>
      </view>
    </view>

    <!-- 底部退出区域 - 魔法按钮 -->
    <view
      class="exit-zone"
      @touchstart.stop="startExitTimer"
      @touchend.stop="cancelExitTimer"
      @touchcancel.stop="cancelExitTimer"
    >
      <view class="exit-button" :class="{ pressing: exitProgress > 0 }">
        <view class="exit-glow"></view>
        <view class="exit-ring">
          <svg viewBox="0 0 100 100" class="progress-ring">
            <circle
              cx="50" cy="50" r="45"
              stroke-width="6"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
            />
            <circle
              cx="50" cy="50" r="45"
              stroke-width="6"
              fill="none"
              stroke="url(#exitGradient)"
              :stroke-dasharray="283"
              :stroke-dashoffset="283 - (283 * exitProgress / 100)"
              stroke-linecap="round"
              transform="rotate(-90 50 50)"
            />
            <defs>
              <linearGradient id="exitGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#FF6B9D"/>
                <stop offset="50%" stop-color="#FECA57"/>
                <stop offset="100%" stop-color="#5CD85A"/>
              </linearGradient>
            </defs>
          </svg>
        </view>
        <view class="exit-inner">
          <text class="exit-icon">👋</text>
          <text class="exit-text">{{ exitProgress > 0 ? Math.ceil(3 - exitProgress * 0.03) : '拜拜' }}</text>
        </view>
      </view>
      <text class="exit-hint" v-if="exitProgress === 0">长按说再见</text>
    </view>

    <!-- 退出确认弹窗 - 魔法门 -->
    <view v-if="showExitModal" class="modal-overlay">
      <view class="magic-door">
        <view class="door-frame">
          <view class="door-arch"></view>
          <view class="door-body">
            <view class="door-question">
              <text class="question-title">🔮 回答魔法问题</text>
              <text class="question-text">{{ mathQuestion.question }}</text>
            </view>
            <view class="answer-grid">
              <view
                v-for="opt in mathQuestion.options"
                :key="opt"
                class="answer-bubble"
                @tap="checkAnswer(opt)"
              >
                <text>{{ opt }}</text>
              </view>
            </view>
            <view class="door-cancel" @tap="showExitModal = false">
              <text>✨ 继续玩耍 ✨</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 休息提醒 - 月亮睡眠 -->
    <view v-if="showRestReminder" class="rest-overlay">
      <view class="moon-scene">
        <view class="moon">
          <view class="moon-face">
            <view class="moon-eye left"></view>
            <view class="moon-eye right"></view>
            <view class="moon-smile"></view>
          </view>
          <view class="moon-glow"></view>
        </view>
        <view class="zzz">
          <text class="z z1">Z</text>
          <text class="z z2">z</text>
          <text class="z z3">z</text>
        </view>
        <text class="rest-title">眼睛要休息啦</text>
        <text class="rest-hint">闭上眼睛数到 {{ restCountdown }}</text>
        <view class="rest-counter">
          <text>{{ restCountdown }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useChildStore } from '@/stores/child'
import { useContentStore } from '@/stores/content'
import timeLimitManager from '@/utils/time-limit'
import type { PictureBook } from '@/api/content'

const childStore = useChildStore()
const contentStore = useContentStore()

// 状态
const currentContent = ref<PictureBook | null>(null)
const allContentList = ref<PictureBook[]>([])
const currentFilter = ref<'all' | 'picture_book' | 'nursery_rhyme' | 'video'>('all')
const remainingMinutes = ref(20)

// 筛选后的内容列表
const filteredContentList = computed(() => {
  if (currentFilter.value === 'all') {
    return allContentList.value
  }
  return allContentList.value.filter(item => item.content_type === currentFilter.value)
})

// 设置筛选类型
function setFilter(type: 'all' | 'picture_book' | 'nursery_rhyme' | 'video') {
  currentFilter.value = type
  // 如果当前选中的内容不在筛选结果中，选择筛选后的第一个
  if (filteredContentList.value.length > 0) {
    const currentInList = filteredContentList.value.find(item => item.id === currentContent.value?.id)
    if (!currentInList) {
      currentContent.value = filteredContentList.value[0]
    }
  }
}

// 退出相关
const showExitModal = ref(false)
const exitProgress = ref(0)
let exitTimer: number | null = null

// 数学题
const mathQuestion = ref({
  question: '2 + 3 = ?',
  answer: 5,
  options: [4, 5, 6, 7]
})

// 休息提醒
const showRestReminder = ref(false)
const restCountdown = ref(10)
let restTimer: number | null = null
let checkTimer: number | null = null

// 沙漏效果计算
const sandTopHeight = computed(() => {
  const total = childStore.settings.session_limit_minutes
  return (remainingMinutes.value / total) * 100
})

const sandBottomHeight = computed(() => {
  return 100 - sandTopHeight.value
})

function selectContent(item: PictureBook) {
  currentContent.value = item
}

function startPlay() {
  if (!currentContent.value) return

  const content = currentContent.value as any
  const type = content.content_type || 'picture_book'

  const playerMap: Record<string, string> = {
    'picture_book': '/pages/play/picture-book',
    'nursery_rhyme': '/pages/play/nursery-rhyme',
    'video': '/pages/play/video'
  }

  const playerPath = playerMap[type] || '/pages/play/picture-book'

  uni.navigateTo({
    url: `${playerPath}?id=${content.id}&autoplay=1`
  })
}

function getContentEmoji(item: any): string {
  const type = item.content_type || 'picture_book'
  const emojiMap: Record<string, string> = {
    'picture_book': '📚',
    'nursery_rhyme': '🎵',
    'video': '🎬'
  }
  return emojiMap[type] || '📚'
}

function getContentTypeClass(item: any): string {
  const type = item.content_type || 'picture_book'
  return `type-${type.replace('_', '-')}`
}

function getContentTypeBadge(item: any): string {
  const type = item.content_type || 'picture_book'
  const badgeMap: Record<string, string> = {
    'picture_book': '绘本',
    'nursery_rhyme': '儿歌',
    'video': '视频'
  }
  return badgeMap[type] || '绘本'
}

function formatTitle(title: string): string {
  if (!title) return ''
  const match = title.match(/的(.+)/)
  if (match && match[1].length > 2) {
    return match[1].slice(0, 5)
  }
  return title.slice(0, 5)
}

// 退出逻辑
function startExitTimer(e: any) {
  e?.stopPropagation?.()

  if (exitTimer) {
    clearInterval(exitTimer)
  }

  exitProgress.value = 0
  let count = 0

  exitTimer = setInterval(() => {
    count++
    exitProgress.value = Math.min(100, Math.round((count / 30) * 100))

    if (count >= 30) {
      cancelExitTimer()
      showExitConfirm()
    }
  }, 100)
}

function cancelExitTimer() {
  if (exitTimer) {
    clearInterval(exitTimer)
    exitTimer = null
  }
  exitProgress.value = 0
}

function showExitConfirm() {
  generateMathQuestion()
  showExitModal.value = true
}

function generateMathQuestion() {
  const a = Math.floor(Math.random() * 5) + 1
  const b = Math.floor(Math.random() * 5) + 1
  const answer = a + b

  const options = [answer]
  while (options.length < 4) {
    const opt = answer + Math.floor(Math.random() * 5) - 2
    if (opt > 0 && !options.includes(opt)) {
      options.push(opt)
    }
  }

  mathQuestion.value = {
    question: `${a} + ${b} = ?`,
    answer,
    options: options.sort(() => Math.random() - 0.5)
  }
}

function checkAnswer(opt: number) {
  if (opt === mathQuestion.value.answer) {
    showExitModal.value = false
    uni.navigateBack()
  } else {
    uni.showToast({ title: '再想想哦~', icon: 'none' })
    generateMathQuestion()
  }
}

function checkTime() {
  const info = timeLimitManager.getRemainingInfo()
  remainingMinutes.value = info.sessionRemaining

  const result = timeLimitManager.checkLimits()

  if (result.exceeded) {
    uni.showToast({ title: result.message, icon: 'none' })
    setTimeout(() => uni.navigateBack(), 2000)
  } else if (result.reminder) {
    showRestReminder.value = true
    restCountdown.value = 10
    startRestCountdown()
  }
}

function startRestCountdown() {
  restTimer = setInterval(() => {
    restCountdown.value--
    if (restCountdown.value <= 0) {
      clearInterval(restTimer!)
      showRestReminder.value = false
      timeLimitManager.resetReminder()
    }
  }, 1000)
}

// 推断内容类型（与内容库完全一致）
function inferContentType(item: any): string {
  if (item.content_type) return item.content_type
  if (item.video_url) return 'video'
  if (item.audio_url && !item.pages) return 'nursery_rhyme'
  return 'picture_book'
}

async function loadContent() {
  try {
    // 强制刷新并加载所有内容
    await contentStore.fetchGeneratedList(true)

    // 继续加载直到没有更多内容
    while (contentStore.hasMoreContent) {
      await contentStore.fetchMoreContent()
    }

    // 为每个内容项添加类型推断
    const listWithType = contentStore.generatedList.map(item => ({
      ...item,
      content_type: inferContentType(item)
    }))

    console.log('[child] 加载全部内容:', listWithType.length, '个')

    // 展示所有内容
    allContentList.value = listWithType

    if (allContentList.value.length > 0) {
      currentContent.value = allContentList.value[0]
    }
  } catch (e) {
    console.log('加载内容失败', e)
  }
}

onLoad((options) => {
  if (options?.contentId) {
    contentStore.fetchContentDetail(options.contentId).then(() => {
      currentContent.value = contentStore.currentContent
    })
  }

  timeLimitManager.startSession()
})

onMounted(() => {
  loadContent()
  checkTimer = setInterval(checkTime, 30000)
  checkTime()
})

onUnmounted(() => {
  if (checkTimer) clearInterval(checkTimer)
  if (restTimer) clearInterval(restTimer)
  cancelExitTimer()
  timeLimitManager.endSession()
})
</script>

<style lang="scss" scoped>
// ============================================
// 🎠 梦幻游乐园 - 儿童模式
// ============================================

// 变量定义
$candy-pink: #FF6B9D;
$candy-orange: #FF9F43;
$candy-yellow: #FECA57;
$candy-green: #5CD85A;
$candy-blue: #54A0FF;
$candy-purple: #A55EEA;
$cream: #FFF9F0;
$soft-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);

// 主容器
.wonderland {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

// ============================================
// 背景层
// ============================================
.bg-layer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    #FFE8F5 0%,
    #FFF0E8 25%,
    #E8F8FF 50%,
    #F0FFF4 75%,
    #FFF8E8 100%
  );
}

// 云朵
.clouds {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 400rpx;
}

.cloud {
  position: absolute;
  background: white;
  border-radius: 100rpx;
  opacity: 0.8;

  &::before, &::after {
    content: '';
    position: absolute;
    background: white;
    border-radius: 50%;
  }

  &.c1 {
    width: 200rpx;
    height: 60rpx;
    top: 120rpx;
    left: -50rpx;
    animation: float-cloud 20s ease-in-out infinite;

    &::before {
      width: 80rpx;
      height: 80rpx;
      top: -40rpx;
      left: 30rpx;
    }
    &::after {
      width: 60rpx;
      height: 60rpx;
      top: -30rpx;
      left: 90rpx;
    }
  }

  &.c2 {
    width: 160rpx;
    height: 50rpx;
    top: 80rpx;
    right: 20rpx;
    animation: float-cloud 15s ease-in-out infinite reverse;

    &::before {
      width: 70rpx;
      height: 70rpx;
      top: -35rpx;
      left: 20rpx;
    }
    &::after {
      width: 50rpx;
      height: 50rpx;
      top: -25rpx;
      left: 80rpx;
    }
  }

  &.c3 {
    width: 140rpx;
    height: 45rpx;
    top: 200rpx;
    left: 40%;
    animation: float-cloud 18s ease-in-out infinite 2s;

    &::before {
      width: 60rpx;
      height: 60rpx;
      top: -30rpx;
      left: 15rpx;
    }
    &::after {
      width: 45rpx;
      height: 45rpx;
      top: -22rpx;
      left: 70rpx;
    }
  }
}

@keyframes float-cloud {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(60rpx); }
}

// 星星
.stars {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
}

.star {
  position: absolute;
  width: 16rpx;
  height: 16rpx;
  background: $candy-yellow;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  animation: twinkle 2s ease-in-out infinite;

  @for $i from 1 through 12 {
    &.s#{$i} {
      top: random(60) + 5%;
      left: random(90) + 5%;
      animation-delay: $i * 0.2s;
      transform: scale(0.5 + random(10) / 10);
    }
  }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

// 彩虹
.rainbow {
  position: absolute;
  bottom: 30%;
  left: -100rpx;
  width: 400rpx;
  height: 200rpx;
  border-radius: 200rpx 200rpx 0 0;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(255, 107, 157, 0.2) 20%,
    rgba(255, 159, 67, 0.2) 35%,
    rgba(254, 202, 87, 0.2) 50%,
    rgba(92, 216, 90, 0.2) 65%,
    rgba(84, 160, 255, 0.2) 80%,
    rgba(165, 94, 234, 0.2) 95%
  );
  opacity: 0.6;
}

// ============================================
// 时间气球
// ============================================
.time-balloon {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 100rpx;
  margin-bottom: 20rpx;
  animation: balloon-float 3s ease-in-out infinite;
}

@keyframes balloon-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

.balloon-body {
  position: relative;
  width: 140rpx;
  height: 160rpx;
  background: linear-gradient(145deg, #FF9ECD, #FF6B9D);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  box-shadow:
    inset -20rpx -20rpx 40rpx rgba(255, 255, 255, 0.3),
    0 10rpx 30rpx rgba(255, 107, 157, 0.4);
}

.balloon-shine {
  position: absolute;
  top: 20rpx;
  left: 25rpx;
  width: 30rpx;
  height: 40rpx;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  transform: rotate(-30deg);
}

.balloon-time {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-num {
  font-size: 48rpx;
  font-weight: 800;
  color: white;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
  line-height: 1;
}

.time-unit {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.balloon-string {
  width: 4rpx;
  height: 40rpx;
  background: linear-gradient(180deg, #FF6B9D, #ccc);
  border-radius: 2rpx;
}

.balloon-bow {
  font-size: 24rpx;
  margin-top: -4rpx;
}

// ============================================
// 魔法电视机
// ============================================
.magic-tv {
  position: relative;
  z-index: 10;
  margin: 0 40rpx 40rpx;
}

.tv-frame {
  position: relative;
  background: linear-gradient(145deg, #6B5B95, #5A4A84);
  border-radius: 40rpx;
  padding: 24rpx;
  box-shadow:
    0 20rpx 60rpx rgba(107, 91, 149, 0.4),
    inset 0 2rpx 0 rgba(255, 255, 255, 0.2);
}

.tv-antenna {
  position: absolute;
  top: -50rpx;
  width: 8rpx;
  height: 60rpx;
  background: linear-gradient(180deg, #888, #666);
  border-radius: 4rpx;

  &::after {
    content: '';
    position: absolute;
    top: -16rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 24rpx;
    height: 24rpx;
    background: $candy-yellow;
    border-radius: 50%;
    box-shadow: 0 0 16rpx rgba($candy-yellow, 0.6);
  }

  &.left {
    left: 80rpx;
    transform: rotate(-15deg);
  }

  &.right {
    right: 80rpx;
    transform: rotate(15deg);
  }
}

.tv-screen {
  position: relative;
  width: 100%;
  height: 360rpx;
  background: #222;
  border-radius: 24rpx;
  overflow: hidden;
  border: 8rpx solid #333;
}

.screen-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.screen-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
}

.placeholder-emoji {
  font-size: 120rpx;
  animation: float-emoji 2s ease-in-out infinite;
}

@keyframes float-emoji {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-10rpx) scale(1.05); }
}

.screen-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 50%,
    rgba(0, 0, 0, 0.3) 100%
  );
  pointer-events: none;
}

.scanlines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2rpx,
    rgba(0, 0, 0, 0.1) 2rpx,
    rgba(0, 0, 0, 0.1) 4rpx
  );
  pointer-events: none;
  opacity: 0.5;
}

.tv-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20rpx;
  padding: 0 20rpx;
}

.tv-dial {
  width: 50rpx;
  height: 50rpx;
  background: linear-gradient(145deg, #FFD700, #FFA500);
  border-radius: 50%;
  box-shadow:
    inset 0 2rpx 4rpx rgba(255, 255, 255, 0.4),
    0 4rpx 8rpx rgba(0, 0, 0, 0.2);

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8rpx;
    height: 20rpx;
    background: #333;
    border-radius: 4rpx;
  }
}

.tv-speaker {
  display: flex;
  gap: 6rpx;
}

.speaker-line {
  width: 6rpx;
  height: 30rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3rpx;

  &:nth-child(odd) { height: 20rpx; }
}

// 播放按钮 - 在屏幕中心
.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
}

.play-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140rpx;
  height: 140rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: pulse 1.5s ease-out infinite;
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
}

.play-icon {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);
  font-size: 44rpx;
  color: $candy-pink;
  padding-left: 8rpx;
}

// 屏幕上的类型角标
.screen-badge {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: white;
  z-index: 10;

  &.type-picture-book { background: $candy-pink; }
  &.type-nursery-rhyme { background: $candy-green; }
  &.type-video { background: $candy-blue; }
}

// 电视机下方标题
.tv-title {
  margin-top: 24rpx;
  padding: 0 20rpx;
  text-align: center;
}

.title-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// ============================================
// 空状态
// ============================================
.empty-magic {
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 80rpx 40rpx;
}

.empty-wand {
  font-size: 120rpx;
  margin-bottom: 24rpx;
  animation: wave-wand 2s ease-in-out infinite;
}

@keyframes wave-wand {
  0%, 100% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
}

.empty-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #999;
}

// ============================================
// 素材旋转木马
// ============================================
.carousel-section {
  position: relative;
  z-index: 10;
  padding-bottom: 220rpx;
}

.carousel-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

// 类型筛选按钮
.type-filter {
  display: flex;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
  padding: 0 30rpx;
}

.filter-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12rpx 20rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  min-width: 100rpx;

  &.active {
    background: linear-gradient(145deg, $candy-pink, $candy-purple);
    transform: scale(1.05);
    box-shadow: 0 6rpx 20rpx rgba($candy-pink, 0.4);

    .filter-icon {
      transform: scale(1.2);
    }

    .filter-label {
      color: white;
    }
  }
}

.filter-icon {
  font-size: 32rpx;
  margin-bottom: 4rpx;
  transition: transform 0.3s ease;
}

.filter-label {
  font-size: 20rpx;
  color: #666;
  font-weight: 600;
  transition: color 0.3s ease;
}

.header-star {
  font-size: 28rpx;
  animation: spin-star 3s linear infinite;
}

@keyframes spin-star {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.header-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #555;
  letter-spacing: 4rpx;
}

.carousel-track {
  width: 100%;
  white-space: nowrap;
}

.carousel-inner {
  display: inline-flex;
  padding: 20rpx 30rpx 40rpx;
  gap: 24rpx;
}

.carousel-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  width: 160rpx;
  animation: pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;

  &.active {
    .toy-box {
      transform: scale(1.1) translateY(-10rpx);

      .box-front {
        animation: wobble 0.6s ease-in-out;
      }
    }

    .item-label {
      color: #333;
      font-weight: 700;
    }
  }
}

@keyframes pop-in {
  from {
    opacity: 0;
    transform: scale(0.5) translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes wobble {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

.toy-box {
  position: relative;
  width: 120rpx;
  height: 120rpx;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.box-lid {
  position: absolute;
  top: 0;
  left: -5rpx;
  right: -5rpx;
  height: 24rpx;
  background: linear-gradient(180deg,
    rgba(255, 255, 255, 0.4),
    rgba(255, 255, 255, 0.1)
  );
  border-radius: 12rpx 12rpx 4rpx 4rpx;
  z-index: 2;
}

.box-front {
  position: absolute;
  top: 20rpx;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 8rpx 24rpx rgba(0, 0, 0, 0.15),
    inset 0 2rpx 0 rgba(255, 255, 255, 0.3);
}

.type-picture-book .box-front {
  background: linear-gradient(145deg, #FF8A9B, $candy-pink);
}

.type-nursery-rhyme .box-front {
  background: linear-gradient(145deg, #7ED687, $candy-green);
}

.type-video .box-front {
  background: linear-gradient(145deg, #6BB3FF, $candy-blue);
}

.toy-icon text {
  font-size: 48rpx;
  filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.2));
}

.box-shine {
  position: absolute;
  top: 24rpx;
  left: 8rpx;
  width: 24rpx;
  height: 24rpx;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  filter: blur(4rpx);
}

.item-label {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #666;
  text-align: center;
  max-width: 140rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.select-star {
  position: absolute;
  top: -10rpx;
  right: 10rpx;
  font-size: 32rpx;
  animation: star-bounce 1s ease-in-out infinite;
}

@keyframes star-bounce {
  0%, 100% { transform: scale(1) rotate(0); }
  50% { transform: scale(1.2) rotate(10deg); }
}

.scroll-hint {
  text-align: center;
  padding-top: 8rpx;

  text {
    font-size: 22rpx;
    color: #aaa;
    animation: hint-fade 2s ease-in-out infinite;
  }
}

@keyframes hint-fade {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

// ============================================
// 退出区域 - 圆形魔法按钮
// ============================================
.exit-zone {
  position: fixed;
  bottom: calc(30rpx + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  -webkit-touch-callout: none;
  user-select: none;
}

.exit-button {
  position: relative;
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  &.pressing {
    transform: scale(1.1);
    box-shadow: 0 12rpx 40rpx rgba($candy-pink, 0.4);

    .exit-glow {
      opacity: 1;
    }
  }
}

.exit-glow {
  position: absolute;
  top: -10rpx;
  left: -10rpx;
  right: -10rpx;
  bottom: -10rpx;
  border-radius: 50%;
  background: linear-gradient(45deg, $candy-pink, $candy-yellow, $candy-green);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
  filter: blur(10rpx);
}

.exit-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 120rpx;
  height: 120rpx;
}

.progress-ring {
  width: 100%;
  height: 100%;
}

.exit-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rpx;
}

.exit-icon {
  font-size: 40rpx;
  line-height: 1;
}

.exit-text {
  font-size: 20rpx;
  color: #666;
  font-weight: 600;
}

.exit-hint {
  font-size: 22rpx;
  color: #999;
  animation: hint-pulse 2s ease-in-out infinite;
}

@keyframes hint-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

// ============================================
// 退出确认弹窗 - 魔法门
// ============================================
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 40rpx;
}

.magic-door {
  width: 100%;
  max-width: 560rpx;
  animation: door-open 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes door-open {
  from {
    opacity: 0;
    transform: scale(0.8) rotateX(-15deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotateX(0);
  }
}

.door-frame {
  background: linear-gradient(145deg, #8B7355, #6B5344);
  border-radius: 200rpx 200rpx 24rpx 24rpx;
  padding: 16rpx;
  box-shadow:
    0 20rpx 60rpx rgba(0, 0, 0, 0.4),
    inset 0 2rpx 0 rgba(255, 255, 255, 0.1);
}

.door-arch {
  height: 40rpx;
  background: linear-gradient(180deg, #5D4037, #4E342E);
  border-radius: 180rpx 180rpx 0 0;
  margin-bottom: -8rpx;
}

.door-body {
  background: linear-gradient(180deg, #FFF8E1, #FFECB3);
  border-radius: 180rpx 180rpx 16rpx 16rpx;
  padding: 40rpx 30rpx;
}

.door-question {
  text-align: center;
  margin-bottom: 30rpx;
}

.question-title {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.question-text {
  display: block;
  font-size: 64rpx;
  font-weight: 800;
  color: $candy-purple;
  font-family: 'Comic Sans MS', cursive;
}

.answer-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.answer-bubble {
  height: 100rpx;
  background: white;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  border: 4rpx solid transparent;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
    border-color: $candy-purple;
    background: rgba($candy-purple, 0.1);
  }

  text {
    font-size: 40rpx;
    font-weight: 700;
    color: #333;
  }
}

.door-cancel {
  text-align: center;
  padding: 16rpx;

  text {
    font-size: 26rpx;
    color: #888;
  }
}

// ============================================
// 休息提醒 - 月亮睡眠
// ============================================
.rest-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, #1a1a3e, #0d0d2b);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}

.moon-scene {
  text-align: center;
}

.moon {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  margin: 0 auto 40rpx;
  background: linear-gradient(135deg, #FFF9C4, #FFEB3B);
  border-radius: 50%;
  box-shadow:
    0 0 60rpx rgba(255, 235, 59, 0.6),
    0 0 120rpx rgba(255, 235, 59, 0.3);
}

.moon-face {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120rpx;
}

.moon-eye {
  position: absolute;
  top: 0;
  width: 16rpx;
  height: 4rpx;
  background: #5D4037;
  border-radius: 8rpx;

  &.left { left: 20rpx; }
  &.right { right: 20rpx; }
}

.moon-smile {
  position: absolute;
  top: 30rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 20rpx;
  border: 4rpx solid #5D4037;
  border-top: none;
  border-radius: 0 0 40rpx 40rpx;
}

.moon-glow {
  position: absolute;
  top: -20rpx;
  left: -20rpx;
  right: -20rpx;
  bottom: -20rpx;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 235, 59, 0.3) 0%,
    transparent 70%
  );
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 1; }
}

.zzz {
  position: absolute;
  top: 0;
  right: -40rpx;
}

.z {
  display: block;
  font-weight: 800;
  color: white;
  opacity: 0;
  animation: zzz-float 2s ease-in-out infinite;

  &.z1 {
    font-size: 32rpx;
    animation-delay: 0s;
  }
  &.z2 {
    font-size: 24rpx;
    margin-left: 20rpx;
    animation-delay: 0.3s;
  }
  &.z3 {
    font-size: 18rpx;
    margin-left: 40rpx;
    animation-delay: 0.6s;
  }
}

@keyframes zzz-float {
  0% { opacity: 0; transform: translateY(20rpx); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-40rpx); }
}

.rest-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: white;
  margin-bottom: 16rpx;
}

.rest-hint {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 40rpx;
}

.rest-counter {
  width: 120rpx;
  height: 120rpx;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.1);
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 56rpx;
    font-weight: 800;
    color: white;
    font-family: 'Comic Sans MS', cursive;
  }
}
</style>
