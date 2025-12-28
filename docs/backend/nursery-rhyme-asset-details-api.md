# 儿歌素材参数 API 前端适配指南

> **版本**: v1.0
> **日期**: 2025-12-21 18:30
> **后端版本**: fe74357

---

## 一、API 端点

```
GET /api/v1/content/{content_id}/asset-details
```

**用途**: 获取儿歌的完整素材参数，包括提示词增强、音乐生成参数、歌词、素材文件等。

---

## 二、响应结构（TypeScript 类型定义）

```typescript
interface NurseryRhymeAssetDetails {
  content_id: string;
  content_type: "nursery_rhyme";

  // 生成模型信息
  generated_by: {
    prompt_model: string;  // "gemini-3-flash-preview"
    music_model: string;   // "suno-v5"
  };

  // 用户输入
  user_inputs: {
    child_name: string;
    age_months: number;
    favorite_characters: string[];
    voice_id: string | null;
    creation_mode: "preset" | "smart";
    custom_prompt: string | null;
    theme_category: string;
    theme_topic: string;
    user_selections: UserSelections;  // 30个参数
  };

  // 增强参数
  enhancement_params: {
    story_enhancement: any | null;
    visual_enhancement: any | null;
    prompt_enhancement: {
      original: string;   // 用户原始输入
      enhanced: string;   // Gemini 增强后
      model: string;      // 使用的模型
    };
  };

  // 生成配置
  generation_config: {
    prompt_enhancement: PromptEnhancementConfig;
    music: MusicConfig;
    lyrics: LyricsConfig;
  };

  // 素材列表
  assets: Asset[];
  total_count: number;
}

// 用户选择的30个参数
interface UserSelections {
  creation_mode?: string;
  theme_category?: string;
  theme_topic?: string;
  age_months?: number;
  music_mood?: string;
  music_genre?: string;
  tempo?: number;
  energy_level?: number;
  vocal_type?: string;
  vocal_range?: string;
  vocal_emotion?: string;
  vocal_style?: string;
  vocal_effects?: string[];
  vocal_regional?: string;
  instruments?: string[];
  sound_effects?: string[];
  lyric_complexity?: number;
  repetition_level?: number;
  song_structure?: string;
  duration_preference?: number;
  action_types?: string[];
  language?: string;
  cultural_style?: string;
  educational_focus?: string;
  favorite_characters?: string[];
  favorite_colors?: string[];
  style_weight?: number;
  creativity?: number;
  negative_tags?: string[];
  style_description?: string;
}

// 提示词增强配置
interface PromptEnhancementConfig {
  model: string;
  user_prompt: string;
  enhanced_prompt: string;
}

// 音乐生成配置
interface MusicConfig {
  model: string;
  generation_mode: string;
  music_mood: string;
  music_genre: string;
  tempo: number | string;
  energy_level: number | string;
  vocal_type: string;
  vocal_range: string;
  vocal_emotion: string;
  vocal_style: string;
  vocal_effects: string[];
  vocal_regional: string;
  instruments: string[];
  sound_effects: string[];
  lyric_complexity: number | string;
  repetition_level: number | string;
  song_structure: string;
  duration_preference: number | string;
  action_types: string[];
  language: string;
  cultural_style: string;
  style_weight: number | string;
  creativity: number | string;
  negative_tags: string[];
  style_description: string;
}

// 歌词配置
interface LyricsConfig {
  full_text: string;
  prompt_used: string;
  has_timestamps: boolean;
}

// 素材类型
type Asset =
  | { type: "cover_image"; url: string; source: "suno" }
  | { type: "suno_cover"; url: string }
  | { type: "audio"; url: string; duration: number; format: "mp3" }
  | { type: "video"; url: string; duration: number }
  | { type: "audio_track"; track_num: number; url: string; duration: number; cover_url?: string };
```

---

## 三、响应示例

```json
{
  "content_id": "477ac222-f65a-4fa9-9985-5765b59261e1",
  "content_type": "nursery_rhyme",
  "generated_by": {
    "prompt_model": "gemini-2.0-flash",
    "music_model": "suno-v5"
  },
  "user_inputs": {
    "child_name": "玥玥",
    "age_months": 22,
    "favorite_characters": [],
    "voice_id": null,
    "creation_mode": "smart",
    "custom_prompt": "编一首可以跟着跳舞的律动儿歌",
    "theme_category": "motor",
    "theme_topic": "快乐律动",
    "user_selections": {
      "creation_mode": "smart",
      "theme_category": "motor",
      "theme_topic": "快乐律动",
      "age_months": 22,
      "music_mood": "playful",
      "music_genre": "rock",
      "tempo": 130,
      "energy_level": 8,
      "vocal_type": "child_voice",
      "vocal_emotion": "playful",
      "vocal_style": "clear",
      "instruments": ["saxophone", "drums"],
      "sound_effects": ["laugh", "cheer"],
      "song_structure": "standard",
      "action_types": ["dance"],
      "language": "english",
      "cultural_style": "western"
    }
  },
  "enhancement_params": {
    "story_enhancement": null,
    "visual_enhancement": null,
    "prompt_enhancement": {
      "original": "编一首可以跟着跳舞的律动儿歌",
      "enhanced": "[Playful Rock] A dancing song for 玥玥. Energetic child vocal, playful and bright. Saxophone, drums, laugh, cheer sound effects. Upbeat and catchy melody, easy to dance to. Fast tempo 130 BPM, high energy and fun atmosphere.",
      "model": "gemini-2.0-flash"
    }
  },
  "generation_config": {
    "prompt_enhancement": {
      "model": "gemini-2.0-flash",
      "user_prompt": "编一首可以跟着跳舞的律动儿歌",
      "enhanced_prompt": "[Playful Rock] A dancing song for 玥玥. Energetic child vocal, playful and bright. Saxophone, drums, laugh, cheer sound effects. Upbeat and catchy melody, easy to dance to. Fast tempo 130 BPM, high energy and fun atmosphere."
    },
    "music": {
      "model": "suno-v5",
      "generation_mode": "suno_free",
      "music_mood": "playful",
      "music_genre": "rock",
      "tempo": 130,
      "energy_level": 8,
      "vocal_type": "child_voice",
      "vocal_range": "",
      "vocal_emotion": "playful",
      "vocal_style": "clear",
      "vocal_effects": [],
      "vocal_regional": "",
      "instruments": ["saxophone", "drums"],
      "sound_effects": ["laugh", "cheer"],
      "lyric_complexity": "",
      "repetition_level": "",
      "song_structure": "standard",
      "duration_preference": "",
      "action_types": ["dance"],
      "language": "english",
      "cultural_style": "western",
      "style_weight": "",
      "creativity": "",
      "negative_tags": [],
      "style_description": ""
    },
    "lyrics": {
      "full_text": "[Verse]\nFeet on the floor bounce bounce bounce\nSpin like a top round and round\nThe room's alive with color and sound\nJump high reach the sky\n\n[Chorus]\nDancing with Yueyue under the sun\nClap your hands let's have some fun\nTwirl and twist till the day is done\nOh Yueyue's dance has just begun\n\n[Verse 2]\nSaxophone sings wah wah wah\nDrums go boom like a shooting star\nEvery step is who we are\nShake it left shake it right\n\n[Prechorus]\nHear the cheers the laugh so sweet\nYueyue's rhythm moves our feet\n\n[Chorus]\nDancing with Yueyue under the sun\nClap your hands let's have some fun\nTwirl and twist till the day is done\nOh Yueyue's dance has just begun\n\n[Bridge]\nLeap like a frog hop hop hop\nDon't stop the groove don't you stop\nFeel the beat go pop pop pop\nYueyue leads we follow",
      "prompt_used": "[Playful Rock] A dancing song for 玥玥. Energetic child vocal, playful and bright. Saxophone, drums, laugh, cheer sound effects. Upbeat and catchy melody, easy to dance to. Fast tempo 130 BPM, high energy and fun atmosphere.",
      "has_timestamps": true
    }
  },
  "assets": [
    {
      "type": "cover_image",
      "url": "https://kids.jackverse.cn/media/images/2025/12/21/643758870c4b08f0.jpg",
      "source": "suno"
    },
    {
      "type": "audio",
      "url": "https://kids.jackverse.cn/media/audio/2025/12/21/ea200192d1eb3697.mp3",
      "duration": 94,
      "format": "mp3"
    },
    {
      "type": "video",
      "url": "https://kids.jackverse.cn/media/video/2025/12/21/127a23ea4416fe27.mp4",
      "duration": 94
    },
    {
      "type": "audio_track",
      "track_num": 2,
      "url": "https://kids.jackverse.cn/media/audio/2025/12/21/1b7be290f020049d.mp3",
      "duration": 66.2,
      "cover_url": "https://kids.jackverse.cn/media/images/2025/12/21/7cc3b5ddb552e637.jpg"
    }
  ],
  "total_count": 4
}
```

---

## 四、前端展示字段映射

| 展示项 | 数据路径 |
|-------|---------|
| 用户创意 | `enhancement_params.prompt_enhancement.original` |
| 增强提示词 | `enhancement_params.prompt_enhancement.enhanced` |
| 提示词增强模型 | `generated_by.prompt_model` |
| 音乐生成模型 | `generated_by.music_model` |
| 音乐风格 | `generation_config.music.music_mood` |
| 音乐流派 | `generation_config.music.music_genre` |
| 节奏 BPM | `generation_config.music.tempo` |
| 人声类型 | `generation_config.music.vocal_type` |
| 人声情感 | `generation_config.music.vocal_emotion` |
| 乐器 | `generation_config.music.instruments` |
| 音效 | `generation_config.music.sound_effects` |
| 语言 | `generation_config.music.language` |
| 文化风格 | `generation_config.music.cultural_style` |
| 歌曲结构 | `generation_config.music.song_structure` |
| 歌词全文 | `generation_config.lyrics.full_text` |
| 是否有时间戳 | `generation_config.lyrics.has_timestamps` |
| 主音频 | `assets.find(a => a.type === 'audio')?.url` |
| 封面 | `assets.find(a => a.type === 'cover_image')?.url` |
| 视频 | `assets.find(a => a.type === 'video')?.url` |
| 备选音轨 | `assets.filter(a => a.type === 'audio_track')` |

---

## 五、兼容旧数据

部分旧记录可能缺少 `user_selections`，需要做兼容处理：

```typescript
function getAssetDetails(data: NurseryRhymeAssetDetails) {
  const selections = data.user_inputs.user_selections || {};
  const musicConfig = data.generation_config.music;

  return {
    // 优先从 user_selections 取，fallback 到 generation_config
    musicMood: selections.music_mood || musicConfig.music_mood || '未知',
    tempo: selections.tempo || musicConfig.tempo || '-',
    instruments: selections.instruments?.length
      ? selections.instruments
      : musicConfig.instruments || [],
    language: selections.language || musicConfig.language || 'chinese',
  };
}
```

---

## 六、素材分组展示

```typescript
function groupAssets(assets: Asset[]) {
  return {
    covers: assets.filter(a => a.type === 'cover_image' || a.type === 'suno_cover'),
    audios: assets.filter(a => a.type === 'audio' || a.type === 'audio_track'),
    videos: assets.filter(a => a.type === 'video'),
  };
}

// 获取主素材
function getPrimaryAssets(assets: Asset[]) {
  return {
    cover: assets.find(a => a.type === 'cover_image')?.url,
    audio: assets.find(a => a.type === 'audio')?.url,
    video: assets.find(a => a.type === 'video')?.url,
    audioDuration: assets.find(a => a.type === 'audio')?.duration,
  };
}

// 获取备选音轨
function getAlternativeTracks(assets: Asset[]) {
  return assets
    .filter(a => a.type === 'audio_track')
    .sort((a, b) => a.track_num - b.track_num);
}
```

---

## 七、完整前端示例（Vue 3）

```vue
<template>
  <div class="asset-details" v-if="data">
    <!-- 提示词增强 -->
    <section class="section">
      <h3>提示词增强</h3>
      <div class="field">
        <label>用户创意</label>
        <p class="value">{{ promptEnhancement.original || '-' }}</p>
      </div>
      <div class="field">
        <label>增强后 ({{ generatedBy.prompt_model }})</label>
        <p class="value enhanced">{{ promptEnhancement.enhanced || '-' }}</p>
      </div>
    </section>

    <!-- 音乐参数 -->
    <section class="section">
      <h3>音乐生成参数</h3>
      <div class="grid">
        <div class="field">
          <label>模型</label>
          <p class="value">{{ generatedBy.music_model }}</p>
        </div>
        <div class="field">
          <label>风格</label>
          <p class="value">{{ musicConfig.music_mood || '-' }}</p>
        </div>
        <div class="field">
          <label>流派</label>
          <p class="value">{{ musicConfig.music_genre || '-' }}</p>
        </div>
        <div class="field">
          <label>节奏</label>
          <p class="value">{{ musicConfig.tempo ? `${musicConfig.tempo} BPM` : '-' }}</p>
        </div>
        <div class="field">
          <label>能量</label>
          <p class="value">{{ musicConfig.energy_level || '-' }}</p>
        </div>
        <div class="field">
          <label>人声</label>
          <p class="value">{{ musicConfig.vocal_type || '-' }}</p>
        </div>
        <div class="field">
          <label>乐器</label>
          <p class="value">{{ formatArray(musicConfig.instruments) }}</p>
        </div>
        <div class="field">
          <label>音效</label>
          <p class="value">{{ formatArray(musicConfig.sound_effects) }}</p>
        </div>
        <div class="field">
          <label>语言</label>
          <p class="value">{{ musicConfig.language || '-' }}</p>
        </div>
        <div class="field">
          <label>结构</label>
          <p class="value">{{ musicConfig.song_structure || '-' }}</p>
        </div>
      </div>
    </section>

    <!-- 歌词 -->
    <section class="section">
      <h3>歌词 {{ lyrics.has_timestamps ? '(带时间戳)' : '' }}</h3>
      <pre class="lyrics">{{ lyrics.full_text }}</pre>
    </section>

    <!-- 素材 -->
    <section class="section">
      <h3>素材文件 ({{ assets.length }})</h3>
      <div class="assets-list">
        <div v-for="asset in assets" :key="asset.url" class="asset-item">
          <span class="asset-type">{{ asset.type }}</span>
          <a :href="asset.url" target="_blank" class="asset-url">
            {{ getFileName(asset.url) }}
          </a>
          <span v-if="asset.duration" class="asset-duration">
            {{ formatDuration(asset.duration) }}
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { NurseryRhymeAssetDetails } from '@/types/content';

const props = defineProps<{
  data: NurseryRhymeAssetDetails;
}>();

const generatedBy = computed(() => props.data.generated_by);
const promptEnhancement = computed(() => props.data.enhancement_params.prompt_enhancement);
const musicConfig = computed(() => props.data.generation_config.music);
const lyrics = computed(() => props.data.generation_config.lyrics);
const assets = computed(() => props.data.assets);

function formatArray(arr?: string[]) {
  return arr?.length ? arr.join(', ') : '-';
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getFileName(url: string) {
  return url.split('/').pop() || url;
}
</script>

<style scoped>
.section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}

.section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.field {
  margin-bottom: 8px;
}

.field label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.field .value {
  font-size: 14px;
  color: #333;
  margin: 0;
}

.field .value.enhanced {
  background: #e8f4e8;
  padding: 8px;
  border-radius: 4px;
  font-size: 13px;
}

.lyrics {
  background: #fff;
  padding: 12px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
}

.assets-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.asset-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: #fff;
  border-radius: 4px;
}

.asset-type {
  font-size: 12px;
  padding: 2px 8px;
  background: #007aff;
  color: #fff;
  border-radius: 4px;
}

.asset-url {
  flex: 1;
  font-size: 13px;
  color: #007aff;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.asset-duration {
  font-size: 12px;
  color: #666;
}
</style>
```

---

## 八、API 调用示例

```typescript
// api/content.ts
import { request } from '@/utils/request';
import type { NurseryRhymeAssetDetails } from '@/types/content';

export async function getAssetDetails(contentId: string): Promise<NurseryRhymeAssetDetails> {
  return request.get(`/api/v1/content/${contentId}/asset-details`);
}

// 使用示例
import { getAssetDetails } from '@/api/content';

async function loadAssetDetails(contentId: string) {
  try {
    const details = await getAssetDetails(contentId);
    console.log('提示词增强:', details.enhancement_params.prompt_enhancement);
    console.log('音乐参数:', details.generation_config.music);
    console.log('素材数量:', details.assets.length);
    return details;
  } catch (error) {
    console.error('获取素材详情失败:', error);
    throw error;
  }
}
```

---

**文档维护**: Claude Code
**最后更新**: 2025-12-21 18:30
