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
import { generateNurseryRhyme } from '@/api/content'
import type { ThemeItem, MusicStyle, NurseryRhyme } from '@/api/content'

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

// 主题
const themeCategories = [
  { id: 'habit', name: '习惯养成', icon: '🌟' },
  { id: 'cognition', name: '认知世界', icon: '🌍' },
  { id: 'emotion', name: '情感社交', icon: '💝' }
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

// 存储生成结果
const generatedSong = ref<NurseryRhyme | null>(null)

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

async function startGenerate() {
  if (!selectedTheme.value || !childStore.currentChild) return

  isGenerating.value = true
  generatingProgress.value = 0

  // 模拟进度增长
  const progressTimer = setInterval(() => {
    if (generatingProgress.value < 90) {
      generatingProgress.value += Math.random() * 15
    }
  }, 2000)

  try {
    const ageMonths = childStore.currentChildAgeMonths || 36

    const result = await generateNurseryRhyme({
      child_name: childStore.currentChild.name,
      age_months: ageMonths,
      theme_topic: selectedTheme.value.name,
      theme_category: selectedCategory.value,
      music_style: selectedStyle.value
    })

    console.log('生成儿歌成功:', result)
    console.log('生成儿歌 - 返回的 keys:', Object.keys(result))
    console.log('生成儿歌 - lyrics 字段:', result.lyrics?.substring(0, 100))
    console.log('生成儿歌 - audio_url:', result.audio_url)
    generatedSong.value = result
    generatingProgress.value = 100

    clearInterval(progressTimer)

    // 跳转到播放页 - 始终存储数据到临时存储，确保播放页能立即获取内容
    setTimeout(() => {
      isGenerating.value = false
      // 临时存储到全局，播放页读取
      console.log('[create] 存储到临时存储:', JSON.stringify(result).substring(0, 200))
      uni.setStorageSync('temp_nursery_rhyme', result)
      uni.redirectTo({
        url: `/pages/play/nursery-rhyme?id=${result.id || ''}&fromGenerate=1`
      })
    }, 500)
  } catch (e: any) {
    clearInterval(progressTimer)
    isGenerating.value = false
    console.error('生成儿歌失败:', e)
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
