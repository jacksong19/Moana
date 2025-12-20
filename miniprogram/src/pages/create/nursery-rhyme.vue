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

    <!-- 模式选择（首次进入时显示） -->
    <scroll-view v-if="showModeSelector" class="main-scroll" scroll-y>
      <CreationModeSelector
        content-type="nursery_rhyme"
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
        <text class="step-title">选择儿歌主题</text>
        <text class="step-desc">为 {{ childName }} 谱写一首动听旋律</text>

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
          <text class="step-title">风格设置</text>
          <text class="step-desc">为 {{ childName }} 选择音乐氛围和人声类型</text>
        </view>

        <!-- 场景预设快捷入口 -->
        <view v-if="showScenePresets" class="scene-presets-section">
          <view class="section-header">
            <view class="section-icon-wrap preset">
              <text class="section-icon">✨</text>
            </view>
            <text class="section-title">场景预设</text>
            <text class="section-hint">一键设置推荐参数</text>
          </view>
          <scroll-view class="presets-scroll" scroll-x enhanced :show-scrollbar="false">
            <view class="presets-track">
              <view
                v-for="preset in scenePresets"
                :key="preset.id"
                class="preset-card"
                :class="{ selected: selectedScenePreset === preset.id }"
                @tap="selectScenePreset(preset)"
              >
                <text class="preset-icon">{{ preset.icon }}</text>
                <text class="preset-name">{{ preset.name }}</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <view class="style-sections">
          <!-- 音乐氛围 - 扩展到 8 种 -->
          <view class="style-section music-section">
            <view class="section-header">
              <view class="section-icon-wrap music">
                <text class="section-icon">🎵</text>
              </view>
              <text class="section-title">音乐氛围</text>
            </view>
            <view class="music-mood-grid">
              <view
                v-for="mood in musicMoods"
                :key="mood.value"
                class="music-mood-card"
                :class="{ selected: selectedMood === mood.value }"
                @tap="onMoodChange(mood.value)"
              >
                <view class="mood-visual" :class="mood.value">
                  <text class="mood-icon">{{ mood.icon }}</text>
                  <view class="mood-bars">
                    <view class="bar" v-for="i in 5" :key="i"></view>
                  </view>
                </view>
                <view class="mood-info">
                  <text class="mood-name">{{ mood.label }}</text>
                  <text class="mood-desc">{{ mood.description }}</text>
                </view>
                <view v-if="selectedMood === mood.value" class="mood-check">
                  <text>✓</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 人声类型 - 6 种 -->
          <view class="style-section vocal-section">
            <view class="section-header">
              <view class="section-icon-wrap vocal">
                <text class="section-icon">🎤</text>
              </view>
              <text class="section-title">人声类型</text>
            </view>
            <view class="vocal-type-grid">
              <view
                v-for="vocal in vocalTypes"
                :key="vocal.value"
                class="vocal-type-card"
                :class="{ selected: selectedVocalType === vocal.value }"
                @tap="selectedVocalType = vocal.value"
              >
                <text class="vocal-icon">{{ vocal.icon }}</text>
                <view class="vocal-info">
                  <text class="vocal-name">{{ vocal.label }}</text>
                  <text class="vocal-desc">{{ vocal.description }}</text>
                </view>
                <view v-if="selectedVocalType === vocal.value" class="vocal-check">✓</view>
              </view>
            </view>
          </view>

          <!-- 高级设置组件 -->
          <NurseryRhymeAdvanced
            :model-value="advancedParams"
            @update:model-value="onAdvancedParamsUpdate"
          />
        </view>
      </view>

      <!-- 步骤 3: 确认生成 -->
      <view v-if="currentStep === 2" class="step-content animate-fadeIn">
        <text class="step-title">确认创作</text>
        <text class="step-desc">检查设置，开始生成专属儿歌</text>

        <view class="confirm-card">
          <!-- 智能创作模式显示用户描述 -->
          <view v-if="isSmartMode" class="confirm-item smart-prompt-item">
            <text class="confirm-label">创作描述</text>
            <text class="confirm-value smart-prompt">{{ customPrompt }}</text>
          </view>
          <!-- 普通模式显示主题 -->
          <view v-else class="confirm-item">
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
            <text class="confirm-label">人声类型</text>
            <text class="confirm-value">{{ currentVocalTypeName }}</text>
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
      type="song"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useChildStore } from '@/stores/child'
import { useContentStore } from '@/stores/content'
import GeneratingProgress from '@/components/GeneratingProgress/GeneratingProgress.vue'
import CreationModeSelector from '@/components/CreationModeSelector/CreationModeSelector.vue'
import NurseryRhymeAdvanced from '@/components/NurseryRhymeAdvanced/NurseryRhymeAdvanced.vue'
import { generateNurseryRhymeAsync, getNurseryRhymeTaskStatus, getContentDetail } from '@/api/content'
import type {
  ThemeItem,
  MusicStyle,
  NurseryRhyme,
  SunoTaskStage,
  NurseryRhymeTaskStatus,
  ProtagonistAnimal,
  GenerateNurseryRhymeParams
} from '@/api/content'
import {
  SCENE_PRESETS,
  MUSIC_MOODS,
  VOCAL_TYPES,
  getScenePresetParams,
  getMoodLinkageParams,
  DEFAULT_PARAMS
} from '@/config/nurseryRhymeConfig'
import type { ScenePreset, NurseryRhymeFullParams } from '@/config/nurseryRhymeConfig'

const childStore = useChildStore()
const contentStore = useContentStore()

// 模式选择
const showModeSelector = ref(true)
const isSmartMode = ref(false)
const customPrompt = ref('')

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

// 主题分类（丰富的儿歌主题分类）
const themeCategories = [
  { id: 'habit', name: '习惯养成', icon: '🌟' },
  { id: 'cognition', name: '认知启蒙', icon: '🌍' },
  { id: 'action', name: '律动游戏', icon: '🎵' },
  { id: 'scene', name: '日常场景', icon: '🏠' },
  { id: 'nature', name: '自然世界', icon: '🌸' },
  { id: 'festival', name: '节日歌曲', icon: '🎉' }
]
const selectedCategory = ref('habit')
const selectedTheme = ref<ThemeItem | null>(null)

// 场景预设
const scenePresets = SCENE_PRESETS
const selectedScenePreset = ref<string | null>(null)
const showScenePresets = ref(true)

// 音乐氛围（扩展到 8 种）
const musicMoods = MUSIC_MOODS
const selectedMood = ref<string>('cheerful')

// 人声类型（6 种）
const vocalTypes = VOCAL_TYPES
const selectedVocalType = ref<string>('soft_female')

// 高级参数（响应式对象）
const advancedParams = reactive<Partial<GenerateNurseryRhymeParams>>({
  ...DEFAULT_PARAMS
})

// 兼容旧的 selectedStyle（映射到 selectedMood）
const selectedStyle = computed<MusicStyle>(() => selectedMood.value as MusicStyle)

// 场景预设分组
const scenePresetGroups = computed(() => {
  return [
    { id: 'time', name: '按时段', presets: scenePresets.filter(p => p.category === 'time') },
    { id: 'function', name: '按功能', presets: scenePresets.filter(p => p.category === 'function') },
    { id: 'mood', name: '按氛围', presets: scenePresets.filter(p => p.category === 'mood') }
  ]
})

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

const currentStyleName = computed(() => {
  return musicMoods.find(s => s.value === selectedMood.value)?.label || ''
})

const currentVocalTypeName = computed(() => {
  return vocalTypes.find(v => v.value === selectedVocalType.value)?.label || ''
})

// 选择场景预设
function selectScenePreset(preset: ScenePreset) {
  selectedScenePreset.value = preset.id

  // 应用预设参数
  const presetParams = getScenePresetParams(preset.id)

  if (presetParams.music_mood) {
    selectedMood.value = presetParams.music_mood
  }
  if (presetParams.vocal_type) {
    selectedVocalType.value = presetParams.vocal_type
  }

  // 更新高级参数
  Object.assign(advancedParams, presetParams)

  console.log('[selectScenePreset] 应用预设:', preset.name, presetParams)
}

// 氛围变化时智能联动
function onMoodChange(mood: string) {
  selectedMood.value = mood

  // 获取联动推荐参数
  const linkage = getMoodLinkageParams(mood)
  if (Object.keys(linkage).length > 0) {
    Object.assign(advancedParams, linkage)
    console.log('[onMoodChange] 智能联动:', mood, linkage)
  }
}

// 高级参数更新处理（reactive 对象不能直接被 v-model 替换）
function onAdvancedParamsUpdate(newValue: Partial<GenerateNurseryRhymeParams>) {
  // 使用 Object.assign 合并更新，而不是替换整个对象
  Object.assign(advancedParams, newValue)
}


const canNext = computed(() => {
  if (currentStep.value === 0) return !!selectedTheme.value
  return true
})

// 默认主题（丰富的儿歌主题库）
const defaultThemes: Record<string, ThemeItem[]> = {
  // 习惯养成（20个主题）
  habit: [
    { id: 'brush_teeth', name: '刷牙歌', subcategory: '卫生习惯', age_range: [24, 48], keywords: [] },
    { id: 'wash_hands', name: '洗手歌', subcategory: '卫生习惯', age_range: [18, 48], keywords: [] },
    { id: 'take_bath', name: '洗澡歌', subcategory: '卫生习惯', age_range: [18, 48], keywords: [] },
    { id: 'wash_face', name: '洗脸歌', subcategory: '卫生习惯', age_range: [18, 36], keywords: [] },
    { id: 'cut_nails', name: '剪指甲', subcategory: '卫生习惯', age_range: [24, 48], keywords: [] },
    { id: 'get_dressed', name: '穿衣歌', subcategory: '生活自理', age_range: [24, 48], keywords: [] },
    { id: 'tie_shoes', name: '系鞋带', subcategory: '生活自理', age_range: [48, 72], keywords: [] },
    { id: 'potty_song', name: '上厕所', subcategory: '生活自理', age_range: [18, 36], keywords: [] },
    { id: 'eat_well', name: '吃饭歌', subcategory: '饮食习惯', age_range: [18, 48], keywords: [] },
    { id: 'no_picky', name: '不挑食', subcategory: '饮食习惯', age_range: [24, 60], keywords: [] },
    { id: 'drink_water', name: '多喝水', subcategory: '健康习惯', age_range: [18, 48], keywords: [] },
    { id: 'chew_slowly', name: '细嚼慢咽', subcategory: '饮食习惯', age_range: [24, 60], keywords: [] },
    { id: 'sleep_song', name: '睡觉歌', subcategory: '作息习惯', age_range: [18, 48], keywords: [] },
    { id: 'wake_up', name: '起床歌', subcategory: '作息习惯', age_range: [18, 48], keywords: [] },
    { id: 'nap_song', name: '午睡歌', subcategory: '作息习惯', age_range: [18, 48], keywords: [] },
    { id: 'tidy_up', name: '收拾歌', subcategory: '整理习惯', age_range: [24, 60], keywords: [] },
    { id: 'clean_room', name: '整理房间', subcategory: '整理习惯', age_range: [36, 72], keywords: [] },
    { id: 'polite_song', name: '礼貌歌', subcategory: '礼仪习惯', age_range: [18, 48], keywords: [] },
    { id: 'share_song', name: '分享歌', subcategory: '社交习惯', age_range: [24, 60], keywords: [] },
    { id: 'exercise_song', name: '运动歌', subcategory: '健康习惯', age_range: [24, 60], keywords: [] }
  ],
  // 认知启蒙（20个主题）
  cognition: [
    { id: 'numbers', name: '数字歌', subcategory: '数学启蒙', age_range: [24, 48], keywords: [] },
    { id: 'counting', name: '数数歌', subcategory: '数学启蒙', age_range: [18, 48], keywords: [] },
    { id: 'add_subtract', name: '加减歌', subcategory: '数学启蒙', age_range: [48, 72], keywords: [] },
    { id: 'letters', name: '字母歌', subcategory: '语言启蒙', age_range: [30, 60], keywords: [] },
    { id: 'pinyin', name: '拼音歌', subcategory: '语言启蒙', age_range: [48, 72], keywords: [] },
    { id: 'colors', name: '颜色歌', subcategory: '基础认知', age_range: [12, 36], keywords: [] },
    { id: 'shapes', name: '形状歌', subcategory: '基础认知', age_range: [18, 36], keywords: [] },
    { id: 'big_small', name: '大小歌', subcategory: '对比认知', age_range: [12, 36], keywords: [] },
    { id: 'long_short', name: '长短歌', subcategory: '对比认知', age_range: [18, 36], keywords: [] },
    { id: 'body_parts', name: '身体歌', subcategory: '自我认知', age_range: [12, 36], keywords: [] },
    { id: 'five_senses', name: '五官歌', subcategory: '自我认知', age_range: [12, 36], keywords: [] },
    { id: 'opposites', name: '反义词', subcategory: '语言启蒙', age_range: [24, 48], keywords: [] },
    { id: 'animals', name: '动物歌', subcategory: '自然认知', age_range: [12, 48], keywords: [] },
    { id: 'animal_sounds', name: '动物叫', subcategory: '自然认知', age_range: [12, 36], keywords: [] },
    { id: 'fruits', name: '水果歌', subcategory: '生活认知', age_range: [12, 36], keywords: [] },
    { id: 'vegetables', name: '蔬菜歌', subcategory: '生活认知', age_range: [18, 48], keywords: [] },
    { id: 'vehicles', name: '交通歌', subcategory: '生活认知', age_range: [18, 48], keywords: [] },
    { id: 'occupations', name: '职业歌', subcategory: '社会认知', age_range: [30, 60], keywords: [] },
    { id: 'family', name: '家人歌', subcategory: '社会认知', age_range: [12, 36], keywords: [] },
    { id: 'time_song', name: '时间歌', subcategory: '基础认知', age_range: [42, 72], keywords: [] }
  ],
  // 律动游戏（20个主题）
  action: [
    { id: 'clap_hands', name: '拍手歌', subcategory: '手部律动', age_range: [12, 36], keywords: [] },
    { id: 'finger_play', name: '手指歌', subcategory: '手部律动', age_range: [12, 48], keywords: [] },
    { id: 'finger_family', name: '手指家族', subcategory: '手部律动', age_range: [12, 36], keywords: [] },
    { id: 'fist_song', name: '握拳歌', subcategory: '手部律动', age_range: [12, 36], keywords: [] },
    { id: 'dance_song', name: '跳舞歌', subcategory: '全身律动', age_range: [24, 60], keywords: [] },
    { id: 'march_song', name: '踏步歌', subcategory: '全身律动', age_range: [18, 48], keywords: [] },
    { id: 'jump_song', name: '跳跳歌', subcategory: '全身律动', age_range: [24, 60], keywords: [] },
    { id: 'stretch_song', name: '伸展歌', subcategory: '全身律动', age_range: [18, 48], keywords: [] },
    { id: 'spin_song', name: '转圈歌', subcategory: '全身律动', age_range: [24, 48], keywords: [] },
    { id: 'squat_song', name: '蹲起歌', subcategory: '全身律动', age_range: [24, 60], keywords: [] },
    { id: 'shake_song', name: '摇摇歌', subcategory: '全身律动', age_range: [12, 36], keywords: [] },
    { id: 'hide_seek', name: '捉迷藏', subcategory: '互动游戏', age_range: [24, 60], keywords: [] },
    { id: 'follow_me', name: '跟我做', subcategory: '互动游戏', age_range: [18, 48], keywords: [] },
    { id: 'pass_ball', name: '传球歌', subcategory: '互动游戏', age_range: [24, 60], keywords: [] },
    { id: 'action_song', name: '动作歌', subcategory: '动作模仿', age_range: [18, 48], keywords: [] },
    { id: 'animal_move', name: '动物操', subcategory: '动作模仿', age_range: [24, 60], keywords: [] },
    { id: 'robot_dance', name: '机器人舞', subcategory: '动作模仿', age_range: [30, 60], keywords: [] },
    { id: 'rhythm_game', name: '节奏歌', subcategory: '节奏感', age_range: [24, 60], keywords: [] },
    { id: 'drum_song', name: '打鼓歌', subcategory: '节奏感', age_range: [18, 48], keywords: [] },
    { id: 'freeze_dance', name: '定格舞', subcategory: '互动游戏', age_range: [30, 60], keywords: [] }
  ],
  // 日常场景（20个主题）
  scene: [
    { id: 'morning_song', name: '早安歌', subcategory: '一天时光', age_range: [18, 48], keywords: [] },
    { id: 'goodnight', name: '晚安歌', subcategory: '一天时光', age_range: [12, 48], keywords: [] },
    { id: 'lullaby', name: '摇篮曲', subcategory: '睡前歌曲', age_range: [0, 36], keywords: [] },
    { id: 'sweet_dreams', name: '甜梦歌', subcategory: '睡前歌曲', age_range: [0, 36], keywords: [] },
    { id: 'car_ride', name: '坐车歌', subcategory: '出行场景', age_range: [18, 48], keywords: [] },
    { id: 'bus_song', name: '坐公交', subcategory: '出行场景', age_range: [24, 60], keywords: [] },
    { id: 'train_ride', name: '坐火车', subcategory: '出行场景', age_range: [24, 60], keywords: [] },
    { id: 'playground', name: '游乐场', subcategory: '游玩场景', age_range: [24, 60], keywords: [] },
    { id: 'zoo_trip', name: '动物园', subcategory: '游玩场景', age_range: [24, 60], keywords: [] },
    { id: 'aquarium', name: '水族馆', subcategory: '游玩场景', age_range: [24, 60], keywords: [] },
    { id: 'supermarket', name: '超市歌', subcategory: '生活场景', age_range: [24, 60], keywords: [] },
    { id: 'hospital', name: '看医生', subcategory: '生活场景', age_range: [24, 60], keywords: [] },
    { id: 'haircut', name: '理发歌', subcategory: '生活场景', age_range: [24, 60], keywords: [] },
    { id: 'school_song', name: '上学歌', subcategory: '校园生活', age_range: [30, 72], keywords: [] },
    { id: 'homework', name: '做作业', subcategory: '校园生活', age_range: [48, 72], keywords: [] },
    { id: 'recess', name: '课间歌', subcategory: '校园生活', age_range: [36, 72], keywords: [] },
    { id: 'picnic', name: '野餐歌', subcategory: '户外活动', age_range: [24, 60], keywords: [] },
    { id: 'beach_song', name: '海边歌', subcategory: '户外活动', age_range: [24, 60], keywords: [] },
    { id: 'park_song', name: '公园歌', subcategory: '户外活动', age_range: [18, 48], keywords: [] },
    { id: 'camping', name: '露营歌', subcategory: '户外活动', age_range: [30, 72], keywords: [] }
  ],
  // 自然世界（20个主题）
  nature: [
    { id: 'sun_song', name: '太阳歌', subcategory: '天体', age_range: [18, 48], keywords: [] },
    { id: 'moon_song', name: '月亮歌', subcategory: '天体', age_range: [18, 48], keywords: [] },
    { id: 'star_song', name: '星星歌', subcategory: '天体', age_range: [18, 48], keywords: [] },
    { id: 'earth_song', name: '地球歌', subcategory: '天体', age_range: [30, 60], keywords: [] },
    { id: 'rain_song', name: '下雨歌', subcategory: '天气', age_range: [18, 48], keywords: [] },
    { id: 'rainbow', name: '彩虹歌', subcategory: '天气', age_range: [24, 60], keywords: [] },
    { id: 'wind_song', name: '风儿歌', subcategory: '天气', age_range: [24, 60], keywords: [] },
    { id: 'cloud_song', name: '云朵歌', subcategory: '天气', age_range: [18, 48], keywords: [] },
    { id: 'snow_song', name: '下雪歌', subcategory: '天气', age_range: [24, 60], keywords: [] },
    { id: 'thunder', name: '打雷歌', subcategory: '天气', age_range: [24, 60], keywords: [] },
    { id: 'spring_song', name: '春天歌', subcategory: '四季', age_range: [24, 60], keywords: [] },
    { id: 'summer_song', name: '夏天歌', subcategory: '四季', age_range: [24, 60], keywords: [] },
    { id: 'autumn_song', name: '秋天歌', subcategory: '四季', age_range: [24, 60], keywords: [] },
    { id: 'winter_song', name: '冬天歌', subcategory: '四季', age_range: [24, 60], keywords: [] },
    { id: 'flower_song', name: '花儿歌', subcategory: '植物', age_range: [18, 48], keywords: [] },
    { id: 'tree_song', name: '大树歌', subcategory: '植物', age_range: [18, 48], keywords: [] },
    { id: 'grass_song', name: '小草歌', subcategory: '植物', age_range: [18, 48], keywords: [] },
    { id: 'butterfly', name: '蝴蝶歌', subcategory: '昆虫', age_range: [18, 48], keywords: [] },
    { id: 'bee_song', name: '小蜜蜂', subcategory: '昆虫', age_range: [18, 48], keywords: [] },
    { id: 'bird_song', name: '小鸟歌', subcategory: '动物', age_range: [12, 48], keywords: [] }
  ],
  // 节日歌曲（20个主题）
  festival: [
    { id: 'birthday_song', name: '生日歌', subcategory: '特殊日子', age_range: [12, 72], keywords: [] },
    { id: 'happy_birthday', name: '祝你生日', subcategory: '特殊日子', age_range: [12, 72], keywords: [] },
    { id: 'new_year_song', name: '新年歌', subcategory: '中国节日', age_range: [18, 72], keywords: [] },
    { id: 'spring_fest', name: '过年歌', subcategory: '中国节日', age_range: [18, 72], keywords: [] },
    { id: 'red_envelope', name: '红包歌', subcategory: '中国节日', age_range: [18, 72], keywords: [] },
    { id: 'lantern_song', name: '元宵歌', subcategory: '中国节日', age_range: [24, 72], keywords: [] },
    { id: 'dragon_boat', name: '端午歌', subcategory: '中国节日', age_range: [24, 72], keywords: [] },
    { id: 'moon_fest', name: '中秋歌', subcategory: '中国节日', age_range: [24, 72], keywords: [] },
    { id: 'qingming', name: '清明歌', subcategory: '中国节日', age_range: [36, 72], keywords: [] },
    { id: 'double_ninth', name: '重阳歌', subcategory: '中国节日', age_range: [36, 72], keywords: [] },
    { id: 'childrens_day', name: '儿童节', subcategory: '特殊节日', age_range: [24, 72], keywords: [] },
    { id: 'teachers_day', name: '教师节', subcategory: '感恩节日', age_range: [36, 72], keywords: [] },
    { id: 'mothers_song', name: '母亲节', subcategory: '感恩节日', age_range: [24, 72], keywords: [] },
    { id: 'fathers_song', name: '父亲节', subcategory: '感恩节日', age_range: [24, 72], keywords: [] },
    { id: 'grandparents', name: '爷爷奶奶', subcategory: '感恩节日', age_range: [24, 72], keywords: [] },
    { id: 'christmas', name: '圣诞歌', subcategory: '西方节日', age_range: [24, 72], keywords: [] },
    { id: 'halloween', name: '万圣节', subcategory: '西方节日', age_range: [36, 72], keywords: [] },
    { id: 'easter', name: '复活节', subcategory: '西方节日', age_range: [30, 72], keywords: [] },
    { id: 'thank_song', name: '感恩歌', subcategory: '感恩节日', age_range: [24, 72], keywords: [] },
    { id: 'graduation', name: '毕业歌', subcategory: '特殊日子', age_range: [48, 72], keywords: [] }
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
  tie_shoes: '👟',
  potty_song: '🚽',
  eat_well: '🍽️',
  no_picky: '🥦',
  drink_water: '💧',
  chew_slowly: '🍴',
  sleep_song: '😴',
  wake_up: '🌅',
  nap_song: '💤',
  tidy_up: '🧹',
  clean_room: '🏠',
  polite_song: '💬',
  share_song: '🤝',
  exercise_song: '🏃',
  // ===== 认知启蒙 =====
  numbers: '🔢',
  counting: '🧮',
  add_subtract: '➕',
  letters: '🔤',
  pinyin: '📝',
  colors: '🎨',
  shapes: '🔷',
  big_small: '📏',
  long_short: '📐',
  body_parts: '🖐️',
  five_senses: '👁️',
  opposites: '↔️',
  animals: '🦁',
  animal_sounds: '🐕',
  fruits: '🍎',
  vegetables: '🥬',
  vehicles: '🚗',
  occupations: '👨‍⚕️',
  family: '👨‍👩‍👧',
  time_song: '🕐',
  // ===== 律动游戏 =====
  clap_hands: '👏',
  finger_play: '🖐️',
  finger_family: '✋',
  fist_song: '✊',
  dance_song: '💃',
  march_song: '🚶',
  jump_song: '🦘',
  stretch_song: '🙆',
  spin_song: '🔄',
  squat_song: '🧎',
  shake_song: '🙌',
  hide_seek: '🙈',
  follow_me: '👀',
  pass_ball: '⚽',
  action_song: '🎬',
  animal_move: '🐻',
  robot_dance: '🤖',
  rhythm_game: '🥁',
  drum_song: '🪘',
  freeze_dance: '🧊',
  // ===== 日常场景 =====
  morning_song: '☀️',
  goodnight: '🌙',
  lullaby: '🍼',
  sweet_dreams: '💫',
  car_ride: '🚗',
  bus_song: '🚌',
  train_ride: '🚂',
  playground: '🎢',
  zoo_trip: '🦒',
  aquarium: '🐠',
  supermarket: '🛒',
  hospital: '🏥',
  haircut: '💇',
  school_song: '🎒',
  homework: '📚',
  recess: '🎮',
  picnic: '🧺',
  beach_song: '🏖️',
  park_song: '🌳',
  camping: '⛺',
  // ===== 自然世界 =====
  sun_song: '☀️',
  moon_song: '🌙',
  star_song: '⭐',
  earth_song: '🌍',
  rain_song: '🌧️',
  rainbow: '🌈',
  wind_song: '💨',
  cloud_song: '☁️',
  snow_song: '❄️',
  thunder: '⚡',
  spring_song: '🌸',
  summer_song: '🌻',
  autumn_song: '🍂',
  winter_song: '🧣',
  flower_song: '🌷',
  tree_song: '🌳',
  grass_song: '🌿',
  butterfly: '🦋',
  bee_song: '🐝',
  bird_song: '🐦',
  // ===== 节日歌曲 =====
  birthday_song: '🎂',
  happy_birthday: '🎁',
  new_year_song: '🎆',
  spring_fest: '🧧',
  red_envelope: '🧧',
  lantern_song: '🏮',
  dragon_boat: '🐲',
  moon_fest: '🥮',
  qingming: '🌾',
  double_ninth: '🏔️',
  childrens_day: '🎈',
  teachers_day: '📖',
  mothers_song: '💐',
  fathers_song: '👔',
  grandparents: '👴',
  christmas: '🎄',
  halloween: '🎃',
  easter: '🐰',
  thank_song: '🙏',
  graduation: '🎓',
  // ===== 兼容旧 ID =====
  potty_training: '🚽',
  eat_independently: '🥄',
  no_picky_eating: '🥦',
  bedtime: '🛏️',
  nap_time: '😴',
  sharing: '🤝',
  greeting: '👋'
}

function getThemeIcon(id: string): string {
  return themeIcons[id] || '🎵'
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

    // 构建请求参数（V2 增强版）
    const requestParams: GenerateNurseryRhymeParams = {
      // 必填参数
      child_name: childStore.currentChild.name,
      age_months: ageMonths,
      theme_topic: selectedTheme.value.name,
      theme_category: selectedCategory.value,

      // 核心参数
      music_mood: selectedMood.value,
      vocal_type: selectedVocalType.value,

      // 高级参数（来自 advancedParams）
      ...advancedParams,

      // 兼容旧参数
      music_style: selectedStyle.value
    }

    // 智能创作模式：添加 creation_mode 和 custom_prompt
    if (isSmartMode.value && customPrompt.value) {
      requestParams.creation_mode = 'smart'
      requestParams.custom_prompt = customPrompt.value
      console.log('[儿歌] 智能创作模式，描述:', customPrompt.value)
    } else {
      requestParams.creation_mode = 'preset'
    }

    console.log('[startGenerate] 请求参数:', JSON.stringify(requestParams, null, 2))

    const asyncResult = await generateNurseryRhymeAsync(requestParams)

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
})

// 处理传入的参数
onLoad((options) => {
  // 从智能创作页面跳转过来（带完整参数）
  if (options?.creation_mode === 'smart' && options?.custom_prompt) {
    showModeSelector.value = false  // 隐藏模式选择器
    isSmartMode.value = true
    customPrompt.value = decodeURIComponent(options.custom_prompt)

    // 设置从智能创作页面传递的参数
    if (options.music_mood) {
      selectedMood.value = options.music_mood
    }
    if (options.vocal_type) {
      selectedVocalType.value = options.vocal_type
    }

    // 智能创作模式：跳过主题选择，直接到确认步骤
    selectedTheme.value = {
      id: 'smart_custom',
      name: '智能创作',
      subcategory: '自定义',
      age_range: [12, 72],
      keywords: []
    }

    // 延迟跳转到确认步骤
    setTimeout(() => {
      currentStep.value = 2
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
    background: rgba($song-primary, 0.1);
    border-color: $song-primary;
    box-shadow: 0 2rpx 12rpx rgba($song-primary, 0.15);

    .chip-name {
      color: $song-primary;
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
    border-color: $song-primary;
    background: rgba($song-primary, 0.06);
    box-shadow: 0 4rpx 16rpx rgba($song-primary, 0.15);

    .theme-emoji {
      transform: scale(1.1);
    }

    .theme-name {
      color: $song-primary;
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
  background: $song-primary;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16rpx;
  color: $text-white;
  font-weight: $font-bold;
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
  &.vocal { background: rgba(#9B59B6, 0.12); }
  &.preset { background: rgba($accent, 0.12); }
  &.bunny { background: rgba(#FF9F9F, 0.15); }
}

.section-hint {
  margin-left: auto;
  font-size: $font-xs;
  color: $text-tertiary;
}

.section-icon {
  font-size: 28rpx;
}

// ==========================================
// 场景预设 - 魔法卡片横向滚动
// ==========================================
.scene-presets-section {
  margin-bottom: $spacing-lg;
  background: linear-gradient(145deg, $bg-card 0%, rgba($song-light, 0.3) 100%);
  border-radius: $radius-lg;
  padding: $spacing-md;
  border: 1rpx solid rgba($song-primary, 0.12);
  box-shadow: $shadow-card;
  position: relative;
  overflow: hidden;

  // 装饰性背景图案
  &::before {
    content: '';
    position: absolute;
    top: -30rpx;
    right: -30rpx;
    width: 120rpx;
    height: 120rpx;
    background: radial-gradient(circle, rgba($accent, 0.15) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
}

.presets-scroll {
  width: calc(100% + 48rpx);
  margin-left: -24rpx;
  margin-right: -24rpx;
}

.presets-track {
  display: flex;
  gap: $spacing-sm;
  padding: $spacing-xs 24rpx;
  padding-right: 64rpx;
}

.preset-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 140rpx;
  padding: $spacing-md $spacing-sm;
  background: $bg-card;
  border-radius: $radius-lg;
  border: 2rpx solid $border-light;
  box-shadow: $shadow-sm;
  transition: all $duration-base $ease-bounce;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;

  // 悬浮光晕
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba($accent, 0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity $duration-fast;
  }

  &.selected {
    background: linear-gradient(145deg, rgba($accent, 0.08) 0%, rgba($accent, 0.15) 100%);
    border-color: $accent;
    box-shadow: 0 6rpx 20rpx rgba($accent, 0.25);
    transform: translateY(-4rpx);

    &::after {
      opacity: 1;
    }

    .preset-icon {
      transform: scale(1.15);
    }

    .preset-name {
      color: darken($accent, 10%);
      font-weight: $font-bold;
    }
  }

  &:active {
    transform: scale(0.95);
  }
}

.preset-icon {
  font-size: 44rpx;
  margin-bottom: $spacing-xs;
  transition: transform $duration-base $ease-bounce;
  filter: drop-shadow(0 2rpx 4rpx rgba(0,0,0,0.1));
}

.preset-name {
  font-size: $font-xs;
  color: $text-secondary;
  white-space: nowrap;
  font-weight: $font-medium;
  transition: all $duration-fast;
}

// ==========================================
// 人声类型 - 温暖渐变卡片
// ==========================================
// 人声专属色彩变量
$vocal-primary: #8B7EC8;  // 柔和紫罗兰
$vocal-secondary: #A896D3;

.vocal-type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-sm;
}

.vocal-type-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-md $spacing-xs;
  padding-top: 28rpx;
  background: $bg-card;
  border-radius: $radius-md;
  border: 2rpx solid $border-light;
  box-shadow: $shadow-sm;
  transition: all $duration-base $ease-bounce;
  overflow: hidden;

  // 顶部装饰条
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4rpx;
    background: linear-gradient(90deg, transparent, rgba($vocal-primary, 0.3), transparent);
    transition: all $duration-fast;
  }

  &.selected {
    background: linear-gradient(165deg, rgba($vocal-primary, 0.06) 0%, rgba($vocal-secondary, 0.12) 100%);
    border-color: $vocal-primary;
    box-shadow: 0 6rpx 20rpx rgba($vocal-primary, 0.2);

    &::before {
      background: linear-gradient(90deg, $vocal-primary, $vocal-secondary);
      height: 6rpx;
    }

    .vocal-icon {
      transform: scale(1.1);
    }

    .vocal-name {
      color: $vocal-primary;
      font-weight: $font-bold;
    }
  }

  &:active {
    transform: scale(0.96);
  }
}

.vocal-icon {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, rgba($vocal-primary, 0.1), rgba($vocal-secondary, 0.15));
  border-radius: 50%;
  font-size: 28rpx;
  margin-bottom: $spacing-xs;
  transition: transform $duration-base $ease-bounce;
}

.vocal-info {
  text-align: center;
}

.vocal-name {
  display: block;
  font-size: $font-sm;
  color: $text-primary;
  font-weight: $font-medium;
  margin-bottom: 4rpx;
  transition: all $duration-fast;
}

.vocal-desc {
  display: block;
  font-size: 20rpx;
  color: $text-tertiary;
  line-height: 1.4;
}

.vocal-check {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 32rpx;
  height: 32rpx;
  background: linear-gradient(135deg, $vocal-primary, $vocal-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18rpx;
  color: $text-white;
  font-weight: $font-bold;
  box-shadow: 0 2rpx 8rpx rgba($vocal-primary, 0.4);
  animation: popIn $duration-base $ease-bounce;
}

@keyframes popIn {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.section-title {
  font-size: $font-md;
  font-weight: $font-bold;
  color: $text-primary;
}

// ==========================================
// 音乐氛围 - 活力音波卡片 (8种氛围)
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
  border-radius: $radius-lg;
  border: 2rpx solid $border-light;
  overflow: hidden;
  transition: all $duration-base $ease-bounce;
  box-shadow: $shadow-sm;

  &.selected {
    border-color: $song-primary;
    box-shadow: 0 8rpx 28rpx rgba($song-primary, 0.25);

    .mood-visual {
      &::after {
        opacity: 1;
      }
    }

    .mood-bars .bar {
      animation: barBounce 0.6s ease-in-out infinite;
      opacity: 0.9;
    }

    .mood-icon {
      transform: scale(1.15);
    }

    .mood-name {
      color: $song-primary;
    }
  }

  &:active {
    transform: scale(0.97);
  }
}

.mood-visual {
  height: 110rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-md;
  position: relative;

  // 选中光晕效果
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 50%, rgba(255,255,255,0.4) 0%, transparent 60%);
    opacity: 0;
    transition: opacity $duration-fast;
    pointer-events: none;
  }

  // 8种氛围的独特渐变色
  &.cheerful {
    background: linear-gradient(135deg, rgba(255, 179, 71, 0.18) 0%, rgba(255, 123, 84, 0.15) 100%);
    .bar { background: #FF7B54; }
  }
  &.gentle {
    background: linear-gradient(135deg, rgba(127, 178, 133, 0.18) 0%, rgba(91, 164, 217, 0.15) 100%);
    .bar { background: #7FB285; }
  }
  &.playful {
    background: linear-gradient(135deg, rgba(102, 204, 153, 0.18) 0%, rgba(245, 166, 35, 0.15) 100%);
    .bar { background: #66CC99; }
  }
  &.lullaby {
    background: linear-gradient(135deg, rgba(91, 164, 217, 0.18) 0%, rgba(139, 92, 246, 0.15) 100%);
    .bar { background: #5BA4D9; }
  }
  &.educational {
    background: linear-gradient(135deg, rgba(245, 166, 35, 0.18) 0%, rgba(127, 178, 133, 0.15) 100%);
    .bar { background: #F5A623; }
  }
  &.rhythmic {
    background: linear-gradient(135deg, rgba(255, 123, 84, 0.18) 0%, rgba(255, 99, 132, 0.15) 100%);
    .bar { background: #FF6384; }
  }
  &.soothing {
    background: linear-gradient(135deg, rgba(139, 126, 200, 0.18) 0%, rgba(168, 150, 211, 0.15) 100%);
    .bar { background: #8B7EC8; }
  }
  &.festive {
    background: linear-gradient(135deg, rgba(255, 99, 132, 0.18) 0%, rgba(245, 166, 35, 0.15) 100%);
    .bar { background: #FF6384; }
  }
}

.mood-icon {
  font-size: 44rpx;
  transition: transform $duration-base $ease-bounce;
  filter: drop-shadow(0 2rpx 4rpx rgba(0,0,0,0.08));
}

.mood-bars {
  display: flex;
  gap: 5rpx;
  align-items: flex-end;
  height: 44rpx;
}

.bar {
  width: 7rpx;
  background: $song-primary;
  border-radius: 4rpx;
  opacity: 0.5;

  &:nth-child(1) { height: 18rpx; animation-delay: 0s; }
  &:nth-child(2) { height: 30rpx; animation-delay: 0.1s; }
  &:nth-child(3) { height: 22rpx; animation-delay: 0.2s; }
  &:nth-child(4) { height: 36rpx; animation-delay: 0.3s; }
  &:nth-child(5) { height: 26rpx; animation-delay: 0.4s; }
}

@keyframes barBounce {
  0%, 100% { transform: scaleY(0.5); opacity: 0.4; }
  50% { transform: scaleY(1); opacity: 1; }
}

.mood-info {
  padding: $spacing-sm $spacing-xs;
  text-align: center;
  background: linear-gradient(180deg, transparent 0%, rgba($bg-soft, 0.5) 100%);
}

.mood-name {
  display: block;
  font-size: $font-sm;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: 4rpx;
  transition: color $duration-fast;
}

.mood-desc {
  display: block;
  font-size: $font-xs;
  color: $text-tertiary;
  line-height: 1.3;
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
// 角色选择 - Happy Stage 设计 (温暖花园主题)
// ==========================================
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
      background: rgba($song-primary, 0.15);
      border-color: $song-primary;
      box-shadow: 0 8rpx 24rpx rgba($song-primary, 0.25);
    }
    .char-emoji {
      animation: char-bounce-song 0.5s $ease-bounce;
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
      color: $song-primary;
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
  width: 110rpx;
  height: 110rpx;
  background: radial-gradient(circle, rgba($song-primary, 0.15) 0%, transparent 70%);
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
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: $bg-card;
  border: 3rpx solid $border-light;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $duration-base $ease-bounce;
  box-shadow: $shadow-sm;
}

.char-emoji {
  font-size: 40rpx;
  transition: transform $duration-base;
}

// 选中星星徽章 - 弹出动画
.char-star {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  font-size: 26rpx;
  opacity: 0;
  transform: scale(0) rotate(-180deg);
  transition: all 0.35s $ease-bounce;
  filter: drop-shadow(0 2rpx 4rpx rgba($accent, 0.4));
  z-index: 3;
}

// 彩色舞台底座
.char-stage {
  width: 72rpx;
  height: 8rpx;
  background: linear-gradient(90deg, transparent, $song-primary, transparent);
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
@keyframes char-bounce-song {
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-12rpx); }
  50% { transform: translateY(-4rpx); }
  75% { transform: translateY(-8rpx); }
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
