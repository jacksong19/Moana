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
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        if (generatingProgress.value < 90) {
          generatingProgress.value += Math.random() * 15
        }
      }, 1000)

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

  // 获取已生成内容列表
  async function fetchGeneratedList(refresh = false) {
    if (!refresh && generatedList.value.length > 0) {
      return generatedList.value
    }

    try {
      const res = await getGeneratedList({ limit: 20 })
      generatedList.value = res.items
      return res.items
    } catch (e) {
      console.error('获取内容列表失败:', e)
      throw e
    }
  }

  // 获取内容详情
  async function fetchContentDetail(contentId: string) {
    try {
      currentContent.value = await getContentDetail(contentId)
      return currentContent.value
    } catch (e) {
      console.error('获取内容详情失败:', e)
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

  return {
    themes,
    generatedList,
    currentContent,
    isGenerating,
    generatingProgress,
    fetchThemes,
    createPictureBook,
    fetchGeneratedList,
    fetchContentDetail,
    setCurrentContent,
    clearGenerating
  }
})
