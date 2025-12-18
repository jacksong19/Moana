<template>
  <view class="page-container">
    <!-- 星空背景 -->
    <view class="cosmos-bg">
      <view class="stars-layer"></view>
      <view class="nebula nebula-1"></view>
      <view class="nebula nebula-2"></view>
    </view>

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

      <!-- 步骤 2: 风格设置 -->
      <view v-if="currentStep === 1" class="step-content animate-fadeIn">
        <view class="style-header">
          <text class="step-title">风格设置</text>
          <text class="step-desc">选择 {{ childName }} 喜欢的音乐和封面风格</text>
        </view>

        <view class="style-sections">
          <!-- 音乐情绪 - 大卡片展示 -->
          <view class="style-section music-section">
            <view class="section-header">
              <view class="section-icon-wrap music">
                <text class="section-icon">🎵</text>
              </view>
              <text class="section-title">音乐情绪</text>
            </view>
            <view class="music-mood-grid">
              <view
                v-for="style in musicStyles"
                :key="style.value"
                class="music-mood-card"
                :class="{ selected: selectedStyle === style.value }"
                @tap="selectedStyle = style.value"
              >
                <view class="mood-visual" :class="style.value">
                  <text class="mood-icon">{{ style.icon }}</text>
                  <view class="mood-bars">
                    <view class="bar" v-for="i in 5" :key="i"></view>
                  </view>
                </view>
                <view class="mood-info">
                  <text class="mood-name">{{ style.name }}</text>
                  <text class="mood-desc">{{ style.desc }}</text>
                </view>
                <view v-if="selectedStyle === style.value" class="mood-check">
                  <text>✓</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 封面艺术风格 - 横向滚动 -->
          <view class="style-section cover-section">
            <view class="section-header">
              <view class="section-icon-wrap art">
                <text class="section-icon">🎨</text>
              </view>
              <text class="section-title">封面风格</text>
            </view>
            <view class="cover-art-carousel">
              <view
                v-for="style in artStyles"
                :key="style.value"
                class="cover-art-card"
                :class="{ selected: selectedArtStyle === style.value }"
                @tap="selectedArtStyle = style.value"
              >
                <view class="cover-art-bg" :class="style.value"></view>
                <view class="cover-art-content">
                  <text class="cover-art-icon">{{ style.icon }}</text>
                  <text class="cover-art-name">{{ style.label }}</text>
                </view>
                <view v-if="selectedArtStyle === style.value" class="cover-art-check">
                  <text>✓</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 封面主角 - 圆形头像 -->
          <view class="style-section character-section">
            <view class="section-header">
              <view class="section-icon-wrap bunny">
                <text class="section-icon">🐰</text>
              </view>
              <text class="section-title">封面主角</text>
            </view>
            <view class="character-carousel">
              <view
                v-for="animal in protagonistAnimals"
                :key="animal.value"
                class="character-card"
                :class="{ selected: selectedAnimal === animal.value }"
                @tap="selectedAnimal = animal.value"
              >
                <view class="character-avatar">
                  <text class="char-emoji">{{ animal.emoji }}</text>
                </view>
                <text class="char-name">{{ animal.label }}</text>
                <view v-if="selectedAnimal === animal.value" class="char-ring"></view>
              </view>
            </view>
          </view>

          <!-- 画面色调 - 条纹预览 -->
          <view class="style-section palette-section">
            <view class="section-header">
              <view class="section-icon-wrap palette">
                <text class="section-icon">🌈</text>
              </view>
              <text class="section-title">画面色调</text>
            </view>
            <view class="palette-list">
              <view
                v-for="palette in colorPalettes"
                :key="palette.value"
                class="palette-card"
                :class="{ selected: selectedPalette === palette.value }"
                @tap="selectedPalette = palette.value"
              >
                <view class="palette-preview" :class="palette.value">
                  <view class="palette-stripe" v-for="i in 4" :key="i"></view>
                </view>
                <view class="palette-info">
                  <text class="palette-name">{{ palette.label }}</text>
                  <text class="palette-desc">{{ palette.description }}</text>
                </view>
                <view v-if="selectedPalette === palette.value" class="palette-check">
                  <text>✓</text>
                </view>
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
          <view class="confirm-item">
            <text class="confirm-label">封面风格</text>
            <text class="confirm-value">{{ currentArtStyleName }}</text>
          </view>
          <view class="confirm-item">
            <text class="confirm-label">封面主角</text>
            <text class="confirm-value">{{ currentAnimalName }}</text>
          </view>
          <view class="confirm-item">
            <text class="confirm-label">画面色调</text>
            <text class="confirm-value">{{ currentPaletteName }}</text>
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
import type {
  ThemeItem,
  MusicStyle,
  NurseryRhyme,
  SunoTaskStage,
  NurseryRhymeTaskStatus,
  ArtStyle,
  ProtagonistAnimal,
  ColorPalette
} from '@/api/content'

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

// 主题分类（与 API 返回的分类保持一致）
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

// 封面艺术风格选项
const artStyles = [
  { value: 'pixar_3d' as ArtStyle, label: '3D 动画', icon: '🎬', desc: '皮克斯风格' },
  { value: 'watercolor' as ArtStyle, label: '水彩', icon: '🎨', desc: '柔和温馨' },
  { value: 'flat_vector' as ArtStyle, label: '扁平插画', icon: '✨', desc: '现代简约' },
  { value: 'crayon' as ArtStyle, label: '蜡笔画', icon: '🖍️', desc: '童趣手绘' },
  { value: 'anime' as ArtStyle, label: '日系动漫', icon: '🌸', desc: '可爱细腻' }
]
const selectedArtStyle = ref<ArtStyle>('pixar_3d')

// 主角动物选项
const protagonistAnimals = [
  { value: 'bunny' as ProtagonistAnimal, label: '小兔子', emoji: '🐰' },
  { value: 'bear' as ProtagonistAnimal, label: '小熊', emoji: '🐻' },
  { value: 'cat' as ProtagonistAnimal, label: '小猫咪', emoji: '🐱' },
  { value: 'dog' as ProtagonistAnimal, label: '小狗狗', emoji: '🐶' },
  { value: 'panda' as ProtagonistAnimal, label: '熊猫', emoji: '🐼' },
  { value: 'fox' as ProtagonistAnimal, label: '小狐狸', emoji: '🦊' }
]
const selectedAnimal = ref<ProtagonistAnimal>('bunny')

// 色调选项
const colorPalettes = [
  { value: 'pastel' as ColorPalette, label: '马卡龙', description: '柔和温馨' },
  { value: 'vibrant' as ColorPalette, label: '鲜艳活泼', description: '明快活泼' },
  { value: 'warm' as ColorPalette, label: '暖色温馨', description: '温暖舒适' },
  { value: 'cool' as ColorPalette, label: '清新冷调', description: '清爽宁静' },
  { value: 'monochrome' as ColorPalette, label: '黑白经典', description: '优雅简洁' }
]
const selectedPalette = ref<ColorPalette>('pastel')

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
  const apiThemes = contentStore.themes?.[selectedCategory.value]?.themes || []
  const fallbackThemes = defaultThemes[selectedCategory.value] || []

  // 优先使用 API 主题，但如果为空则使用默认主题
  let themes = apiThemes.length > 0 ? apiThemes : fallbackThemes

  // 如果当前选中的主题不在列表中，将其添加进去（确保预选主题始终可见）
  if (selectedTheme.value && selectedTheme.value.id) {
    const exists = themes.some(t => t.id === selectedTheme.value!.id)
    if (!exists) {
      // 从默认主题中查找并添加
      const fromDefault = fallbackThemes.find(t => t.id === selectedTheme.value!.id)
      if (fromDefault) {
        themes = [fromDefault, ...themes]
      }
    }
  }

  return themes
})

const currentStyleName = computed(() => {
  return musicStyles.find(s => s.value === selectedStyle.value)?.name || ''
})

const currentArtStyleName = computed(() => {
  return artStyles.find(s => s.value === selectedArtStyle.value)?.label || ''
})

const currentAnimalName = computed(() => {
  return protagonistAnimals.find(a => a.value === selectedAnimal.value)?.label || ''
})

const currentPaletteName = computed(() => {
  return colorPalettes.find(p => p.value === selectedPalette.value)?.label || ''
})

const canNext = computed(() => {
  if (currentStep.value === 0) return !!selectedTheme.value
  return true
})

// 默认主题（API 未返回时使用）
// 使用与 API 一致的主题 ID 和分类结构
const defaultThemes: Record<string, ThemeItem[]> = {
  habit: [
    { id: 'brush_teeth', name: '刷牙', subcategory: '生活习惯', age_range: [24, 48], keywords: [] },
    { id: 'wash_hands', name: '洗手', subcategory: '卫生习惯', age_range: [18, 48], keywords: [] },
    { id: 'get_dressed', name: '穿衣', subcategory: '生活习惯', age_range: [24, 48], keywords: [] },
    { id: 'potty_training', name: '如厕', subcategory: '生活习惯', age_range: [18, 36], keywords: [] },
    { id: 'eat_independently', name: '自己吃饭', subcategory: '生活习惯', age_range: [18, 48], keywords: [] },
    { id: 'no_picky_eating', name: '不挑食', subcategory: '饮食习惯', age_range: [24, 60], keywords: [] },
    { id: 'bedtime', name: '按时睡觉', subcategory: '作息习惯', age_range: [24, 60], keywords: [] },
    { id: 'nap_time', name: '午睡', subcategory: '作息习惯', age_range: [18, 48], keywords: [] },
    { id: 'sharing', name: '分享', subcategory: '社交习惯', age_range: [24, 60], keywords: [] },
    { id: 'greeting', name: '打招呼', subcategory: '礼仪习惯', age_range: [18, 48], keywords: [] },
    { id: 'tidy_up', name: '收拾玩具', subcategory: '生活习惯', age_range: [30, 60], keywords: [] }
  ],
  cognition: [
    { id: 'colors', name: '颜色', subcategory: '基础认知', age_range: [12, 36], keywords: [] },
    { id: 'shapes', name: '形状', subcategory: '基础认知', age_range: [18, 36], keywords: [] },
    { id: 'numbers', name: '数字', subcategory: '数学启蒙', age_range: [24, 48], keywords: [] },
    { id: 'big_small', name: '大小', subcategory: '基础认知', age_range: [12, 36], keywords: [] },
    { id: 'animals', name: '动物', subcategory: '自然认知', age_range: [12, 48], keywords: [] },
    { id: 'plants', name: '植物', subcategory: '自然认知', age_range: [18, 48], keywords: [] },
    { id: 'weather', name: '天气', subcategory: '自然认知', age_range: [24, 48], keywords: [] },
    { id: 'family', name: '家庭成员', subcategory: '社会认知', age_range: [12, 36], keywords: [] },
    { id: 'occupations', name: '职业', subcategory: '社会认知', age_range: [30, 60], keywords: [] },
    { id: 'vehicles', name: '交通工具', subcategory: '生活认知', age_range: [18, 48], keywords: [] },
    // 情绪主题（API 将其归类在 cognition 下）
    { id: 'happy', name: '开心', subcategory: '情绪认知', age_range: [18, 48], keywords: [] },
    { id: 'sad', name: '难过', subcategory: '情绪认知', age_range: [24, 48], keywords: [] },
    { id: 'angry', name: '生气', subcategory: '情绪管理', age_range: [24, 60], keywords: [] },
    { id: 'scared', name: '害怕', subcategory: '情绪管理', age_range: [24, 60], keywords: [] }
  ]
}

// 主题图标映射（覆盖 API 返回的所有主题 ID）
const themeIcons: Record<string, string> = {
  // ===== 习惯养成 (API 返回的 ID) =====
  brush_teeth: '🦷',         // 刷牙
  wash_hands: '🧼',          // 洗手
  get_dressed: '👕',         // 穿衣
  potty_training: '🚽',      // 如厕
  eat_independently: '🥄',   // 自己吃饭
  no_picky_eating: '🥦',     // 不挑食
  bedtime: '🌙',             // 按时睡觉
  nap_time: '😴',            // 午睡
  sharing: '🤝',             // 分享
  greeting: '👋',            // 打招呼
  tidy_up: '🧹',             // 收拾玩具
  // ===== 认知世界 (API 返回的 ID) =====
  colors: '🌈',              // 颜色
  shapes: '🔷',              // 形状
  numbers: '🔢',             // 数字
  big_small: '📏',           // 大小
  animals: '🐼',             // 动物
  plants: '🌱',              // 植物
  weather: '☀️',              // 天气
  family: '👨‍👩‍👧',              // 家庭成员
  occupations: '👷',         // 职业
  vehicles: '🚌',            // 交通工具
  // ===== 情绪 (API 返回的 ID) =====
  happy: '😄',               // 开心
  sad: '😢',                 // 难过
  angry: '😤',               // 生气
  scared: '😰',              // 害怕
  // ===== 本地备用 ID（兼容旧数据）=====
  brushing_teeth: '🦷',
  washing_hands: '🧼',
  eating_vegetables: '🥦',
  sleeping_early: '🌙',
  tidying_up: '🧹',
  polite_words: '🙏',
  seasons: '🌸',
  body_parts: '👃',
  making_friends: '👫',
  managing_anger: '😊',
  courage: '🦸',
  love_family: '👨‍👩‍👧',
  helping_others: '🤝'
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
      music_style: selectedStyle.value,
      // 新增封面风格参数
      music_mood: selectedStyle.value,
      art_style: selectedArtStyle.value,
      protagonist: {
        animal: selectedAnimal.value
      },
      color_palette: selectedPalette.value
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
    const themeId = options.theme

    // 延迟执行确保组件已初始化
    setTimeout(() => {
      for (const catId of Object.keys(defaultThemes)) {
        const found = defaultThemes[catId].find(t => t.id === themeId)
        if (found) {
          selectedCategory.value = catId
          selectedTheme.value = found
          break
        }
      }
    }, 100)
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page-container {
  min-height: 100vh;
  background: $bg-cream;
  display: flex;
  flex-direction: column;
  width: 750rpx;
  overflow: hidden;
  position: relative;
}

// 装饰背景
.cosmos-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.stars-layer {
  display: none;
}

.nebula {
  position: absolute;
  border-radius: 50%;
  opacity: 0.4;
}

.nebula-1 {
  width: 350rpx;
  height: 350rpx;
  background: $song-light;
  top: -100rpx;
  right: -80rpx;
}

.nebula-2 {
  width: 250rpx;
  height: 250rpx;
  background: $book-light;
  bottom: 250rpx;
  left: -80rpx;
}

// 导航栏
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: $z-sticky;
  background: rgba(255, 251, 247, 0.95);
  backdrop-filter: blur(20rpx);
  width: 750rpx;
  border-bottom: 1rpx solid $border-light;
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
  border: 1rpx solid $border-light;
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
  position: relative;
  z-index: 1;
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
  background: $border-light;
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
  border: 4rpx solid $border-medium;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $duration-base;
  box-shadow: $shadow-sm;

  text {
    font-size: $font-xs;
    color: $text-tertiary;
  }

  .active & {
    border-color: $song-primary;
    background: $song-primary;

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
  color: $text-tertiary;

  .active & { color: $song-primary; font-weight: $font-medium; }
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
  border: 2rpx solid $border-light;
  box-shadow: $shadow-sm;
  transition: all $duration-fast;

  &.active {
    border-color: $song-primary;
    background: rgba($song-primary, 0.08);
    box-shadow: $shadow-colored-song;
  }
}

.tab-icon {
  font-size: 36rpx;
  margin-bottom: 4rpx;
}

.tab-name {
  font-size: $font-sm;
  color: $text-secondary;

  .active & { color: $song-primary; font-weight: $font-medium; }
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
  border: 2rpx solid $border-light;
  box-shadow: $shadow-sm;
  transition: all $duration-fast;

  &.selected {
    border-color: $song-primary;
    background: rgba($song-primary, 0.08);
    box-shadow: $shadow-colored-song;
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
  background: $song-primary;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 18rpx;
    color: $text-white;
  }
}

// ==========================================
// 风格选择页 - 增强版 UI（儿歌专属・温暖花园主题）
// ==========================================

.style-header {
  margin-bottom: $spacing-lg;
}

.style-sections {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.style-section {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-md;
  border: 1rpx solid $border-light;
  box-shadow: $shadow-card;
}

.section-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.section-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: rgba($song-primary, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.music { background: rgba($song-primary, 0.12); }
  &.art { background: rgba($book-primary, 0.12); }
  &.bunny { background: rgba(#FF9F9F, 0.15); }
  &.palette { background: rgba($info, 0.12); }
}

.section-icon {
  font-size: 28rpx;
}

.section-title {
  font-size: $font-md;
  font-weight: $font-bold;
  color: $text-primary;
}

// ==========================================
// 音乐情绪 - 大卡片带音量条 (温暖花园主题)
// ==========================================
.music-mood-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-sm;
}

.music-mood-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: $bg-card;
  border-radius: $radius-md;
  border: 1rpx solid $border-light;
  overflow: hidden;
  transition: all $duration-base $ease-bounce;
  box-shadow: $shadow-sm;

  &.selected {
    border-color: $song-primary;
    box-shadow: $shadow-colored-song;

    .mood-bars .bar {
      animation: barBounce 0.6s ease-in-out infinite;
    }
  }

  &:active {
    transform: scale(0.96);
  }
}

.mood-visual {
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  position: relative;

  &.cheerful { background: linear-gradient(135deg, rgba(255, 179, 71, 0.12) 0%, rgba(255, 123, 84, 0.12) 100%); }
  &.gentle { background: linear-gradient(135deg, rgba(127, 178, 133, 0.12) 0%, rgba(91, 164, 217, 0.12) 100%); }
  &.playful { background: linear-gradient(135deg, rgba(127, 178, 133, 0.12) 0%, rgba(245, 166, 35, 0.12) 100%); }
  &.lullaby { background: linear-gradient(135deg, rgba(91, 164, 217, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%); }
  &.educational { background: linear-gradient(135deg, rgba(245, 166, 35, 0.12) 0%, rgba(127, 178, 133, 0.12) 100%); }
}

.mood-icon {
  font-size: 40rpx;
}

.mood-bars {
  display: flex;
  gap: 4rpx;
  align-items: flex-end;
  height: 40rpx;
}

.bar {
  width: 6rpx;
  background: $song-primary;
  border-radius: 3rpx;
  opacity: 0.4;

  &:nth-child(1) { height: 16rpx; animation-delay: 0s; }
  &:nth-child(2) { height: 28rpx; animation-delay: 0.1s; }
  &:nth-child(3) { height: 20rpx; animation-delay: 0.2s; }
  &:nth-child(4) { height: 32rpx; animation-delay: 0.3s; }
  &:nth-child(5) { height: 24rpx; animation-delay: 0.4s; }
}

@keyframes barBounce {
  0%, 100% { transform: scaleY(0.6); opacity: 0.4; }
  50% { transform: scaleY(1); opacity: 1; }
}

.mood-info {
  padding: $spacing-sm;
  text-align: center;
}

.mood-name {
  display: block;
  font-size: $font-sm;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: 4rpx;
}

.mood-desc {
  display: block;
  font-size: $font-xs;
  color: $text-tertiary;
}

.mood-check {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: $song-primary;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 18rpx;
    color: $text-white;
  }
}

// ==========================================
// 封面艺术风格 - 横向滚动卡片 (温暖花园主题)
// ==========================================
.cover-art-carousel {
  display: flex;
  gap: $spacing-sm;
  overflow-x: auto;
  padding-bottom: $spacing-xs;
  margin: 0 -#{$spacing-md};
  padding-left: $spacing-md;
  padding-right: $spacing-md;

  &::-webkit-scrollbar { display: none; }
}

.cover-art-card {
  position: relative;
  flex-shrink: 0;
  width: 140rpx;
  height: 120rpx;
  border-radius: $radius-md;
  overflow: hidden;
  border: 2rpx solid $border-light;
  transition: all $duration-base $ease-bounce;
  box-shadow: $shadow-sm;

  &.selected {
    border-color: $song-primary;
    transform: scale(1.05);
    box-shadow: $shadow-colored-song;
  }

  &:active {
    transform: scale(0.94);
  }
}

.cover-art-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.2;

  &.pixar_3d { background: linear-gradient(145deg, #7FB285 0%, #5BA4D9 50%, #FF7B54 100%); }
  &.watercolor { background: linear-gradient(145deg, #5BA4D9 0%, #F5A623 50%, #7FB285 100%); }
  &.flat_vector { background: linear-gradient(145deg, #F5A623 0%, #7FB285 50%, #5BA4D9 100%); }
  &.crayon { background: linear-gradient(145deg, #F5A623 0%, #FF7B54 50%, #7FB285 100%); }
  &.anime { background: linear-gradient(145deg, #FF9F9F 0%, #5BA4D9 50%, #7FB285 100%); }
}

.cover-art-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xs;
  background: rgba($bg-card, 0.9);
}

.cover-art-icon {
  font-size: 36rpx;
  margin-bottom: 4rpx;
}

.cover-art-name {
  font-size: 20rpx;
  font-weight: $font-medium;
  color: $text-primary;
}

.cover-art-check {
  position: absolute;
  top: 6rpx;
  right: 6rpx;
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background: $song-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;

  text {
    font-size: 16rpx;
    color: $text-white;
  }
}

// ==========================================
// 角色选择 - 圆形头像卡片 (温暖花园主题)
// ==========================================
.character-carousel {
  display: flex;
  gap: $spacing-sm;
  flex-wrap: wrap;
  justify-content: space-between;
}

.character-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(33.33% - 16rpx);
  padding: $spacing-sm 0;
  transition: all $duration-base $ease-bounce;

  &.selected .character-avatar {
    background: rgba($song-primary, 0.12);
    border-color: $song-primary;
    box-shadow: $shadow-colored-song;
  }

  &.selected .char-ring {
    opacity: 1;
    transform: scale(1);
  }

  &:active {
    transform: scale(0.92);
  }
}

.character-avatar {
  position: relative;
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: $bg-card;
  border: 2rpx solid $border-light;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-xs;
  transition: all $duration-base;
  box-shadow: $shadow-sm;
}

.char-emoji {
  font-size: 40rpx;
}

.char-name {
  font-size: $font-xs;
  color: $text-primary;
  font-weight: $font-medium;
}

.char-ring {
  position: absolute;
  top: -6rpx;
  left: -6rpx;
  right: -6rpx;
  bottom: -6rpx;
  border: 3rpx solid $song-primary;
  border-radius: 50%;
  opacity: 0;
  transform: scale(0.8);
  transition: all $duration-base $ease-bounce;
  pointer-events: none;
}

// ==========================================
// 色彩风格 - 条纹预览卡片 (温暖花园主题)
// ==========================================
.palette-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.palette-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-sm $spacing-md;
  background: $bg-card;
  border-radius: $radius-md;
  border: 1rpx solid $border-light;
  transition: all $duration-fast;
  box-shadow: $shadow-sm;

  &.selected {
    border-color: $song-primary;
    background: rgba($song-primary, 0.08);
    box-shadow: $shadow-colored-song;
  }

  &:active {
    transform: scale(0.98);
  }
}

.palette-preview {
  width: 72rpx;
  height: 44rpx;
  border-radius: $radius-sm;
  overflow: hidden;
  display: flex;
  flex-shrink: 0;

  &.pastel .palette-stripe {
    &:nth-child(1) { background: #FFB5BA; }
    &:nth-child(2) { background: #B5D8FF; }
    &:nth-child(3) { background: #C5F0A4; }
    &:nth-child(4) { background: #FFF5BA; }
  }

  &.vibrant .palette-stripe {
    &:nth-child(1) { background: #FF4757; }
    &:nth-child(2) { background: #3742FA; }
    &:nth-child(3) { background: #2ED573; }
    &:nth-child(4) { background: #FFA502; }
  }

  &.warm .palette-stripe {
    &:nth-child(1) { background: #FF6B35; }
    &:nth-child(2) { background: #F7C566; }
    &:nth-child(3) { background: #E8A87C; }
    &:nth-child(4) { background: #FFE4C4; }
  }

  &.cool .palette-stripe {
    &:nth-child(1) { background: #74B9FF; }
    &:nth-child(2) { background: #81ECEC; }
    &:nth-child(3) { background: #A29BFE; }
    &:nth-child(4) { background: #DFE6E9; }
  }

  &.monochrome .palette-stripe {
    &:nth-child(1) { background: #2D3436; }
    &:nth-child(2) { background: #636E72; }
    &:nth-child(3) { background: #B2BEC3; }
    &:nth-child(4) { background: #DFE6E9; }
  }
}

.palette-stripe {
  flex: 1;
  height: 100%;
}

.palette-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.palette-name {
  font-size: $font-sm;
  font-weight: $font-medium;
  color: $text-primary;
}

.palette-desc {
  font-size: $font-xs;
  color: $text-tertiary;
}

.palette-check {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: $song-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  text {
    font-size: 18rpx;
    color: $text-white;
  }
}

// 确认卡片 (温暖花园主题)
.confirm-card {
  background: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
  border: 1rpx solid $border-light;
  box-shadow: $shadow-card;
}

.confirm-item {
  display: flex;
  justify-content: space-between;
  padding: $spacing-sm 0;
  border-bottom: 1rpx solid $border-light;

  &:last-child {
    border-bottom: none;
  }
}

.confirm-label {
  font-size: $font-base;
  color: $text-tertiary;
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
  background: rgba($song-primary, 0.08);
  border-radius: $radius-md;
  border: 1rpx solid rgba($song-primary, 0.2);
}

.tip-icon {
  font-size: 32rpx;
}

.tip-text {
  font-size: $font-sm;
  color: $song-primary;
}

// 底部按钮 (温暖花园主题)
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
  gap: $spacing-sm;
  padding: $spacing-md;
  padding-bottom: calc(#{$spacing-md} + env(safe-area-inset-bottom));
  background: rgba($bg-card, 0.98);
  border-top: 1rpx solid $border-light;
  width: 750rpx;
  box-sizing: border-box;
  z-index: $z-sticky;
}

.btn-secondary {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-card;
  border-radius: $radius-lg;
  border: 1rpx solid $border-medium;

  text {
    font-size: $font-md;
    color: $text-secondary;
  }

  &:active {
    background: $bg-soft;
  }
}

.btn-primary {
  flex: 2;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $song-gradient;
  border-radius: $radius-lg;
  box-shadow: $shadow-colored-song;

  text {
    font-size: $font-md;
    font-weight: $font-semibold;
    color: $text-white;
  }

  &:active {
    transform: scale(0.98);
  }

  &.disabled {
    background: $border-light;
    box-shadow: none;

    text {
      color: $text-tertiary;
    }
  }
}
</style>
