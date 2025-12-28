<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- 返回按钮 -->
      <router-link
        to="/create"
        class="inline-flex items-center text-gray-500 hover:text-pink-600 mb-6"
      >
        <span class="mr-2">←</span>
        返回创作中心
      </router-link>

      <!-- 标题 -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
          🎵 儿歌创作
        </h1>
        <p class="text-gray-500">为 {{ childStore.currentChild?.name || '宝贝' }} 创作专属音乐</p>
      </div>

      <!-- 步骤指示器 -->
      <StepIndicator :steps="steps" :current-step="createStore.currentStep" />

      <!-- 步骤内容 -->
      <div class="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl">
        <!-- 步骤 1：选择主题或输入描述 -->
        <div v-if="createStore.currentStep === 1">
          <!-- 模式切换 -->
          <div class="flex gap-4 mb-6">
            <button
              class="flex-1 py-3 px-4 rounded-2xl border-2 transition-all text-center"
              :class="createStore.nurseryRhymeParams.creationMode === 'preset'
                ? 'border-pink-500 bg-pink-50 text-pink-700'
                : 'border-gray-200 text-gray-500 hover:border-pink-200'"
              @click="createStore.nurseryRhymeParams.creationMode = 'preset'"
            >
              <div class="text-lg mb-1">🎶</div>
              <div class="font-medium">预设主题</div>
              <div class="text-xs opacity-70">从精选主题中选择</div>
            </button>
            <button
              class="flex-1 py-3 px-4 rounded-2xl border-2 transition-all text-center"
              :class="createStore.nurseryRhymeParams.creationMode === 'smart'
                ? 'border-pink-500 bg-pink-50 text-pink-700'
                : 'border-gray-200 text-gray-500 hover:border-pink-200'"
              @click="createStore.nurseryRhymeParams.creationMode = 'smart'"
            >
              <div class="text-lg mb-1">✨</div>
              <div class="font-medium">智能创作</div>
              <div class="text-xs opacity-70">自由描述你的想法</div>
            </button>
          </div>

          <!-- 预设模式：主题选择 -->
          <div v-if="createStore.nurseryRhymeParams.creationMode === 'preset'">
            <h2 class="text-xl font-bold text-gray-800 mb-6">选择儿歌主题</h2>
            <ThemeSelector
              :themes="createStore.themes"
              :selected-category="createStore.nurseryRhymeParams.themeCategory"
              :selected-topic="createStore.nurseryRhymeParams.themeTopic"
              @update:selected-category="createStore.nurseryRhymeParams.themeCategory = $event"
              @update:selected-topic="createStore.nurseryRhymeParams.themeTopic = $event"
            />
          </div>

          <!-- 智能模式：自由描述 -->
          <div v-else>
            <h2 class="text-xl font-bold text-gray-800 mb-6">描述你的创意</h2>
            <textarea
              v-model="createStore.nurseryRhymeParams.customPrompt"
              rows="4"
              class="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-lg"
              placeholder="例如：一首关于刷牙的欢快儿歌..."
            />
            <div class="text-right text-sm text-gray-400 mt-2">
              {{ createStore.nurseryRhymeParams.customPrompt?.length || 0 }}/200
            </div>

            <!-- 灵感标签 -->
            <div class="mt-6">
              <h3 class="text-sm font-medium text-gray-700 mb-3">快速灵感</h3>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="tag in inspirationTags"
                  :key="tag.text"
                  class="px-4 py-2 rounded-full text-sm border transition-all hover:shadow-md"
                  :class="createStore.nurseryRhymeParams.customPrompt === tag.prompt
                    ? 'bg-pink-100 border-pink-300 text-pink-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-pink-200'"
                  @click="createStore.nurseryRhymeParams.customPrompt = tag.prompt"
                >
                  {{ tag.icon }} {{ tag.text }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤 2：音乐参数 -->
        <div v-else-if="createStore.currentStep === 2">
          <h2 class="text-xl font-bold text-gray-800 mb-6">选择音乐风格</h2>

          <!-- 音乐情绪 -->
          <div class="mb-8">
            <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <span class="mr-2">🎭</span>
              音乐情绪
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div
                v-for="mood in createStore.styleOptions?.music_moods || []"
                :key="mood.id"
                class="p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 text-center"
                :class="createStore.nurseryRhymeParams.musicMood === mood.id
                  ? 'bg-gradient-to-br from-pink-100 to-rose-100 border-2 border-pink-400 shadow-md'
                  : 'bg-white/80 border border-gray-200 hover:shadow-sm'"
                @click="createStore.nurseryRhymeParams.musicMood = mood.id"
              >
                <p class="font-medium text-gray-800">{{ mood.name }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ mood.description }}</p>
              </div>
            </div>
          </div>

          <!-- 节奏速度 -->
          <div class="mb-8">
            <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <span class="mr-2">⚡</span>
              节奏速度
            </h3>
            <div class="px-4">
              <input
                type="range"
                v-model.number="createStore.nurseryRhymeParams.tempo"
                min="60"
                max="180"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <div class="flex justify-between text-sm text-gray-500 mt-2">
                <span>慢速 60</span>
                <span class="font-medium text-pink-600">{{ createStore.nurseryRhymeParams.tempo }} BPM</span>
                <span>快速 180</span>
              </div>
            </div>
          </div>

          <!-- 歌曲时长 -->
          <div class="mb-8">
            <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <span class="mr-2">⏱️</span>
              歌曲时长
            </h3>
            <div class="grid grid-cols-4 gap-3">
              <div
                v-for="duration in [30, 60, 90, 120]"
                :key="duration"
                class="p-3 rounded-2xl cursor-pointer transition-all text-center"
                :class="createStore.nurseryRhymeParams.durationPreference === duration
                  ? 'bg-gradient-to-br from-pink-100 to-rose-100 border-2 border-pink-400'
                  : 'bg-white/80 border border-gray-200 hover:shadow-sm'"
                @click="createStore.nurseryRhymeParams.durationPreference = duration"
              >
                <p class="font-medium text-gray-800">{{ duration }}秒</p>
              </div>
            </div>
          </div>

          <!-- 人声类型 -->
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <span class="mr-2">🎤</span>
              人声类型
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div
                v-for="vocal in vocalTypes"
                :key="vocal.id"
                class="p-4 rounded-2xl cursor-pointer transition-all text-center"
                :class="createStore.nurseryRhymeParams.vocalType === vocal.id
                  ? 'bg-gradient-to-br from-pink-100 to-rose-100 border-2 border-pink-400'
                  : 'bg-white/80 border border-gray-200 hover:shadow-sm'"
                @click="createStore.nurseryRhymeParams.vocalType = vocal.id"
              >
                <span class="text-2xl">{{ vocal.icon }}</span>
                <p class="font-medium text-gray-800 mt-2">{{ vocal.name }}</p>
              </div>
            </div>
          </div>

          <!-- 高级设置 -->
          <NurseryRhymeAdvanced
            :params="advancedParams"
            @update="handleAdvancedUpdate"
            @update-array="handleAdvancedArrayUpdate"
          />
        </div>

        <!-- 步骤 3：确认创作 -->
        <div v-else-if="createStore.currentStep === 3">
          <h2 class="text-xl font-bold text-gray-800 mb-6">确认创作参数</h2>

          <div class="space-y-4">
            <!-- 基础信息 -->
            <div class="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4">
              <h3 class="font-medium text-gray-800 mb-3">🎵 基础信息</h3>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-500">创作模式：</span>
                  <span class="text-gray-800">
                    {{ createStore.nurseryRhymeParams.creationMode === 'preset' ? '🎶 预设主题' : '✨ 智能创作' }}
                  </span>
                </div>
                <div v-if="createStore.nurseryRhymeParams.creationMode === 'preset'">
                  <span class="text-gray-500">主题：</span>
                  <span class="text-gray-800">{{ selectedThemeName }}</span>
                </div>
                <div v-else class="col-span-2">
                  <span class="text-gray-500">创意描述：</span>
                  <span class="text-gray-800">{{ createStore.nurseryRhymeParams.customPrompt }}</span>
                </div>
                <div>
                  <span class="text-gray-500">情绪：</span>
                  <span class="text-gray-800">{{ selectedMoodName }}</span>
                </div>
                <div>
                  <span class="text-gray-500">节奏：</span>
                  <span class="text-gray-800">{{ createStore.nurseryRhymeParams.tempo }} BPM</span>
                </div>
                <div>
                  <span class="text-gray-500">时长：</span>
                  <span class="text-gray-800">{{ createStore.nurseryRhymeParams.durationPreference }}秒</span>
                </div>
                <div>
                  <span class="text-gray-500">人声：</span>
                  <span class="text-gray-800">{{ selectedVocalName }}</span>
                </div>
              </div>
            </div>

            <!-- 高级设置摘要 -->
            <div v-if="advancedSettingsTags.length > 0" class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4">
              <h3 class="font-medium text-gray-800 mb-3">⚙️ 高级设置</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in advancedSettingsTags"
                  :key="tag"
                  class="px-3 py-1 bg-white/80 rounded-full text-sm text-gray-700"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- 生成提示 -->
            <div class="bg-blue-50 rounded-2xl p-4">
              <p class="text-sm text-blue-700">
                <span class="font-medium">提示：</span>
                AI 将根据以上参数为您生成专属儿歌，生成过程约需 1-3 分钟，请耐心等待。
              </p>
            </div>
          </div>
        </div>

        <!-- 步骤 4：生成中 -->
        <div v-else-if="createStore.currentStep === 4">
          <div class="text-center py-12">
            <div class="text-6xl mb-4 animate-bounce">🎶</div>
            <p class="text-gray-500">AI 正在创作专属儿歌...</p>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            v-if="createStore.currentStep > 1 && createStore.currentStep < 4"
            class="px-6 py-3 text-gray-600 hover:text-gray-800"
            @click="prevStep"
          >
            ← 上一步
          </button>
          <div v-else />

          <button
            v-if="createStore.currentStep === 1"
            :disabled="!canNextStep"
            class="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            @click="nextStep"
          >
            下一步 →
          </button>
          <button
            v-else-if="createStore.currentStep === 2"
            class="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all"
            @click="nextStep"
          >
            下一步 →
          </button>
          <button
            v-else-if="createStore.currentStep === 3"
            class="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all"
            @click="startGenerate"
          >
            🎵 开始创作
          </button>
        </div>
      </div>
    </div>

    <!-- 生成弹窗 -->
    <GeneratingModal
      :visible="createStore.isGenerating || createStore.generatingStatus === 'completed' || createStore.generatingStatus === 'failed'"
      :status="createStore.generatingStatus"
      :progress="createStore.generatingProgress"
      :stage="createStore.generatingStage"
      :error="createStore.generatingError"
      content-type="nursery_rhyme"
      @play="handlePlay"
      @close="handleClose"
      @retry="startGenerate"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChildStore } from '@/stores/child'
import { useCreateStore } from '@/stores/create'
import StepIndicator from '@/components/create/StepIndicator.vue'
import ThemeSelector from '@/components/create/ThemeSelector.vue'
import GeneratingModal from '@/components/create/GeneratingModal.vue'
import NurseryRhymeAdvanced from '@/components/create/NurseryRhymeAdvanced.vue'

const router = useRouter()
const childStore = useChildStore()
const createStore = useCreateStore()

const steps = ['选择灵感', '音乐参数', '确认创作', '生成中']

const vocalTypes = [
  { id: 'soft_female', name: '温柔女声', icon: '👩' },
  { id: 'warm_male', name: '温暖男声', icon: '👨' },
  { id: 'child', name: '童声', icon: '👧' },
  { id: 'chorus', name: '合唱', icon: '👥' },
  { id: 'duet', name: '对唱', icon: '👫' },
  { id: 'instrumental', name: '纯音乐', icon: '🎹' }
]

// 高级参数映射
const advancedParams = computed(() => ({
  musicGenre: createStore.nurseryRhymeParams.musicGenre,
  energyLevel: createStore.nurseryRhymeParams.energyLevel,
  vocalRange: createStore.nurseryRhymeParams.vocalRange,
  vocalEmotion: createStore.nurseryRhymeParams.vocalEmotion,
  vocalStyle: createStore.nurseryRhymeParams.vocalStyle,
  instruments: createStore.nurseryRhymeParams.instruments,
  lyricComplexity: createStore.nurseryRhymeParams.lyricComplexity,
  repetitionLevel: createStore.nurseryRhymeParams.repetitionLevel,
  songStructure: createStore.nurseryRhymeParams.songStructure,
  actionTypes: createStore.nurseryRhymeParams.actionTypes,
  language: createStore.nurseryRhymeParams.language,
  culturalStyle: createStore.nurseryRhymeParams.culturalStyle,
  styleWeight: createStore.nurseryRhymeParams.styleWeight,
  creativity: createStore.nurseryRhymeParams.creativity
}))

// 显示名称计算
const selectedThemeName = computed(() => {
  if (!createStore.themes || !createStore.nurseryRhymeParams.themeCategory) return ''
  const category = createStore.themes[createStore.nurseryRhymeParams.themeCategory]
  const theme = category?.themes?.find(t => t.id === createStore.nurseryRhymeParams.themeTopic)
  return theme?.name || createStore.nurseryRhymeParams.themeTopic
})

const selectedMoodName = computed(() => {
  const mood = createStore.styleOptions?.music_moods?.find(
    m => m.id === createStore.nurseryRhymeParams.musicMood
  )
  return mood?.name || createStore.nurseryRhymeParams.musicMood
})

const selectedVocalName = computed(() => {
  const vocal = vocalTypes.find(v => v.id === createStore.nurseryRhymeParams.vocalType)
  return vocal?.name || createStore.nurseryRhymeParams.vocalType
})

// 高级设置标签
const advancedSettingsTags = computed(() => {
  const tags: string[] = []
  const params = createStore.nurseryRhymeParams

  // 音乐流派
  const genreMap: Record<string, string> = {
    nursery_folk: '民谣童谣',
    pop_kids: '流行童歌',
    classical_kids: '古典童乐',
    electronic_kids: '电子童趣',
    jazz_kids: '爵士童韵',
    world_music: '世界音乐'
  }
  if (params.musicGenre && genreMap[params.musicGenre]) {
    tags.push(genreMap[params.musicGenre])
  }

  // 音域
  const rangeMap: Record<string, string> = {
    soprano: '高音',
    mezzo: '中音',
    alto: '低音'
  }
  if (params.vocalRange && rangeMap[params.vocalRange]) {
    tags.push(rangeMap[params.vocalRange])
  }

  // 演唱技巧
  const styleMap: Record<string, string> = {
    clear: '清晰',
    breathy: '轻柔',
    vibrato: '颤音',
    whisper: '轻声'
  }
  if (params.vocalStyle && styleMap[params.vocalStyle]) {
    tags.push(styleMap[params.vocalStyle])
  }

  // 乐器
  if (params.instruments.length > 0) {
    tags.push(`${params.instruments.length}种乐器`)
  }

  // 歌曲结构
  const structureMap: Record<string, string> = {
    simple: 'A-A-A 简单重复',
    verse_chorus: 'A-B-A-B 主副歌',
    aaba: 'A-A-B-A 经典结构',
    through: 'A-B-C-D 通篇发展'
  }
  if (params.songStructure && structureMap[params.songStructure]) {
    tags.push(structureMap[params.songStructure])
  }

  // 动作指引
  const actionMap: Record<string, string> = {
    clap: '拍手',
    dance: '跳舞',
    finger: '手指游戏'
  }
  if (params.actionTypes && actionMap[params.actionTypes]) {
    tags.push(actionMap[params.actionTypes])
  }

  // 文化风格
  const cultureMap: Record<string, string> = {
    chinese_folk: '中国民谣',
    western_nursery: '西方童谣',
    japanese_style: '日式童歌',
    korean_style: '韩式童歌',
    modern_fusion: '现代融合'
  }
  if (params.culturalStyle && cultureMap[params.culturalStyle]) {
    tags.push(cultureMap[params.culturalStyle])
  }

  // 创意调节
  if (params.styleWeight !== 0.5) {
    tags.push(`风格权重${Math.round(params.styleWeight * 100)}%`)
  }
  if (params.creativity !== 0.5) {
    tags.push(`创意程度${Math.round(params.creativity * 100)}%`)
  }

  return tags
})

// 灵感标签（智能模式使用）
const inspirationTags = [
  { icon: '🦷', text: '刷牙', prompt: '一首关于刷牙的欢快儿歌，让宝宝爱上刷牙' },
  { icon: '🥬', text: '吃蔬菜', prompt: '一首关于吃蔬菜的儿歌，让宝宝不再挑食' },
  { icon: '😴', text: '睡觉', prompt: '一首温柔的摇篮曲，帮助宝宝安心入睡' },
  { icon: '🤝', text: '分享', prompt: '一首关于学会分享的儿歌' },
  { icon: '🌈', text: '色彩', prompt: '一首教宝宝认识颜色的儿歌' },
  { icon: '🔢', text: '数字', prompt: '一首教宝宝数数的儿歌' }
]

const canNextStep = computed(() => {
  if (createStore.nurseryRhymeParams.creationMode === 'preset') {
    return !!createStore.nurseryRhymeParams.themeCategory && !!createStore.nurseryRhymeParams.themeTopic
  } else {
    return !!createStore.nurseryRhymeParams.customPrompt?.trim()
  }
})

function handleAdvancedUpdate(key: string, value: any) {
  (createStore.nurseryRhymeParams as any)[key] = value
}

function handleAdvancedArrayUpdate(key: 'instruments', value: string[]) {
  createStore.nurseryRhymeParams[key] = value
}

function prevStep() {
  if (createStore.currentStep > 1) {
    createStore.currentStep--
  }
}

function nextStep() {
  createStore.currentStep++
}

async function startGenerate() {
  createStore.currentStep = 4
  try {
    await createStore.generateNurseryRhyme()
  } catch (e) {
    console.error('生成儿歌失败:', e)
  }
}

function handlePlay() {
  if (createStore.generatedContentId) {
    router.push(`/play/nursery_rhyme/${createStore.generatedContentId}`)
  }
}

function handleClose() {
  createStore.resetParams('nursery_rhyme')
}

onMounted(async () => {
  createStore.resetParams('nursery_rhyme')
  await createStore.loadOptions()
})

onUnmounted(() => {
  createStore.stopPolling()
})
</script>
