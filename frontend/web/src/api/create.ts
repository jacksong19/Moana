/**
 * 创作相关 API
 * 从小程序移植，用于网页版创作功能
 */
import request from './request'

// ========== 类型定义 ==========

// 主题项
export interface ThemeItem {
  id: string
  name: string
  subcategory: string
  age_range: [number, number]
  keywords: string[]
}

// 主题分类
export interface ThemeCategory {
  name: string
  themes: ThemeItem[]
}

// 主题列表
export interface ThemeList {
  habit: ThemeCategory
  cognition: ThemeCategory
  emotion: ThemeCategory
  [key: string]: ThemeCategory
}

// 艺术风格
export type ArtStyle =
  | 'pixar_3d' | 'pixar' | 'clay' | 'figurine' | 'dreamworks' | 'disney_3d' | 'low_poly'
  | 'storybook' | 'watercolor' | 'cartoon' | 'flat' | 'flat_vector' | 'crayon' | 'colored_pencil'
  | 'anime' | 'chibi' | 'manga' | 'ghibli' | 'shinkai' | 'comic_book'
  | 'oil_painting' | 'sketch' | 'ink_wash' | 'pixel_art' | 'impressionist' | 'pop_art' | 'art_nouveau'
  | 'papercut' | 'embroidery' | 'mosaic' | 'stained_glass' | 'felt_craft' | 'origami'
  | 'none' | string

// 主角动物
export type ProtagonistAnimal = 'bunny' | 'bear' | 'cat' | 'dog' | 'panda' | 'fox'

// 色调
export type ColorPalette = 'pastel' | 'vibrant' | 'warm' | 'cool' | 'monochrome'

// 音色
export type VoiceId = 'Cherry' | 'Jennifer' | 'Kiki' | 'Ethan' | 'Ryan' | 'Nofish'
  | 'Kore' | 'Leda' | 'Aoede' | 'Puck' | 'Charon' | 'Fenrir'

// 主角配置
export interface ProtagonistConfig {
  animal: ProtagonistAnimal
  color?: string
  accessory?: string
}

// 艺术风格选项
export interface ArtStyleOption {
  id: ArtStyle
  name: string
  name_en: string
  description: string
  preview_url?: string
  recommended?: boolean
}

// 主角选项
export interface ProtagonistOption {
  animal: ProtagonistAnimal
  name: string
  default_color: string
  default_accessory: string
  preview_url?: string
}

// 色彩选项
export interface ColorPaletteOption {
  id: ColorPalette
  name: string
  description: string
  colors: string[]
}

// 音色选项
export interface VoiceOption {
  id: VoiceId
  name: string
  gender: 'female' | 'male' | 'neutral'
  style: string
  emoji?: string
  recommended?: boolean
}

// 音乐情绪选项
export interface MusicMoodOption {
  id: string
  name: string
  description: string
}

// 动效选项
export interface MotionStyleOption {
  id: string
  name: string
  description: string
}

// 视频模型选项
export interface VideoModelOption {
  id: string
  description: string
  resolutions: string[]
  durations: number[]
  has_audio: boolean
  shot_types: string[]
  recommended?: boolean
}

// 风格选项响应
export interface StyleOptions {
  art_styles: ArtStyleOption[]
  protagonists: ProtagonistOption[]
  color_palettes: ColorPaletteOption[]
  accessories: { id: string; name: string; name_en: string }[]
  music_moods: MusicMoodOption[]
  video_motion_styles: MotionStyleOption[]
  tts_voices: VoiceOption[]
  video_options: {
    models: VideoModelOption[]
    resolutions: { id: string; name: string; sizes: string[] }[]
    durations: { value: number; label: string }[]
    shot_types: { id: string; name: string; description: string }[]
  }
}

// ========== 绘本相关 ==========

// 绘本页面
export interface PictureBookPage {
  page_number: number
  text: string
  image_url: string
  image_thumb_url?: string
  audio_url: string
  duration: number
}

// 绘本
export interface PictureBook {
  id: string
  title: string
  theme_topic: string
  theme_category?: string
  educational_goal: string
  pages: PictureBookPage[]
  total_duration: number
  total_interactions: number
  personalization: {
    child_name: string
    characters: string[]
  }
  cover_url?: string
  cover_thumb_url?: string
  created_at: string
}

// 故事增强参数
export interface StoryEnhancement {
  narrative_pace?: string | null
  interaction_density?: string | null
  educational_focus?: string | null
  language_style?: string | null
  plot_complexity?: string | null
  ending_style?: string | null
}

// 视觉增强参数
export interface VisualEnhancement {
  time_atmosphere?: string | null
  scene_environment?: string | null
  emotional_tone?: string | null
  composition_style?: string | null
  lighting_effect?: string | null
}

// 生成绘本参数
export interface GeneratePictureBookParams {
  child_name: string
  age_months: number
  theme_topic: string
  theme_category: string
  favorite_characters?: string[]
  voice_id?: string
  art_style?: ArtStyle
  protagonist?: ProtagonistConfig
  color_palette?: ColorPalette
  creation_mode?: 'smart' | 'preset'
  custom_prompt?: string
  // 增强参数
  story_enhancement?: StoryEnhancement
  visual_enhancement?: VisualEnhancement
}

// 异步响应
export interface AsyncResponse {
  task_id: string
  message: string
}

// 任务状态
export interface TaskStatus {
  task_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  stage: string
  message?: string
  content_id?: string
  error?: string
}

// 绘本任务状态
export interface PictureBookTaskStatus extends TaskStatus {
  result?: PictureBook
}

// ========== 儿歌相关 ==========

// 歌词对象
export interface LyricsObject {
  full_text: string
  sections?: { content: string }[]
  timestamped?: { word: string; start_s: number; end_s: number }[]
}

// 儿歌
export interface NurseryRhyme {
  id: string
  title: string
  theme_topic: string
  lyrics: string | LyricsObject
  audio_url: string
  video_url?: string
  cover_url?: string
  suno_cover_url?: string
  duration: number
  music_style: string
  personalization: {
    child_name: string
  }
  created_at: string
}

// 生成儿歌参数
export interface GenerateNurseryRhymeParams {
  child_name: string
  age_months: number
  theme_topic: string
  theme_category: string
  creation_mode?: 'preset' | 'smart'
  custom_prompt?: string
  favorite_characters?: string[]
  // 音乐风格
  music_mood?: string
  music_genre?: string
  tempo?: number
  energy_level?: number
  // 人声
  vocal_type?: string
  vocal_emotion?: string
  vocal_range?: string
  vocal_style?: string
  // 乐器和音效
  instruments?: string[]
  sound_effects?: string[]
  // 歌词
  lyric_complexity?: number
  repetition_level?: number
  // 结构
  song_structure?: string
  action_types?: string
  // 语言文化
  language?: string
  cultural_style?: string
  // 个性化
  educational_focus?: string
  favorite_colors?: string[]
  // Suno 进阶
  style_weight?: number
  creativity?: number
  negative_tags?: string
  duration_preference?: number
}

// 儿歌任务状态
export interface NurseryRhymeTaskStatus extends TaskStatus {
  result?: NurseryRhyme
}

// ========== 视频相关 ==========

// 视频
export interface Video {
  id: string
  title: string
  video_url: string
  cover_url?: string
  duration: number
  source_book_id?: string
  personalization: {
    child_name: string
  }
  created_at: string
}

// 生成独立视频参数
export interface GenerateStandaloneVideoParams {
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
}

// 视频任务状态
export interface VideoTaskStatus extends TaskStatus {
  result?: Video
}

// ========== 默认风格选项 ==========

const DEFAULT_STYLE_OPTIONS: StyleOptions = {
  art_styles: [
    { id: 'pixar_3d', name: '皮克斯3D', name_en: 'Pixar 3D', description: '使用皮克斯3D风格绘制', recommended: true },
    { id: 'watercolor', name: '水彩手绘', name_en: 'Watercolor', description: '柔和温馨的水彩画风' },
    { id: 'flat_vector', name: '扁平插画', name_en: 'Flat Vector', description: '现代简约的扁平设计' },
    { id: 'crayon', name: '蜡笔涂鸦', name_en: 'Crayon', description: '童趣十足的蜡笔画风' },
    { id: 'anime', name: '日系动漫', name_en: 'Anime', description: '可爱细腻的日系风格' }
  ],
  protagonists: [
    { animal: 'bunny', name: '小兔子', default_color: 'white', default_accessory: 'blue overalls' },
    { animal: 'bear', name: '小熊', default_color: 'brown', default_accessory: 'red scarf' },
    { animal: 'cat', name: '小猫咪', default_color: 'orange', default_accessory: 'bell collar' },
    { animal: 'dog', name: '小狗狗', default_color: 'golden', default_accessory: 'blue bandana' },
    { animal: 'panda', name: '熊猫', default_color: 'black and white', default_accessory: 'bamboo' },
    { animal: 'fox', name: '小狐狸', default_color: 'orange', default_accessory: 'green scarf' }
  ],
  color_palettes: [
    { id: 'pastel', name: '马卡龙色', description: '柔和温馨', colors: ['#FFB5BA', '#B5D8FF', '#C5F0A4', '#FFF5BA'] },
    { id: 'vibrant', name: '活力鲜艳', description: '明快活泼', colors: ['#FF4757', '#3742FA', '#2ED573', '#FFA502'] },
    { id: 'warm', name: '暖暖阳光', description: '温暖舒适', colors: ['#FF6B35', '#F7C566', '#E8A87C', '#FFE4C4'] },
    { id: 'cool', name: '清新冷调', description: '清爽宁静', colors: ['#74B9FF', '#81ECEC', '#A29BFE', '#DFE6E9'] },
    { id: 'monochrome', name: '简约单色', description: '优雅简洁', colors: ['#2D3436', '#636E72', '#B2BEC3', '#DFE6E9'] }
  ],
  accessories: [
    { id: 'blue_overalls', name: '蓝色背带裤', name_en: 'blue overalls' },
    { id: 'red_scarf', name: '红色围巾', name_en: 'red scarf' },
    { id: 'yellow_raincoat', name: '黄色雨衣', name_en: 'yellow raincoat' },
    { id: 'pink_bow', name: '粉色蝴蝶结', name_en: 'pink bow' },
    { id: 'green_hat', name: '绿色小帽', name_en: 'green hat' }
  ],
  music_moods: [
    { id: 'cheerful', name: '欢快活泼', description: '适合日常活动主题' },
    { id: 'gentle', name: '温柔舒缓', description: '适合睡前或安静时刻' },
    { id: 'playful', name: '调皮有趣', description: '适合游戏互动主题' },
    { id: 'lullaby', name: '摇篮曲', description: '适合哄睡' },
    { id: 'educational', name: '教育启蒙', description: '适合认知学习主题' }
  ],
  video_motion_styles: [
    { id: 'gentle', name: '柔和过渡', description: '轻柔自然的动画效果' },
    { id: 'dynamic', name: '活泼生动', description: '充满活力的动态效果' },
    { id: 'static', name: '静态展示', description: '稳定清晰的展示效果' }
  ],
  tts_voices: [
    { id: 'Cherry', name: '芊悦', gender: 'female', style: '温柔亲切', recommended: true },
    { id: 'Jennifer', name: '詹妮弗', gender: 'female', style: '清晰标准' },
    { id: 'Ethan', name: '晨煦', gender: 'male', style: '成熟稳重' },
    { id: 'Ryan', name: '甜茶', gender: 'male', style: '温暖亲和' }
  ],
  video_options: {
    models: [
      { id: 'wan2.1-i2v-plus', description: '专业版（推荐）', resolutions: ['480P', '720P'], durations: [5], has_audio: false, shot_types: ['single'], recommended: true }
    ],
    resolutions: [
      { id: '480P', name: '480P 标清', sizes: ['832*480', '480*832', '624*624'] },
      { id: '720P', name: '720P 高清', sizes: ['1280*720', '720*1280', '960*960'] }
    ],
    durations: [
      { value: 5, label: '5秒' }
    ],
    shot_types: [
      { id: 'single', name: '单镜头', description: '单一场景连贯运动' }
    ]
  }
}

// ========== API 函数 ==========

/**
 * 获取主题列表
 */
export async function getThemes(): Promise<ThemeList> {
  return request.get<ThemeList>('/content/themes')
}

/**
 * 获取风格选项
 */
export async function getStyleOptions(): Promise<StyleOptions> {
  try {
    const result = await request.get<StyleOptions>('/content/style-options')
    return {
      ...DEFAULT_STYLE_OPTIONS,
      ...result,
      art_styles: result.art_styles?.length ? result.art_styles : DEFAULT_STYLE_OPTIONS.art_styles,
      protagonists: result.protagonists?.length ? result.protagonists : DEFAULT_STYLE_OPTIONS.protagonists,
      color_palettes: result.color_palettes?.length ? result.color_palettes : DEFAULT_STYLE_OPTIONS.color_palettes,
      music_moods: result.music_moods?.length ? result.music_moods : DEFAULT_STYLE_OPTIONS.music_moods,
      tts_voices: result.tts_voices?.length ? result.tts_voices : DEFAULT_STYLE_OPTIONS.tts_voices,
      video_options: result.video_options?.models?.length ? result.video_options : DEFAULT_STYLE_OPTIONS.video_options
    }
  } catch {
    console.warn('[getStyleOptions] 获取后端风格选项失败，使用本地默认值')
    return DEFAULT_STYLE_OPTIONS
  }
}

/**
 * 异步生成绘本
 */
export async function generatePictureBookAsync(params: GeneratePictureBookParams): Promise<AsyncResponse> {
  return request.post<AsyncResponse>('/content/picture-book/async', params, {
    timeout: 30000
  })
}

/**
 * 获取绘本生成任务状态
 */
export async function getPictureBookTaskStatus(taskId: string): Promise<PictureBookTaskStatus> {
  return request.get<PictureBookTaskStatus>(`/content/picture-book/status/${taskId}`)
}

/**
 * 异步生成儿歌
 */
export async function generateNurseryRhymeAsync(params: GenerateNurseryRhymeParams): Promise<AsyncResponse> {
  return request.post<AsyncResponse>('/content/nursery-rhyme/async', params, {
    timeout: 30000
  })
}

/**
 * 获取儿歌生成任务状态
 */
export async function getNurseryRhymeTaskStatus(taskId: string): Promise<NurseryRhymeTaskStatus> {
  return request.get<NurseryRhymeTaskStatus>(`/content/nursery-rhyme/status/${taskId}`)
}

/**
 * 异步生成独立视频
 */
export async function generateStandaloneVideoAsync(params: GenerateStandaloneVideoParams): Promise<AsyncResponse> {
  return request.post<AsyncResponse>('/content/video/standalone/async', params, {
    timeout: 30000
  })
}

/**
 * 获取视频生成任务状态
 */
export async function getVideoTaskStatus(taskId: string): Promise<VideoTaskStatus> {
  return request.get<VideoTaskStatus>(`/content/video/status/${taskId}`)
}

/**
 * 生成视频首帧
 */
export async function generateFirstFrame(params: {
  prompt: string
  child_name: string
  art_style?: ArtStyle
  aspect_ratio?: '16:9' | '9:16' | '1:1'
}): Promise<{ image_url: string; prompt_enhanced?: string }> {
  return request.post('/content/video/first-frame', params, {
    timeout: 60000
  })
}
