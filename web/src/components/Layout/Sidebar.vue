<template>
  <aside class="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
    <!-- Logo -->
    <div class="flex items-center h-16 px-6 border-b border-gray-200">
      <span class="text-xl font-bold text-primary-600">Moana</span>
      <span class="ml-2 text-sm text-gray-500">家长管理</span>
    </div>

    <!-- 导航 -->
    <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
        :class="isActive(item.path)
          ? 'bg-primary-50 text-primary-600'
          : 'text-gray-600 hover:bg-gray-50'"
      >
        <span class="mr-3">{{ item.icon }}</span>
        {{ item.name }}
      </router-link>
    </nav>

    <!-- 底部：当前孩子 -->
    <div class="p-4 border-t border-gray-200" v-if="childStore.currentChild">
      <div class="flex items-center">
        <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
          {{ childStore.currentChild.name.charAt(0) }}
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-gray-900">{{ childStore.currentChild.name }}</p>
          <p class="text-xs text-gray-500">{{ childStore.currentChildAge }}</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useChildStore } from '@/stores/child'

const route = useRoute()
const childStore = useChildStore()

const navItems = [
  { path: '/dashboard', name: '仪表盘', icon: '📊' },
  { path: '/children', name: '孩子管理', icon: '👶' },
  { path: '/library', name: '内容库', icon: '📚' },
  { path: '/favorites', name: '收藏', icon: '❤️' },
  { path: '/report', name: '学习报告', icon: '📈' },
  { path: '/settings', name: '设置', icon: '⚙️' },
]

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>
