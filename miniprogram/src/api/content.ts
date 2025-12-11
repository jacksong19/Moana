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

// 儿歌接口
export interface NurseryRhyme {
  id: string
  title: string
  theme_topic: string
  lyrics: string
  audio_url: string
  cover_url?: string
  duration: number
  music_style: MusicStyle
  personalization: {
    child_name: string
  }
  created_at: string
}

/**
 * 获取主题列表
 */
export async function getThemes(): Promise<ThemeList> {
  return request.get<ThemeList>('/content/themes')
}

/**
 * 生成绘本
 * AI 生成需要较长时间，设置 3 分钟超时
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
