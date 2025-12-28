# 绘本加载优化前端开发指南

> 本文档为前端开发人员提供绘本加载性能优化的实现指南。
> 后端已完成：WebP 图片、AAC 音频、256px 缩略图、GZip 压缩。

## 1. 懒加载图片

### 1.1 原理
只加载当前页面和相邻页面的图片，翻页时预加载后续页面。

### 1.2 实现

```javascript
// pages/picturebook/detail.js
Page({
  data: {
    currentPage: 0,
    pages: [],
    loadedImages: {},  // { pageIndex: true }
  },

  onLoad(options) {
    this.loadBookData(options.id);
  },

  async loadBookData(bookId) {
    const res = await wx.request({
      url: `https://kids.jackverse.cn/api/v1/content/${bookId}`,
    });

    this.setData({ pages: res.data.pages });
    // 预加载前3页
    this.preloadImages([0, 1, 2]);
  },

  // 翻页事件
  onPageChange(e) {
    const current = e.detail.current;
    this.setData({ currentPage: current });

    // 预加载当前页 + 后2页
    this.preloadImages([current, current + 1, current + 2]);
  },

  // 预加载图片
  preloadImages(pageIndexes) {
    const { pages, loadedImages } = this.data;

    pageIndexes.forEach(index => {
      // 跳过已加载或无效索引
      if (index < 0 || index >= pages.length || loadedImages[index]) {
        return;
      }

      const imageUrl = pages[index].image_url;

      wx.getImageInfo({
        src: imageUrl,
        success: () => {
          this.setData({
            [`loadedImages.${index}`]: true
          });
          console.log(`预加载完成: 第${index + 1}页`);
        },
        fail: (err) => {
          console.warn(`预加载失败: 第${index + 1}页`, err);
        }
      });
    });
  }
});
```

---

## 2. 列表页使用缩略图

### 2.1 原理
列表页展示封面时使用 256x256 缩略图（约 8KB），而非原图（约 45KB）。

### 2.2 API 响应格式

```json
{
  "items": [
    {
      "id": "xxx",
      "title": "小兔子的冒险",
      "cover_url": "https://kids.jackverse.cn/media/images/.../abc123.webp",
      "cover_thumb_url": "https://kids.jackverse.cn/media/images/.../abc123_thumb.webp"
    }
  ]
}
```

### 2.3 实现

```html
<!-- pages/library/list.wxml -->
<view class="book-list">
  <view
    class="book-card"
    wx:for="{{books}}"
    wx:key="id"
    bindtap="onBookTap"
    data-id="{{item.id}}"
  >
    <!-- 优先使用缩略图，无缩略图时回退到原图 -->
    <image
      src="{{item.cover_thumb_url || item.cover_url}}"
      mode="aspectFill"
      lazy-load="{{true}}"
      class="book-cover"
    />
    <text class="book-title">{{item.title}}</text>
  </view>
</view>
```

```css
/* pages/library/list.wxss */
.book-card {
  width: 45%;
  margin: 2.5%;
}

.book-cover {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12rpx;
  background-color: #f5f5f5;
}

.book-title {
  font-size: 28rpx;
  margin-top: 12rpx;
  text-align: center;
}
```

---

## 3. 音频预加载

### 3.1 原理
翻页时提前加载下一页音频，消除播放延迟。

### 3.2 AudioManager 工具类

```javascript
// utils/audioManager.js
class AudioManager {
  constructor() {
    this.mainContext = wx.createInnerAudioContext();
    this.preloadContexts = new Map();  // url -> context
    this.maxPreload = 3;  // 最多预加载3个
  }

  // 播放音频
  play(url, onEnded) {
    // 如果已预加载，使用预加载的 context
    if (this.preloadContexts.has(url)) {
      const ctx = this.preloadContexts.get(url);
      ctx.onEnded(onEnded);
      ctx.play();
      this.preloadContexts.delete(url);
      return ctx;
    }

    // 否则使用主 context
    this.mainContext.src = url;
    this.mainContext.onEnded(onEnded);
    this.mainContext.play();
    return this.mainContext;
  }

  // 预加载音频
  preload(url) {
    if (this.preloadContexts.has(url)) {
      return;  // 已在预加载队列
    }

    // 限制预加载数量
    if (this.preloadContexts.size >= this.maxPreload) {
      const firstKey = this.preloadContexts.keys().next().value;
      const oldCtx = this.preloadContexts.get(firstKey);
      oldCtx.destroy();
      this.preloadContexts.delete(firstKey);
    }

    const ctx = wx.createInnerAudioContext();
    ctx.src = url;
    ctx.volume = 0;  // 静音预加载

    ctx.onCanplay(() => {
      ctx.volume = 1;  // 恢复音量
      console.log(`音频预加载完成: ${url.slice(-20)}`);
    });

    this.preloadContexts.set(url, ctx);
  }

  // 预加载后续页面音频
  preloadNextPages(pages, currentIndex, count = 2) {
    for (let i = 1; i <= count; i++) {
      const nextPage = pages[currentIndex + i];
      if (nextPage?.audio_url) {
        this.preload(nextPage.audio_url);
      }
    }
  }

  // 停止播放
  stop() {
    this.mainContext.stop();
  }

  // 销毁所有 context
  destroy() {
    this.mainContext.destroy();
    this.preloadContexts.forEach(ctx => ctx.destroy());
    this.preloadContexts.clear();
  }
}

// 导出单例
export default new AudioManager();
```

### 3.3 在绘本页面使用

```javascript
// pages/picturebook/detail.js
import audioManager from '../../utils/audioManager';

Page({
  data: {
    currentPage: 0,
    pages: [],
    isPlaying: false,
  },

  onLoad(options) {
    this.loadBookData(options.id);
  },

  onUnload() {
    audioManager.destroy();
  },

  onPageChange(e) {
    const current = e.detail.current;
    this.setData({ currentPage: current });

    // 预加载后续音频
    audioManager.preloadNextPages(this.data.pages, current, 2);
  },

  // 播放当前页音频
  playCurrentAudio() {
    const { pages, currentPage } = this.data;
    const audioUrl = pages[currentPage]?.audio_url;

    if (!audioUrl) return;

    this.setData({ isPlaying: true });

    audioManager.play(audioUrl, () => {
      this.setData({ isPlaying: false });
      // 自动翻到下一页（可选）
      // this.nextPage();
    });
  },

  stopAudio() {
    audioManager.stop();
    this.setData({ isPlaying: false });
  }
});
```

---

## 4. 渐进式图片加载

### 4.1 原理
先显示模糊的缩略图，再加载清晰原图，提升感知性能。

### 4.2 实现

```html
<!-- pages/picturebook/detail.wxml -->
<swiper
  current="{{currentPage}}"
  bindchange="onPageChange"
  class="book-swiper"
>
  <swiper-item wx:for="{{pages}}" wx:key="page_num">
    <view class="page-container">
      <!-- 缩略图（模糊背景） -->
      <image
        wx:if="{{!loadedImages[index]}}"
        src="{{item.image_thumb_url}}"
        mode="aspectFit"
        class="page-image thumbnail"
      />

      <!-- 原图 -->
      <image
        src="{{item.image_url}}"
        mode="aspectFit"
        class="page-image full {{loadedImages[index] ? 'loaded' : ''}}"
        bindload="onImageLoaded"
        data-index="{{index}}"
      />

      <!-- 文字 -->
      <view class="page-text">{{item.text}}</view>
    </view>
  </swiper-item>
</swiper>
```

```css
/* pages/picturebook/detail.wxss */
.book-swiper {
  width: 100%;
  height: 100vh;
}

.page-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.page-image {
  width: 90%;
  max-height: 60vh;
}

/* 缩略图样式 - 模糊放大 */
.page-image.thumbnail {
  filter: blur(20rpx);
  transform: scale(1.05);
  position: absolute;
  z-index: 1;
}

/* 原图样式 - 淡入效果 */
.page-image.full {
  position: relative;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.page-image.full.loaded {
  opacity: 1;
}

.page-text {
  margin-top: 40rpx;
  padding: 0 40rpx;
  font-size: 32rpx;
  line-height: 1.6;
  text-align: center;
}
```

```javascript
// pages/picturebook/detail.js
Page({
  // ... 其他代码

  onImageLoaded(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      [`loadedImages.${index}`]: true
    });
  }
});
```

---

## 5. API 响应缓存

### 5.1 原理
缓存 API 响应到本地，减少重复请求。

### 5.2 缓存工具类

```javascript
// utils/cache.js
const CACHE_PREFIX = 'moana_';
const DEFAULT_TTL = 5 * 60 * 1000;  // 默认 5 分钟

class CacheManager {
  // 生成缓存 key
  _key(url) {
    return CACHE_PREFIX + url.replace(/[^a-zA-Z0-9]/g, '_');
  }

  // 获取缓存
  get(url) {
    try {
      const data = wx.getStorageSync(this._key(url));
      if (!data) return null;

      if (Date.now() > data.expireAt) {
        this.remove(url);
        return null;
      }

      return data.value;
    } catch (e) {
      return null;
    }
  }

  // 设置缓存
  set(url, value, ttl = DEFAULT_TTL) {
    try {
      wx.setStorageSync(this._key(url), {
        value,
        expireAt: Date.now() + ttl,
      });
    } catch (e) {
      console.warn('缓存写入失败', e);
    }
  }

  // 删除缓存
  remove(url) {
    try {
      wx.removeStorageSync(this._key(url));
    } catch (e) {}
  }

  // 清空所有缓存
  clear() {
    try {
      const keys = wx.getStorageInfoSync().keys;
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          wx.removeStorageSync(key);
        }
      });
    } catch (e) {}
  }
}

export default new CacheManager();
```

### 5.3 封装请求函数

```javascript
// utils/request.js
import cache from './cache';

const BASE_URL = 'https://kids.jackverse.cn/api/v1';

export async function request(path, options = {}) {
  const url = BASE_URL + path;
  const { useCache = true, cacheTTL = 5 * 60 * 1000 } = options;

  // 尝试从缓存获取
  if (useCache && options.method !== 'POST') {
    const cached = cache.get(url);
    if (cached) {
      console.log(`[Cache Hit] ${path}`);
      return cached;
    }
  }

  // 发起请求
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: options.method || 'GET',
      data: options.data,
      header: options.header,
      success: (res) => {
        if (res.statusCode === 200) {
          // 写入缓存
          if (useCache && options.method !== 'POST') {
            cache.set(url, res.data, cacheTTL);
          }
          resolve(res.data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      },
      fail: reject,
    });
  });
}

// 便捷方法
export const get = (path, options) => request(path, { ...options, method: 'GET' });
export const post = (path, data, options) => request(path, { ...options, method: 'POST', data });
```

### 5.4 使用示例

```javascript
// pages/picturebook/detail.js
import { get } from '../../utils/request';

Page({
  async loadBookData(bookId) {
    try {
      // 自动使用缓存，TTL 5 分钟
      const data = await get(`/content/${bookId}`);
      this.setData({ pages: data.pages });
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  }
});
```

---

## 6. 性能监控

### 6.1 加载时间埋点

```javascript
// utils/performance.js
class PerformanceMonitor {
  constructor() {
    this.marks = {};
  }

  mark(name) {
    this.marks[name] = Date.now();
  }

  measure(name, startMark, endMark) {
    const start = this.marks[startMark];
    const end = endMark ? this.marks[endMark] : Date.now();

    if (!start) return null;

    const duration = end - start;
    console.log(`[Perf] ${name}: ${duration}ms`);

    // 上报到分析服务（可选）
    // this.report(name, duration);

    return duration;
  }

  report(name, duration) {
    wx.request({
      url: 'https://kids.jackverse.cn/api/v1/analytics/performance',
      method: 'POST',
      data: { name, duration, timestamp: Date.now() },
    });
  }
}

export default new PerformanceMonitor();
```

### 6.2 使用示例

```javascript
// pages/picturebook/detail.js
import perf from '../../utils/performance';

Page({
  onLoad(options) {
    perf.mark('pageLoad');
    this.loadBookData(options.id);
  },

  async loadBookData(bookId) {
    perf.mark('apiStart');
    const data = await get(`/content/${bookId}`);
    perf.measure('API 响应时间', 'apiStart');

    this.setData({ pages: data.pages });
    perf.measure('页面加载总时间', 'pageLoad');
  },

  onImageLoaded(e) {
    if (e.currentTarget.dataset.index === 0) {
      perf.measure('首图加载时间', 'pageLoad');
    }
  }
});
```

---

## 7. 预期效果对比

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|-------|------|
| 列表页加载 | 2-3s | 0.5-1s | **60-70%** |
| 详情页首屏 | 3-4s | 1-2s | **50%** |
| 音频开始播放 | 1-2s | 0.3s | **80%** |
| 翻页响应 | 0.5-1s | 即时 | **90%** |
| 重复访问 | 相同 | 即时 | **缓存命中** |

---

## 8. 检查清单

- [ ] 列表页使用 `cover_thumb_url` 字段
- [ ] 详情页实现图片懒加载
- [ ] 集成 AudioManager 预加载音频
- [ ] 实现渐进式图片加载（缩略图→原图）
- [ ] 集成 API 响应缓存
- [ ] 添加性能监控埋点
- [ ] 真机测试验证效果
