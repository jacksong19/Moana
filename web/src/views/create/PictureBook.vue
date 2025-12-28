<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- 返回按钮 -->
      <router-link
        to="/create"
        class="inline-flex items-center text-gray-500 hover:text-purple-600 mb-6"
      >
        <span class="mr-2">←</span>
        返回创作中心
      </router-link>

      <!-- 标题 -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          📖 绘本创作
        </h1>
        <p class="text-gray-500">为 {{ childStore.currentChild?.name || '宝贝' }} 创作专属绘本故事</p>
      </div>

      <!-- 步骤指示器 -->
      <StepIndicator :steps="steps" :current-step="createStore.currentStep" />

      <!-- 步骤内容 -->
      <div class="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl">
        <!-- 步骤 1：选择主题 -->
        <div v-if="createStore.currentStep === 1">
          <h2 class="text-xl font-bold text-gray-800 mb-6">选择故事主题</h2>
          <ThemeSelector
            :themes="createStore.themes"
            :selected-category="createStore.pictureBookParams.themeCategory"
            :selected-topic="createStore.pictureBookParams.themeTopic"
            @update:selected-category="createStore.pictureBookParams.themeCategory = $event"
            @update:selected-topic="createStore.pictureBookParams.themeTopic = $event"
            @select="handleThemeSelect"
          />
        </div>

        <!-- 步骤 2：风格设置 -->
        <div v-else-if="createStore.currentStep === 2">
          <h2 class="text-xl font-bold text-gray-800 mb-6">选择绘本风格</h2>
          <StyleSelector
            v-if="createStore.styleOptions"
            :art-styles="createStore.styleOptions.art_styles"
            :protagonists="createStore.styleOptions.protagonists"
            :color-palettes="createStore.styleOptions.color_palettes"
            :voices="createStore.styleOptions.tts_voices"
            :selected-art-style="createStore.pictureBookParams.artStyle"
            :selected-protagonist="createStore.pictureBookParams.protagonist.animal"
            :selected-color-palette="createStore.pictureBookParams.colorPalette"
            :selected-voice="createStore.pictureBookParams.voiceId"
            :show-voice="true"
            @update:selected-art-style="createStore.pictureBookParams.artStyle = $event"
            @update:selected-protagonist="updateProtagonist"
            @update:selected-color-palette="createStore.pictureBookParams.colorPalette = $event"
            @update:selected-voice="createStore.pictureBookParams.voiceId = $event"
          />
        </div>

        <!-- 步骤 3：确认信息 -->
        <div v-else-if="createStore.currentStep === 3">
          <h2 class="text-xl font-bold text-gray-800 mb-6">确认创作信息</h2>
          <div class="space-y-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
            <div class="flex justify-between items-center py-2 border-b border-purple-100">
              <span class="text-gray-600">宝贝名字</span>
              <span class="font-medium text-gray-800">{{ childStore.currentChild?.name }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-purple-100">
              <span class="text-gray-600">故事主题</span>
              <span class="font-medium text-gray-800">{{ selectedThemeName }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-purple-100">
              <span class="text-gray-600">艺术风格</span>
              <span class="font-medium text-gray-800">{{ selectedStyleName }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-purple-100">
              <span class="text-gray-600">故事主角</span>
              <span class="font-medium text-gray-800">{{ selectedProtagonistName }}</span>
            </div>
            <div class="flex justify-between items-center py-2">
              <span class="text-gray-600">配音音色</span>
              <span class="font-medium text-gray-800">{{ selectedVoiceName }}</span>
            </div>
          </div>
        </div>

        <!-- 步骤 4：生成中（由 Modal 接管） -->
        <div v-else-if="createStore.currentStep === 4">
          <div class="text-center py-12">
            <div class="text-6xl mb-4 animate-bounce">✨</div>
            <p class="text-gray-500">正在为宝贝创作专属绘本...</p>
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
            v-if="createStore.currentStep < 3"
            :disabled="!canNextStep"
            class="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            @click="nextStep"
          >
            下一步 →
          </button>
          <button
            v-else-if="createStore.currentStep === 3"
            class="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all"
            @click="startGenerate"
          >
            ✨ 开始创作
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
      content-type="picture_book"
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
import StyleSelector from '@/components/create/StyleSelector.vue'
import GeneratingModal from '@/components/create/GeneratingModal.vue'

const router = useRouter()
const childStore = useChildStore()
const createStore = useCreateStore()

const steps = ['选择主题', '风格设置', '确认信息', '生成中']

// 计算属性
const canNextStep = computed(() => {
  if (createStore.currentStep === 1) {
    return !!createStore.pictureBookParams.themeCategory && !!createStore.pictureBookParams.themeTopic
  }
  return true
})

const selectedThemeName = computed(() => {
  if (!createStore.themes || !createStore.pictureBookParams.themeCategory) return ''
  const category = createStore.themes[createStore.pictureBookParams.themeCategory]
  const theme = category?.themes?.find(t => t.id === createStore.pictureBookParams.themeTopic)
  return theme?.name || ''
})

const selectedStyleName = computed(() => {
  const style = createStore.styleOptions?.art_styles?.find(
    s => s.id === createStore.pictureBookParams.artStyle
  )
  return style?.name || ''
})

const selectedProtagonistName = computed(() => {
  const protagonist = createStore.styleOptions?.protagonists?.find(
    p => p.animal === createStore.pictureBookParams.protagonist.animal
  )
  return protagonist?.name || ''
})

const selectedVoiceName = computed(() => {
  const voice = createStore.styleOptions?.tts_voices?.find(
    v => v.id === createStore.pictureBookParams.voiceId
  )
  return voice?.name || ''
})

// 方法
function handleThemeSelect() {
  // 主题选择后可以自动进入下一步
}

function updateProtagonist(animal: string) {
  const protagonist = createStore.styleOptions?.protagonists?.find(p => p.animal === animal)
  if (protagonist) {
    createStore.pictureBookParams.protagonist = {
      animal: protagonist.animal,
      color: protagonist.default_color,
      accessory: protagonist.default_accessory
    }
  }
}

function prevStep() {
  if (createStore.currentStep > 1) {
    createStore.currentStep--
  }
}

function nextStep() {
  if (createStore.currentStep < 4) {
    createStore.currentStep++
  }
}

async function startGenerate() {
  createStore.currentStep = 4
  try {
    await createStore.generatePictureBook()
  } catch (e) {
    console.error('生成绘本失败:', e)
  }
}

function handlePlay() {
  if (createStore.generatedContentId) {
    router.push(`/play/picture_book/${createStore.generatedContentId}`)
  }
}

function handleClose() {
  createStore.resetParams('picture_book')
}

// 生命周期
onMounted(async () => {
  createStore.resetParams('picture_book')
  await createStore.loadOptions()
})

onUnmounted(() => {
  createStore.stopPolling()
})
</script>
