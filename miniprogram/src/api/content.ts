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

// 生成绘本参数
export interface GeneratePictureBookParams {
  child_name: string
  age_months: number
  theme_topic: string
  theme_category: string
  favorite_characters?: string[]
  voice_id?: string
}

// 儿歌音乐风格
export type MusicStyle = 'cheerful' | 'gentle' | 'playful' | 'lullaby' | 'educational'

// 生成儿歌参数
export interface GenerateNurseryRhymeParams {
  child_name: string
  age_months: number
  theme_topic: string
  theme_category: string
  music_style?: MusicStyle
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
 * 生成视频
 * 视频生成需要较长时间（1-5分钟），设置 5 分钟超时
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
