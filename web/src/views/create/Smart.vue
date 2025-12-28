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
          🪄 智能创作
        </h1>
        <p class="text-gray-500">告诉 AI 你的想法，选择内容类型开始创作</p>
      </div>

      <!-- 主要内容 -->
      <div class="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl">
        <!-- 自由输入 -->
        <div class="mb-8">
          <label class="block text-lg font-medium text-gray-800 mb-4 flex items-center">
            <span class="mr-2">💭</span>
            描述你的创意
          </label>
          <textarea
            v-model="customPrompt"
            rows="4"
            class="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-lg"
            placeholder="例如：一个关于小熊学会分享的故事..."
          />
        </div>

        <!-- 灵感卡片 -->
        <div class="mb-8">
          <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <span class="mr-2">💡</span>
            灵感卡片
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="inspiration in inspirations"
              :key="inspiration.title"
              class="p-4 bg-gradient-to-br from-white to-amber-50 rounded-2xl border border-amber-100 cursor-pointer hover:shadow-md transition-shadow"
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

        <!-- 选择内容类型 -->
        <div>
          <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <span class="mr-2">🎯</span>
            选择创作类型
          </h3>
          <div class="grid grid-cols-3 gap-4">
            <button
              :disabled="!customPrompt.trim()"
              class="p-6 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              :class="customPrompt.trim()
                ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-gray-100 text-gray-400'"
              @click="goToCreate('picture-book')"
            >
              <div class="text-4xl mb-2">📖</div>
              <p class="font-medium">绘本</p>
            </button>
            <button
              :disabled="!customPrompt.trim()"
              class="p-6 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              :class="customPrompt.trim()
                ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-gray-100 text-gray-400'"
              @click="goToCreate('nursery-rhyme')"
            >
              <div class="text-4xl mb-2">🎵</div>
              <p class="font-medium">儿歌</p>
            </button>
            <button
              :disabled="!customPrompt.trim()"
              class="p-6 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              :class="customPrompt.trim()
                ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-gray-100 text-gray-400'"
              @click="goToCreate('video')"
            >
              <div class="text-4xl mb-2">🎬</div>
              <p class="font-medium">视频</p>
            </button>
          </div>
          <p v-if="!customPrompt.trim()" class="text-center text-gray-400 text-sm mt-4">
            请先输入创意描述
          </p>
        </div>
      </div>

      <!-- 提示说明 -->
      <div class="mt-8 p-4 bg-white/60 rounded-2xl text-center text-sm text-gray-500">
        <p>智能创作会根据你的描述自动设置最佳参数，也可以在下一步手动调整</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCreateStore } from '@/stores/create'

const router = useRouter()
const createStore = useCreateStore()

const customPrompt = ref('')

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

function goToCreate(type: 'picture-book' | 'nursery-rhyme' | 'video') {
  // 保存自定义提示到对应的参数中
  if (type === 'picture-book') {
    createStore.pictureBookParams.themeCategory = 'emotion'
    createStore.pictureBookParams.themeTopic = 'custom'
  } else if (type === 'nursery-rhyme') {
    createStore.nurseryRhymeParams.themeCategory = 'emotion'
    createStore.nurseryRhymeParams.themeTopic = 'custom'
  } else if (type === 'video') {
    createStore.videoParams.customPrompt = customPrompt.value
  }

  router.push(`/create/${type}`)
}
</script>
