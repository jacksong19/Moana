<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- 返回按钮 -->
      <router-link
        to="/create"
        class="inline-flex items-center text-gray-500 hover:text-amber-600 mb-6"
      >
        <span class="mr-2">←</span>
        返回创作中心
      </router-link>

      <!-- 标题 -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
          智能创作
        </h1>
        <p class="text-gray-500">告诉 AI 你的想法，智能生成创意内容</p>
      </div>

      <!-- 步骤指示器 -->
      <div class="flex justify-center mb-8">
        <div class="flex items-center space-x-4">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="flex items-center"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all"
              :class="currentStep > index + 1
                ? 'bg-amber-500 text-white'
                : currentStep === index + 1
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-500'"
            >
              <span v-if="currentStep > index + 1">✓</span>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <span
              class="ml-2 text-sm hidden sm:inline"
              :class="currentStep === index + 1 ? 'text-amber-600 font-medium' : 'text-gray-400'"
            >
              {{ step }}
            </span>
            <div
              v-if="index < steps.length - 1"
              class="w-8 sm:w-12 h-0.5 mx-2"
              :class="currentStep > index + 1 ? 'bg-amber-500' : 'bg-gray-200'"
            />
          </div>
        </div>
      </div>

      <!-- 主要内容 -->
      <div class="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl">
        <!-- 步骤 1：输入创意描述 -->
        <div v-if="currentStep === 1">
          <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <span class="mr-2">💭</span>
            描述你的创意
          </h2>

          <textarea
            v-model="customPrompt"
            rows="4"
            class="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-lg"
            placeholder="例如：一个关于小熊学会分享的故事..."
          />
          <div class="text-right text-sm text-gray-400 mt-2">
            {{ customPrompt.length }}/200
          </div>

          <!-- 灵感标签 -->
          <div class="mt-6">
            <h3 class="text-sm font-medium text-gray-700 mb-3">快速灵感</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="tag in inspirationTags"
                :key="tag.text"
                class="px-4 py-2 rounded-full text-sm border transition-all hover:shadow-md"
                :class="customPrompt === tag.prompt
                  ? 'bg-amber-100 border-amber-300 text-amber-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-amber-200'"
                @click="customPrompt = tag.prompt"
              >
                {{ tag.icon }} {{ tag.text }}
              </button>
            </div>
          </div>

          <!-- 灵感卡片 -->
          <div class="mt-8">
            <h3 class="text-sm font-medium text-gray-700 mb-3">故事灵感</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                v-for="inspiration in inspirations"
                :key="inspiration.title"
                class="p-4 bg-gradient-to-br from-white to-amber-50 rounded-2xl border border-amber-100 cursor-pointer hover:shadow-md transition-all"
                :class="customPrompt === inspiration.prompt ? 'ring-2 ring-amber-400' : ''"
                @click="customPrompt = inspiration.prompt"
              >
                <div class="flex items-start">
                  <span class="text-2xl mr-3">{{ inspiration.icon }}</span>
                  <div>
                    <h4 class="font-medium text-gray-800">{{ inspiration.title }}</h4>
                    <p class="text-sm text-gray-500 mt-1">{{ inspiration.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤 2：选择内容类型 -->
        <div v-else-if="currentStep === 2">
          <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <span class="mr-2">🎯</span>
            选择创作类型
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              v-for="type in contentTypes"
              :key="type.id"
              class="p-6 rounded-2xl transition-all text-left"
              :class="selectedContentType === type.id
                ? `${type.selectedClass} scale-105 shadow-xl`
                : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'"
              @click="selectedContentType = type.id as 'picture_book' | 'nursery_rhyme' | 'video'"
            >
              <div class="text-4xl mb-3">{{ type.icon }}</div>
              <h3
                class="font-bold text-lg mb-1"
                :class="selectedContentType === type.id ? 'text-white' : 'text-gray-800'"
              >
                {{ type.name }}
              </h3>
              <p
                class="text-sm"
                :class="selectedContentType === type.id ? 'text-white/80' : 'text-gray-500'"
              >
                {{ type.description }}
              </p>
            </button>
          </div>

          <!-- 预览已输入的描述 -->
          <div class="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <div class="flex items-start">
              <span class="text-xl mr-3">💭</span>
              <div>
                <p class="text-sm text-amber-600 mb-1">创意描述</p>
                <p class="text-gray-800">{{ customPrompt }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤 3：高级设置 -->
        <div v-else-if="currentStep === 3">
          <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <span class="mr-2">⚙️</span>
            创作设置
          </h2>

          <!-- 绘本设置 -->
          <div v-if="selectedContentType === 'picture_book'" class="space-y-6">
            <!-- 艺术风格 -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-3">艺术风格</h3>
              <div class="grid grid-cols-3 sm:grid-cols-5 gap-3">
                <button
                  v-for="style in artStyleOptions"
                  :key="style.id"
                  class="p-3 rounded-xl text-center border transition-all"
                  :class="pictureBookSettings.artStyle === style.id
                    ? 'bg-purple-100 border-purple-300 text-purple-700'
                    : 'bg-white border-gray-200 hover:border-purple-200'"
                  @click="pictureBookSettings.artStyle = style.id"
                >
                  <div class="text-2xl mb-1">{{ style.icon }}</div>
                  <div class="text-xs">{{ style.name }}</div>
                </button>
              </div>
            </div>

            <!-- 故事主角 -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-3">故事主角</h3>
              <div class="grid grid-cols-3 sm:grid-cols-6 gap-3">
                <button
                  v-for="p in protagonistOptions"
                  :key="p.animal"
                  class="p-3 rounded-xl text-center border transition-all"
                  :class="pictureBookSettings.protagonist === p.animal
                    ? 'bg-purple-100 border-purple-300 text-purple-700'
                    : 'bg-white border-gray-200 hover:border-purple-200'"
                  @click="pictureBookSettings.protagonist = p.animal"
                >
                  <div class="text-2xl mb-1">{{ p.emoji }}</div>
                  <div class="text-xs">{{ p.name }}</div>
                </button>
              </div>
            </div>

            <!-- 配音音色 -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-3">配音音色</h3>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  v-for="voice in voiceOptions"
                  :key="voice.id"
                  class="p-3 rounded-xl text-center border transition-all"
                  :class="pictureBookSettings.voiceId === voice.id
                    ? 'bg-purple-100 border-purple-300 text-purple-700'
                    : 'bg-white border-gray-200 hover:border-purple-200'"
                  @click="pictureBookSettings.voiceId = voice.id"
                >
                  <div class="text-lg mb-1">{{ voice.icon }}</div>
                  <div class="text-xs">{{ voice.name }}</div>
                </button>
              </div>
            </div>
          </div>

          <!-- 儿歌设置 -->
          <div v-else-if="selectedContentType === 'nursery_rhyme'" class="space-y-6">
            <!-- 音乐风格 -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-3">音乐风格</h3>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  v-for="mood in musicMoodOptions"
                  :key="mood.id"
                  class="p-3 rounded-xl text-center border transition-all"
                  :class="nurseryRhymeSettings.musicMood === mood.id
                    ? 'bg-pink-100 border-pink-300 text-pink-700'
                    : 'bg-white border-gray-200 hover:border-pink-200'"
                  @click="nurseryRhymeSettings.musicMood = mood.id"
                >
                  <div class="text-2xl mb-1">{{ mood.icon }}</div>
                  <div class="text-xs">{{ mood.name }}</div>
                </button>
              </div>
            </div>

            <!-- 人声类型 -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-3">人声类型</h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  v-for="vocal in vocalTypeOptions"
                  :key="vocal.id"
                  class="p-3 rounded-xl text-center border transition-all"
                  :class="nurseryRhymeSettings.vocalType === vocal.id
                    ? 'bg-pink-100 border-pink-300 text-pink-700'
                    : 'bg-white border-gray-200 hover:border-pink-200'"
                  @click="nurseryRhymeSettings.vocalType = vocal.id"
                >
                  <div class="text-lg mb-1">{{ vocal.icon }}</div>
                  <div class="text-xs">{{ vocal.name }}</div>
                </button>
              </div>
            </div>

            <!-- 时长 -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-3">歌曲时长</h3>
              <div class="flex gap-3">
                <button
                  v-for="dur in durationOptions"
                  :key="dur.value"
                  class="px-4 py-2 rounded-xl border transition-all"
                  :class="nurseryRhymeSettings.duration === dur.value
                    ? 'bg-pink-100 border-pink-300 text-pink-700'
                    : 'bg-white border-gray-200 hover:border-pink-200'"
                  @click="nurseryRhymeSettings.duration = dur.value"
                >
                  {{ dur.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- 视频设置 -->
          <div v-else-if="selectedContentType === 'video'" class="space-y-6">
            <!-- 画面比例 -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-3">画面比例</h3>
              <div class="flex gap-3">
                <button
                  v-for="ratio in aspectRatioOptions"
                  :key="ratio.value"
                  class="px-4 py-3 rounded-xl border transition-all flex items-center"
                  :class="videoSettings.aspectRatio === ratio.value
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-200 hover:border-blue-200'"
                  @click="videoSettings.aspectRatio = ratio.value as '16:9' | '9:16'"
                >
                  <span class="mr-2">{{ ratio.icon }}</span>
                  {{ ratio.label }}
                </button>
              </div>
            </div>

            <!-- 运动模式 -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-3">运动模式</h3>
              <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <button
                  v-for="mode in motionModeOptions"
                  :key="mode.id"
                  class="p-3 rounded-xl text-center border transition-all"
                  :class="videoSettings.motionMode === mode.id
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-200 hover:border-blue-200'"
                  @click="videoSettings.motionMode = mode.id"
                >
                  <div class="text-lg mb-1">{{ mode.icon }}</div>
                  <div class="text-xs">{{ mode.name }}</div>
                </button>
              </div>
            </div>

            <!-- 视频时长 -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-3">视频时长</h3>
              <div class="flex gap-3">
                <button
                  v-for="dur in videoDurationOptions"
                  :key="dur.value"
                  class="px-4 py-2 rounded-xl border transition-all"
                  :class="videoSettings.duration === dur.value
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-200 hover:border-blue-200'"
                  @click="videoSettings.duration = dur.value"
                >
                  {{ dur.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- 确认信息 -->
          <div class="mt-8 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
            <h3 class="font-medium text-gray-800 mb-3 flex items-center">
              <span class="mr-2">📋</span>
              创作确认
            </h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">宝贝名字</span>
                <span class="text-gray-800">{{ childStore.currentChild?.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">内容类型</span>
                <span class="text-gray-800">{{ selectedContentTypeName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">创意描述</span>
                <span class="text-gray-800 text-right max-w-[60%] truncate">{{ customPrompt }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            v-if="currentStep > 1"
            class="px-6 py-3 text-gray-600 hover:text-gray-800"
            @click="prevStep"
          >
            ← 上一步
          </button>
          <div v-else />

          <button
            v-if="currentStep < 3"
            :disabled="!canNextStep"
            class="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            @click="nextStep"
          >
            下一步 →
          </button>
          <button
            v-else
            :disabled="isGenerating"
            class="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 transition-all flex items-center"
            @click="startGenerate"
          >
            <span v-if="isGenerating" class="animate-spin mr-2">⏳</span>
            <span>✨ 开始创作</span>
          </button>
        </div>
      </div>

      <!-- 提示说明 -->
      <div class="mt-8 p-4 bg-white/60 rounded-2xl text-center text-sm text-gray-500">
        <p>智能创作会根据你的描述自动优化生成参数，打造最佳效果</p>
      </div>
    </div>

    <!-- 生成弹窗 -->
    <GeneratingModal
      :visible="createStore.isGenerating || createStore.generatingStatus === 'completed' || createStore.generatingStatus === 'failed'"
      :status="createStore.generatingStatus"
      :progress="createStore.generatingProgress"
      :stage="createStore.generatingStage"
      :error="createStore.generatingError"
      :content-type="selectedContentType"
      @play="handlePlay"
      @close="handleClose"
      @retry="startGenerate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChildStore } from '@/stores/child'
import { useCreateStore } from '@/stores/create'
import GeneratingModal from '@/components/create/GeneratingModal.vue'
import type { ProtagonistAnimal } from '@/api/create'

const router = useRouter()
const childStore = useChildStore()
const createStore = useCreateStore()

const steps = ['描述创意', '选择类型', '设置确认']
const currentStep = ref(1)
const customPrompt = ref('')
const selectedContentType = ref<'picture_book' | 'nursery_rhyme' | 'video'>('picture_book')

// 灵感标签
const inspirationTags = [
  { icon: '🦷', text: '刷牙', prompt: '小动物学习刷牙的有趣故事' },
  { icon: '🥬', text: '吃蔬菜', prompt: '不爱吃蔬菜的小朋友学会爱上蔬菜' },
  { icon: '😴', text: '睡觉', prompt: '帮助宝宝安心入睡的温馨故事' },
  { icon: '🤝', text: '分享', prompt: '学会和朋友分享的快乐故事' },
  { icon: '💪', text: '勇敢', prompt: '克服恐惧变得勇敢的冒险故事' },
  { icon: '🎨', text: '创造', prompt: '发挥想象力创造美好事物的故事' }
]

// 故事灵感
const inspirations = [
  {
    icon: '🌟',
    title: '勇气与冒险',
    description: '小动物克服恐惧，勇敢探索新世界',
    prompt: '一只害羞的小兔子，鼓起勇气独自去森林探险，遇到了很多新朋友'
  },
  {
    icon: '💖',
    title: '友谊与分享',
    description: '学会分享，收获更多快乐',
    prompt: '小熊有一个漂亮的气球，一开始不想分享，后来学会了和朋友一起玩更开心'
  },
  {
    icon: '🌈',
    title: '认识自己',
    description: '发现自己的独特之处',
    prompt: '一只觉得自己很普通的小毛毛虫，后来发现自己可以变成美丽的蝴蝶'
  },
  {
    icon: '🏠',
    title: '家庭温暖',
    description: '感受家人的爱与陪伴',
    prompt: '小猫咪出去玩迷路了，在家人的帮助下找到回家的路，感受到家的温暖'
  }
]

// 内容类型
const contentTypes = [
  {
    id: 'picture_book',
    icon: '📖',
    name: '绘本',
    description: 'AI 生成精美插画故事书',
    selectedClass: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
  },
  {
    id: 'nursery_rhyme',
    icon: '🎵',
    name: '儿歌',
    description: 'AI 作曲演唱专属音乐',
    selectedClass: 'bg-gradient-to-br from-pink-500 to-rose-500 text-white'
  },
  {
    id: 'video',
    icon: '🎬',
    name: '视频',
    description: 'AI 生成精彩动画视频',
    selectedClass: 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
  }
]

// 绘本设置
const pictureBookSettings = ref({
  artStyle: 'pixar_3d',
  protagonist: 'bunny',
  voiceId: 'Cherry'
})

const artStyleOptions = [
  { id: 'pixar_3d', icon: '🎬', name: '3D动画' },
  { id: 'watercolor', icon: '🎨', name: '水彩' },
  { id: 'anime', icon: '✨', name: '动漫' },
  { id: 'oil_painting', icon: '🖼️', name: '油画' },
  { id: 'paper_cut', icon: '✂️', name: '剪纸' }
]

const protagonistOptions = [
  { animal: 'bunny', emoji: '🐰', name: '小兔子' },
  { animal: 'bear', emoji: '🐻', name: '小熊' },
  { animal: 'cat', emoji: '🐱', name: '小猫咪' },
  { animal: 'dog', emoji: '🐶', name: '小狗狗' },
  { animal: 'fox', emoji: '🦊', name: '小狐狸' },
  { animal: 'elephant', emoji: '🐘', name: '小象' }
]

const voiceOptions = [
  { id: 'Cherry', icon: '👩', name: '温柔女声' },
  { id: 'Ethan', icon: '👨', name: '温暖男声' },
  { id: 'Serena', icon: '👧', name: '活泼童声' },
  { id: 'Bryan', icon: '👴', name: '故事爷爷' }
]

// 儿歌设置
const nurseryRhymeSettings = ref({
  musicMood: 'cheerful',
  vocalType: 'soft_female',
  duration: 60
})

const musicMoodOptions = [
  { id: 'cheerful', icon: '😄', name: '欢乐活泼' },
  { id: 'gentle', icon: '😊', name: '温柔舒缓' },
  { id: 'playful', icon: '🤪', name: '俏皮可爱' },
  { id: 'dreamy', icon: '🌙', name: '梦幻安静' }
]

const vocalTypeOptions = [
  { id: 'soft_female', icon: '👩‍🎤', name: '甜美女声' },
  { id: 'warm_male', icon: '👨‍🎤', name: '温暖男声' },
  { id: 'child', icon: '🧒', name: '童声' },
  { id: 'chorus', icon: '👥', name: '欢乐合唱' },
  { id: 'duet', icon: '👫', name: '亲子对唱' },
  { id: 'instrumental', icon: '🎹', name: '纯音乐' }
]

const durationOptions = [
  { value: 30, label: '30秒' },
  { value: 60, label: '1分钟' },
  { value: 90, label: '1.5分钟' },
  { value: 120, label: '2分钟' }
]

// 视频设置
const videoSettings = ref({
  aspectRatio: '16:9' as '16:9' | '9:16',
  motionMode: 'normal',
  duration: 5
})

const aspectRatioOptions = [
  { value: '16:9', icon: '📺', label: '横屏 16:9' },
  { value: '9:16', icon: '📱', label: '竖屏 9:16' }
]

const motionModeOptions = [
  { id: 'static', icon: '🖼️', name: '静态' },
  { id: 'slow', icon: '🐢', name: '缓慢' },
  { id: 'normal', icon: '🚶', name: '正常' },
  { id: 'dynamic', icon: '🏃', name: '动感' },
  { id: 'cinematic', icon: '🎬', name: '电影' }
]

const videoDurationOptions = [
  { value: 4, label: '4秒' },
  { value: 5, label: '5秒' },
  { value: 6, label: '6秒' },
  { value: 8, label: '8秒' }
]

// 计算属性
const canNextStep = computed(() => {
  if (currentStep.value === 1) {
    return customPrompt.value.trim().length > 0
  }
  if (currentStep.value === 2) {
    return !!selectedContentType.value
  }
  return true
})

const selectedContentTypeName = computed(() => {
  const type = contentTypes.find(t => t.id === selectedContentType.value)
  return type?.name || ''
})

const isGenerating = computed(() => createStore.isGenerating)

// 方法
function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function nextStep() {
  if (currentStep.value < 3 && canNextStep.value) {
    currentStep.value++
  }
}

async function startGenerate() {
  try {
    if (selectedContentType.value === 'picture_book') {
      // 设置绘本参数
      createStore.pictureBookParams.themeCategory = 'custom'
      createStore.pictureBookParams.themeTopic = 'smart_creation'
      createStore.pictureBookParams.customPrompt = customPrompt.value
      createStore.pictureBookParams.artStyle = pictureBookSettings.value.artStyle
      createStore.pictureBookParams.protagonist = {
        animal: pictureBookSettings.value.protagonist as ProtagonistAnimal,
        color: 'default',
        accessory: 'default'
      }
      createStore.pictureBookParams.voiceId = pictureBookSettings.value.voiceId
      createStore.pictureBookParams.creationMode = 'smart'

      await createStore.generatePictureBook()
    } else if (selectedContentType.value === 'nursery_rhyme') {
      // 设置儿歌参数
      createStore.nurseryRhymeParams.themeCategory = 'custom'
      createStore.nurseryRhymeParams.themeTopic = 'smart_creation'
      createStore.nurseryRhymeParams.customPrompt = customPrompt.value
      createStore.nurseryRhymeParams.musicMood = nurseryRhymeSettings.value.musicMood
      createStore.nurseryRhymeParams.vocalType = nurseryRhymeSettings.value.vocalType
      createStore.nurseryRhymeParams.durationPreference = nurseryRhymeSettings.value.duration
      createStore.nurseryRhymeParams.creationMode = 'smart'

      await createStore.generateNurseryRhyme()
    } else if (selectedContentType.value === 'video') {
      // 设置视频参数
      createStore.videoParams.customPrompt = customPrompt.value
      createStore.videoParams.aspectRatio = videoSettings.value.aspectRatio
      createStore.videoParams.motionMode = videoSettings.value.motionMode as any
      createStore.videoParams.durationSeconds = videoSettings.value.duration as any
      createStore.videoParams.creationMode = 'standalone'

      await createStore.generateVideo()
    }
  } catch (e) {
    console.error('生成失败:', e)
  }
}

function handlePlay() {
  if (createStore.generatedContentId) {
    router.push(`/play/${selectedContentType.value}/${createStore.generatedContentId}`)
  }
}

function handleClose() {
  createStore.resetParams(selectedContentType.value)
  currentStep.value = 1
  customPrompt.value = ''
}

// 生命周期
onMounted(async () => {
  await createStore.loadOptions()
})

onUnmounted(() => {
  createStore.stopPolling()
})
</script>
