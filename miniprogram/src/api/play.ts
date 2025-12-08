/**
 * 播放追踪相关 API
 */
import request from './request'

// 播放会话接口
export interface PlaySession {
  session_id: string
  content_id: string
  child_id: string
  started_at: string
  resumed_from: number
}

// 播放历史项接口
export interface PlayHistoryItem {
  id: string
  content_id: string
  content_title: string
  content_type: 'picture_book' | 'nursery_rhyme' | 'video'
  duration: number
  completed: boolean
  progress: number
  played_at: string
  cover_url?: string
}

// 播放统计接口
export interface PlayStats {
  child_id: string
  today_duration: number
  week_duration: number
  total_plays: number
  favorite_type: string
  streak_days: number
}

// 互动数据接口
export interface InteractionData {
  interaction_type: 'tap' | 'drag' | 'shake'
  page_number: number
  response_time: number
  correct: boolean
}

/**
 * 开始播放
 */
export async function startPlay(childId: string, contentId: string): Promise<PlaySession> {
  return request.post<PlaySession>('/play/start', {
    child_id: childId,
    content_id: contentId
  })
}

/**
 * 更新播放进度
 */
export async function updateProgress(sessionId: string, progress: number, duration: number): Promise<void> {
  return request.put(`/play/${sessionId}/progress`, {
    progress,
    duration
  })
}

/**
 * 完成播放
 */
export async function completePlay(sessionId: string, totalDuration: number): Promise<void> {
  return request.post(`/play/${sessionId}/complete`, {
    total_duration: totalDuration
  })
}

/**
 * 提交互动记录
 */
export async function submitInteraction(sessionId: string, data: InteractionData): Promise<void> {
  return request.post(`/play/${sessionId}/interaction`, data)
}

/**
 * 获取播放历史
 */
export async function getPlayHistory(childId: string, params?: {
  limit?: number
  offset?: number
}): Promise<{
  items: PlayHistoryItem[]
  total: number
  has_more: boolean
}> {
  return request.get(`/play/history/${childId}`, { data: params })
}

/**
 * 获取播放统计
 */
export async function getPlayStats(childId: string): Promise<PlayStats> {
  return request.get<PlayStats>(`/play/stats/${childId}`)
}
