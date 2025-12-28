# 前端视频生成配置指南 - Veo 3.1 专版

> 本文档专门针对 Google Veo 3.1 视频生成服务的前端适配方案
> 更新时间: 2025-12-19

---

## 1. API 接口

### 1.1 核心接口

```
POST /api/v1/video/generate          # 生成视频
GET  /api/v1/content/video/config    # 获取配置选项
```

### 1.2 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `image_url` | string | ✅ | - | 首帧图片 URL |
| `prompt` | string | ✅ | - | 视频动作/内容描述 |
| `duration_seconds` | int | ❌ | `5` | 视频时长 (4/6/8秒) |
| `resolution` | string | ❌ | `720P` | 分辨率 (720P/1080P) |
| `aspect_ratio` | string | ❌ | `16:9` | 宽高比 (仅支持 16:9 或 9:16) |
| `motion_mode` | string | ❌ | `normal` | 运动模式 |
| `enable_audio` | bool | ❌ | `false` | 音频功能 (当前API版本暂不支持) |
| `scene_template` | string | ❌ | `null` | 场景模板 ID |
| `character_ids` | string[] | ❌ | `[]` | 角色 ID 列表 |
| `reference_images` | string[] | ❌ | `[]` | 参考图 URL (最多3张) |
| `auto_enhance_prompt` | bool | ❌ | `true` | AI 增强提示词 |
| `negative_prompt` | string | ❌ | `null` | 负面提示词 |
| `last_frame_url` | string | ❌ | `null` | 结束帧图片 URL |

---

## 2. 配置选项详解

### 2.1 时长选项 (duration_seconds)

Veo 3.1 支持 4-8 秒视频生成:

```json
{
  "durations": [
    {"value": 4, "label": "4秒", "description": "快速预览，封面微动"},
    {"value": 5, "label": "5秒", "description": "标准时长", "default": true},
    {"value": 6, "label": "6秒", "description": "角色对话"},
    {"value": 8, "label": "8秒", "description": "完整动画", "max": true}
  ]
}
```

**前端 UI**: 使用按钮组 `[4秒] [5秒] [6秒] [8秒]`

### 2.2 分辨率选项 (resolution)

```json
{
  "resolutions": [
    {"value": "720P", "label": "720P 高清", "pixels": "1280x720", "recommended": true, "description": "生成速度快，适合预览"},
    {"value": "1080P", "label": "1080P 全高清", "pixels": "1920x1080", "description": "更高画质，生成时间较长"}
  ]
}
```

**前端 UI**: 使用单选按钮 `[720P 推荐] [1080P]`

### 2.3 宽高比选项 (aspect_ratio)

Veo 3.1 仅支持 2 种宽高比:

```json
{
  "aspect_ratios": [
    {"value": "16:9", "label": "横屏 16:9", "description": "视频、电影、绘本动画", "icon": "📺", "recommended": true, "default": true},
    {"value": "9:16", "label": "竖屏 9:16", "description": "手机、短视频、抖音", "icon": "📱"}
  ]
}
```

**前端 UI**: 使用切换按钮 `[📺 横屏 16:9] [📱 竖屏 9:16]`

### 2.4 运动模式 (motion_mode)

```json
{
  "motion_modes": [
    {"value": "static", "label": "静态", "description": "几乎无运动，适合封面展示", "icon": "🖼️"},
    {"value": "slow", "label": "缓慢", "description": "轻微运动，呼吸感，氛围感", "icon": "🌊"},
    {"value": "normal", "label": "正常", "description": "自然运动，平衡选择", "icon": "▶️", "recommended": true},
    {"value": "dynamic", "label": "动态", "description": "较多运动，适合动作场景", "icon": "🏃"},
    {"value": "cinematic", "label": "电影感", "description": "电影级镜头运动，推拉摇移", "icon": "🎬"}
  ]
}
```

**前端 UI**: 使用卡片选择器，每个选项显示图标+名称+描述

---

## 3. 场景模板 (scene_template) - 推荐功能

场景模板是预设的参数组合，一键应用最佳配置，显著提升用户体验:

```json
{
  "scene_templates": [
    {
      "id": "cover_subtle",
      "name": "封面微动",
      "icon": "🎬",
      "description": "轻微呼吸感，适合封面和标题页",
      "preset": {
        "duration": 4,
        "resolution": "1080p",
        "motion_mode": "slow"
      }
    },
    {
      "id": "character_dialogue",
      "name": "角色对话",
      "icon": "💬",
      "description": "角色轻微动作和表情变化",
      "preset": {
        "duration": 6,
        "resolution": "720p",
        "motion_mode": "normal"
      }
    },
    {
      "id": "scene_transition",
      "name": "场景转换",
      "icon": "🔄",
      "description": "场景推进，带镜头运动",
      "preset": {
        "duration": 6,
        "resolution": "720p",
        "motion_mode": "cinematic"
      }
    },
    {
      "id": "action_scene",
      "name": "动作场景",
      "icon": "🏃",
      "description": "丰富动作，适合高潮情节",
      "preset": {
        "duration": 8,
        "resolution": "720p",
        "motion_mode": "dynamic"
      }
    },
    {
      "id": "emotional_moment",
      "name": "情感特写",
      "icon": "💖",
      "description": "角色表情细腻变化，特写镜头",
      "preset": {
        "duration": 6,
        "resolution": "1080p",
        "motion_mode": "slow"
      }
    }
  ]
}
```

**前端逻辑**:
```javascript
// 选择模板后自动填充参数
const handleTemplateSelect = (templateId) => {
  const template = templates.find(t => t.id === templateId);
  if (template) {
    setDuration(template.preset.duration);
    setResolution(template.preset.resolution);
    setMotionMode(template.preset.motion_mode);
  }
};
```

---

## 4. 角色参考图管理 - Veo 3.1 核心优化

### 4.1 参考图配置

Veo 3.1 支持最多 3 张参考图保持角色一致性:

```json
{
  "reference_images_config": {
    "max_count": 3,
    "supported_formats": ["png", "jpg", "jpeg", "webp"],
    "max_size_mb": 10,
    "recommended_resolution": "1024x1024"
  }
}
```

### 4.2 方式一: 角色库 (推荐)

```javascript
// 注册角色到角色库
POST /api/v1/characters/register
{
  "character_id": "bunny_main",
  "name": "小兔子",
  "description": "白色小兔子，粉色耳朵，穿蓝色背带裤",
  "image_urls": [
    "https://example.com/bunny_front.png",    // 正面
    "https://example.com/bunny_side.png",     // 侧面
    "https://example.com/bunny_happy.png"     // 表情
  ]
}

// 生成视频时引用角色
POST /api/v1/video/generate
{
  "image_url": "scene_01.png",
  "prompt": "小兔子开心地跳舞",
  "character_ids": ["bunny_main"]  // 自动获取参考图
}
```

### 4.3 方式二: 直接上传参考图

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

### 4.4 多角色分配规则

| 场景角色数 | 参考图分配策略 |
|-----------|---------------|
| 1 个角色 | 该角色使用全部 3 张配额 |
| 2 个角色 | 主角 2 张 + 配角 1 张 |
| 3+ 个角色 | 每角色 1 张 (最多 3 个角色) |

---

## 5. AI 提示词增强 (auto_enhance_prompt)

### 5.1 配置

```json
{
  "auto_enhance_prompt": {
    "enabled": true,
    "description": "AI自动优化提示词，提升视频质量"
  }
}
```

### 5.2 工作原理

1. **风格分析**: 系统分析输入图片风格 (watercolor, cartoon, 3d等)
2. **风格保持**: 自动添加风格保持词 (如 "soft watercolor painting style")
3. **镜头语言**: 自动添加镜头语言 (如 "slow cinematic pan, smooth motion")
4. **负面排除**: 自动生成负面提示词 (如 "realistic, 3d, blur, style change")

### 5.3 前端 UI

```
┌──────────────────────────────────────────────────────┐
│ [✓] AI 自动优化提示词                                 │
│     自动分析图片风格，添加镜头语言，提升视频质量         │
│     ▷ 查看优化后的提示词 (展开预览)                    │
└──────────────────────────────────────────────────────┘
```

**展开后显示**:
```
原始提示词: 小兔子在森林里跳舞
优化后提示词: 小兔子在森林里跳舞, soft watercolor painting style,
              smooth character animation, gentle forest ambiance,
              slow cinematic pan, consistent lighting
```

---

## 6. 负面提示词预设 (negative_prompt)

### 6.1 预设选项

```json
{
  "negative_prompt_presets": [
    {"id": "realistic", "label": "写实风格", "value": "realistic, photographic, photo-real, lifelike"},
    {"id": "blur", "label": "模糊画面", "value": "blur, out of focus, blurry, unfocused"},
    {"id": "style_change", "label": "风格突变", "value": "style change, inconsistent style, style shift"},
    {"id": "shaky", "label": "镜头抖动", "value": "camera shake, jerky motion, unstable, shaky cam"},
    {"id": "dark", "label": "暗色调", "value": "dark, dimly lit, shadowy, low key lighting"},
    {"id": "fast", "label": "快速运动", "value": "fast motion, rapid movement, speed blur"},
    {"id": "distortion", "label": "变形扭曲", "value": "distortion, warped, stretched, morphing artifacts"}
  ]
}
```

### 6.2 前端 UI: 多选 Checkbox

```
排除内容 (可选多个):
┌────────────────────────────────────────────────────────────┐
│ [✓] 写实风格    [✓] 模糊画面    [ ] 快速运动               │
│ [✓] 风格突变    [ ] 镜头抖动    [ ] 暗色调                 │
│ [ ] 变形扭曲                                               │
└────────────────────────────────────────────────────────────┘
```

**推荐默认勾选**: 写实风格、模糊画面、风格突变

---

## 7. 音效配置 (enable_audio)

### 7.1 当前状态

> **注意**: Veo 3.1 API 当前版本暂不支持 `generate_audio` 参数，音频功能尚未开放。

```json
{
  "audio_options": {
    "native_support": false,
    "description": "当前 API 版本暂不支持音频生成，生成的视频为静音",
    "future_support": "Google 可能在后续 API 版本中开放此功能"
  }
}
```

### 7.2 前端 UI 建议

暂时隐藏音效选项，或显示为不可用状态:

```
音效设置:
[ ] 启用 AI 音效 (暂不可用)
    该功能尚未开放，生成的视频暂时为静音
```

### 7.3 后续处理

生成的静音视频可以:
1. 使用 TTS 服务添加旁白配音
2. 使用外部音乐/音效后期合成
3. 等待 Google 开放音频功能后更新

---

## 8. 完整 TypeScript 接口定义

```typescript
// types/video.ts

/** 视频生成请求参数 */
interface VideoGenerateRequest {
  // 必填参数
  image_url: string;
  prompt: string;

  // 基础参数
  duration_seconds?: 4 | 5 | 6 | 8;  // 默认 5
  resolution?: '720P' | '1080P';      // 默认 720P
  aspect_ratio?: '16:9' | '9:16';  // 默认 16:9，仅支持这 2 种
  motion_mode?: 'static' | 'slow' | 'normal' | 'dynamic' | 'cinematic';  // 默认 normal
  enable_audio?: boolean;  // 暂不支持，API 会忽略此参数

  // Veo 3.1 增强参数
  scene_template?: string;           // 场景模板 ID
  character_ids?: string[];          // 角色 ID 列表 (角色库方式)
  reference_images?: string[];       // 参考图 URL (直接方式, 最多3张)
  auto_enhance_prompt?: boolean;     // AI 增强提示词, 默认 true
  negative_prompt?: string;          // 负面提示词
  last_frame_url?: string;           // 结束帧图片 URL
}

/** 场景模板 */
interface SceneTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  preset: {
    duration: number;
    resolution: string;
    motion_mode: string;
  };
}

/** 角色定义 */
interface Character {
  character_id: string;
  name: string;
  description: string;
  image_urls: string[];  // 最多3张
}

/** 负面提示词预设 */
interface NegativePreset {
  id: string;
  label: string;
  value: string;
}

/** 视频生成响应 */
interface VideoGenerateResponse {
  success: boolean;
  data: {
    video_url: string;
    duration: number;
    thumbnail_url: string;
    model: 'veo-3.1-fast-generate-preview';
    resolution: string;
    aspect_ratio: string;
    format: 'mp4';
    has_audio: boolean;  // 当前版本始终为 false
    fps: number;
    enhanced_prompt?: string;  // 增强后的提示词
  };
}
```

---

## 9. 前端组件设计

### 9.1 视频生成表单组件

```tsx
// components/VideoGenerationForm.tsx

interface VideoGenerationFormProps {
  onSubmit: (params: VideoGenerateRequest) => Promise<void>;
  characters?: Character[];  // 已注册的角色列表
}

interface VideoGenerationFormState {
  // 基础参数
  imageUrl: string;
  prompt: string;
  duration: number;
  resolution: string;
  aspectRatio: string;
  motionMode: string;
  enableAudio: boolean;

  // Veo 3.1 优化参数
  sceneTemplate: string | null;
  selectedCharacterIds: string[];
  referenceImages: string[];
  autoEnhancePrompt: boolean;
  selectedNegativePresets: string[];
  lastFrameUrl: string | null;

  // UI 状态
  showAdvancedSettings: boolean;
}
```

### 9.2 推荐 UI 布局

```
┌─────────────────────────────────────────────────────────────────┐
│  🎬 视频生成                                           [生成] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐  ┌──────────────────────────────────┐ │
│  │    📷 起始图预览     │  │  场景描述                         │ │
│  │                     │  │  ┌──────────────────────────────┐ │ │
│  │   [点击上传图片]     │  │  │ 描述视频内容和动作...         │ │ │
│  │                     │  │  └──────────────────────────────┘ │ │
│  └─────────────────────┘  │                                   │ │
│                           │  场景模板 (快速配置)               │ │
│  ┌─────────────────────┐  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐     │ │
│  │  📷 结束图 (可选)    │  │  │ 🎬 │ │ 💬 │ │ 🔄 │ │ 🏃 │     │ │
│  │                     │  │  │封面│ │对话│ │转场│ │动作│     │ │
│  │   [点击上传]         │  │  └────┘ └────┘ └────┘ └────┘     │ │
│  └─────────────────────┘  └──────────────────────────────────┘ │
│                                                                 │
│  ─────────────────── 角色参考图 (保持角色一致) ─────────────── │
│  ┌────────┐ ┌────────┐ ┌────────┐                             │
│  │ 🐰     │ │ 🦊     │ │   +    │    最多选择 3 个角色        │
│  │ 小兔子  │ │ 狐狸   │ │  添加  │                             │
│  │   ✓    │ │        │ │       │                             │
│  └────────┘ └────────┘ └────────┘                             │
│                                                                 │
│  ─────────────────── 基础设置 ──────────────────────────────  │
│  时长:     [4秒] [5秒✓] [6秒] [8秒]                            │
│  分辨率:   [720P✓] [1080P]                                    │
│  宽高比:   [📺 横屏 16:9 ✓] [📱 竖屏 9:16]                     │
│                                                                 │
│  ▶ 高级设置                                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.3 高级设置面板

```
┌─────────────────────────────────────────────────────────────────┐
│  ▼ 高级设置                                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  运动模式                                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [🖼️静态] [🌊缓慢] [▶️正常✓] [🏃动态] [🎬电影]            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  音效                                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [✓] 启用 AI 音效                                         │   │
│  │     Veo 3.1 根据画面生成环境音效和动作音效                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  智能优化                                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [✓] AI 自动优化提示词                                    │   │
│  │     自动分析图片风格，添加镜头语言，提升视频质量            │   │
│  │     ▷ 预览优化后的提示词                                  │   │
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

---

## 10. 前端实现示例

### 10.1 API 调用封装

```javascript
// api/video.js

const API_BASE = 'https://kids.jackverse.cn/api/v1';

/**
 * 生成视频
 */
export async function generateVideo(params) {
  const response = await fetch(`${API_BASE}/video/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error('视频生成失败');
  }

  return response.json();
}

/**
 * 获取视频配置选项
 */
export async function getVideoConfig() {
  const response = await fetch(`${API_BASE}/content/video/config`);
  return response.json();
}

/**
 * 注册角色到角色库
 */
export async function registerCharacter(character) {
  const response = await fetch(`${API_BASE}/characters/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(character)
  });

  return response.json();
}
```

### 10.2 表单提交逻辑

```javascript
// 处理表单提交
async function handleSubmit() {
  // 构建请求参数
  const params = {
    image_url: imageUrl,
    prompt: prompt,
    duration_seconds: duration,
    resolution: resolution,
    aspect_ratio: aspectRatio,
    motion_mode: motionMode,
    enable_audio: enableAudio,
    auto_enhance_prompt: autoEnhancePrompt
  };

  // 添加场景模板 (如果选择)
  if (sceneTemplate) {
    params.scene_template = sceneTemplate;
  }

  // 添加角色参考图
  if (selectedCharacterIds.length > 0) {
    params.character_ids = selectedCharacterIds;
  } else if (referenceImages.length > 0) {
    params.reference_images = referenceImages;
  }

  // 构建负面提示词
  if (selectedNegativePresets.length > 0) {
    const negativePrompts = selectedNegativePresets
      .map(id => NEGATIVE_PRESETS.find(p => p.id === id)?.value)
      .filter(Boolean)
      .join(', ');
    params.negative_prompt = negativePrompts;
  }

  // 添加结束帧 (如果有)
  if (lastFrameUrl) {
    params.last_frame_url = lastFrameUrl;
  }

  // 提交请求
  setLoading(true);
  try {
    const result = await generateVideo(params);
    // 处理结果...
  } catch (error) {
    showError('视频生成失败，请重试');
  } finally {
    setLoading(false);
  }
}
```

### 10.3 场景模板选择处理

```javascript
// 场景模板数据
const SCENE_TEMPLATES = [
  {
    id: 'cover_subtle',
    name: '封面微动',
    icon: '🎬',
    description: '轻微呼吸感，适合封面',
    preset: { duration: 4, resolution: '1080p', motion_mode: 'slow' }
  },
  {
    id: 'character_dialogue',
    name: '角色对话',
    icon: '💬',
    description: '角色轻微动作和表情',
    preset: { duration: 6, resolution: '720p', motion_mode: 'normal' }
  },
  {
    id: 'scene_transition',
    name: '场景转换',
    icon: '🔄',
    description: '场景推进，镜头运动',
    preset: { duration: 6, resolution: '720p', motion_mode: 'cinematic' }
  },
  {
    id: 'action_scene',
    name: '动作场景',
    icon: '🏃',
    description: '丰富动作，高潮情节',
    preset: { duration: 8, resolution: '720p', motion_mode: 'dynamic' }
  },
  {
    id: 'emotional_moment',
    name: '情感特写',
    icon: '💖',
    description: '表情细腻变化',
    preset: { duration: 6, resolution: '1080p', motion_mode: 'slow' }
  }
];

// 选择模板后自动应用预设
function handleTemplateSelect(templateId) {
  const template = SCENE_TEMPLATES.find(t => t.id === templateId);
  if (template) {
    setSceneTemplate(templateId);
    setDuration(template.preset.duration);
    setResolution(template.preset.resolution);
    setMotionMode(template.preset.motion_mode);
  } else {
    // 清除模板选择
    setSceneTemplate(null);
  }
}
```

---

## 11. 响应处理

### 11.1 成功响应

```json
{
  "success": true,
  "data": {
    "video_url": "https://kids.jackverse.cn/media/videos/2025/12/19/xyz789.mp4",
    "duration": 6.0,
    "thumbnail_url": "https://kids.jackverse.cn/media/images/2025/12/19/thumb.png",
    "model": "veo-3.1-fast-generate-preview",
    "resolution": "720P",
    "aspect_ratio": "16:9",
    "format": "mp4",
    "has_audio": false,
    "fps": 24,
    "enhanced_prompt": "小兔子在森林里跳舞, soft watercolor painting style, smooth character animation..."
  }
}
```

### 11.2 前端处理

```javascript
// 处理生成结果
function handleGenerateResult(result) {
  if (result.success) {
    // 显示视频预览
    setVideoUrl(result.data.video_url);
    setThumbnail(result.data.thumbnail_url);

    // 显示增强后的提示词 (如果有)
    if (result.data.enhanced_prompt) {
      setEnhancedPrompt(result.data.enhanced_prompt);
    }

    // 显示成功提示
    showToast('视频生成成功！');
  }
}
```

---

## 12. 性能优化建议

### 12.1 参数默认值

```javascript
const DEFAULT_PARAMS = {
  duration_seconds: 5,
  resolution: '720P',
  aspect_ratio: '16:9',
  motion_mode: 'normal',
  enable_audio: true,
  auto_enhance_prompt: true
};

const DEFAULT_NEGATIVE_PRESETS = ['realistic', 'blur', 'style_change'];
```

### 12.2 生成时间预估

| 配置 | 预估时间 |
|------|---------|
| 4秒 720P | ~30秒 |
| 5秒 720P | ~40秒 |
| 6秒 720P | ~50秒 |
| 8秒 720P | ~70秒 |
| 6秒 1080P | ~90秒 |
| 8秒 1080P | ~120秒 |

**前端建议**: 显示进度条和预估时间，避免用户等待焦虑

---

## 13. 快速配置参考

### 13.1 绘本封面

```json
{
  "duration_seconds": 4,
  "resolution": "1080P",
  "aspect_ratio": "9:16",
  "motion_mode": "slow",
  "scene_template": "cover_subtle"
}
```

### 13.2 故事内页

```json
{
  "duration_seconds": 6,
  "resolution": "720P",
  "aspect_ratio": "16:9",
  "motion_mode": "normal",
  "scene_template": "character_dialogue"
}
```

### 13.3 动作场景

```json
{
  "duration_seconds": 8,
  "resolution": "720P",
  "aspect_ratio": "16:9",
  "motion_mode": "dynamic",
  "scene_template": "action_scene"
}
```

---

*文档版本: 1.0*
*更新时间: 2025-12-19*
*专为 Veo 3.1 优化*
