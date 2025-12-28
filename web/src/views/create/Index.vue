<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <!-- 标题 -->
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
          创作中心
        </h1>
        <p class="text-gray-500">为宝贝创作专属的绘本、儿歌和视频</p>
      </div>

      <!-- 当前孩子提示 -->
      <div v-if="!childStore.currentChild" class="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl text-center">
        <p class="text-yellow-700">
          请先
          <router-link to="/children/add" class="text-purple-600 font-medium hover:underline">添加孩子</router-link>
          再开始创作
        </p>
      </div>

      <!-- 创作类型卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 绘本创作 -->
        <router-link
          to="/create/picture-book"
          class="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 to-purple-600 p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
        >
          <div class="relative z-10">
            <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl mb-4">
              📖
            </div>
            <h2 class="text-2xl font-bold mb-2">绘本创作</h2>
            <p class="text-white/80 mb-4">
              AI 智能生成精美插画故事书，培养宝贝阅读兴趣
            </p>
            <div class="flex items-center text-white/90 text-sm">
              <span class="mr-2">✨</span>
              4 步完成专属绘本
            </div>
          </div>
          <!-- 装饰图案 -->
          <div class="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full" />
          <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
        </router-link>

        <!-- 儿歌创作 -->
        <router-link
          to="/create/nursery-rhyme"
          class="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 to-rose-500 p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
        >
          <div class="relative z-10">
            <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl mb-4">
              🎵
            </div>
            <h2 class="text-2xl font-bold mb-2">儿歌创作</h2>
            <p class="text-white/80 mb-4">
              AI 作曲演唱，为宝贝定制专属音乐
            </p>
            <div class="flex items-center text-white/90 text-sm">
              <span class="mr-2">🎶</span>
              Suno AI 智能生成
            </div>
          </div>
          <div class="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full" />
          <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
        </router-link>

        <!-- 视频创作 -->
        <router-link
          to="/create/video"
          class="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
        >
          <div class="relative z-10">
            <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl mb-4">
              🎬
            </div>
            <h2 class="text-2xl font-bold mb-2">视频创作</h2>
            <p class="text-white/80 mb-4">
              AI 生成精彩动画视频，让故事动起来
            </p>
            <div class="flex items-center text-white/90 text-sm">
              <span class="mr-2">🎥</span>
              VEO 视频生成
            </div>
          </div>
          <div class="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full" />
          <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
        </router-link>

        <!-- 智能创作 -->
        <router-link
          to="/create/smart"
          class="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
        >
          <div class="relative z-10">
            <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl mb-4">
              🪄
            </div>
            <h2 class="text-2xl font-bold mb-2">智能创作</h2>
            <p class="text-white/80 mb-4">
              告诉 AI 你的想法，一键生成创意内容
            </p>
            <div class="flex items-center text-white/90 text-sm">
              <span class="mr-2">💡</span>
              自由描述，AI 实现
            </div>
          </div>
          <div class="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full" />
          <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
        </router-link>
      </div>

      <!-- 最近创作 -->
      <div class="mt-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-800">最近创作</h2>
          <router-link to="/library" class="text-purple-600 hover:underline text-sm">
            查看全部 →
          </router-link>
        </div>
        <div v-if="recentContents.length" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <router-link
            v-for="content in recentContents"
            :key="content.id"
            :to="`/play/${content.content_type}/${content.id}`"
            class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-4xl">
              {{ getContentIcon(content.content_type) }}
            </div>
            <div class="p-3">
              <p class="font-medium text-gray-800 truncate">{{ content.title }}</p>
              <p class="text-xs text-gray-500">{{ formatDate(content.created_at) }}</p>
            </div>
          </router-link>
        </div>
        <div v-else class="text-center py-12 text-gray-400">
          暂无创作内容
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useChildStore } from '@/stores/child'
import { getContentList } from '@/api/content'
import type { Content } from '@/api/types'

const childStore = useChildStore()
const recentContents = ref<Content[]>([])

onMounted(async () => {
  await childStore.fetchChildren()

  try {
    const res = await getContentList({ limit: 4 })
    recentContents.value = res.items
  } catch (e) {
    console.error('获取最近内容失败:', e)
  }
})

function getContentIcon(type?: string): string {
  const icons: Record<string, string> = {
    picture_book: '📖',
    nursery_rhyme: '🎵',
    video: '🎬'
  }
  return icons[type || ''] || '📚'
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
</script>
