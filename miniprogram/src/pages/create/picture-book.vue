<template>
  <view class="page-container">
    <!-- 装饰背景 -->
    <view class="decor-bg">
      <view class="decor-shape shape-1"></view>
      <view class="decor-shape shape-2"></view>
    </view>

    <!-- 导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="back-btn" @tap="goBack">
          <text>‹</text>
        </view>
        <text class="nav-title">创作绘本</text>
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
        <text class="step-title">选择故事主题</text>
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
          <text class="step-title">画面风格</text>
          <text class="step-desc">为 {{ childName }} 选择喜欢的绘本风格</text>
        </view>

        <view class="style-sections">
          <!-- 艺术风格 - 分类展示 -->
          <view class="style-section art-section">
            <view class="section-header">
              <view class="section-icon-wrap">
                <text class="section-icon">🎨</text>
              </view>
              <text class="section-title">艺术风格</text>
            </view>
            <!-- 风格分类 Tab -->
            <view class="style-category-tabs">
              <view
                v-for="cat in styleCategories"
                :key="cat.id"
                class="style-tab-item"
                :class="{ active: selectedStyleCategory === cat.id }"
                @tap="selectedStyleCategory = cat.id"
              >
                <text class="style-tab-icon">{{ cat.icon }}</text>
                <text class="style-tab-name">{{ cat.name }}</text>
              </view>
            </view>
            <!-- 风格卡片 -->
            <view class="art-style-carousel">
              <view
                v-for="style in currentCategoryStyles"
                :key="style.value"
                class="art-card"
                :class="{ selected: selectedArtStyle === style.value, recommended: style.recommended }"
                @tap="selectedArtStyle = style.value"
              >
                <view class="art-card-bg" :class="style.cssClass || style.value"></view>
                <view class="art-card-content">
                  <text class="art-icon">{{ style.icon }}</text>
                  <text class="art-name">{{ style.label }}</text>
                  <text class="art-desc">{{ style.desc }}</text>
                </view>
                <view v-if="selectedArtStyle === style.value" class="art-check">
                  <text>✓</text>
                </view>
                <view v-if="style.recommended" class="art-badge">推荐</view>
              </view>
            </view>
          </view>

          <!-- 故事主角 - 可爱动物选择 -->
          <view class="style-section character-section">
            <view class="section-header">
              <view class="section-icon-wrap bunny">
                <text class="section-icon">🐰</text>
              </view>
              <view class="section-header-text">
                <text class="section-title">故事主角</text>
                <text class="section-hint">选择陪伴宝贝的小动物</text>
              </view>
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

          <!-- 旁白音色 - 音波效果 -->
          <view class="style-section voice-section">
            <view class="section-header">
              <view class="section-icon-wrap voice">
                <text class="section-icon">🔊</text>
              </view>
              <view class="section-header-text">
                <text class="section-title">旁白音色</text>
                <text class="section-hint">选择讲故事的声音</text>
              </view>
            </view>
            <view class="voice-list">
              <view
                v-for="voice in voiceOptions"
                :key="voice.id"
                class="voice-card"
                :class="{ selected: selectedVoiceId === voice.id, [voice.gender]: true }"
                @tap="selectedVoiceId = voice.id"
              >
                <view class="voice-avatar">
                  <text class="voice-emoji">{{ voice.emoji }}</text>
                  <view class="voice-waves">
                    <view class="wave"></view>
                    <view class="wave"></view>
                    <view class="wave"></view>
                  </view>
                </view>
                <view class="voice-content">
                  <view class="voice-name-row">
                    <text class="voice-name">{{ voice.name }}</text>
                    <text v-if="voice.recommended" class="voice-badge">推荐</text>
                    <text class="voice-gender-tag" :class="voice.gender">
                      {{ voice.gender === 'female' ? '女声' : voice.gender === 'male' ? '男声' : '中性' }}
                    </text>
                  </view>
                  <text class="voice-style">{{ voice.style }}</text>
                </view>
                <view v-if="selectedVoiceId === voice.id" class="voice-check">
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
        <text class="step-desc">检查设置，开始生成专属绘本</text>

        <view class="confirm-card">
          <view class="confirm-item">
            <text class="confirm-label">故事主题</text>
            <text class="confirm-value">{{ selectedTheme?.name }}</text>
          </view>
          <view class="confirm-item">
            <text class="confirm-label">主人公</text>
            <text class="confirm-value">{{ childName }}</text>
          </view>
          <view class="confirm-item">
            <text class="confirm-label">艺术风格</text>
            <text class="confirm-value">{{ currentArtStyleName }}</text>
          </view>
          <view class="confirm-item">
            <text class="confirm-label">故事主角</text>
            <text class="confirm-value">{{ currentAnimalName }}</text>
          </view>
          <view class="confirm-item">
            <text class="confirm-label">旁白音色</text>
            <text class="confirm-value">{{ currentVoiceName }}</text>
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
      type="book"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useChildStore } from '@/stores/child'
import { useContentStore } from '@/stores/content'
import GeneratingProgress from '@/components/GeneratingProgress/GeneratingProgress.vue'
import {
  generatePictureBookAsync,
  getPictureBookTaskStatus,
  getContentDetail,
  type ThemeItem,
  type PictureBook,
  type ArtStyle,
  type ProtagonistAnimal,
  type VoiceId
} from '@/api/content'

const childStore = useChildStore()
const contentStore = useContentStore()

// 导航栏
const statusBarHeight = ref(20)
const navHeight = ref(88)

// 步骤
const steps = [
  { id: 'theme', name: '选主题' },
  { id: 'custom', name: '个性化' },
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

// 风格分类（按后端 Gemini 配置）
const styleCategories = [
  { id: 'children', name: '儿童内容', icon: '📚' },
  { id: 'threed', name: '3D 风格', icon: '🎬' },
  { id: 'anime', name: '动漫风格', icon: '🌸' },
  { id: 'artistic', name: '艺术风格', icon: '🎨' }
]
const selectedStyleCategory = ref('children')

// 按分类的艺术风格选项（cssClass 用于避免数字开头的类名）
type StyleOption = { value: ArtStyle; label: string; icon: string; desc: string; cssClass?: string; recommended?: boolean }
const artStylesByCategory: Record<string, StyleOption[]> = {
  children: [
    { value: 'storybook', label: '绘本风格', icon: '📖', desc: '温暖色调', recommended: true },
    { value: 'cartoon', label: '卡通风格', icon: '🎨', desc: '鲜艳色彩' },
    { value: 'watercolor', label: '水彩风格', icon: '💧', desc: '梦幻氛围' },
    { value: 'flat', label: '扁平风格', icon: '✨', desc: '简洁几何' }
  ],
  threed: [
    { value: 'pixar', label: '皮克斯', icon: '🎬', desc: '动画电影' },
    { value: 'pixar_3d', label: '3D 卡通', icon: '🧸', desc: '柔和阴影' },
    { value: 'clay', label: '粘土风格', icon: '🎭', desc: '手工质感' },
    { value: 'figurine', label: '手办风格', icon: '🎎', desc: '收藏品风' }
  ],
  anime: [
    { value: 'anime', label: '日式动漫', icon: '🌸', desc: '细致眼睛' },
    { value: 'chibi', label: 'Q版萌系', icon: '🎀', desc: '大头小身' },
    { value: 'ghibli', label: '吉卜力', icon: '🏰', desc: '宫崎骏风' }
  ],
  artistic: [
    { value: 'oil_painting', label: '油画', icon: '🖼️', desc: '古典纹理' },
    { value: 'sketch', label: '素描', icon: '✏️', desc: '手绘线条' },
    { value: 'ink_wash', label: '水墨画', icon: '🖌️', desc: '中国风' },
    { value: 'pixel_art', label: '像素艺术', icon: '👾', desc: '复古游戏' }
  ]
}

// 当前分类的风格列表
const currentCategoryStyles = computed(() => {
  return artStylesByCategory[selectedStyleCategory.value] || artStylesByCategory.children
})

const selectedArtStyle = ref<ArtStyle>('storybook')

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

// Gemini TTS 音色选项（默认）
const voiceOptions: Array<{ id: VoiceId; name: string; gender: 'female' | 'male' | 'neutral'; style: string; emoji: string; recommended?: boolean }> = [
  { id: 'Kore', name: '温暖女声', gender: 'female', style: '温暖亲切', emoji: '🌟', recommended: true },
  { id: 'Leda', name: '柔和女声', gender: 'female', style: '柔和舒缓', emoji: '🌙' },
  { id: 'Aoede', name: '清晰女声', gender: 'female', style: '清晰标准', emoji: '📚' },
  { id: 'Puck', name: '活泼中性', gender: 'neutral', style: '活泼有趣', emoji: '🎈' },
  { id: 'Charon', name: '沉稳男声', gender: 'male', style: '沉稳大气', emoji: '👔' },
  { id: 'Fenrir', name: '深沉男声', gender: 'male', style: '深沉有力', emoji: '🎭' }
]
const selectedVoiceId = ref<VoiceId>('Kore')

// 生成状态
const isGenerating = ref(false)
const generatingProgress = ref(0)
const generatingStage = ref('')
const generatingMessage = ref('')

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

const currentArtStyleName = computed(() => {
  // 搜索所有分类找到当前选中的风格
  for (const styles of Object.values(artStylesByCategory)) {
    const found = styles.find(s => s.value === selectedArtStyle.value)
    if (found) return found.label
  }
  return ''
})

const currentAnimalName = computed(() => {
  return protagonistAnimals.find(a => a.value === selectedAnimal.value)?.label || ''
})

const currentVoiceName = computed(() => {
  const voice = voiceOptions.find(v => v.id === selectedVoiceId.value)
  return voice ? `${voice.emoji} ${voice.name}` : ''
})

const canNext = computed(() => {
  if (currentStep.value === 0) return !!selectedTheme.value
  return true
})

// 默认主题（使用 API 的主题 ID，作为备用和灵感预选）
const defaultThemes: Record<string, ThemeItem[]> = {
  habit: [
    { id: 'brush_teeth', name: '刷牙', subcategory: '生活习惯', age_range: [24, 48], keywords: [] },
    { id: 'wash_hands', name: '洗手', subcategory: '卫生习惯', age_range: [18, 48], keywords: [] },
    { id: 'get_dressed', name: '穿衣', subcategory: '生活习惯', age_range: [24, 48], keywords: [] },
    { id: 'potty_training', name: '如厕', subcategory: '生活习惯', age_range: [18, 36], keywords: [] },
    { id: 'eat_independently', name: '自己吃饭', subcategory: '生活习惯', age_range: [18, 36], keywords: [] },
    { id: 'no_picky_eating', name: '不挑食', subcategory: '饮食习惯', age_range: [24, 48], keywords: [] },
    { id: 'bedtime', name: '按时睡觉', subcategory: '作息习惯', age_range: [24, 60], keywords: [] },
    { id: 'nap_time', name: '午睡', subcategory: '作息习惯', age_range: [18, 48], keywords: [] },
    { id: 'sharing', name: '分享', subcategory: '社交能力', age_range: [24, 60], keywords: [] },
    { id: 'greeting', name: '打招呼', subcategory: '行为习惯', age_range: [18, 48], keywords: [] },
    { id: 'tidy_up', name: '收拾玩具', subcategory: '生活习惯', age_range: [30, 60], keywords: [] }
  ],
  cognition: [
    { id: 'colors', name: '颜色', subcategory: '基础认知', age_range: [12, 36], keywords: [] },
    { id: 'shapes', name: '形状', subcategory: '基础认知', age_range: [18, 36], keywords: [] },
    { id: 'numbers', name: '数字', subcategory: '数学启蒙', age_range: [24, 48], keywords: [] },
    { id: 'big_small', name: '大小', subcategory: '基础认知', age_range: [12, 36], keywords: [] },
    { id: 'animals', name: '动物', subcategory: '自然认知', age_range: [12, 48], keywords: [] },
    { id: 'plants', name: '植物', subcategory: '自然认知', age_range: [24, 48], keywords: [] },
    { id: 'weather', name: '天气', subcategory: '自然认知', age_range: [24, 48], keywords: [] },
    { id: 'family', name: '家庭成员', subcategory: '社会认知', age_range: [18, 36], keywords: [] },
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
  bedtime: '🛏️',             // 按时睡觉
  nap_time: '😴',            // 午睡
  sharing: '🤝',             // 分享
  greeting: '👋',            // 打招呼
  tidy_up: '🧹',             // 收拾玩具
  // ===== 认知世界 (API 返回的 ID) =====
  colors: '🎨',              // 颜色
  shapes: '🔷',              // 形状
  numbers: '🔢',             // 数字
  big_small: '📏',           // 大小
  animals: '🦁',             // 动物
  plants: '🌱',              // 植物
  weather: '🌤️',             // 天气
  family: '👨‍👩‍👧',              // 家庭成员
  occupations: '👨‍⚕️',          // 职业
  vehicles: '🚗',            // 交通工具
  // ===== 情绪 (API 返回的 ID) =====
  happy: '😊',               // 开心
  sad: '😢',                 // 难过
  angry: '😠',               // 生气
  scared: '😨',              // 害怕
  // ===== 本地备用 ID（兼容旧数据）=====
  brushing_teeth: '🦷',
  washing_hands: '🧼',
  eating_vegetables: '🥦',
  sleeping_early: '🛏️',
  tidying_up: '🧹',
  polite_words: '💬',
  seasons: '🍂',
  body_parts: '🖐️',
  making_friends: '👭',
  managing_anger: '😌',
  courage: '💪',
  love_family: '🏠',
  helping_others: '🤗'
}

function getThemeIcon(id: string): string {
  return themeIcons[id] || '📖'
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

async function startGenerate() {
  if (!selectedTheme.value || !childStore.currentChild) return

  isGenerating.value = true
  generatingProgress.value = 0
  generatingStage.value = ''
  generatingMessage.value = ''

  try {
    const ageMonths = childStore.currentChildAgeMonths || 36

    console.log('[绘本] 发起异步生成请求，风格:', selectedArtStyle.value, '主角:', selectedAnimal.value, '音色:', selectedVoiceId.value)
    const asyncResult = await generatePictureBookAsync({
      child_name: childStore.currentChild.name,
      age_months: ageMonths,
      theme_topic: selectedTheme.value.id,
      theme_category: selectedCategory.value,
      art_style: selectedArtStyle.value,
      protagonist: {
        animal: selectedAnimal.value
      },
      voice_id: selectedVoiceId.value
    })

    const taskId = asyncResult.task_id
    console.log('[绘本] 获取到 task_id:', taskId)

    const maxAttempts = 120
    const pollInterval = 3000
    let attempts = 0

    let consecutiveErrors = 0
    const maxConsecutiveErrors = 5

    const pollStatus = async (): Promise<PictureBook | null> => {
      while (attempts < maxAttempts) {
        attempts++
        console.log(`[绘本] 轮询状态 第 ${attempts} 次`)

        try {
          const status = await getPictureBookTaskStatus(taskId)
          consecutiveErrors = 0
          console.log('[绘本] 状态:', status.status, '进度:', status.progress, '阶段:', status.stage, '消息:', status.message)

          // 更新进度、阶段和消息
          generatingProgress.value = status.progress || Math.min(attempts * 2, 95)
          generatingStage.value = status.stage || ''
          generatingMessage.value = status.message || ''

          if (status.status === 'completed') {
            generatingProgress.value = 100
            if (status.result) {
              console.log('[绘本] 从 result 获取完整数据')
              return status.result
            } else if (status.content_id) {
              console.log('[绘本] 从 content_id 获取详情:', status.content_id)
              const detail = await getContentDetail(status.content_id)
              return detail as PictureBook
            }
            return null
          }

          if (status.status === 'failed') {
            const errorMsg = status.error || '绘本生成失败'
            console.error('[绘本] 生成失败:', errorMsg)
            const businessError = new Error(errorMsg)
            ;(businessError as any).isBusinessError = true
            throw businessError
          }

          await new Promise(resolve => setTimeout(resolve, pollInterval))
        } catch (e: any) {
          if (e.isBusinessError) {
            throw e
          }

          consecutiveErrors++
          console.error(`[绘本] 轮询出错 (${consecutiveErrors}/${maxConsecutiveErrors}):`, e?.errMsg || e?.message || e)

          if (consecutiveErrors >= maxConsecutiveErrors) {
            throw new Error('网络连接不稳定，请检查网络后重试')
          }

          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, pollInterval * 2))
          }
        }
      }

      throw new Error('生成超时，请稍后重试')
    }

    const result = await pollStatus()

    if (result) {
      console.log('[绘本] 生成成功:', result.id)
      uni.setStorageSync('temp_picture_book', result)

      isGenerating.value = false
      if (result.id) {
        uni.redirectTo({
          url: `/pages/play/picture-book?id=${result.id}`
        })
      } else {
        uni.redirectTo({
          url: `/pages/play/picture-book?fromGenerate=1`
        })
      }
    } else {
      throw new Error('未获取到绘本数据')
    }
  } catch (e: any) {
    console.error('[绘本] 生成失败:', e)
    isGenerating.value = false
    uni.showToast({
      title: e.message || '生成失败，请重试',
      icon: 'none',
      duration: 3000
    })
  }
}

function goBack() {
  uni.navigateBack()
}

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 20
  navHeight.value = statusBarHeight.value + 44

  contentStore.fetchThemes()
})

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
.decor-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.decor-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.4;

  &.shape-1 {
    width: 350rpx;
    height: 350rpx;
    background: $book-light;
    top: -100rpx;
    right: -80rpx;
  }

  &.shape-2 {
    width: 250rpx;
    height: 250rpx;
    background: $song-light;
    bottom: 250rpx;
    left: -80rpx;
  }
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
    border-color: $book-primary;
    background: $book-primary;

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

  .active & { color: $book-primary; font-weight: $font-medium; }
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
    border-color: $book-primary;
    background: rgba($book-primary, 0.08);
    box-shadow: $shadow-colored-book;
  }
}

.tab-icon {
  font-size: 36rpx;
  margin-bottom: 4rpx;
}

.tab-name {
  font-size: $font-sm;
  color: $text-secondary;

  .active & { color: $book-primary; font-weight: $font-medium; }
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
    border-color: $book-primary;
    background: rgba($book-primary, 0.08);
    box-shadow: $shadow-colored-book;
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
  background: $book-primary;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 18rpx;
    color: $text-white;
  }
}

// 风格选择页
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
  box-shadow: $shadow-card;
}

.section-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.section-header-text {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.section-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: $book-light;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.bunny { background: $book-light; }
  &.palette { background: $song-light; }
  &.voice { background: $video-light; }
}

.section-icon {
  font-size: 28rpx;
}

.section-title {
  font-size: $font-md;
  font-weight: $font-bold;
  color: $text-primary;
}

.section-hint {
  font-size: $font-xs;
  color: $text-tertiary;
}

// 风格分类 Tab
.style-category-tabs {
  display: flex;
  gap: $spacing-xs;
  margin-bottom: $spacing-md;
  padding: $spacing-xs;
  background: $bg-soft;
  border-radius: $radius-md;
}

.style-tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-sm;
  transition: all $duration-fast;
  cursor: pointer;

  &.active {
    background: $bg-card;
    box-shadow: $shadow-sm;
  }
}

.style-tab-icon {
  font-size: 24rpx;
  margin-bottom: 2rpx;
}

.style-tab-name {
  font-size: 20rpx;
  color: $text-tertiary;

  .active & {
    color: $book-primary;
    font-weight: $font-medium;
  }
}

// 艺术风格卡片
.art-style-carousel {
  display: flex;
  gap: $spacing-sm;
  overflow-x: auto;
  padding-bottom: $spacing-xs;
  margin: 0 -#{$spacing-md};
  padding-left: $spacing-md;
  padding-right: $spacing-md;

  &::-webkit-scrollbar { display: none; }
}

.art-card {
  position: relative;
  flex-shrink: 0;
  width: 200rpx;
  height: 180rpx;
  border-radius: $radius-md;
  overflow: hidden;
  border: 2rpx solid $border-light;
  background: $bg-card;
  transition: all $duration-base $ease-bounce;

  &.selected {
    border-color: $book-primary;
    transform: scale(1.02);
    box-shadow: $shadow-colored-book;
  }

  &:active {
    transform: scale(0.96);
  }
}

.art-card-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.15;

  // 儿童内容
  &.storybook { background: linear-gradient(145deg, #FFE4C4 0%, #F5A623 50%, #7FB285 100%); }
  &.cartoon { background: linear-gradient(145deg, #FF7B54 0%, #FFE66D 50%, #4ECDC4 100%); }
  &.watercolor { background: linear-gradient(145deg, #74B9FF 0%, #FFB347 50%, #4ECDC4 100%); }
  &.flat { background: linear-gradient(145deg, #FFE66D 0%, #FF7B54 50%, #7FB285 100%); }
  // 3D 风格
  &.pixar { background: linear-gradient(145deg, #FF7B54 0%, #7FB285 50%, #F5A623 100%); }
  &.pixar_3d { background: linear-gradient(145deg, #74B9FF 0%, #A29BFE 50%, #81ECEC 100%); }
  &.clay { background: linear-gradient(145deg, #E8A87C 0%, #D4A574 50%, #C9956C 100%); }
  &.figurine { background: linear-gradient(145deg, #DFE6E9 0%, #B2BEC3 50%, #636E72 100%); }
  // 动漫风格
  &.anime { background: linear-gradient(145deg, #FFB6C1 0%, #7FB285 50%, #74B9FF 100%); }
  &.chibi { background: linear-gradient(145deg, #FFB5BA 0%, #FFF5BA 50%, #B5D8FF 100%); }
  &.ghibli { background: linear-gradient(145deg, #7FB285 0%, #74B9FF 50%, #F5A623 100%); }
  // 艺术风格
  &.oil_painting { background: linear-gradient(145deg, #8B4513 0%, #D4A574 50%, #FFE4C4 100%); }
  &.sketch { background: linear-gradient(145deg, #2D3436 0%, #636E72 50%, #DFE6E9 100%); }
  &.ink_wash { background: linear-gradient(145deg, #2D3436 0%, #B2BEC3 50%, #DFE6E9 100%); }
  &.pixel_art { background: linear-gradient(145deg, #2ED573 0%, #3742FA 50%, #FF4757 100%); }
  // 兼容旧风格
  &.flat_vector { background: linear-gradient(145deg, #FFE66D 0%, #FF7B54 50%, #7FB285 100%); }
  &.crayon { background: linear-gradient(145deg, #F5A623 0%, #FF7B54 50%, #7FB285 100%); }
}

.art-card-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-sm;
}

.art-icon {
  font-size: 48rpx;
  margin-bottom: $spacing-xs;
}

.art-name {
  font-size: $font-sm;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: 4rpx;
}

.art-desc {
  font-size: $font-xs;
  color: $text-tertiary;
  text-align: center;
}

.art-check {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: $book-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;

  text {
    font-size: 20rpx;
    color: $text-white;
  }
}

.art-badge {
  position: absolute;
  top: 8rpx;
  left: 8rpx;
  padding: 4rpx 12rpx;
  background: $accent;
  border-radius: $radius-sm;
  font-size: 18rpx;
  font-weight: $font-semibold;
  color: $text-white;
  z-index: 2;
}

// 角色选择
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
    background: rgba($book-primary, 0.15);
    border-color: $book-primary;
    box-shadow: $shadow-colored-book;
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
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: $bg-soft;
  border: 2rpx solid $border-light;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-xs;
  transition: all $duration-base;
}

.char-emoji {
  font-size: 48rpx;
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
  border: 3rpx solid $book-primary;
  border-radius: 50%;
  opacity: 0;
  transform: scale(0.8);
  transition: all $duration-base $ease-bounce;
  pointer-events: none;
}

// 音色选择
.voice-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.voice-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: $bg-soft;
  border-radius: $radius-md;
  border: 2rpx solid $border-light;
  transition: all $duration-fast;

  &.selected {
    border-color: $book-primary;
    background: rgba($book-primary, 0.08);
    box-shadow: $shadow-colored-book;

    .voice-waves .wave {
      animation: waveAnim 0.8s ease-in-out infinite;
    }
  }

  &:active {
    transform: scale(0.98);
  }
}

.voice-avatar {
  position: relative;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.voice-emoji {
  font-size: 40rpx;
  position: relative;
  z-index: 1;
}

.voice-waves {
  position: absolute;
  right: -8rpx;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 4rpx;
  align-items: center;
}

.wave {
  width: 4rpx;
  height: 16rpx;
  background: $book-primary;
  border-radius: 2rpx;
  opacity: 0.3;

  &:nth-child(1) { animation-delay: 0s; }
  &:nth-child(2) { animation-delay: 0.15s; height: 24rpx; }
  &:nth-child(3) { animation-delay: 0.3s; }
}

@keyframes waveAnim {
  0%, 100% { transform: scaleY(0.5); opacity: 0.3; }
  50% { transform: scaleY(1); opacity: 1; }
}

.voice-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.voice-name-row {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
}

.voice-name {
  font-size: $font-base;
  font-weight: $font-medium;
  color: $text-primary;
}

.voice-badge {
  font-size: 18rpx;
  padding: 2rpx 8rpx;
  background: $accent;
  color: $text-white;
  border-radius: $radius-xs;
  font-weight: $font-semibold;
}

.voice-gender-tag {
  font-size: 18rpx;
  padding: 2rpx 8rpx;
  border-radius: $radius-xs;
  font-weight: $font-medium;

  &.female { background: $book-light; color: $book-primary; }
  &.male { background: rgba(91, 164, 217, 0.2); color: #5ba4d9; }
  &.neutral { background: rgba(168, 149, 214, 0.2); color: #8875bf; }
  &.child { background: $video-light; color: $video-primary; }
}

.voice-style {
  font-size: $font-xs;
  color: $text-tertiary;
}

.voice-check {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: $book-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  text {
    font-size: 20rpx;
    color: $text-white;
  }
}

// 确认卡片
.confirm-card {
  background: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
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
  background: $video-light;
  border-radius: $radius-md;
  border: 1rpx solid rgba($video-primary, 0.3);
}

.tip-icon {
  font-size: 32rpx;
}

.tip-text {
  font-size: $font-sm;
  color: $video-primary;
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
  background: rgba(255, 251, 247, 0.95);
  backdrop-filter: blur(20rpx);
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
  border: 2rpx solid $border-medium;

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
  background: $book-gradient;
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
    background: $border-medium;
    box-shadow: none;
  }
}
</style>
