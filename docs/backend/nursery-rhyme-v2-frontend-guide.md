# 儿歌生成 V2 前端集成指南

## 概述

本文档描述儿歌生成 V2 版本的前端集成方式。V2 版本主要变化：

1. **Gemini 提示词增强** - 用户选择经过 Gemini 优化后再传给 Suno
2. **移除 Gemini 图片生成** - 直接使用 Suno 返回的封面图
3. **31 个参数支持** - 9 大类参数，提供丰富的定制选项
4. **新增诊断端点** - 支持问题排查和生成过程追踪

## API 端点

### 1. 生成儿歌

```
POST /api/v1/nursery-rhyme/generate
```

### 2. 获取歌曲详情（新增）

```
GET /api/v1/content/{content_id}/details
```

用于展示歌曲的用户友好信息。

### 3. 获取诊断信息（新增）

```
GET /api/v1/content/{content_id}/diagnostics
```

用于问题排查，显示生成过程的详细日志。

---

## 请求参数 (31个参数，9大类)

### 必填参数

| 参数名 | 类型 | 说明 | 验证规则 |
|--------|------|------|----------|
| `child_name` | string | 孩子姓名 | 必填 |
| `age_months` | int | 孩子月龄 | 12-72 |

### 模式参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `creation_mode` | string | "preset" | `preset`(预设模式) 或 `smart`(智能模式) |

### 主题参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `theme_topic` | string | 主题（preset模式必填） |
| `theme_category` | string | 主题分类 |
| `educational_focus` | string[] | 教育目标数组 |

### 音乐风格

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `music_mood` | string | 情绪/氛围 |
| `music_genre` | string | 音乐流派 |
| `tempo` | string | 节奏速度 |
| `energy_level` | string | 能量强度 |
| `vocal_gender` | string | 人声性别 |
| `vocal_style` | string | 演唱风格 |
| `instrumental` | bool | 是否纯音乐（无人声） |

### 乐器与音效

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `instruments` | string[] | 乐器偏好 |
| `sound_effects` | string[] | 音效元素 |

### 语言与文化

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `language` | string | 歌曲语言 |
| `cultural_style` | string | 文化风格 |
| `lyric_complexity` | string | 歌词复杂度 |

### 歌曲结构

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `duration_preference` | string | 时长偏好 |
| `repetition_level` | string | 重复程度 |
| `song_structure` | string | 歌曲结构类型 |
| `has_actions` | bool | 是否包含动作指引 |

### 个性化

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `favorite_characters` | string[] | 喜欢的角色 |
| `favorite_animals` | string[] | 喜欢的动物 |
| `favorite_colors` | string[] | 喜欢的颜色 |
| `custom_elements` | string | 自定义元素 |

### Suno 高级控制

| 参数名 | 类型 | 默认值 | 验证规则 | 说明 |
|--------|------|--------|----------|------|
| `negative_tags` | string | - | - | 要排除的风格 |
| `style_weight` | float | 0.5 | 0-1 | 风格引导权重 |
| `creativity` | float | 0.5 | 0-1 | 创意/随机程度 |

### 智能模式专用

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `custom_prompt` | string | 自由创作描述 |
| `inspiration_keywords` | string[] | 灵感关键词 |

---

## 请求示例

### Preset 模式（预设主题）

```json
{
  "child_name": "小明",
  "age_months": 36,
  "creation_mode": "preset",
  "theme_topic": "小恐龙冒险",
  "theme_category": "动物",
  "music_mood": "欢快",
  "music_genre": "儿歌",
  "tempo": "中速",
  "vocal_gender": "女声",
  "language": "中文",
  "duration_preference": "短",
  "has_actions": true,
  "favorite_animals": ["恐龙", "小鸟"],
  "style_weight": 0.6,
  "creativity": 0.4
}
```

### Smart 模式（智能创作）

```json
{
  "child_name": "小红",
  "age_months": 48,
  "creation_mode": "smart",
  "custom_prompt": "一首关于春天花园的歌，有蝴蝶和小蜜蜂",
  "inspiration_keywords": ["春天", "花朵", "蝴蝶"],
  "music_mood": "温柔",
  "tempo": "慢速",
  "language": "中文",
  "creativity": 0.7
}
```

---

## 响应格式

### 生成接口响应

```json
{
  "content_id": "uuid-xxxx",
  "task_id": "task-xxxx",
  "status": "processing",
  "message": "歌曲生成已开始"
}
```

### Details 端点响应

```json
{
  "content_id": "uuid-xxxx",
  "title": "小恐龙冒险歌",
  "created_at": "2025-12-20T10:30:00",
  "basic_info": {
    "child_name": "小明",
    "age_months": 36,
    "creation_mode": "preset"
  },
  "user_selections": {
    "theme_topic": "小恐龙冒险",
    "music_mood": "欢快",
    "tempo": "中速"
  },
  "user_prompt": "原始用户提示词",
  "enhanced_prompt": "Gemini增强后的提示词",
  "generation_result": {
    "audio_url": "https://...",
    "cover_url": "https://...",
    "duration": 45,
    "lyrics": "歌词内容..."
  },
  "generated_by": {
    "music": "suno",
    "prompt_enhancement": "gemini-2.0-flash"
  }
}
```

### Diagnostics 端点响应

```json
{
  "content_id": "uuid-xxxx",
  "task_id": "task-xxxx",
  "status": "completed",
  "timeline": {
    "created_at": "2025-12-20T10:30:00",
    "completed_at": "2025-12-20T10:31:30"
  },
  "stage_durations": {
    "prompt_template": "0.1s",
    "prompt_enhance": "2.3s",
    "suno_generate": "85.2s"
  },
  "raw_request": { ... },
  "prompt_enhancement": {
    "original": "用户原始提示词",
    "enhanced": "增强后的提示词",
    "model": "gemini-2.0-flash"
  },
  "suno_details": {
    "model": "chirp-v4",
    "track_selected": 0
  },
  "all_tracks": [
    { "id": "track1", "audio_url": "...", "selected": true },
    { "id": "track2", "audio_url": "...", "selected": false }
  ],
  "errors": [],
  "warnings": []
}
```

---

## 前端集成建议

### 1. 两种创作模式 UI

```
┌─────────────────────────────────────┐
│  ○ 预设模式    ● 智能模式           │
├─────────────────────────────────────┤
│  [预设模式显示主题选择器]            │
│  [智能模式显示自由输入框]            │
└─────────────────────────────────────┘
```

### 2. 参数分组展示

建议将参数按类别分组，使用折叠面板：

- **基本信息** - 孩子姓名、月龄（必填）
- **主题设置** - 主题、分类、教育目标
- **音乐风格** - 情绪、流派、节奏等
- **高级选项** - Suno控制参数（可折叠）

### 3. 生成状态轮询

```javascript
async function pollGenerationStatus(contentId) {
  const response = await fetch(`/api/v1/content/${contentId}/details`);
  const data = await response.json();

  if (data.generation_result?.audio_url) {
    // 生成完成
    return data;
  }

  // 继续轮询
  await sleep(3000);
  return pollGenerationStatus(contentId);
}
```

### 4. 错误处理

```javascript
async function checkDiagnostics(contentId) {
  const response = await fetch(`/api/v1/content/${contentId}/diagnostics`);
  const data = await response.json();

  if (data.errors.length > 0) {
    // 显示错误信息
    console.error('生成失败:', data.errors);
  }

  if (data.warnings.length > 0) {
    // 显示警告信息
    console.warn('生成警告:', data.warnings);
  }
}
```

---

## 参数推荐值

### 按年龄段推荐

| 月龄 | tempo | lyric_complexity | duration_preference |
|------|-------|------------------|---------------------|
| 12-24 | 慢速 | 简单 | 短 |
| 24-36 | 中速 | 简单 | 短 |
| 36-48 | 中速 | 中等 | 中 |
| 48-60 | 中速 | 中等 | 中 |
| 60-72 | 快速 | 复杂 | 长 |

### 情绪-流派搭配

| music_mood | 推荐 music_genre |
|------------|------------------|
| 欢快 | 儿歌、流行 |
| 温柔 | 摇篮曲、民谣 |
| 活泼 | 舞曲、电子 |
| 舒缓 | 古典、轻音乐 |

---

## 更新日志

- **2025-12-20**: V2 版本发布
  - 新增 Gemini 提示词增强
  - 移除 Gemini 图片生成，使用 Suno 封面
  - 新增 31 参数支持
  - 新增 details/diagnostics 端点
