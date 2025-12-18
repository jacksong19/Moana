/**
 * 内容生成相关 API
 */
import request from './request'

// 主题项接口
export interface ThemeItem {
  id: string
  name: string
  subcategory: string
  age_range: [number, number]
  keywords: string[]
}

// 主题分类接口
export interface ThemeCategory {
  name: string
  themes: ThemeItem[]
}

// 主题列表接口
export interface ThemeList {
  habit: ThemeCategory
  cognition: ThemeCategory
  emotion: ThemeCategory
  [key: string]: ThemeCategory
}

// 绘本页面接口
export interface PictureBookPage {
  page_number: number
  text: string
  image_url: string
  audio_url: string
  duration: number
  interaction?: {
    type: 'tap' | 'drag' | 'shake'
    prompt: string
  }
}

// 绘本接口
export interface PictureBook {
  id: string
  title: string
  theme_topic: string
  educational_goal: string
  pages: PictureBookPage[]
  total_duration: number
  total_interactions: number
  personalization: {
    child_name: string
    characters: string[]
  }
  cover_url?: string
  created_at: string
}

// 艺术风格类型（扩展支持 Gemini 服务的更多风格）
export type ArtStyle =
  // 当前前端支持的风格
  | 'pixar_3d' | 'watercolor' | 'flat_vector' | 'crayon' | 'anime'
  // Gemini 扩展风格（后端支持，前端暂不展示）
  | 'storybook' | 'cartoon' | 'flat'
  | 'pixar' | 'clay' | 'figurine'
  | 'chibi' | 'manga' | 'ghibli'
  | 'oil_painting' | 'sketch' | 'ink_wash' | 'pixel_art'
  | 'none'

// 主角动物类型
export type ProtagonistAnimal = 'bunny' | 'bear' | 'cat' | 'dog' | 'panda' | 'fox'

// 色调类型
export type ColorPalette = 'pastel' | 'vibrant' | 'warm' | 'cool' | 'monochrome'

// Qwen TTS 音色（当前默认）
export type QwenVoiceId = 'Cherry' | 'Jennifer' | 'Kiki' | 'Ethan' | 'Ryan' | 'Nofish'

// Gemini TTS 音色（后端支持）
export type GeminiVoiceId = 'Kore' | 'Leda' | 'Aoede' | 'Puck' | 'Charon' | 'Fenrir'

// TTS 音色 ID（支持两套音色系统）
export type VoiceId = QwenVoiceId | GeminiVoiceId

// TTS 音色配置
export interface VoiceOption {
  id: VoiceId
  name: string        // 中文名
  gender: 'female' | 'male' | 'neutral'
  style: string       // 风格描述
  emoji?: string      // 展示图标
  recommended?: boolean
}

// 主角配置
export interface ProtagonistConfig {
  animal: ProtagonistAnimal
  color?: string
  accessory?: string
}

// 生成绘本参数
export interface GeneratePictureBookParams {
  child_name: string
  age_months: number
  theme_topic: string
  theme_category: string
  favorite_characters?: string[]
  voice_id?: string
  // 新增风格参数
  art_style?: ArtStyle
  protagonist?: ProtagonistConfig
  color_palette?: ColorPalette
}

// 音乐情绪类型
export type MusicMood = 'cheerful' | 'gentle' | 'playful' | 'lullaby' | 'educational'

// 视频动效类型
export type MotionStyle = 'gentle' | 'dynamic' | 'static'

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

// 色彩风格选项
export interface ColorPaletteOption {
  id: ColorPalette
  name: string
  description: string
  colors: string[]
}

// 配饰选项
export interface AccessoryOption {
  id: string
  name: string
  name_en: string
}

// 音乐情绪选项
export interface MusicMoodOption {
  id: MusicMood
  name: string
  description: string
}

// 动效风格选项
export interface MotionStyleOption {
  id: MotionStyle
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

// 分辨率选项
export interface ResolutionOption {
  id: string
  name: string
  sizes: string[]
}

// 时长选项
export interface DurationOption {
  value: number
  label: string
}

// 镜头类型选项
export interface ShotTypeOption {
  id: string
  name: string
  description: string
}

// 视频选项
export interface VideoOptionsConfig {
  models: VideoModelOption[]
  resolutions: ResolutionOption[]
  durations: DurationOption[]
  shot_types: ShotTypeOption[]
}

// 风格选项响应（完整版，匹配后端 API）
export interface StyleOptions {
  art_styles: ArtStyleOption[]
  protagonists: ProtagonistOption[]
  color_palettes: ColorPaletteOption[]
  accessories: AccessoryOption[]
  music_moods: MusicMoodOption[]
  video_motion_styles: MotionStyleOption[]
  tts_voices: VoiceOption[]
  video_options: VideoOptionsConfig
}

// 儿歌音乐风格（兼容旧版）
export type MusicStyle = MusicMood

// 生成儿歌参数
export interface GenerateNurseryRhymeParams {
  child_name: string
  age_months: number
  theme_topic: string
  theme_category: string
  music_style?: MusicStyle
  // 新增风格参数
  music_mood?: MusicMood
  art_style?: ArtStyle
  protagonist?: ProtagonistConfig
  color_palette?: ColorPalette
}

// 歌词段落接口
export interface LyricsSection {
  content: string
}

// 时间戳歌词项（Suno 精确时间戳）
export interface TimestampedLyricItem {
  word: string
  start_s: number
  end_s: number
}

// 歌词接口（新版本包含时间戳）
export interface LyricsObject {
  full_text: string
  sections?: LyricsSection[]
  timestamped?: TimestampedLyricItem[]  // Suno 精确时间戳
}

// 歌曲轨道接口
export interface SongTrack {
  id: string
  audio_url: string
  cover_url?: string
  video_url?: string
  lyric?: string
  timestamped_lyrics?: TimestampedLyricItem[]
  duration: number
  title: string
}

// 儿歌接口
export interface NurseryRhyme {
  id: string
  title: string
  theme_topic: string
  // lyrics 可能是字符串或对象，取决于后端版本
  lyrics: string | LyricsObject
  audio_url: string
  video_url?: string           // Suno 音乐视频
  cover_url?: string           // Imagen 主封面
  suno_cover_url?: string      // Suno 封面（备用）
  duration: number
  music_style: MusicStyle
  personalization: {
    child_name: string
  }
  all_tracks?: SongTrack[]     // 所有歌曲版本（Suno 返回 2 首）
  created_at: string
}

/**
 * 获取主题列表
 */
export async function getThemes(): Promise<ThemeList> {
  return request.get<ThemeList>('/content/themes')
}

// 默认风格选项（后端未返回时使用）
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
    { id: 'Kiki', name: '阿清', gender: 'female', style: '粤语' },
    { id: 'Ethan', name: '晨煦', gender: 'male', style: '成熟稳重' },
    { id: 'Ryan', name: '甜茶', gender: 'male', style: '温暖亲和' },
    { id: 'Nofish', name: '不吃鱼', gender: 'male', style: '活泼有趣' }
  ],
  video_options: {
    models: [
      { id: 'wan2.1-i2v-plus', description: '专业版（推荐）', resolutions: ['480P', '720P'], durations: [5], has_audio: false, shot_types: ['single'], recommended: true },
      { id: 'wan2.1-i2v-turbo', description: '极速版', resolutions: ['480P', '720P'], durations: [5], has_audio: false, shot_types: ['single'] }
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

/**
 * 获取风格选项
 * 优先从后端获取，失败时使用本地默认值
 */
export async function getStyleOptions(): Promise<StyleOptions> {
  try {
    const result = await request.get<StyleOptions>('/content/style-options', {
      showError: false,
      timeout: 10000
    })
    // 合并后端返回和本地默认值，确保字段完整
    return {
      ...DEFAULT_STYLE_OPTIONS,
      ...result,
      // 如果后端返回的数组为空，使用默认值
      art_styles: result.art_styles?.length ? result.art_styles : DEFAULT_STYLE_OPTIONS.art_styles,
      protagonists: result.protagonists?.length ? result.protagonists : DEFAULT_STYLE_OPTIONS.protagonists,
      color_palettes: result.color_palettes?.length ? result.color_palettes : DEFAULT_STYLE_OPTIONS.color_palettes,
      music_moods: result.music_moods?.length ? result.music_moods : DEFAULT_STYLE_OPTIONS.music_moods,
      tts_voices: result.tts_voices?.length ? result.tts_voices : DEFAULT_STYLE_OPTIONS.tts_voices,
      video_options: result.video_options?.models?.length ? result.video_options : DEFAULT_STYLE_OPTIONS.video_options
    }
  } catch (e) {
    console.warn('[getStyleOptions] 获取后端风格选项失败，使用本地默认值:', e)
    return DEFAULT_STYLE_OPTIONS
  }
}

/**
 * 生成绘本（同步版，已废弃）
 * @deprecated 使用 generatePictureBookAsync 代替，避免 Cloudflare 524 超时
 */
export async function generatePictureBook(params: GeneratePictureBookParams): Promise<PictureBook> {
  console.log('[generatePictureBook] 开始请求，超时设置: 180000ms (3分钟)')
  const startTime = Date.now()

  try {
    const result = await request.post<PictureBook>('/content/picture-book', params, {
      showLoading: false, // 使用自定义加载动画
      showError: true,
      timeout: 180000 // 3 分钟超时，AI 生成需要较长时间
    })
    console.log(`[generatePictureBook] 请求成功，耗时: ${(Date.now() - startTime) / 1000}秒`)
    return result
  } catch (e: any) {
    console.error(`[generatePictureBook] 请求失败，耗时: ${(Date.now() - startTime) / 1000}秒，错误:`, e)
    throw e
  }
}

// 异步生成绘本响应
export interface AsyncPictureBookResponse {
  task_id: string
  message: string
}

// 绘本任务状态响应
export interface PictureBookTaskStatus {
  task_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number  // 0-100
  stage: string     // 生成阶段描述
  message?: string
  content_id?: string  // 完成后返回
  result?: PictureBook  // 完成后返回完整结果
  error?: string
}

/**
 * 异步生成绘本（新版 API，立即返回 task_id）
 * 避免 Cloudflare 524 超时
 */
export async function generatePictureBookAsync(params: GeneratePictureBookParams): Promise<AsyncPictureBookResponse> {
  console.log('[generatePictureBookAsync] 发起异步请求')
  return request.post<AsyncPictureBookResponse>('/content/picture-book/async', params, {
    showLoading: false,
    showError: true,
    timeout: 30000  // 只是提交任务，30秒足够
  })
}

/**
 * 获取绘本生成任务状态
 */
export async function getPictureBookTaskStatus(taskId: string): Promise<PictureBookTaskStatus> {
  return request.get<PictureBookTaskStatus>(`/content/picture-book/status/${taskId}`, {
    timeout: 30000,  // 30秒超时
    showError: false  // 不显示错误提示，由调用方处理
  })
}

/**
 * 生成儿歌
 * AI 生成需要较长时间，设置 3 分钟超时
 */
export async function generateNurseryRhyme(params: GenerateNurseryRhymeParams): Promise<NurseryRhyme> {
  console.log('[generateNurseryRhyme] 开始请求，超时设置: 180000ms (3分钟)')
  const startTime = Date.now()

  try {
    const result = await request.post<NurseryRhyme>('/content/nursery-rhyme', params, {
      showLoading: false,
      showError: true,
      timeout: 180000
    })
    console.log(`[generateNurseryRhyme] 请求成功，耗时: ${(Date.now() - startTime) / 1000}秒`)
    return result
  } catch (e: any) {
    console.error(`[generateNurseryRhyme] 请求失败，耗时: ${(Date.now() - startTime) / 1000}秒，错误:`, e)
    throw e
  }
}

// Suno 任务状态阶段（后端回调实际值）
// text: 歌词生成完成, first: 第一首歌曲完成, complete: 全部完成
export type SunoTaskStage = 'waiting' | 'text' | 'first' | 'complete' | 'error'

// Suno 任务状态响应
export interface SunoTaskStatus {
  task_id: string
  progress: number  // 0-100
  stage: SunoTaskStage
  message?: string
  tracks?: Array<{
    id: string
    title: string
    audio_url: string
    cover_url?: string
    duration: number
    lyrics?: string  // Suno 生成的歌词
  }>
  lyrics?: string  // 也可能在顶层返回歌词
  error?: string
}

/**
 * 轮询 Suno 任务状态（旧版，兼容保留）
 */
export async function getSunoTaskStatus(taskId: string): Promise<SunoTaskStatus> {
  return request.get<SunoTaskStatus>(`/callback/suno/status/${taskId}`)
}

// 异步生成儿歌响应
export interface AsyncNurseryRhymeResponse {
  task_id: string
  message: string
}

// 儿歌任务状态响应（新版异步 API）
export interface NurseryRhymeTaskStatus {
  task_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number  // 0-100
  stage: string     // 'text' | 'first' | 'complete' | 'error' 等
  message?: string
  content_id?: string  // 完成后返回
  result?: NurseryRhyme  // 完成后返回完整结果
  error?: string
}

/**
 * 异步生成儿歌（新版 API，立即返回 task_id）
 * 避免 Cloudflare 524 超时
 */
export async function generateNurseryRhymeAsync(params: GenerateNurseryRhymeParams): Promise<AsyncNurseryRhymeResponse> {
  console.log('[generateNurseryRhymeAsync] 发起异步请求')
  return request.post<AsyncNurseryRhymeResponse>('/content/nursery-rhyme/async', params, {
    showLoading: false,
    showError: true,
    timeout: 30000  // 只是提交任务，30秒足够
  })
}

/**
 * 获取儿歌生成任务状态（新版 API）
 */
export async function getNurseryRhymeTaskStatus(taskId: string): Promise<NurseryRhymeTaskStatus> {
  return request.get<NurseryRhymeTaskStatus>(`/content/nursery-rhyme/status/${taskId}`)
}

/**
 * 获取已生成的内容列表
 */
export async function getGeneratedList(params?: {
  type?: 'picture_book' | 'nursery_rhyme' | 'video'
  limit?: number
  offset?: number
}): Promise<{
  items: PictureBook[]
  total: number
  has_more: boolean
}> {
  return request.get('/content/list', { data: params })
}

/**
 * 获取内容详情
 */
export async function getContentDetail(contentId: string): Promise<PictureBook> {
  return request.get<PictureBook>(`/content/${contentId}`)
}

/**
 * 删除内容
 */
export async function deleteContent(contentId: string): Promise<void> {
  return request.delete(`/content/${contentId}`)
}

// 视频页面接口
export interface VideoPage {
  page_num: number
  text: string
  image_url: string
  audio_url: string
}

// 生成视频参数
export interface GenerateVideoParams {
  picture_book: {
    title: string
    pages: VideoPage[]
  }
  child_name: string
  theme_topic: string
  theme_category: string
  // 新视频配置参数（Veo/多提供商）
  aspect_ratio?: string      // 16:9, 9:16, 4:3, 3:4, 1:1
  resolution?: string        // 720P, 1080P
  duration_seconds?: number  // 5, 8, 10, 15
  motion_mode?: string       // static, slow, normal, dynamic, cinematic
  enable_audio?: boolean     // 是否启用音效
  // 旧参数（兼容）
  motion_style?: MotionStyle
}

// 视频接口
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

/**
 * 生成视频（同步版，已废弃）
 * @deprecated 使用 generateVideoAsync 代替，避免 Cloudflare 524 超时
 */
export async function generateVideo(params: GenerateVideoParams): Promise<Video> {
  console.log('[generateVideo] 开始请求，超时设置: 300000ms (5分钟)')
  const startTime = Date.now()

  try {
    const result = await request.post<Video>('/content/video', params, {
      showLoading: false,
      showError: true,
      timeout: 300000 // 5 分钟超时，视频生成需要更长时间
    })
    console.log(`[generateVideo] 请求成功，耗时: ${(Date.now() - startTime) / 1000}秒`)
    return result
  } catch (e: any) {
    console.error(`[generateVideo] 请求失败，耗时: ${(Date.now() - startTime) / 1000}秒，错误:`, e)
    throw e
  }
}

// 异步生成视频响应
export interface AsyncVideoResponse {
  task_id: string
  message: string
}

// 视频任务状态响应
export interface VideoTaskStatus {
  task_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number  // 0-100
  stage: string     // 生成阶段描述
  message?: string
  content_id?: string  // 完成后返回
  result?: Video       // 完成后返回完整结果
  error?: string
}

/**
 * 异步生成视频（新版 API，立即返回 task_id）
 * 避免 Cloudflare 524 超时
 */
export async function generateVideoAsync(params: GenerateVideoParams): Promise<AsyncVideoResponse> {
  console.log('[generateVideoAsync] 发起异步请求')
  return request.post<AsyncVideoResponse>('/content/video/async', params, {
    showLoading: false,
    showError: true,
    timeout: 30000  // 只是提交任务，30秒足够
  })
}

/**
 * 获取视频生成任务状态
 */
export async function getVideoTaskStatus(taskId: string): Promise<VideoTaskStatus> {
  return request.get<VideoTaskStatus>(`/content/video/status/${taskId}`, {
    timeout: 30000,
    showError: false  // 不显示错误提示，由调用方处理
  })
}
