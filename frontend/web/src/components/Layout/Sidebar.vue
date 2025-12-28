<template>
  <aside class="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-100 shadow-sm">
    <!-- Logo -->
    <div class="flex items-center h-16 px-6 border-b border-gray-100">
      <span class="text-2xl font-bold bg-gradient-to-r from-book via-song to-video bg-clip-text text-transparent">
        Moana
      </span>
      <span class="ml-2 text-xs text-text-secondary bg-honey-light px-2 py-0.5 rounded-full">家长版</span>
    </div>

    <!-- 导航 -->
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all"
        :class="isActive(item.path)
          ? 'bg-honey text-white shadow-md'
          : 'text-text-secondary hover:bg-cream hover:text-text-primary'"
      >
        <span class="mr-3 text-lg">{{ item.icon }}</span>
        {{ item.name }}
      </router-link>
    </nav>

    <!-- 底部：云朵装饰 -->
    <div class="p-4 text-center text-4xl opacity-30">
      ☁️ 🌈 ☁️
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { path: '/dashboard', name: '首页', icon: '🏠' },
  { path: '/create', name: '创作中心', icon: '✨' },
  { path: '/library', name: '内容库', icon: '📚' },
  { path: '/favorites', name: '收藏', icon: '❤️' },
  { path: '/children', name: '孩子', icon: '👶' },
  { path: '/settings', name: '设置', icon: '⚙️' },
]

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>
