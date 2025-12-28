# 产品打磨实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 完成加载动画优化、反馈接口对接、学习报告完善、内容分享优化四个功能

**Architecture:**
- 加载动画：增强 LoadingState 组件，添加内容卡片骨架屏
- 反馈接口：在 api/feedback.ts 添加提交接口，对接后端 API
- 学习报告：从 play API 获取真实统计数据并展示
- 内容分享：使用 canvas 生成分享海报图片

**Tech Stack:** Vue 3, TypeScript, uni-app, Canvas API

---

## Task 1: 加载动画优化 - 骨架屏组件

**Files:**
- Create: `src/components/SkeletonCard/SkeletonCard.vue`
- Modify: `src/components/LoadingState/LoadingState.vue`
- Modify: `src/pages/library/index.vue`

**Step 1: 创建骨架屏组件**

```vue
<!-- src/components/SkeletonCard/SkeletonCard.vue -->
<template>
  <view class="skeleton-card" :class="type">
    <view class="skeleton-cover skeleton-animate"></view>
    <view class="skeleton-content">
      <view class="skeleton-title skeleton-animate"></view>
      <view class="skeleton-desc skeleton-animate"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  type?: 'horizontal' | 'vertical'
}>(), {
  type: 'horizontal'
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.skeleton-card {
  display: flex;
  padding: $spacing-md;
  background: $bg-card;
  border-radius: $radius-lg;
  margin-bottom: $spacing-md;

  &.horizontal {
    flex-direction: row;
    .skeleton-cover {
      width: 160rpx;
      height: 120rpx;
      border-radius: $radius-md;
      margin-right: $spacing-md;
    }
  }

  &.vertical {
    flex-direction: column;
    .skeleton-cover {
      width: 100%;
      height: 200rpx;
      border-radius: $radius-md;
      margin-bottom: $spacing-sm;
    }
  }
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: $spacing-sm;
}

.skeleton-title {
  height: 32rpx;
  width: 60%;
  border-radius: $radius-sm;
}

.skeleton-desc {
  height: 24rpx;
  width: 40%;
  border-radius: $radius-sm;
}

.skeleton-animate {
  background: linear-gradient(
    90deg,
    $border-light 25%,
    $bg-soft 50%,
    $border-light 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
```

**Step 2: 在内容库页面使用骨架屏**

修改 `src/pages/library/index.vue`，在加载时显示骨架屏：

```vue
<!-- 在 template 中添加 -->
<view v-if="loading" class="skeleton-list">
  <SkeletonCard v-for="i in 4" :key="i" />
</view>
<view v-else-if="contentList.length > 0" class="content-list">
  <!-- 现有内容列表 -->
</view>
```

**Step 3: 编译验证**

```bash
npm run build:mp-weixin
```

**Step 4: 提交**

```bash
git add src/components/SkeletonCard/
git commit -m "feat: 添加骨架屏加载动画组件"
```

---

## Task 2: 反馈接口对接

**Files:**
- Create: `src/api/feedback.ts`
- Modify: `src/pages/feedback/index.vue`

**Step 1: 创建反馈 API**

```typescript
// src/api/feedback.ts
import { request } from './request'

export interface FeedbackParams {
  type: 'bug' | 'content' | 'suggest' | 'other'
  content: string
  contact?: string
}

export interface FeedbackResponse {
  id: string
  message: string
}

/**
 * 提交用户反馈
 */
export async function submitFeedback(params: FeedbackParams): Promise<FeedbackResponse> {
  return request<FeedbackResponse>({
    url: '/feedback',
    method: 'POST',
    data: params
  })
}
```

**Step 2: 修改反馈页面对接 API**

修改 `src/pages/feedback/index.vue` 的 handleSubmit 函数：

```typescript
import { submitFeedback } from '@/api/feedback'

async function handleSubmit() {
  if (!canSubmit.value || submitting.value) return

  submitting.value = true

  try {
    await submitFeedback({
      type: selectedType.value,
      content: content.value,
      contact: contact.value || undefined
    })

    uni.showToast({
      title: '提交成功',
      icon: 'success'
    })

    // 清空表单
    content.value = ''
    contact.value = ''

    // 返回上一页
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (e: any) {
    uni.showToast({
      title: e.message || '提交失败',
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
}
```

**Step 3: 编译验证**

```bash
npm run build:mp-weixin
```

**Step 4: 提交**

```bash
git add src/api/feedback.ts src/pages/feedback/index.vue
git commit -m "feat: 反馈接口对接后端 API"
```

---

## Task 3: 学习报告完善

**Files:**
- Modify: `src/api/play.ts`
- Modify: `src/pages/report/index.vue`

**Step 1: 添加统计 API 类型**

在 `src/api/play.ts` 中添加：

```typescript
export interface PlayStats {
  total_duration_minutes: number
  total_books: number
  total_songs: number
  total_videos: number
  streak_days: number
  interaction_rate: number
  daily_activity: Array<{
    date: string
    has_activity: boolean
    duration_minutes: number
  }>
  top_themes: Array<{
    theme_id: string
    theme_name: string
    count: number
  }>
}

export async function getPlayStats(childId: string, days: number = 7): Promise<PlayStats> {
  return request<PlayStats>({
    url: `/play/stats/${childId}`,
    method: 'GET',
    data: { days }
  })
}
```

**Step 2: 修改报告页面加载真实数据**

修改 `src/pages/report/index.vue` 的 onMounted：

```typescript
import { getPlayStats, type PlayStats } from '@/api/play'

onMounted(async () => {
  if (!childStore.currentChild?.id) return

  try {
    const data = await getPlayStats(childStore.currentChild.id)

    // 更新统计数据
    stats.value = {
      totalDuration: formatDuration(data.total_duration_minutes),
      totalBooks: data.total_books + data.total_songs + data.total_videos,
      streakDays: data.streak_days,
      interactionRate: data.interaction_rate
    }

    // 更新日历
    updateWeekDays(data.daily_activity)

    // 更新主题排行
    updateTopTopics(data.top_themes)
  } catch (e) {
    console.error('获取学习报告失败:', e)
    // 使用默认数据
  }
})

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}小时${mins}分` : `${hours}小时`
}
```

**Step 3: 编译验证**

```bash
npm run build:mp-weixin
```

**Step 4: 提交**

```bash
git add src/api/play.ts src/pages/report/index.vue
git commit -m "feat: 学习报告对接真实统计数据"
```

---

## Task 4: 内容分享优化 - 海报生成

**Files:**
- Create: `src/utils/poster.ts`
- Modify: `src/pages/play/picture-book.vue`

**Step 1: 创建海报生成工具**

```typescript
// src/utils/poster.ts
export interface PosterData {
  title: string
  coverUrl: string
  childName: string
  theme: string
  qrCodeUrl?: string
}

/**
 * 生成分享海报
 * @returns 海报图片临时路径
 */
export async function generatePoster(
  canvasId: string,
  data: PosterData,
  context: any
): Promise<string> {
  const ctx = uni.createCanvasContext(canvasId, context)
  const width = 540
  const height = 960

  // 背景
  ctx.setFillStyle('#FFF9F5')
  ctx.fillRect(0, 0, width, height)

  // 标题区域
  ctx.setFillStyle('#FF7B54')
  ctx.fillRect(0, 0, width, 80)
  ctx.setFillStyle('#FFFFFF')
  ctx.setFontSize(32)
  ctx.setTextAlign('center')
  ctx.fillText('童话绘本', width / 2, 52)

  // 封面图（需要先下载）
  try {
    const coverPath = await downloadImage(data.coverUrl)
    ctx.drawImage(coverPath, 40, 120, width - 80, 400)
  } catch (e) {
    // 封面加载失败，显示占位
    ctx.setFillStyle('#FFE4D6')
    ctx.fillRect(40, 120, width - 80, 400)
  }

  // 标题
  ctx.setFillStyle('#5D4E4E')
  ctx.setFontSize(36)
  ctx.setTextAlign('center')
  ctx.fillText(data.title, width / 2, 580)

  // 主题标签
  ctx.setFillStyle('#FF7B54')
  ctx.setFontSize(24)
  ctx.fillText(`#${data.theme}`, width / 2, 630)

  // 孩子名字
  ctx.setFillStyle('#9C8578')
  ctx.setFontSize(28)
  ctx.fillText(`${data.childName} 的专属绘本`, width / 2, 700)

  // 底部提示
  ctx.setFillStyle('#B2BEC3')
  ctx.setFontSize(22)
  ctx.fillText('长按识别小程序码，创作专属绘本', width / 2, 900)

  // 绘制
  return new Promise((resolve, reject) => {
    ctx.draw(false, () => {
      uni.canvasToTempFilePath({
        canvasId,
        success: (res) => resolve(res.tempFilePath),
        fail: reject
      }, context)
    })
  })
}

async function downloadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.tempFilePath)
        } else {
          reject(new Error('下载失败'))
        }
      },
      fail: reject
    })
  })
}
```

**Step 2: 在播放页添加海报分享**

在 `src/pages/play/picture-book.vue` 中添加：

```vue
<!-- 在 template 中添加 canvas -->
<canvas canvas-id="posterCanvas" class="poster-canvas" />

<!-- 分享按钮改为显示海报 -->
<view class="share-btn" @tap="showSharePoster">
  <text>📤 分享海报</text>
</view>
```

```typescript
import { generatePoster } from '@/utils/poster'

const showingPoster = ref(false)
const posterPath = ref('')

async function showSharePoster() {
  if (!pictureBook.value) return

  uni.showLoading({ title: '生成海报中...' })

  try {
    const path = await generatePoster('posterCanvas', {
      title: pictureBook.value.title,
      coverUrl: pictureBook.value.pages?.[0]?.image_url || '',
      childName: childStore.currentChild?.name || '宝贝',
      theme: pictureBook.value.theme_topic || ''
    }, getCurrentInstance())

    posterPath.value = path
    showingPoster.value = true

    // 保存到相册
    uni.saveImageToPhotosAlbum({
      filePath: path,
      success: () => {
        uni.showToast({ title: '已保存到相册', icon: 'success' })
      }
    })
  } catch (e) {
    uni.showToast({ title: '生成失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}
```

**Step 3: 编译验证**

```bash
npm run build:mp-weixin
```

**Step 4: 提交**

```bash
git add src/utils/poster.ts src/pages/play/picture-book.vue
git commit -m "feat: 添加分享海报生成功能"
```

---

## 验收清单

- [ ] 骨架屏组件正常显示
- [ ] 反馈提交成功
- [ ] 学习报告显示真实数据
- [ ] 分享海报正常生成并保存

