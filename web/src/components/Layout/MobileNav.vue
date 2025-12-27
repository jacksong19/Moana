<template>
  <!-- 顶部 Header -->
  <header class="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50">
    <div class="flex items-center justify-between h-full px-4">
      <span class="text-lg font-bold text-primary-600">Moana</span>
      <span class="text-sm text-gray-500">{{ pageTitle }}</span>
    </div>
  </header>

  <!-- 底部 TabBar -->
  <nav class="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-50">
    <div class="grid grid-cols-5 h-full">
      <router-link
        v-for="item in tabItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center justify-center text-xs"
        :class="isActive(item.path) ? 'text-primary-600' : 'text-gray-500'"
      >
        <span class="text-xl mb-1">{{ item.icon }}</span>
        <span>{{ item.name }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const tabItems = [
  { path: '/dashboard', name: '首页', icon: '🏠' },
  { path: '/library', name: '内容', icon: '📚' },
  { path: '/favorites', name: '收藏', icon: '❤️' },
  { path: '/report', name: '报告', icon: '📈' },
  { path: '/settings', name: '设置', icon: '⚙️' },
]

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/dashboard': '仪表盘',
    '/children': '孩子管理',
    '/library': '内容库',
    '/favorites': '收藏',
    '/report': '学习报告',
    '/settings': '设置',
  }
  return titles[route.path] || ''
})

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>
