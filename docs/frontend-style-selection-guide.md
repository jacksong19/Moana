# 内容风格选择功能 - 前端开发指南

> 让家长在生成内容前选择美术风格、主角设定、音乐情绪、TTS音色、视频参数等，提升内容质量和个性化体验

## 一、功能定位

### 产品目标
- 解决 AI 生图风格不一致的问题
- 让家长参与创作过程，增加仪式感
- 提供差异化的内容体验

### 用户流程

```
选择主题 → 选择风格（可选） → 生成内容
              ↑
         新增风格选择页
```

---

## 二、统一的风格选项 API

### 获取所有风格选项

**端点**: `GET /api/v1/content/style-options`

**响应**:
```json
{
  "art_styles": [...],
  "protagonists": [...],
  "color_palettes": [...],
  "accessories": [...],
  "music_moods": [...],
  "video_motion_styles": [...],
  "tts_voices": [...],
  "video_options": {...}
}
```

### 响应字段详解

#### 1. 美术风格 (art_styles)
用于绘本插图和儿歌封面的美术风格。

```json
{
  "art_styles": [
    {
      "id": "pixar_3d",
      "name": "皮克斯3D",
      "name_en": "Pixar 3D",
      "description": "使用皮克斯3D风格绘制",
      "preview_url": "https://kids.jackverse.cn/static/styles/pixar_3d.jpg",
      "recommended": true
    },
    {"id": "watercolor", "name": "水彩手绘", ...},
    {"id": "flat_vector", "name": "扁平插画", ...},
    {"id": "crayon", "name": "蜡笔涂鸦", ...},
    {"id": "anime", "name": "日系动漫", ...}
  ]
}
```

#### 2. 主角动物 (protagonists)

```json
{
  "protagonists": [
    {
      "animal": "bunny",
      "name": "小兔子",
      "default_color": "white",
      "default_accessory": "blue overalls",
      "preview_url": "https://kids.jackverse.cn/static/characters/bunny.jpg"
    },
    {"animal": "bear", "name": "小熊", ...},
    {"animal": "cat", "name": "小猫", ...},
    {"animal": "dog", "name": "小狗", ...},
    {"animal": "panda", "name": "小熊猫", ...},
    {"animal": "fox", "name": "小狐狸", ...}
  ]
}
```

#### 3. 色彩风格 (color_palettes)

```json
{
  "color_palettes": [
    {"id": "pastel", "name": "马卡龙色", "description": "柔和温馨", "colors": ["#FFB5BA", "#B5D8FF", "#C5F0A4", "#FFF5BA"]},
    {"id": "vibrant", "name": "活力鲜艳", "description": "明快活泼", ...},
    {"id": "warm", "name": "暖暖阳光", "description": "温暖舒适", ...},
    {"id": "cool", "name": "清新冷调", "description": "清爽宁静", ...},
    {"id": "monochrome", "name": "简约单色", "description": "优雅简洁", ...}
  ]
}
```

#### 4. 配饰 (accessories)

```json
{
  "accessories": [
    {"id": "blue_overalls", "name": "蓝色背带裤", "name_en": "blue overalls"},
    {"id": "red_scarf", "name": "红色围巾", ...},
    {"id": "yellow_raincoat", "name": "黄色雨衣", ...},
    ...
  ]
}
```

#### 5. 音乐情绪 (music_moods)

```json
{
  "music_moods": [
    {"id": "cheerful", "name": "欢快活泼", "description": "适合日常活动主题"},
    {"id": "gentle", "name": "温柔舒缓", "description": "适合睡前或安静时刻"},
    {"id": "playful", "name": "调皮有趣", "description": "适合游戏互动主题"},
    {"id": "lullaby", "name": "摇篮曲", "description": "适合哄睡"},
    {"id": "educational", "name": "教育启蒙", "description": "适合认知学习主题"}
  ]
}
```

#### 6. TTS 音色 (tts_voices) - 新增

用于绘本朗读的语音音色。

```json
{
  "tts_voices": [
    {
      "id": "Cherry",
      "name": "Cherry",
      "name_cn": "樱桃",
      "gender": "female",
      "style": "温柔亲切",
      "description": "适合儿童故事、睡前读物",
      "recommended": true
    },
    {"id": "Serena", "name_cn": "思睿", "gender": "female", "style": "知性优雅", "description": "适合教育内容、科普讲解"},
    {"id": "Chelsie", "name_cn": "晨曦", "gender": "female", "style": "活泼可爱", "description": "适合儿歌、互动游戏"},
    {"id": "Brittany", "name_cn": "贝蒂", "gender": "female", "style": "甜美清新", "description": "适合童话故事、角色扮演"},
    {"id": "Ethan", "name_cn": "伊森", "gender": "male", "style": "成熟稳重", "description": "适合叙述性内容、故事旁白"},
    {"id": "Luke", "name_cn": "卢克", "gender": "male", "style": "温暖亲和", "description": "适合父亲角色、教育引导"},
    {"id": "Stella", "name_cn": "星星", "gender": "child", "style": "童真可爱", "description": "适合儿童对话、角色配音"}
  ]
}
```

#### 7. 视频生成选项 (video_options) - 新增

```json
{
  "video_options": {
    "models": [
      {
        "id": "wan2.6-i2v",
        "description": "最新有声版，支持多镜头叙事",
        "resolutions": ["720P", "1080P"],
        "durations": [5, 10, 15],
        "has_audio": true,
        "shot_types": ["single", "multi"],
        "recommended": true
      },
      {
        "id": "wan2.5-i2v-preview",
        "description": "有声预览版",
        "resolutions": ["480P", "720P", "1080P"],
        "durations": [5, 10],
        "has_audio": true,
        "shot_types": ["single"]
      },
      {
        "id": "wan2.2-i2v-flash",
        "description": "极速版（无声）",
        "resolutions": ["480P", "720P"],
        "durations": [5],
        "has_audio": false
      },
      {
        "id": "wan2.2-i2v-plus",
        "description": "专业版（无声）",
        "resolutions": ["480P", "720P", "1080P"],
        "durations": [5, 10],
        "has_audio": false
      }
    ],
    "resolutions": [
      {"id": "480P", "name": "480P 标清", "sizes": ["832*480", "480*832", "624*624"]},
      {"id": "720P", "name": "720P 高清", "sizes": ["1280*720", "720*1280", "960*960"]},
      {"id": "1080P", "name": "1080P 全高清", "sizes": ["1920*1080", "1080*1920", "1440*1440"]}
    ],
    "durations": [
      {"value": 5, "label": "5秒"},
      {"value": 10, "label": "10秒"},
      {"value": 15, "label": "15秒（仅wan2.6支持）"}
    ],
    "shot_types": [
      {"id": "single", "name": "单镜头", "description": "单一场景连贯运动"},
      {"id": "multi", "name": "多镜头", "description": "多镜头叙事（仅wan2.6支持）"}
    ]
  }
}
```

---

## 三、各内容类型的 API 变更

### 1. 绘本生成接口（异步）

**端点**: `POST /api/v1/content/picture-book/async`

**请求参数**:
```typescript
interface PictureBookRequest {
  // 原有参数
  child_name: string;           // 孩子名字
  age_months: number;           // 年龄（月）
  theme_topic: string;          // 主题，如"刷牙"
  theme_category: "habit" | "cognition";  // 主题类别
  favorite_characters?: string[]; // 喜欢的角色（可选）

  // ===== 风格参数 =====
  voice_id?: string;            // TTS 声音ID（可选，默认 Cherry）
  art_style?: ArtStyle;         // 美术风格（可选，默认 pixar_3d）
  protagonist?: Protagonist;    // 主角设定（可选，默认小白兔）
  color_palette?: ColorPalette; // 色彩风格（可选，默认 pastel）
}

type ArtStyle = "pixar_3d" | "watercolor" | "flat_vector" | "crayon" | "anime";

interface Protagonist {
  animal: "bunny" | "bear" | "cat" | "dog" | "panda" | "fox";
  color: string;              // 如 "white", "brown", "orange"
  accessory?: string;         // 如 "blue overalls", "red scarf"
}

type ColorPalette = "pastel" | "vibrant" | "warm" | "cool" | "monochrome";
```

**示例请求**:
```json
{
  "child_name": "玥玥",
  "age_months": 36,
  "theme_topic": "刷牙",
  "theme_category": "habit",
  "voice_id": "Stella",
  "art_style": "watercolor",
  "protagonist": {
    "animal": "bear",
    "color": "brown",
    "accessory": "red scarf"
  },
  "color_palette": "warm"
}
```

---

### 2. 儿歌生成接口（异步）

**端点**: `POST /api/v1/content/nursery-rhyme/async`

**请求参数**:
```typescript
interface NurseryRhymeRequest {
  // 原有参数
  child_name: string;
  age_months: number;
  theme_topic: string;
  theme_category: "habit" | "cognition";
  favorite_characters?: string[];

  // ===== 风格参数 =====
  music_mood?: MusicMood;       // 音乐情绪
  art_style?: ArtStyle;         // 封面美术风格
  protagonist?: Protagonist;    // 封面主角设定
  color_palette?: ColorPalette; // 封面色彩风格
}

type MusicMood = "cheerful" | "gentle" | "playful" | "lullaby" | "educational";
```

**示例请求**:
```json
{
  "child_name": "玥玥",
  "age_months": 36,
  "theme_topic": "洗手",
  "theme_category": "habit",
  "music_mood": "playful",
  "art_style": "pixar_3d",
  "protagonist": {
    "animal": "bunny",
    "color": "white",
    "accessory": "blue overalls"
  },
  "color_palette": "vibrant"
}
```

---

### 3. 视频生成接口

**端点**: `POST /api/v1/content/video`

**请求参数**:
```typescript
interface VideoRequest {
  picture_book: dict;           // 绘本数据（已包含风格）
  child_name?: string;
  theme_topic?: string;
  theme_category?: string;

  // ===== 视频参数 =====
  motion_style?: MotionStyle;   // 视频动效风格（简化版）

  // 高级参数（使用 wanx video_options）
  video_model?: string;         // 视频模型 (wan2.6-i2v 等)
  resolution?: string;          // 分辨率 (480P/720P/1080P)
  duration?: number;            // 时长 (5/10/15 秒)
  shot_type?: string;           // 镜头类型 (single/multi)
  enable_audio?: boolean;       // 是否自动配音
}

type MotionStyle = "gentle" | "dynamic" | "static";
```

**示例请求**:
```json
{
  "picture_book": { /* 绘本数据 */ },
  "video_model": "wan2.6-i2v",
  "resolution": "720P",
  "duration": 10,
  "shot_type": "multi",
  "enable_audio": true
}
```

---

## 四、前端页面设计建议

### 1. 绘本风格选择页

```
┌─────────────────────────────────────────┐
│  选择绘本风格                            │
│                                         │
│  🎨 美术风格                            │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │ 3D  │ │水彩 │ │扁平 │ │蜡笔 │      │
│  └──✓──┘ └─────┘ └─────┘ └─────┘      │
│                                         │
│  🐰 选择主角                            │
│  ┌─────┐ ┌─────┐ ┌─────┐               │
│  │小兔子│ │小熊 │ │小猫 │ ...           │
│  └──✓──┘ └─────┘ └─────┘               │
│                                         │
│  🎨 色彩风格                            │
│  ○ 马卡龙色 ████████                   │
│  ● 活力鲜艳 ████████  ← 当前           │
│                                         │
│  🔊 朗读音色                            │
│  ┌─────────┐ ┌─────────┐               │
│  │ 🍒 樱桃  │ │ ⭐ 星星  │ ...          │
│  │ 温柔亲切 │ │ 童真可爱 │               │
│  └────✓────┘ └─────────┘               │
│                                         │
│  [开始生成]                             │
└─────────────────────────────────────────┘
```

### 2. 儿歌风格选择页

```
┌─────────────────────────────────────────┐
│  🎵 选择音乐风格                         │
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ 😊      │ │ 😌      │ │ 😜      │   │
│  │欢快活泼 │ │温柔舒缓 │ │调皮有趣 │   │
│  └────✓────┘ └─────────┘ └─────────┘   │
│                                         │
│  ┌─────────┐ ┌─────────┐               │
│  │ 😴      │ │ 📚      │               │
│  │摇篮曲   │ │教育启蒙 │               │
│  └─────────┘ └─────────┘               │
│                                         │
│  🎨 封面风格（同绘本）                   │
│  ...                                    │
└─────────────────────────────────────────┘
```

### 3. 视频生成选项页

```
┌─────────────────────────────────────────┐
│  🎬 视频生成设置                         │
│                                         │
│  📹 视频模型                            │
│  ● wan2.6-i2v（推荐）- 有声+多镜头      │
│  ○ wan2.5-i2v-preview - 有声预览版      │
│  ○ wan2.2-i2v-flash - 极速无声          │
│                                         │
│  📐 分辨率                              │
│  ○ 480P 标清                           │
│  ● 720P 高清                           │
│  ○ 1080P 全高清                        │
│                                         │
│  ⏱️ 时长                                │
│  ● 5秒  ○ 10秒  ○ 15秒                 │
│                                         │
│  🎥 镜头类型                            │
│  ● 单镜头 - 连贯运动                    │
│  ○ 多镜头 - 叙事剪辑（仅wan2.6）        │
│                                         │
│  🔊 自动配音                            │
│  [✓] 启用视频自动配音                   │
│                                         │
│  [开始生成]                             │
└─────────────────────────────────────────┘
```

---

## 五、前端开发任务清单

### Phase 1: 基础功能 (MVP)
- [ ] 调用 `GET /style-options` 获取选项
- [ ] 新增绘本风格选择页面组件
- [ ] 新增 TTS 音色选择组件
- [ ] 修改绘本生成请求，传递风格参数
- [ ] 默认值处理（不选则使用默认风格）

### Phase 2: 儿歌风格
- [ ] 新增儿歌风格选择页面
- [ ] 音乐情绪选择组件
- [ ] 封面风格选择（可复用绘本组件）

### Phase 3: 视频生成
- [ ] 新增视频生成选项页面
- [ ] 视频模型/分辨率/时长选择
- [ ] 镜头类型选择（单镜头/多镜头）
- [ ] 自动配音开关

### Phase 4: 高级功能
- [ ] 收藏常用风格组合
- [ ] 历史风格记忆
- [ ] 角色自定义（颜色/配饰下拉）

---

## 六、默认值说明

所有新增参数都是**可选的**，不传则使用以下默认值：

| 参数 | 默认值 | 说明 |
|------|--------|------|
| art_style | pixar_3d | 皮克斯3D风格（推荐） |
| protagonist.animal | bunny | 小兔子 |
| protagonist.color | white | 白色 |
| protagonist.accessory | blue overalls | 蓝色背带裤 |
| color_palette | pastel | 马卡龙色 |
| voice_id | Cherry | 樱桃音色（温柔亲切） |
| music_mood | cheerful | 欢快活泼 |
| video_model | wan2.6-i2v | 最新有声版 |
| resolution | 720P | 高清 |
| duration | 5 | 5秒 |
| shot_type | single | 单镜头 |
| enable_audio | true | 启用自动配音 |

---

## 七、注意事项

1. **向后兼容**: 所有新参数都是可选的，旧请求格式仍然有效
2. **预览图**: 需要设计师提供各风格的预览图上传到静态资源
3. **性能**: 风格选项数据可以缓存，不需要每次请求
4. **埋点**: 建议记录用户风格偏好，用于后续推荐
5. **视频模型限制**:
   - wan2.6-i2v: 仅支持 720P/1080P，时长最长 15 秒
   - wan2.5-i2v-preview: 支持 480P/720P/1080P，时长最长 10 秒
   - 多镜头叙事 (shot_type: multi) 仅 wan2.6-i2v 支持

---

## 八、TypeScript 类型定义

```typescript
// 风格选项类型
interface StyleOptions {
  art_styles: ArtStyleOption[];
  protagonists: ProtagonistOption[];
  color_palettes: ColorPaletteOption[];
  accessories: AccessoryOption[];
  music_moods: MusicMoodOption[];
  video_motion_styles: MotionStyleOption[];
  tts_voices: TTSVoiceOption[];
  video_options: VideoOptions;
}

interface ArtStyleOption {
  id: string;
  name: string;
  name_en: string;
  description: string;
  preview_url: string;
  recommended: boolean;
}

interface ProtagonistOption {
  animal: string;
  name: string;
  default_color: string;
  default_accessory: string;
  preview_url: string;
}

interface ColorPaletteOption {
  id: string;
  name: string;
  description: string;
  colors: string[];
}

interface AccessoryOption {
  id: string;
  name: string;
  name_en: string;
}

interface MusicMoodOption {
  id: string;
  name: string;
  description: string;
}

interface MotionStyleOption {
  id: string;
  name: string;
  description: string;
}

interface TTSVoiceOption {
  id: string;
  name: string;
  name_cn: string;
  gender: "female" | "male" | "child";
  style: string;
  description: string;
  recommended: boolean;
}

interface VideoOptions {
  models: VideoModelOption[];
  resolutions: ResolutionOption[];
  durations: DurationOption[];
  shot_types: ShotTypeOption[];
}

interface VideoModelOption {
  id: string;
  description: string;
  resolutions: string[];
  durations: number[];
  has_audio: boolean;
  shot_types: string[];
  recommended: boolean;
}

interface ResolutionOption {
  id: string;
  name: string;
  sizes: string[];
}

interface DurationOption {
  value: number;
  label: string;
}

interface ShotTypeOption {
  id: string;
  name: string;
  description: string;
}

// 请求类型
interface ProtagonistConfig {
  animal: string;
  color: string;
  accessory?: string;
}

interface PictureBookStyleParams {
  art_style?: string;
  protagonist?: ProtagonistConfig;
  color_palette?: string;
  voice_id?: string;
}

interface NurseryRhymeStyleParams extends PictureBookStyleParams {
  music_mood?: string;
}

interface VideoStyleParams {
  motion_style?: string;
  video_model?: string;
  resolution?: string;
  duration?: number;
  shot_type?: string;
  enable_audio?: boolean;
}
```
