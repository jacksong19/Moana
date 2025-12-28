/**
 * 收藏状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  addFavorite,
  removeFavorite,
  checkFavorite,
  getFavoriteList,
  type FavoriteItem
} from '@/api/favorite'

export const useFavoriteStore = defineStore('favorite', () => {
  // 状态
  const favorites = ref<FavoriteItem[]>([])
  const favoriteIds = ref<Set<string>>(new Set())
  const loading = ref(false)
  const hasMore = ref(true)
  const currentPage = ref(1)

  // 计算属性
  const favoriteCount = computed(() => favorites.value.length)

  // 检查是否已收藏
  function isFavorite(contentId: string): boolean {
    return favoriteIds.value.has(contentId)
  }

  // 切换收藏状态
  async function toggleFavorite(contentId: string): Promise<boolean> {
    try {
      if (isFavorite(contentId)) {
        await removeFavorite(contentId)
        favoriteIds.value.delete(contentId)
        favorites.value = favorites.value.filter(f => f.content_id !== contentId)
        return false
      } else {
        await addFavorite(contentId)
        favoriteIds.value.add(contentId)
        return true
      }
    } catch (e) {
      console.error('切换收藏失败:', e)
      throw e
    }
  }

  // 获取收藏列表
  async function fetchFavorites(refresh = false) {
    if (loading.value) return
    if (!refresh && !hasMore.value) return

    loading.value = true
    try {
      const page = refresh ? 1 : currentPage.value
      const res = await getFavoriteList({ page, page_size: 20 })

      if (refresh) {
        favorites.value = res.items
        favoriteIds.value = new Set(res.items.map(f => f.content_id))
      } else {
        favorites.value.push(...res.items)
        res.items.forEach(f => favoriteIds.value.add(f.content_id))
      }

      currentPage.value = page + 1
      hasMore.value = favorites.value.length < res.total
    } catch (e) {
      console.error('获取收藏列表失败:', e)
    } finally {
      loading.value = false
    }
  }

  // 初始化收藏状态（检查单个内容）
  async function checkContentFavorite(contentId: string) {
    try {
      const res = await checkFavorite(contentId)
      if (res.is_favorite) {
        favoriteIds.value.add(contentId)
      }
    } catch (e) {
      // 忽略检查错误
    }
  }

  return {
    favorites,
    favoriteCount,
    loading,
    hasMore,
    isFavorite,
    toggleFavorite,
    fetchFavorites,
    checkContentFavorite
  }
})
