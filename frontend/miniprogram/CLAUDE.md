# Moana 小程序开发指南

## 项目概述
这是一个微信小程序项目，基于 uni-app + Vue 3 + TypeScript 开发。

## 编译命令

### 重要规则
**每次修改代码后，必须同时编译 dev 和 build 两个目录：**

```bash
# 开发模式编译（用于开发调试）
npm run dev:mp-weixin

# 生产模式编译（用于真机测试和发布）
npm run build:mp-weixin
```

### 输出目录
- 开发模式: `dist/dev/mp-weixin`
- 生产模式: `dist/build/mp-weixin`

### 微信开发者工具
- 开发调试时导入 `dist/dev/mp-weixin`
- 真机测试或发布时导入 `dist/build/mp-weixin`

## 内容类型与路由

项目支持三种内容类型：
- `picture_book` - 绘本 → `/pages/play/picture-book`
- `nursery_rhyme` - 儿歌 → `/pages/play/nursery-rhyme`
- `video` - 视频 → `/pages/play/video`

路由时需要根据 `content_type` 字段跳转到对应的播放器页面。

## 页面间数据传递

生成内容后跳转到播放页的流程：
1. 将内容数据存储到临时存储 `uni.setStorageSync('temp_xxx', data)`
2. 跳转到播放页 `uni.redirectTo({ url: '/pages/play/xxx?fromGenerate=1' })`
3. 播放页从临时存储读取数据

## CSS 兼容性注意事项

微信小程序对部分 CSS 属性支持不完整：
- 避免使用 `inset: 0`，改用 `top: 0; left: 0; right: 0; bottom: 0;`
- `backdrop-filter: blur()` 在部分设备不支持，需要降级方案
- 布局容器添加 `flex-shrink: 0` 防止被压缩

## API 响应格式

### 儿歌 (NurseryRhyme)
```typescript
{
  id: string
  title: string
  cover_url: string
  audio_url: string
  duration: number
  lyrics: {
    full_text: string      // 完整歌词文本
    sections: Array<{      // 分段歌词
      content: string
    }>
  }
  // ...
}
```

注意：`lyrics` 字段是对象，不是字符串。

## 开发流程

1. 修改代码
2. 运行 `npm run dev:mp-weixin` 编译开发版
3. 运行 `npm run build:mp-weixin` 编译生产版
4. 在微信开发者工具中测试
5. 真机测试通过后提交 git

## 联调架构

### 环境说明
- **前端**: 本地 Mac 开发环境 (`/Users/jack/coding/kids/miniprogram`)
- **后端**: 云服务器 (`https://kids.jackverse.cn`)
- **后端代码不在本地**，遇到后端问题需要登录服务器排查

### API 基础信息
- Base URL: `https://kids.jackverse.cn/api/v1`
- 主要接口:
  - `POST /content/picture-book` - 生成绘本（同步模式，已废弃）
  - `POST /content/picture-book/async` - 生成绘本（**异步模式，推荐**）
  - `GET /content/picture-book/status/{task_id}` - 查询绘本生成状态
  - `POST /content/nursery-rhyme` - 生成儿歌（同步模式，已废弃）
  - `POST /content/nursery-rhyme/async` - 生成儿歌（**异步模式，推荐**）
  - `GET /content/nursery-rhyme/status/{task_id}` - 查询儿歌生成状态
  - `POST /content/video` - 生成视频（超时5分钟）
  - `GET /content/list` - 获取内容列表
  - `GET /content/{id}` - 获取内容详情
  - `GET /content/{id}/asset-details` - 获取素材参数详情（图片 prompt、模型等）
  - `GET /content/{id}/generation-logs` - 获取生成日志（用于故障排查）
  - `POST /callback/suno/video` - Suno 视频生成回调（内部使用）
  - `GET /callback/suno/video/status/{task_id}` - 查询 Suno 视频状态

### 后端问题排查指南

遇到后端错误（HTTP 500）时，请按以下步骤排查：

#### 1. 常见错误类型

| 错误关键词 | 可能原因 | 排查方向 |
|-----------|---------|---------|
| `AttributeError` | 对象属性缺失 | 检查 AI API 返回格式、配置项 |
| `RetryError` | 重试多次后失败 | 检查第三方 API 可用性 |
| `TimeoutError` | 请求超时 | 检查 AI 服务响应时间 |
| `KeyError` | 字典键不存在 | 检查配置文件、API 响应解析 |
| `ConnectionError` | 网络连接失败 | 检查服务器网络、API 密钥 |

#### 2. 服务器排查命令
```bash
# 查看应用日志
tail -200 /var/log/app/error.log

# Docker 容器日志
docker logs --tail 200 kids-backend

# 查看完整异常栈
journalctl -u kids-backend -n 200 --no-pager

# 检查服务状态
systemctl status kids-backend
```

#### 3. 绘本生成失败排查重点
- AI 文本生成 API（如 Claude/OpenAI）调用和响应解析
- 图片生成 API（如 DALL-E/Midjourney）调用和返回值处理
- 语音合成 API 调用
- 数据库写入操作

#### 4. 前端联调时注意
- 后端返回 500 错误时，直接给出排查建议，不要在本地查找后端代码
- 记录请求参数和响应内容，便于后端定位问题
- 检查请求超时设置是否合理（绘本/儿歌 3 分钟，视频 5 分钟）

## Suno 儿歌生成异步机制

### 异步流程（新版，推荐）
1. 前端发起 `POST /content/nursery-rhyme/async` 请求
2. 后端**立即返回** `{ task_id: "xxx", message: "任务已提交" }`
3. 前端轮询 `GET /content/nursery-rhyme/status/{task_id}` 获取进度
4. 完成后返回完整的 `result` 对象

### 为什么使用异步模式
- **避免 Cloudflare 524 超时**：Cloudflare 限制 100 秒，Suno 生成需要 2-3 分钟
- **更好的用户体验**：立即返回任务 ID，前端可以显示实时进度
- **更高的可靠性**：即使前端断开连接，后端也会继续处理

### 生成阶段
- `pending` / `waiting` - 任务已提交，等待处理
- `processing` - 正在处理中
- `text` - 歌词生成完成
- `first` - 第一首歌曲完成
- `completed` / `complete` - 全部完成
- `failed` / `error` - 生成失败

### 新版状态响应格式
```typescript
// POST /content/nursery-rhyme/async 响应
{
  task_id: string
  message: string
}

// GET /content/nursery-rhyme/status/{task_id} 响应
{
  task_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number      // 0-100
  stage: string         // 'text' | 'first' | 'complete' | 'error'
  message?: string
  content_id?: string   // 完成后返回
  result?: NurseryRhyme // 完成后返回完整结果
  error?: string
}
```

### 旧版回调机制（已废弃）
旧版使用 `POST /content/nursery-rhyme` + `GET /callback/suno/status/{task_id}`，
由于 Cloudflare 524 超时问题已弃用。代码中保留兼容，但新功能请使用异步 API。

### 注意事项
- 新版 API 在 `result` 字段返回完整的 NurseryRhyme 对象，包含歌词和音频
- 歌词可能包含 `timestamped` 字段，用于歌词同步高亮
- Suno 每次生成 2 首歌曲，前端默认使用第一首
- 歌曲时长约 68-100 秒，由 Suno 服务决定
- **video_url**：Suno 生成的音乐视频 URL，回调端点修复后应包含视频。若为空字符串 `""`，检查回调是否正常
- **状态轮询备用方案**：如果状态 API 返回 `completed` 但无 `result`，前端会调用 `GET /content/{id}` 获取详情

## 生成日志 API（故障排查）

当内容生成失败或需要排查问题时，可以使用生成日志 API 获取详细的生成过程记录。

### 获取生成日志

```bash
GET /content/{content_id}/generation-logs
```

### 响应格式

```typescript
interface GenerationLogsResponse {
  content_id: string
  content_type: 'picture_book' | 'nursery_rhyme' | 'video'
  title: string
  created_at: string
  total_duration_ms: number    // 总生成耗时
  status: 'completed' | 'failed'
  logs: GenerationLogEntry[]
  error?: string               // 失败时的错误信息
}

interface GenerationLogEntry {
  timestamp: string            // ISO 时间戳
  level: 'info' | 'warning' | 'error'
  stage: string                // 生成阶段: story, image, audio, video 等
  message: string              // 日志消息
  details?: Record<string, any> // 详细信息（如模型参数、prompt 等）
  duration_ms?: number         // 该步骤耗时
}
```

### 使用场景

1. **生成失败排查**
   - 查看 `status: 'failed'` 的日志，定位失败阶段
   - 检查 `error` 字段获取错误原因

2. **性能分析**
   - 查看各阶段 `duration_ms` 分析耗时
   - 识别性能瓶颈（如图片生成、语音合成）

3. **前端调用示例**
   ```typescript
   import { getGenerationLogs } from '@/api/content'

   const logs = await getGenerationLogs(contentId)
   console.log('生成状态:', logs.status)
   console.log('总耗时:', logs.total_duration_ms, 'ms')
   logs.logs.forEach(log => {
     console.log(`[${log.stage}] ${log.message}`)
   })
   ```

### 素材参数 API

查看内容的素材详情（图片 prompt、模型参数等）：

```bash
GET /content/{content_id}/asset-details
```

### 响应格式

```typescript
interface AssetDetailsResponse {
  content_id: string
  content_type?: 'picture_book' | 'nursery_rhyme' | 'video'
  generated_by?: {
    story_model?: string      // 如 gemini-3-pro-preview
    image_model?: string      // 如 gemini-3-pro-image-preview
    tts_model?: string        // 如 gemini-tts
  }
  assets: AssetDetail[]       // 扁平数组，包含所有素材
  total_count: number
}

interface AssetDetail {
  type: 'image' | 'audio' | 'video'
  page_num: number            // 页码
  url: string
  // 图片字段
  prompt?: string             // 图片生成 prompt
  model?: string              // 使用的模型
  style?: string              // 艺术风格
  width?: number | null       // 图片宽度
  height?: number | null      // 图片高度
  // 音频字段
  text?: string               // 音频对应的文本
  voice_id?: string           // TTS 音色 ID
  duration?: number           // 音频/视频时长(秒)
}
```

### 前端入口

在内容库页面，长按内容卡片可以选择「查看素材参数」，查看该内容的生成参数详情

### 注意事项

- 生成日志 API 目前返回空数组，后端日志记录功能待完善
- 素材参数 API 的 `model` 字段可能为 `"unknown"`，前端已做过滤处理
