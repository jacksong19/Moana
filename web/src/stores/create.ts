/**
 * 创作状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  ArtStyle,
  ProtagonistConfig,
  ColorPalette,
  ThemeList,
  StyleOptions,
  TaskStatus
} from '@/api/create'
import {
  getThemes,
  getStyleOptions,
  generatePictureBookAsync,
  getPictureBookTaskStatus,
  generateNurseryRhymeAsync,
  getNurseryRhymeTaskStatus,
  generateStandaloneVideoAsync,
  getVideoTaskStatus
} from '@/api/create'
import { useChildStore } from './child'

export const useCreateStore = defineStore('create', () => {
  // ========== 基础数据 ==========
  const themes = ref<ThemeList | null>(null)
  const styleOptions = ref<StyleOptions | null>(null)
  const isLoadingOptions = ref(false)

  // ========== 当前步骤 ==========
  const currentStep = ref(1)

  // ========== 绘本参数 ==========
  const pictureBookParams = ref({
    themeCategory: '',
    themeTopic: '',
    artStyle: 'pixar_3d' as string,
    protagonist: {
      animal: 'bunny',
      color: 'white',
      accessory: 'blue overalls'
    } as ProtagonistConfig,
    colorPalette: 'pastel' as string,
    voiceId: 'Cherry'
  })

  // ========== 儿歌参数 ==========
  const nurseryRhymeParams = ref({
    themeCategory: '',
    themeTopic: '',
    musicMood: 'cheerful',
    musicGenre: '',
    tempo: 120,
    energyLevel: 5,
    vocalType: 'soft_female',
    vocalEmotion: 'happy',
    instruments: [] as string[],
    lyricComplexity: 3,
    songStructure: 'simple',
    durationPreference: 60
  })

  // ========== 视频参数 ==========
  const videoParams = ref({
    customPrompt: '',
    aspectRatio: '16:9' as '16:9' | '9:16' | '4:3' | '3:4' | '1:1',
    resolution: '720P' as '720P' | '1080P',
    durationSeconds: 5 as 4 | 5 | 6 | 8,
    motionMode: 'normal' as 'static' | 'slow' | 'normal' | 'dynamic' | 'cinematic',
    enableAudio: true,
    artStyle: 'pixar_3d' as string
  })

  // ========== 生成状态 ==========
  const currentTaskId = ref<string | null>(null)
  const generatingStatus = ref<'idle' | 'pending' | 'processing' | 'completed' | 'failed'>('idle')
  const generatingProgress = ref(0)
  const generatingStage = ref('')
  const generatingError = ref('')
  const generatedContentId = ref<string | null>(null)

  // 轮询定时器
  let pollTimer: ReturnType<typeof setInterval> | null = null

  // ========== 计算属性 ==========
  const isGenerating = computed(() =>
    generatingStatus.value === 'pending' || generatingStatus.value === 'processing'
  )

  // ========== 方法 ==========

  /**
   * 加载主题和风格选项
   */
  async function loadOptions() {
    if (themes.value && styleOptions.value) return

    isLoadingOptions.value = true
    try {
      const [themesData, stylesData] = await Promise.all([
        getThemes(),
        getStyleOptions()
      ])
      themes.value = themesData
      styleOptions.value = stylesData
    } catch (e) {
      console.error('加载选项失败:', e)
    } finally {
      isLoadingOptions.value = false
    }
  }

  /**
   * 重置创作参数
   */
  function resetParams(type: 'picture_book' | 'nursery_rhyme' | 'video') {
    currentStep.value = 1
    generatingStatus.value = 'idle'
    generatingProgress.value = 0
    generatingStage.value = ''
    generatingError.value = ''
    currentTaskId.value = null
    generatedContentId.value = null

    if (type === 'picture_book') {
      pictureBookParams.value = {
        themeCategory: '',
        themeTopic: '',
        artStyle: 'pixar_3d',
        protagonist: { animal: 'bunny', color: 'white', accessory: 'blue overalls' },
        colorPalette: 'pastel',
        voiceId: 'Cherry'
      }
    } else if (type === 'nursery_rhyme') {
      nurseryRhymeParams.value = {
        themeCategory: '',
        themeTopic: '',
        musicMood: 'cheerful',
        musicGenre: '',
        tempo: 120,
        energyLevel: 5,
        vocalType: 'soft_female',
        vocalEmotion: 'happy',
        instruments: [],
        lyricComplexity: 3,
        songStructure: 'simple',
        durationPreference: 60
      }
    } else if (type === 'video') {
      videoParams.value = {
        customPrompt: '',
        aspectRatio: '16:9',
        resolution: '720P',
        durationSeconds: 5,
        motionMode: 'normal',
        enableAudio: true,
        artStyle: 'pixar_3d'
      }
    }
  }

  /**
   * 停止轮询
   */
  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  /**
   * 开始轮询任务状态
   */
  function startPolling(
    taskId: string,
    getStatus: (id: string) => Promise<TaskStatus & { result?: any }>
  ) {
    stopPolling()

    pollTimer = setInterval(async () => {
      try {
        const status = await getStatus(taskId)
        generatingProgress.value = status.progress
        generatingStage.value = status.stage

        if (status.status === 'completed') {
          generatingStatus.value = 'completed'
          generatedContentId.value = status.content_id || null
          stopPolling()
        } else if (status.status === 'failed') {
          generatingStatus.value = 'failed'
          generatingError.value = status.error || '生成失败'
          stopPolling()
        } else {
          generatingStatus.value = status.status
        }
      } catch (e) {
        console.error('轮询状态失败:', e)
      }
    }, 3000)
  }

  /**
   * 生成绘本
   */
  async function generatePictureBook() {
    const childStore = useChildStore()
    const child = childStore.currentChild
    if (!child) throw new Error('请先选择孩子')

    const params = pictureBookParams.value
    if (!params.themeCategory || !params.themeTopic) {
      throw new Error('请选择主题')
    }

    generatingStatus.value = 'pending'
    generatingProgress.value = 0
    generatingError.value = ''

    try {
      const response = await generatePictureBookAsync({
        child_name: child.name,
        age_months: childStore.currentChildAgeMonths,
        theme_topic: params.themeTopic,
        theme_category: params.themeCategory,
        favorite_characters: child.favorite_characters,
        voice_id: params.voiceId,
        art_style: params.artStyle as ArtStyle,
        protagonist: params.protagonist,
        color_palette: params.colorPalette as ColorPalette,
        creation_mode: 'preset'
      })

      currentTaskId.value = response.task_id
      startPolling(response.task_id, getPictureBookTaskStatus)
    } catch (e: any) {
      generatingStatus.value = 'failed'
      generatingError.value = e.message || '提交任务失败'
      throw e
    }
  }

  /**
   * 生成儿歌
   */
  async function generateNurseryRhyme() {
    const childStore = useChildStore()
    const child = childStore.currentChild
    if (!child) throw new Error('请先选择孩子')

    const params = nurseryRhymeParams.value
    if (!params.themeCategory || !params.themeTopic) {
      throw new Error('请选择主题')
    }

    generatingStatus.value = 'pending'
    generatingProgress.value = 0
    generatingError.value = ''

    try {
      const response = await generateNurseryRhymeAsync({
        child_name: child.name,
        age_months: childStore.currentChildAgeMonths,
        theme_topic: params.themeTopic,
        theme_category: params.themeCategory,
        favorite_characters: child.favorite_characters,
        creation_mode: 'preset',
        music_mood: params.musicMood,
        music_genre: params.musicGenre,
        tempo: params.tempo,
        energy_level: params.energyLevel,
        vocal_type: params.vocalType,
        vocal_emotion: params.vocalEmotion,
        instruments: params.instruments,
        lyric_complexity: params.lyricComplexity,
        song_structure: params.songStructure,
        duration_preference: params.durationPreference
      })

      currentTaskId.value = response.task_id
      startPolling(response.task_id, getNurseryRhymeTaskStatus)
    } catch (e: any) {
      generatingStatus.value = 'failed'
      generatingError.value = e.message || '提交任务失败'
      throw e
    }
  }

  /**
   * 生成视频
   */
  async function generateVideo() {
    const childStore = useChildStore()
    const child = childStore.currentChild
    if (!child) throw new Error('请先选择孩子')

    const params = videoParams.value
    if (!params.customPrompt) {
      throw new Error('请输入视频描述')
    }

    generatingStatus.value = 'pending'
    generatingProgress.value = 0
    generatingError.value = ''

    try {
      const response = await generateStandaloneVideoAsync({
        child_name: child.name,
        age_months: childStore.currentChildAgeMonths,
        custom_prompt: params.customPrompt,
        generate_first_frame: true,
        aspect_ratio: params.aspectRatio,
        resolution: params.resolution,
        duration_seconds: params.durationSeconds,
        motion_mode: params.motionMode,
        enable_audio: params.enableAudio,
        art_style: params.artStyle,
        auto_enhance_prompt: true
      })

      currentTaskId.value = response.task_id
      startPolling(response.task_id, getVideoTaskStatus)
    } catch (e: any) {
      generatingStatus.value = 'failed'
      generatingError.value = e.message || '提交任务失败'
      throw e
    }
  }

  return {
    // 基础数据
    themes,
    styleOptions,
    isLoadingOptions,

    // 步骤
    currentStep,

    // 参数
    pictureBookParams,
    nurseryRhymeParams,
    videoParams,

    // 生成状态
    currentTaskId,
    generatingStatus,
    generatingProgress,
    generatingStage,
    generatingError,
    generatedContentId,
    isGenerating,

    // 方法
    loadOptions,
    resetParams,
    stopPolling,
    generatePictureBook,
    generateNurseryRhyme,
    generateVideo
  }
})
