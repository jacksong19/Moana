<template>
  <view class="storybook" @tap="handleTap">
    <!-- 魔法背景 -->
    <view class="magic-bg">
      <view class="sparkle" v-for="i in 8" :key="i" :style="getSparkleStyle(i)"></view>
    </view>

    <!-- 绘本内容 - 沉浸式全屏 -->
    <swiper
      v-if="content"
      class="story-swiper"
      :current="currentPage"
      :circular="false"
      :duration="400"
      easing-function="easeInOutCubic"
      @change="onPageChange"
      @animationfinish="onAnimationFinish"
    >
      <swiper-item v-for="(page, index) in content.pages" :key="index">
        <view class="story-page">
          <!-- 全屏故事图片 - 渐进式加载 -->
          <view class="story-image-container">
            <!-- 缩略图（模糊背景，立即显示） -->
            <image
              v-if="page.image_thumb_url && !imageLoaded[index]"
              class="story-image story-image-thumb"
              :src="page.image_thumb_url"
              mode="aspectFit"
            />

            <!-- 原图（淡入效果） -->
            <image
              v-if="page.image_url"
              class="story-image story-image-full"
              :class="{ loaded: imageLoaded[index] }"
              :src="page.image_url"
              mode="aspectFit"
              @load="onImageLoad(index)"
              @error="onImageError(index)"
            />

            <!-- 图片加载占位（无缩略图时显示） -->
            <view v-if="!page.image_thumb_url && !imageLoaded[index]" class="image-placeholder">
              <view class="placeholder-shimmer"></view>
            </view>
          </view>

          <!-- 故事文字卡片 - 童话书页风格 -->
          <view
            class="story-card"
            :class="{ visible: currentPage === index && cardVisible }"
          >
            <!-- 书页装饰 -->
            <view class="page-decor">
              <view class="decor-corner corner-tl"></view>
              <view class="decor-corner corner-tr"></view>
              <view class="decor-corner corner-bl"></view>
              <view class="decor-corner corner-br"></view>
            </view>
            <!-- 纸张质感层 -->
            <view class="page-texture"></view>
            <!-- 文字内容 -->
            <view class="card-content">
              <view class="text-wrapper">
                <text class="story-text">{{ page.text }}</text>
              </view>
              <!-- 页码装饰 -->
              <view class="page-number">
                <text>{{ index + 1 }} / {{ content?.pages?.length || 0 }}</text>
              </view>
            </view>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <!-- 极简顶部 - 只有返回 -->
    <view class="minimal-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="back-touch" @tap.stop="handleClose">
        <view class="back-icon">
          <view class="back-line back-line-1"></view>
          <view class="back-line back-line-2"></view>
        </view>
      </view>
      <!-- 播放状态指示 -->
      <view class="play-indicator" :class="{ playing: isPlaying }">
        <view class="indicator-bar" v-for="i in 3" :key="i"></view>
      </view>
    </view>

    <!-- 底部页码指示器 -->
    <view class="page-dots">
      <view
        v-for="(_, index) in content?.pages || []"
        :key="index"
        class="dot"
        :class="{
          active: index === currentPage,
          passed: index < currentPage
        }"
      ></view>
    </view>

    <!-- 翻页提示 (首次显示) -->
    <view v-if="showSwipeHint" class="swipe-hint">
      <view class="hint-hand">👆</view>
      <text class="hint-label">滑动翻页</text>
    </view>

    <!-- 暂停遮罩 -->
    <view v-if="showPauseOverlay" class="pause-overlay">
      <view class="pause-icon">
        <view class="pause-bar"></view>
        <view class="pause-bar"></view>
      </view>
      <text class="pause-text">已暂停 · 点击继续</text>
    </view>

    <!-- 加载状态 - 优雅的书本动画 -->
    <view v-if="loading" class="loading-screen">
      <view class="book-loader">
        <view class="book-page page-left"></view>
        <view class="book-page page-right"></view>
        <view class="book-spine"></view>
      </view>
      <text class="loading-text">正在打开故事书...</text>
    </view>

    <!-- 完成动画 -->
    <view v-if="showComplete" class="complete-screen">
      <view class="complete-stars">
        <text v-for="i in 5" :key="i" class="star" :style="{ animationDelay: i * 0.1 + 's' }">⭐</text>
      </view>
      <text class="complete-title">故事结束啦！</text>
      <text class="complete-subtitle">{{ content?.title }}</text>
      <view class="complete-actions">
        <view class="action-btn share-btn" @tap.stop="handleSharePoster">
          <text class="btn-icon">📤</text>
          <text class="btn-text">分享海报</text>
        </view>
        <view class="action-btn close-btn" @tap.stop="closeComplete">
          <text class="btn-text">返回</text>
        </view>
      </view>
    </view>

    <!-- 海报生成画布（隐藏） -->
    <canvas
      canvas-id="posterCanvas"
      class="poster-canvas"
      style="position: fixed; left: -9999px; width: 540px; height: 960px;"
    />

    <!-- 时间提醒 -->
    <view v-if="showTimeWarning" class="time-overlay">
      <view class="time-modal">
        <text class="time-emoji">{{ warningType === 'rest' ? '🌙' : '😴' }}</text>
        <text class="time-title">{{ warningTitle }}</text>
        <text class="time-desc">{{ warningMessage }}</text>
        <view class="time-actions">
          <view v-if="warningType === 'rest'" class="time-btn secondary" @tap="continuePlay">
            <text>再看一会</text>
          </view>
          <view class="time-btn primary" @tap="handleWarningConfirm">
            <text>{{ warningType === 'rest' ? '休息一下' : '好的' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, getCurrentInstance } from 'vue'
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { useChildStore } from '@/stores/child'
import { useContentStore } from '@/stores/content'
import { startPlay, updateProgress, completePlay, submitInteraction } from '@/api/play'
import timeLimitManager from '@/utils/time-limit'
import { generatePoster, savePosterToAlbum } from '@/utils/poster'
import perf from '@/utils/performance'
import type { PictureBook, PictureBookPage } from '@/api/content'

const childStore = useChildStore()
const contentStore = useContentStore()

// 状态
const contentId = ref('')
const content = ref<PictureBook | null>(null)
const loading = ref(true)
const currentPage = ref(0)
const isPlaying = ref(true)  // 默认自动播放
const playHistoryId = ref('')
const showInteraction = ref(false)
const playStartTime = ref(0)
const lastUpdateTime = ref(0)
const UPDATE_INTERVAL = 5000

// UI 状态
const imageLoaded = ref<boolean[]>([])
const cardVisible = ref(false)
const showPauseOverlay = ref(false)
const showSwipeHint = ref(false)
const showComplete = ref(false)
const statusBarHeight = ref(44)

// 时间提醒
const showTimeWarning = ref(false)
const warningType = ref<'rest' | 'session' | 'daily'>('rest')
const warningTitle = ref('')
const warningMessage = ref('')

// 海报分享
const generatingPoster = ref(false)
const instance = getCurrentInstance()

// 音频
let audioContext: UniApp.InnerAudioContext | null = null
let autoPlayTimer: number | null = null
let checkTimer: number | null = null
let completeTimer: number | null = null  // 完成后自动返回的定时器
const audioReady = ref(false)
// 音频缓存：页码 -> 本地文件路径
const audioCache = ref<Map<number, string>>(new Map())

// 计算属性
const totalPages = computed(() => content.value?.pages?.length || 0)

// 星星闪烁样式
function getSparkleStyle(i: number) {
  const positions = [
    { top: '10%', left: '8%' }, { top: '15%', left: '85%' },
    { top: '35%', left: '5%' }, { top: '40%', left: '92%' },
    { top: '60%', left: '10%' }, { top: '65%', left: '88%' },
    { top: '80%', left: '15%' }, { top: '85%', left: '80%' }
  ]
  const pos = positions[i - 1] || { top: '50%', left: '50%' }
  const delay = (i * 0.5) % 4
  const size = 4 + (i % 3) * 2
  return `top: ${pos.top}; left: ${pos.left}; width: ${size}rpx; height: ${size}rpx; animation-delay: ${delay}s;`
}

// 互动图标
function getInteractionIcon(type: string) {
  const icons: Record<string, string> = {
    tap: '👆',
    drag: '✋',
    shake: '📱'
  }
  return icons[type] || '✨'
}

// 页面切换
function onPageChange(e: any) {
  const newPage = e.detail.current
  currentPage.value = newPage
  cardVisible.value = false
  showInteraction.value = false

  // 停止当前音频
  stopCurrentAudio()

  // 智能预加载相邻页
  preloadAdjacentImages(newPage)

  // 更新进度
  updatePlayProgress()
}

// 动画完成后显示文字卡片
function onAnimationFinish() {
  nextTick(() => {
    cardVisible.value = true
    // 延迟播放音频和显示互动
    setTimeout(() => {
      if (isPlaying.value) {
        playCurrentPageAudio()
      }
    }, 300)
  })
}

// 点击屏幕 - 暂停/播放
function handleTap() {
  if (loading.value || showTimeWarning.value || showComplete.value) return

  isPlaying.value = !isPlaying.value
  showPauseOverlay.value = !isPlaying.value

  if (isPlaying.value) {
    // 继续播放
    setTimeout(() => {
      showPauseOverlay.value = false
      playCurrentPageAudio()
    }, 500)
  } else {
    // 暂停
    stopCurrentAudio()
    stopAutoPlay()
  }
}

// 图片加载
function onImageLoad(index: number) {
  imageLoaded.value[index] = true

  // 首图加载性能埋点
  if (index === 0) {
    perf.measure('首图加载时间', 'pageLoad')
  }

  // 首页加载完成后显示卡片
  if (index === currentPage.value && !cardVisible.value) {
    setTimeout(() => {
      cardVisible.value = true
      if (isPlaying.value) {
        playCurrentPageAudio()
      }
    }, 200)
  }
}

function onImageError(index: number) {
  imageLoaded.value[index] = true
}

// 智能预加载 - 缩略图优先，原图延迟错开
function preloadAdjacentImages(centerIndex: number, range = 3) {
  if (!content.value?.pages?.length) return

  // 预加载当前页及后续 range 页
  const indices: number[] = []
  for (let i = centerIndex; i <= centerIndex + range && i < content.value.pages.length; i++) {
    indices.push(i)
  }
  // 也预加载前一页（用于回退）
  if (centerIndex > 0) indices.unshift(centerIndex - 1)

  indices.forEach((index, offset) => {
    const page = content.value!.pages[index]

    // 1. 优先预加载缩略图（小文件，快速显示）
    if (page.image_thumb_url) {
      uni.getImageInfo({
        src: page.image_thumb_url,
        success: () => console.log(`[预加载] 缩略图 ${index + 1} 完成`),
        fail: () => { /* 静默失败 */ }
      })
    }

    // 2. 延迟预加载原图（避免带宽竞争，错开请求时间）
    if (!imageLoaded.value[index] && page.image_url) {
      setTimeout(() => {
        uni.downloadFile({
          url: page.image_url,
          success: (res) => {
            if (res.statusCode === 200) {
              imageLoaded.value[index] = true
              console.log(`[预加载] 原图 ${index + 1} 完成`)
            }
          },
          fail: () => {
            // 降级使用 getImageInfo
            uni.getImageInfo({
              src: page.image_url!,
              success: () => { imageLoaded.value[index] = true },
              fail: () => { /* 静默失败 */ }
            })
          }
        })
      }, 200 * offset)  // 每张图片错开 200ms
    }
  })
}

// 预加载指定页音频（下载到本地缓存）
function preloadAudio(pageIndex: number) {
  if (!content.value?.pages?.length) return
  if (pageIndex < 0 || pageIndex >= content.value.pages.length) return
  // 已缓存则跳过
  if (audioCache.value.has(pageIndex)) return

  const page = content.value.pages[pageIndex]
  if (!page.audio_url) return

  let audioUrl = page.audio_url
  if (audioUrl.startsWith('http://')) {
    audioUrl = audioUrl.replace('http://', 'https://')
  }

  console.log(`[预加载] 开始下载音频 ${pageIndex + 1}...`)
  uni.downloadFile({
    url: audioUrl,
    success: (res) => {
      if (res.statusCode === 200 && res.tempFilePath) {
        audioCache.value.set(pageIndex, res.tempFilePath)
        console.log(`[预加载] 音频 ${pageIndex + 1} 完成，本地路径:`, res.tempFilePath)
      }
    },
    fail: (err) => {
      console.warn(`[预加载] 音频 ${pageIndex + 1} 失败:`, err)
    }
  })
}

// 批量预加载多页音频
function preloadAudioBatch(startIndex: number, count = 3) {
  for (let i = startIndex; i < startIndex + count; i++) {
    preloadAudio(i)
  }
}

// 兼容旧函数名
function preloadNextAudio(pageIndex: number) {
  preloadAudio(pageIndex + 1)
}

// 等待图片加载完成
function waitForImageLoad(pageIndex: number, timeout = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    // 已经加载完成
    if (imageLoaded.value[pageIndex]) {
      resolve(true)
      return
    }

    const startTime = Date.now()
    const checkInterval = setInterval(() => {
      if (imageLoaded.value[pageIndex]) {
        clearInterval(checkInterval)
        resolve(true)
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval)
        console.warn(`[等待图片] 页面 ${pageIndex + 1} 超时`)
        resolve(false) // 超时也继续，避免卡死
      }
    }, 100)
  })
}

// 等待音频缓存完成
function waitForAudioCache(pageIndex: number, timeout = 2000): Promise<string | null> {
  return new Promise((resolve) => {
    // 已缓存
    if (audioCache.value.has(pageIndex)) {
      resolve(audioCache.value.get(pageIndex)!)
      return
    }

    const startTime = Date.now()
    const checkInterval = setInterval(() => {
      if (audioCache.value.has(pageIndex)) {
        clearInterval(checkInterval)
        resolve(audioCache.value.get(pageIndex)!)
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval)
        resolve(null) // 超时返回 null，使用原始 URL
      }
    }, 50)
  })
}

// 音频播放 - 优化：等待图片加载 + 使用本地缓存音频
async function playCurrentPageAudio() {
  if (!content.value?.pages?.length || !isPlaying.value) return

  stopAutoPlay()
  const pageIndex = currentPage.value
  const page = content.value.pages[pageIndex]
  if (!page) return

  // 等待当前页图片加载完成（最多等 5 秒）
  if (!imageLoaded.value[pageIndex]) {
    console.log(`[绘本] 等待页面 ${pageIndex + 1} 图片加载...`)
    await waitForImageLoad(pageIndex, 5000)
  }

  // 再次检查播放状态（等待期间可能已暂停）
  if (!isPlaying.value) return

  // 预加载后续页面的图片和音频
  preloadAdjacentImages(pageIndex + 1, 2)
  preloadAudioBatch(pageIndex + 1, 3)


  if (page.audio_url) {
    // 销毁旧实例
    if (audioContext) {
      try { audioContext.destroy() } catch (e) { /* ignore */ }
      audioContext = null
    }
    audioReady.value = false

    // 优先使用本地缓存，等待最多 2 秒
    let audioSrc: string
    const cachedPath = await waitForAudioCache(pageIndex, 2000)

    if (cachedPath) {
      audioSrc = cachedPath
      console.log(`[绘本音频] 使用本地缓存: ${pageIndex + 1}`)
    } else {
      // 没有缓存，使用原始 URL
      let audioUrl = page.audio_url
      if (audioUrl.startsWith('http://')) {
        audioUrl = audioUrl.replace('http://', 'https://')
      }
      audioSrc = encodeURI(audioUrl)
      console.log(`[绘本音频] 使用网络URL: ${pageIndex + 1}`)
    }

    // 再次检查播放状态
    if (!isPlaying.value) return

    // 设置音频选项（开发工具不支持，静默忽略）
    try {
      uni.setInnerAudioOption({
        obeyMuteSwitch: false,
        mixWithOther: true
      })
    } catch (e) { /* 开发工具不支持 */ }

    audioContext = uni.createInnerAudioContext()
    audioContext.volume = 1.0

    audioContext.onPlay(() => {
      console.log('[绘本音频] 播放开始, 页面:', pageIndex + 1)
      audioReady.value = true
    })
    audioContext.onEnded(() => { onAudioEnded() })
    audioContext.onError((err: any) => {
      console.error('[绘本音频] 播放错误:', err?.errMsg || err?.errCode || err)
      audioReady.value = false
      startFallbackTimer()
    })

    audioContext.src = audioSrc

    setTimeout(() => {
      if (audioContext && isPlaying.value) {
        audioContext.play()
      }
    }, 50)
  } else {
    // 无音频，使用定时器
    startFallbackTimer()
  }
}

function stopCurrentAudio() {
  if (audioContext && audioReady.value) {
    try { audioContext.pause() } catch (e) { /* ignore */ }
  }
}

// 翻到下一页 - 优化：等待下一页图片加载完成
async function goToNextPage() {
  if (!isPlaying.value) return

  let nextPage = currentPage.value + 1

  // 循环播放：最后一页后回到第一页
  if (nextPage >= totalPages.value) {
    nextPage = 0
    console.log('[绘本] 循环播放：回到第一页')
  }

  // 等待下一页图片加载完成（最多等 3 秒）
  if (!imageLoaded.value[nextPage]) {
    console.log(`[绘本] 等待下一页 ${nextPage + 1} 图片加载...`)
    await waitForImageLoad(nextPage, 3000)
  }

  // 再次检查播放状态
  if (!isPlaying.value) return

  currentPage.value = nextPage
}

function onAudioEnded() {
  if (!isPlaying.value) return

  // 短暂延迟后翻页（让用户有时间看完当前页）
  setTimeout(() => {
    goToNextPage()
  }, 600)
}

function startFallbackTimer() {
  stopAutoPlay()
  if (!content.value?.pages?.length || !isPlaying.value) return

  const page = content.value.pages[currentPage.value]
  const duration = (page?.duration || 5) * 1000

  autoPlayTimer = setTimeout(() => {
    goToNextPage()
  }, duration) as unknown as number
}

function stopAutoPlay() {
  if (autoPlayTimer) {
    clearTimeout(autoPlayTimer)
    autoPlayTimer = null
  }
}

// 进度更新
async function updatePlayProgress(force = false) {
  if (!playHistoryId.value) return

  const now = Date.now()
  if (!force && now - lastUpdateTime.value < UPDATE_INTERVAL) return
  lastUpdateTime.value = now

  try {
    const timeSpent = Math.round((now - playStartTime.value) / 1000)
    await updateProgress(playHistoryId.value, currentPage.value + 1, timeSpent)

    uni.setStorageSync(`play_progress_${contentId.value}`, {
      page: currentPage.value,
      time: timeSpent,
      updatedAt: now
    })
  } catch (e) {
    // 静默失败，已本地缓存
  }
}

// 完成
async function handleComplete() {
  isPlaying.value = false
  stopAutoPlay()
  showComplete.value = true

  if (playHistoryId.value) {
    try { await completePlay(playHistoryId.value) } catch (e) { /* ignore */ }
  }

  // 不在这里结束会话，让儿童模式页面统一管理

  // 延长等待时间，给用户分享海报的机会
  // 保存定时器引用，以便在页面销毁或用户主动关闭时清除
  if (completeTimer) clearTimeout(completeTimer)
  completeTimer = setTimeout(() => {
    if (showComplete.value && !generatingPoster.value) {
      uni.navigateBack()
    }
  }, 8000) as unknown as number
}

// 关闭完成界面
function closeComplete() {
  if (generatingPoster.value) return
  if (completeTimer) {
    clearTimeout(completeTimer)
    completeTimer = null
  }
  uni.navigateBack()
}

// 互动
async function handleInteraction(page: PictureBookPage, pageIndex: number) {
  if (!page.interaction || !playHistoryId.value) return

  showInteraction.value = false
  const startTime = Date.now()

  try {
    await submitInteraction({
      play_history_id: playHistoryId.value,
      page_number: pageIndex + 1,
      interaction_type: page.interaction.type,
      response_data: { completed: true },
      response_time_ms: Date.now() - startTime
    })

    uni.showToast({ title: '太棒了！', icon: 'success' })
  } catch (e) { /* ignore */ }
}

// 时间限制
function checkTimeLimit() {
  const result = timeLimitManager.checkLimits()

  if (result.exceeded) {
    isPlaying.value = false
    stopAutoPlay()
    stopCurrentAudio()

    warningType.value = result.type || 'session'
    warningTitle.value = result.type === 'daily' ? '今日时间到' : '休息时间到'
    warningMessage.value = result.message
    showTimeWarning.value = true
  } else if (result.reminder) {
    isPlaying.value = false
    stopAutoPlay()
    stopCurrentAudio()

    warningType.value = 'rest'
    warningTitle.value = '眼睛休息'
    warningMessage.value = result.message
    showTimeWarning.value = true
  }
}

function continuePlay() {
  showTimeWarning.value = false
  timeLimitManager.resetReminder()
  isPlaying.value = true
  playCurrentPageAudio()
}

function handleWarningConfirm() {
  showTimeWarning.value = false

  if (warningType.value !== 'rest') {
    // 不在这里结束会话，让儿童模式页面统一管理
    uni.navigateBack()
  } else {
    timeLimitManager.resetReminder()
  }
}

function handleClose() {
  isPlaying.value = false
  stopAutoPlay()
  stopCurrentAudio()
  if (completeTimer) {
    clearTimeout(completeTimer)
    completeTimer = null
  }
  // 不在这里结束会话，让儿童模式页面统一管理
  uni.navigateBack()
}

// 生成分享海报
async function handleSharePoster() {
  if (!content.value || generatingPoster.value) return

  generatingPoster.value = true
  uni.showLoading({ title: '生成海报中...', mask: true })

  try {
    const posterPath = await generatePoster('posterCanvas', {
      title: content.value.title || '童话绘本',
      coverUrl: content.value.pages?.[0]?.image_url || content.value.cover_url || '',
      childName: childStore.currentChild?.name || '宝贝',
      theme: content.value.theme_topic || ''
    }, instance)

    uni.hideLoading()

    // 保存到相册
    await savePosterToAlbum(posterPath)
    uni.showToast({ title: '已保存到相册', icon: 'success' })
  } catch (e: any) {
    uni.hideLoading()
    console.error('[海报生成失败]', e)
    uni.showToast({
      title: e.message || '生成失败，请重试',
      icon: 'none'
    })
  } finally {
    generatingPoster.value = false
  }
}

// 加载内容 - 优化：优先使用临时存储
async function loadContent() {
  // 1. 优先从临时存储读取（刚生成的绘本，最快）
  const tempBook = uni.getStorageSync('temp_picture_book')
  if (tempBook) {
    console.log('[loadContent] 使用临时存储数据')
    content.value = tempBook
    uni.removeStorageSync('temp_picture_book')
    perf.measure('数据加载（临时存储）', 'pageLoad')
    initAfterLoad()
    loading.value = false
    return
  }

  // 2. 使用 store 中的数据（从生成页跳转，需要 ID 匹配或无 ID 参数）
  // 修复：只有当 store 中的内容 ID 与 URL 参数 ID 匹配时才使用缓存
  const storeContent = contentStore.currentContent as PictureBook | null
  if (storeContent && (!contentId.value || storeContent.id === contentId.value)) {
    console.log('[loadContent] 使用 store 数据, ID:', storeContent.id)
    content.value = storeContent
    perf.measure('数据加载（Store 缓存）', 'pageLoad')
    initAfterLoad()
    loading.value = false
    return
  }

  // 3. 从 API 加载
  if (!contentId.value) {
    loading.value = false
    return
  }

  try {
    await contentStore.fetchContentDetail(contentId.value)
    content.value = contentStore.currentContent as PictureBook
    perf.measure('API 响应时间', 'pageLoad')
    initAfterLoad()
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
  } finally {
    loading.value = false
  }
}

// 加载后初始化
function initAfterLoad() {
  if (!content.value?.pages?.length) return

  // 初始化图片状态和音频缓存
  imageLoaded.value = new Array(content.value.pages.length).fill(false)
  audioCache.value.clear()

  // 激进预加载：前 5 页图片 + 前 3 页音频
  console.log(`[绘本] 开始预加载，共 ${content.value.pages.length} 页`)
  preloadAdjacentImages(0, 5)
  preloadAudioBatch(0, 3) // 预加载前 3 页音频

  // 开始播放会话
  startPlaySession()

  // 时间限制（使用 ensureSession 避免重置已激活的会话）
  timeLimitManager.ensureSession()
  checkTimer = setInterval(checkTimeLimit, 30000) as unknown as number

  // 首次使用提示
  const hasSeenHint = uni.getStorageSync('storybook_hint_seen')
  if (!hasSeenHint) {
    showSwipeHint.value = true
    setTimeout(() => {
      showSwipeHint.value = false
      uni.setStorageSync('storybook_hint_seen', true)
    }, 3000)
  }
}

async function startPlaySession() {
  if (!childStore.currentChild || !content.value) return

  // 防御性检查：content.id 可能为 undefined（后端返回数据不完整）
  if (!content.value.id) {
    console.warn('[startPlaySession] 缺少 content.id，跳过播放会话创建')
    return
  }

  try {
    const res = await startPlay(childStore.currentChild.id, content.value.id, 'picture_book')
    playHistoryId.value = res.play_history_id
    playStartTime.value = Date.now()

    // 断点续播
    if (res.resumed_from?.page > 0) {
      currentPage.value = res.resumed_from.page - 1
    }
  } catch (e) {
    console.warn('[startPlaySession] 播放会话创建失败')
  }
}

// 生命周期
onLoad((options) => {
  // 性能监控：页面加载开始
  perf.clear()
  perf.mark('pageLoad')

  contentId.value = options?.id || ''

  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 44

  if (options?.autoplay === '1') {
    isPlaying.value = true
  }
})

onMounted(() => {
  loadContent()
})

onShareAppMessage(() => ({
  title: content.value?.title || '来看这个有趣的绘本',
  path: `/pages/play/picture-book?id=${contentId.value}`,
  imageUrl: content.value?.cover_url || ''
}))

onShareTimeline(() => ({
  title: content.value?.title || '来看这个有趣的绘本',
  query: `id=${contentId.value}`,
  imageUrl: content.value?.cover_url || ''
}))

onUnmounted(() => {
  updatePlayProgress(true)
  stopAutoPlay()
  if (checkTimer) clearInterval(checkTimer)
  if (completeTimer) clearTimeout(completeTimer)
  audioContext?.destroy()
})
</script>

<style lang="scss" scoped>
// ============================================
// 童话故事书风格 - Storybook Whimsy
// ============================================

// 色彩系统 - 温暖童话色
$story-cream: #FFF8F0;
$story-warm: #FFE4C9;
$story-gold: #FFB347;
$story-rose: #FFB5BA;
$story-sage: #B8D4C3;
$story-night: #2D3047;
$story-text: #4A4458;

// 字体 - 如果没有自定义字体，使用系统圆角字体
$font-story: -apple-system, 'PingFang SC', 'Hiragino Sans GB', sans-serif;

.storybook {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
  overflow: hidden;
}

// 魔法背景星星
.magic-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.sparkle {
  position: absolute;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, transparent 70%);
  border-radius: 50%;
  animation: sparkle 4s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.5); }
}

// 故事轮播
.story-swiper {
  width: 100%;
  height: 100%;
  z-index: 1;
}

.story-page {
  width: 100%;
  height: 100%;
  position: relative;
}

// 全屏故事图片
.story-image-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.story-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

// 缩略图样式 - 模糊放大背景
.story-image-thumb {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  filter: blur(20rpx);
  transform: scale(1.05);
  z-index: 1;
}

// 原图样式 - 淡入效果
.story-image-full {
  position: relative;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.4s ease-in-out;

  &.loaded {
    opacity: 1;
  }
}

// 图片占位 - 优雅的闪烁效果
.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #2d3047 0%, #1a1a2e 100%);
  overflow: hidden;
}

.placeholder-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.05) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  to { left: 100%; }
}

// 故事文字卡片 - 童话书页风格
.story-card {
  position: absolute;
  bottom: 32rpx;
  left: 24rpx;
  right: 24rpx;
  margin-bottom: env(safe-area-inset-bottom);
  background: linear-gradient(
    165deg,
    #FDF8F3 0%,
    #F9F3EC 30%,
    #FBF6F0 70%,
    #F5EEE6 100%
  );
  border-radius: 24rpx;
  padding: 40rpx 36rpx 32rpx;
  transform: translateY(60rpx) scale(0.95);
  opacity: 0;
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow:
    0 8rpx 32rpx rgba(0, 0, 0, 0.25),
    0 2rpx 8rpx rgba(0, 0, 0, 0.15),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
  overflow: hidden;

  &.visible {
    transform: translateY(0) scale(1);
    opacity: 1;
    animation: gentle-float 4s ease-in-out infinite 0.6s;
  }
}

@keyframes gentle-float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-4rpx) scale(1); }
}

// 书页装饰角
.page-decor {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.decor-corner {
  position: absolute;
  width: 48rpx;
  height: 48rpx;
  opacity: 0.4;

  &::before, &::after {
    content: '';
    position: absolute;
    background: linear-gradient(135deg, #C9A86C 0%, #E8D5B7 100%);
  }

  &.corner-tl {
    top: 12rpx;
    left: 12rpx;
    &::before { top: 0; left: 0; width: 20rpx; height: 3rpx; border-radius: 2rpx; }
    &::after { top: 0; left: 0; width: 3rpx; height: 20rpx; border-radius: 2rpx; }
  }

  &.corner-tr {
    top: 12rpx;
    right: 12rpx;
    &::before { top: 0; right: 0; width: 20rpx; height: 3rpx; border-radius: 2rpx; }
    &::after { top: 0; right: 0; width: 3rpx; height: 20rpx; border-radius: 2rpx; }
  }

  &.corner-bl {
    bottom: 12rpx;
    left: 12rpx;
    &::before { bottom: 0; left: 0; width: 20rpx; height: 3rpx; border-radius: 2rpx; }
    &::after { bottom: 0; left: 0; width: 3rpx; height: 20rpx; border-radius: 2rpx; }
  }

  &.corner-br {
    bottom: 12rpx;
    right: 12rpx;
    &::before { bottom: 0; right: 0; width: 20rpx; height: 3rpx; border-radius: 2rpx; }
    &::after { bottom: 0; right: 0; width: 3rpx; height: 20rpx; border-radius: 2rpx; }
  }
}

// 书签装饰
.page-bookmark {
  position: absolute;
  top: -8rpx;
  right: 40rpx;
  width: 44rpx;
  height: 56rpx;
  background: linear-gradient(180deg, #E85D4A 0%, #D64A3A 100%);
  border-radius: 0 0 8rpx 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(232, 93, 74, 0.3);

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    border-left: 22rpx solid transparent;
    border-right: 22rpx solid transparent;
    border-bottom: 12rpx solid #FDF8F3;
  }

  .bookmark-icon {
    font-size: 20rpx;
    position: relative;
    top: -4rpx;
  }
}

// 纸张纹理
.page-texture {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(ellipse at 20% 80%, rgba(200, 180, 140, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(180, 160, 120, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(220, 200, 160, 0.04) 0%, transparent 70%);
  pointer-events: none;
}

.card-content {
  position: relative;
  z-index: 1;
}

.text-wrapper {
  position: relative;
}

.story-text {
  display: block;
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  font-size: 34rpx;
  line-height: 2;
  color: #3D3425;
  letter-spacing: 1.5rpx;
  text-align: center;
  text-shadow: 0 1rpx 0 rgba(255, 255, 255, 0.8);
}

// 页码装饰
.page-number {
  display: flex;
  justify-content: center;
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid rgba(201, 168, 108, 0.2);

  text {
    font-size: 22rpx;
    color: #B8A88A;
    font-family: Georgia, 'Times New Roman', serif;
    font-style: italic;
    letter-spacing: 4rpx;
  }
}

// 互动提示 - 童话书页配色
.interaction-hint {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 24rpx;
  padding: 18rpx 32rpx;
  background: linear-gradient(135deg, #C9A86C 0%, #D4B87A 100%);
  border-radius: 100rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 4rpx 16rpx rgba(201, 168, 108, 0.4),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.4);
  animation: hint-pulse 2s ease-in-out infinite;
}

@keyframes hint-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4rpx 16rpx rgba(201, 168, 108, 0.4), inset 0 1rpx 0 rgba(255, 255, 255, 0.4);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 6rpx 24rpx rgba(201, 168, 108, 0.6), inset 0 1rpx 0 rgba(255, 255, 255, 0.4);
  }
}

.hint-icon {
  font-size: 28rpx;
}

.hint-text {
  font-size: 26rpx;
  color: #3D3425;
  font-weight: 600;
  letter-spacing: 1rpx;
}

// 极简顶部
.minimal-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  z-index: 10;
}

.back-touch {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  width: 44rpx;
  height: 44rpx;
  position: relative;
}

.back-line {
  position: absolute;
  left: 8rpx;
  width: 24rpx;
  height: 3rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 2rpx;

  &.back-line-1 {
    top: 15rpx;
    transform: rotate(-45deg);
    transform-origin: left center;
  }

  &.back-line-2 {
    bottom: 15rpx;
    transform: rotate(45deg);
    transform-origin: left center;
  }
}

// 播放状态指示器
.play-indicator {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 16rpx;
}

.indicator-bar {
  width: 6rpx;
  height: 24rpx;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 3rpx;
  transition: all 0.3s ease;
}

.play-indicator.playing .indicator-bar {
  background: $story-gold;
  animation: sound-wave 0.8s ease-in-out infinite;

  &:nth-child(1) { animation-delay: 0s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.4s; }
}

@keyframes sound-wave {
  0%, 100% { height: 16rpx; }
  50% { height: 32rpx; }
}

// 页码指示器
.page-dots {
  position: absolute;
  bottom: calc(200rpx + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16rpx;
  z-index: 10;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transition: all 0.3s ease;

  &.passed {
    background: rgba($story-gold, 0.5);
  }

  &.active {
    width: 36rpx;
    border-radius: 6rpx;
    background: $story-gold;
  }
}

// 滑动提示
.swipe-hint {
  position: absolute;
  bottom: calc(320rpx + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  animation: hint-float 2s ease-in-out infinite;
  z-index: 20;
}

@keyframes hint-float {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-20rpx); }
}

.hint-hand {
  font-size: 60rpx;
  animation: swipe-motion 1.5s ease-in-out infinite;
}

@keyframes swipe-motion {
  0%, 100% { transform: translateX(-20rpx); }
  50% { transform: translateX(20rpx); }
}

.hint-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(0, 0, 0, 0.5);
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
}

// 暂停遮罩
.pause-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32rpx;
  z-index: 30;
  animation: fade-in 0.3s ease;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.pause-icon {
  display: flex;
  gap: 20rpx;
}

.pause-bar {
  width: 16rpx;
  height: 80rpx;
  background: $story-cream;
  border-radius: 8rpx;
}

.pause-text {
  font-size: 30rpx;
  color: rgba(255, 255, 255, 0.8);
}

// 加载屏幕 - 书本动画
.loading-screen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(160deg, #1a1a2e, #16213e);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 48rpx;
  z-index: 100;
}

.book-loader {
  width: 120rpx;
  height: 100rpx;
  position: relative;
  perspective: 600rpx;
}

.book-page {
  position: absolute;
  width: 50%;
  height: 100%;
  background: $story-cream;
  transform-origin: left center;

  &.page-left {
    left: 0;
    border-radius: 4rpx 0 0 4rpx;
  }

  &.page-right {
    right: 0;
    border-radius: 0 4rpx 4rpx 0;
    animation: page-flip 1.2s ease-in-out infinite;
    transform-style: preserve-3d;
  }
}

@keyframes page-flip {
  0%, 100% { transform: rotateY(0deg); }
  50% { transform: rotateY(-160deg); }
}

.book-spine {
  position: absolute;
  left: 50%;
  top: 0;
  width: 8rpx;
  height: 100%;
  background: $story-gold;
  transform: translateX(-50%);
  border-radius: 4rpx;
}

.loading-text {
  font-size: 30rpx;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 2rpx;
}

// 完成屏幕
.complete-screen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(160deg, #1a1a2e, #16213e);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32rpx;
  z-index: 100;
  animation: fade-in 0.5s ease;
}

.complete-stars {
  display: flex;
  gap: 16rpx;
}

.star {
  font-size: 60rpx;
  animation: star-pop 0.5s ease backwards;
}

@keyframes star-pop {
  0% { transform: scale(0) rotate(-180deg); opacity: 0; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.complete-title {
  font-size: 48rpx;
  color: $story-cream;
  font-weight: 600;
  letter-spacing: 4rpx;
}

.complete-subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.6);
}

.complete-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 48rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 40rpx;
  border-radius: 100rpx;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.95);
  }
}

.share-btn {
  background: linear-gradient(135deg, $story-gold, #FF9500);
  box-shadow: 0 8rpx 24rpx rgba($story-gold, 0.4);
}

.close-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 2rpx solid rgba(255, 255, 255, 0.3);

  .btn-text {
    color: rgba(255, 255, 255, 0.9);
  }
}

.btn-icon {
  font-size: 32rpx;
}

.btn-text {
  font-size: 28rpx;
  font-weight: 600;
  color: $story-night;
}

// 时间提醒
.time-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
  z-index: 200;
}

.time-modal {
  width: 100%;
  max-width: 560rpx;
  background: linear-gradient(160deg, #2d3047, #1a1a2e);
  border-radius: 32rpx;
  padding: 48rpx 40rpx;
  text-align: center;
  border: 2rpx solid rgba(255, 255, 255, 0.1);
}

.time-emoji {
  display: block;
  font-size: 100rpx;
  margin-bottom: 24rpx;
}

.time-title {
  display: block;
  font-size: 40rpx;
  color: $story-cream;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.time-desc {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 40rpx;
  line-height: 1.6;
}

.time-actions {
  display: flex;
  gap: 20rpx;
}

.time-btn {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 44rpx;
  transition: transform 0.2s ease;

  text {
    font-size: 30rpx;
    font-weight: 500;
  }

  &:active {
    transform: scale(0.96);
  }

  &.secondary {
    background: rgba(255, 255, 255, 0.1);
    border: 2rpx solid rgba(255, 255, 255, 0.2);

    text { color: rgba(255, 255, 255, 0.8); }
  }

  &.primary {
    background: linear-gradient(135deg, $story-gold, #FF9500);

    text { color: $story-night; }
  }
}
</style>
