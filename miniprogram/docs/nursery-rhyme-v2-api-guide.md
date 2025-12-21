# 儿歌创作增强参数系统 - 前后端联调文档

> **文档版本**: v2.0
> **更新日期**: 2025-12-21
> **前端版本**: 54b1c02

---

## 一、功能概述

本次升级实现了完整的 Suno V5 儿歌生成参数支持，包含：

- **31 个可配置参数**（音乐、人声、乐器、音效、歌词、结构等）
- **8 个场景预设**（睡前、起床、洗漱、吃饭、游戏、学习、运动、情绪）
- **智能氛围联动**（选择氛围自动推荐关联参数）
- **高级设置面板**（9 个分类折叠面板）

---

## 二、API 端点

### 2.1 异步生成儿歌

```
POST /api/v1/content/nursery-rhyme/async
```

**说明**: 立即返回 `task_id`，避免 Cloudflare 524 超时。

### 2.2 查询任务状态

```
GET /api/v1/content/nursery-rhyme/status/{task_id}
```

**说明**: 前端每 3 秒轮询一次，最多 120 次（6 分钟）。

### 2.3 获取内容详情（备用）

```
GET /api/v1/content/{content_id}
```

**说明**: 当状态返回 `content_id` 但无 `result` 时使用。

---

## 三、请求参数完整定义

### 3.1 参数分类总览

| 分类 | 参数数量 | 说明 |
|------|----------|------|
| 必填参数 | 4 | child_name, age_months, theme_topic, theme_category |
| 核心参数 | 4 | creation_mode, custom_prompt, music_mood, vocal_type |
| 音乐风格 | 3 | music_genre, tempo, energy_level |
| 人声演唱 | 5 | vocal_range, vocal_emotion, vocal_style, vocal_effects, vocal_regional |
| 乐器与音效 | 2 | instruments, sound_effects |
| 歌词设置 | 2 | lyric_complexity, repetition_level |
| 歌曲结构 | 3 | song_structure, duration_preference, action_types |
| 语言文化 | 2 | language, cultural_style |
| 个性化 | 3 | educational_focus, favorite_characters, favorite_colors |
| Suno 进阶 | 5 | style_weight, creativity, negative_tags, style_description, seed |

### 3.2 完整请求示例

```json
{
  "child_name": "小明",
  "age_months": 36,
  "theme_topic": "刷牙歌",
  "theme_category": "habit",

  "creation_mode": "preset",
  "custom_prompt": null,
  "music_mood": "cheerful",
  "vocal_type": "soft_female",

  "music_genre": "children",
  "tempo": 120,
  "energy_level": 7,

  "vocal_range": "mid",
  "vocal_emotion": "happy",
  "vocal_style": "clear",
  "vocal_effects": ["reverb"],
  "vocal_regional": "chinese",

  "instruments": ["piano", "xylophone"],
  "sound_effects": ["laugh", "cheer"],

  "lyric_complexity": 5,
  "repetition_level": 6,

  "song_structure": "standard",
  "duration_preference": 90,
  "action_types": "clap",

  "language": "chinese",
  "cultural_style": "chinese_modern",

  "educational_focus": "habit",
  "favorite_characters": [],
  "favorite_colors": ["red", "blue"],

  "style_weight": 0.5,
  "creativity": 0.5,
  "negative_tags": "heavy_metal, horror",
  "style_description": "",
  "seed": null
}
```

### 3.3 参数详细定义

#### 必填参数

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `child_name` | string | ✅ | 孩子名字 | "小明" |
| `age_months` | number | ✅ | 孩子月龄 | 36 |
| `theme_topic` | string | ✅ | 主题内容 | "刷牙歌" |
| `theme_category` | string | ✅ | 主题分类 | "habit" |

#### 核心参数

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `creation_mode` | string | ✅ | 创作模式 | `preset`（预设模式）, `smart`（智能模式） |
| `custom_prompt` | string | ⚠️ | 用户描述 | 智能模式必填 |
| `music_mood` | string | ✅ | 音乐氛围 | `cheerful`, `gentle`, `playful`, `lullaby`, `educational`, `rhythmic`, `soothing`, `festive` |
| `vocal_type` | string | ✅ | 人声类型 | `soft_female`, `energetic_female`, `soft_male`, `child_voice`, `child_chorus`, `duet` |

#### 音乐风格参数

| 参数名 | 类型 | 必填 | 说明 | 范围/可选值 |
|--------|------|------|------|-------------|
| `music_genre` | **string** | ❌ | 音乐流派 | `children`, `pop`, `folk`, `classical`, `electronic`, `world`, `jazz` 等 |
| `tempo` | number | ❌ | 节奏速度 | 60-180 BPM，默认 100 |
| `energy_level` | number | ❌ | 能量强度 | 1-10，默认 5 |

> ⚠️ **注意**: `music_genre` 是**单选字符串**，不是数组

#### 人声演唱参数

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `vocal_range` | string | ❌ | 音域选择 | `high`（高音域）, `mid`（中音域）, `low`（低音域） |
| `vocal_emotion` | string | ❌ | 情感表达 | `happy`, `tender`, `excited`, `calm`, `playful`, `warm` |
| `vocal_style` | **string** | ❌ | 演唱技巧 | `clear`, `breathy`, `powerful`, `falsetto`, `rap`, `whisper` |
| `vocal_effects` | string[] | ❌ | 声音效果 | `reverb`, `delay`, `autotune`, `vintage` |
| `vocal_regional` | string | ❌ | 地域特色 | `chinese`, `korean`, `japanese`, `western` |

> ⚠️ **注意**: `vocal_style` 是**单选字符串**，不是数组

#### 乐器与音效参数

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `instruments` | string[] | ❌ | 乐器配置 | `piano`, `guitar`, `xylophone`, `drums`, `ukulele`, `flute`, `violin` 等 |
| `sound_effects` | string[] | ❌ | 音效元素 | `laugh`, `cheer`, `animal`, `nature`, `bell`, `sparkle` 等 |

#### 歌词设置参数

| 参数名 | 类型 | 必填 | 说明 | 范围 |
|--------|------|------|------|------|
| `lyric_complexity` | number | ❌ | 歌词复杂度 | 1-10，默认 5 |
| `repetition_level` | number | ❌ | 重复程度 | 1-10，默认 6 |

#### 歌曲结构参数

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `song_structure` | string | ❌ | 结构类型 | `simple`(A-A-A), `standard`(A-B-A-B), `full`(Intro-A-B-Outro), `progressive`, `narrative`, `call_response` |
| `duration_preference` | number | ❌ | 时长偏好 | 秒数，默认 90 |
| `action_types` | **string** | ❌ | 动作指引 | `clap`, `stomp`, `spin`, `sway`, `jump`, `finger`, `expression`, `parent_child` |

> ⚠️ **注意**: `action_types` 是**单选字符串**，不是数组

#### 语言文化参数

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `language` | string | ❌ | 歌曲语言 | `chinese`, `english`, `cantonese`, `mixed` |
| `cultural_style` | string | ❌ | 文化风格 | `chinese_modern`, `chinese_traditional`, `western`, `korean`, `japanese` 等 |

#### 个性化参数

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| `educational_focus` | **string** | ❌ | 教育目标 | `language`, `math`, `science`, `art`, `habit`, `emotion`, `social` 等 |
| `favorite_characters` | string[] | ❌ | 喜欢的角色 | 自由文本数组 |
| `favorite_colors` | string[] | ❌ | 喜欢的颜色 | `red`, `blue`, `yellow`, `green`, `pink`, `purple` 等 |

> ⚠️ **注意**: `educational_focus` 是**单选字符串**，不是数组

#### Suno 进阶参数

| 参数名 | 类型 | 必填 | 说明 | 范围 |
|--------|------|------|------|------|
| `style_weight` | number | ❌ | 风格权重 | 0-1，默认 0.5 |
| `creativity` | number | ❌ | 创意程度 | 0-1，默认 0.5 |
| `negative_tags` | string | ❌ | 排除标签 | 逗号分隔字符串 |
| `style_description` | string | ❌ | 风格描述 | 自由文本 |
| `seed` | number | ❌ | 随机种子 | 整数或 null |

---

## 四、响应格式

### 4.1 任务提交响应

```json
{
  "task_id": "abc123",
  "message": "任务已提交"
}
```

### 4.2 任务状态响应

```json
{
  "task_id": "abc123",
  "status": "processing",
  "progress": 65,
  "stage": "first",
  "message": "首曲完成，继续生成...",
  "content_id": null,
  "result": null
}
```

**状态值说明**:

| status | 说明 |
|--------|------|
| `pending` | 任务已提交，等待处理 |
| `processing` | 正在处理中 |
| `completed` | 全部完成 |
| `failed` | 生成失败 |

**阶段值说明**:

| stage | 说明 | 对应进度 |
|-------|------|----------|
| `waiting` / `pending` | 等待中 | 0-10% |
| `text` | 歌词生成完成 | 20-40% |
| `first` | 第一首歌曲完成 | 50-70% |
| `complete` / `completed` | 全部完成 | 100% |
| `error` / `failed` | 生成失败 | - |

### 4.3 完成后的 result 对象

```json
{
  "id": "abc123",
  "title": "快乐刷牙歌",
  "theme_topic": "刷牙歌",
  "audio_url": "https://...",
  "video_url": "https://...",
  "cover_url": "https://...",
  "suno_cover_url": "https://...",
  "duration": 85,
  "music_style": "cheerful",
  "lyrics": {
    "full_text": "小牙刷，刷刷刷...",
    "sections": [
      { "content": "小牙刷，刷刷刷" },
      { "content": "上上下下里里外外" }
    ],
    "timestamped": [
      { "word": "小牙刷", "start_s": 0.5, "end_s": 1.2 },
      { "word": "刷刷刷", "start_s": 1.3, "end_s": 2.1 }
    ]
  },
  "all_tracks": [
    {
      "id": "track1",
      "title": "快乐刷牙歌",
      "audio_url": "https://...",
      "video_url": "https://...",
      "cover_url": "https://...",
      "duration": 85,
      "lyric": "小牙刷，刷刷刷...",
      "timestamped_lyrics": []
    }
  ],
  "personalization": {
    "child_name": "小明"
  },
  "created_at": "2025-12-21T10:00:00Z"
}
```

---

## 五、场景预设参数映射

前端提供 8 个场景预设，选择后自动填充以下参数：

| 预设 | music_mood | vocal_type | tempo | energy_level | instruments |
|------|------------|------------|-------|--------------|-------------|
| 🌙 睡前 | lullaby | soft_female | 70 | 2 | piano, music_box |
| ☀️ 起床 | cheerful | energetic_female | 110 | 7 | xylophone, guitar |
| 🚿 洗漱 | playful | child_voice | 120 | 6 | ukulele |
| 🍽️ 吃饭 | gentle | soft_male | 90 | 4 | acoustic_guitar |
| 🎮 游戏 | festive | child_chorus | 130 | 8 | synth, drums |
| 📚 学习 | educational | soft_female | 100 | 5 | piano |
| ⚽ 运动 | rhythmic | energetic_female | 140 | 9 | drums, bass |
| 💖 情绪 | soothing | soft_female | 80 | 3 | piano, strings |

---

## 六、前端轮询逻辑

```typescript
// 轮询配置
const POLL_INTERVAL = 3000      // 3秒
const MAX_POLL_COUNT = 120      // 最多轮询120次（6分钟）
const MAX_CONSECUTIVE_ERRORS = 5 // 连续错误上限

// 轮询实现
async function pollTaskStatus(taskId: string) {
  let pollCount = 0
  let consecutiveErrors = 0

  while (pollCount < MAX_POLL_COUNT) {
    try {
      const status = await getNurseryRhymeTaskStatus(taskId)
      consecutiveErrors = 0

      // 更新 UI 进度
      updateProgress(status.progress, status.stage, status.message)

      // 检查完成
      if (status.status === 'completed') {
        if (status.result) {
          return status.result
        }
        if (status.content_id) {
          return await getContentDetail(status.content_id)
        }
      }

      // 检查失败
      if (status.status === 'failed') {
        throw new Error(status.error || '生成失败')
      }

    } catch (error) {
      consecutiveErrors++
      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        throw new Error('网络连接不稳定，请检查网络后重试')
      }
    }

    await sleep(POLL_INTERVAL)
    pollCount++
  }

  throw new Error('生成超时，请稍后重试')
}
```

---

## 七、需要后端确认的问题

### 7.1 类型确认

| 参数 | 前端类型 | 问题 |
|------|----------|------|
| `music_genre` | string | 确认是单选还是多选？ |
| `vocal_style` | string | 确认是单选还是多选？ |
| `action_types` | string | 确认是单选还是多选？ |
| `educational_focus` | string | 确认是单选还是多选？ |

### 7.2 参数支持确认

以下参数是否已在后端实现？

- [ ] `vocal_effects` - 声音效果（多选）
- [ ] `vocal_regional` - 地域特色（单选）
- [ ] `favorite_characters` - 喜欢的角色（多选）
- [ ] `duration_preference` - 时长偏好

### 7.3 其他问题

1. **video_url 为空**：Suno 回调是否正常？前端收到空字符串 `""`
2. **参数上限**：31 个参数是否都生效？有无被忽略的参数？
3. **Prompt 生成**：增强参数如何影响最终的 Suno Prompt？
4. **lyrics 格式**：是否统一返回对象格式（包含 full_text, sections, timestamped）？

---

## 八、代码审查发现的问题

### 8.1 Critical（必须修复）

| 问题 | 位置 | 状态 |
|------|------|------|
| `music_genre` 类型不匹配 | content.ts:253 | ✅ 已修复为单选 |
| `vocal_style` 类型不匹配 | content.ts:261 | ✅ 已修复为单选 |
| `action_types` 类型不匹配 | content.ts:277 | ✅ 已修复为单选 |
| `educational_focus` 类型不匹配 | content.ts:287 | ✅ 已修复为单选 |

### 8.2 Important（应该修复）

| 问题 | 位置 | 状态 |
|------|------|------|
| 确认页缺失部分参数展示 | nursery-rhyme.vue:500-592 | ✅ 已补全 |
| 响应数据转换不安全 | nursery-rhyme.vue:1115-1133 | ⏳ 待优化 |

### 8.3 Suggestion（建议优化）

| 问题 | 位置 | 状态 |
|------|------|------|
| 硬编码颜色值 | NurseryRhymeAdvanced.vue | ⏳ 待优化 |
| 日志输出过滤敏感信息 | nursery-rhyme.vue:1242 | ⏳ 待优化 |

---

## 九、测试检查清单

### 9.1 功能测试

- [ ] 普通模式：选择主题 → 设置风格 → 确认生成
- [ ] 智能模式：输入描述 → 设置风格 → 确认生成
- [ ] 场景预设：选择预设 → 参数自动填充
- [ ] 高级设置：展开/折叠 → 修改参数 → 确认页显示
- [ ] 生成进度：阶段切换 → 进度更新 → 完成跳转

### 9.2 边界测试

- [ ] 网络中断：轮询失败重试
- [ ] 生成超时：6分钟超时提示
- [ ] 空值处理：未设置高级参数时不报错
- [ ] 后端错误：显示错误信息

### 9.3 兼容性测试

- [ ] iOS 微信
- [ ] Android 微信
- [ ] 微信开发者工具

---

## 十、版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v2.0 | 2025-12-21 | 完整 31 参数支持 + 场景预设 + 高级设置 |
| v1.5 | 2025-12-20 | 异步 API + 进度轮询 |
| v1.0 | 2025-12-15 | 基础儿歌生成 |

---

**文档维护**: Claude Code
**联系方式**: 如有问题请在项目群内沟通
