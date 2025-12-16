<template>
  <view class="page-container">
    <!-- 导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="back-btn" @tap="goBack">
          <text>‹</text>
        </view>
        <text class="nav-title">创作儿歌</text>
        <view class="nav-right"></view>
      </view>
    </view>
    <view class="nav-placeholder" :style="{ height: navHeight + 'px' }"></view>

    <!-- 主内容 -->
    <scroll-view class="main-scroll" scroll-y>
      <!-- 步骤指示器 -->
      <view class="steps-indicator">
        <view
          v-for="(step, index) in steps"
          :key="step.id"
          class="step-item"
          :class="{ active: currentStep >= index, done: currentStep > index }"
        >
          <view class="step-dot">
            <text v-if="currentStep > index">✓</text>
            <text v-else>{{ index + 1 }}</text>
          </view>
          <text class="step-name">{{ step.name }}</text>
        </view>
        <view class="step-line"></view>
      </view>

      <!-- 步骤 1: 选择主题 -->
      <view v-if="currentStep === 0" class="step-content animate-fadeIn">
        <text class="step-title">选择儿歌主题</text>
        <text class="step-desc">为 {{ childName }} 选择一个适合的主题</text>

        <!-- 主题分类 Tab -->
        <view class="theme-tabs">
          <view
            v-for="cat in themeCategories"
            :key="cat.id"
            class="tab-item"
            :class="{ active: selectedCategory === cat.id }"
            @tap="selectedCategory = cat.id"
          >
            <text class="tab-icon">{{ cat.icon }}</text>
            <text class="tab-name">{{ cat.name }}</text>
          </view>
        </view>

        <!-- 主题列表 -->
        <view class="theme-grid">
          <view
            v-for="theme in filteredThemes"
            :key="theme.id"
            class="theme-card"
            :class="{ selected: selectedTheme?.id === theme.id }"
            @tap="selectTheme(theme)"
          >
            <view class="theme-icon">
              <text>{{ getThemeIcon(theme.id) }}</text>
            </view>
            <text class="theme-name">{{ theme.name }}</text>
            <view v-if="selectedTheme?.id === theme.id" class="theme-check">
              <text>✓</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 步骤 2: 音乐风格 -->
      <view v-if="currentStep === 1" class="step-content animate-fadeIn">
        <text class="step-title">选择音乐风格</text>
        <text class="step-desc">选择 {{ childName }} 喜欢的旋律风格</text>

        <view class="form-section">
          <view class="style-grid">
            <view
              v-for="style in musicStyles"
              :key="style.value"
              class="style-card"
              :class="{ selected: selectedStyle === style.value }"
              @tap="selectedStyle = style.value"
            >
              <text class="style-icon">{{ style.icon }}</text>
              <text class="style-name">{{ style.name }}</text>
              <text class="style-desc">{{ style.desc }}</text>
              <view v-if="selectedStyle === style.value" class="style-check">
                <text>✓</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 步骤 3: 确认生成 -->
      <view v-if="currentStep === 2" class="step-content animate-fadeIn">
        <text class="step-title">确认创作</text>
        <text class="step-desc">检查设置，开始生成专属儿歌</text>

        <view class="confirm-card">
          <view class="confirm-item">
            <text class="confirm-label">儿歌主题</text>
            <text class="confirm-value">{{ selectedTheme?.name }}</text>
          </view>
          <view class="confirm-item">
            <text class="confirm-label">主人公</text>
            <text class="confirm-value">{{ childName }}</text>
          </view>
          <view class="confirm-item">
            <text class="confirm-label">音乐风格</text>
            <text class="confirm-value">{{ currentStyleName }}</text>
          </view>
        </view>

        <view class="confirm-tip">
          <text class="tip-icon">💡</text>
          <text class="tip-text">生成过程大约需要 1-2 分钟，请耐心等待</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <view v-if="currentStep > 0" class="btn-secondary" @tap="prevStep">
        <text>上一步</text>
      </view>
      <view
        class="btn-primary"
        :class="{ disabled: !canNext }"
        @tap="handleNext"
      >
        <text>{{ currentStep === 2 ? '开始创作' : '下一步' }}</text>
      </view>
    </view>

    <!-- 生成进度 -->
    <GeneratingProgress
      v-if="isGenerating"
      :progress="generatingProgress"
      :stage="generatingStage"
      :message="generatingMessage"
      type="song"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useChildStore } from '@/stores/child'
import { useContentStore } from '@/stores/content'
import GeneratingProgress from '@/components/GeneratingProgress/GeneratingProgress.vue'
import { generateNurseryRhymeAsync, getNurseryRhymeTaskStatus, getContentDetail } from '@/api/content'
import type { ThemeItem, MusicStyle, NurseryRhyme, SunoTaskStage, NurseryRhymeTaskStatus } from '@/api/content'

const childStore = useChildStore()
const contentStore = useContentStore()

// 导航栏
const statusBarHeight = ref(20)
const navHeight = ref(88)

// 步骤
const steps = [
  { id: 'theme', name: '选主题' },
  { id: 'style', name: '选风格' },
  { id: 'confirm', name: '确认' }
]
const currentStep = ref(0)

// 主题（后端只支持 habit 和 cognition）
const themeCategories = [
  { id: 'habit', name: '习惯养成', icon: '🌟' },
  { id: 'cognition', name: '认知世界', icon: '🌍' }
]
const selectedCategory = ref('habit')
const selectedTheme = ref<ThemeItem | null>(null)

// 音乐风格
const musicStyles: { value: MusicStyle; name: string; icon: string; desc: string }[] = [
  { value: 'cheerful', name: '欢快活泼', icon: '🎉', desc: '节奏明快，充满活力' },
  { value: 'gentle', name: '温柔舒缓', icon: '🌸', desc: '轻柔优美，温馨甜蜜' },
  { value: 'playful', name: '俏皮可爱', icon: '🎈', desc: '趣味十足，朗朗上口' },
  { value: 'lullaby', name: '摇篮曲风', icon: '🌙', desc: '安静柔和，适合入睡' },
  { value: 'educational', name: '启蒙教育', icon: '📚', desc: '寓教于乐，知识丰富' }
]
const selectedStyle = ref<MusicStyle>('cheerful')

// 生成状态
const isGenerating = ref(false)
const generatingProgress = ref(0)
const generatingStage = ref<SunoTaskStage>('waiting')
const generatingMessage = ref('')
const pollErrorCount = ref(0)  // 轮询错误计数

// 存储生成结果
const generatedSong = ref<NurseryRhyme | null>(null)

// 模拟进度定时器
let simulateProgressTimer: number | null = null

// 阶段对应的进度范围和消息（严格对应 Suno 回调阶段）
// Suno 回调: text(文本完成) → first(首曲完成) → complete(全部完成)
const stageInfo: Record<string, { minProgress: number; maxProgress: number; message: string }> = {
  // Suno 标准阶段
  waiting: { minProgress: 1, maxProgress: 30, message: '正在生成歌词文本...' },
  text: { minProgress: 35, maxProgress: 65, message: '文本完成，正在生成音乐...' },
  first: { minProgress: 70, maxProgress: 90, message: '首曲完成，继续生成...' },
  complete: { minProgress: 100, maxProgress: 100, message: '全部完成！' },
  error: { minProgress: 0, maxProgress: 0, message: '生成失败' },
  // 兼容其他可能的阶段名称（映射到标准阶段）
  pending: { minProgress: 1, maxProgress: 30, message: '正在生成歌词文本...' },
  processing: { minProgress: 35, maxProgress: 65, message: '正在生成音乐...' },
  generating: { minProgress: 35, maxProgress: 65, message: '正在生成音乐...' },
  queued: { minProgress: 1, maxProgress: 15, message: '排队中...' },
  submitted: { minProgress: 1, maxProgress: 20, message: '已提交，等待处理...' }
}

// 计算属性
const childName = computed(() => childStore.currentChild?.name || '宝贝')

const filteredThemes = computed(() => {
  const themes = contentStore.themes?.[selectedCategory.value]?.themes || []
  return themes.length > 0 ? themes : defaultThemes[selectedCategory.value] || []
})

const currentStyleName = computed(() => {
  return musicStyles.find(s => s.value === selectedStyle.value)?.name || ''
})

const canNext = computed(() => {
  if (currentStep.value === 0) return !!selectedTheme.value
  return true
})

// 默认主题（API 未返回时使用，后端只支持 habit 和 cognition）
const defaultThemes: Record<string, ThemeItem[]> = {
  habit: [
    { id: 'brushing_teeth', name: '刷牙', subcategory: '生活习惯', age_range: [24, 48], keywords: [] },
    { id: 'eating_vegetables', name: '吃蔬菜', subcategory: '饮食习惯', age_range: [24, 48], keywords: [] },
    { id: 'sleeping_early', name: '早睡早起', subcategory: '作息习惯', age_range: [24, 60], keywords: [] },
    { id: 'washing_hands', name: '洗手', subcategory: '卫生习惯', age_range: [18, 48], keywords: [] },
    { id: 'tidying_up', name: '整理玩具', subcategory: '生活习惯', age_range: [30, 60], keywords: [] },
    { id: 'polite_words', name: '礼貌用语', subcategory: '行为习惯', age_range: [24, 60], keywords: [] }
  ],
  cognition: [
    { id: 'colors', name: '认识颜色', subcategory: '基础认知', age_range: [12, 36], keywords: [] },
    { id: 'animals', name: '认识动物', subcategory: '自然认知', age_range: [12, 48], keywords: [] },
    { id: 'numbers', name: '认识数字', subcategory: '数学启蒙', age_range: [24, 48], keywords: [] },
    { id: 'seasons', name: '四季变化', subcategory: '自然认知', age_range: [30, 60], keywords: [] },
    { id: 'body_parts', name: '认识身体', subcategory: '基础认知', age_range: [18, 36], keywords: [] },
    { id: 'vehicles', name: '交通工具', subcategory: '生活认知', age_range: [18, 48], keywords: [] }
  ]
}

// 主题图标映射
const themeIcons: Record<string, string> = {
  brushing_teeth: '🦷', eating_vegetables: '🥬', sleeping_early: '🌙',
  washing_hands: '🧼', tidying_up: '🧸', polite_words: '👋',
  colors: '🎨', animals: '🦁', numbers: '🔢',
  seasons: '🍂', body_parts: '👋', vehicles: '🚗',
  sharing: '🤝', making_friends: '👫', managing_anger: '😤',
  courage: '💪', love_family: '❤️', helping_others: '🤗'
}

function getThemeIcon(id: string): string {
  return themeIcons[id] || '🎵'
}

function selectTheme(theme: ThemeItem) {
  selectedTheme.value = theme
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

async function handleNext() {
  if (!canNext.value) return

  if (currentStep.value < 2) {
    currentStep.value++
  } else {
    await startGenerate()
  }
}

// 启动模拟进度（在真实进度返回前显示进度变化）
function startSimulateProgress() {
  stopSimulateProgress()
  console.log('[startSimulateProgress] 启动模拟进度')

  simulateProgressTimer = setInterval(() => {
    const stage = generatingStage.value
    const info = stageInfo[stage]

    // 如果当前阶段没有定义，使用默认值
    if (!info) {
      console.log('[模拟进度] 未知阶段:', stage, '使用默认进度范围')
      // 未知阶段也允许进度增加
      const currentProgress = generatingProgress.value
      if (currentProgress < 95) {
        const increment = Math.random() * 1.5 + 0.5
        generatingProgress.value = Math.min(currentProgress + increment, 95)
      }
      return
    }

    // 在当前阶段的进度范围内缓慢增加
    const currentProgress = generatingProgress.value
    if (currentProgress < info.maxProgress) {
      // 每次增加 1-2%，但不超过当前阶段的最大值
      const increment = Math.random() * 1.5 + 0.5
      generatingProgress.value = Math.min(currentProgress + increment, info.maxProgress)
    }
  }, 1000) as unknown as number
}

// 停止模拟进度
function stopSimulateProgress() {
  if (simulateProgressTimer) {
    clearInterval(simulateProgressTimer)
    simulateProgressTimer = null
  }
}

// 标准化阶段名称（将后端返回的各种阶段名映射到前端标准阶段）
function normalizeStage(backendStage: string): string {
  const stageMapping: Record<string, string> = {
    // 等待/排队阶段
    'pending': 'waiting',
    'queued': 'waiting',
    'submitted': 'waiting',
    'init': 'waiting',
    // 歌词生成阶段
    'text': 'text',
    'lyrics': 'text',
    'TEXT_SUCCESS': 'text',
    // 歌曲生成阶段
    'first': 'first',
    'generating': 'first',
    'processing': 'first',
    'FIRST_SUCCESS': 'first',
    // 完成阶段
    'complete': 'complete',
    'completed': 'complete',
    'success': 'complete',
    'SUCCESS': 'complete',
    'done': 'complete',
    // 错误阶段
    'error': 'error',
    'failed': 'error',
    'ERROR': 'error'
  }
  return stageMapping[backendStage] || backendStage
}

// 轮询任务状态（使用新版异步 API）
async function pollTaskStatus(taskId: string): Promise<NurseryRhyme | null> {
  const maxAttempts = 120  // 最多轮询 120 次（6分钟，Suno 可能较慢）
  const pollInterval = 3000  // 3秒轮询一次
  const maxConsecutiveErrors = 5  // 最大连续错误次数

  pollErrorCount.value = 0

  // 启动模拟进度
  startSimulateProgress()

  console.log('[pollTaskStatus] 开始轮询，taskId:', taskId, '最大尝试:', maxAttempts)

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const status: NurseryRhymeTaskStatus = await getNurseryRhymeTaskStatus(taskId)
      console.log(`[pollTaskStatus] 第 ${attempt + 1}/${maxAttempts} 次轮询，原始响应:`, JSON.stringify(status))

      // 成功获取状态，重置错误计数
      pollErrorCount.value = 0

      // 标准化并更新阶段
      const rawStage = status.stage || 'waiting'
      const normalizedStage = normalizeStage(rawStage)
      console.log('[pollTaskStatus] 原始阶段:', rawStage, '-> 标准化:', normalizedStage)

      if (normalizedStage) {
        const prevStage = generatingStage.value
        generatingStage.value = normalizedStage as SunoTaskStage

        // 阶段变化时，立即跳到该阶段的最小进度
        if (prevStage !== normalizedStage) {
          const minProgress = stageInfo[normalizedStage]?.minProgress || 0
          if (generatingProgress.value < minProgress) {
            generatingProgress.value = minProgress
            console.log('[pollTaskStatus] 阶段变化，跳转到最小进度:', minProgress)
          }
        }
      }

      // 更新消息
      generatingMessage.value = status.message || stageInfo[normalizedStage]?.message || '处理中...'

      // 使用后端进度（如果有且更大），否则继续模拟
      if (status.progress && status.progress > generatingProgress.value) {
        generatingProgress.value = status.progress
        console.log('[pollTaskStatus] 使用后端进度:', status.progress)
      }

      console.log('[pollTaskStatus] 当前进度:', generatingProgress.value, '阶段:', generatingStage.value, '状态:', status.status)

      // 检查是否完成 - 多种条件检测
      const isCompleted = status.status === 'completed' ||
                          normalizedStage === 'complete' ||
                          status.progress === 100 ||
                          status.progress >= 95  // 进度 >=95% 也视为接近完成

      if (isCompleted) {
        console.log('[pollTaskStatus] 检测到完成状态，status:', status.status, 'stage:', normalizedStage, 'progress:', status.progress)

        // 优先使用 result 字段
        if (status.result) {
          stopSimulateProgress()
          generatingProgress.value = 100
          console.log('[pollTaskStatus] 完成！返回 result:', JSON.stringify(status.result))
          return status.result
        }

        // 如果有 content_id，从详情 API 获取完整数据
        if (status.content_id) {
          stopSimulateProgress()
          generatingProgress.value = 100
          console.log('[pollTaskStatus] 完成（无 result），尝试获取详情，content_id:', status.content_id)

          try {
            // 从详情 API 获取完整的儿歌数据
            const detail = await getContentDetail(status.content_id)
            console.log('[pollTaskStatus] 详情 API 返回:', JSON.stringify(detail))

            // 转换为 NurseryRhyme 格式
            return {
              id: detail.id,
              title: detail.title,
              audio_url: (detail as any).audio_url || '',
              video_url: (detail as any).video_url || '',
              cover_url: (detail as any).cover_url || '',
              suno_cover_url: (detail as any).suno_cover_url || '',
              duration: (detail as any).audio_duration || detail.total_duration || 0,
              theme_topic: detail.theme_topic || selectedTheme.value?.name || '',
              music_style: selectedStyle.value,
              lyrics: (detail as any).lyrics || '',
              all_tracks: (detail as any).all_tracks || [],
              personalization: detail.personalization || { child_name: childStore.currentChild?.name || '' },
              created_at: detail.created_at
            } as NurseryRhyme
          } catch (detailError) {
            console.error('[pollTaskStatus] 获取详情失败:', detailError)
            // 即使详情获取失败，也返回基本数据
            return {
              id: status.content_id,
              title: selectedTheme.value?.name || '儿歌',
              audio_url: '',
              duration: 0,
              theme_topic: selectedTheme.value?.name || '',
              music_style: selectedStyle.value,
              lyrics: '',
              personalization: { child_name: childStore.currentChild?.name || '' },
              created_at: new Date().toISOString()
            } as NurseryRhyme
          }
        }

        // 进度 >=95 但没有 content_id，继续轮询等待完全完成
        if (status.progress >= 95 && status.progress < 100 && !status.content_id) {
          console.log('[pollTaskStatus] 进度接近完成但无 content_id，继续等待...')
        } else {
          console.log('[pollTaskStatus] 完成状态但无数据，继续等待...')
        }
      }

      // 检查失败状态
      if (status.status === 'failed' || normalizedStage === 'error') {
        stopSimulateProgress()
        throw new Error(status.error || status.message || '生成失败')
      }

      // 等待后继续轮询
      await new Promise(resolve => setTimeout(resolve, pollInterval))
    } catch (e: any) {
      // 如果是我们抛出的错误（生成失败），直接抛出
      if (e.message && (e.message.includes('生成失败') || e.message.includes('网络连接失败'))) {
        throw e
      }

      pollErrorCount.value++
      console.error(`[pollTaskStatus] 轮询错误 (${pollErrorCount.value}/${maxConsecutiveErrors}):`, e.message || e)

      // 更新消息显示网络状态
      if (pollErrorCount.value >= 2) {
        generatingMessage.value = `网络不稳定，正在重试... (${pollErrorCount.value})`
      }

      // 连续错误次数过多，停止轮询
      if (pollErrorCount.value >= maxConsecutiveErrors) {
        stopSimulateProgress()
        throw new Error('网络连接失败，请检查网络后重试')
      }

      // 等待后继续尝试
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, pollInterval))
      }
    }
  }

  stopSimulateProgress()
  console.error('[pollTaskStatus] 轮询超时，已尝试', maxAttempts, '次')
  throw new Error('生成超时，请重试')
}

async function startGenerate() {
  if (!selectedTheme.value || !childStore.currentChild) return

  isGenerating.value = true
  generatingProgress.value = 1  // 起始进度 1%
  generatingStage.value = 'waiting'
  generatingMessage.value = '正在提交生成任务...'
  pollErrorCount.value = 0

  try {
    const ageMonths = childStore.currentChildAgeMonths || 36

    // 发起异步生成请求（新版 API，立即返回 task_id）
    console.log('[startGenerate] 发起异步生成请求')
    const asyncResult = await generateNurseryRhymeAsync({
      child_name: childStore.currentChild.name,
      age_months: ageMonths,
      theme_topic: selectedTheme.value.name,
      theme_category: selectedCategory.value,
      music_style: selectedStyle.value
    })

    console.log('[startGenerate] 异步请求返回:', asyncResult)

    const taskId = asyncResult.task_id
    if (!taskId) {
      throw new Error('未获取到任务 ID，请重试')
    }

    console.log('[startGenerate] 获取到 task_id:', taskId)
    generatingMessage.value = 'AI 正在创作歌词...'

    // 轮询任务状态
    const finalResult = await pollTaskStatus(taskId)
    if (finalResult) {
      generatedSong.value = finalResult
    }

    generatingProgress.value = 100
    generatingMessage.value = '生成完成！'

    // 跳转到播放页
    setTimeout(() => {
      isGenerating.value = false
      if (generatedSong.value) {
        console.log('[startGenerate] 存储到临时存储')
        uni.setStorageSync('temp_nursery_rhyme', generatedSong.value)
        uni.redirectTo({
          url: `/pages/play/nursery-rhyme?id=${generatedSong.value.id || ''}&fromGenerate=1`
        })
      }
    }, 500)
  } catch (e: any) {
    stopSimulateProgress()
    isGenerating.value = false
    generatingStage.value = 'error'
    console.error('[startGenerate] 生成儿歌失败:', e)
    uni.showToast({ title: e.message || '生成失败，请重试', icon: 'none' })
  }
}

function goBack() {
  uni.navigateBack()
}

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 20
  navHeight.value = statusBarHeight.value + 44

  // 加载主题
  contentStore.fetchThemes()
})

// 处理传入的主题参数
onLoad((options) => {
  if (options?.theme) {
    for (const catId of Object.keys(defaultThemes)) {
      const found = defaultThemes[catId].find(t => t.id === options.theme)
      if (found) {
        selectedCategory.value = catId
        selectedTheme.value = found
        break
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page-container {
  min-height: 100vh;
  background: $bg-base;
  display: flex;
  flex-direction: column;
  width: 750rpx;
  overflow: hidden;
}

// 导航栏
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: $z-sticky;
  background: $bg-base;
  width: 750rpx;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 $spacing-md;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;

  text {
    font-size: 48rpx;
    color: $text-primary;
    line-height: 1;
  }
}

.nav-title {
  font-size: $font-md;
  font-weight: $font-semibold;
  color: $text-primary;
}

.nav-right {
  width: 64rpx;
}

.nav-placeholder {
  flex-shrink: 0;
}

// 主滚动区
.main-scroll {
  flex: 1;
  width: 750rpx;
  padding: 0 $spacing-md;
  box-sizing: border-box;
}

// 步骤指示器
.steps-indicator {
  position: relative;
  display: flex;
  justify-content: space-between;
  padding: $spacing-lg 0;
  margin-bottom: $spacing-md;
}

.step-line {
  position: absolute;
  top: calc(#{$spacing-lg} + 18rpx);
  left: 60rpx;
  right: 60rpx;
  height: 4rpx;
  background: $uni-border-color;
}

.step-item {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
}

.step-dot {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: $bg-card;
  border: 4rpx solid $uni-border-color;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $duration-base;

  text {
    font-size: $font-xs;
    color: $text-light;
  }

  .active & {
    border-color: $secondary;
    background: $secondary;

    text { color: $text-white; }
  }

  .done & {
    border-color: $success;
    background: $success;

    text { color: $text-white; font-size: 20rpx; }
  }
}

.step-name {
  font-size: $font-xs;
  color: $text-light;

  .active & { color: $secondary; font-weight: $font-medium; }
  .done & { color: $success; }
}

// 步骤内容
.step-content {
  padding-bottom: 200rpx;
}

.step-title {
  display: block;
  font-size: $font-xl;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.step-desc {
  display: block;
  font-size: $font-base;
  color: $text-secondary;
  margin-bottom: $spacing-lg;
}

// 主题 Tab
.theme-tabs {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-sm;
  background: $bg-card;
  border-radius: $radius-md;
  border: 2rpx solid transparent;
  transition: all $duration-fast;

  &.active {
    border-color: $secondary;
    background: rgba($secondary, 0.05);
  }
}

.tab-icon {
  font-size: 36rpx;
  margin-bottom: 4rpx;
}

.tab-name {
  font-size: $font-sm;
  color: $text-primary;

  .active & { color: $secondary; font-weight: $font-medium; }
}

// 主题网格
.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-sm;
  width: 100%;
  box-sizing: border-box;
}

.theme-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-md $spacing-sm;
  background: $bg-card;
  border-radius: $radius-md;
  border: 2rpx solid transparent;
  box-shadow: $shadow-sm;
  transition: all $duration-fast;

  &.selected {
    border-color: $secondary;
    background: rgba($secondary, 0.05);
  }

  &:active {
    transform: scale(0.96);
  }
}

.theme-icon {
  font-size: 48rpx;
  margin-bottom: $spacing-xs;
}

.theme-name {
  font-size: $font-sm;
  color: $text-primary;
  text-align: center;
}

.theme-check {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 32rpx;
  height: 32rpx;
  background: $secondary;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 18rpx;
    color: $text-white;
  }
}

// 表单
.form-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

// 音乐风格网格
.style-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-sm;
}

.style-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-lg $spacing-sm;
  background: $bg-card;
  border-radius: $radius-md;
  border: 2rpx solid transparent;
  box-shadow: $shadow-sm;
  transition: all $duration-fast;

  &.selected {
    border-color: $secondary;
    background: rgba($secondary, 0.05);
  }

  &:active {
    transform: scale(0.96);
  }
}

.style-icon {
  font-size: 56rpx;
  margin-bottom: $spacing-xs;
}

.style-name {
  font-size: $font-md;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: 4rpx;
}

.style-desc {
  font-size: $font-xs;
  color: $text-secondary;
  text-align: center;
}

.style-check {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 32rpx;
  height: 32rpx;
  background: $secondary;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 18rpx;
    color: $text-white;
  }
}

// 确认卡片
.confirm-card {
  background: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
}

.confirm-item {
  display: flex;
  justify-content: space-between;
  padding: $spacing-sm 0;
  border-bottom: 1rpx solid $uni-border-color;

  &:last-child {
    border-bottom: none;
  }
}

.confirm-label {
  font-size: $font-base;
  color: $text-secondary;
}

.confirm-value {
  font-size: $font-base;
  font-weight: $font-medium;
  color: $text-primary;
}

.confirm-tip {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  background: rgba($secondary, 0.1);
  border-radius: $radius-md;
}

.tip-icon {
  font-size: 32rpx;
}

.tip-text {
  font-size: $font-sm;
  color: $secondary;
}

// 底部按钮
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
  gap: $spacing-sm;
  padding: $spacing-md;
  padding-bottom: calc(#{$spacing-md} + env(safe-area-inset-bottom));
  background: $bg-card;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
  width: 750rpx;
  box-sizing: border-box;
}

.btn-secondary {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-base;
  border-radius: $radius-lg;
  border: 2rpx solid $uni-border-color;

  text {
    font-size: $font-md;
    color: $text-secondary;
  }

  &:active {
    background: $bg-warm;
  }
}

.btn-primary {
  flex: 2;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $gradient-secondary;
  border-radius: $radius-lg;
  box-shadow: $shadow-button;

  text {
    font-size: $font-md;
    font-weight: $font-semibold;
    color: $text-white;
  }

  &:active {
    transform: scale(0.98);
  }

  &.disabled {
    background: $text-light;
    box-shadow: none;
  }
}
</style>
