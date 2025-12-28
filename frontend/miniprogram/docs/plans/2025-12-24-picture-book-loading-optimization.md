# 绘本加载性能优化实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 优化绘本加载性能，列表页使用缩略图，详情页实现渐进式加载和音频预加载，添加 API 缓存

**Architecture:**
- 列表页：使用 `cover_thumb_url` 缩略图（8KB）替代原图（45KB+）
- 详情页：先显示模糊缩略图，再淡入清晰原图；音频提前下载到本地缓存
- API 层：添加带 TTL 的缓存机制，减少重复请求

**Tech Stack:** Vue 3 + TypeScript + uni-app (微信小程序)

---

## 现有代码分析

**已有功能：**
- `src/pages/play/picture-book.vue` 已有图片预加载 (`preloadAdjacentImages`) 和音频预加载 (`preloadAudioBatch`)
- `src/utils/storage.ts` 已有 `setStorageWithExpiry` / `getStorageWithExpiry` 带过期时间的存储

**需要新增/修改：**
1. 列表页使用缩略图字段
2. 详情页渐进式图片加载（缩略图→原图淡入）
3. API 响应缓存工具类
4. 性能监控埋点（可选）

---

## Task 1: 更新 API 类型定义 - 添加缩略图字段

**Files:**
- Modify: `src/api/content.ts:29-40` (PictureBookPage 接口)
- Modify: `src/api/content.ts:43-58` (PictureBook 接口)

**Step 1: 添加 PictureBookPage 缩略图字段**

在 `src/api/content.ts` 的 `PictureBookPage` 接口中添加：

```typescript
// 绘本页面接口
export interface PictureBookPage {
  page_number: number
  text: string
  image_url: string
  image_thumb_url?: string  // 新增：256px 缩略图 URL
  audio_url: string
  duration: number
  interaction?: {
    type: 'tap' | 'drag' | 'shake'
    prompt: string
  }
}
```

**Step 2: 添加 PictureBook 封面缩略图字段**

在 `PictureBook` 接口中添加：

```typescript
export interface PictureBook {
  id: string
  title: string
  theme_topic: string
  theme_category?: string
  educational_goal: string
  pages: PictureBookPage[]
  total_duration: number
  total_interactions: number
  personalization: {
    child_name: string
    characters: string[]
  }
  cover_url?: string
  cover_thumb_url?: string  // 新增：封面缩略图 URL
  created_at: string
}
```

**Step 3: 验证类型定义**

Run: `npm run build:mp-weixin 2>&1 | tail -20`
Expected: Build complete 无类型错误

**Step 4: Commit**

```bash
git add src/api/content.ts
git commit -m "feat: 添加绘本缩略图字段类型定义"
```

---

## Task 2: 列表页使用缩略图

**Files:**
- Modify: `src/pages/library/index.vue:135-144` (封面图片显示逻辑)

**Step 1: 修改绘本封面显示逻辑**

找到内容库页面的封面 image 组件（约第135-144行），修改为优先使用缩略图：

```vue
<!-- 有封面图：显示封面（优先缩略图，其次原图） -->
<image
  v-else-if="item.cover_url || item.cover_thumb_url || (item as any).suno_cover_url"
  :src="getCoverUrl(item)"
  mode="aspectFill"
  class="cover-img"
  lazy-load
  @load="onImageLoad(item.id)"
  @error="onImageError(item.id)"
/>
```

**Step 2: 添加 getCoverUrl 辅助函数**

在 `<script setup>` 中添加：

```typescript
// 获取封面 URL（列表页优先使用缩略图）
function getCoverUrl(item: any): string {
  // 绘本优先使用缩略图
  if (inferContentType(item) === 'picture_book') {
    return item.cover_thumb_url || item.cover_url || ''
  }
  // 儿歌优先使用 cover_url
  return item.cover_url || (item as any).suno_cover_url || ''
}
```

**Step 3: 验证编译**

Run: `npm run build:mp-weixin 2>&1 | tail -10`
Expected: Build complete

**Step 4: Commit**

```bash
git add src/pages/library/index.vue
git commit -m "perf: 列表页绘本封面使用缩略图"
```

---

## Task 3: 创建 API 缓存工具类

**Files:**
- Create: `src/utils/cache.ts`

**Step 1: 创建缓存管理类**

```typescript
/**
 * API 响应缓存管理
 * 减少重复请求，提升加载速度
 */

const CACHE_PREFIX = 'moana_cache_'
const DEFAULT_TTL = 5 * 60 * 1000  // 默认 5 分钟

interface CacheItem<T> {
  value: T
  expireAt: number
}

class CacheManager {
  /**
   * 生成缓存 key
   */
  private getKey(url: string): string {
    // 简化 URL 为有效的存储 key
    return CACHE_PREFIX + url.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 100)
  }

  /**
   * 获取缓存
   */
  get<T>(url: string): T | null {
    try {
      const key = this.getKey(url)
      const data = uni.getStorageSync(key) as CacheItem<T> | null

      if (!data) return null

      // 检查是否过期
      if (Date.now() > data.expireAt) {
        this.remove(url)
        return null
      }

      return data.value
    } catch (e) {
      return null
    }
  }

  /**
   * 设置缓存
   */
  set<T>(url: string, value: T, ttl: number = DEFAULT_TTL): boolean {
    try {
      const key = this.getKey(url)
      const item: CacheItem<T> = {
        value,
        expireAt: Date.now() + ttl
      }
      uni.setStorageSync(key, item)
      return true
    } catch (e) {
      console.warn('[Cache] 写入失败:', e)
      return false
    }
  }

  /**
   * 删除缓存
   */
  remove(url: string): void {
    try {
      uni.removeStorageSync(this.getKey(url))
    } catch (e) {
      // ignore
    }
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    try {
      const info = uni.getStorageInfoSync()
      info.keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          uni.removeStorageSync(key)
        }
      })
    } catch (e) {
      console.warn('[Cache] 清空失败:', e)
    }
  }
}

// 导出单例
export const cache = new CacheManager()
export default cache
```

**Step 2: 验证编译**

Run: `npm run build:mp-weixin 2>&1 | tail -10`
Expected: Build complete

**Step 3: Commit**

```bash
git add src/utils/cache.ts
git commit -m "feat: 添加 API 响应缓存工具类"
```

---

## Task 4: 集成缓存到 API 请求

**Files:**
- Modify: `src/api/request.ts` (添加缓存支持)

**Step 1: 查看现有 request.ts 结构**

先阅读 `src/api/request.ts` 了解现有实现。

**Step 2: 添加缓存选项**

在 request 函数中添加缓存支持（仅对 GET 请求）：

```typescript
import cache from '@/utils/cache'

// 在 request 函数的选项中添加：
interface RequestOptions {
  // ... 现有选项
  useCache?: boolean      // 是否使用缓存，默认 false
  cacheTTL?: number       // 缓存过期时间(ms)，默认 5 分钟
}

// 在 request 函数实现中：
// GET 请求且启用缓存时，先尝试从缓存获取
if (options.method === 'GET' && options.useCache) {
  const cached = cache.get(url)
  if (cached) {
    console.log('[Request] 缓存命中:', url)
    return cached
  }
}

// 请求成功后写入缓存
if (options.method === 'GET' && options.useCache) {
  cache.set(url, data, options.cacheTTL)
}
```

**Step 3: 验证编译**

Run: `npm run build:mp-weixin 2>&1 | tail -10`
Expected: Build complete

**Step 4: Commit**

```bash
git add src/api/request.ts
git commit -m "feat: request 添加 GET 请求缓存支持"
```

---

## Task 5: 详情页渐进式图片加载

**Files:**
- Modify: `src/pages/play/picture-book.vue` (模板和样式)

**Step 1: 修改图片显示模板**

找到 `story-image-container` 部分（约第22-36行），修改为双层图片：

```vue
<!-- 全屏故事图片 -->
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
```

**Step 2: 添加渐进式加载样式**

在 `<style>` 部分添加：

```scss
/* 缩略图样式 - 模糊放大背景 */
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

/* 原图样式 - 淡入效果 */
.story-image-full {
  position: relative;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;

  &.loaded {
    opacity: 1;
  }
}
```

**Step 3: 验证编译**

Run: `npm run build:mp-weixin 2>&1 | tail -10`
Expected: Build complete

**Step 4: Commit**

```bash
git add src/pages/play/picture-book.vue
git commit -m "feat: 绘本详情页渐进式图片加载"
```

---

## Task 6: 优化图片预加载 - 优先加载缩略图

**Files:**
- Modify: `src/pages/play/picture-book.vue` (preloadAdjacentImages 函数)

**Step 1: 修改预加载逻辑**

更新 `preloadAdjacentImages` 函数，优先预加载缩略图：

```typescript
// 智能预加载 - 缩略图优先，原图延迟加载
function preloadAdjacentImages(centerIndex: number, range = 3) {
  if (!content.value?.pages?.length) return

  // 预加载当前页及后续 range 页
  const indices: number[] = []
  for (let i = centerIndex; i <= centerIndex + range && i < content.value.pages.length; i++) {
    indices.push(i)
  }
  // 也预加载前一页（用于回退）
  if (centerIndex > 0) indices.unshift(centerIndex - 1)

  indices.forEach(index => {
    const page = content.value!.pages[index]

    // 优先预加载缩略图（小文件，快速显示）
    if (page.image_thumb_url) {
      uni.getImageInfo({
        src: page.image_thumb_url,
        success: () => console.log(`[预加载] 缩略图 ${index + 1} 完成`),
        fail: () => { /* 静默失败 */ }
      })
    }

    // 延迟预加载原图（避免带宽竞争）
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
            uni.getImageInfo({
              src: page.image_url!,
              success: () => { imageLoaded.value[index] = true },
              fail: () => { /* 静默失败 */ }
            })
          }
        })
      }, 200 * (index - centerIndex + 1))  // 错开请求时间
    }
  })
}
```

**Step 2: 验证编译**

Run: `npm run build:mp-weixin 2>&1 | tail -10`
Expected: Build complete

**Step 3: Commit**

```bash
git add src/pages/play/picture-book.vue
git commit -m "perf: 优化图片预加载策略（缩略图优先）"
```

---

## Task 7: 内容详情 API 启用缓存

**Files:**
- Modify: `src/api/content.ts` (getContentDetail 函数)

**Step 1: 找到 getContentDetail 函数并添加缓存**

```typescript
/**
 * 获取内容详情（带缓存）
 */
export async function getContentDetail(id: string): Promise<PictureBook | NurseryRhyme | any> {
  return request.get(`/content/${id}`, {
    useCache: true,
    cacheTTL: 5 * 60 * 1000  // 5 分钟缓存
  })
}
```

**Step 2: 验证编译**

Run: `npm run build:mp-weixin 2>&1 | tail -10`
Expected: Build complete

**Step 3: Commit**

```bash
git add src/api/content.ts
git commit -m "perf: 内容详情 API 启用缓存"
```

---

## Task 8: 性能监控埋点（可选）

**Files:**
- Create: `src/utils/performance.ts`

**Step 1: 创建性能监控工具**

```typescript
/**
 * 性能监控工具
 * 用于埋点和分析加载性能
 */

class PerformanceMonitor {
  private marks: Record<string, number> = {}

  /**
   * 标记时间点
   */
  mark(name: string): void {
    this.marks[name] = Date.now()
  }

  /**
   * 计算两个标记之间的时间差
   */
  measure(name: string, startMark: string, endMark?: string): number | null {
    const start = this.marks[startMark]
    const end = endMark ? this.marks[endMark] : Date.now()

    if (!start) return null

    const duration = end - start
    console.log(`[Perf] ${name}: ${duration}ms`)

    return duration
  }

  /**
   * 清除所有标记
   */
  clear(): void {
    this.marks = {}
  }
}

export const perf = new PerformanceMonitor()
export default perf
```

**Step 2: 在绘本页面添加埋点**

在 `picture-book.vue` 的关键位置添加：

```typescript
import perf from '@/utils/performance'

// onLoad 时
perf.mark('pageLoad')

// 数据加载完成时
perf.measure('API 响应时间', 'pageLoad')

// 首图加载完成时
if (index === 0) {
  perf.measure('首图加载时间', 'pageLoad')
}
```

**Step 3: Commit**

```bash
git add src/utils/performance.ts src/pages/play/picture-book.vue
git commit -m "feat: 添加性能监控埋点"
```

---

## Task 9: 最终验证和测试

**Step 1: 完整编译**

Run: `npm run build:mp-weixin 2>&1 | tail -20`
Expected: Build complete 无错误

**Step 2: 真机测试检查清单**

- [ ] 列表页封面图是否使用缩略图（Network 面板查看图片大小）
- [ ] 详情页是否先显示模糊缩略图，再淡入清晰原图
- [ ] 翻页时音频是否无延迟播放
- [ ] 重复访问同一绘本是否有缓存效果（秒开）
- [ ] 控制台是否有 `[Perf]` 性能日志

**Step 3: 最终 Commit**

```bash
git add .
git commit -m "feat: 绘本加载性能优化完成

- 列表页使用缩略图（45KB → 8KB）
- 详情页渐进式图片加载
- 音频预加载到本地缓存
- API 响应缓存（5分钟TTL）
- 性能监控埋点"
```

---

## 预期效果

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|-------|------|
| 列表页加载 | 2-3s | 0.5-1s | **60-70%** |
| 详情页首屏 | 3-4s | 1-2s | **50%** |
| 音频开始播放 | 1-2s | 0.3s | **80%** |
| 翻页响应 | 0.5-1s | 即时 | **90%** |
| 重复访问 | 相同 | 即时 | **缓存命中** |
