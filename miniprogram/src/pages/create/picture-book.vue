<template>
  <view class="page-container">
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
          <!-- 艺术风格 - 大卡片展示 -->
          <view class="style-section art-section">
            <view class="section-header">
              <view class="section-icon-wrap">
                <text class="section-icon">🎨</text>
              </view>
              <text class="section-title">艺术风格</text>
            </view>
            <view class="art-style-carousel">
              <view
                v-for="style in artStyles"
                :key="style.value"
                class="art-card"
                :class="{ selected: selectedArtStyle === style.value, recommended: style.value === 'pixar_3d' }"
                @tap="selectedArtStyle = style.value"
              >
                <view class="art-card-bg" :class="style.value"></view>
                <view class="art-card-content">
                  <text class="art-icon">{{ style.icon }}</text>
                  <text class="art-name">{{ style.label }}</text>
                  <text class="art-desc">{{ style.desc }}</text>
                </view>
                <view v-if="selectedArtStyle === style.value" class="art-check">
                  <text>✓</text>
                </view>
                <view v-if="style.value === 'pixar_3d'" class="art-badge">推荐</view>
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

          <!-- 画面色调 - 色彩条展示 -->
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
                      {{ voice.gender === 'female' ? '女声' : voice.gender === 'male' ? '男声' : '童声' }}
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
            <text class="confirm-label">画面色调</text>
            <text class="confirm-value">{{ currentPaletteName }}</text>
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
  type ColorPalette,
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

// 主题
const themeCategories = [
  { id: 'habit', name: '习惯养成', icon: '🌟' },
  { id: 'cognition', name: '认知世界', icon: '🌍' },
  { id: 'emotion', name: '情感社交', icon: '💝' }
]
const selectedCategory = ref('habit')
const selectedTheme = ref<ThemeItem | null>(null)

// 艺术风格选项
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

// TTS 音色选项
const voiceOptions = [
  { id: 'Cherry' as VoiceId, name: '樱桃', gender: 'female', style: '温柔亲切', emoji: '🍒', recommended: true },
  { id: 'Serena' as VoiceId, name: '思睿', gender: 'female', style: '知性优雅', emoji: '📚' },
  { id: 'Chelsie' as VoiceId, name: '晨曦', gender: 'female', style: '活泼可爱', emoji: '☀️' },
  { id: 'Brittany' as VoiceId, name: '贝蒂', gender: 'female', style: '甜美清新', emoji: '🌸' },
  { id: 'Ethan' as VoiceId, name: '伊森', gender: 'male', style: '成熟稳重', emoji: '👔' },
  { id: 'Luke' as VoiceId, name: '卢克', gender: 'male', style: '温暖亲和', emoji: '🌟' },
  { id: 'Stella' as VoiceId, name: '星星', gender: 'child', style: '童真可爱', emoji: '⭐' }
]
const selectedVoiceId = ref<VoiceId>('Cherry')

// 生成状态
const isGenerating = ref(false)
const generatingProgress = ref(0)

// 计算属性
const childName = computed(() => childStore.currentChild?.name || '宝贝')

const filteredThemes = computed(() => {
  const themes = contentStore.themes?.[selectedCategory.value]?.themes || []
  return themes.length > 0 ? themes : defaultThemes[selectedCategory.value] || []
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

const currentVoiceName = computed(() => {
  const voice = voiceOptions.find(v => v.id === selectedVoiceId.value)
  return voice ? `${voice.emoji} ${voice.name}` : ''
})

const canNext = computed(() => {
  if (currentStep.value === 0) return !!selectedTheme.value
  return true
})

// 默认主题（API 未返回时使用）
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
  ],
  emotion: [
    { id: 'sharing', name: '学会分享', subcategory: '社交能力', age_range: [24, 60], keywords: [] },
    { id: 'making_friends', name: '交朋友', subcategory: '社交能力', age_range: [30, 60], keywords: [] },
    { id: 'managing_anger', name: '控制情绪', subcategory: '情绪管理', age_range: [30, 60], keywords: [] },
    { id: 'courage', name: '勇敢', subcategory: '性格培养', age_range: [30, 72], keywords: [] },
    { id: 'love_family', name: '爱家人', subcategory: '情感培养', age_range: [18, 60], keywords: [] },
    { id: 'helping_others', name: '帮助他人', subcategory: '社交能力', age_range: [30, 60], keywords: [] }
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

  try {
    // 使用 currentChildAgeMonths 计算属性获取月龄
    const ageMonths = childStore.currentChildAgeMonths || 36 // 默认 3 岁

    // 1. 发起异步生成请求
    console.log('[绘本] 发起异步生成请求，风格:', selectedArtStyle.value, selectedAnimal.value, selectedPalette.value, '音色:', selectedVoiceId.value)
    const asyncResult = await generatePictureBookAsync({
      child_name: childStore.currentChild.name,
      age_months: ageMonths,
      theme_topic: selectedTheme.value.id,
      theme_category: selectedCategory.value,
      // 风格参数
      art_style: selectedArtStyle.value,
      protagonist: {
        animal: selectedAnimal.value
      },
      color_palette: selectedPalette.value,
      // TTS 音色
      voice_id: selectedVoiceId.value
    })

    const taskId = asyncResult.task_id
    console.log('[绘本] 获取到 task_id:', taskId)

    // 2. 轮询任务状态
    const maxAttempts = 120  // 最多轮询 120 次（6 分钟）
    const pollInterval = 3000  // 每 3 秒轮询一次
    let attempts = 0

    let consecutiveErrors = 0  // 连续错误计数
    const maxConsecutiveErrors = 5  // 最多允许连续 5 次错误

    const pollStatus = async (): Promise<PictureBook | null> => {
      while (attempts < maxAttempts) {
        attempts++
        console.log(`[绘本] 轮询状态 第 ${attempts} 次`)

        try {
          const status = await getPictureBookTaskStatus(taskId)
          consecutiveErrors = 0  // 重置连续错误计数
          console.log('[绘本] 状态:', status.status, '进度:', status.progress, '阶段:', status.stage)

          // 更新进度条
          generatingProgress.value = status.progress || Math.min(attempts * 2, 95)

          // 检查完成状态
          if (status.status === 'completed') {
            generatingProgress.value = 100
            // 优先使用 result，否则通过 content_id 获取详情
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

          // 检查失败状态 - 直接抛出，不要被下面的 catch 重试
          if (status.status === 'failed') {
            const errorMsg = status.error || '绘本生成失败'
            console.error('[绘本] 生成失败:', errorMsg)
            // 创建带标记的错误，避免被当作网络错误重试
            const businessError = new Error(errorMsg)
            ;(businessError as any).isBusinessError = true
            throw businessError
          }

          // 等待后继续轮询
          await new Promise(resolve => setTimeout(resolve, pollInterval))
        } catch (e: any) {
          // 业务错误（如 failed 状态）直接抛出，不重试
          if (e.isBusinessError) {
            throw e
          }

          consecutiveErrors++
          console.error(`[绘本] 轮询出错 (${consecutiveErrors}/${maxConsecutiveErrors}):`, e?.errMsg || e?.message || e)

          // 连续错误过多则失败
          if (consecutiveErrors >= maxConsecutiveErrors) {
            throw new Error('网络连接不稳定，请检查网络后重试')
          }

          // 网络错误时等待更长时间后重试
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

      // 存储到临时存储，供播放页使用
      uni.setStorageSync('temp_picture_book', result)

      // 跳转到播放页
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

  // 加载主题
  contentStore.fetchThemes()
})

// 处理传入的主题参数
onLoad((options) => {
  if (options?.theme) {
    // 查找对应主题
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
    border-color: $primary;
    background: $primary;

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

  .active & { color: $primary; font-weight: $font-medium; }
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
    border-color: $primary;
    background: rgba($primary, 0.05);
  }
}

.tab-icon {
  font-size: 36rpx;
  margin-bottom: 4rpx;
}

.tab-name {
  font-size: $font-sm;
  color: $text-primary;

  .active & { color: $primary; font-weight: $font-medium; }
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
    border-color: $primary;
    background: rgba($primary, 0.05);
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
  background: $primary;
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
// 风格选择页 - 增强版 UI
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
  box-shadow: $shadow-soft;
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
  background: linear-gradient(135deg, #FFE8E8 0%, #FFF0E8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.bunny { background: linear-gradient(135deg, #FFE0F0 0%, #FFF0E8 100%); }
  &.palette { background: linear-gradient(135deg, #E8F4FF 0%, #E8FFF0 100%); }
  &.voice { background: linear-gradient(135deg, #F0E8FF 0%, #FFE8F8 100%); }
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
  color: $text-secondary;
}

// ==========================================
// 艺术风格卡片 - 横向滚动大卡片
// ==========================================
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
  border: 3rpx solid transparent;
  transition: all $duration-base $ease-bounce;

  &.selected {
    border-color: $primary;
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

  &.pixar_3d { background: linear-gradient(145deg, #FFE8F0 0%, #E8F0FF 50%, #E8FFF0 100%); }
  &.watercolor { background: linear-gradient(145deg, #E8F4FF 0%, #FFF0E8 50%, #E8FFE8 100%); }
  &.flat_vector { background: linear-gradient(145deg, #FFF5E8 0%, #FFE8F0 50%, #E8EFFF 100%); }
  &.crayon { background: linear-gradient(145deg, #FFFAE8 0%, #FFE8E8 50%, #E8FFF8 100%); }
  &.anime { background: linear-gradient(145deg, #FFE8F8 0%, #F0E8FF 50%, #E8F8FF 100%); }
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
  color: $text-secondary;
  text-align: center;
}

.art-check {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: $primary;
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
  color: #8B6914;
  z-index: 2;
}

// ==========================================
// 角色选择 - 圆形头像卡片
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
    background: rgba($primary, 0.15);
    border-color: $primary;
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
  background: $bg-base;
  border: 3rpx solid transparent;
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
  border: 3rpx solid $primary;
  border-radius: 50%;
  opacity: 0;
  transform: scale(0.8);
  transition: all $duration-base $ease-bounce;
  pointer-events: none;
}

// ==========================================
// 色彩风格 - 条纹预览卡片
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
  background: $bg-base;
  border-radius: $radius-md;
  border: 2rpx solid transparent;
  transition: all $duration-fast;

  &.selected {
    border-color: $primary;
    background: rgba($primary, 0.05);
  }

  &:active {
    transform: scale(0.98);
  }
}

.palette-preview {
  width: 80rpx;
  height: 48rpx;
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
  color: $text-secondary;
}

.palette-check {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  text {
    font-size: 20rpx;
    color: $text-white;
  }
}

// ==========================================
// 音色选择 - 带音波效果
// ==========================================
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
  background: $bg-base;
  border-radius: $radius-md;
  border: 2rpx solid transparent;
  transition: all $duration-fast;

  &.selected {
    border-color: $primary;
    background: rgba($primary, 0.05);

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
  background: $primary;
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
  color: #8B6914;
  border-radius: $radius-xs;
  font-weight: $font-semibold;
}

.voice-gender-tag {
  font-size: 18rpx;
  padding: 2rpx 8rpx;
  border-radius: $radius-xs;
  font-weight: $font-medium;

  &.female { background: #FFE8F0; color: #D63384; }
  &.male { background: #E8F0FF; color: #0D6EFD; }
  &.child { background: #FFF5E8; color: #FD7E14; }
}

.voice-style {
  font-size: $font-xs;
  color: $text-secondary;
}

.voice-check {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: $primary;
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
  background: $accent-soft;
  border-radius: $radius-md;
}

.tip-icon {
  font-size: 32rpx;
}

.tip-text {
  font-size: $font-sm;
  color: #8B7000;
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
  background: $gradient-primary;
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
