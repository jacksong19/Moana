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

      <!-- 步骤 2: 个性化设置 -->
      <view v-if="currentStep === 1" class="step-content animate-fadeIn">
        <text class="step-title">个性化设置</text>
        <text class="step-desc">让故事更贴近 {{ childName }}</text>

        <view class="form-section">
          <!-- 角色选择 -->
          <view class="form-item">
            <text class="form-label">故事角色</text>
            <text class="form-hint">选择宝贝喜欢的角色出现在故事中</text>
            <view class="character-grid">
              <view
                v-for="char in characters"
                :key="char.id"
                class="character-item"
                :class="{ selected: selectedCharacters.includes(char.id) }"
                @tap="toggleCharacter(char.id)"
              >
                <text class="char-emoji">{{ char.emoji }}</text>
                <text class="char-name">{{ char.name }}</text>
              </view>
            </view>
          </view>

          <!-- 故事长度 -->
          <view class="form-item">
            <text class="form-label">故事长度</text>
            <view class="length-options">
              <view
                v-for="len in lengthOptions"
                :key="len.value"
                class="length-item"
                :class="{ selected: storyLength === len.value }"
                @tap="storyLength = len.value"
              >
                <text class="length-name">{{ len.name }}</text>
                <text class="length-desc">{{ len.desc }}</text>
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
            <text class="confirm-label">故事角色</text>
            <text class="confirm-value">{{ selectedCharacterNames }}</text>
          </view>
          <view class="confirm-item">
            <text class="confirm-label">故事长度</text>
            <text class="confirm-value">{{ currentLengthName }}</text>
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
import type { ThemeItem } from '@/api/content'

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

// 角色
const characters = [
  { id: 'bear', name: '小熊', emoji: '🐻' },
  { id: 'rabbit', name: '小兔子', emoji: '🐰' },
  { id: 'cat', name: '小猫咪', emoji: '🐱' },
  { id: 'dog', name: '小狗狗', emoji: '🐶' },
  { id: 'elephant', name: '小象', emoji: '🐘' },
  { id: 'panda', name: '熊猫', emoji: '🐼' }
]
const selectedCharacters = ref<string[]>(['bear'])

// 故事长度
const lengthOptions = [
  { value: 'short', name: '简短版', desc: '5-6页，约2分钟' },
  { value: 'medium', name: '标准版', desc: '8-10页，约4分钟' },
  { value: 'long', name: '完整版', desc: '12-15页，约6分钟' }
]
const storyLength = ref('medium')

// 生成状态
const isGenerating = ref(false)
const generatingProgress = ref(0)

// 计算属性
const childName = computed(() => childStore.currentChild?.name || '宝贝')

const filteredThemes = computed(() => {
  const themes = contentStore.themes?.[selectedCategory.value]?.themes || []
  return themes.length > 0 ? themes : defaultThemes[selectedCategory.value] || []
})

const selectedCharacterNames = computed(() => {
  return selectedCharacters.value
    .map(id => characters.find(c => c.id === id)?.name)
    .filter(Boolean)
    .join('、') || '无'
})

const currentLengthName = computed(() => {
  return lengthOptions.find(l => l.value === storyLength.value)?.name || ''
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

function toggleCharacter(id: string) {
  const index = selectedCharacters.value.indexOf(id)
  if (index > -1) {
    if (selectedCharacters.value.length > 1) {
      selectedCharacters.value.splice(index, 1)
    }
  } else {
    if (selectedCharacters.value.length < 3) {
      selectedCharacters.value.push(id)
    }
  }
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
    const result = await contentStore.createPictureBook({
      child_name: childStore.currentChild.name,
      age_months: childStore.currentChild.age_months,
      theme_topic: selectedTheme.value.id,
      theme_category: selectedCategory.value,
      favorite_characters: selectedCharacters.value
    })

    // 模拟进度完成
    generatingProgress.value = 100

    // 跳转到播放页
    setTimeout(() => {
      isGenerating.value = false
      uni.redirectTo({
        url: `/pages/play/picture-book?id=${result.id}`
      })
    }, 500)
  } catch (e) {
    isGenerating.value = false
    uni.showToast({ title: '生成失败，请重试', icon: 'none' })
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

// 同步生成进度
setInterval(() => {
  if (isGenerating.value) {
    generatingProgress.value = contentStore.generatingProgress
  }
}, 100)
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page-container {
  min-height: 100vh;
  background: $bg-base;
  display: flex;
  flex-direction: column;
}

// 导航栏
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: $z-sticky;
  background: $bg-base;
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
  padding: 0 $spacing-md;
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

// 表单
.form-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.form-item {
  background: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
}

.form-label {
  display: block;
  font-size: $font-md;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: 4rpx;
}

.form-hint {
  display: block;
  font-size: $font-sm;
  color: $text-secondary;
  margin-bottom: $spacing-sm;
}

// 角色选择
.character-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-sm;
}

.character-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-sm;
  background: $bg-base;
  border-radius: $radius-md;
  border: 2rpx solid transparent;
  transition: all $duration-fast;

  &.selected {
    border-color: $primary;
    background: rgba($primary, 0.1);
  }
}

.char-emoji {
  font-size: 40rpx;
  margin-bottom: 4rpx;
}

.char-name {
  font-size: $font-xs;
  color: $text-primary;
}

// 长度选择
.length-options {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.length-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-sm $spacing-md;
  background: $bg-base;
  border-radius: $radius-md;
  border: 2rpx solid transparent;
  transition: all $duration-fast;

  &.selected {
    border-color: $primary;
    background: rgba($primary, 0.1);
  }
}

.length-name {
  font-size: $font-base;
  font-weight: $font-medium;
  color: $text-primary;
}

.length-desc {
  font-size: $font-sm;
  color: $text-secondary;
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
  right: 0;
  display: flex;
  gap: $spacing-sm;
  padding: $spacing-md;
  padding-bottom: calc(#{$spacing-md} + env(safe-area-inset-bottom));
  background: $bg-card;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
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
