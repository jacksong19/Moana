# 智能创作功能 - 后端 API 文档

## 概述

智能创作功能允许用户输入自定义描述，由 AI 自动生成绘本、儿歌或视频内容。本文档描述前端期望的后端 API 变更。

---

## 一、扩展现有 API

### 1.1 绘本生成 API

**端点**: `POST /api/v1/content/picture-book/async`

**新增参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `creation_mode` | string | 否 | `"smart"` 或 `"preset"`，默认 `"preset"` |
| `custom_prompt` | string | 条件 | 用户自定义描述，`creation_mode="smart"` 时必填，最大 500 字 |

**请求示例**:

```json
{
  "child_name": "小明",
  "age_months": 36,
  "creation_mode": "smart",
  "custom_prompt": "宝宝最近不爱吃蔬菜，总是把胡萝卜和西兰花挑出来，帮我做一个关于吃蔬菜的故事",
  "art_style": "storybook",
  "protagonist": { "animal": "bunny" },
  "voice_id": "Kore"
}
```

**后端处理逻辑**:

```python
if creation_mode == "smart":
    # 1. 使用 AI 分析 custom_prompt，推断主题分类和教育目标
    # 2. 基于 custom_prompt 直接生成故事内容
    # 3. 其他流程与 preset 模式相同
else:
    # 原有逻辑：使用 theme_topic 从预定义模板生成
```

---

### 1.2 儿歌生成 API

**端点**: `POST /api/v1/content/nursery-rhyme/async`

**新增参数**: 同绘本 API

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `creation_mode` | string | 否 | `"smart"` 或 `"preset"`，默认 `"preset"` |
| `custom_prompt` | string | 条件 | 用户自定义描述，`creation_mode="smart"` 时必填 |

**请求示例**:

```json
{
  "child_name": "小明",
  "age_months": 36,
  "creation_mode": "smart",
  "custom_prompt": "教宝宝认识农场里的小动物",
  "music_mood": "cheerful",
  "protagonist": { "animal": "bunny" }
}
```

---

## 二、新增 API

### 2.1 首帧生成 API

**端点**: `POST /api/v1/content/video/first-frame`

**用途**: 为视频独立创作生成首帧预览图

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 | 场景描述，最大 500 字 |
| `child_name` | string | 是 | 宝贝名称 |
| `art_style` | string | 否 | 艺术风格，默认 `"storybook"` |
| `aspect_ratio` | string | 否 | 画面比例，默认 `"16:9"` |

**请求示例**:

```json
{
  "prompt": "一只可爱的小兔子在花园里开心地吃蔬菜",
  "child_name": "小明",
  "art_style": "storybook",
  "aspect_ratio": "16:9"
}
```

**响应**:

```json
{
  "image_url": "https://cdn.example.com/first-frame/abc123.png",
  "prompt_enhanced": "A cute cartoon bunny happily eating vegetables in a colorful garden, storybook illustration style, warm lighting, child-friendly"
}
```

**实现要点**:
- 使用 Imagen/DALL-E 生成首帧图片
- 自动增强 prompt 添加风格描述
- 图片需持久化存储到 CDN

---

### 2.2 独立视频创作 API

**端点**: `POST /api/v1/content/video/standalone/async`

**用途**: 不依赖绘本，直接根据用户描述生成视频

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `child_name` | string | 是 | 宝贝名称 |
| `age_months` | number | 是 | 年龄（月） |
| `custom_prompt` | string | 是 | 视频场景描述 |
| `first_frame_url` | string | 条件 | 已有首帧 URL（与 generate_first_frame 二选一） |
| `generate_first_frame` | boolean | 条件 | 是否自动生成首帧，默认 `true` |
| `aspect_ratio` | string | 否 | 画面比例，默认 `"16:9"` |
| `resolution` | string | 否 | 分辨率，默认 `"720P"` |
| `duration_seconds` | number | 否 | 时长（秒），可选 4/5/6/8，默认 `5` |
| `motion_mode` | string | 否 | 运动模式，默认 `"normal"` |
| `enable_audio` | boolean | 否 | 是否生成音效，默认 `true` |
| `art_style` | string | 否 | 艺术风格 |
| `auto_enhance_prompt` | boolean | 否 | AI 优化提示词，默认 `true` |
| `negative_prompt` | string | 否 | 负面提示词 |
| `scene_template` | string | 否 | 场景模板 ID |

**请求示例**:

```json
{
  "child_name": "小明",
  "age_months": 36,
  "custom_prompt": "小兔子在花园里开心地吃蔬菜，旁边有蝴蝶飞舞",
  "generate_first_frame": true,
  "aspect_ratio": "16:9",
  "resolution": "720P",
  "duration_seconds": 5,
  "motion_mode": "normal",
  "enable_audio": true,
  "scene_template": "character_dialogue"
}
```

**响应**:

```json
{
  "task_id": "video_standalone_abc123",
  "message": "任务已提交"
}
```

**状态查询**: 复用现有 `GET /api/v1/content/video/status/{task_id}`

**后端处理流程**:

```
1. 接收请求，验证参数
2. 如果 generate_first_frame=true，先调用 Imagen 生成首帧
3. 构建 Veo 3.1 请求（首帧 URL + prompt）
4. 提交 Veo 3.1 生成任务
5. 返回 task_id
6. 后台轮询 Veo 状态，完成后保存视频到数据库
```

---

## 三、数据流图

```
┌─────────────────────────────────────────────────────────────────┐
│                        智能创作数据流                            │
└─────────────────────────────────────────────────────────────────┘

用户输入描述 (custom_prompt)
     │
     ▼
选择内容类型: 绘本 / 儿歌 / 视频
     │
     ├──────────────────┬──────────────────┐
     ▼                  ▼                  ▼
┌─────────┐      ┌─────────┐      ┌─────────────────┐
│ 绘本API │      │ 儿歌API │      │   视频模式选择   │
│         │      │         │      ├────────┬────────┤
│ POST    │      │ POST    │      │基于绘本│独立创作│
│ /picture│      │/nursery │      │(现有)  │(新增)  │
│ -book/  │      │-rhyme/  │      └────────┴────────┘
│ async   │      │ async   │               │
│         │      │         │               ▼
│ +mode:  │      │ +mode:  │      ┌─────────────────┐
│ smart   │      │ smart   │      │  首帧生成 API   │
│ +custom │      │ +custom │      │ POST /video/    │
│ _prompt │      │ _prompt │      │ first-frame     │
└─────────┘      └─────────┘      └─────────────────┘
     │                │                    │
     ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     轮询任务状态                                 │
│              GET /content/{type}/status/{task_id}               │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼ (status: completed)
┌─────────────────────────────────────────────────────────────────┐
│                     跳转播放页                                   │
│              /pages/play/{type}?id={content_id}                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 四、运动模式说明 (motion_mode)

| 值 | 中文名 | 描述 |
|---|--------|------|
| `static` | 静态 | 画面基本静止，仅有轻微变化 |
| `slow` | 缓慢 | 轻柔缓慢的运动 |
| `normal` | 正常 | 默认运动速度 |
| `dynamic` | 动态 | 活泼明快的运动 |
| `cinematic` | 电影感 | 具有电影质感的镜头运动 |

---

## 五、场景模板说明 (scene_template)

| ID | 名称 | 描述 |
|---|------|------|
| `cover_subtle` | 封面展示 | 适合封面类静态展示 |
| `character_dialogue` | 角色对话 | 适合角色互动场景 |
| `scene_transition` | 场景过渡 | 适合场景切换 |
| `action_scene` | 动作场景 | 适合动态动作 |
| `emotional_moment` | 情感时刻 | 适合温馨情感场景 |

---

## 六、前端接口定义参考

以下是前端 TypeScript 接口定义，供后端参考字段命名：

```typescript
// 创作模式
type CreationMode = 'smart' | 'preset'

// 绘本参数扩展
interface GeneratePictureBookParams {
  child_name: string
  age_months: number
  theme_topic: string
  theme_category: string
  art_style?: ArtStyle
  protagonist?: { animal: ProtagonistAnimal }
  voice_id?: string
  // 智能创作新增
  creation_mode?: CreationMode
  custom_prompt?: string
}

// 儿歌参数扩展
interface GenerateNurseryRhymeParams {
  child_name: string
  age_months: number
  theme_topic: string
  theme_category: string
  music_mood?: MusicMood
  art_style?: ArtStyle
  protagonist?: { animal: ProtagonistAnimal }
  // 智能创作新增
  creation_mode?: CreationMode
  custom_prompt?: string
}

// 首帧生成参数
interface GenerateFirstFrameParams {
  prompt: string
  child_name: string
  art_style?: ArtStyle
  aspect_ratio?: '16:9' | '9:16' | '1:1'
}

// 首帧响应
interface FirstFrameResponse {
  image_url: string
  prompt_enhanced?: string
}

// 独立视频创作参数
interface GenerateStandaloneVideoParams {
  child_name: string
  age_months: number
  custom_prompt: string
  first_frame_url?: string
  generate_first_frame?: boolean
  aspect_ratio?: '16:9' | '9:16' | '4:3' | '3:4' | '1:1'
  resolution?: '720P' | '1080P'
  duration_seconds?: 4 | 5 | 6 | 8
  motion_mode?: 'static' | 'slow' | 'normal' | 'dynamic' | 'cinematic'
  enable_audio?: boolean
  art_style?: ArtStyle
  auto_enhance_prompt?: boolean
  negative_prompt?: string
  scene_template?: SceneTemplateId
}
```

---

## 七、错误处理

### 通用错误码

| HTTP 状态码 | 错误类型 | 说明 |
|------------|---------|------|
| 400 | `INVALID_PARAMS` | 参数校验失败 |
| 400 | `PROMPT_TOO_LONG` | custom_prompt 超过 500 字 |
| 400 | `MISSING_PROMPT` | creation_mode=smart 但未提供 custom_prompt |
| 500 | `AI_GENERATION_ERROR` | AI 生成失败 |
| 500 | `IMAGE_GENERATION_ERROR` | 首帧图片生成失败 |

### 错误响应格式

```json
{
  "error": {
    "code": "MISSING_PROMPT",
    "message": "智能创作模式下必须提供 custom_prompt"
  }
}
```
