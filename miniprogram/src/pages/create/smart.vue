<template>
  <view class="page-container">
    <!-- 装饰背景 -->
    <view class="decor-bg">
      <view class="decor-shape shape-1"></view>
      <view class="decor-shape shape-2"></view>
    </view>

    <!-- 主内容区 -->
    <scroll-view class="main-scroll" scroll-y enhanced :show-scrollbar="false">
      <!-- 顶部返回按钮区 -->
      <view class="top-bar">
        <view class="back-btn" @tap="goBack">
          <text>&larr;</text>
        </view>
        <view class="step-indicator">
          <view
            v-for="i in 3"
            :key="i"
            class="step-dot"
            :class="{ active: currentStep >= i, current: currentStep === i }"
          ></view>
        </view>
      </view>

      <!-- 页面标题区 -->
      <view class="header-section">
        <view class="header-badge">
          <text class="badge-icon">🔮</text>
          <text class="badge-text">智能创作</text>
        </view>
        <text class="header-title">{{ stepTitles[currentStep - 1] }}</text>
        <text class="header-desc">{{ stepDescs[currentStep - 1] }}</text>
      </view>

      <!-- Step 1: 输入创意描述 -->
      <view v-show="currentStep === 1" class="step-content">
        <view class="input-section">
          <view class="input-container">
            <textarea
              v-model="customPrompt"
              class="prompt-input"
              placeholder="描述你想要创作的内容..."
              :maxlength="500"
              auto-height
              :focus="currentStep === 1"
            />
            <view class="input-footer">
              <text class="char-count">{{ customPrompt.length }}/500</text>
            </view>
          </view>

          <!-- 灵感标签 -->
          <view class="inspiration-section">
            <text class="section-label">快捷灵感</text>
            <view class="inspiration-tags">
              <view
                v-for="(tag, index) in inspirationTags"
                :key="index"
                class="tag-item"
                @tap="fillInspiration(tag)"
              >
                <text class="tag-emoji">{{ tag.emoji }}</text>
                <text class="tag-text">{{ tag.label }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="step-actions">
          <view
            class="next-btn"
            :class="{ disabled: !customPrompt.trim() }"
            @tap="goToStep(2)"
          >
            <text>下一步：选择内容类型</text>
            <text class="btn-arrow">&rarr;</text>
          </view>
        </view>
      </view>

      <!-- Step 2: 选择内容类型 -->
      <view v-show="currentStep === 2" class="step-content">
        <view class="type-selection">
          <view
            v-for="type in contentTypes"
            :key="type.id"
            class="type-card"
            :class="{ selected: selectedType === type.id }"
            @tap="selectType(type.id)"
          >
            <view class="type-icon-wrap">
              <text class="type-icon">{{ type.icon }}</text>
            </view>
            <view class="type-info">
              <text class="type-name">{{ type.name }}</text>
              <text class="type-desc">{{ type.description }}</text>
            </view>
            <view class="type-check" v-if="selectedType === type.id">
              <text>✓</text>
            </view>
          </view>

          <!-- 视频子选项 -->
          <view v-if="selectedType === 'video'" class="video-mode-section">
            <text class="section-label">视频创作模式</text>
            <view class="video-modes">
              <view
                v-for="mode in videoModes"
                :key="mode.id"
                class="mode-option"
                :class="{ selected: selectedVideoMode === mode.id }"
                @tap="selectedVideoMode = mode.id"
              >
                <view class="mode-radio">
                  <view v-if="selectedVideoMode === mode.id" class="radio-inner"></view>
                </view>
                <view class="mode-content">
                  <text class="mode-name">{{ mode.name }}</text>
                  <text class="mode-desc">{{ mode.description }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="step-actions">
          <view class="prev-btn" @tap="goToStep(1)">
            <text class="btn-arrow">&larr;</text>
            <text>上一步</text>
          </view>
          <view
            class="next-btn"
            :class="{ disabled: !selectedType }"
            @tap="goToStep(3)"
          >
            <text>下一步：高级设置</text>
            <text class="btn-arrow">&rarr;</text>
          </view>
        </view>
      </view>

      <!-- Step 3: 高级设置 & 确认创作 -->
      <view v-show="currentStep === 3" class="step-content">
        <!-- 创作预览 -->
        <view class="preview-section">
          <view class="preview-card">
            <view class="preview-header">
              <text class="preview-type-icon">{{ getTypeIcon(selectedType) }}</text>
              <text class="preview-type-name">{{ getTypeName(selectedType) }}</text>
            </view>
            <view class="preview-prompt">
              <text>"{{ customPrompt }}"</text>
            </view>
          </view>
        </view>

        <!-- 高级设置（可折叠） -->
        <view class="advanced-section">
          <view class="advanced-header" @tap="showAdvanced = !showAdvanced">
            <text class="advanced-title">高级设置</text>
            <text class="advanced-toggle">{{ showAdvanced ? '收起' : '展开' }}</text>
          </view>

          <view v-show="showAdvanced" class="advanced-content">
            <!-- 艺术风格（仅绘本和视频显示） -->
            <view v-if="selectedType !== 'nursery_rhyme'" class="setting-group">
              <text class="setting-label">艺术风格</text>
              <view class="style-options">
                <view
                  v-for="style in artStyles"
                  :key="style.id"
                  class="style-item"
                  :class="{ selected: selectedArtStyle === style.id }"
                  @tap="selectedArtStyle = style.id"
                >
                  <text class="style-name">{{ style.name }}</text>
                </view>
              </view>
            </view>

            <!-- 故事主角（影响歌词/故事内容） -->
            <view class="setting-group">
              <text class="setting-label">故事主角</text>
              <view class="protagonist-options">
                <view
                  v-for="p in protagonists"
                  :key="p.animal"
                  class="protagonist-item"
                  :class="{ selected: selectedProtagonist === p.animal }"
                  @tap="selectedProtagonist = p.animal"
                >
                  <text class="protagonist-emoji">{{ getProtagonistEmoji(p.animal) }}</text>
                  <text class="protagonist-name">{{ p.name }}</text>
                </view>
              </view>
            </view>

            <!-- 绘本：旁白音色 -->
            <view v-if="selectedType === 'picture_book'" class="setting-group">
              <text class="setting-label">旁白音色</text>
              <view class="voice-options">
                <view
                  v-for="voice in ttsVoices"
                  :key="voice.id"
                  class="voice-item"
                  :class="{ selected: selectedVoice === voice.id }"
                  @tap="selectedVoice = voice.id"
                >
                  <text class="voice-name">{{ voice.name }}</text>
                  <text class="voice-style">{{ voice.style }}</text>
                </view>
              </view>
            </view>

            <!-- 儿歌：音乐情绪 -->
            <view v-if="selectedType === 'nursery_rhyme'" class="setting-group">
              <text class="setting-label">音乐情绪</text>
              <view class="mood-options">
                <view
                  v-for="mood in musicMoods"
                  :key="mood.id"
                  class="mood-item"
                  :class="{ selected: selectedMood === mood.id }"
                  @tap="selectedMood = mood.id"
                >
                  <text class="mood-name">{{ mood.name }}</text>
                </view>
              </view>
            </view>

            <!-- 视频：参数设置 -->
            <view v-if="selectedType === 'video' && selectedVideoMode === 'standalone'" class="setting-group">
              <text class="setting-label">视频时长</text>
              <view class="duration-options">
                <view
                  v-for="d in [5, 6, 8]"
                  :key="d"
                  class="duration-item"
                  :class="{ selected: selectedDuration === d }"
                  @tap="selectedDuration = d"
                >
                  <text>{{ d }}秒</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="step-actions">
          <view class="prev-btn" @tap="goToStep(2)">
            <text class="btn-arrow">&larr;</text>
            <text>上一步</text>
          </view>
          <view class="submit-btn" @tap="handleSubmit">
            <view class="btn-shine"></view>
            <view class="btn-content">
              <text class="btn-icon">✨</text>
              <text class="btn-text">开始创作</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部安全区 -->
      <view class="safe-bottom"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useChildStore } from '@/stores/child'
import {
  getStyleOptions,
  type ArtStyle,
  type ProtagonistAnimal,
  type MusicMood,
  type VoiceId
} from '@/api/content'

const childStore = useChildStore()

// 步骤控制
const currentStep = ref(1)
const stepTitles = ['描述你的创意', '选择内容类型', '确认创作']
const stepDescs = [
  '告诉 AI 你想要什么样的内容',
  '选择绘本、儿歌或视频',
  '调整设置并开始创作'
]

// Step 1: 用户输入
const customPrompt = ref('')
const inspirationTags = [
  { emoji: '🦷', label: '刷牙习惯', text: '宝宝不爱刷牙，做一个关于刷牙的有趣内容' },
  { emoji: '🥦', label: '爱吃蔬菜', text: '宝宝挑食不吃蔬菜，帮我做一个关于蔬菜的故事' },
  { emoji: '🛏', label: '早睡早起', text: '宝宝晚上不愿意睡觉，需要一个睡前故事' },
  { emoji: '🚿', label: '洗澡洗手', text: '教宝宝养成爱干净的好习惯' },
  { emoji: '💬', label: '礼貌用语', text: '教宝宝说请、谢谢、对不起等礼貌用语' },
  { emoji: '🖐', label: '学会分享', text: '宝宝不愿意和小朋友分享玩具' },
  { emoji: '👭', label: '交朋友', text: '帮助宝宝学会和其他小朋友交朋友' },
  { emoji: '😌', label: '情绪管理', text: '宝宝容易发脾气，教他管理情绪' },
  { emoji: '🏠', label: '认识家人', text: '教宝宝认识家庭成员和亲情关系' }
]

// Step 2: 内容类型选择
const selectedType = ref<'picture_book' | 'nursery_rhyme' | 'video' | ''>('')
const contentTypes = [
  { id: 'picture_book', icon: '📚', name: 'AI 绘本', description: '个性化故事配精美插画' },
  { id: 'nursery_rhyme', icon: '🎵', name: 'AI 儿歌', description: '原创旋律专属歌词' },
  { id: 'video', icon: '🎬', name: 'AI 视频', description: '动态视频内容' }
]

const selectedVideoMode = ref<'from_book' | 'standalone'>('standalone')
const videoModes = [
  { id: 'standalone', name: '独立创作', description: '根据描述直接生成视频' },
  { id: 'from_book', name: '基于绘本', description: '先创作绘本，再生成视频' }
]

// Step 3: 高级设置
const showAdvanced = ref(false)
const selectedArtStyle = ref<ArtStyle>('storybook')
const selectedProtagonist = ref<ProtagonistAnimal>('bunny')
const selectedVoice = ref<VoiceId>('Cherry')
const selectedMood = ref<MusicMood>('cheerful')
const selectedDuration = ref(5)

// 风格选项（从 API 加载）
const artStyles = ref<Array<{ id: ArtStyle; name: string }>>([])
const protagonists = ref<Array<{ animal: ProtagonistAnimal; name: string }>>([])
const ttsVoices = ref<Array<{ id: VoiceId; name: string; style: string }>>([])
const musicMoods = ref<Array<{ id: MusicMood; name: string }>>([])

// 页面参数
onLoad((options) => {
  if (options?.input) {
    customPrompt.value = decodeURIComponent(options.input)
  }
})

onMounted(async () => {
  try {
    const options = await getStyleOptions()
    artStyles.value = options.art_styles.map(s => ({ id: s.id, name: s.name }))
    protagonists.value = options.protagonists.map(p => ({ animal: p.animal, name: p.name }))
    ttsVoices.value = options.tts_voices.map(v => ({ id: v.id, name: v.name, style: v.style }))
    musicMoods.value = options.music_moods.map(m => ({ id: m.id, name: m.name }))
  } catch (e) {
    console.error('加载风格选项失败:', e)
  }
})

function goBack() {
  if (currentStep.value > 1) {
    currentStep.value--
  } else {
    uni.navigateBack({
      fail: () => uni.switchTab({ url: '/pages/create/index' })
    })
  }
}

function goToStep(step: number) {
  if (step === 2 && !customPrompt.value.trim()) return
  if (step === 3 && !selectedType.value) return
  currentStep.value = step
}

function fillInspiration(tag: { text: string }) {
  customPrompt.value = tag.text
}

function selectType(type: 'picture_book' | 'nursery_rhyme' | 'video') {
  selectedType.value = type
}

function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    picture_book: '📚',
    nursery_rhyme: '🎵',
    video: '🎬'
  }
  return icons[type] || '✨'
}

function getTypeName(type: string): string {
  const names: Record<string, string> = {
    picture_book: 'AI 绘本',
    nursery_rhyme: 'AI 儿歌',
    video: 'AI 视频'
  }
  return names[type] || '智能创作'
}

function getProtagonistEmoji(animal: string): string {
  const emojis: Record<string, string> = {
    bunny: '🐰',
    bear: '🐻',
    cat: '🐱',
    dog: '🐶',
    panda: '🐼',
    fox: '🦊'
  }
  return emojis[animal] || '🐰'
}

async function handleSubmit() {
  if (!customPrompt.value.trim() || !selectedType.value) return

  const child = childStore.currentChild
  if (!child) {
    uni.showToast({ title: '请先添加宝贝', icon: 'none' })
    return
  }

  // 构建参数并跳转到对应创作页面
  // 基础参数（不含艺术风格，因为儿歌不需要）
  const baseParams = {
    creation_mode: 'smart',
    custom_prompt: customPrompt.value,
    protagonist: selectedProtagonist.value
  }

  let url = ''
  let params: Record<string, string> = {}

  switch (selectedType.value) {
    case 'picture_book':
      url = '/pages/create/picture-book'
      params = {
        ...baseParams,
        art_style: selectedArtStyle.value,  // 绘本需要艺术风格
        voice_id: selectedVoice.value
      } as Record<string, string>
      break

    case 'nursery_rhyme':
      url = '/pages/create/nursery-rhyme'
      params = {
        ...baseParams,
        // 儿歌不传 art_style，只传音乐情绪
        music_mood: selectedMood.value
      } as Record<string, string>
      break

    case 'video':
      if (selectedVideoMode.value === 'standalone') {
        url = '/pages/create/video'
        params = {
          ...baseParams,
          art_style: selectedArtStyle.value,  // 视频需要艺术风格
          mode: 'standalone',
          duration: String(selectedDuration.value)
        } as Record<string, string>
      } else {
        // 基于绘本模式：先跳转到绘本创作
        url = '/pages/create/picture-book'
        params = {
          ...baseParams,
          art_style: selectedArtStyle.value,  // 绘本需要艺术风格
          voice_id: selectedVoice.value,
          auto_video: 'true'  // 标记创作完成后自动跳转视频
        } as Record<string, string>
      }
      break
  }

  // 构建 query string
  const queryString = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')

  uni.navigateTo({ url: `${url}?${queryString}` })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page-container {
  min-height: 100vh;
  background: $bg-cream;
  width: 750rpx;
  position: relative;
  overflow: hidden;
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
}

.decor-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.4;

  &.shape-1 {
    width: 300rpx;
    height: 300rpx;
    background: linear-gradient(135deg, #A78BFA, #818CF8);
    top: -80rpx;
    right: -60rpx;
  }

  &.shape-2 {
    width: 250rpx;
    height: 250rpx;
    background: linear-gradient(135deg, #F472B6, #EC4899);
    bottom: 20%;
    left: -80rpx;
  }
}

// 主滚动区
.main-scroll {
  position: relative;
  z-index: 1;
  height: 100vh;
  padding: 0 32rpx;
  box-sizing: border-box;
}

// 顶部栏
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: calc(env(safe-area-inset-top) + 20rpx);
  padding-bottom: 16rpx;
}

.back-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-card;
  border: 1rpx solid $border-light;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;

  text {
    font-size: 36rpx;
    color: $text-secondary;
  }

  &:active {
    transform: scale(0.92);
  }
}

.step-indicator {
  display: flex;
  gap: 12rpx;
}

.step-dot {
  width: 24rpx;
  height: 8rpx;
  border-radius: 4rpx;
  background: $border-light;
  transition: all 0.3s ease;

  &.active {
    background: $primary-light;
  }

  &.current {
    width: 48rpx;
    background: $primary;
  }
}

// 页面标题区
.header-section {
  text-align: center;
  padding: 24rpx 0 40rpx;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 20rpx;
  background: rgba($primary, 0.1);
  border: 1rpx solid rgba($primary, 0.2);
  border-radius: $radius-full;
  margin-bottom: 16rpx;
}

.badge-icon {
  font-size: 24rpx;
}

.badge-text {
  font-size: 24rpx;
  color: $primary;
  font-weight: $font-medium;
}

.header-title {
  display: block;
  font-size: 44rpx;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: 8rpx;
}

.header-desc {
  display: block;
  font-size: 28rpx;
  color: $text-tertiary;
}

// Step 内容区
.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

// Step 1: 输入区
.input-section {
  background: $bg-card;
  border: 1rpx solid $border-light;
  border-radius: $radius-lg;
  padding: 24rpx;
  margin-bottom: 32rpx;
}

.input-container {
  position: relative;
  margin-bottom: 24rpx;
}

.prompt-input {
  width: 100%;
  min-height: 160rpx;
  padding: 20rpx;
  background: $bg-soft;
  border: 1rpx solid $border-light;
  border-radius: $radius-md;
  font-size: $font-base;
  color: $text-primary;
  line-height: 1.6;
  box-sizing: border-box;
}

.input-footer {
  position: absolute;
  bottom: 12rpx;
  right: 16rpx;
}

.char-count {
  font-size: 22rpx;
  color: $text-placeholder;
}

.inspiration-section {
  margin-top: 20rpx;
}

.section-label {
  display: block;
  font-size: 26rpx;
  color: $text-secondary;
  margin-bottom: 16rpx;
}

.inspiration-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 12rpx 16rpx;
  background: $bg-soft;
  border: 1rpx solid $border-light;
  border-radius: $radius-full;

  &:active {
    background: rgba($primary, 0.08);
    border-color: $primary-light;
  }
}

.tag-emoji {
  font-size: 20rpx;
}

.tag-text {
  font-size: 24rpx;
  color: $text-secondary;
}

// Step 2: 类型选择
.type-selection {
  margin-bottom: 32rpx;
}

.type-card {
  display: flex;
  align-items: center;
  padding: 28rpx;
  background: $bg-card;
  border: 2rpx solid $border-light;
  border-radius: $radius-lg;
  margin-bottom: 16rpx;
  transition: all 0.2s ease;

  &.selected {
    border-color: $primary;
    background: rgba($primary, 0.04);
  }

  &:active {
    transform: scale(0.98);
  }
}

.type-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-soft;
  border-radius: $radius-md;
  margin-right: 20rpx;
}

.type-icon {
  font-size: 40rpx;
}

.type-info {
  flex: 1;
}

.type-name {
  display: block;
  font-size: 32rpx;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: 4rpx;
}

.type-desc {
  display: block;
  font-size: 26rpx;
  color: $text-tertiary;
}

.type-check {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $primary;
  border-radius: 50%;

  text {
    color: white;
    font-size: 28rpx;
    font-weight: bold;
  }
}

.video-mode-section {
  margin-top: 24rpx;
  padding: 20rpx;
  background: $bg-soft;
  border-radius: $radius-md;
}

.video-modes {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.mode-option {
  display: flex;
  align-items: center;
  padding: 16rpx;
  background: $bg-card;
  border: 1rpx solid $border-light;
  border-radius: $radius-md;

  &.selected {
    border-color: $primary;
    background: rgba($primary, 0.04);
  }
}

.mode-radio {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid $border-light;
  border-radius: 50%;
  margin-right: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  .radio-inner {
    width: 20rpx;
    height: 20rpx;
    background: $primary;
    border-radius: 50%;
  }
}

.mode-content {
  flex: 1;
}

.mode-name {
  display: block;
  font-size: 28rpx;
  font-weight: $font-medium;
  color: $text-primary;
}

.mode-desc {
  display: block;
  font-size: 24rpx;
  color: $text-tertiary;
}

// Step 3: 高级设置
.preview-section {
  margin-bottom: 24rpx;
}

.preview-card {
  background: linear-gradient(135deg, rgba($primary, 0.08), rgba($primary, 0.02));
  border: 1rpx solid rgba($primary, 0.2);
  border-radius: $radius-lg;
  padding: 24rpx;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.preview-type-icon {
  font-size: 32rpx;
}

.preview-type-name {
  font-size: 28rpx;
  font-weight: $font-medium;
  color: $primary;
}

.preview-prompt {
  text {
    font-size: 28rpx;
    color: $text-secondary;
    line-height: 1.6;
    font-style: italic;
  }
}

.advanced-section {
  background: $bg-card;
  border: 1rpx solid $border-light;
  border-radius: $radius-lg;
  margin-bottom: 32rpx;
  overflow: hidden;
}

.advanced-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: $bg-soft;
}

.advanced-title {
  font-size: 28rpx;
  font-weight: $font-medium;
  color: $text-primary;
}

.advanced-toggle {
  font-size: 26rpx;
  color: $primary;
}

.advanced-content {
  padding: 24rpx;
}

.setting-group {
  margin-bottom: 28rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.setting-label {
  display: block;
  font-size: 26rpx;
  color: $text-secondary;
  margin-bottom: 16rpx;
}

.style-options,
.protagonist-options,
.voice-options,
.mood-options,
.duration-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.style-item,
.mood-item,
.duration-item {
  padding: 12rpx 24rpx;
  background: $bg-soft;
  border: 1rpx solid $border-light;
  border-radius: $radius-full;
  font-size: 26rpx;
  color: $text-secondary;

  &.selected {
    background: rgba($primary, 0.1);
    border-color: $primary;
    color: $primary;
  }
}

.protagonist-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: 16rpx 20rpx;
  background: $bg-soft;
  border: 1rpx solid $border-light;
  border-radius: $radius-md;

  &.selected {
    background: rgba($primary, 0.1);
    border-color: $primary;
  }
}

.protagonist-emoji {
  font-size: 32rpx;
}

.protagonist-name {
  font-size: 22rpx;
  color: $text-secondary;
}

.voice-item {
  display: flex;
  flex-direction: column;
  padding: 16rpx 20rpx;
  background: $bg-soft;
  border: 1rpx solid $border-light;
  border-radius: $radius-md;

  &.selected {
    background: rgba($primary, 0.1);
    border-color: $primary;
  }
}

.voice-name {
  font-size: 26rpx;
  color: $text-primary;
}

.voice-style {
  font-size: 22rpx;
  color: $text-tertiary;
}

// 步骤操作按钮
.step-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.prev-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 24rpx 32rpx;
  background: $bg-card;
  border: 1rpx solid $border-light;
  border-radius: $radius-xl;
  font-size: 28rpx;
  color: $text-secondary;

  &:active {
    background: $bg-soft;
  }
}

.next-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 24rpx 32rpx;
  background: $primary;
  border-radius: $radius-xl;
  font-size: 28rpx;
  color: white;
  font-weight: $font-medium;

  &.disabled {
    background: $bg-soft;
    color: $text-placeholder;
  }

  &:active:not(.disabled) {
    transform: scale(0.98);
  }
}

.btn-arrow {
  font-size: 24rpx;
}

.submit-btn {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100rpx;
  background: $gradient-primary;
  border-radius: $radius-xl;
  box-shadow: $shadow-button;
  overflow: hidden;

  &:active {
    transform: scale(0.98);
  }
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shine 2s infinite;
}

@keyframes shine {
  0% { left: -100%; }
  50%, 100% { left: 100%; }
}

.btn-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.btn-icon {
  font-size: 32rpx;
}

.btn-text {
  font-size: 32rpx;
  font-weight: $font-semibold;
  color: white;
}

// 底部安全区
.safe-bottom {
  height: calc(env(safe-area-inset-bottom) + 100rpx);
}
</style>
