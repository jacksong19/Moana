/**
 * 内容状态管理
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getThemes,
  generatePictureBook,
  getGeneratedList,
  getContentDetail,
  deleteContent,
  type ThemeList,
  type PictureBook,
  type GeneratePictureBookParams
} from '@/api/content'

export const useContentStore = defineStore('content', () => {
  // 状态
  const themes = ref<ThemeList | null>(null)
  const generatedList = ref<PictureBook[]>([])
  const currentContent = ref<PictureBook | null>(null)
  const isGenerating = ref(false)
  const generatingProgress = ref(0) // 0-100

  // 分页状态
  const hasMoreContent = ref(true)
  const isLoadingMore = ref(false)
  const PAGE_SIZE = 20

  // 获取主题列表
  async function fetchThemes() {
    if (themes.value) return themes.value

    try {
      themes.value = await getThemes()
      return themes.value
    } catch (e) {
      console.error('获取主题失败:', e)
      throw e
    }
  }

  // 生成绘本
  async function createPictureBook(params: GeneratePictureBookParams): Promise<PictureBook> {
    isGenerating.value = true
    generatingProgress.value = 0

    try {
      // 模拟进度更新（限制最大值为 95%，避免超过 100%）
      const progressInterval = setInterval(() => {
        if (generatingProgress.value < 90) {
          const increment = Math.random() * 10 + 2 // 2-12% 增量
          generatingProgress.value = Math.min(95, generatingProgress.value + increment)
        }
      }, 1500)

      const result = await generatePictureBook(params)

      clearInterval(progressInterval)
      generatingProgress.value = 100

      // 添加到列表
      generatedList.value.unshift(result)
      currentContent.value = result

      return result
    } catch (e) {
      console.error('生成绘本失败:', e)
      throw e
    } finally {
      isGenerating.value = false
    }
  }

  // 获取已生成内容列表（首次加载或刷新）
  async function fetchGeneratedList(refresh = false) {
    if (!refresh && generatedList.value.length > 0) {
      return generatedList.value
    }

    try {
      const res = await getGeneratedList({ limit: PAGE_SIZE, offset: 0 })
      generatedList.value = res.items
      hasMoreContent.value = res.has_more || res.items.length >= PAGE_SIZE
      return res.items
    } catch (e) {
      console.error('获取内容列表失败:', e)
      throw e
    }
  }

  // 加载更多内容（分页）
  async function fetchMoreContent() {
    if (isLoadingMore.value || !hasMoreContent.value) {
      return []
    }

    isLoadingMore.value = true
    try {
      const offset = generatedList.value.length
      const res = await getGeneratedList({ limit: PAGE_SIZE, offset })

      if (res.items.length > 0) {
        generatedList.value = [...generatedList.value, ...res.items]
      }

      hasMoreContent.value = res.has_more || res.items.length >= PAGE_SIZE
      return res.items
    } catch (e) {
      console.error('加载更多内容失败:', e)
      throw e
    } finally {
      isLoadingMore.value = false
    }
  }

  // 获取内容详情
  async function fetchContentDetail(contentId: string) {
    try {
      console.log('[fetchContentDetail] 请求内容详情:', contentId)
      const result = await getContentDetail(contentId)
      console.log('[fetchContentDetail] 响应数据:', JSON.stringify(result).slice(0, 500))
      currentContent.value = result
      return currentContent.value
    } catch (e: any) {
      console.error('[fetchContentDetail] 获取内容详情失败:', e?.message || e)
      throw e
    }
  }

  // 设置当前内容
  function setCurrentContent(content: PictureBook | null) {
    currentContent.value = content
  }

  // 清除生成状态
  function clearGenerating() {
    isGenerating.value = false
    generatingProgress.value = 0
  }

  // 删除内容
  async function removeContent(contentId: string) {
    try {
      await deleteContent(contentId)
      // 从本地列表中移除
      generatedList.value = generatedList.value.filter(item => item.id !== contentId)
      // 如果删除的是当前内容，清空
      if (currentContent.value?.id === contentId) {
        currentContent.value = null
      }
    } catch (e) {
      console.error('删除内容失败:', e)
      throw e
    }
  }

  return {
    themes,
    generatedList,
    currentContent,
    isGenerating,
    generatingProgress,
    hasMoreContent,
    isLoadingMore,
    fetchThemes,
    createPictureBook,
    fetchGeneratedList,
    fetchMoreContent,
    fetchContentDetail,
    setCurrentContent,
    clearGenerating,
    removeContent
  }
})
