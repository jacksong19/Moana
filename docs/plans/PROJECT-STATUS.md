# Moana 项目开发状态

> 最后更新：2025-12-15

## 项目概述

Moana 是一款 AI 原生的早教内容生成平台微信小程序，为 1-6 岁儿童家长提供个性化绘本、儿歌和视频内容。

---

## 当前开发阶段

**P1-P4 功能开发中** - 绘本、儿歌、视频三大核心功能均已上线，正在优化加载体验和回调机制。

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
- [x] 认证 API (`api/auth.ts`) - 含模拟登录
- [x] 内容生成 API (`api/content.ts`) - 含删除接口
- [x] 播放记录 API (`api/play.ts`)
- [x] 收藏 API (`api/favorite.ts`) - 添加/取消/列表

#### 状态管理 ✅
- [x] 用户状态 (`stores/user.ts`) - 含模拟登录回退
- [x] 孩子信息 + 时间设置 (`stores/child.ts`)
- [x] 内容状态 (`stores/content.ts`) - 含删除方法
- [x] 收藏状态 (`stores/favorite.ts`) - 收藏管理

#### 公共组件 ✅
- [x] NavBar 自定义导航栏
- [x] ContentCard 内容卡片（支持长按删除）
- [x] GeneratingProgress 生成进度动画
- [x] LoadingState 加载状态
- [x] EmptyState 空状态
- [x] ErrorState 错误状态
- [x] FavoriteButton 收藏按钮（心跳动画）

#### 页面开发 ✅ (16个页面)
| 页面 | 路径 | 状态 |
|------|------|------|
| 首页 | `pages/index/index.vue` | ✅ 完成（含视频推荐）|
| 创作中心 | `pages/create/index.vue` | ✅ 完成（视频已上线）|
| 绘本创作 | `pages/create/picture-book.vue` | ✅ 完成 |
| 儿歌创作 | `pages/create/nursery-rhyme.vue` | ✅ 完成（Suno 回调）|
| 视频创作 | `pages/create/video.vue` | ✅ 完成 |
| 内容库 | `pages/library/index.vue` | ✅ 完成（含删除功能）|
| 收藏列表 | `pages/favorites/index.vue` | ✅ 完成 |
| 绘本播放器 | `pages/play/picture-book.vue` | ✅ 完成（含预加载）|
| 儿歌播放器 | `pages/play/nursery-rhyme.vue` | ✅ 完成（含缓冲状态）|
| 视频播放器 | `pages/play/video.vue` | ✅ 完成 |
| 儿童模式 | `pages/child/index.vue` | ✅ 完成 |
| 设置 | `pages/settings/index.vue` | ✅ 完成 |
| 我的 | `pages/profile/index.vue` | ✅ 完成 |
| 添加宝贝 | `pages/profile/add-child.vue` | ✅ 完成 |
| 学习报告 | `pages/report/index.vue` | ✅ 完成 |
| 意见反馈 | `pages/feedback/index.vue` | ✅ 完成 |

### 后端对接 ✅

- [x] 后端 API 地址配置 (`https://kids.jackverse.cn/api/v1`)
- [x] 微信登录对接
- [x] 绘本生成接口对接（3分钟超时）
- [x] 儿歌生成接口对接（Suno 回调机制）
- [x] 视频生成接口对接（5分钟超时）
- [x] Suno 任务状态轮询接口
- [x] 内容列表接口对接
- [x] 内容详情接口对接
- [x] 内容删除接口对接
- [x] 媒体资源代理存储（解决第三方 URL 权限问题）

---

## 已修复问题

### 2025-12-15
1. **绘本图片显示** - aspectFit 完整显示，添加预加载和 loading 动画
2. **儿歌加载体验** - 封面预加载 + 音频缓冲状态指示
3. **Suno 回调适配** - 支持 text/first/complete 三阶段进度
4. **CSS 兼容性** - 替换 inset 为 top/left/right/bottom
5. **歌词类型修复** - lyrics 字段支持 string | object 格式
6. **视频功能上线** - 移除"即将上线"标签，添加首页推荐

### 2025-12-11
1. **真机音频播放** - 使用 `uni.setInnerAudioOption()` 替代属性设置
2. **音频 URL 处理** - HTTP→HTTPS 自动转换 + URL 编码
3. **音频实例管理** - 每次播放前销毁旧实例，避免状态污染
4. **媒体资源访问** - 后端实现代理存储，避免第三方 OSS URL 过期问题
5. **内容删除功能** - 长按卡片显示删除选项，支持确认弹窗
6. **页面右侧截断** - 使用固定宽度 750rpx 替代 100%/100vw，符合小程序设计规范
7. **全部页面布局修复** - 14 个页面全部按规范修复
8. **开发环境登录** - 后端不可用时自动回退到模拟登录
9. **播放进度保存** - 5秒防抖 + localStorage 本地缓存，支持断点续播

---

## 待修复问题

### 后端待处理
1. **儿歌歌词显示** - 当前显示的是提示词而非 Suno 生成的歌词，后端需从 tracks[0].lyrics 或 Suno 回调中提取真实歌词
2. **Suno 进度回调** - 进度值始终为 0，需要后端在状态轮询接口返回真实进度

---

## 已完成开发规划

### Phase 1: 核心功能完善 ✅
| 优先级 | 功能 | 状态 |
|--------|------|------|
| P1 | 用户体验优化 | ✅ LoadingState/EmptyState/ErrorState 组件 |
| P1 | 播放体验优化 | ✅ 5秒防抖进度保存 + localStorage 缓存 |
| P1 | 开发环境支持 | ✅ 模拟登录功能 |

### Phase 2: 功能扩展 ✅
| 优先级 | 功能 | 状态 |
|--------|------|------|
| P2 | 儿歌创作页面 | ✅ 占位页面（功能开发中提示）|
| P2 | 视频创作页面 | ✅ 占位页面（功能开发中提示）|
| P2 | 收藏功能 | ✅ API + Store + 组件 + 列表页 |

### Phase 3: 高级功能 ✅
| 优先级 | 功能 | 状态 |
|--------|------|------|
| P3 | 学习报告 | ✅ 数据展示 + 日历视图 + 主题统计 |
| P3 | 意见反馈 | ✅ 反馈表单 + FAQ 折叠面板 |
| P3 | 分享功能 | ✅ 微信好友 + 朋友圈分享 |

---

## 下一步开发规划

### Phase 4: 产品打磨
| 优先级 | 功能 | 说明 |
|--------|------|------|
| P4 | TabBar 图标替换 | 正式设计图标 |
| P4 | 儿歌/视频生成 | 实现实际生成功能 |
| P4 | 用户反馈提交 | 对接后端反馈接口 |
| P4 | 学习数据统计 | 完善统计数据展示 |

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
| `8a8ec91` | 2025-12-15 | feat(miniprogram): 优化内容加载体验与儿歌生成流程 |
| `de362a0` | 2025-12-14 | feat(miniprogram): 添加视频创作功能并重设计今日页面 |
| `ee830ce` | 2025-12-13 | feat(GeneratingProgress): 支持绘本和儿歌两种类型 |
| `f51a70c` | 2025-12-12 | feat(nursery-rhyme): 实现完整的儿歌创作与播放功能 |
| `e7c4231` | 2025-12-11 | feat(miniprogram): 添加绘本分享功能 |
| `039780d` | 2025-12-11 | feat(feedback): 添加意见反馈页面 |
| `dd28534` | 2025-12-11 | feat(report): 添加学习报告页面 |
| `e9d63ef` | 2025-12-11 | feat(create): 添加儿歌和视频创作页面 |
| `6331486` | 2025-12-11 | feat(favorites): 添加收藏列表页面 |
| `7a87c6a` | 2025-12-11 | feat(components): 添加 FavoriteButton 组件 |
| `2eac132` | 2025-12-11 | feat(stores): 添加收藏状态管理 Store |
| `080c81f` | 2025-12-11 | feat(api): 添加收藏功能 API |
| `6f2d116` | 2025-12-11 | feat(play): 优化播放进度保存 |
| `96ca59a` | 2025-12-11 | feat(components): 添加 ErrorState 组件 |
| `5aaf282` | 2025-12-11 | feat(components): 添加 EmptyState 组件 |
| `d1e9542` | 2025-12-11 | feat(components): 添加 LoadingState 组件 |
| `b8ab366` | 2025-12-11 | feat(auth): 添加开发环境模拟登录 |
| `7690cd3` | 2025-12-11 | fix(miniprogram): 修复所有页面右侧截断问题 |
| `3b9d51c` | 2025-12-10 | feat(miniprogram): 修复音频播放与添加删除功能 |
