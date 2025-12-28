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
        <!-- 步骤 1：选择灵感 -->
        <div v-if="createStore.currentStep === 1">
          <h2 class="text-xl font-bold text-gray-800 mb-6">选择儿歌主题</h2>
          <ThemeSelector
            :themes="createStore.themes"
            :selected-category="createStore.nurseryRhymeParams.themeCategory"
            :selected-topic="createStore.nurseryRhymeParams.themeTopic"
            @update:selected-category="createStore.nurseryRhymeParams.themeCategory = $event"
            @update:selected-topic="createStore.nurseryRhymeParams.themeTopic = $event"
          />
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
        </div>

        <!-- 步骤 3：生成中 -->
        <div v-else-if="createStore.currentStep === 3">
          <div class="text-center py-12">
            <div class="text-6xl mb-4 animate-bounce">🎶</div>
            <p class="text-gray-500">AI 正在创作专属儿歌...</p>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            v-if="createStore.currentStep > 1 && createStore.currentStep < 3"
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

const router = useRouter()
const childStore = useChildStore()
const createStore = useCreateStore()

const steps = ['选择灵感', '音乐参数', '生成中']

const vocalTypes = [
  { id: 'soft_female', name: '温柔女声', icon: '👩' },
  { id: 'warm_male', name: '温暖男声', icon: '👨' },
  { id: 'child', name: '童声', icon: '👧' },
  { id: 'chorus', name: '合唱', icon: '👥' },
  { id: 'duet', name: '对唱', icon: '👫' },
  { id: 'instrumental', name: '纯音乐', icon: '🎹' }
]

const canNextStep = computed(() => {
  return !!createStore.nurseryRhymeParams.themeCategory && !!createStore.nurseryRhymeParams.themeTopic
})

function prevStep() {
  if (createStore.currentStep > 1) {
    createStore.currentStep--
  }
}

function nextStep() {
  createStore.currentStep++
}

async function startGenerate() {
  createStore.currentStep = 3
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
