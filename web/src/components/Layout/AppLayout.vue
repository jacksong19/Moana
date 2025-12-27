<template>
  <div class="min-h-screen bg-gray-50">
    <Sidebar />
    <MobileNav />

    <!-- 主内容区 -->
    <main class="lg:pl-64 pt-14 lg:pt-0 pb-16 lg:pb-0">
      <div class="p-4 lg:p-8">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import MobileNav from './MobileNav.vue'
</script>
