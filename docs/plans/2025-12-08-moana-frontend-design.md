# Moana 前端设计文档

> AI 原生早教内容生成系统 - 微信小程序 MVP 设计方案
>
> 创建日期：2025-12-08

---

## 1. 技术选型

| 类别 | 选择 | 说明 |
|------|------|------|
| 框架 | uni-app + Vue 3 + Vite | 跨端兼容、国内生态成熟 |
| UI 库 | Wot Design Uni + 自定义 | 基础组件 + 核心播放组件自定义 |
| 状态管理 | Pinia | Vue 3 官方推荐 |
| 请求封装 | 自定义 (基于 uni.request) | Token 自动刷新 |

---

## 2. MVP 页面清单

共 8 个页面，聚焦核心闭环：**绘本生成 → 播放 → 时间管理**

| 页面 | 路径 | 功能 | TabBar |
|------|------|------|--------|
| 首页 | `/pages/index/index` | 推荐内容 + 快速入口 | ✓ |
| 创作中心 | `/pages/create/index` | 选择创作类型 | ✓ |
| 绘本创作 | `/pages/create/picture-book` | 主题选择 + 生成 | |
| 内容库 | `/pages/library/index` | 已生成内容列表 | ✓ |
| 绘本播放 | `/pages/play/picture-book` | 翻页播放 + 互动 | |
| 儿童模式 | `/pages/child/index` | 沉浸式儿童界面 | |
| 设置 | `/pages/settings/index` | 时间限制等设置 | |
| 我的 | `/pages/profile/index` | 用户信息 + 孩子管理 | ✓ |

### TabBar 结构

底部 4 个 Tab：**首页** | **创作** | **内容库** | **我的**

---

## 3. 目录结构

```
miniprogram/
├── src/
│   ├── pages/                    # 页面
│   │   ├── index/                # 首页
│   │   ├── create/               # 创作中心
│   │   │   ├── index.vue         # 创作类型选择
│   │   │   └── picture-book.vue  # 绘本创作
│   │   ├── library/              # 内容库
│   │   ├── play/                 # 播放页
│   │   │   └── picture-book.vue  # 绘本播放器
│   │   ├── child/                # 儿童模式
│   │   ├── settings/             # 设置
│   │   └── profile/              # 我的
│   │
│   ├── components/               # 组件
│   │   ├── ContentCard/          # 内容卡片
│   │   ├── ThemeSelector/        # 主题选择器
│   │   ├── PictureBookPlayer/    # 绘本播放器核心
│   │   ├── TimeWarning/          # 时间提醒弹窗
│   │   └── ChildModeGuard/       # 儿童模式守卫
│   │
│   ├── api/                      # 接口封装
│   │   ├── request.js            # 请求基类
│   │   ├── auth.js               # 认证接口
│   │   ├── content.js            # 内容生成
│   │   └── play.js               # 播放追踪
│   │
│   ├── stores/                   # Pinia 状态
│   │   ├── user.js               # 用户状态
│   │   ├── child.js              # 孩子状态
│   │   └── content.js            # 内容状态
│   │
│   ├── utils/                    # 工具函数
│   │   ├── time-limit.js         # 时间管理
│   │   └── storage.js            # 本地存储
│   │
│   └── styles/                   # 全局样式
│       ├── variables.scss        # 颜色/字体变量
│       └── common.scss           # 公共样式
│
├── static/                       # 静态资源
│   ├── images/                   # 图片
│   └── icons/                    # 图标
│
└── pages.json                    # 页面配置
```

---

## 4. 核心自定义组件

### 4.1 PictureBookPlayer 绘本播放器

最核心的组件，负责绘本翻页、音频同步、互动响应。

**功能点：**
- 左右滑动翻页 (swiper)
- 每页自动播放音频
- 互动热区点击响应
- 播放进度实时上报
- 时间限制检测集成

**接口：**
```typescript
Props: {
  contentId: string
  childId: string
  pages: PageItem[]
}

Events: {
  @complete: () => void
  @timeout: (type: 'session' | 'daily') => void
  @interaction: (data: InteractionData) => void
}
```

### 4.2 ThemeSelector 主题选择器

分类展示主题，支持搜索和筛选。

**功能点：**
- 分类 Tab (习惯养成/认知世界/情感社交)
- 主题卡片网格展示
- 年龄适配标签显示
- 选中状态高亮

### 4.3 TimeWarning 时间提醒弹窗

温和的休息提醒，带可爱动画。

**类型：**
| 类型 | 触发条件 | 行为 |
|------|---------|------|
| 休息提醒 | 每 10 分钟 | 可跳过继续 |
| 单次超时 | 20 分钟 | 强制休息 |
| 每日超时 | 60 分钟/日 | 结束播放 |

### 4.4 ChildModeGuard 儿童模式守卫

防止儿童误退出。

**退出方式：** 长按 3 秒 → 简单数学题 (如 2+3=?)

---

## 5. 状态管理设计

### 5.1 user.js - 用户状态

```javascript
state: {
  user: null,           // 用户信息
  isLoggedIn: false,    // 登录状态
  token: null           // access_token
}

actions: {
  login()               // 微信登录
  fetchUser()           // 获取用户信息
  logout()              // 退出登录
}
```

### 5.2 child.js - 孩子状态

```javascript
state: {
  currentChild: null,   // 当前选中的孩子
  settings: {           // 时间限制设置
    daily_limit_minutes: 60,
    session_limit_minutes: 20,
    rest_reminder_enabled: true
  },
  todayDuration: 0      // 今日已观看时长
}

actions: {
  setCurrentChild()     // 设置当前孩子
  fetchSettings()       // 获取设置
  updateSettings()      // 更新设置
}
```

### 5.3 content.js - 内容状态

```javascript
state: {
  themes: {},           // 主题列表缓存
  generatedList: [],    // 已生成内容列表
  currentContent: null  // 当前播放内容
}

actions: {
  fetchThemes()         // 获取主题列表
  generatePictureBook() // 生成绘本
  fetchGeneratedList()  // 获取已生成列表
}
```

### 5.4 数据流

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  创作页面   │ ──→ │  API 调用   │ ──→ │  后端生成   │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
┌─────────────┐     ┌─────────────┐          ↓
│  播放页面   │ ←── │ content.js  │ ←── 返回生成结果
└─────────────┘     └─────────────┘
      │
      ↓ 播放进度/互动
┌─────────────┐
│  play API   │ ──→ 上报后端
└─────────────┘
```

---

## 6. 关键用户流程

### 6.1 首次使用

```
启动 App
    ↓
微信静默登录 (wx.login)
    ↓
检测是否有孩子信息？
    ├─ 否 → 引导添加孩子 (姓名/年龄/喜好)
    └─ 是 → 进入首页
```

### 6.2 创作绘本

```
首页点击「创作绘本」
    ↓
选择主题分类 (习惯养成/认知世界/...)
    ↓
选择具体主题 (刷牙/吃蔬菜/...)
    ↓
确认孩子信息 + 可选角色
    ↓
点击「开始生成」
    ↓
显示生成进度 (故事编写 → 图片生成 → 音频合成)
    ↓
生成完成 → 自动跳转播放页
```

### 6.3 进入儿童模式

```
家长在内容库选择内容
    ↓
点击「儿童模式播放」
    ↓
进入全屏儿童模式页面
    ↓
播放内容 (大按钮交互)
    ↓
时间到 → 显示休息动画
    ↓
退出需：长按3秒 + 答题
```

### 6.4 时间管理

```
播放中每 30 秒检测
    ↓
├─ 满 10 分钟 → 眨眼休息提醒 (可跳过)
├─ 满 20 分钟 → 强制休息 1 分钟
└─ 满 60 分钟/日 → 今日结束，明天再来
```

---

## 7. 视觉设计规范

### 7.1 色彩系统

```scss
// 主色调 - 温暖柔和
$primary: #FF6B6B;        // 珊瑚红 - 按钮/强调
$secondary: #4ECDC4;      // 青绿色 - 辅助/图标
$accent: #FFE66D;         // 明黄色 - 高亮/徽章

// 背景
$bg-base: #FFF9F0;        // 奶油白 - 页面背景
$bg-card: #FFFFFF;        // 纯白 - 卡片背景

// 文字
$text-primary: #2D3436;   // 主文字
$text-secondary: #636E72; // 次要文字
$text-light: #B2BEC3;     // 占位文字

// 功能色
$success: #00B894;        // 成功
$warning: #FDCB6E;        // 警告
$error: #E17055;          // 错误
```

### 7.2 字体规范

```scss
// 儿童友好字体大小
$font-title: 40rpx;       // 页面标题
$font-subtitle: 32rpx;    // 卡片标题
$font-body: 28rpx;        // 正文
$font-caption: 24rpx;     // 说明文字

// 儿童模式额外放大 20%
$child-font-scale: 1.2;
```

### 7.3 圆角与间距

```scss
$radius-sm: 12rpx;        // 小按钮
$radius-md: 24rpx;        // 卡片
$radius-lg: 36rpx;        // 大按钮/弹窗
$radius-full: 999rpx;     // 圆形

$spacing-xs: 12rpx;
$spacing-sm: 24rpx;
$spacing-md: 32rpx;
$spacing-lg: 48rpx;
```

### 7.4 儿童模式特殊样式

- 按钮最小高度：**120rpx**
- 触摸热区最小：**88rpx × 88rpx**
- 图标尺寸：**64rpx**
- 字体放大：**1.2 倍**

---

## 8. API 接口清单 (MVP)

基于后端文档，MVP 需要对接的接口：

| 模块 | 接口 | 方法 | 说明 |
|------|------|------|------|
| 认证 | `/auth/wechat/login` | POST | 微信登录 |
| 认证 | `/auth/refresh` | POST | 刷新 Token |
| 认证 | `/auth/me` | GET | 获取当前用户 |
| 内容 | `/content/themes` | GET | 获取主题列表 |
| 内容 | `/content/picture-book` | POST | 生成绘本 |
| 播放 | `/play/start` | POST | 开始播放 |
| 播放 | `/play/{id}/progress` | PUT | 更新进度 |
| 播放 | `/play/{id}/complete` | POST | 完成播放 |
| 播放 | `/play/{id}/interaction` | POST | 提交互动 |
| 孩子 | `/child/{id}/settings` | GET | 获取设置 |
| 孩子 | `/child/{id}/settings` | PUT | 更新设置 |

---

## 9. 开发计划

### Phase 1: 基础框架 (Day 1-2)
- [ ] uni-app 项目初始化
- [ ] Wot Design Uni 集成
- [ ] 请求封装与 Token 管理
- [ ] Pinia 状态管理配置
- [ ] 全局样式变量

### Phase 2: 认证与用户 (Day 3)
- [ ] 微信登录流程
- [ ] 用户信息展示
- [ ] 添加孩子引导页

### Phase 3: 内容生成 (Day 4-5)
- [ ] 创作中心页面
- [ ] 主题选择器组件
- [ ] 绘本生成流程
- [ ] 生成进度展示

### Phase 4: 播放功能 (Day 6-7)
- [ ] 绘本播放器组件
- [ ] 播放进度保存
- [ ] 互动响应

### Phase 5: 时间管理与儿童模式 (Day 8)
- [ ] 时间限制逻辑
- [ ] 休息提醒弹窗
- [ ] 儿童模式页面
- [ ] 防退出守卫

### Phase 6: 收尾 (Day 9-10)
- [ ] 内容库页面
- [ ] 设置页面
- [ ] 我的页面
- [ ] 整体测试与优化

---

## 附录：设计决策记录

| 日期 | 决策 | 原因 |
|------|------|------|
| 2025-12-08 | 选择 uni-app + Vue 3 | 国内生态成熟、文档丰富 |
| 2025-12-08 | 选择 Wot Design Uni | 设计感强、Vue 3 原生支持 |
| 2025-12-08 | MVP 聚焦绘本功能 | 先验证核心价值再迭代 |
| 2025-12-08 | 独立儿童模式页面 | 便于防误触、时间管理集中 |
| 2025-12-08 | 温暖柔和视觉风格 | 儿童友好、与品牌调性一致 |
