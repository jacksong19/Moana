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
        <!-- 步骤 1：选择模式 -->
        <div v-if="createStore.currentStep === 1">
          <h2 class="text-xl font-bold text-gray-800 mb-6">选择创作方式</h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- 独立创作 -->
            <div
              class="p-6 rounded-2xl cursor-pointer transition-all"
              :class="createStore.videoParams.creationMode === 'standalone'
                ? 'bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-400 shadow-md'
                : 'bg-white/80 border-2 border-gray-200 hover:border-blue-200 hover:shadow-sm'"
              @click="createStore.videoParams.creationMode = 'standalone'"
            >
              <div class="text-4xl mb-3">🎨</div>
              <h3 class="text-lg font-medium text-gray-800 mb-2">独立创作</h3>
              <p class="text-sm text-gray-500">
                从零开始，用文字描述您想要的视频场景
              </p>
            </div>

            <!-- 基于绘本 -->
            <div
              class="p-6 rounded-2xl cursor-pointer transition-all"
              :class="createStore.videoParams.creationMode === 'from_book'
                ? 'bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-400 shadow-md'
                : 'bg-white/80 border-2 border-gray-200 hover:border-blue-200 hover:shadow-sm'"
              @click="createStore.videoParams.creationMode = 'from_book'"
            >
              <div class="text-4xl mb-3">📚</div>
              <h3 class="text-lg font-medium text-gray-800 mb-2">基于绘本</h3>
              <p class="text-sm text-gray-500">
                选择已有绘本的页面，让画面动起来
              </p>
            </div>
          </div>

          <!-- 独立创作模式的输入框 -->
          <div v-if="createStore.videoParams.creationMode === 'standalone'" class="mt-8">
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

            <!-- 灵感提示 -->
            <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 mt-4">
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

          <!-- 基于绘本模式的选择 -->
          <div v-if="createStore.videoParams.creationMode === 'from_book'" class="mt-8">
            <!-- 加载中 -->
            <div v-if="loadingBooks" class="text-center py-8">
              <div class="text-4xl animate-bounce">📚</div>
              <p class="text-gray-500 mt-2">加载绘本列表中...</p>
            </div>

            <!-- 无绘本 -->
            <div v-else-if="pictureBooks.length === 0" class="text-center py-8">
              <div class="text-4xl">📭</div>
              <p class="text-gray-500 mt-2">暂无已创作的绘本</p>
              <router-link
                to="/create/picture-book"
                class="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                去创作绘本
              </router-link>
            </div>

            <!-- 绘本列表 -->
            <div v-else>
              <h3 class="text-lg font-medium text-gray-800 mb-4">选择绘本</h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div
                  v-for="book in pictureBooks"
                  :key="book.id"
                  class="rounded-2xl overflow-hidden cursor-pointer transition-all"
                  :class="createStore.videoParams.selectedBookId === book.id
                    ? 'ring-2 ring-blue-400 shadow-lg'
                    : 'hover:shadow-md'"
                  @click="selectBook(book)"
                >
                  <img
                    :src="book.cover_url"
                    :alt="book.title"
                    class="w-full aspect-square object-cover"
                  />
                  <div class="p-2 bg-white">
                    <p class="text-sm font-medium text-gray-800 truncate">{{ book.title }}</p>
                  </div>
                </div>
              </div>

              <!-- 选择页面 -->
              <div v-if="selectedBook && selectedBook.pages?.length" class="mt-6">
                <h3 class="text-lg font-medium text-gray-800 mb-4">选择页面</h3>
                <div class="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  <div
                    v-for="(page, index) in selectedBook.pages"
                    :key="index"
                    class="rounded-xl overflow-hidden cursor-pointer transition-all"
                    :class="createStore.videoParams.selectedPageIndex === index
                      ? 'ring-2 ring-blue-400 shadow-md'
                      : 'hover:shadow-sm'"
                    @click="createStore.videoParams.selectedPageIndex = index"
                  >
                    <img
                      :src="page.image_url"
                      :alt="`页面 ${index + 1}`"
                      class="w-full aspect-square object-cover"
                    />
                    <div class="p-1 bg-gray-100 text-center">
                      <span class="text-xs text-gray-600">第 {{ index + 1 }} 页</span>
                    </div>
                  </div>
                </div>
              </div>
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
          <div class="mb-8">
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

          <!-- 场景模板 -->
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <span class="mr-2">🎭</span>
              场景模板
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                v-for="template in sceneTemplates"
                :key="template.id"
                class="p-4 rounded-2xl cursor-pointer transition-all text-center"
                :class="createStore.videoParams.sceneTemplate === template.id
                  ? 'bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-400'
                  : 'bg-white/80 border border-gray-200 hover:shadow-sm'"
                @click="createStore.videoParams.sceneTemplate = template.id"
              >
                <span class="text-2xl">{{ template.icon }}</span>
                <p class="font-medium text-gray-800 mt-2">{{ template.name }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ template.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤 3：确认创作 -->
        <div v-else-if="createStore.currentStep === 3">
          <h2 class="text-xl font-bold text-gray-800 mb-6">确认创作参数</h2>

          <div class="space-y-4">
            <!-- 创作方式 -->
            <div class="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4">
              <h3 class="font-medium text-gray-800 mb-3">🎬 创作信息</h3>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-500">创作方式：</span>
                  <span class="text-gray-800">
                    {{ createStore.videoParams.creationMode === 'standalone' ? '独立创作' : '基于绘本' }}
                  </span>
                </div>
                <div v-if="createStore.videoParams.creationMode === 'from_book' && selectedBook">
                  <span class="text-gray-500">绘本：</span>
                  <span class="text-gray-800">{{ selectedBook.title }}</span>
                </div>
                <div v-if="createStore.videoParams.creationMode === 'from_book' && createStore.videoParams.selectedPageIndex !== null">
                  <span class="text-gray-500">页面：</span>
                  <span class="text-gray-800">第 {{ (createStore.videoParams.selectedPageIndex || 0) + 1 }} 页</span>
                </div>
              </div>
              <div v-if="createStore.videoParams.creationMode === 'standalone'" class="mt-3 text-sm">
                <span class="text-gray-500">场景描述：</span>
                <p class="text-gray-800 mt-1">{{ createStore.videoParams.customPrompt }}</p>
              </div>
            </div>

            <!-- 视频参数 -->
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4">
              <h3 class="font-medium text-gray-800 mb-3">⚙️ 视频参数</h3>
              <div class="flex flex-wrap gap-2">
                <span class="px-3 py-1 bg-white/80 rounded-full text-sm text-gray-700">
                  {{ selectedRatioName }}
                </span>
                <span class="px-3 py-1 bg-white/80 rounded-full text-sm text-gray-700">
                  {{ createStore.videoParams.durationSeconds }}秒
                </span>
                <span class="px-3 py-1 bg-white/80 rounded-full text-sm text-gray-700">
                  {{ selectedMotionName }}
                </span>
                <span class="px-3 py-1 bg-white/80 rounded-full text-sm text-gray-700">
                  {{ selectedStyleName }}
                </span>
                <span class="px-3 py-1 bg-white/80 rounded-full text-sm text-gray-700">
                  {{ selectedTemplateName }}
                </span>
              </div>
            </div>

            <!-- 生成提示 -->
            <div class="bg-amber-50 rounded-2xl p-4">
              <p class="text-sm text-amber-700">
                <span class="font-medium">提示：</span>
                视频生成需要较长时间（约 2-5 分钟），请耐心等待。生成过程中请勿关闭页面。
              </p>
            </div>
          </div>
        </div>

        <!-- 步骤 4：生成中 -->
        <div v-else-if="createStore.currentStep === 4">
          <div class="text-center py-12">
            <div class="text-6xl mb-4 animate-bounce">🎬</div>
            <p class="text-gray-500">AI 正在创作专属视频...</p>
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
            :disabled="!canProceedFromStep1"
            class="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            @click="nextStep"
          >
            下一步 →
          </button>
          <button
            v-else-if="createStore.currentStep === 2"
            class="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all"
            @click="nextStep"
          >
            下一步 →
          </button>
          <button
            v-else-if="createStore.currentStep === 3"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChildStore } from '@/stores/child'
import { useCreateStore } from '@/stores/create'
import { getContentList } from '@/api/content'
import type { PictureBook } from '@/api/types'
import StepIndicator from '@/components/create/StepIndicator.vue'
import GeneratingModal from '@/components/create/GeneratingModal.vue'

const router = useRouter()
const childStore = useChildStore()
const createStore = useCreateStore()

const steps = ['创作方式', '视频参数', '确认创作', '生成中']

const loadingBooks = ref(false)
const pictureBooks = ref<PictureBook[]>([])
const selectedBook = ref<PictureBook | null>(null)

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

const sceneTemplates = [
  { id: 'storybook', name: '故事书', icon: '📖', desc: '经典绘本风格' },
  { id: 'adventure', name: '冒险', icon: '🗺️', desc: '户外探险场景' },
  { id: 'fantasy', name: '奇幻', icon: '✨', desc: '魔法梦幻世界' },
  { id: 'everyday', name: '日常', icon: '🏠', desc: '温馨生活场景' }
]

// 计算属性
const canProceedFromStep1 = computed(() => {
  if (createStore.videoParams.creationMode === 'standalone') {
    return !!createStore.videoParams.customPrompt.trim()
  } else {
    return createStore.videoParams.selectedBookId !== null &&
           createStore.videoParams.selectedPageIndex !== null
  }
})

const selectedRatioName = computed(() => {
  const ratio = aspectRatios.find(r => r.id === createStore.videoParams.aspectRatio)
  return ratio ? `${ratio.label} (${ratio.id})` : createStore.videoParams.aspectRatio
})

const selectedMotionName = computed(() => {
  const motion = motionModes.find(m => m.id === createStore.videoParams.motionMode)
  return motion?.name || createStore.videoParams.motionMode
})

const selectedStyleName = computed(() => {
  const style = createStore.styleOptions?.art_styles?.find(
    s => s.id === createStore.videoParams.artStyle
  )
  return style?.name || createStore.videoParams.artStyle
})

const selectedTemplateName = computed(() => {
  const template = sceneTemplates.find(t => t.id === createStore.videoParams.sceneTemplate)
  return template?.name || createStore.videoParams.sceneTemplate
})

// 方法
async function loadPictureBooks() {
  loadingBooks.value = true
  try {
    const response = await getContentList({ type: 'picture_book', limit: 20 })
    pictureBooks.value = response.items.filter(
      item => item.content_type === 'picture_book'
    ) as PictureBook[]
  } catch (e) {
    console.error('加载绘本列表失败:', e)
  } finally {
    loadingBooks.value = false
  }
}

function selectBook(book: PictureBook) {
  createStore.videoParams.selectedBookId = book.id
  selectedBook.value = book
  createStore.videoParams.selectedPageIndex = null
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
  await Promise.all([
    createStore.loadOptions(),
    loadPictureBooks()
  ])
})

onUnmounted(() => {
  createStore.stopPolling()
})
</script>
