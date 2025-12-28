<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- 返回按钮 -->
      <router-link
        to="/create"
        class="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6"
      >
        <span class="mr-2">←</span>
        返回创作中心
      </router-link>

      <!-- 标题 -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
          🎬 视频创作
        </h1>
        <p class="text-gray-500">为 {{ childStore.currentChild?.name || '宝贝' }} 创作专属动画视频</p>
      </div>

      <!-- 步骤指示器 -->
      <StepIndicator :steps="steps" :current-step="createStore.currentStep" />

      <!-- 步骤内容 -->
      <div class="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl">
        <!-- 步骤 1：输入描述 -->
        <div v-if="createStore.currentStep === 1">
          <h2 class="text-xl font-bold text-gray-800 mb-6">描述你想要的视频</h2>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              视频场景描述
            </label>
            <textarea
              v-model="createStore.videoParams.customPrompt"
              rows="4"
              class="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="例如：小兔子在花园里追蝴蝶，阳光明媚，花朵绽放..."
            />
            <p class="text-xs text-gray-500 mt-2">
              描述越详细，生成的视频越符合预期
            </p>
          </div>

          <!-- 灵感提示 -->
          <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4">
            <h3 class="text-sm font-medium text-gray-700 mb-3">💡 灵感提示</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="prompt in inspirationPrompts"
                :key="prompt"
                class="px-3 py-1.5 bg-white rounded-full text-sm text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                @click="createStore.videoParams.customPrompt = prompt"
              >
                {{ prompt }}
              </button>
            </div>
          </div>
        </div>

        <!-- 步骤 2：视频参数 -->
        <div v-else-if="createStore.currentStep === 2">
          <h2 class="text-xl font-bold text-gray-800 mb-6">设置视频参数</h2>

          <!-- 画面比例 -->
          <div class="mb-8">
            <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <span class="mr-2">📐</span>
              画面比例
            </h3>
            <div class="grid grid-cols-5 gap-3">
              <div
                v-for="ratio in aspectRatios"
                :key="ratio.id"
                class="p-4 rounded-2xl cursor-pointer transition-all text-center"
                :class="createStore.videoParams.aspectRatio === ratio.id
                  ? 'bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-400'
                  : 'bg-white/80 border border-gray-200 hover:shadow-sm'"
                @click="createStore.videoParams.aspectRatio = ratio.id"
              >
                <div class="flex justify-center mb-2">
                  <div
                    class="bg-gray-300 rounded"
                    :style="{ width: ratio.previewW + 'px', height: ratio.previewH + 'px' }"
                  />
                </div>
                <p class="text-sm font-medium text-gray-800">{{ ratio.label }}</p>
              </div>
            </div>
          </div>

          <!-- 视频时长 -->
          <div class="mb-8">
            <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <span class="mr-2">⏱️</span>
              视频时长
            </h3>
            <div class="grid grid-cols-4 gap-3">
              <div
                v-for="duration in [4, 5, 6, 8]"
                :key="duration"
                class="p-3 rounded-2xl cursor-pointer transition-all text-center"
                :class="createStore.videoParams.durationSeconds === duration
                  ? 'bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-400'
                  : 'bg-white/80 border border-gray-200 hover:shadow-sm'"
                @click="createStore.videoParams.durationSeconds = duration as 4 | 5 | 6 | 8"
              >
                <p class="font-medium text-gray-800">{{ duration }}秒</p>
              </div>
            </div>
          </div>

          <!-- 运动风格 -->
          <div class="mb-8">
            <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <span class="mr-2">🎥</span>
              运动风格
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div
                v-for="motion in motionModes"
                :key="motion.id"
                class="p-4 rounded-2xl cursor-pointer transition-all text-center"
                :class="createStore.videoParams.motionMode === motion.id
                  ? 'bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-400'
                  : 'bg-white/80 border border-gray-200 hover:shadow-sm'"
                @click="createStore.videoParams.motionMode = motion.id"
              >
                <span class="text-2xl">{{ motion.icon }}</span>
                <p class="font-medium text-gray-800 mt-2">{{ motion.name }}</p>
              </div>
            </div>
          </div>

          <!-- 艺术风格 -->
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <span class="mr-2">🎨</span>
              艺术风格
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div
                v-for="style in createStore.styleOptions?.art_styles?.slice(0, 5) || []"
                :key="style.id"
                class="p-4 rounded-2xl cursor-pointer transition-all text-center"
                :class="createStore.videoParams.artStyle === style.id
                  ? 'bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-400'
                  : 'bg-white/80 border border-gray-200 hover:shadow-sm'"
                @click="createStore.videoParams.artStyle = style.id"
              >
                <p class="font-medium text-gray-800">{{ style.name }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤 3：生成中 -->
        <div v-else-if="createStore.currentStep === 3">
          <div class="text-center py-12">
            <div class="text-6xl mb-4 animate-bounce">🎬</div>
            <p class="text-gray-500">AI 正在创作专属视频...</p>
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
            :disabled="!createStore.videoParams.customPrompt.trim()"
            class="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            @click="nextStep"
          >
            下一步 →
          </button>
          <button
            v-else-if="createStore.currentStep === 2"
            class="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all"
            @click="startGenerate"
          >
            🎬 开始创作
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
      content-type="video"
      @play="handlePlay"
      @close="handleClose"
      @retry="startGenerate"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChildStore } from '@/stores/child'
import { useCreateStore } from '@/stores/create'
import StepIndicator from '@/components/create/StepIndicator.vue'
import GeneratingModal from '@/components/create/GeneratingModal.vue'

const router = useRouter()
const childStore = useChildStore()
const createStore = useCreateStore()

const steps = ['输入描述', '视频参数', '生成中']

const inspirationPrompts = [
  '小兔子在花园里追蝴蝶',
  '小熊在森林里采蘑菇',
  '小猫咪在阳光下打盹',
  '小狗狗在海边玩球',
  '小动物们一起野餐'
]

const aspectRatios = [
  { id: '16:9', label: '横屏', previewW: 32, previewH: 18 },
  { id: '9:16', label: '竖屏', previewW: 18, previewH: 32 },
  { id: '4:3', label: '4:3', previewW: 28, previewH: 21 },
  { id: '3:4', label: '3:4', previewW: 21, previewH: 28 },
  { id: '1:1', label: '方形', previewW: 24, previewH: 24 }
] as const

const motionModes = [
  { id: 'static', name: '静态', icon: '🖼️' },
  { id: 'slow', name: '缓慢', icon: '🐢' },
  { id: 'normal', name: '正常', icon: '🚶' },
  { id: 'dynamic', name: '活泼', icon: '🏃' },
  { id: 'cinematic', name: '电影感', icon: '🎬' }
] as const

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
    await createStore.generateVideo()
  } catch (e) {
    console.error('生成视频失败:', e)
  }
}

function handlePlay() {
  if (createStore.generatedContentId) {
    router.push(`/play/video/${createStore.generatedContentId}`)
  }
}

function handleClose() {
  createStore.resetParams('video')
}

onMounted(async () => {
  createStore.resetParams('video')
  await createStore.loadOptions()
})

onUnmounted(() => {
  createStore.stopPolling()
})
</script>
