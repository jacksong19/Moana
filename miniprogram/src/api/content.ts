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
