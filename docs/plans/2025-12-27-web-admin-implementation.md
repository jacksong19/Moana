# Moana 网页版家长管理端 - 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建 Vue 3 网页版家长管理端，复用小程序 API 层和业务逻辑

**Architecture:** Vite + Vue 3 + TypeScript + Pinia + TailwindCSS，响应式布局支持桌面/平板/手机

**Tech Stack:** Vue 3.4, Vue Router 4, Pinia 2, Axios, TailwindCSS 3, ECharts 5

---

## Task 1: 项目初始化

**Files:**
- Create: `web/package.json`
- Create: `web/vite.config.ts`
- Create: `web/tsconfig.json`
- Create: `web/index.html`
- Create: `web/src/main.ts`
- Create: `web/src/App.vue`
- Create: `web/src/vite-env.d.ts`

**Step 1: 创建项目目录并初始化 package.json**

```bash
cd /Users/jack/coding/kids
mkdir -p web/src
```

创建 `web/package.json`:
```json
{
  "name": "moana-web-admin",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.0",
    "echarts": "^5.5.0",
    "pinia": "^2.2.0",
    "vue": "^3.4.0",
    "vue-router": "^4.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.1.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vue-tsc": "^2.1.0"
  }
}
```

**Step 2: 创建 Vite 配置**

创建 `web/vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://kids.jackverse.cn',
        changeOrigin: true
      }
    }
  },
  base: '/web/'
})
```

**Step 3: 创建 TypeScript 配置**

创建 `web/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

创建 `web/tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

**Step 4: 创建入口文件**

创建 `web/index.html`:
```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Moana 家长管理</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

创建 `web/src/vite-env.d.ts`:
```typescript
/// <reference types="vite/client" />
```

创建 `web/src/main.ts`:
```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

创建 `web/src/App.vue`:
```vue
<template>
  <router-view />
</template>
```

**Step 5: 安装依赖并验证**

```bash
cd /Users/jack/coding/kids/web
npm install
```

Expected: 依赖安装成功

**Step 6: Commit**

```bash
cd /Users/jack/coding/kids
git add web/
git commit -m "feat(web): 初始化 Vue 3 + Vite 项目"
```

---

## Task 2: TailwindCSS 配置

**Files:**
- Create: `web/tailwind.config.js`
- Create: `web/postcss.config.js`
- Create: `web/src/styles/main.css`

**Step 1: 创建 Tailwind 配置**

创建 `web/tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      }
    },
  },
  plugins: [],
}
```

**Step 2: 创建 PostCSS 配置**

创建 `web/postcss.config.js`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Step 3: 创建主样式文件**

创建 `web/src/styles/main.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 自定义基础样式 */
@layer base {
  body {
    @apply bg-gray-50 text-gray-900 antialiased;
  }
}

/* 自定义组件样式 */
@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors;
  }
  .btn-primary {
    @apply bg-primary-500 text-white hover:bg-primary-600;
  }
  .card {
    @apply bg-white rounded-xl shadow-sm border border-gray-100 p-6;
  }
  .input {
    @apply w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none;
  }
}
```

**Step 4: Commit**

```bash
git add web/tailwind.config.js web/postcss.config.js web/src/styles/
git commit -m "feat(web): 配置 TailwindCSS"
```

---

## Task 3: 路由配置

**Files:**
- Create: `web/src/router/index.ts`
- Create: `web/src/views/Login.vue` (占位)
- Create: `web/src/views/Dashboard.vue` (占位)

**Step 1: 创建路由配置**

创建 `web/src/router/index.ts`:
```typescript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/web/'),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/children',
      name: 'Children',
      component: () => import('@/views/Children.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/children/add',
      name: 'AddChild',
      component: () => import('@/views/AddChild.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/children/:id',
      name: 'ChildDetail',
      component: () => import('@/views/ChildDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/library',
      name: 'Library',
      component: () => import('@/views/Library.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/favorites',
      name: 'Favorites',
      component: () => import('@/views/Favorites.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/play/:type/:id',
      name: 'Play',
      component: () => import('@/views/Play.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/report',
      name: 'Report',
      component: () => import('@/views/Report.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/views/Settings.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const isLoggedIn = localStorage.getItem('admin_token')

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && isLoggedIn) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
```

**Step 2: 创建占位页面**

创建 `web/src/views/Login.vue`:
```vue
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <h1 class="text-2xl font-bold">登录页</h1>
      <p class="text-gray-500">待实现</p>
    </div>
  </div>
</template>
```

创建 `web/src/views/Dashboard.vue`:
```vue
<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold">仪表盘</h1>
    <p class="text-gray-500">待实现</p>
  </div>
</template>
```

为其他页面创建类似的占位文件：
- `web/src/views/Children.vue`
- `web/src/views/AddChild.vue`
- `web/src/views/ChildDetail.vue`
- `web/src/views/Library.vue`
- `web/src/views/Favorites.vue`
- `web/src/views/Play.vue`
- `web/src/views/Report.vue`
- `web/src/views/Settings.vue`

**Step 3: 验证路由**

```bash
cd /Users/jack/coding/kids/web
npm run dev
```

访问 http://localhost:3000/web/login 验证路由工作

**Step 4: Commit**

```bash
git add web/src/router/ web/src/views/
git commit -m "feat(web): 添加路由配置和占位页面"
```

---

## Task 4: API 层 - 请求封装

**Files:**
- Create: `web/src/api/request.ts`
- Create: `web/src/api/types.ts`

**Step 1: 创建类型定义**

创建 `web/src/api/types.ts`:
```typescript
// 孩子信息
export interface Child {
  id: string
  name: string
  birth_date: string
  avatar_url?: string | null
  interests: string[]
  favorite_characters: string[]
  current_stage?: string | null
}

// 时间设置
export interface ChildSettings {
  child_id: string
  daily_limit_minutes: number
  session_limit_minutes: number
  rest_reminder_enabled: boolean
}

// 绘本页面
export interface PictureBookPage {
  page_number: number
  text: string
  image_url: string
  image_thumb_url?: string
  audio_url: string
  duration: number
}

// 绘本
export interface PictureBook {
  id: string
  title: string
  theme_topic: string
  theme_category?: string
  pages: PictureBookPage[]
  total_duration: number
  cover_url?: string
  cover_thumb_url?: string
  created_at: string
  content_type?: 'picture_book'
}

// 时间戳歌词
export interface TimestampedLyricItem {
  word: string
  start_s: number
  end_s: number
}

// 歌词对象
export interface LyricsObject {
  full_text: string
  sections?: { content: string }[]
  timestamped?: TimestampedLyricItem[]
}

// 儿歌
export interface NurseryRhyme {
  id: string
  title: string
  theme_topic: string
  lyrics: string | LyricsObject
  audio_url: string
  video_url?: string
  cover_url?: string
  suno_cover_url?: string
  duration: number
  created_at: string
  content_type?: 'nursery_rhyme'
}

// 视频
export interface Video {
  id: string
  title: string
  video_url: string
  cover_url?: string
  duration: number
  created_at: string
  content_type?: 'video'
}

// 内容联合类型
export type Content = PictureBook | NurseryRhyme | Video

// 内容列表响应
export interface ContentListResponse {
  items: Content[]
  total: number
  has_more: boolean
}

// 学习统计
export interface LearningStats {
  total_duration_minutes: number
  total_books: number
  total_songs: number
  total_videos: number
  streak_days: number
  daily_activity: Array<{
    date: string
    has_activity: boolean
    duration_minutes: number
  }>
}
```

**Step 2: 创建请求封装**

创建 `web/src/api/request.ts`:
```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://kids.jackverse.cn/api/v1'

// 创建 axios 实例
const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Token 过期，尝试刷新
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken
          })
          localStorage.setItem('access_token', res.data.access_token)
          localStorage.setItem('refresh_token', res.data.refresh_token)
          // 重试原请求
          error.config.headers.Authorization = `Bearer ${res.data.access_token}`
          return instance(error.config)
        } catch {
          // 刷新失败，跳转登录
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('admin_token')
          window.location.href = '/web/login'
        }
      } else {
        window.location.href = '/web/login'
      }
    }
    return Promise.reject(error)
  }
)

// 导出请求方法
export default {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.get(url, config)
  },
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return instance.post(url, data, config)
  },
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return instance.put(url, data, config)
  },
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.delete(url, config)
  }
}
```

**Step 3: Commit**

```bash
git add web/src/api/
git commit -m "feat(web): 添加 API 请求层和类型定义"
```

---

## Task 5: API 层 - 业务接口

**Files:**
- Create: `web/src/api/auth.ts`
- Create: `web/src/api/child.ts`
- Create: `web/src/api/content.ts`
- Create: `web/src/api/favorite.ts`
- Create: `web/src/api/play.ts`

**Step 1: 认证接口**

创建 `web/src/api/auth.ts`:
```typescript
import request from './request'

const ADMIN_PASSWORD = 'Jack@kids'

// 简单密码验证（前端验证）
export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD
}

// 模拟登录（使用小程序的 mock 登录获取 token）
export async function login(): Promise<{ access_token: string; refresh_token: string }> {
  return request.post('/auth/mock-login')
}

// 登出
export function logout(): void {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('admin_token')
}
```

**Step 2: 孩子管理接口**

创建 `web/src/api/child.ts`:
```typescript
import request from './request'
import type { Child, ChildSettings } from './types'

// 获取孩子列表
export function getChildren(): Promise<Child[]> {
  return request.get('/child/list')
}

// 添加孩子
export function addChild(data: {
  name: string
  birth_date: string
  avatar_url?: string
  interests?: string[]
  favorite_characters?: string[]
}): Promise<Child> {
  return request.post('/child', data)
}

// 获取孩子设置
export function getChildSettings(childId: string): Promise<ChildSettings> {
  return request.get(`/child/${childId}/settings`)
}

// 更新孩子设置
export function updateChildSettings(childId: string, settings: Partial<ChildSettings>): Promise<ChildSettings> {
  return request.put(`/child/${childId}/settings`, settings)
}
```

**Step 3: 内容接口**

创建 `web/src/api/content.ts`:
```typescript
import request from './request'
import type { Content, ContentListResponse, PictureBook, NurseryRhyme, Video } from './types'

// 获取内容列表
export function getContentList(params?: {
  type?: 'picture_book' | 'nursery_rhyme' | 'video'
  limit?: number
  offset?: number
}): Promise<ContentListResponse> {
  return request.get('/content/list', { params })
}

// 获取内容详情
export function getContentDetail(contentId: string): Promise<PictureBook | NurseryRhyme | Video> {
  return request.get(`/content/${contentId}`)
}

// 删除内容
export function deleteContent(contentId: string): Promise<void> {
  return request.delete(`/content/${contentId}`)
}
```

**Step 4: 收藏接口**

创建 `web/src/api/favorite.ts`:
```typescript
import request from './request'
import type { Content } from './types'

// 获取收藏列表
export function getFavorites(params?: {
  limit?: number
  offset?: number
}): Promise<{ items: Content[]; total: number; has_more: boolean }> {
  return request.get('/library/favorites', { params })
}

// 添加收藏
export function addFavorite(contentId: string): Promise<void> {
  return request.post('/library/favorites', { content_id: contentId })
}

// 取消收藏
export function removeFavorite(contentId: string): Promise<void> {
  return request.delete(`/library/favorites/${contentId}`)
}

// 检查是否已收藏
export function checkFavorite(contentId: string): Promise<{ is_favorite: boolean }> {
  return request.get(`/library/favorites/check/${contentId}`)
}
```

**Step 5: 播放统计接口**

创建 `web/src/api/play.ts`:
```typescript
import request from './request'
import type { LearningStats } from './types'

// 获取今日时长
export function getTodayStats(childId: string): Promise<{ today_duration: number }> {
  return request.get(`/play/stats/${childId}`)
}

// 获取学习统计
export function getLearningStats(childId: string, days?: number): Promise<LearningStats> {
  return request.get(`/play/learning-stats/${childId}`, { params: { days } })
}
```

**Step 6: Commit**

```bash
git add web/src/api/
git commit -m "feat(web): 添加业务 API 接口"
```

---

## Task 6: Pinia Stores

**Files:**
- Create: `web/src/stores/user.ts`
- Create: `web/src/stores/child.ts`

**Step 1: 用户 Store**

创建 `web/src/stores/user.ts`:
```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, logout as apiLogout, verifyPassword } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(!!localStorage.getItem('admin_token'))

  async function login(password: string): Promise<boolean> {
    if (!verifyPassword(password)) {
      return false
    }

    try {
      const res = await apiLogin()
      localStorage.setItem('access_token', res.access_token)
      localStorage.setItem('refresh_token', res.refresh_token)
      localStorage.setItem('admin_token', 'true')
      isLoggedIn.value = true
      return true
    } catch {
      return false
    }
  }

  function logout() {
    apiLogout()
    isLoggedIn.value = false
  }

  return {
    isLoggedIn,
    login,
    logout
  }
})
```

**Step 2: 孩子 Store**

创建 `web/src/stores/child.ts`:
```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getChildren, getChildSettings, updateChildSettings as apiUpdateSettings, addChild as apiAddChild } from '@/api/child'
import { getTodayStats } from '@/api/play'
import type { Child, ChildSettings } from '@/api/types'

export const useChildStore = defineStore('child', () => {
  const children = ref<Child[]>([])
  const currentChild = ref<Child | null>(null)
  const settings = ref<ChildSettings>({
    child_id: '',
    daily_limit_minutes: 60,
    session_limit_minutes: 30,
    rest_reminder_enabled: true
  })
  const todayDuration = ref(0)

  const hasChild = computed(() => children.value.length > 0)

  const currentChildAge = computed(() => {
    if (!currentChild.value?.birth_date) return ''
    const birth = new Date(currentChild.value.birth_date)
    const now = new Date()
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    if (months <= 0) return ''
    const years = Math.floor(months / 12)
    const remainMonths = months % 12
    if (years === 0) return `${remainMonths}个月`
    if (remainMonths === 0) return `${years}岁`
    return `${years}岁${remainMonths}个月`
  })

  async function fetchChildren() {
    try {
      children.value = await getChildren()
      const savedChildId = localStorage.getItem('current_child_id')
      if (savedChildId) {
        const saved = children.value.find(c => c.id === savedChildId)
        if (saved) {
          currentChild.value = saved
          await fetchSettings()
          return
        }
      }
      if (children.value.length > 0) {
        setCurrentChild(children.value[0])
      }
    } catch (e) {
      console.error('获取孩子列表失败:', e)
    }
  }

  function setCurrentChild(child: Child) {
    currentChild.value = child
    localStorage.setItem('current_child_id', child.id)
    fetchSettings()
    fetchTodayDuration()
  }

  async function fetchSettings() {
    if (!currentChild.value) return
    try {
      settings.value = await getChildSettings(currentChild.value.id)
    } catch {
      settings.value = {
        child_id: currentChild.value.id,
        daily_limit_minutes: 60,
        session_limit_minutes: 30,
        rest_reminder_enabled: true
      }
    }
  }

  async function updateSettings(newSettings: Partial<ChildSettings>) {
    if (!currentChild.value) return
    settings.value = await apiUpdateSettings(currentChild.value.id, { ...settings.value, ...newSettings })
  }

  async function fetchTodayDuration() {
    if (!currentChild.value) return
    try {
      const stats = await getTodayStats(currentChild.value.id)
      todayDuration.value = stats.today_duration
    } catch {
      todayDuration.value = 0
    }
  }

  async function addChild(data: { name: string; birth_date: string; interests?: string[]; favorite_characters?: string[] }) {
    const child = await apiAddChild(data)
    children.value.push(child)
    if (children.value.length === 1) {
      setCurrentChild(child)
    }
    return child
  }

  return {
    children,
    currentChild,
    settings,
    todayDuration,
    hasChild,
    currentChildAge,
    fetchChildren,
    setCurrentChild,
    fetchSettings,
    updateSettings,
    fetchTodayDuration,
    addChild
  }
})
```

**Step 3: Commit**

```bash
git add web/src/stores/
git commit -m "feat(web): 添加 Pinia stores"
```

---

## Task 7: 布局组件

**Files:**
- Create: `web/src/components/Layout/AppLayout.vue`
- Create: `web/src/components/Layout/Sidebar.vue`
- Create: `web/src/components/Layout/MobileNav.vue`
- Modify: `web/src/App.vue`

**Step 1: 创建侧边栏组件**

创建 `web/src/components/Layout/Sidebar.vue`:
```vue
<template>
  <aside class="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
    <!-- Logo -->
    <div class="flex items-center h-16 px-6 border-b border-gray-200">
      <span class="text-xl font-bold text-primary-600">Moana</span>
      <span class="ml-2 text-sm text-gray-500">家长管理</span>
    </div>

    <!-- 导航 -->
    <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
        :class="isActive(item.path)
          ? 'bg-primary-50 text-primary-600'
          : 'text-gray-600 hover:bg-gray-50'"
      >
        <span class="mr-3">{{ item.icon }}</span>
        {{ item.name }}
      </router-link>
    </nav>

    <!-- 底部：当前孩子 -->
    <div class="p-4 border-t border-gray-200" v-if="childStore.currentChild">
      <div class="flex items-center">
        <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
          {{ childStore.currentChild.name.charAt(0) }}
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-gray-900">{{ childStore.currentChild.name }}</p>
          <p class="text-xs text-gray-500">{{ childStore.currentChildAge }}</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useChildStore } from '@/stores/child'

const route = useRoute()
const childStore = useChildStore()

const navItems = [
  { path: '/dashboard', name: '仪表盘', icon: '📊' },
  { path: '/children', name: '孩子管理', icon: '👶' },
  { path: '/library', name: '内容库', icon: '📚' },
  { path: '/favorites', name: '收藏', icon: '❤️' },
  { path: '/report', name: '学习报告', icon: '📈' },
  { path: '/settings', name: '设置', icon: '⚙️' },
]

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>
```

**Step 2: 创建移动端导航**

创建 `web/src/components/Layout/MobileNav.vue`:
```vue
<template>
  <!-- 顶部 Header -->
  <header class="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50">
    <div class="flex items-center justify-between h-full px-4">
      <span class="text-lg font-bold text-primary-600">Moana</span>
      <span class="text-sm text-gray-500">{{ pageTitle }}</span>
    </div>
  </header>

  <!-- 底部 TabBar -->
  <nav class="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-50">
    <div class="grid grid-cols-5 h-full">
      <router-link
        v-for="item in tabItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center justify-center text-xs"
        :class="isActive(item.path) ? 'text-primary-600' : 'text-gray-500'"
      >
        <span class="text-xl mb-1">{{ item.icon }}</span>
        <span>{{ item.name }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const tabItems = [
  { path: '/dashboard', name: '首页', icon: '🏠' },
  { path: '/library', name: '内容', icon: '📚' },
  { path: '/favorites', name: '收藏', icon: '❤️' },
  { path: '/report', name: '报告', icon: '📈' },
  { path: '/settings', name: '设置', icon: '⚙️' },
]

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/dashboard': '仪表盘',
    '/children': '孩子管理',
    '/library': '内容库',
    '/favorites': '收藏',
    '/report': '学习报告',
    '/settings': '设置',
  }
  return titles[route.path] || ''
})

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>
```

**Step 3: 创建主布局组件**

创建 `web/src/components/Layout/AppLayout.vue`:
```vue
<template>
  <div class="min-h-screen bg-gray-50">
    <Sidebar />
    <MobileNav />

    <!-- 主内容区 -->
    <main class="lg:pl-64 pt-14 lg:pt-0 pb-16 lg:pb-0">
      <div class="p-4 lg:p-8">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import MobileNav from './MobileNav.vue'
</script>
```

**Step 4: 更新 App.vue**

修改 `web/src/App.vue`:
```vue
<template>
  <AppLayout v-if="showLayout">
    <router-view />
  </AppLayout>
  <router-view v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/Layout/AppLayout.vue'

const route = useRoute()

const showLayout = computed(() => {
  // 登录页和播放页不显示布局
  return route.path !== '/login' && !route.path.startsWith('/play/')
})
</script>
```

**Step 5: Commit**

```bash
git add web/src/components/ web/src/App.vue
git commit -m "feat(web): 添加响应式布局组件"
```

---

## Task 8: 登录页

**Files:**
- Modify: `web/src/views/Login.vue`

**Step 1: 实现登录页**

修改 `web/src/views/Login.vue`:
```vue
<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
    <div class="w-full max-w-sm">
      <div class="card">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 mx-auto bg-primary-500 rounded-2xl flex items-center justify-center mb-4">
            <span class="text-3xl">🐠</span>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Moana</h1>
          <p class="text-gray-500 mt-1">家长管理端</p>
        </div>

        <!-- 表单 -->
        <form @submit.prevent="handleLogin">
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">访问密码</label>
            <input
              v-model="password"
              type="password"
              class="input"
              placeholder="请输入密码"
              :class="{ 'border-red-500': error }"
            />
            <p v-if="error" class="mt-2 text-sm text-red-500">{{ error }}</p>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full"
            :disabled="loading"
          >
            {{ loading ? '登录中...' : '进入管理' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true

  try {
    const success = await userStore.login(password.value)
    if (success) {
      router.push('/dashboard')
    } else {
      error.value = '密码错误'
    }
  } catch (e) {
    error.value = '登录失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>
```

**Step 2: 验证登录功能**

```bash
cd /Users/jack/coding/kids/web
npm run dev
```

访问 http://localhost:3000/web/login，输入密码 `Jack@kids` 验证登录

**Step 3: Commit**

```bash
git add web/src/views/Login.vue
git commit -m "feat(web): 实现登录页"
```

---

## Task 9: 仪表盘页面

**Files:**
- Modify: `web/src/views/Dashboard.vue`

**Step 1: 实现仪表盘**

修改 `web/src/views/Dashboard.vue`:
```vue
<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">仪表盘</h1>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 今日学习 -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <span class="text-gray-500">今日学习</span>
          <span class="text-2xl">📖</span>
        </div>
        <div class="text-2xl font-bold text-gray-900">
          {{ childStore.todayDuration }} 分钟
        </div>
        <div class="mt-2">
          <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              class="h-full bg-primary-500 rounded-full transition-all"
              :style="{ width: `${Math.min(100, (childStore.todayDuration / childStore.settings.daily_limit_minutes) * 100)}%` }"
            />
          </div>
          <p class="text-xs text-gray-500 mt-1">
            限制 {{ childStore.settings.daily_limit_minutes }} 分钟
          </p>
        </div>
      </div>

      <!-- 内容统计 -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <span class="text-gray-500">内容统计</span>
          <span class="text-2xl">📚</span>
        </div>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">绘本</span>
            <span class="font-medium">{{ stats.books }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">儿歌</span>
            <span class="font-medium">{{ stats.songs }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">视频</span>
            <span class="font-medium">{{ stats.videos }}</span>
          </div>
        </div>
      </div>

      <!-- 当前孩子 -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <span class="text-gray-500">当前孩子</span>
          <span class="text-2xl">👶</span>
        </div>
        <div v-if="childStore.currentChild" class="flex items-center">
          <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-medium">
            {{ childStore.currentChild.name.charAt(0) }}
          </div>
          <div class="ml-3">
            <p class="font-medium text-gray-900">{{ childStore.currentChild.name }}</p>
            <p class="text-sm text-gray-500">{{ childStore.currentChildAge }}</p>
          </div>
        </div>
        <router-link
          v-else
          to="/children/add"
          class="text-primary-600 hover:underline"
        >
          + 添加孩子
        </router-link>
      </div>

      <!-- 快捷操作 -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <span class="text-gray-500">快捷操作</span>
          <span class="text-2xl">🚀</span>
        </div>
        <div class="space-y-2">
          <router-link
            to="/library"
            class="block px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            查看内容库 →
          </router-link>
          <router-link
            to="/report"
            class="block px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            查看报告 →
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useChildStore } from '@/stores/child'
import { getContentList } from '@/api/content'

const childStore = useChildStore()

const stats = ref({ books: 0, songs: 0, videos: 0 })

onMounted(async () => {
  await childStore.fetchChildren()
  await childStore.fetchTodayDuration()

  // 获取内容统计
  try {
    const [books, songs, videos] = await Promise.all([
      getContentList({ type: 'picture_book', limit: 1 }),
      getContentList({ type: 'nursery_rhyme', limit: 1 }),
      getContentList({ type: 'video', limit: 1 }),
    ])
    stats.value = {
      books: books.total,
      songs: songs.total,
      videos: videos.total,
    }
  } catch (e) {
    console.error('获取内容统计失败:', e)
  }
})
</script>
```

**Step 2: Commit**

```bash
git add web/src/views/Dashboard.vue
git commit -m "feat(web): 实现仪表盘页面"
```

---

## Task 10: 内容库页面

**Files:**
- Modify: `web/src/views/Library.vue`
- Create: `web/src/components/ContentCard.vue`

**Step 1: 创建内容卡片组件**

创建 `web/src/components/ContentCard.vue`:
```vue
<template>
  <div class="card p-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
    <!-- 封面图 -->
    <div class="relative aspect-video bg-gray-100">
      <img
        v-if="cover"
        :src="cover"
        :alt="content.title"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-4xl">
        {{ typeIcon }}
      </div>

      <!-- 类型角标 -->
      <span class="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full bg-black/50 text-white">
        {{ typeLabel }}
      </span>

      <!-- 悬浮操作 -->
      <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
        <button
          @click.stop="$emit('play')"
          class="w-12 h-12 rounded-full bg-white text-gray-900 flex items-center justify-center hover:scale-110 transition-transform"
        >
          ▶️
        </button>
        <button
          @click.stop="$emit('delete')"
          class="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform"
        >
          🗑️
        </button>
      </div>
    </div>

    <!-- 信息 -->
    <div class="p-4">
      <h3 class="font-medium text-gray-900 truncate">{{ content.title }}</h3>
      <p class="text-sm text-gray-500 mt-1">{{ formatDate(content.created_at) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Content } from '@/api/types'

const props = defineProps<{
  content: Content
}>()

defineEmits<{
  play: []
  delete: []
}>()

const contentType = computed(() => {
  if ('pages' in props.content) return 'picture_book'
  if ('lyrics' in props.content) return 'nursery_rhyme'
  return 'video'
})

const cover = computed(() => {
  return props.content.cover_url || props.content.cover_thumb_url
})

const typeIcon = computed(() => {
  const icons = { picture_book: '📖', nursery_rhyme: '🎵', video: '🎬' }
  return icons[contentType.value]
})

const typeLabel = computed(() => {
  const labels = { picture_book: '绘本', nursery_rhyme: '儿歌', video: '视频' }
  return labels[contentType.value]
})

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
</script>
```

**Step 2: 实现内容库页面**

修改 `web/src/views/Library.vue`:
```vue
<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">内容库</h1>
    </div>

    <!-- 筛选栏 -->
    <div class="flex flex-wrap gap-4">
      <div class="flex bg-gray-100 rounded-lg p-1">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="currentType = tab.value"
          class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
          :class="currentType === tab.value ? 'bg-white shadow text-primary-600' : 'text-gray-600'"
        >
          {{ tab.label }}
        </button>
      </div>

      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索标题..."
        class="input max-w-xs"
      />
    </div>

    <!-- 内容网格 -->
    <div v-if="loading" class="text-center py-12 text-gray-500">
      加载中...
    </div>

    <div v-else-if="filteredItems.length === 0" class="text-center py-12">
      <div class="text-6xl mb-4">📭</div>
      <p class="text-gray-500">还没有内容，去小程序创作吧</p>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <ContentCard
        v-for="item in filteredItems"
        :key="item.id"
        :content="item"
        @click="handlePlay(item)"
        @play="handlePlay(item)"
        @delete="handleDelete(item)"
      />
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore" class="text-center">
      <button @click="loadMore" class="btn btn-primary" :disabled="loadingMore">
        {{ loadingMore ? '加载中...' : '加载更多' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import ContentCard from '@/components/ContentCard.vue'
import { getContentList, deleteContent } from '@/api/content'
import type { Content } from '@/api/types'

const router = useRouter()

const tabs = [
  { value: '', label: '全部' },
  { value: 'picture_book', label: '绘本' },
  { value: 'nursery_rhyme', label: '儿歌' },
  { value: 'video', label: '视频' },
]

const currentType = ref<'' | 'picture_book' | 'nursery_rhyme' | 'video'>('')
const searchQuery = ref('')
const items = ref<Content[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const hasMore = ref(false)
const offset = ref(0)
const limit = 20

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value
  return items.value.filter(item =>
    item.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

async function fetchItems(reset = false) {
  if (reset) {
    offset.value = 0
    items.value = []
  }

  loading.value = reset
  loadingMore.value = !reset

  try {
    const res = await getContentList({
      type: currentType.value || undefined,
      limit,
      offset: offset.value,
    })
    items.value = reset ? res.items : [...items.value, ...res.items]
    hasMore.value = res.has_more
    offset.value += res.items.length
  } catch (e) {
    console.error('获取内容列表失败:', e)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function loadMore() {
  fetchItems(false)
}

function handlePlay(item: Content) {
  const type = 'pages' in item ? 'picture-book' : 'lyrics' in item ? 'nursery-rhyme' : 'video'
  router.push(`/play/${type}/${item.id}`)
}

async function handleDelete(item: Content) {
  if (!confirm(`确定删除「${item.title}」吗？`)) return

  try {
    await deleteContent(item.id)
    items.value = items.value.filter(i => i.id !== item.id)
  } catch (e) {
    alert('删除失败')
  }
}

watch(currentType, () => fetchItems(true))

onMounted(() => fetchItems(true))
</script>
```

**Step 3: Commit**

```bash
git add web/src/views/Library.vue web/src/components/ContentCard.vue
git commit -m "feat(web): 实现内容库页面"
```

---

## Task 11-15: 剩余页面（简要）

由于篇幅限制，以下任务简要描述：

### Task 11: 孩子管理页面
- `web/src/views/Children.vue` - 孩子列表
- `web/src/views/AddChild.vue` - 添加孩子表单
- `web/src/views/ChildDetail.vue` - 孩子详情编辑

### Task 12: 收藏页面
- `web/src/views/Favorites.vue` - 复用 ContentCard，调用收藏 API

### Task 13: 设置页面
- `web/src/views/Settings.vue` - 时间限制滑块、退出登录

### Task 14: 学习报告页面
- `web/src/views/Report.vue` - 集成 ECharts 图表

### Task 15: 播放器页面
- `web/src/views/Play.vue` - 根据 type 参数渲染不同播放器
- `web/src/components/PlayerPictureBook.vue` - 绘本翻页播放
- `web/src/components/PlayerNurseryRhyme.vue` - 音频播放 + 歌词
- `web/src/components/PlayerVideo.vue` - 视频播放

---

## Task 16: 构建与部署验证

**Step 1: 本地构建**

```bash
cd /Users/jack/coding/kids/web
npm run build
```

Expected: 生成 `dist/` 目录

**Step 2: 本地预览**

```bash
npm run preview
```

访问 http://localhost:4173/web/ 验证构建结果

**Step 3: 最终提交**

```bash
cd /Users/jack/coding/kids
git add web/
git commit -m "feat(web): 完成网页版家长管理端"
```

---

## 部署说明

将 `web/dist/` 目录内容上传到服务器 `/var/www/kids-web/`，配置 Nginx：

```nginx
location /web {
    alias /var/www/kids-web;
    try_files $uri $uri/ /web/index.html;
}
```

访问：`https://kids.jackverse.cn/web`
