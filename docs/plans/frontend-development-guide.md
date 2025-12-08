# Moana 前端开发指南

> AI 原生早教内容生成系统 - 微信小程序前端开发文档

## 目录

1. [项目概述](#项目概述)
2. [技术栈建议](#技术栈建议)
3. [API 接口文档](#api-接口文档)
4. [页面结构设计](#页面结构设计)
5. [核心功能实现](#核心功能实现)
6. [状态管理](#状态管理)
7. [UI/UX 设计建议](#uiux-设计建议)

---

## 项目概述

### 产品定位
面向 1-6 岁儿童家长的 AI 原生早教内容生成平台，通过微信小程序提供：
- 个性化绘本生成
- 定制儿歌创作
- 智能视频制作
- 科学的观看时间管理

### 用户角色
1. **家长端**：内容管理、设置、数据查看
2. **儿童端**：内容播放、互动

---

## 技术栈建议

### 推荐方案
```
框架: uni-app 或 Taro (跨端兼容)
UI 库: uView UI / NutUI
状态管理: Pinia / Vuex
请求库: uni-request 封装
```

### 目录结构建议
```
miniprogram/
├── pages/
│   ├── index/              # 首页
│   ├── create/             # 创作中心
│   │   ├── picture-book/   # 绘本创作
│   │   ├── nursery-rhyme/  # 儿歌创作
│   │   └── video/          # 视频创作
│   ├── library/            # 内容库
│   ├── play/               # 播放页
│   ├── child/              # 儿童模式
│   ├── analytics/          # 数据统计
│   └── settings/           # 设置
├── components/
│   ├── ContentCard/        # 内容卡片
│   ├── PlayProgress/       # 播放进度
│   ├── ThemeSelector/      # 主题选择器
│   └── TimeLimit/          # 时间限制提示
├── api/
│   ├── auth.js             # 认证接口
│   ├── content.js          # 内容接口
│   ├── play.js             # 播放接口
│   └── analytics.js        # 统计接口
├── store/
│   ├── user.js             # 用户状态
│   ├── child.js            # 孩子状态
│   └── content.js          # 内容状态
└── utils/
    ├── request.js          # 请求封装
    └── auth.js             # 认证工具
```

---

## API 接口文档

### 基础配置
```javascript
// 开发环境
const BASE_URL = 'http://localhost:8000/api/v1'

// 生产环境
const BASE_URL = 'https://your-domain.com/api/v1'
```

### 1. 认证接口

#### 1.1 微信登录
```http
POST /auth/wechat/login
Content-Type: application/json

{
  "code": "微信登录code",
  "user_info": {              // 可选
    "nickname": "用户昵称",
    "avatar_url": "头像URL"
  }
}
```

**响应:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

**前端实现:**
```javascript
// api/auth.js
export async function wechatLogin() {
  // 1. 获取微信登录 code
  const { code } = await wx.login()

  // 2. 调用后端登录接口
  const res = await request.post('/auth/wechat/login', { code })

  // 3. 保存 token
  wx.setStorageSync('access_token', res.access_token)
  wx.setStorageSync('refresh_token', res.refresh_token)

  return res
}
```

#### 1.2 刷新 Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 1.3 获取当前用户
```http
GET /auth/me
Authorization: Bearer {access_token}
```

**响应:**
```json
{
  "id": "user-uuid",
  "openid": "wx_openid",
  "nickname": "用户昵称",
  "avatar_url": "头像URL",
  "created_at": "2025-12-08T10:00:00Z"
}
```

---

### 2. 内容生成接口

#### 2.1 获取主题列表
```http
GET /content/themes
```

**响应:**
```json
{
  "habit": {
    "name": "习惯养成",
    "themes": [
      {
        "id": "brushing_teeth",
        "name": "刷牙",
        "subcategory": "生活习惯",
        "age_range": [24, 48],
        "keywords": ["牙齿", "刷牙", "漱口"]
      }
    ]
  },
  "cognition": {
    "name": "认知世界",
    "themes": [...]
  }
}
```

#### 2.2 生成绘本
```http
POST /content/picture-book
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "child_name": "小明",
  "age_months": 36,
  "theme_topic": "brushing_teeth",
  "theme_category": "habit",
  "favorite_characters": ["小熊", "小兔子"],
  "voice_id": null
}
```

**响应:**
```json
{
  "title": "小明学刷牙",
  "theme_topic": "brushing_teeth",
  "educational_goal": "培养孩子每天刷牙的好习惯",
  "pages": [
    {
      "page_number": 1,
      "text": "太阳公公起床了...",
      "image_url": "https://oss.example.com/page1.png",
      "audio_url": "https://oss.example.com/page1.mp3",
      "duration": 5.2,
      "interaction": {
        "type": "tap",
        "prompt": "点击牙刷"
      }
    }
  ],
  "total_duration": 120.5,
  "total_interactions": 5,
  "personalization": {
    "child_name": "小明",
    "characters": ["小熊"]
  },
  "generated_by": {
    "story_agent": "gemini-2.0-flash",
    "image_service": "minimax",
    "tts_service": "qwen"
  }
}
```

**前端实现:**
```javascript
// api/content.js
export async function generatePictureBook(params) {
  return request.post('/content/picture-book', params)
}

// pages/create/picture-book.vue
async function handleGenerate() {
  loading.value = true
  try {
    const result = await generatePictureBook({
      child_name: childInfo.name,
      age_months: childInfo.ageMonths,
      theme_topic: selectedTheme.id,
      theme_category: selectedCategory,
      favorite_characters: childInfo.favoriteCharacters
    })

    // 跳转到播放页
    wx.navigateTo({
      url: `/pages/play/index?contentId=${result.id}`
    })
  } catch (err) {
    wx.showToast({ title: '生成失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}
```

#### 2.3 生成儿歌
```http
POST /content/nursery-rhyme
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "child_name": "小明",
  "age_months": 36,
  "theme_topic": "brushing_teeth",
  "theme_category": "habit",
  "favorite_characters": ["小熊"],
  "music_style": "cheerful"
}
```

**music_style 可选值:**
- `cheerful` - 欢快活泼
- `gentle` - 温柔舒缓
- `playful` - 俏皮可爱
- `lullaby` - 摇篮曲
- `educational` - 知识性

**响应:**
```json
{
  "title": "刷牙歌",
  "theme_topic": "brushing_teeth",
  "educational_goal": "用歌曲教会孩子刷牙步骤",
  "lyrics": {
    "intro": "小牙刷，手中拿",
    "verse1": "上刷刷，下刷刷...",
    "chorus": "刷刷刷，刷刷刷...",
    "outro": "牙齿白又亮"
  },
  "audio_url": "https://oss.example.com/song.mp3",
  "audio_duration": 90.5,
  "cover_url": "https://oss.example.com/cover.png",
  "personalization": {...},
  "generated_by": {...}
}
```

#### 2.4 生成视频
```http
POST /content/video
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "picture_book": {
    "title": "小明学刷牙",
    "pages": [...]
  }
}
```

**响应:**
```json
{
  "title": "小明学刷牙",
  "video_url": "https://oss.example.com/video.mp4",
  "duration": 125.5,
  "thumbnail_url": "https://oss.example.com/thumb.png",
  "clips": [
    {
      "page_number": 1,
      "clip_url": "https://oss.example.com/clip1.mp4",
      "duration": 5.0
    }
  ],
  "generated_by": {...}
}
```

---

### 3. 播放追踪接口

#### 3.1 开始播放
```http
POST /play/start
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "child_id": "child-uuid",
  "content_id": "content-uuid"
}
```

**响应:**
```json
{
  "session_id": "session-uuid",
  "content_id": "content-uuid",
  "child_id": "child-uuid",
  "started_at": "2025-12-08T10:00:00Z",
  "resumed_from": 0.0
}
```

#### 3.2 更新播放进度
```http
PUT /play/{session_id}/progress
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "progress": 0.5,
  "duration": 60
}
```

#### 3.3 完成播放
```http
POST /play/{session_id}/complete
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "total_duration": 120
}
```

#### 3.4 提交互动记录
```http
POST /play/{session_id}/interaction
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "interaction_type": "tap",
  "page_number": 3,
  "response_time": 2.5,
  "correct": true
}
```

#### 3.5 获取播放历史
```http
GET /play/history/{child_id}?limit=20&offset=0
Authorization: Bearer {access_token}
```

**响应:**
```json
{
  "items": [
    {
      "id": "history-uuid",
      "content_id": "content-uuid",
      "content_title": "小明学刷牙",
      "content_type": "picture_book",
      "duration": 120,
      "completed": true,
      "progress": 1.0,
      "played_at": "2025-12-08T10:00:00Z"
    }
  ],
  "total": 50,
  "has_more": true
}
```

#### 3.6 获取播放统计
```http
GET /play/stats/{child_id}
Authorization: Bearer {access_token}
```

**响应:**
```json
{
  "child_id": "child-uuid",
  "today_duration": 45,
  "week_duration": 180,
  "total_plays": 25,
  "favorite_type": "nursery_rhyme",
  "streak_days": 7
}
```

---

### 4. 孩子设置接口

#### 4.1 获取设置
```http
GET /child/{child_id}/settings
Authorization: Bearer {access_token}
```

**响应:**
```json
{
  "child_id": "child-uuid",
  "daily_limit_minutes": 60,
  "session_limit_minutes": 20,
  "rest_reminder_enabled": true
}
```

#### 4.2 更新设置
```http
PUT /child/{child_id}/settings
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "daily_limit_minutes": 45,
  "session_limit_minutes": 15,
  "rest_reminder_enabled": true
}
```

---

### 5. 数据统计接口

#### 5.1 获取孩子统计
```http
GET /analytics/stats/{child_id}
Authorization: Bearer {access_token}
```

**响应:**
```json
{
  "child_id": "child-uuid",
  "total_plays": 100,
  "total_duration": 3600,
  "favorite_content_type": "nursery_rhyme",
  "streak_days": 7,
  "weekly_summary": {
    "mon": 30,
    "tue": 45,
    "wed": 20,
    "thu": 60,
    "fri": 30,
    "sat": 45,
    "sun": 30
  }
}
```

#### 5.2 获取 AI 洞察
```http
GET /analytics/insights/{child_id}
Authorization: Bearer {access_token}
```

**响应:**
```json
{
  "child_id": "child-uuid",
  "generated_at": "2025-12-08T10:00:00Z",
  "insights": [
    {
      "type": "achievement",
      "title": "连续学习达人",
      "description": "宝贝已连续7天学习，养成了好习惯！",
      "icon": "🏆"
    },
    {
      "type": "preference",
      "title": "最爱儿歌",
      "description": "宝贝最喜欢听儿歌，尤其是欢快风格的。",
      "icon": "🎵"
    },
    {
      "type": "suggestion",
      "title": "尝试新内容",
      "description": "建议尝试认知类绘本，拓展知识面。",
      "icon": "💡"
    }
  ]
}
```

---

### 6. 收藏与分享接口

#### 6.1 添加收藏
```http
POST /library/favorites
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "content_id": "content-uuid"
}
```

#### 6.2 取消收藏
```http
DELETE /library/favorites/{content_id}
Authorization: Bearer {access_token}
```

#### 6.3 获取收藏列表
```http
GET /library/favorites?limit=20&offset=0
Authorization: Bearer {access_token}
```

#### 6.4 创建分享
```http
POST /library/shares
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "content_id": "content-uuid",
  "platform": "wechat"
}
```

**platform 可选值:**
- `wechat` - 微信好友
- `wechat_moments` - 朋友圈
- `qr_code` - 二维码
- `link` - 链接

**响应:**
```json
{
  "share_code": "abc123",
  "share_url": "https://your-domain.com/s/abc123",
  "poster_url": "https://oss.example.com/poster.png"
}
```

#### 6.5 获取分享详情
```http
GET /library/shares/{share_code}
```

---

### 7. 周计划接口

#### 7.1 生成周计划
```http
POST /plan/generate
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "child_id": "child-uuid",
  "learned_themes": ["brushing_teeth", "eating_vegetables"]
}
```

**响应:**
```json
{
  "child_id": "child-uuid",
  "week_start": "2025-12-09",
  "days": [
    {
      "day": "monday",
      "date": "2025-12-09",
      "items": [
        {
          "content_type": "picture_book",
          "theme_category": "habit",
          "theme_topic": "sleeping_early",
          "title_suggestion": "早睡早起身体好",
          "reason": "建立规律作息"
        }
      ]
    }
  ],
  "generated_by": "gemini-2.0-flash"
}
```

---

### 8. 意图解析接口

#### 8.1 解析家长意图
```http
POST /intent/parse
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "text": "宝宝最近不爱吃蔬菜",
  "child_age_months": 36
}
```

**响应:**
```json
{
  "intent_type": "life_event",
  "category": "habit",
  "topic": "eating_vegetables",
  "confidence": 0.95,
  "suggested_content": {
    "content_type": "picture_book",
    "theme_topic": "eating_vegetables",
    "title_suggestion": "蔬菜小勇士"
  },
  "reasoning": "检测到饮食习惯问题，建议通过绘本培养吃蔬菜的兴趣"
}
```

---

## 页面结构设计

### 页面导航结构

```
TabBar 页面:
├── 首页 (index)           - 推荐内容 + 快速创作入口
├── 创作 (create)          - 创作中心
├── 内容库 (library)       - 已生成内容 + 收藏
└── 我的 (profile)         - 设置 + 统计

非 TabBar 页面:
├── 绘本创作 (create/picture-book)
├── 儿歌创作 (create/nursery-rhyme)
├── 视频创作 (create/video)
├── 播放页 (play)
├── 儿童模式 (child-mode)
├── 孩子设置 (settings/child)
├── 数据统计 (analytics)
└── 分享页 (share)
```

### 各页面功能说明

#### 1. 首页 (index)
- 今日推荐内容
- 快速创作入口
- 最近播放记录
- 学习进度概览

#### 2. 创作中心 (create)
- 内容类型选择（绘本/儿歌/视频）
- 主题分类浏览
- AI 意图输入框（自然语言描述需求）

#### 3. 内容库 (library)
- 全部内容列表
- 收藏内容
- 按类型筛选
- 搜索功能

#### 4. 播放页 (play)
- 绘本翻页播放
- 儿歌音频播放
- 视频播放
- 互动响应
- 进度保存

#### 5. 儿童模式 (child-mode)
- 简化界面
- 大按钮设计
- 时间限制提醒
- 休息引导动画

---

## 核心功能实现

### 1. 请求封装

```javascript
// utils/request.js
const BASE_URL = 'https://your-domain.com/api/v1'

class Request {
  async request(options) {
    const token = wx.getStorageSync('access_token')

    const header = {
      'Content-Type': 'application/json',
      ...options.header
    }

    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }

    try {
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: BASE_URL + options.url,
          method: options.method || 'GET',
          data: options.data,
          header,
          success: resolve,
          fail: reject
        })
      })

      if (res.statusCode === 401) {
        // Token 过期，尝试刷新
        await this.refreshToken()
        return this.request(options)
      }

      if (res.statusCode >= 400) {
        throw new Error(res.data.detail || '请求失败')
      }

      return res.data
    } catch (err) {
      console.error('Request error:', err)
      throw err
    }
  }

  async refreshToken() {
    const refreshToken = wx.getStorageSync('refresh_token')
    if (!refreshToken) {
      throw new Error('No refresh token')
    }

    const res = await this.post('/auth/refresh', {
      refresh_token: refreshToken
    })

    wx.setStorageSync('access_token', res.access_token)
    wx.setStorageSync('refresh_token', res.refresh_token)
  }

  get(url, data) {
    return this.request({ url, method: 'GET', data })
  }

  post(url, data) {
    return this.request({ url, method: 'POST', data })
  }

  put(url, data) {
    return this.request({ url, method: 'PUT', data })
  }

  delete(url) {
    return this.request({ url, method: 'DELETE' })
  }
}

export default new Request()
```

### 2. 播放时间管理

```javascript
// utils/time-limit.js
class TimeLimitManager {
  constructor() {
    this.sessionStart = null
    this.todayTotal = 0
    this.settings = {
      daily_limit_minutes: 60,
      session_limit_minutes: 20,
      rest_reminder_enabled: true
    }
  }

  async loadSettings(childId) {
    const res = await request.get(`/child/${childId}/settings`)
    this.settings = res
    this.todayTotal = await this.getTodayDuration(childId)
  }

  async getTodayDuration(childId) {
    const stats = await request.get(`/play/stats/${childId}`)
    return stats.today_duration
  }

  startSession() {
    this.sessionStart = Date.now()
  }

  checkLimits() {
    const sessionMinutes = (Date.now() - this.sessionStart) / 60000
    const totalMinutes = this.todayTotal + sessionMinutes

    // 检查单次限制
    if (sessionMinutes >= this.settings.session_limit_minutes) {
      return {
        exceeded: true,
        type: 'session',
        message: '已经看了很久了，让眼睛休息一下吧！'
      }
    }

    // 检查每日限制
    if (totalMinutes >= this.settings.daily_limit_minutes) {
      return {
        exceeded: true,
        type: 'daily',
        message: '今天的学习时间已经够啦，明天再来吧！'
      }
    }

    // 休息提醒（每 10 分钟）
    if (this.settings.rest_reminder_enabled && sessionMinutes % 10 < 0.1) {
      return {
        exceeded: false,
        reminder: true,
        message: '看了一会儿了，眨眨眼睛休息一下～'
      }
    }

    return { exceeded: false }
  }
}

export default new TimeLimitManager()
```

### 3. 绘本播放组件

```vue
<!-- components/PictureBookPlayer.vue -->
<template>
  <view class="picture-book-player">
    <!-- 页面显示 -->
    <swiper
      class="pages"
      :current="currentPage"
      @change="onPageChange"
    >
      <swiper-item
        v-for="(page, index) in pages"
        :key="index"
      >
        <view class="page">
          <image
            class="page-image"
            :src="page.image_url"
            mode="aspectFit"
          />
          <view class="page-text">{{ page.text }}</view>

          <!-- 互动区域 -->
          <view
            v-if="page.interaction"
            class="interaction"
            @tap="handleInteraction(page, index)"
          >
            {{ page.interaction.prompt }}
          </view>
        </view>
      </swiper-item>
    </swiper>

    <!-- 音频播放 -->
    <view class="audio-controls">
      <button @tap="toggleAudio">
        {{ isPlaying ? '暂停' : '播放' }}
      </button>
      <view class="progress">
        {{ currentPage + 1 }} / {{ pages.length }}
      </view>
    </view>

    <!-- 时间限制提示 -->
    <view v-if="showTimeWarning" class="time-warning">
      <view class="warning-content">
        <image src="/assets/rest-icon.png" />
        <text>{{ timeWarningMessage }}</text>
        <button @tap="handleTimeWarning">好的</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import request from '@/utils/request'
import timeLimitManager from '@/utils/time-limit'

const props = defineProps({
  contentId: String,
  childId: String,
  pages: Array
})

const currentPage = ref(0)
const isPlaying = ref(false)
const sessionId = ref(null)
const audioContext = ref(null)
const showTimeWarning = ref(false)
const timeWarningMessage = ref('')

let checkInterval = null

onMounted(async () => {
  // 开始播放会话
  const res = await request.post('/play/start', {
    child_id: props.childId,
    content_id: props.contentId
  })
  sessionId.value = res.session_id

  // 加载时间设置
  await timeLimitManager.loadSettings(props.childId)
  timeLimitManager.startSession()

  // 定时检查时间限制
  checkInterval = setInterval(checkTimeLimit, 30000)

  // 初始化音频
  audioContext.value = wx.createInnerAudioContext()
  playCurrentPageAudio()
})

onUnmounted(() => {
  clearInterval(checkInterval)
  audioContext.value?.destroy()

  // 保存进度
  if (sessionId.value) {
    request.put(`/play/${sessionId.value}/progress`, {
      progress: currentPage.value / props.pages.length,
      duration: Math.floor((Date.now() - timeLimitManager.sessionStart) / 1000)
    })
  }
})

function checkTimeLimit() {
  const result = timeLimitManager.checkLimits()

  if (result.exceeded || result.reminder) {
    isPlaying.value = false
    audioContext.value?.pause()
    showTimeWarning.value = true
    timeWarningMessage.value = result.message
  }
}

function handleTimeWarning() {
  showTimeWarning.value = false

  const result = timeLimitManager.checkLimits()
  if (result.exceeded) {
    // 超时，返回上一页
    wx.navigateBack()
  }
}

function onPageChange(e) {
  currentPage.value = e.detail.current
  playCurrentPageAudio()

  // 更新进度
  request.put(`/play/${sessionId.value}/progress`, {
    progress: currentPage.value / props.pages.length,
    duration: Math.floor((Date.now() - timeLimitManager.sessionStart) / 1000)
  })
}

function playCurrentPageAudio() {
  const page = props.pages[currentPage.value]
  if (page.audio_url) {
    audioContext.value.src = page.audio_url
    audioContext.value.play()
    isPlaying.value = true
  }
}

function toggleAudio() {
  if (isPlaying.value) {
    audioContext.value.pause()
  } else {
    audioContext.value.play()
  }
  isPlaying.value = !isPlaying.value
}

async function handleInteraction(page, pageIndex) {
  // 记录互动
  await request.post(`/play/${sessionId.value}/interaction`, {
    interaction_type: page.interaction.type,
    page_number: pageIndex + 1,
    response_time: 2.0,
    correct: true
  })

  // 播放互动反馈
  wx.showToast({ title: '太棒了！', icon: 'success' })
}
</script>
```

---

## 状态管理

### Pinia Store 示例

```javascript
// store/user.js
import { defineStore } from 'pinia'
import request from '@/utils/request'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isLoggedIn: false,
    children: []
  }),

  actions: {
    async login() {
      const { code } = await wx.login()
      const res = await request.post('/auth/wechat/login', { code })

      wx.setStorageSync('access_token', res.access_token)
      wx.setStorageSync('refresh_token', res.refresh_token)

      await this.fetchUser()
    },

    async fetchUser() {
      this.user = await request.get('/auth/me')
      this.isLoggedIn = true
    },

    logout() {
      wx.removeStorageSync('access_token')
      wx.removeStorageSync('refresh_token')
      this.user = null
      this.isLoggedIn = false
    }
  }
})

// store/child.js
import { defineStore } from 'pinia'
import request from '@/utils/request'

export const useChildStore = defineStore('child', {
  state: () => ({
    currentChild: null,
    settings: null,
    stats: null
  }),

  actions: {
    setCurrentChild(child) {
      this.currentChild = child
    },

    async fetchSettings() {
      if (!this.currentChild) return
      this.settings = await request.get(
        `/child/${this.currentChild.id}/settings`
      )
    },

    async updateSettings(newSettings) {
      if (!this.currentChild) return
      this.settings = await request.put(
        `/child/${this.currentChild.id}/settings`,
        newSettings
      )
    },

    async fetchStats() {
      if (!this.currentChild) return
      this.stats = await request.get(
        `/analytics/stats/${this.currentChild.id}`
      )
    }
  }
})
```

---

## UI/UX 设计建议

### 1. 设计原则

- **儿童友好**: 大按钮、鲜艳色彩、圆角设计
- **家长放心**: 清晰的时间管理、学习进度可视化
- **操作简单**: 最多 3 步完成核心操作

### 2. 色彩方案

```css
/* 主色调 - 温暖活泼 */
--primary: #FF6B6B;      /* 珊瑚红 */
--secondary: #4ECDC4;    /* 青绿色 */
--accent: #FFE66D;       /* 明黄色 */

/* 背景色 */
--bg-light: #FFF9F0;     /* 奶油白 */
--bg-card: #FFFFFF;

/* 文字色 */
--text-primary: #2D3436;
--text-secondary: #636E72;

/* 功能色 */
--success: #00B894;
--warning: #FDCB6E;
--error: #E17055;
```

### 3. 关键交互

#### 内容生成等待
- 显示生成进度（故事编写 → 图片生成 → 音频合成）
- 可爱的加载动画
- 预计完成时间

#### 时间限制提醒
- 温和的动画提示
- 可爱的休息引导角色
- 倒计时显示

#### 儿童模式切换
- 长按或密码保护退出
- 简化的界面
- 更大的触摸区域

### 4. 响应式适配

```css
/* 适配不同屏幕 */
.page {
  padding: calc(20rpx + env(safe-area-inset-top)) 30rpx;
}

.bottom-bar {
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}
```

---

## 开发检查清单

### Phase 1: 基础框架
- [ ] 项目初始化（uni-app/Taro）
- [ ] 请求封装与 Token 管理
- [ ] 路由配置
- [ ] 状态管理配置

### Phase 2: 认证与用户
- [ ] 微信登录流程
- [ ] 用户信息展示
- [ ] 孩子信息管理

### Phase 3: 内容生成
- [ ] 主题选择页面
- [ ] 绘本生成流程
- [ ] 儿歌生成流程
- [ ] 生成进度展示

### Phase 4: 播放功能
- [ ] 绘本播放器
- [ ] 儿歌播放器
- [ ] 视频播放器
- [ ] 播放进度保存

### Phase 5: 时间管理
- [ ] 时间限制逻辑
- [ ] 休息提醒
- [ ] 设置页面

### Phase 6: 高级功能
- [ ] 收藏功能
- [ ] 分享功能
- [ ] 数据统计页面
- [ ] AI 洞察展示

---

## 联系与支持

- **后端 API 文档**: `/docs` (Swagger UI)
- **健康检查**: `GET /health`

```bash
# 启动后端开发服务器
cd /root/kids
PYTHONPATH=src uvicorn moana.main:app --reload --host 0.0.0.0 --port 8000
```
