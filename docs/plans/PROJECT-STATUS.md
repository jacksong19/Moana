# Moana 项目开发状态

> 最后更新：2025-12-10

## 项目概述

Moana 是一款 AI 原生的早教内容生成平台微信小程序，为 1-6 岁儿童家长提供个性化绘本、儿歌和视频内容。

---

## 当前开发阶段

**MVP 阶段已完成** - 前后端联调基本打通，绘本生成和播放功能可用。

---

## 已完成模块

### 前端 (miniprogram/)

#### 基础架构 ✅
- [x] uni-app + Vue 3 + Vite 项目初始化
- [x] Pinia 状态管理配置
- [x] SCSS 设计系统变量 (`styles/variables.scss`)
- [x] 通用样式 (`styles/common.scss`)
- [x] TypeScript 配置

#### API 层 ✅
- [x] 请求封装 + Token 自动刷新队列 (`api/request.ts`)
- [x] 认证 API (`api/auth.ts`)
- [x] 内容生成 API (`api/content.ts`) - 含删除接口
- [x] 播放记录 API (`api/play.ts`)

#### 状态管理 ✅
- [x] 用户状态 (`stores/user.ts`)
- [x] 孩子信息 + 时间设置 (`stores/child.ts`)
- [x] 内容状态 (`stores/content.ts`) - 含删除方法

#### 公共组件 ✅
- [x] NavBar 自定义导航栏
- [x] ContentCard 内容卡片（支持长按删除）
- [x] GeneratingProgress 生成进度动画

#### 页面开发 ✅ (9个页面)
| 页面 | 路径 | 状态 |
|------|------|------|
| 首页 | `pages/index/index.vue` | ✅ 完成 |
| 创作中心 | `pages/create/index.vue` | ✅ 完成 |
| 绘本创作 | `pages/create/picture-book.vue` | ✅ 完成 |
| 内容库 | `pages/library/index.vue` | ✅ 完成（含删除功能）|
| 绘本播放器 | `pages/play/picture-book.vue` | ✅ 完成（真机音频已修复）|
| 儿童模式 | `pages/child/index.vue` | ✅ 完成 |
| 设置 | `pages/settings/index.vue` | ✅ 完成 |
| 我的 | `pages/profile/index.vue` | ✅ 完成 |
| 添加宝贝 | `pages/profile/add-child.vue` | ✅ 完成 |

### 后端对接 ✅

- [x] 后端 API 地址配置 (`https://kids.jackverse.cn/api/v1`)
- [x] 微信登录对接
- [x] 绘本生成接口对接（3分钟超时）
- [x] 内容列表接口对接
- [x] 内容详情接口对接
- [x] 内容删除接口对接
- [x] 媒体资源代理存储（解决第三方 URL 权限问题）

---

## 已修复问题 (2025-12-10)

1. **真机音频播放** - 使用 `uni.setInnerAudioOption()` 替代属性设置
2. **音频 URL 处理** - HTTP→HTTPS 自动转换 + URL 编码
3. **音频实例管理** - 每次播放前销毁旧实例，避免状态污染
4. **媒体资源访问** - 后端实现代理存储，避免第三方 OSS URL 过期问题
5. **内容删除功能** - 长按卡片显示删除选项，支持确认弹窗

---

## 待修复问题

### 后端 (高优先级)
- [ ] **`/content/themes` 接口 404**
  - 原因：路由顺序问题，`themes` 被当作 `content_id` 参数处理
  - 解决：将 `/content/themes` 路由定义在 `/content/{content_id}` 之前

---

## 下一步开发规划

### Phase 1: 核心功能完善
| 优先级 | 功能 | 说明 |
|--------|------|------|
| P0 | 修复主题接口 | 后端修复 `/content/themes` 路由 |
| P1 | 用户体验优化 | 加载状态、错误提示、空状态设计 |
| P1 | 播放体验优化 | 播放进度保存、续播功能 |

### Phase 2: 功能扩展
| 优先级 | 功能 | 说明 |
|--------|------|------|
| P2 | 儿歌创作页面 | `pages/create/nursery-rhyme.vue` |
| P2 | 视频创作页面 | `pages/create/video.vue` |
| P2 | 收藏功能 | 收藏/取消收藏、收藏列表 |
| P2 | TabBar 图标替换 | 正式设计图标 |

### Phase 3: 高级功能
| 优先级 | 功能 | 说明 |
|--------|------|------|
| P3 | 学习报告 | 播放统计、学习时长分析 |
| P3 | 意见反馈 | 用户反馈入口 |
| P3 | 分享功能 | 分享绘本到朋友圈/好友 |

---

## 运行项目

```bash
cd miniprogram
npm install
npm run dev:mp-weixin
```

在微信开发者工具中导入 `dist/dev/mp-weixin` 目录。

---

## Git 提交记录

| Commit | 日期 | 描述 |
|--------|------|------|
| `3b9d51c` | 2025-12-10 | feat(miniprogram): 修复音频播放与添加删除功能 |
| `8829dbd` | 2025-12-09 | docs: 添加项目开发状态文档 |
| `4f277eb` | 2025-12-08 | feat(miniprogram): 完成 Moana 微信小程序前端 MVP 开发 |
| `cee6ff1` | 2025-12-08 | docs: 添加 Moana 前端 MVP 设计文档 |
| `d0cb8fd` | 2025-12-05 | docs: 添加 Moana 项目设计文档 |
