# 前端开发配置指南 - 图片/视频/TTS 服务

> 本文档提供图片生成、视频生成、TTS语音合成服务的前端配置选项说明。
> 更新时间: 2025-12-18

---

## 1. 图片生成服务 (Image)

### 1.1 API 接口

```
POST /api/v1/image/generate
```

### 1.2 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `prompt` | string | ✅ | - | 图片描述文本 |
| `style` | string | ❌ | `storybook` | 图片风格 (见下方完整列表) |
| `width` | int | ❌ | `1024` | 图片宽度 (px) |
| `height` | int | ❌ | `1024` | 图片高度 (px) |
| `negative_prompt` | string | ❌ | `null` | 负面提示词（避免生成的内容） |
| `safe_mode` | bool | ❌ | `true` | 是否添加儿童安全提示词 |

### 1.3 风格选项 (style) - 完整列表

Nano Banana Pro 支持所有风格，以下是预设选项：

```json
{
  "style_categories": [
    {
      "category": "children",
      "label": "儿童内容",
      "label_en": "Children's Content",
      "styles": [
        {"value": "storybook", "label": "绘本风格", "label_en": "Storybook", "description": "儿童绘本插画，温暖色调，柔和光线", "recommended": true},
        {"value": "cartoon", "label": "卡通风格", "label_en": "Cartoon", "description": "可爱卡通，鲜艳色彩，干净线条"},
        {"value": "watercolor", "label": "水彩风格", "label_en": "Watercolor", "description": "柔和水彩插画，梦幻氛围"},
        {"value": "flat", "label": "扁平风格", "label_en": "Flat Design", "description": "扁平设计，简洁几何，大胆配色"}
      ]
    },
    {
      "category": "3d",
      "label": "3D 风格",
      "label_en": "3D Styles",
      "styles": [
        {"value": "3d_render", "label": "3D 渲染", "label_en": "3D Render", "description": "高质量 3D 图形，逼真光影"},
        {"value": "3d_cartoon", "label": "3D 卡通", "label_en": "3D Cartoon", "description": "类皮克斯 3D 卡通，柔和阴影"},
        {"value": "clay", "label": "粘土风格", "label_en": "Clay/Claymation", "description": "粘土动画风格，手工感"},
        {"value": "pixar", "label": "皮克斯风格", "label_en": "Pixar Style", "description": "皮克斯动画风格，表情丰富"},
        {"value": "figurine", "label": "手办风格", "label_en": "Figurine", "description": "3D 手办/公仔，收藏品风格"}
      ]
    },
    {
      "category": "anime",
      "label": "动漫风格",
      "label_en": "Anime Styles",
      "styles": [
        {"value": "anime", "label": "日式动漫", "label_en": "Anime", "description": "日式动画，细致眼睛，干净线条"},
        {"value": "chibi", "label": "Q版萌系", "label_en": "Chibi", "description": "Q版风格，大头小身，可爱"},
        {"value": "manga", "label": "漫画风格", "label_en": "Manga", "description": "日式漫画，黑白为主，戏剧阴影"},
        {"value": "ghibli", "label": "吉卜力风格", "label_en": "Ghibli", "description": "宫崎骏风格，手绘动画，魔幻氛围"}
      ]
    },
    {
      "category": "realistic",
      "label": "写实风格",
      "label_en": "Realistic Styles",
      "styles": [
        {"value": "photorealistic", "label": "照片写实", "label_en": "Photorealistic", "description": "照片级真实，超高细节，8K"},
        {"value": "cinematic", "label": "电影感", "label_en": "Cinematic", "description": "电影剧照，戏剧性光影，胶片质感"},
        {"value": "portrait", "label": "人像摄影", "label_en": "Portrait", "description": "专业人像，浅景深，精致细节"}
      ]
    },
    {
      "category": "artistic",
      "label": "艺术风格",
      "label_en": "Artistic Styles",
      "styles": [
        {"value": "oil_painting", "label": "油画", "label_en": "Oil Painting", "description": "古典油画，丰富纹理，可见笔触"},
        {"value": "sketch", "label": "素描", "label_en": "Sketch", "description": "铅笔素描，手绘线条，艺术阴影"},
        {"value": "ink_wash", "label": "水墨画", "label_en": "Ink Wash", "description": "中国水墨，典雅笔触，极简"},
        {"value": "pixel_art", "label": "像素艺术", "label_en": "Pixel Art", "description": "16位风格，复古游戏图形"},
        {"value": "vector", "label": "矢量图形", "label_en": "Vector", "description": "矢量插画，干净线条，扁平色彩"},
        {"value": "pop_art", "label": "波普艺术", "label_en": "Pop Art", "description": "波普风格，大胆色彩，Ben-Day 点"}
      ]
    },
    {
      "category": "special",
      "label": "特殊风格",
      "label_en": "Special Styles",
      "styles": [
        {"value": "cyberpunk", "label": "赛博朋克", "label_en": "Cyberpunk", "description": "霓虹灯光，未来感，暗色调"},
        {"value": "fantasy", "label": "奇幻风格", "label_en": "Fantasy", "description": "魔幻艺术，空灵光线，神秘氛围"},
        {"value": "vintage", "label": "复古风格", "label_en": "Vintage", "description": "复古美学，怀旧色调"},
        {"value": "minimalist", "label": "极简风格", "label_en": "Minimalist", "description": "极简设计，简洁构图，大量留白"},
        {"value": "surreal", "label": "超现实", "label_en": "Surreal", "description": "超现实艺术，梦幻感，不可能几何"}
      ]
    },
    {
      "category": "none",
      "label": "无风格",
      "label_en": "No Style",
      "styles": [
        {"value": "none", "label": "纯提示词", "label_en": "None", "description": "不添加风格修饰，完全由用户 prompt 控制"}
      ]
    }
  ],
  "default": "storybook"
}
```

### 1.4 尺寸预设

```json
{
  "presets": [
    {"name": "正方形", "name_en": "Square", "width": 1024, "height": 1024, "aspect_ratio": "1:1", "recommended": true},
    {"name": "横版 16:9", "name_en": "Landscape 16:9", "width": 1280, "height": 720, "aspect_ratio": "16:9", "use_case": "视频封面、横屏展示"},
    {"name": "横版 4:3", "name_en": "Landscape 4:3", "width": 1024, "height": 768, "aspect_ratio": "4:3", "use_case": "绘本内页"},
    {"name": "竖版 9:16", "name_en": "Portrait 9:16", "width": 720, "height": 1280, "aspect_ratio": "9:16", "use_case": "手机竖屏、故事卡片"},
    {"name": "竖版 3:4", "name_en": "Portrait 3:4", "width": 768, "height": 1024, "aspect_ratio": "3:4", "use_case": "绘本封面"},
    {"name": "超宽 21:9", "name_en": "Ultrawide 21:9", "width": 1344, "height": 576, "aspect_ratio": "21:9", "use_case": "电影海报"}
  ],
  "default": {"width": 1024, "height": 1024}
}
```

### 1.5 Provider 配置 (后端切换)

| Provider | 模型 | 特点 | 环境变量 |
|----------|------|------|----------|
| `gemini` (默认) | gemini-3-pro-image-preview | Nano Banana Pro，全风格支持，高质量 | `IMAGE_PROVIDER=gemini` |
| `wanx` | wan2.6-t2i | 阿里万相，中国优化，快速 | `IMAGE_PROVIDER=wanx` |
| `imagen` | imagen-4.0-fast | Google Imagen 4 | `IMAGE_PROVIDER=imagen` |
| `minimax` | image-01 | 备选 | `IMAGE_PROVIDER=minimax` |

### 1.6 响应示例

```json
{
  "success": true,
  "data": {
    "url": "https://kids.jackverse.cn/media/images/2025/12/18/abc123.png",
    "prompt": "A cute bunny reading a book",
    "revised_prompt": "A cute bunny reading a book, children's book illustration, warm colors...",
    "model": "gemini-3-pro-image-preview",
    "width": 1024,
    "height": 1024,
    "style": "storybook"
  }
}
```

---

## 2. 视频生成服务 (Video) - Veo 3.1 增强版

### 2.1 API 接口

```
POST /api/v1/video/generate
GET  /api/v1/content/video/config  # 获取配置选项 (新增)
```

### 2.2 请求参数 (增强版)

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `image_url` | string | ✅ | - | 首帧图片 URL |
| `prompt` | string | ✅ | - | 视频动作/内容描述 |
| `duration_seconds` | int | ❌ | `5` | 视频时长（秒） |
| `resolution` | string | ❌ | `720P` | 分辨率 |
| `aspect_ratio` | string | ❌ | `16:9` | 宽高比 (仅支持 16:9 或 9:16) |
| `motion_mode` | string | ❌ | `normal` | 运动模式 |
| `enable_audio` | bool | ❌ | `false` | 音频功能 (Veo 当前版本暂不支持) |
| **`scene_template`** | string | ❌ | `null` | **场景模板 ID (新增)** |
| **`character_ids`** | string[] | ❌ | `[]` | **角色 ID 列表 (新增)** |
| **`reference_images`** | string[] | ❌ | `[]` | **直接提供参考图 URL (新增)** |
| **`auto_enhance_prompt`** | bool | ❌ | `true` | **是否 AI 增强提示词 (新增)** |
| **`negative_prompt`** | string | ❌ | `null` | **负面提示词 (新增)** |
| **`last_frame_url`** | string | ❌ | `null` | **结束帧图片 URL (新增)** |

### 2.3 场景模板 (scene_template) - 新增

场景模板是预设的参数组合，一键应用最佳配置：

```json
{
  "scene_templates": [
    {
      "id": "cover_subtle",
      "name": "封面微动",
      "description": "轻微呼吸感，适合封面和标题页",
      "duration": 4,
      "resolution": "1080p"
    },
    {
      "id": "character_dialogue",
      "name": "角色对话",
      "description": "角色轻微动作和表情变化",
      "duration": 6,
      "resolution": "720p"
    },
    {
      "id": "scene_transition",
      "name": "场景转换",
      "description": "场景推进，带镜头运动",
      "duration": 8,
      "resolution": "720p"
    },
    {
      "id": "action_scene",
      "name": "动作场景",
      "description": "丰富动作，适合高潮情节",
      "duration": 8,
      "resolution": "720p"
    },
    {
      "id": "emotional_moment",
      "name": "情感特写",
      "description": "角色表情细腻变化",
      "duration": 6,
      "resolution": "1080p"
    }
  ]
}
```

**前端 UI 建议**: 使用卡片选择器，每个模板显示图标、名称、描述。

### 2.4 角色参考图管理 (character_ids / reference_images) - 新增

Veo 3.1 支持最多 3 张参考图保持角色一致性。

**方式一：使用角色库 (推荐)**

```javascript
// 1. 在绘本创建时注册角色
POST /api/v1/characters/register
{
  "character_id": "bunny_main",
  "name": "小兔子",
  "description": "白色小兔子，粉色耳朵，穿蓝色背带裤",
  "image_urls": [
    "https://example.com/bunny_front.png",
    "https://example.com/bunny_side.png",
    "https://example.com/bunny_happy.png"
  ]
}

// 2. 生成视频时引用角色
POST /api/v1/video/generate
{
  "image_url": "scene_01.png",
  "prompt": "小兔子开心地跳舞",
  "character_ids": ["bunny_main"]  // 自动获取参考图
}
```

**方式二：直接提供参考图**

```javascript
POST /api/v1/video/generate
{
  "image_url": "scene_01.png",
  "prompt": "小兔子开心地跳舞",
  "reference_images": [
    "https://example.com/bunny_ref1.png",
    "https://example.com/bunny_ref2.png"
  ]
}
```

**多角色分配规则** (系统自动处理):
| 场景角色数 | 参考图分配 |
|-----------|-----------|
| 1 个角色 | 该角色使用全部 3 张配额 |
| 2 个角色 | 主角 2 张 + 配角 1 张 |
| 3+ 个角色 | 每角色 1 张 (最多 3 个角色) |

### 2.5 提示词增强 (auto_enhance_prompt) - 新增

```json
{
  "enhancement_options": {
    "enabled": true,
    "description": "AI自动优化提示词，提升视频质量",
    "styles": ["cartoon", "watercolor", "3d_render", "pixel", "sketch", "oil_painting", "anime", "realistic"]
  }
}
```

**工作原理**:
1. 系统分析输入图片风格 (如识别为 watercolor)
2. 自动添加风格保持词 (如 "soft watercolor painting style")
3. 自动添加镜头语言 (如 "slow cinematic pan")
4. 自动生成负面提示词 (如 "realistic, 3d, blur")

**前端 UI 建议**:
- 默认开启，显示为开关
- 可选显示增强后的提示词预览 (调试用)

### 2.6 负面提示词预设 (negative_prompt) - 新增

```json
{
  "negative_prompt_presets": {
    "realistic": "realistic, photographic, photo-real, lifelike",
    "blur": "blur, out of focus, blurry, unfocused",
    "style_change": "style change, inconsistent style, style shift",
    "shaky": "camera shake, jerky motion, unstable, shaky cam",
    "dark": "dark, dimly lit, shadowy, low key lighting",
    "fast": "fast motion, rapid movement, speed blur",
    "distortion": "distortion, warped, stretched, morphing artifacts"
  }
}
```

**前端 UI 建议**: 多选 Checkbox，允许用户选择要排除的内容类型。

### 2.7 完整配置选项

```json
{
  "aspect_ratios": [
    {"value": "16:9", "label": "横屏 16:9", "label_en": "Landscape 16:9", "description": "视频、电影、绘本动画", "recommended": true, "default": true},
    {"value": "9:16", "label": "竖屏 9:16", "label_en": "Portrait 9:16", "description": "手机、短视频、抖音、封面"}
  ],

  "resolutions": [
    {"value": "720P", "label": "720P 高清", "label_en": "HD 720P", "pixels": "1280x720", "recommended": true},
    {"value": "1080P", "label": "1080P 全高清", "label_en": "Full HD 1080P", "pixels": "1920x1080", "note": "生成时间更长"}
  ],

  "durations": [
    {"value": 5, "label": "5秒", "description": "快速预览", "recommended": true, "all_providers": true},
    {"value": 8, "label": "8秒", "description": "标准时长", "provider_max": "veo"},
    {"value": 10, "label": "10秒", "description": "较长动画", "provider_max": "wanx"},
    {"value": 15, "label": "15秒", "description": "完整片段", "provider_max": "wanx"}
  ],

  "motion_modes": [
    {"value": "static", "label": "静态", "label_en": "Static", "description": "几乎无运动，适合展示静态场景"},
    {"value": "slow", "label": "缓慢", "label_en": "Slow", "description": "轻微运动，适合氛围感"},
    {"value": "normal", "label": "正常", "label_en": "Normal", "description": "自然运动", "recommended": true},
    {"value": "dynamic", "label": "动态", "label_en": "Dynamic", "description": "较多运动，适合动作场景"},
    {"value": "cinematic", "label": "电影感", "label_en": "Cinematic", "description": "电影级镜头运动，推拉摇移"}
  ],

  "audio_options": [
    {"value": false, "label": "静音", "label_en": "Mute", "description": "当前版本生成静音视频", "default": true},
    {"value": true, "label": "启用音效", "label_en": "Enable Audio", "description": "Veo 暂不支持，后续版本可能开放", "disabled": true}
  ],

  "providers": {
    "veo": {
      "name": "Google Veo 3.1",
      "max_duration": 8,
      "features": ["high_quality", "scene_templates", "prompt_enhancement"],
      "audio_support": false,
      "recommended": true
    },
    "wanx": {
      "name": "阿里万相",
      "max_duration": 15,
      "features": ["long_video", "china_optimized", "multi_shot"]
    },
    "minimax": {
      "name": "MiniMax Hailuo",
      "max_duration": 5,
      "features": ["fast_generation"]
    }
  }
}
```

### 2.4 Provider 对比

| Provider | 模型 | 最大时长 | 分辨率 | 音频 | 特点 |
|----------|------|----------|--------|------|------|
| `veo` (默认) | veo-3.1-fast-generate-preview | 8秒 | 720P/1080P | ❌ 暂不支持 | 高质量，场景模板，提示词增强 |
| `wanx` | wan2.6-i2v | 15秒 | 720P/1080P | ✅ AI生成 | 长视频，多镜头叙事 |
| `minimax` | Hailuo-2.3-Fast | 5秒 | 720P | ✅ | 快速生成 |

### 2.5 响应示例

```json
{
  "success": true,
  "data": {
    "video_url": "https://kids.jackverse.cn/media/videos/2025/12/18/xyz789.mp4",
    "duration": 5.0,
    "thumbnail_url": "https://kids.jackverse.cn/media/images/2025/12/18/abc123.png",
    "model": "veo-3.1-fast-generate-preview",
    "resolution": "720P",
    "aspect_ratio": "16:9",
    "format": "mp4",
    "has_audio": false,
    "fps": 24
  }
}
```

---

## 3. TTS 语音合成服务 (Text-to-Speech)

### 3.1 API 接口

```
POST /api/v1/tts/synthesize
GET  /api/v1/tts/voices      # 获取音色列表
GET  /api/v1/tts/config      # 获取配置选项
```

### 3.2 合成请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `text` | string | ✅ | - | 要合成的文本 |
| `voice_id` | string | ❌ | `Kore` | 音色 ID |
| `speed` | float | ❌ | `1.0` | 语速 (0.5-2.0)，部分 provider 支持 |

### 3.3 音色选项 - Gemini TTS (默认)

```json
{
  "provider": "gemini",
  "model": "gemini-2.5-flash-preview-tts",
  "default_voice": "Kore",
  "voices": [
    {
      "id": "Kore",
      "name": "Kore",
      "name_cn": "温暖女声",
      "gender": "female",
      "style": "温暖亲切",
      "description": "适合儿童故事（推荐）",
      "recommended": true,
      "use_cases": ["儿童故事", "睡前读物", "教育内容"]
    },
    {
      "id": "Leda",
      "name": "Leda",
      "name_cn": "柔和女声",
      "gender": "female",
      "style": "柔和舒缓",
      "description": "适合睡前故事",
      "use_cases": ["睡前故事", "冥想引导", "舒缓内容"]
    },
    {
      "id": "Aoede",
      "name": "Aoede",
      "name_cn": "清晰女声",
      "gender": "female",
      "style": "清晰标准",
      "description": "适合教育内容",
      "use_cases": ["教育内容", "科普讲解", "正式场合"]
    },
    {
      "id": "Puck",
      "name": "Puck",
      "name_cn": "活泼中性",
      "gender": "neutral",
      "style": "活泼有趣",
      "description": "适合趣味内容",
      "use_cases": ["趣味内容", "游戏配音", "动画角色"]
    },
    {
      "id": "Charon",
      "name": "Charon",
      "name_cn": "沉稳男声",
      "gender": "male",
      "style": "沉稳大气",
      "description": "适合旁白叙述",
      "use_cases": ["旁白叙述", "纪录片", "正式内容"]
    },
    {
      "id": "Fenrir",
      "name": "Fenrir",
      "name_cn": "深沉男声",
      "gender": "male",
      "style": "深沉有力",
      "description": "适合故事角色",
      "use_cases": ["故事角色", "戏剧配音", "父亲角色"]
    }
  ]
}
```

### 3.4 音色选项 - Qwen TTS (备选)

```json
{
  "provider": "qwen",
  "model": "qwen3-tts-flash-realtime",
  "default_voice": "Cherry",
  "voices": [
    {
      "id": "Cherry",
      "name": "Cherry",
      "name_cn": "芊悦",
      "gender": "female",
      "style": "温柔亲切",
      "description": "适合儿童故事、睡前读物（推荐）",
      "recommended": true,
      "use_cases": ["儿童故事", "睡前读物", "温馨内容"]
    },
    {
      "id": "Jennifer",
      "name": "Jennifer",
      "name_cn": "詹妮弗",
      "gender": "female",
      "style": "清晰标准",
      "description": "适合教育内容、科普讲解",
      "use_cases": ["教育内容", "科普讲解", "专业内容"]
    },
    {
      "id": "Kiki",
      "name": "Kiki",
      "name_cn": "阿清",
      "gender": "female",
      "style": "粤语女声",
      "description": "适合粤语内容",
      "use_cases": ["粤语内容", "广东地区"]
    },
    {
      "id": "Ethan",
      "name": "Ethan",
      "name_cn": "晨煦",
      "gender": "male",
      "style": "成熟稳重",
      "description": "适合叙述性内容、故事旁白",
      "use_cases": ["故事旁白", "叙述内容", "成熟角色"]
    },
    {
      "id": "Ryan",
      "name": "Ryan",
      "name_cn": "甜茶",
      "gender": "male",
      "style": "温暖亲和",
      "description": "适合父亲角色、教育引导",
      "use_cases": ["父亲角色", "教育引导", "亲和内容"]
    },
    {
      "id": "Nofish",
      "name": "Nofish",
      "name_cn": "不吃鱼",
      "gender": "male",
      "style": "活泼有趣",
      "description": "适合趣味内容、动画配音",
      "use_cases": ["趣味内容", "动画配音", "搞笑角色"]
    }
  ]
}
```

### 3.5 Provider 对比

| Provider | 模型 | 音色数量 | 语言 | 特点 | 环境变量 |
|----------|------|----------|------|------|----------|
| `gemini` (默认) | gemini-2.5-flash-preview-tts | 6 | 24语言 | 多语言，HTTP API | `TTS_PROVIDER=gemini` |
| `qwen` | qwen3-tts-flash-realtime | 6+ | 中文优化 | 中文效果好，WebSocket 实时 | `TTS_PROVIDER=qwen` |
| `minimax` | speech-02-turbo | 4+ | 中文 | 情感控制 | `TTS_PROVIDER=minimax` |

### 3.6 响应示例

```json
{
  "success": true,
  "data": {
    "audio_url": "https://kids.jackverse.cn/media/audio/2025/12/18/tts_abc123.wav",
    "duration": 4.2,
    "voice_id": "Kore",
    "model": "gemini-2.5-flash-preview-tts",
    "format": "wav",
    "sample_rate": 24000
  }
}
```

---

## 4. 前端 UI 组件建议

### 4.1 图片生成表单

```tsx
interface ImageGenerationForm {
  prompt: string;           // 文本输入框 + 字符计数 (建议限制 500 字)
  style: ImageStyle;        // 分类下拉/卡片选择 (按 category 分组)
  aspectRatio: string;      // 预设按钮组 (1:1, 16:9, 4:3, etc.)
  safeMode: boolean;        // 开关，默认 true (儿童安全模式)
}

// 风格选择器建议分组展示
interface StyleSelector {
  categories: StyleCategory[];
  selectedStyle: string;
  onSelect: (style: string) => void;
}
```

### 4.2 视频生成表单 (Veo 3.1 增强版)

```tsx
interface VideoGenerationForm {
  // 基础参数
  imageUrl: string;             // 图片预览 + 上传/选择
  prompt: string;               // 动作描述输入框
  duration: number;             // Slider 或按钮组 (4/6/8秒)
  resolution: string;           // 下拉选择 (720P/1080P)
  aspectRatio: string;          // 切换按钮: 16:9 | 9:16
  motionMode: string;           // 运动模式选择
  enableAudio: boolean;         // 音效开关 (Veo 暂不支持，可隐藏)

  // 新增 - Veo 优化参数
  sceneTemplate?: string;       // 场景模板选择器 (卡片组)
  characterIds?: string[];      // 角色选择 (多选下拉)
  referenceImages?: string[];   // 直接上传参考图 (图片上传区)
  autoEnhancePrompt: boolean;   // AI 增强开关 (默认 true)
  negativePresets?: string[];   // 负面提示词预设 (多选 Checkbox)
  lastFrameUrl?: string;        // 结束帧图片 (可选上传区)
}

// 场景模板选择器组件
interface SceneTemplateSelector {
  templates: SceneTemplate[];
  selectedTemplate?: string;
  onSelect: (templateId: string | null) => void;
}

// 角色参考图管理组件
interface CharacterReferenceManager {
  characters: Character[];           // 已注册的角色列表
  selectedCharacterIds: string[];    // 当前选中的角色
  onSelectCharacters: (ids: string[]) => void;
  onRegisterCharacter: (char: NewCharacter) => void;
}

// 根据 provider 动态限制 duration 最大值
const maxDuration = provider === 'veo' ? 8 : provider === 'wanx' ? 15 : 5;

// 当选择模板时，自动填充参数
const handleTemplateSelect = (templateId: string) => {
  const template = templates.find(t => t.id === templateId);
  if (template) {
    setDuration(template.duration);
    setResolution(template.resolution);
    // 其他参数保持用户可覆盖
  }
};
```

### 4.3 推荐的 UI 布局 (视频生成页)

```
┌─────────────────────────────────────────────────────────────────┐
│  视频生成                                                [生成] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐  ┌──────────────────────────────────┐ │
│  │    [起始图预览]      │  │  场景描述                         │ │
│  │     点击上传         │  │  ┌──────────────────────────────┐ │ │
│  └─────────────────────┘  │  │ 小兔子在森林里开心地跳舞 ...  │ │ │
│                           │  └──────────────────────────────┘ │ │
│  ┌─────────────────────┐  │                                   │ │
│  │   [结束图](可选)     │  │  场景模板 (点击选择)              │ │
│  └─────────────────────┘  │  ┌─────┐┌─────┐┌─────┐┌─────┐    │ │
│                           │  │ 🎬  ││ 💬  ││ 🔄  ││ 🏃  │    │ │
│                           │  │封面 ││对话 ││转场 ││动作 │    │ │
│                           │  └─────┘└─────┘└─────┘└─────┘    │ │
│                           └──────────────────────────────────┘ │
│                                                                 │
│  ─────────────────── 角色参考图 (可选) ───────────────────     │
│  ┌────────┐ ┌────────┐ ┌────────┐                             │
│  │ 🐰小兔子│ │ 🦊狐狸 │ │   +    │    最多选择 3 个角色        │
│  │   ✓    │ │        │ │  添加  │                             │
│  └────────┘ └────────┘ └────────┘                             │
│                                                                 │
│  ─────────────────── 高级设置 (折叠) ───────────────────       │
│  ▶ 点击展开高级设置                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**高级设置面板 (展开后)**:

```
┌─────────────────────────────────────────────────────────────────┐
│  ▼ 高级设置                                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  视频参数                                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 时长     [4秒] [6秒✓] [8秒]                              │   │
│  │ 分辨率   [720P✓] [1080P]                                 │   │
│  │ 音效     [ ] 启用 AI 音效 (暂不可用)                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  智能优化                                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [✓] AI 自动优化提示词                                    │   │
│  │     自动分析图片风格，添加镜头语言，提升视频质量            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  排除内容                                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [✓] 写实风格   [✓] 模糊画面   [ ] 快速运动               │   │
│  │ [✓] 风格突变   [ ] 镜头抖动   [ ] 暗色调                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 TTS 表单

```tsx
interface TTSForm {
  text: string;               // 多行文本输入框 + 字符计数
  voiceId: string;            // 音色卡片选择 (带试听按钮)
  speed?: number;             // Slider 0.5-2.0 (可选)
}

// 音色选择器
interface VoiceSelector {
  voices: Voice[];
  selectedVoice: string;
  onSelect: (voiceId: string) => void;
  onPreview: (voiceId: string) => void;  // 试听功能
}
```

---

## 5. 环境变量快速参考

```bash
# Provider 切换 (修改后清除缓存生效)
IMAGE_PROVIDER=gemini       # gemini | wanx | imagen | minimax
TTS_PROVIDER=gemini         # gemini | qwen | minimax
VIDEO_PROVIDER=veo          # veo | wanx | minimax

# Gemini 模型配置
GEMINI_IMAGE_MODEL=gemini-3-pro-image-preview
GEMINI_TTS_MODEL=gemini-2.5-flash-preview-tts
GEMINI_TTS_VOICE=Kore

# Veo 视频配置
VEO_MODEL=veo-3.1-fast-generate-preview
VEO_RESOLUTION=720p
VEO_DURATION=8

# Wanx 配置 (备选)
WANX_IMAGE_MODEL=wan2.6-t2i
WANX_VIDEO_MODEL=wan2.6-i2v
WANX_VIDEO_RESOLUTION=720P
WANX_VIDEO_DURATION=5
```

---

## 6. 热切换说明

后端支持运行时切换 provider，无需重启服务：

```python
# 修改 .env 文件后
from moana.config import get_settings
get_settings.cache_clear()  # 清除缓存
# 下次调用 get_*_service() 会使用新配置
```

前端无需感知 provider 切换，API 接口保持不变。不同 provider 的参数限制会通过 `/config` 接口动态返回。

---

*文档更新: 2025-12-19*
*Nano Banana Pro 支持所有图片风格*
*Veo 3.1 增强版: 场景模板 + 角色参考图 + AI 提示词优化*
