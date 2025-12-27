<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">仪表盘</h1>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 今日学习 -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <span class="text-gray-500">今日学习</span>
          <span class="text-2xl">📖</span>
        </div>
        <div class="text-2xl font-bold text-gray-900">
          {{ childStore.todayDuration }} 分钟
        </div>
        <div class="mt-2">
          <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              class="h-full bg-primary-500 rounded-full transition-all"
              :style="{ width: `${Math.min(100, (childStore.todayDuration / childStore.settings.daily_limit_minutes) * 100)}%` }"
            />
          </div>
          <p class="text-xs text-gray-500 mt-1">
            限制 {{ childStore.settings.daily_limit_minutes }} 分钟
          </p>
        </div>
      </div>

      <!-- 内容统计 -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <span class="text-gray-500">内容统计</span>
          <span class="text-2xl">📚</span>
        </div>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">绘本</span>
            <span class="font-medium">{{ stats.books }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">儿歌</span>
            <span class="font-medium">{{ stats.songs }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">视频</span>
            <span class="font-medium">{{ stats.videos }}</span>
          </div>
        </div>
      </div>

      <!-- 当前孩子 -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <span class="text-gray-500">当前孩子</span>
          <span class="text-2xl">👶</span>
        </div>
        <div v-if="childStore.currentChild" class="flex items-center">
          <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-medium">
            {{ childStore.currentChild.name.charAt(0) }}
          </div>
          <div class="ml-3">
            <p class="font-medium text-gray-900">{{ childStore.currentChild.name }}</p>
            <p class="text-sm text-gray-500">{{ childStore.currentChildAge }}</p>
          </div>
        </div>
        <router-link
          v-else
          to="/children/add"
          class="text-primary-600 hover:underline"
        >
          + 添加孩子
        </router-link>
      </div>

      <!-- 快捷操作 -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <span class="text-gray-500">快捷操作</span>
          <span class="text-2xl">🚀</span>
        </div>
        <div class="space-y-2">
          <router-link
            to="/library"
            class="block px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            查看内容库 →
          </router-link>
          <router-link
            to="/report"
            class="block px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            查看报告 →
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useChildStore } from '@/stores/child'
import { getContentList } from '@/api/content'

const childStore = useChildStore()

const stats = ref({ books: 0, songs: 0, videos: 0 })

onMounted(async () => {
  await childStore.fetchChildren()
  await childStore.fetchTodayDuration()

  // 获取内容统计
  try {
    const [books, songs, videos] = await Promise.all([
      getContentList({ type: 'picture_book', limit: 1 }),
      getContentList({ type: 'nursery_rhyme', limit: 1 }),
      getContentList({ type: 'video', limit: 1 }),
    ])
    stats.value = {
      books: books.total,
      songs: songs.total,
      videos: videos.total,
    }
  } catch (e) {
    console.error('获取内容统计失败:', e)
  }
})
</script>
