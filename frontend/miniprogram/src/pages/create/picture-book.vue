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

    <!-- 模式选择（首次进入时显示） -->
    <scroll-view v-if="showModeSelector" class="main-scroll" scroll-y>
      <CreationModeSelector
        content-type="picture_book"
        @select="handleModeSelect"
      />
    </scroll-view>

    <!-- 主内容（选择模式后显示） -->
    <scroll-view v-else class="main-scroll" scroll-y>
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
        <!-- 标题区域 -->
        <text class="step-title">选择故事主题</text>
        <text class="step-desc">为 {{ childName }} 挑选一段奇妙冒险</text>

        <!-- 主题分类 - 紧凑横向滚动 -->
        <scroll-view class="category-scroll" scroll-x enhanced :show-scrollbar="false">
          <view class="category-track">
            <view
              v-for="cat in themeCategories"
              :key="cat.id"
              class="category-chip"
              :class="{ active: selectedCategory === cat.id }"
              @tap="selectedCategory = cat.id"
            >
              <text class="chip-icon">{{ cat.icon }}</text>
              <text class="chip-name">{{ cat.name }}</text>
            </view>
          </view>
        </scroll-view>

        <!-- 主题卡片网格 - 紧凑3列 -->
        <view class="theme-grid">
          <view
            v-for="theme in filteredThemes"
            :key="theme.id"
            class="theme-card"
            :class="{ selected: selectedTheme?.id === theme.id }"
            @tap="selectTheme(theme)"
          >
            <text class="theme-emoji">{{ getThemeIcon(theme.id) }}</text>
            <text class="theme-name">{{ theme.name }}</text>
            <view v-if="selectedTheme?.id === theme.id" class="theme-check">✓</view>
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
                @tap="switchStyleCategory(cat.id)"
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
                @tap="selectArtStyle(style.value)"
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
                <!-- 选中时的背景光晕 -->
                <view class="char-glow"></view>
                <!-- 角色头像区域 -->
                <view class="character-avatar-wrap">
                  <view class="character-avatar">
                    <text class="char-emoji">{{ animal.emoji }}</text>
                  </view>
                  <!-- 选中时的星星徽章 -->
                  <view v-if="selectedAnimal === animal.value" class="char-star">⭐</view>
                </view>
                <!-- 彩色舞台底座 -->
                <view class="char-stage"></view>
                <text class="char-name">{{ animal.label }}</text>
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
                :class="{
                  selected: selectedVoiceId === voice.id,
                  playing: playingVoiceId === voice.id,
                  [voice.gender]: true
                }"
                @tap="selectVoice(voice.id)"
              >
                <view class="voice-avatar">
                  <text class="voice-emoji">{{ getVoiceEmoji(voice.id) }}</text>
                  <!-- 播放时显示声波动画 -->
                  <view v-if="playingVoiceId === voice.id" class="voice-waves playing">
                    <view class="wave"></view>
                    <view class="wave"></view>
                    <view class="wave"></view>
                  </view>
                </view>
                <view class="voice-content">
                  <view class="voice-name-row">
                    <text class="voice-name">{{ voice.name_cn }}</text>
                    <text class="voice-id">{{ voice.name }}</text>
                    <text v-if="voice.recommended" class="voice-badge">推荐</text>
                    <text class="voice-gender-tag" :class="voice.gender">
                      {{ voice.gender === 'female' ? '女声' : voice.gender === 'male' ? '男声' : '中性' }}
                    </text>
                  </view>
                  <view class="voice-detail-row">
                    <text class="voice-detail-label">🎯</text>
                    <text class="voice-detail-text">{{ getVoiceDesc(voice.id).scenes }}</text>
                  </view>
                  <view class="voice-detail-row">
                    <text class="voice-detail-label">📚</text>
                    <text class="voice-detail-text">{{ getVoiceDesc(voice.id).stories }}</text>
                  </view>
                </view>
                <!-- 试听按钮 -->
                <view
                  class="voice-preview-btn"
                  :class="{ loading: loadingVoiceId === voice.id }"
                  @tap.stop="previewVoice(voice.id)"
                >
                  <text v-if="loadingVoiceId === voice.id" class="preview-icon">⏳</text>
                  <text v-else-if="playingVoiceId === voice.id" class="preview-icon playing">⏹</text>
                  <text v-else class="preview-icon">▶</text>
                </view>
                <view v-if="selectedVoiceId === voice.id" class="voice-check">
                  <text>✓</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 故事风格 - 折叠面板 -->
          <view class="enhancement-panel" :class="{ expanded: storyPanelExpanded }">
            <view class="panel-header" @tap="storyPanelExpanded = !storyPanelExpanded">
              <view class="panel-header-left">
                <view class="panel-icon-wrap story">
                  <text class="panel-icon">📖</text>
                </view>
                <view class="panel-header-text">
                  <text class="panel-title">故事风格</text>
                  <text class="panel-hint">{{ storyEnhancementSummary }}</text>
                </view>
              </view>
              <view class="panel-arrow" :class="{ expanded: storyPanelExpanded }">
                <text>›</text>
              </view>
            </view>
            <view class="panel-content" :class="{ expanded: storyPanelExpanded }">
              <!-- 叙事节奏 -->
              <view class="enhancement-group">
                <text class="group-label">叙事节奏</text>
                <view class="option-cards">
                  <view
                    v-for="opt in narrativePaceOptions"
                    :key="opt.value"
                    class="option-card"
                    :class="{ selected: storyEnhancement.narrative_pace === opt.value }"
                    @tap="toggleStoryOption('narrative_pace', opt.value)"
                  >
                    <text class="option-emoji">{{ opt.emoji }}</text>
                    <text class="option-label">{{ opt.label }}</text>
                  </view>
                </view>
              </view>
              <!-- 互动密度 -->
              <view class="enhancement-group">
                <text class="group-label">互动密度</text>
                <view class="option-cards">
                  <view
                    v-for="opt in interactionDensityOptions"
                    :key="opt.value"
                    class="option-card"
                    :class="{ selected: storyEnhancement.interaction_density === opt.value }"
                    @tap="toggleStoryOption('interaction_density', opt.value)"
                  >
                    <text class="option-emoji">{{ opt.emoji }}</text>
                    <text class="option-label">{{ opt.label }}</text>
                  </view>
                </view>
              </view>
              <!-- 教育侧重 -->
              <view class="enhancement-group">
                <text class="group-label">教育侧重</text>
                <view class="option-cards">
                  <view
                    v-for="opt in educationalFocusOptions"
                    :key="opt.value"
                    class="option-card"
                    :class="{ selected: storyEnhancement.educational_focus === opt.value }"
                    @tap="toggleStoryOption('educational_focus', opt.value)"
                  >
                    <text class="option-emoji">{{ opt.emoji }}</text>
                    <text class="option-label">{{ opt.label }}</text>
                  </view>
                </view>
              </view>
              <!-- 语言风格 -->
              <view class="enhancement-group">
                <text class="group-label">语言风格</text>
                <view class="option-cards">
                  <view
                    v-for="opt in languageStyleOptions"
                    :key="opt.value"
                    class="option-card"
                    :class="{ selected: storyEnhancement.language_style === opt.value }"
                    @tap="toggleStoryOption('language_style', opt.value)"
                  >
                    <text class="option-emoji">{{ opt.emoji }}</text>
                    <text class="option-label">{{ opt.label }}</text>
                  </view>
                </view>
              </view>
              <!-- 情节复杂度 -->
              <view class="enhancement-group">
                <text class="group-label">情节复杂度</text>
                <view class="option-cards">
                  <view
                    v-for="opt in plotComplexityOptions"
                    :key="opt.value"
                    class="option-card"
                    :class="{ selected: storyEnhancement.plot_complexity === opt.value }"
                    @tap="toggleStoryOption('plot_complexity', opt.value)"
                  >
                    <text class="option-emoji">{{ opt.emoji }}</text>
                    <text class="option-label">{{ opt.label }}</text>
                  </view>
                </view>
              </view>
              <!-- 结局风格 -->
              <view class="enhancement-group">
                <text class="group-label">结局风格</text>
                <view class="option-cards">
                  <view
                    v-for="opt in endingStyleOptions"
                    :key="opt.value"
                    class="option-card"
                    :class="{ selected: storyEnhancement.ending_style === opt.value }"
                    @tap="toggleStoryOption('ending_style', opt.value)"
                  >
                    <text class="option-emoji">{{ opt.emoji }}</text>
                    <text class="option-label">{{ opt.label }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 画面设置 - 折叠面板 -->
          <view class="enhancement-panel" :class="{ expanded: visualPanelExpanded }">
            <view class="panel-header" @tap="visualPanelExpanded = !visualPanelExpanded">
              <view class="panel-header-left">
                <view class="panel-icon-wrap visual">
                  <text class="panel-icon">🎬</text>
                </view>
                <view class="panel-header-text">
                  <text class="panel-title">画面设置</text>
                  <text class="panel-hint">{{ visualEnhancementSummary }}</text>
                </view>
              </view>
              <view class="panel-arrow" :class="{ expanded: visualPanelExpanded }">
                <text>›</text>
              </view>
            </view>
            <view class="panel-content" :class="{ expanded: visualPanelExpanded }">
              <!-- 时间氛围 -->
              <view class="enhancement-group">
                <text class="group-label">时间氛围</text>
                <view class="option-cards">
                  <view
                    v-for="opt in timeAtmosphereOptions"
                    :key="opt.value"
                    class="option-card"
                    :class="{ selected: visualEnhancement.time_atmosphere === opt.value }"
                    @tap="toggleVisualOption('time_atmosphere', opt.value)"
                  >
                    <text class="option-emoji">{{ opt.emoji }}</text>
                    <text class="option-label">{{ opt.label }}</text>
                  </view>
                </view>
              </view>
              <!-- 场景环境 -->
              <view class="enhancement-group">
                <text class="group-label">场景环境</text>
                <view class="option-cards">
                  <view
                    v-for="opt in sceneEnvironmentOptions"
                    :key="opt.value"
                    class="option-card"
                    :class="{ selected: visualEnhancement.scene_environment === opt.value }"
                    @tap="toggleVisualOption('scene_environment', opt.value)"
                  >
                    <text class="option-emoji">{{ opt.emoji }}</text>
                    <text class="option-label">{{ opt.label }}</text>
                  </view>
                </view>
              </view>
              <!-- 情感基调 -->
              <view class="enhancement-group">
                <text class="group-label">情感基调</text>
                <view class="option-cards">
                  <view
                    v-for="opt in emotionalToneOptions"
                    :key="opt.value"
                    class="option-card"
                    :class="{ selected: visualEnhancement.emotional_tone === opt.value }"
                    @tap="toggleVisualOption('emotional_tone', opt.value)"
                  >
                    <text class="option-emoji">{{ opt.emoji }}</text>
                    <text class="option-label">{{ opt.label }}</text>
                  </view>
                </view>
              </view>
              <!-- 画面构图 -->
              <view class="enhancement-group">
                <text class="group-label">画面构图</text>
                <view class="option-cards">
                  <view
                    v-for="opt in compositionStyleOptions"
                    :key="opt.value"
                    class="option-card"
                    :class="{ selected: visualEnhancement.composition_style === opt.value }"
                    @tap="toggleVisualOption('composition_style', opt.value)"
                  >
                    <text class="option-emoji">{{ opt.emoji }}</text>
                    <text class="option-label">{{ opt.label }}</text>
                  </view>
                </view>
              </view>
              <!-- 光照效果 -->
              <view class="enhancement-group">
                <text class="group-label">光照效果</text>
                <view class="option-cards">
                  <view
                    v-for="opt in lightingEffectOptions"
                    :key="opt.value"
                    class="option-card"
                    :class="{ selected: visualEnhancement.lighting_effect === opt.value }"
                    @tap="toggleVisualOption('lighting_effect', opt.value)"
                  >
                    <text class="option-emoji">{{ opt.emoji }}</text>
                    <text class="option-label">{{ opt.label }}</text>
                  </view>
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
          <!-- 智能创作模式显示用户描述 -->
          <view v-if="isSmartMode" class="confirm-item smart-prompt-item">
            <text class="confirm-label">创作描述</text>
            <text class="confirm-value smart-prompt">{{ customPrompt }}</text>
          </view>
          <!-- 普通模式显示主题 -->
          <view v-else class="confirm-item">
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

        <!-- 故事风格确认 -->
        <view v-if="hasStoryEnhancement" class="confirm-card enhance-card">
          <view class="enhance-card-header">
            <text class="enhance-icon">📖</text>
            <text class="enhance-title">故事风格</text>
          </view>
          <view class="enhance-tags">
            <view v-if="storyEnhancement.narrative_pace" class="enhance-tag">
              <text>{{ getStoryOptionLabel('narrative_pace', storyEnhancement.narrative_pace) }}</text>
            </view>
            <view v-if="storyEnhancement.interaction_density" class="enhance-tag">
              <text>{{ getStoryOptionLabel('interaction_density', storyEnhancement.interaction_density) }}</text>
            </view>
            <view v-if="storyEnhancement.educational_focus" class="enhance-tag">
              <text>{{ getStoryOptionLabel('educational_focus', storyEnhancement.educational_focus) }}</text>
            </view>
            <view v-if="storyEnhancement.language_style" class="enhance-tag">
              <text>{{ getStoryOptionLabel('language_style', storyEnhancement.language_style) }}</text>
            </view>
            <view v-if="storyEnhancement.plot_complexity" class="enhance-tag">
              <text>{{ getStoryOptionLabel('plot_complexity', storyEnhancement.plot_complexity) }}</text>
            </view>
            <view v-if="storyEnhancement.ending_style" class="enhance-tag">
              <text>{{ getStoryOptionLabel('ending_style', storyEnhancement.ending_style) }}</text>
            </view>
          </view>
        </view>

        <!-- 画面设置确认 -->
        <view v-if="hasVisualEnhancement" class="confirm-card enhance-card">
          <view class="enhance-card-header">
            <text class="enhance-icon">🎬</text>
            <text class="enhance-title">画面设置</text>
          </view>
          <view class="enhance-tags">
            <view v-if="visualEnhancement.time_atmosphere" class="enhance-tag visual">
              <text>{{ getVisualOptionLabel('time_atmosphere', visualEnhancement.time_atmosphere) }}</text>
            </view>
            <view v-if="visualEnhancement.scene_environment" class="enhance-tag visual">
              <text>{{ getVisualOptionLabel('scene_environment', visualEnhancement.scene_environment) }}</text>
            </view>
            <view v-if="visualEnhancement.emotional_tone" class="enhance-tag visual">
              <text>{{ getVisualOptionLabel('emotional_tone', visualEnhancement.emotional_tone) }}</text>
            </view>
            <view v-if="visualEnhancement.composition_style" class="enhance-tag visual">
              <text>{{ getVisualOptionLabel('composition_style', visualEnhancement.composition_style) }}</text>
            </view>
            <view v-if="visualEnhancement.lighting_effect" class="enhance-tag visual">
              <text>{{ getVisualOptionLabel('lighting_effect', visualEnhancement.lighting_effect) }}</text>
            </view>
          </view>
        </view>

        <view class="confirm-tip">
          <text class="tip-icon">💡</text>
          <text class="tip-text">生成过程大约需要 1-2 分钟，请耐心等待</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部按钮（模式选择器隐藏后显示） -->
    <view v-if="!showModeSelector" class="bottom-bar">
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useChildStore } from '@/stores/child'
import { useContentStore } from '@/stores/content'
import GeneratingProgress from '@/components/GeneratingProgress/GeneratingProgress.vue'
import CreationModeSelector from '@/components/CreationModeSelector/CreationModeSelector.vue'
import {
  generatePictureBookAsync,
  getPictureBookTaskStatus,
  getContentDetail,
  getTTSVoices,
  type ThemeItem,
  type PictureBook,
  type ArtStyle,
  type ProtagonistAnimal,
  type VoiceId,
  type TTSVoiceDetail
} from '@/api/content'

const childStore = useChildStore()
const contentStore = useContentStore()

// 模式选择
const showModeSelector = ref(true)

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

// 主题分类（丰富的故事主题分类）
const themeCategories = [
  { id: 'habit', name: '习惯养成', icon: '🌟' },
  { id: 'cognition', name: '认知启蒙', icon: '🌍' },
  { id: 'emotion', name: '情感成长', icon: '💕' },
  { id: 'adventure', name: '冒险探索', icon: '🚀' },
  { id: 'social', name: '社交能力', icon: '🤝' },
  { id: 'festival', name: '节日故事', icon: '🎉' }
]
const selectedCategory = ref('habit')
const selectedTheme = ref<ThemeItem | null>(null)

// 风格分类（丰富的风格选项）
const styleCategories = [
  { id: 'threed', name: '3D 风格', icon: '🎬' },
  { id: 'illustration', name: '插画风格', icon: '📚' },
  { id: 'anime', name: '动漫风格', icon: '🌸' },
  { id: 'artistic', name: '艺术风格', icon: '🎨' },
  { id: 'craft', name: '手工风格', icon: '✂️' }
]
const selectedStyleCategory = ref('threed')

// 按分类的艺术风格选项（cssClass 用于避免数字开头的类名）
type StyleOption = { value: ArtStyle; label: string; icon: string; desc: string; cssClass?: string; recommended?: boolean }
const artStylesByCategory: Record<string, StyleOption[]> = {
  threed: [
    { value: 'pixar_3d', label: '皮克斯3D', icon: '🧸', desc: '圆润可爱', recommended: true },
    { value: 'pixar', label: '皮克斯电影', icon: '🎬', desc: '电影渲染' },
    { value: 'dreamworks', label: '梦工厂', icon: '🌙', desc: '活泼表情' },
    { value: 'disney_3d', label: '迪士尼3D', icon: '🏰', desc: '童话公主' },
    { value: 'clay', label: '粘土风格', icon: '🎭', desc: '定格质感' },
    { value: 'figurine', label: '手办风格', icon: '🎎', desc: '精致手办' },
    { value: 'low_poly', label: '低多边形', icon: '💎', desc: '几何简约' }
  ],
  illustration: [
    { value: 'storybook', label: '绘本风格', icon: '📖', desc: '温暖治愈' },
    { value: 'watercolor', label: '水彩风格', icon: '💧', desc: '透明梦幻' },
    { value: 'cartoon', label: '卡通风格', icon: '🎨', desc: '鲜艳明快' },
    { value: 'flat', label: '扁平风格', icon: '✨', desc: '简洁现代' },
    { value: 'crayon', label: '蜡笔风格', icon: '🖍️', desc: '童趣手绘' },
    { value: 'colored_pencil', label: '彩铅风格', icon: '✏️', desc: '细腻柔和' }
  ],
  anime: [
    { value: 'anime', label: '日式动漫', icon: '🌸', desc: '大眼精致' },
    { value: 'chibi', label: 'Q版萌系', icon: '🎀', desc: '大头超萌' },
    { value: 'ghibli', label: '吉卜力', icon: '🏰', desc: '宫崎骏风' },
    { value: 'shinkai', label: '新海诚', icon: '🌅', desc: '唯美细腻' },
    { value: 'manga', label: '漫画风格', icon: '📔', desc: '线条张力' },
    { value: 'comic_book', label: '美式漫画', icon: '💥', desc: '英雄漫画' }
  ],
  artistic: [
    { value: 'oil_painting', label: '油画', icon: '🖼️', desc: '古典厚重' },
    { value: 'impressionist', label: '印象派', icon: '🌻', desc: '莫奈光影' },
    { value: 'sketch', label: '素描', icon: '✏️', desc: '铅笔手绘' },
    { value: 'ink_wash', label: '水墨画', icon: '🖌️', desc: '传统意境' },
    { value: 'pop_art', label: '波普艺术', icon: '🎪', desc: '撞色复古' },
    { value: 'art_nouveau', label: '新艺术', icon: '🌿', desc: '曲线装饰' },
    { value: 'pixel_art', label: '像素艺术', icon: '👾', desc: '复古游戏' }
  ],
  craft: [
    { value: 'papercut', label: '剪纸风格', icon: '✂️', desc: '传统民间' },
    { value: 'felt_craft', label: '不织布', icon: '🧵', desc: '毛绒温暖' },
    { value: 'origami', label: '折纸风格', icon: '🦢', desc: '折叠艺术' },
    { value: 'embroidery', label: '刺绣风格', icon: '🪡', desc: '针线工艺' },
    { value: 'mosaic', label: '马赛克', icon: '🎨', desc: '拼贴艺术' },
    { value: 'stained_glass', label: '彩色玻璃', icon: '🪟', desc: '教堂光影' }
  ]
}

// 当前分类的风格列表
const currentCategoryStyles = computed(() => {
  return artStylesByCategory[selectedStyleCategory.value] || artStylesByCategory.threed
})

const selectedArtStyle = ref<ArtStyle>('pixar_3d')

// 切换风格分类（带调试日志）
function switchStyleCategory(catId: string) {
  const oldCat = selectedStyleCategory.value
  selectedStyleCategory.value = catId
  const catName = styleCategories.find(c => c.id === catId)?.name || catId
  console.log(`[绘本-风格选择] 分类切换: ${oldCat} → ${catId} (${catName})，当前选中风格: ${selectedArtStyle.value}`)
}

// 选择艺术风格（带调试日志）
function selectArtStyle(value: ArtStyle) {
  const oldValue = selectedArtStyle.value
  selectedArtStyle.value = value
  // 查找风格名称
  let styleName = value
  for (const styles of Object.values(artStylesByCategory)) {
    const found = styles.find(s => s.value === value)
    if (found) {
      styleName = found.label
      break
    }
  }
  console.log(`[绘本-风格选择] 艺术风格变更: ${oldValue} → ${value} (${styleName})`)
}

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

// === 故事增强参数 ===
interface StoryEnhancement {
  narrative_pace: string | null
  interaction_density: string | null
  educational_focus: string | null
  language_style: string | null
  plot_complexity: string | null
  ending_style: string | null
}

const storyPanelExpanded = ref(false)
const storyEnhancement = ref<StoryEnhancement>({
  narrative_pace: null,
  interaction_density: null,
  educational_focus: null,
  language_style: null,
  plot_complexity: null,
  ending_style: null
})

// 叙事节奏选项
const narrativePaceOptions = [
  { value: 'relaxed', label: '轻松舒缓', emoji: '😌' },
  { value: 'lively', label: '紧凑活泼', emoji: '🎵' },
  { value: 'progressive', label: '循序渐进', emoji: '📖' }
]

// 互动密度选项
const interactionDensityOptions = [
  { value: 'minimal', label: '少互动', emoji: '📕' },
  { value: 'moderate', label: '适中', emoji: '📗' },
  { value: 'intensive', label: '多互动', emoji: '📘' }
]

// 教育侧重选项
const educationalFocusOptions = [
  { value: 'cognitive', label: '认知学习', emoji: '🧠' },
  { value: 'behavioral', label: '行为引导', emoji: '🌟' },
  { value: 'emotional', label: '情感培养', emoji: '💕' },
  { value: 'imaginative', label: '想象激发', emoji: '🦋' }
]

// 语言风格选项
const languageStyleOptions = [
  { value: 'simple', label: '简洁直白', emoji: '💬' },
  { value: 'rhythmic', label: '韵律押韵', emoji: '🎶' },
  { value: 'onomatopoeia', label: '拟声丰富', emoji: '🔔' },
  { value: 'repetitive', label: '重复强化', emoji: '🔄' }
]

// 情节复杂度选项
const plotComplexityOptions = [
  { value: 'linear', label: '简单线性', emoji: '➡️' },
  { value: 'twist', label: '有小波折', emoji: '🌊' },
  { value: 'ensemble', label: '多角色', emoji: '👥' }
]

// 结局风格选项
const endingStyleOptions = [
  { value: 'warm', label: '温馨收尾', emoji: '🤗' },
  { value: 'open', label: '开放想象', emoji: '✨' },
  { value: 'summary', label: '总结回顾', emoji: '📝' }
]

// 切换故事选项（点击已选中的取消选择）
function toggleStoryOption(key: keyof StoryEnhancement, value: string) {
  if (storyEnhancement.value[key] === value) {
    storyEnhancement.value[key] = null
  } else {
    storyEnhancement.value[key] = value
  }
}

// 故事增强摘要
const storyEnhancementSummary = computed(() => {
  const selected = Object.values(storyEnhancement.value).filter(v => v !== null)
  if (selected.length === 0) return '可选，由 AI 智能推断'
  return `已选 ${selected.length} 项`
})

// === 视觉增强参数 ===
interface VisualEnhancement {
  time_atmosphere: string | null
  scene_environment: string | null
  emotional_tone: string | null
  composition_style: string | null
  lighting_effect: string | null
}

const visualPanelExpanded = ref(false)
const visualEnhancement = ref<VisualEnhancement>({
  time_atmosphere: null,
  scene_environment: null,
  emotional_tone: null,
  composition_style: null,
  lighting_effect: null
})

// 时间氛围选项
const timeAtmosphereOptions = [
  { value: 'morning', label: '清晨阳光', emoji: '🌅' },
  { value: 'afternoon', label: '午后温暖', emoji: '☀️' },
  { value: 'sunset', label: '傍晚金色', emoji: '🌇' },
  { value: 'night', label: '夜晚星空', emoji: '🌙' },
  { value: 'dreamy', label: '梦幻魔法', emoji: '✨' }
]

// 场景环境选项
const sceneEnvironmentOptions = [
  { value: 'indoor', label: '温馨室内', emoji: '🏠' },
  { value: 'garden', label: '花园户外', emoji: '🌷' },
  { value: 'forest', label: '森林探险', emoji: '🌲' },
  { value: 'beach', label: '海边沙滩', emoji: '🏖️' },
  { value: 'clouds', label: '云端梦境', emoji: '☁️' }
]

// 情感基调选项
const emotionalToneOptions = [
  { value: 'cheerful', label: '欢乐活泼', emoji: '😄' },
  { value: 'cozy', label: '温馨甜蜜', emoji: '🥰' },
  { value: 'playful', label: '轻松幽默', emoji: '😜' },
  { value: 'peaceful', label: '安静祥和', emoji: '😊' },
  { value: 'curious', label: '神秘好奇', emoji: '🤔' }
]

// 画面构图选项
const compositionStyleOptions = [
  { value: 'close_up', label: '角色特写', emoji: '👤' },
  { value: 'panorama', label: '全景场景', emoji: '🏞️' },
  { value: 'interaction', label: '互动场景', emoji: '🤝' },
  { value: 'narrative', label: '故事叙事', emoji: '📽️' }
]

// 光照效果选项
const lightingEffectOptions = [
  { value: 'soft_natural', label: '柔和自然', emoji: '🌤️' },
  { value: 'warm_sunlight', label: '温暖阳光', emoji: '🌞' },
  { value: 'dreamy_glow', label: '梦幻光晕', emoji: '💫' },
  { value: 'cozy_lamp', label: '夜灯温馨', emoji: '🪔' }
]

// 切换视觉选项（点击已选中的取消选择）
function toggleVisualOption(key: keyof VisualEnhancement, value: string) {
  if (visualEnhancement.value[key] === value) {
    visualEnhancement.value[key] = null
  } else {
    visualEnhancement.value[key] = value
  }
}

// 视觉增强摘要
const visualEnhancementSummary = computed(() => {
  const selected = Object.values(visualEnhancement.value).filter(v => v !== null)
  if (selected.length === 0) return '可选，由 AI 智能推断'
  return `已选 ${selected.length} 项`
})

// 是否有故事增强选项
const hasStoryEnhancement = computed(() => {
  return Object.values(storyEnhancement.value).some(v => v !== null)
})

// 是否有视觉增强选项
const hasVisualEnhancement = computed(() => {
  return Object.values(visualEnhancement.value).some(v => v !== null)
})

// 获取故事选项的显示标签
function getStoryOptionLabel(key: string, value: string): string {
  const optionsMap: Record<string, Array<{value: string, label: string, emoji: string}>> = {
    narrative_pace: narrativePaceOptions,
    interaction_density: interactionDensityOptions,
    educational_focus: educationalFocusOptions,
    language_style: languageStyleOptions,
    plot_complexity: plotComplexityOptions,
    ending_style: endingStyleOptions
  }
  const options = optionsMap[key]
  const opt = options?.find(o => o.value === value)
  return opt ? `${opt.emoji} ${opt.label}` : value
}

// 获取视觉选项的显示标签
function getVisualOptionLabel(key: string, value: string): string {
  const optionsMap: Record<string, Array<{value: string, label: string, emoji: string}>> = {
    time_atmosphere: timeAtmosphereOptions,
    scene_environment: sceneEnvironmentOptions,
    emotional_tone: emotionalToneOptions,
    composition_style: compositionStyleOptions,
    lighting_effect: lightingEffectOptions
  }
  const options = optionsMap[key]
  const opt = options?.find(o => o.value === value)
  return opt ? `${opt.emoji} ${opt.label}` : value
}

// TTS 音色选项（从 API 加载）
const voiceOptions = ref<TTSVoiceDetail[]>([])

// 音色图标
const voiceEmojis: Record<string, string> = {
  Kore: '🌟',
  Leda: '🌙',
  Aoede: '✨',
  Puck: '🎈',
  Charon: '📖',
  Fenrir: '🎭'
}

// 音色详细描述（适用场景 + 故事类型）
const voiceDescMap: Record<string, { scenes: string; stories: string }> = {
  Kore: {
    scenes: '日常亲子阅读、睡前故事',
    stories: '温馨成长、友谊冒险、情感启蒙'
  },
  Leda: {
    scenes: '睡前安抚、午休陪伴',
    stories: '晚安故事、梦境奇遇、自然童话'
  },
  Aoede: {
    scenes: '认知学习、习惯养成',
    stories: '科普知识、生活常识、安全教育'
  },
  Puck: {
    scenes: '游戏互动、户外活动',
    stories: '搞笑冒险、动物趣事、魔法世界'
  },
  Charon: {
    scenes: '经典故事、传统文化',
    stories: '寓言故事、历史传说、名著改编'
  },
  Fenrir: {
    scenes: '角色扮演、戏剧表演',
    stories: '英雄冒险、奇幻旅程、神话传说'
  }
}

const selectedVoiceId = ref<VoiceId>('Kore')  // 默认使用 Kore

// 获取音色详细描述
function getVoiceDesc(voiceId: string): { scenes: string; stories: string } {
  return voiceDescMap[voiceId] || { scenes: '通用场景', stories: '各类故事' }
}

// 音色排序（按指定顺序）
const VOICE_ORDER = ['Kore', 'Leda', 'Aoede', 'Puck', 'Charon', 'Fenrir']

// 加载音色列表
async function loadVoiceOptions() {
  try {
    const result = await getTTSVoices()
    if (result.providers?.length > 0) {
      const voices = result.providers[0].voices
      // 按指定顺序排序
      voiceOptions.value = voices.sort((a, b) => {
        const indexA = VOICE_ORDER.indexOf(a.id)
        const indexB = VOICE_ORDER.indexOf(b.id)
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
      })
      // 设置默认音色
      if (result.default_voice) {
        selectedVoiceId.value = result.default_voice as VoiceId
      }
    }
  } catch (error) {
    console.error('[loadVoiceOptions] 加载音色列表失败:', error)
    // 使用默认值
    voiceOptions.value = [
      { id: 'Kore' as VoiceId, name: 'Kore', name_cn: '温暖女声', gender: 'female', style: '温暖亲切', description: '适合儿童故事（推荐）', recommended: true, preview_url: 'https://kids.jackverse.cn/media/voice-preview/gemini/Kore.wav' }
    ]
  }
}

// 获取音色的 emoji
function getVoiceEmoji(voiceId: string): string {
  return voiceEmojis[voiceId] || '🎵'
}

// 音色预览状态
const playingVoiceId = ref<VoiceId | null>(null)
const loadingVoiceId = ref<VoiceId | null>(null)
const previewAudioContext = ref<UniApp.InnerAudioContext | null>(null)

// 选择音色
function selectVoice(voiceId: VoiceId) {
  selectedVoiceId.value = voiceId
}

// 预览音色（使用预生成的音频URL）
function previewVoice(voiceId: VoiceId) {
  // 如果正在播放同一个，停止播放
  if (playingVoiceId.value === voiceId) {
    stopPreview()
    return
  }

  // 停止之前的播放
  stopPreview()

  // 找到对应音色的预览URL
  const voice = voiceOptions.value.find(v => v.id === voiceId)
  if (!voice?.preview_url) {
    uni.showToast({ title: '预览暂不可用', icon: 'none' })
    return
  }

  // 直接播放预生成的音频
  playPreviewAudio(voice.preview_url, voiceId)
}

// 播放预览音频
function playPreviewAudio(url: string, voiceId: VoiceId) {
  const audioContext = uni.createInnerAudioContext()
  previewAudioContext.value = audioContext

  audioContext.src = url
  audioContext.onPlay(() => {
    playingVoiceId.value = voiceId
  })
  audioContext.onEnded(() => {
    playingVoiceId.value = null
  })
  audioContext.onError((err) => {
    console.error('[playPreviewAudio] 播放错误:', err)
    playingVoiceId.value = null
    uni.showToast({ title: '播放失败', icon: 'none' })
  })
  audioContext.play()
}

// 停止预览
function stopPreview() {
  if (previewAudioContext.value) {
    previewAudioContext.value.stop()
    previewAudioContext.value.destroy()
    previewAudioContext.value = null
  }
  playingVoiceId.value = null
}

// 生成状态
const isGenerating = ref(false)
const generatingProgress = ref(0)
const generatingStage = ref('')
const generatingMessage = ref('')

// 智能创作模式
const isSmartMode = ref(false)
const customPrompt = ref('')

// 计算属性
const childName = computed(() => childStore.currentChild?.name || '宝贝')

const filteredThemes = computed(() => {
  // 始终使用本地 defaultThemes（更丰富的主题库）
  let themes = defaultThemes[selectedCategory.value] || []

  // 如果当前选中的主题不在列表中，将其添加进去（确保预选主题始终可见）
  if (selectedTheme.value && selectedTheme.value.id) {
    const exists = themes.some(t => t.id === selectedTheme.value!.id)
    if (!exists) {
      // 从默认主题中查找并添加
      const fromDefault = themes.find(t => t.id === selectedTheme.value!.id)
      if (fromDefault) {
        themes = [fromDefault, ...themes]
      }
    }
  }

  return themes
})

const currentCategoryName = computed(() => {
  const cat = themeCategories.find(c => c.id === selectedCategory.value)
  return cat?.name || ''
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
  const voice = voiceOptions.value.find(v => v.id === selectedVoiceId.value)
  return voice ? `${getVoiceEmoji(voice.id)} ${voice.name_cn}` : ''
})

const canNext = computed(() => {
  if (currentStep.value === 0) return !!selectedTheme.value
  return true
})

// 默认主题（丰富的故事主题库，每类20个）
const defaultThemes: Record<string, ThemeItem[]> = {
  // 习惯养成（20个主题）
  habit: [
    { id: 'brush_teeth', name: '刷牙', subcategory: '卫生习惯', age_range: [24, 48], keywords: [] },
    { id: 'wash_hands', name: '洗手', subcategory: '卫生习惯', age_range: [18, 48], keywords: [] },
    { id: 'take_bath', name: '洗澡', subcategory: '卫生习惯', age_range: [18, 48], keywords: [] },
    { id: 'wash_face', name: '洗脸', subcategory: '卫生习惯', age_range: [18, 36], keywords: [] },
    { id: 'cut_nails', name: '剪指甲', subcategory: '卫生习惯', age_range: [24, 48], keywords: [] },
    { id: 'get_dressed', name: '自己穿衣', subcategory: '生活自理', age_range: [24, 48], keywords: [] },
    { id: 'potty_training', name: '上厕所', subcategory: '生活自理', age_range: [18, 36], keywords: [] },
    { id: 'eat_independently', name: '自己吃饭', subcategory: '生活自理', age_range: [18, 36], keywords: [] },
    { id: 'tie_shoes', name: '系鞋带', subcategory: '生活自理', age_range: [48, 72], keywords: [] },
    { id: 'no_picky_eating', name: '不挑食', subcategory: '饮食习惯', age_range: [24, 48], keywords: [] },
    { id: 'drink_water', name: '多喝水', subcategory: '健康习惯', age_range: [18, 48], keywords: [] },
    { id: 'eat_breakfast', name: '吃早餐', subcategory: '饮食习惯', age_range: [24, 60], keywords: [] },
    { id: 'bedtime', name: '按时睡觉', subcategory: '作息习惯', age_range: [24, 60], keywords: [] },
    { id: 'nap_time', name: '午睡', subcategory: '作息习惯', age_range: [18, 48], keywords: [] },
    { id: 'early_rise', name: '早起', subcategory: '作息习惯', age_range: [24, 60], keywords: [] },
    { id: 'tidy_up', name: '收拾玩具', subcategory: '整理习惯', age_range: [30, 60], keywords: [] },
    { id: 'clean_room', name: '整理房间', subcategory: '整理习惯', age_range: [36, 72], keywords: [] },
    { id: 'exercise', name: '爱运动', subcategory: '健康习惯', age_range: [24, 60], keywords: [] },
    { id: 'screen_time', name: '少看电视', subcategory: '健康习惯', age_range: [30, 72], keywords: [] },
    { id: 'protect_eyes', name: '保护眼睛', subcategory: '健康习惯', age_range: [30, 72], keywords: [] }
  ],
  // 认知启蒙（20个主题）
  cognition: [
    { id: 'colors', name: '认识颜色', subcategory: '基础认知', age_range: [12, 36], keywords: [] },
    { id: 'shapes', name: '认识形状', subcategory: '基础认知', age_range: [18, 36], keywords: [] },
    { id: 'numbers', name: '认识数字', subcategory: '数学启蒙', age_range: [24, 48], keywords: [] },
    { id: 'counting', name: '学数数', subcategory: '数学启蒙', age_range: [24, 48], keywords: [] },
    { id: 'add_subtract', name: '加减法', subcategory: '数学启蒙', age_range: [48, 72], keywords: [] },
    { id: 'letters', name: '认识字母', subcategory: '语言启蒙', age_range: [30, 60], keywords: [] },
    { id: 'chinese_chars', name: '认识汉字', subcategory: '语言启蒙', age_range: [36, 72], keywords: [] },
    { id: 'big_small', name: '大和小', subcategory: '对比认知', age_range: [12, 36], keywords: [] },
    { id: 'long_short', name: '长和短', subcategory: '对比认知', age_range: [18, 36], keywords: [] },
    { id: 'up_down', name: '上和下', subcategory: '方位认知', age_range: [18, 36], keywords: [] },
    { id: 'left_right', name: '左和右', subcategory: '方位认知', age_range: [36, 60], keywords: [] },
    { id: 'animals', name: '认识动物', subcategory: '自然认知', age_range: [12, 48], keywords: [] },
    { id: 'plants', name: '认识植物', subcategory: '自然认知', age_range: [24, 48], keywords: [] },
    { id: 'fruits', name: '认识水果', subcategory: '生活认知', age_range: [12, 36], keywords: [] },
    { id: 'vegetables', name: '认识蔬菜', subcategory: '生活认知', age_range: [18, 48], keywords: [] },
    { id: 'weather', name: '认识天气', subcategory: '自然认知', age_range: [24, 48], keywords: [] },
    { id: 'seasons', name: '四季变化', subcategory: '自然认知', age_range: [30, 60], keywords: [] },
    { id: 'time_clock', name: '认识时间', subcategory: '基础认知', age_range: [42, 72], keywords: [] },
    { id: 'body_parts', name: '认识身体', subcategory: '自我认知', age_range: [12, 36], keywords: [] },
    { id: 'vehicles', name: '交通工具', subcategory: '生活认知', age_range: [18, 48], keywords: [] }
  ],
  // 情感成长（20个主题）
  emotion: [
    { id: 'happy', name: '开心快乐', subcategory: '积极情绪', age_range: [18, 48], keywords: [] },
    { id: 'sad', name: '面对难过', subcategory: '情绪认知', age_range: [24, 48], keywords: [] },
    { id: 'angry', name: '管理生气', subcategory: '情绪管理', age_range: [24, 60], keywords: [] },
    { id: 'scared', name: '克服害怕', subcategory: '情绪管理', age_range: [24, 60], keywords: [] },
    { id: 'jealous', name: '不要嫉妒', subcategory: '情绪管理', age_range: [30, 60], keywords: [] },
    { id: 'lonely', name: '面对孤独', subcategory: '情绪认知', age_range: [30, 60], keywords: [] },
    { id: 'worried', name: '不要担心', subcategory: '情绪管理', age_range: [30, 60], keywords: [] },
    { id: 'self_love', name: '爱自己', subcategory: '自我认同', age_range: [24, 60], keywords: [] },
    { id: 'confidence', name: '自信心', subcategory: '自我认同', age_range: [30, 72], keywords: [] },
    { id: 'unique_me', name: '独特的我', subcategory: '自我认同', age_range: [30, 60], keywords: [] },
    { id: 'bravery', name: '勇敢', subcategory: '品格培养', age_range: [24, 60], keywords: [] },
    { id: 'patience', name: '耐心等待', subcategory: '品格培养', age_range: [24, 60], keywords: [] },
    { id: 'gratitude', name: '感恩', subcategory: '品格培养', age_range: [30, 72], keywords: [] },
    { id: 'honesty', name: '诚实', subcategory: '品格培养', age_range: [30, 72], keywords: [] },
    { id: 'love_family', name: '爱家人', subcategory: '亲情', age_range: [18, 48], keywords: [] },
    { id: 'new_sibling', name: '迎接弟妹', subcategory: '家庭变化', age_range: [24, 60], keywords: [] },
    { id: 'miss_parents', name: '想念爸妈', subcategory: '分离焦虑', age_range: [24, 48], keywords: [] },
    { id: 'move_house', name: '搬新家', subcategory: '生活变化', age_range: [30, 60], keywords: [] },
    { id: 'pet_love', name: '爱护宠物', subcategory: '生命教育', age_range: [24, 60], keywords: [] },
    { id: 'say_goodbye', name: '学会告别', subcategory: '生命教育', age_range: [36, 72], keywords: [] }
  ],
  // 冒险探索（20个主题）
  adventure: [
    { id: 'space_travel', name: '太空冒险', subcategory: '科幻冒险', age_range: [36, 72], keywords: [] },
    { id: 'moon_landing', name: '登月之旅', subcategory: '科幻冒险', age_range: [36, 72], keywords: [] },
    { id: 'ocean_explore', name: '海底探险', subcategory: '自然探索', age_range: [30, 60], keywords: [] },
    { id: 'forest_adventure', name: '森林奇遇', subcategory: '自然探索', age_range: [24, 60], keywords: [] },
    { id: 'jungle_safari', name: '丛林探险', subcategory: '自然探索', age_range: [30, 60], keywords: [] },
    { id: 'dinosaur_world', name: '恐龙世界', subcategory: '史前冒险', age_range: [30, 72], keywords: [] },
    { id: 'ice_age', name: '冰河时代', subcategory: '史前冒险', age_range: [36, 72], keywords: [] },
    { id: 'magic_kingdom', name: '魔法王国', subcategory: '奇幻冒险', age_range: [30, 72], keywords: [] },
    { id: 'treasure_hunt', name: '寻宝探险', subcategory: '探险故事', age_range: [36, 72], keywords: [] },
    { id: 'super_hero', name: '小超人', subcategory: '英雄故事', age_range: [30, 72], keywords: [] },
    { id: 'time_travel', name: '时光旅行', subcategory: '奇幻冒险', age_range: [42, 72], keywords: [] },
    { id: 'island_explore', name: '小岛探险', subcategory: '探险故事', age_range: [30, 60], keywords: [] },
    { id: 'mountain_climb', name: '登山冒险', subcategory: '自然探索', age_range: [36, 72], keywords: [] },
    { id: 'desert_journey', name: '沙漠之旅', subcategory: '自然探索', age_range: [36, 72], keywords: [] },
    { id: 'dream_adventure', name: '梦境奇遇', subcategory: '奇幻冒险', age_range: [24, 60], keywords: [] },
    { id: 'fairy_tale', name: '童话王国', subcategory: '经典童话', age_range: [24, 60], keywords: [] },
    { id: 'detective_story', name: '小侦探', subcategory: '益智故事', age_range: [42, 72], keywords: [] },
    { id: 'robot_friend', name: '机器人朋友', subcategory: '科幻故事', age_range: [30, 72], keywords: [] },
    { id: 'cloud_journey', name: '云端旅行', subcategory: '奇幻冒险', age_range: [24, 48], keywords: [] },
    { id: 'rainbow_bridge', name: '彩虹桥', subcategory: '奇幻冒险', age_range: [24, 48], keywords: [] }
  ],
  // 社交能力（20个主题）
  social: [
    { id: 'sharing', name: '学会分享', subcategory: '社交技能', age_range: [24, 60], keywords: [] },
    { id: 'making_friends', name: '交朋友', subcategory: '社交技能', age_range: [24, 60], keywords: [] },
    { id: 'greeting', name: '打招呼', subcategory: '礼仪习惯', age_range: [18, 48], keywords: [] },
    { id: 'say_sorry', name: '说对不起', subcategory: '礼仪习惯', age_range: [24, 60], keywords: [] },
    { id: 'say_thanks', name: '说谢谢', subcategory: '礼仪习惯', age_range: [18, 48], keywords: [] },
    { id: 'say_please', name: '说请', subcategory: '礼仪习惯', age_range: [18, 48], keywords: [] },
    { id: 'take_turns', name: '轮流等待', subcategory: '社交技能', age_range: [24, 48], keywords: [] },
    { id: 'teamwork', name: '团队合作', subcategory: '协作能力', age_range: [36, 72], keywords: [] },
    { id: 'help_others', name: '帮助别人', subcategory: '社交技能', age_range: [24, 60], keywords: [] },
    { id: 'listen_others', name: '倾听他人', subcategory: '社交技能', age_range: [30, 60], keywords: [] },
    { id: 'respect_others', name: '尊重他人', subcategory: '社交技能', age_range: [30, 72], keywords: [] },
    { id: 'no_bully', name: '反对欺负', subcategory: '安全教育', age_range: [36, 72], keywords: [] },
    { id: 'resolve_conflict', name: '解决冲突', subcategory: '社交技能', age_range: [36, 72], keywords: [] },
    { id: 'family_roles', name: '家庭成员', subcategory: '家庭认知', age_range: [18, 48], keywords: [] },
    { id: 'occupations', name: '认识职业', subcategory: '社会认知', age_range: [30, 60], keywords: [] },
    { id: 'community', name: '社区生活', subcategory: '社会认知', age_range: [36, 72], keywords: [] },
    { id: 'school_life', name: '幼儿园', subcategory: '社会适应', age_range: [30, 60], keywords: [] },
    { id: 'first_day_school', name: '入学第一天', subcategory: '社会适应', age_range: [36, 72], keywords: [] },
    { id: 'public_manners', name: '公共场合', subcategory: '礼仪习惯', age_range: [30, 60], keywords: [] },
    { id: 'table_manners', name: '餐桌礼仪', subcategory: '礼仪习惯', age_range: [30, 60], keywords: [] }
  ],
  // 节日故事（20个主题）
  festival: [
    { id: 'spring_festival', name: '春节', subcategory: '中国节日', age_range: [24, 72], keywords: [] },
    { id: 'lantern_festival', name: '元宵节', subcategory: '中国节日', age_range: [24, 72], keywords: [] },
    { id: 'qingming', name: '清明节', subcategory: '中国节日', age_range: [36, 72], keywords: [] },
    { id: 'dragon_boat', name: '端午节', subcategory: '中国节日', age_range: [30, 72], keywords: [] },
    { id: 'qixi', name: '七夕节', subcategory: '中国节日', age_range: [36, 72], keywords: [] },
    { id: 'mid_autumn', name: '中秋节', subcategory: '中国节日', age_range: [24, 72], keywords: [] },
    { id: 'double_ninth', name: '重阳节', subcategory: '中国节日', age_range: [36, 72], keywords: [] },
    { id: 'winter_solstice', name: '冬至', subcategory: '中国节日', age_range: [30, 72], keywords: [] },
    { id: 'childrens_day', name: '儿童节', subcategory: '特殊节日', age_range: [24, 72], keywords: [] },
    { id: 'teachers_day', name: '教师节', subcategory: '感恩节日', age_range: [36, 72], keywords: [] },
    { id: 'mothers_day', name: '母亲节', subcategory: '感恩节日', age_range: [24, 72], keywords: [] },
    { id: 'fathers_day', name: '父亲节', subcategory: '感恩节日', age_range: [24, 72], keywords: [] },
    { id: 'grandparents_day', name: '祖父母节', subcategory: '感恩节日', age_range: [24, 72], keywords: [] },
    { id: 'birthday', name: '生日快乐', subcategory: '特殊日子', age_range: [18, 72], keywords: [] },
    { id: 'new_year', name: '新年愿望', subcategory: '特殊日子', age_range: [24, 72], keywords: [] },
    { id: 'christmas', name: '圣诞节', subcategory: '西方节日', age_range: [24, 72], keywords: [] },
    { id: 'thanksgiving', name: '感恩节', subcategory: '感恩节日', age_range: [30, 72], keywords: [] },
    { id: 'halloween', name: '万圣节', subcategory: '西方节日', age_range: [36, 72], keywords: [] },
    { id: 'easter', name: '复活节', subcategory: '西方节日', age_range: [30, 72], keywords: [] },
    { id: 'arbor_day', name: '植树节', subcategory: '特殊节日', age_range: [30, 72], keywords: [] }
  ]
}

// 主题图标映射（覆盖所有主题 ID）
const themeIcons: Record<string, string> = {
  // ===== 习惯养成 =====
  brush_teeth: '🦷',
  wash_hands: '🧼',
  take_bath: '🛁',
  wash_face: '🧴',
  cut_nails: '💅',
  get_dressed: '👕',
  potty_training: '🚽',
  eat_independently: '🥄',
  tie_shoes: '👟',
  no_picky_eating: '🥦',
  drink_water: '💧',
  eat_breakfast: '🍳',
  bedtime: '🛏️',
  nap_time: '😴',
  early_rise: '🌅',
  tidy_up: '🧹',
  clean_room: '🏠',
  exercise: '🏃',
  screen_time: '📺',
  protect_eyes: '👁️',
  // ===== 认知启蒙 =====
  colors: '🎨',
  shapes: '🔷',
  numbers: '🔢',
  counting: '🧮',
  add_subtract: '➕',
  letters: '🔤',
  chinese_chars: '📝',
  big_small: '📏',
  long_short: '📐',
  up_down: '⬆️',
  left_right: '↔️',
  animals: '🦁',
  plants: '🌱',
  fruits: '🍎',
  vegetables: '🥬',
  weather: '🌤️',
  seasons: '🍂',
  time_clock: '🕐',
  body_parts: '🖐️',
  vehicles: '🚗',
  // ===== 情感成长 =====
  happy: '😊',
  sad: '😢',
  angry: '😠',
  scared: '😨',
  jealous: '😒',
  lonely: '😔',
  worried: '😟',
  self_love: '💖',
  confidence: '💪',
  unique_me: '🌟',
  bravery: '🦸',
  patience: '⏳',
  gratitude: '🙏',
  honesty: '🤞',
  love_family: '👨‍👩‍👧',
  new_sibling: '👶',
  miss_parents: '💕',
  move_house: '🏡',
  pet_love: '🐾',
  say_goodbye: '👋',
  // ===== 冒险探索 =====
  space_travel: '🚀',
  moon_landing: '🌙',
  ocean_explore: '🌊',
  forest_adventure: '🌲',
  jungle_safari: '🦒',
  dinosaur_world: '🦕',
  ice_age: '🧊',
  magic_kingdom: '🏰',
  treasure_hunt: '🗺️',
  super_hero: '🦸‍♂️',
  time_travel: '⏰',
  island_explore: '🏝️',
  mountain_climb: '⛰️',
  desert_journey: '🏜️',
  dream_adventure: '💭',
  fairy_tale: '🧚',
  detective_story: '🔍',
  robot_friend: '🤖',
  cloud_journey: '☁️',
  rainbow_bridge: '🌈',
  // ===== 社交能力 =====
  sharing: '🤝',
  making_friends: '👭',
  greeting: '👋',
  say_sorry: '🙇',
  say_thanks: '💝',
  say_please: '🙏',
  take_turns: '🔄',
  teamwork: '👥',
  help_others: '🤗',
  listen_others: '👂',
  respect_others: '🫡',
  no_bully: '🛡️',
  resolve_conflict: '🤜',
  family_roles: '👨‍👩‍👧‍👦',
  occupations: '👨‍⚕️',
  community: '🏘️',
  school_life: '🎒',
  first_day_school: '🏫',
  public_manners: '🚇',
  table_manners: '🍽️',
  // ===== 节日故事 =====
  spring_festival: '🧧',
  lantern_festival: '🏮',
  qingming: '🌾',
  dragon_boat: '🐲',
  qixi: '🎋',
  mid_autumn: '🥮',
  double_ninth: '🏔️',
  winter_solstice: '🥟',
  childrens_day: '🎈',
  teachers_day: '📖',
  mothers_day: '💐',
  fathers_day: '👔',
  grandparents_day: '👴',
  birthday: '🎂',
  new_year: '🎆',
  christmas: '🎄',
  thanksgiving: '🦃',
  halloween: '🎃',
  easter: '🐰',
  arbor_day: '🌳',
  // ===== 兼容旧 ID =====
  brushing_teeth: '🦷',
  washing_hands: '🧼',
  eating_vegetables: '🥦',
  sleeping_early: '🛏️',
  tidying_up: '🧹',
  polite_words: '💬',
  family: '👨‍👩‍👧',
  managing_anger: '😌',
  courage: '💪'
}

function getThemeIcon(id: string): string {
  return themeIcons[id] || '📖'
}

// 模式选择处理
function handleModeSelect(mode: 'preset' | 'smart', prompt?: string) {
  showModeSelector.value = false

  if (mode === 'smart') {
    // 智能创作模式
    isSmartMode.value = true
    customPrompt.value = prompt || ''

    // 创建虚拟主题
    selectedTheme.value = {
      id: 'smart_custom',
      name: '智能创作',
      subcategory: '自定义',
      age_range: [12, 72],
      keywords: []
    }

    // 跳过主题选择，直接进入风格设置
    currentStep.value = 1
  } else {
    // 预设模式，从主题选择开始
    isSmartMode.value = false
    currentStep.value = 0
  }
}

function selectTheme(theme: ThemeItem) {
  selectedTheme.value = theme
}

function prevStep() {
  if (currentStep.value > 0) {
    // 智能创作模式下，步骤1点击上一步应回到模式选择器
    if (isSmartMode.value && currentStep.value === 1) {
      showModeSelector.value = true
      isSmartMode.value = false
      customPrompt.value = ''
      currentStep.value = 0
      return
    }
    currentStep.value--
  }
}

async function handleNext() {
  if (!canNext.value) return

  // 记录当前步骤和选择状态
  console.log(`[绘本-步骤] 点击下一步，当前步骤: ${currentStep.value}`)
  if (currentStep.value === 1) {
    // 从风格设置步骤离开时，记录所有选择
    console.log(`[绘本-步骤] 风格设置完成，art_style=${selectedArtStyle.value}, protagonist=${selectedAnimal.value}, voice=${selectedVoiceId.value}`)
  }

  if (currentStep.value < 2) {
    currentStep.value++
    console.log(`[绘本-步骤] 进入步骤 ${currentStep.value}`)
  } else {
    console.log(`[绘本-步骤] 开始创作，最终 art_style=${selectedArtStyle.value}`)
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

    // 构建请求参数
    const requestParams: Parameters<typeof generatePictureBookAsync>[0] = {
      child_name: childStore.currentChild.name,
      age_months: ageMonths,
      theme_topic: selectedTheme.value.id,
      theme_category: selectedCategory.value,
      art_style: selectedArtStyle.value,
      protagonist: {
        animal: selectedAnimal.value
      },
      voice_id: selectedVoiceId.value
    }

    // 智能创作模式：添加 creation_mode 和 custom_prompt
    if (isSmartMode.value && customPrompt.value) {
      requestParams.creation_mode = 'smart'
      requestParams.custom_prompt = customPrompt.value
      console.log('[绘本] 智能创作模式，描述:', customPrompt.value)
    }

    // 故事增强参数：过滤掉 null 值
    const storyEnhancementParams = Object.fromEntries(
      Object.entries(storyEnhancement.value).filter(([_, v]) => v !== null)
    )
    if (Object.keys(storyEnhancementParams).length > 0) {
      (requestParams as any).story_enhancement = storyEnhancementParams
      console.log('[绘本] 故事增强参数:', storyEnhancementParams)
    }

    // 视觉增强参数：过滤掉 null 值
    const visualEnhancementParams = Object.fromEntries(
      Object.entries(visualEnhancement.value).filter(([_, v]) => v !== null)
    )
    if (Object.keys(visualEnhancementParams).length > 0) {
      (requestParams as any).visual_enhancement = visualEnhancementParams
      console.log('[绘本] 视觉增强参数:', visualEnhancementParams)
    }

    console.log('[绘本] 发起异步生成请求，完整参数:', JSON.stringify(requestParams, null, 2))
    console.log('[绘本] art_style 参数:', requestParams.art_style, '(selectedArtStyle.value =', selectedArtStyle.value, ')')
    const asyncResult = await generatePictureBookAsync(requestParams)

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

  loadVoiceOptions()  // 加载音色列表
})

onLoad((options) => {
  // 从智能创作页面跳转过来（带完整参数）
  if (options?.creation_mode === 'smart' && options?.custom_prompt) {
    showModeSelector.value = false  // 隐藏模式选择器
    isSmartMode.value = true
    customPrompt.value = decodeURIComponent(options.custom_prompt)

    // 设置从智能创作页面传递的参数
    if (options.art_style) {
      selectedArtStyle.value = options.art_style as ArtStyle
    }
    if (options.protagonist) {
      selectedAnimal.value = options.protagonist as ProtagonistAnimal
    }
    if (options.voice_id) {
      selectedVoiceId.value = options.voice_id as VoiceId
    }

    // 智能创作模式：跳过主题选择，直接到确认步骤
    selectedTheme.value = {
      id: 'smart_custom',
      name: '智能创作',
      subcategory: '自定义',
      age_range: [12, 72],
      keywords: []
    }

    // 延迟跳转到确认步骤，确保组件初始化完成
    setTimeout(() => {
      currentStep.value = 2  // 直接跳到确认步骤
    }, 100)

    return
  }

  // 从首页灵感推荐跳转过来（带主题参数）
  if (options?.theme) {
    showModeSelector.value = false  // 隐藏模式选择器
    isSmartMode.value = false
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

    return
  }

  // 无参数：显示模式选择器（默认行为）
  showModeSelector.value = true
})

// 组件卸载时清理音频资源
onUnmounted(() => {
  stopPreview()
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

// ========================================
// 主题选择区域 - 紧凑版
// ========================================

// 分类横向滚动
.category-scroll {
  width: calc(100% + 64rpx);
  margin-left: -32rpx;
  margin-bottom: $spacing-md;
}

.category-track {
  display: flex;
  gap: $spacing-sm;
  padding: 0 32rpx;
  padding-right: 64rpx; // 额外右侧间距，防止最后一项截断
  white-space: nowrap;
}

.category-chip {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  background: $bg-card;
  border-radius: $radius-full;
  border: 2rpx solid $border-light;
  transition: all $duration-fast;
  flex-shrink: 0;

  &.active {
    background: rgba($book-primary, 0.1);
    border-color: $book-primary;
    box-shadow: 0 2rpx 12rpx rgba($book-primary, 0.15);

    .chip-name {
      color: $book-primary;
      font-weight: $font-semibold;
    }
  }

  &:active {
    transform: scale(0.96);
  }
}

.chip-icon {
  font-size: 32rpx;
}

.chip-name {
  font-size: $font-sm;
  color: $text-secondary;
  transition: all $duration-fast;
}

// 主题卡片网格 - 紧凑3列
.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-sm;
  width: 100%;
}

.theme-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-md $spacing-xs;
  background: $bg-card;
  border-radius: $radius-md;
  border: 2rpx solid $border-light;
  box-shadow: $shadow-sm;
  transition: all $duration-fast;

  &.selected {
    border-color: $book-primary;
    background: rgba($book-primary, 0.06);
    box-shadow: 0 4rpx 16rpx rgba($book-primary, 0.15);

    .theme-emoji {
      transform: scale(1.1);
    }

    .theme-name {
      color: $book-primary;
      font-weight: $font-semibold;
    }
  }

  &:active {
    transform: scale(0.96);
  }
}

.theme-emoji {
  font-size: 40rpx;
  margin-bottom: 8rpx;
  transition: transform $duration-fast;
}

.theme-name {
  font-size: $font-sm;
  color: $text-primary;
  text-align: center;
  line-height: 1.3;
}

.theme-check {
  position: absolute;
  top: 6rpx;
  right: 6rpx;
  width: 28rpx;
  height: 28rpx;
  background: $book-primary;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16rpx;
  color: $text-white;
  font-weight: $font-bold;
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
  width: 220rpx;
  height: 200rpx;
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

  // 3D 风格
  &.pixar_3d { background: linear-gradient(145deg, #74B9FF 0%, #A29BFE 50%, #81ECEC 100%); }
  &.pixar { background: linear-gradient(145deg, #FF7B54 0%, #7FB285 50%, #F5A623 100%); }
  &.dreamworks { background: linear-gradient(145deg, #45B7D1 0%, #96E6A1 50%, #DFE6E9 100%); }
  &.disney_3d { background: linear-gradient(145deg, #E8A4C9 0%, #87CEEB 50%, #FFD700 100%); }
  &.clay { background: linear-gradient(145deg, #E8A87C 0%, #D4A574 50%, #C9956C 100%); }
  &.figurine { background: linear-gradient(145deg, #DFE6E9 0%, #B2BEC3 50%, #636E72 100%); }
  &.low_poly { background: linear-gradient(145deg, #00CEC9 0%, #6C5CE7 50%, #FD79A8 100%); }
  // 插画风格
  &.storybook { background: linear-gradient(145deg, #FFE4C4 0%, #F5A623 50%, #7FB285 100%); }
  &.watercolor { background: linear-gradient(145deg, #74B9FF 0%, #FFB347 50%, #4ECDC4 100%); }
  &.cartoon { background: linear-gradient(145deg, #FF7B54 0%, #FFE66D 50%, #4ECDC4 100%); }
  &.flat { background: linear-gradient(145deg, #FFE66D 0%, #FF7B54 50%, #7FB285 100%); }
  &.flat_vector { background: linear-gradient(145deg, #FFE66D 0%, #FF7B54 50%, #7FB285 100%); }
  &.crayon { background: linear-gradient(145deg, #F5A623 0%, #FF7B54 50%, #7FB285 100%); }
  &.colored_pencil { background: linear-gradient(145deg, #FFEAA7 0%, #FDCB6E 50%, #E17055 100%); }
  // 动漫风格
  &.anime { background: linear-gradient(145deg, #FFB6C1 0%, #7FB285 50%, #74B9FF 100%); }
  &.chibi { background: linear-gradient(145deg, #FFB5BA 0%, #FFF5BA 50%, #B5D8FF 100%); }
  &.ghibli { background: linear-gradient(145deg, #7FB285 0%, #74B9FF 50%, #F5A623 100%); }
  &.shinkai { background: linear-gradient(145deg, #667EEA 0%, #764BA2 50%, #F093FB 100%); }
  &.manga { background: linear-gradient(145deg, #2D3436 0%, #636E72 50%, #FFFFFF 100%); }
  &.comic_book { background: linear-gradient(145deg, #FF4757 0%, #2ED573 50%, #3742FA 100%); }
  // 艺术风格
  &.oil_painting { background: linear-gradient(145deg, #8B4513 0%, #D4A574 50%, #FFE4C4 100%); }
  &.impressionist { background: linear-gradient(145deg, #F9CA24 0%, #6AB04C 50%, #686DE0 100%); }
  &.sketch { background: linear-gradient(145deg, #2D3436 0%, #636E72 50%, #DFE6E9 100%); }
  &.ink_wash { background: linear-gradient(145deg, #2D3436 0%, #B2BEC3 50%, #DFE6E9 100%); }
  &.pop_art { background: linear-gradient(145deg, #FF6B6B 0%, #4ECDC4 50%, #FFE66D 100%); }
  &.art_nouveau { background: linear-gradient(145deg, #C8A962 0%, #7D8471 50%, #2C3E50 100%); }
  &.pixel_art { background: linear-gradient(145deg, #2ED573 0%, #3742FA 50%, #FF4757 100%); }
  // 手工风格
  &.papercut { background: linear-gradient(145deg, #E74C3C 0%, #F39C12 50%, #27AE60 100%); }
  &.felt_craft { background: linear-gradient(145deg, #FFB8B8 0%, #A8E6CF 50%, #FDFFAB 100%); }
  &.origami { background: linear-gradient(145deg, #74B9FF 0%, #FFFFFF 50%, #FF7675 100%); }
  &.embroidery { background: linear-gradient(145deg, #D63031 0%, #00B894 50%, #FDCB6E 100%); }
  &.mosaic { background: linear-gradient(145deg, #6C5CE7 0%, #00CEC9 50%, #FDCB6E 100%); }
  &.stained_glass { background: linear-gradient(145deg, #0984E3 0%, #6C5CE7 50%, #E84393 100%); }
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
  margin-bottom: 8rpx;
}

.art-desc {
  display: inline-block;
  font-size: 20rpx;
  color: $text-secondary;
  background: rgba(0, 0, 0, 0.05);
  padding: 4rpx 12rpx;
  border-radius: $radius-full;
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

// === 角色选择卡片 - Happy Stage 设计 ===
.character-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(33.33% - 16rpx);
  padding: $spacing-sm 0;
  padding-top: $spacing-md;
  position: relative;
  transition: all $duration-base $ease-bounce;

  // 选中状态 - 角色开心跳上舞台
  &.selected {
    .char-glow {
      opacity: 1;
      transform: scale(1);
    }
    .character-avatar-wrap {
      transform: translateY(-8rpx) scale(1.08);
    }
    .character-avatar {
      background: rgba($book-primary, 0.15);
      border-color: $book-primary;
      box-shadow: 0 8rpx 24rpx rgba($book-primary, 0.25);
    }
    .char-emoji {
      animation: char-bounce 0.5s $ease-bounce;
    }
    .char-star {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }
    .char-stage {
      opacity: 1;
      transform: scaleX(1);
    }
    .char-name {
      color: $book-primary;
      font-weight: $font-semibold;
    }
  }

  &:active {
    transform: scale(0.92);
  }
}

// 背景光晕效果
.char-glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) scale(0.8);
  width: 120rpx;
  height: 120rpx;
  background: radial-gradient(circle, rgba($book-primary, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0;
  transition: all $duration-base $ease-bounce;
  pointer-events: none;
}

// 头像包裹层
.character-avatar-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-xs;
  transition: all $duration-base $ease-bounce;
  z-index: 2;
}

.character-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: $bg-soft;
  border: 3rpx solid $border-light;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $duration-base $ease-bounce;
}

.char-emoji {
  font-size: 48rpx;
  transition: transform $duration-base;
}

// 选中星星徽章 - 弹出动画
.char-star {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  font-size: 28rpx;
  opacity: 0;
  transform: scale(0) rotate(-180deg);
  transition: all 0.35s $ease-bounce;
  filter: drop-shadow(0 2rpx 4rpx rgba($accent, 0.4));
  z-index: 3;
}

// 彩色舞台底座
.char-stage {
  width: 80rpx;
  height: 8rpx;
  background: linear-gradient(90deg, transparent, $book-primary, transparent);
  border-radius: 4rpx;
  margin-top: -4rpx;
  margin-bottom: 4rpx;
  opacity: 0;
  transform: scaleX(0);
  transition: all $duration-base $ease-bounce;
}

.char-name {
  font-size: $font-xs;
  color: $text-primary;
  font-weight: $font-medium;
  transition: all $duration-base;
}

// 弹跳动画
@keyframes char-bounce {
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-12rpx); }
  50% { transform: translateY(-4rpx); }
  75% { transform: translateY(-8rpx); }
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
  gap: 6rpx;
  min-width: 0;  // 防止 flex 子元素溢出
}

.voice-name-row {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  flex-wrap: wrap;
}

.voice-name {
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $text-primary;
}

.voice-id {
  font-size: $font-xs;
  color: $text-tertiary;
  font-weight: $font-normal;
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
  flex-shrink: 0;

  &.female { background: $book-light; color: $book-primary; }
  &.male { background: rgba(91, 164, 217, 0.2); color: #5ba4d9; }
  &.neutral { background: rgba(168, 149, 214, 0.2); color: #8875bf; }
}

.voice-detail-row {
  display: flex;
  align-items: flex-start;
  gap: 6rpx;
}

.voice-detail-label {
  font-size: 20rpx;
  flex-shrink: 0;
  line-height: 1.4;
}

.voice-detail-text {
  font-size: $font-xs;
  color: $text-secondary;
  line-height: 1.4;
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

// 试听按钮
.voice-preview-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: rgba($book-primary, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all $duration-fast;
  margin-right: $spacing-xs;

  &:active {
    transform: scale(0.9);
    background: rgba($book-primary, 0.2);
  }

  &.loading {
    .preview-icon {
      animation: spin 1s linear infinite;
    }
  }
}

.preview-icon {
  font-size: 24rpx;
  color: $book-primary;

  &.playing {
    color: $error;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 播放状态的音色卡片
.voice-card.playing {
  border-color: $book-primary;
  background: rgba($book-primary, 0.06);

  .voice-preview-btn {
    background: $book-primary;

    .preview-icon {
      color: $text-white;
    }
  }
}

// 播放中的声波动画
.voice-waves.playing {
  .wave {
    opacity: 1;
    animation: waveAnimPlaying 0.5s ease-in-out infinite;
  }
}

@keyframes waveAnimPlaying {
  0%, 100% { transform: scaleY(0.4); }
  50% { transform: scaleY(1.2); }
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

  &.smart-prompt {
    font-size: $font-sm;
    line-height: 1.5;
    color: $text-secondary;
    text-align: right;
    max-width: 400rpx;
  }
}

.smart-prompt-item {
  flex-direction: column;
  align-items: flex-start;
  gap: $spacing-xs;

  .confirm-value {
    text-align: left;
    max-width: 100%;
    word-break: break-all;
  }
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

// === 增强参数折叠面板 ===
.enhancement-panel {
  background: $bg-card;
  border-radius: $radius-lg;
  margin-top: $spacing-md;
  overflow: hidden;
  box-shadow: $shadow-sm;
  border: 1rpx solid $border-light;
  transition: all $duration-base $ease-out;

  &.expanded {
    box-shadow: $shadow-card;
    border-color: rgba($book-primary, 0.2);
  }
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md;
  cursor: pointer;
  transition: background $duration-fast;

  &:active {
    background: $bg-soft;
  }
}

.panel-header-left {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.panel-icon-wrap {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.story {
    background: linear-gradient(135deg, rgba($book-primary, 0.15) 0%, rgba($book-primary, 0.08) 100%);
  }

  &.visual {
    background: linear-gradient(135deg, rgba($video-primary, 0.15) 0%, rgba($video-primary, 0.08) 100%);
  }
}

.panel-icon {
  font-size: 24rpx;
}

.panel-header-text {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.panel-title {
  font-size: $font-base;
  font-weight: $font-semibold;
  color: $text-primary;
}

.panel-hint {
  font-size: $font-xs;
  color: $text-tertiary;
}

.panel-arrow {
  width: 36rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform $duration-base $ease-out;

  text {
    font-size: 32rpx;
    color: $text-tertiary;
    font-weight: $font-medium;
  }

  &.expanded {
    transform: rotate(90deg);
  }
}

.panel-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height $duration-slow $ease-out;
  padding: 0 $spacing-md;

  &.expanded {
    max-height: 2000rpx;
    padding-bottom: $spacing-md;
  }
}

.enhancement-group {
  margin-bottom: $spacing-md;

  &:last-child {
    margin-bottom: 0;
  }
}

.group-label {
  display: block;
  font-size: $font-sm;
  font-weight: $font-medium;
  color: $text-secondary;
  margin-bottom: $spacing-xs;
  padding-left: 4rpx;
}

.option-cards {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
}

.option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-sm $spacing-md;
  background: $bg-soft;
  border-radius: $radius-md;
  border: 2rpx solid transparent;
  transition: all $duration-fast $ease-bounce;
  min-width: 140rpx;

  &.selected {
    background: rgba($book-primary, 0.1);
    border-color: $book-primary;
    transform: scale(1.02);

    .option-label {
      color: $book-primary;
      font-weight: $font-semibold;
    }
  }

  &:active {
    transform: scale(0.96);
  }
}

.option-emoji {
  font-size: 32rpx;
  margin-bottom: 4rpx;
}

.option-label {
  font-size: $font-xs;
  color: $text-primary;
  white-space: nowrap;
  transition: all $duration-fast;
}

// === 确认页增强卡片 ===
.enhance-card {
  margin-top: $spacing-sm;
  padding: $spacing-md;
}

.enhance-card-header {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  margin-bottom: $spacing-sm;
}

.enhance-icon {
  font-size: 24rpx;
}

.enhance-title {
  font-size: $font-sm;
  font-weight: $font-semibold;
  color: $text-primary;
}

.enhance-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
}

.enhance-tag {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 16rpx;
  background: rgba($book-primary, 0.1);
  border-radius: $radius-full;
  border: 1rpx solid rgba($book-primary, 0.2);

  text {
    font-size: $font-xs;
    color: $book-primary;
    font-weight: $font-medium;
  }

  &.visual {
    background: rgba($video-primary, 0.1);
    border-color: rgba($video-primary, 0.2);

    text {
      color: $video-primary;
    }
  }
}
</style>
