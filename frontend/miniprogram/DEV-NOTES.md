# 小程序开发注意事项

## 已知问题与解决方案

### 1. 页面右侧截断问题

**问题描述**：页面内容右侧被截断，部分 UI 元素（如卡片、按钮）超出可视区域。

**根本原因**：在微信小程序中，使用 `width: 100%` 或 `width: 100vw` 可能导致实际宽度超出屏幕可视区域，原因包括：
- 滚动条占用空间
- 系统边距
- rpx 到 px 转换的精度问题

**正确做法**：
```scss
// 使用 750rpx 固定宽度（微信小程序设计规范）
.page-container {
  width: 750rpx;
  box-sizing: border-box;
  overflow-x: hidden;  // 只禁止水平溢出，允许垂直滚动！
}

// 对于有 padding 的容器，必须加 box-sizing
.content-area {
  width: 750rpx;
  padding: 32rpx;
  box-sizing: border-box;  // 确保 padding 不会撑大宽度
}
```

**错误做法**：
```scss
// 不要使用这些
.page-container {
  width: 100%;       // 可能溢出
  width: 100vw;      // 可能溢出
  overflow: hidden;  // 会阻止页面垂直滚动！
}
```

### 2. 页面无法滚动问题

**问题描述**：页面内容超出屏幕高度，但无法上下滚动。

**根本原因**：
- `page` 元素（小程序根元素）设置了 `overflow: hidden`
- 或者 `.page-container` 设置了 `overflow: hidden`

**正确做法**：
```scss
// page 元素不要设置 overflow
page {
  background-color: #FFF9F0;
  // 不要设置 overflow: hidden！
}

// .page-container 使用 overflow-x: hidden 只禁止水平溢出
.page-container {
  width: 750rpx;
  overflow-x: hidden;  // 只禁止水平溢出
}
```

**关键文件**：
- `src/styles/common.scss` - 全局 `.page-container` 样式定义
- 所有页面的 `.vue` 文件中的 scoped 样式

**排查步骤**：
1. 检查 `common.scss` 中的全局样式是否使用了 `750rpx`
2. 检查页面组件的 scoped 样式
3. 检查编译后的 `.wxss` 文件确认样式生效
4. 在微信开发者工具中刷新/重新编译

### 3. 固定定位元素宽度问题

**问题描述**：使用 `position: fixed` 的导航栏或底部栏右侧被截断。

**根本原因**：`left: 0; right: 0;` 组合可能导致宽度计算不准确。

**正确做法**：
```scss
// 固定定位元素统一使用 width: 750rpx
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 750rpx;  // 不要用 right: 0
  box-sizing: border-box;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 750rpx;  // 不要用 right: 0
  box-sizing: border-box;
}
```

---

## 开发规范

### 布局宽度规范

| 元素类型 | 推荐宽度 | 说明 |
|---------|---------|------|
| 页面容器 | `750rpx` | 固定宽度，符合设计规范 |
| 导航栏 | `750rpx` | 固定定位时必须指定 |
| 底部栏 | `750rpx` | 固定定位时必须指定 |
| 滚动区域 | `750rpx` + `box-sizing: border-box` | 有 padding 时必须加 |
| 网格/列表 | `100%` | 在父容器已限制宽度的情况下可用 |

### 页面样式模板

新建页面时，请使用以下模板：

```scss
.page-container {
  min-height: 100vh;
  background: $bg-base;  // 或 $gradient-warm
  width: 750rpx;
  box-sizing: border-box;
  overflow-x: hidden;  // 关键：只禁止水平溢出
}

// 固定定位的导航栏
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: $z-sticky;
  width: 750rpx;
  box-sizing: border-box;
}

// 固定定位的底部栏
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 750rpx;
  box-sizing: border-box;
}

// 主滚动区域
.main-scroll {
  width: 750rpx;
  padding: $spacing-md;
  box-sizing: border-box;
}
```

### 已修复页面清单

以下页面已按规范修复，可作为参考：

- ✅ `src/pages/index/index.vue` - 首页
- ✅ `src/pages/library/index.vue` - 内容库
- ✅ `src/pages/profile/index.vue` - 个人中心
- ✅ `src/pages/profile/add-child.vue` - 添加宝贝
- ✅ `src/pages/settings/index.vue` - 时间设置
- ✅ `src/pages/create/index.vue` - 创作中心
- ✅ `src/pages/create/picture-book.vue` - 创作绘本
- ✅ `src/pages/child/index.vue` - 儿童模式（全屏模式，使用 `inset: 0`）
- ✅ `src/pages/play/picture-book.vue` - 绘本播放（全屏模式，使用 `inset: 0`）

### 样式修改检查清单

修改样式后，请确认：

- [ ] 修改了源文件（`src/` 目录下）
- [ ] 编译命令已执行（`npm run dev:mp-weixin`）
- [ ] 编译后的 `dist/dev/mp-weixin/` 文件已更新
- [ ] 微信开发者工具已刷新/重新编译

---

## 常见命令

```bash
# 开发模式（监听文件变化自动编译）
npm run dev:mp-weixin

# 生产构建
npm run build:mp-weixin

# 检查编译后的样式
grep "关键选择器" dist/dev/mp-weixin/pages/xxx/index.wxss
```

---

*最后更新：2025-12-11*
