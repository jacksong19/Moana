/**
 * 时间限制管理器
 * 管理儿童观看时长限制
 */
import { useChildStore } from '@/stores/child'

export interface TimeLimitResult {
  exceeded: boolean
  type?: 'session' | 'daily'
  reminder?: boolean
  message: string
}

class TimeLimitManager {
  private sessionStart: number | null = null
  private lastReminderTime: number = 0
  private reminderInterval: number = 10 * 60 * 1000 // 10分钟提醒一次

  /**
   * 开始新的播放会话
   */
  startSession() {
    this.sessionStart = Date.now()
    this.lastReminderTime = Date.now()
  }

  /**
   * 获取当前会话时长（分钟）
   */
  getSessionMinutes(): number {
    if (!this.sessionStart) return 0
    return (Date.now() - this.sessionStart) / 60000
  }

  /**
   * 检查时间限制
   */
  checkLimits(): TimeLimitResult {
    const childStore = useChildStore()
    const settings = childStore.settings
    const sessionMinutes = this.getSessionMinutes()
    const totalMinutes = childStore.todayDuration + sessionMinutes

    // 检查每日限制
    if (totalMinutes >= settings.daily_limit_minutes) {
      return {
        exceeded: true,
        type: 'daily',
        message: '今天的学习时间已经够啦，明天再来吧！'
      }
    }

    // 检查单次限制
    if (sessionMinutes >= settings.session_limit_minutes) {
      return {
        exceeded: true,
        type: 'session',
        message: '已经看了很久了，让眼睛休息一下吧！'
      }
    }

    // 休息提醒（每 10 分钟）
    if (settings.rest_reminder_enabled) {
      const timeSinceReminder = Date.now() - this.lastReminderTime
      if (timeSinceReminder >= this.reminderInterval) {
        this.lastReminderTime = Date.now()
        return {
          exceeded: false,
          reminder: true,
          message: '看了一会儿了，眨眨眼睛休息一下～'
        }
      }
    }

    return {
      exceeded: false,
      message: ''
    }
  }

  /**
   * 获取剩余时间信息
   */
  getRemainingInfo(): {
    sessionRemaining: number
    dailyRemaining: number
    sessionProgress: number
    dailyProgress: number
  } {
    const childStore = useChildStore()
    const settings = childStore.settings
    const sessionMinutes = this.getSessionMinutes()
    const totalMinutes = childStore.todayDuration + sessionMinutes

    const sessionRemaining = Math.max(0, settings.session_limit_minutes - sessionMinutes)
    const dailyRemaining = Math.max(0, settings.daily_limit_minutes - totalMinutes)

    return {
      sessionRemaining: Math.round(sessionRemaining),
      dailyRemaining: Math.round(dailyRemaining),
      sessionProgress: Math.min(100, (sessionMinutes / settings.session_limit_minutes) * 100),
      dailyProgress: Math.min(100, (totalMinutes / settings.daily_limit_minutes) * 100)
    }
  }

  /**
   * 结束会话
   */
  endSession(): number {
    const duration = this.getSessionMinutes()
    const childStore = useChildStore()

    // 更新今日时长
    childStore.addTodayDuration(duration)

    this.sessionStart = null
    return Math.round(duration)
  }

  /**
   * 重置提醒时间（用户确认后继续）
   */
  resetReminder() {
    this.lastReminderTime = Date.now()
  }

  /**
   * 格式化时间显示
   */
  formatMinutes(minutes: number): string {
    if (minutes < 1) return '不到1分钟'
    if (minutes < 60) return `${Math.round(minutes)}分钟`
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
  }
}

export default new TimeLimitManager()
