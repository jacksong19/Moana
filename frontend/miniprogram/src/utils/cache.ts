/**
 * API 响应缓存管理
 * 减少重复请求，提升加载速度
 */

const CACHE_PREFIX = 'moana_cache_'
const DEFAULT_TTL = 5 * 60 * 1000  // 默认 5 分钟

interface CacheItem<T> {
  value: T
  expireAt: number
}

class CacheManager {
  /**
   * 生成缓存 key
   */
  private getKey(url: string): string {
    // 简化 URL 为有效的存储 key
    return CACHE_PREFIX + url.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 100)
  }

  /**
   * 获取缓存
   */
  get<T>(url: string): T | null {
    try {
      const key = this.getKey(url)
      const data = uni.getStorageSync(key) as CacheItem<T> | null

      if (!data) return null

      // 检查是否过期
      if (Date.now() > data.expireAt) {
        this.remove(url)
        return null
      }

      return data.value
    } catch (e) {
      return null
    }
  }

  /**
   * 设置缓存
   */
  set<T>(url: string, value: T, ttl: number = DEFAULT_TTL): boolean {
    try {
      const key = this.getKey(url)
      const item: CacheItem<T> = {
        value,
        expireAt: Date.now() + ttl
      }
      uni.setStorageSync(key, item)
      return true
    } catch (e) {
      console.warn('[Cache] 写入失败:', e)
      return false
    }
  }

  /**
   * 删除缓存
   */
  remove(url: string): void {
    try {
      uni.removeStorageSync(this.getKey(url))
    } catch (e) {
      // ignore
    }
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    try {
      const info = uni.getStorageInfoSync()
      info.keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          uni.removeStorageSync(key)
        }
      })
    } catch (e) {
      console.warn('[Cache] 清空失败:', e)
    }
  }
}

// 导出单例
export const cache = new CacheManager()
export default cache
