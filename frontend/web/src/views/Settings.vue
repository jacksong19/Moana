<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">设置</h1>

    <!-- 时间限制设置 -->
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">时间管理</h2>
          <p class="text-sm text-gray-500 mt-1">控制孩子的观看时长</p>
        </div>
        <span class="text-2xl">&#x23F1;</span>
      </div>

      <!-- 每日限制 -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <div>
            <label class="block font-medium text-gray-700">每日观看限制</label>
            <p class="text-sm text-gray-500">设置每天最多观看时长</p>
          </div>
          <span class="text-lg font-semibold text-primary-600">
            {{ localSettings.daily_limit_minutes }} 分钟
          </span>
        </div>
        <input
          v-model.number="localSettings.daily_limit_minutes"
          type="range"
          :min="15"
          :max="120"
          :step="15"
          class="slider w-full"
        />
        <div class="flex justify-between text-xs text-gray-400 mt-1">
          <span>15 分钟</span>
          <span>120 分钟</span>
        </div>
      </div>

      <div class="border-t border-gray-100 my-6" />

      <!-- 单次限制 -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <div>
            <label class="block font-medium text-gray-700">单次观看限制</label>
            <p class="text-sm text-gray-500">每次连续观看的最长时间</p>
          </div>
          <span class="text-lg font-semibold text-teal-600">
            {{ localSettings.session_limit_minutes }} 分钟
          </span>
        </div>
        <input
          v-model.number="localSettings.session_limit_minutes"
          type="range"
          :min="10"
          :max="30"
          :step="5"
          class="slider slider-teal w-full"
        />
        <div class="flex justify-between text-xs text-gray-400 mt-1">
          <span>10 分钟</span>
          <span>30 分钟</span>
        </div>
      </div>

      <div class="border-t border-gray-100 my-6" />

      <!-- 休息提醒 -->
      <div class="flex items-center justify-between">
        <div>
          <label class="block font-medium text-gray-700">休息提醒</label>
          <p class="text-sm text-gray-500">每 10 分钟提醒休息眼睛</p>
        </div>
        <button
          type="button"
          class="toggle-btn"
          :class="{ 'toggle-btn-active': localSettings.rest_reminder_enabled }"
          @click="localSettings.rest_reminder_enabled = !localSettings.rest_reminder_enabled"
        >
          <span class="toggle-dot" :class="{ 'translate-x-5': localSettings.rest_reminder_enabled }" />
        </button>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex flex-col sm:flex-row gap-4">
      <button
        class="btn btn-primary flex-1 flex items-center justify-center gap-2"
        :disabled="saving"
        @click="handleSave"
      >
        <span v-if="saving">保存中...</span>
        <span v-else>保存设置</span>
      </button>
      <button
        class="btn bg-gray-100 text-gray-700 hover:bg-gray-200 flex-1 flex items-center justify-center gap-2"
        @click="handleLogout"
      >
        退出登录
      </button>
    </div>

    <!-- 关于 -->
    <div class="card">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">关于</h2>
          <p class="text-sm text-gray-500 mt-1">Moana 家长管理端</p>
        </div>
        <span class="text-gray-400">v1.0.0</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useChildStore } from '@/stores/child'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const childStore = useChildStore()
const userStore = useUserStore()

const saving = ref(false)

const localSettings = reactive({
  daily_limit_minutes: 60,
  session_limit_minutes: 30,
  rest_reminder_enabled: true
})

// 监听 store 中的设置变化，同步到本地
watch(
  () => childStore.settings,
  (newSettings) => {
    localSettings.daily_limit_minutes = newSettings.daily_limit_minutes
    localSettings.session_limit_minutes = newSettings.session_limit_minutes
    localSettings.rest_reminder_enabled = newSettings.rest_reminder_enabled
  },
  { immediate: true }
)

async function handleSave() {
  saving.value = true
  try {
    await childStore.updateSettings({
      daily_limit_minutes: localSettings.daily_limit_minutes,
      session_limit_minutes: localSettings.session_limit_minutes,
      rest_reminder_enabled: localSettings.rest_reminder_enabled
    })
    alert('设置已保存')
  } catch (e) {
    console.error('保存设置失败:', e)
    alert('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

function handleLogout() {
  if (confirm('确定要退出登录吗？')) {
    userStore.logout()
    router.push('/login')
  }
}

onMounted(async () => {
  await childStore.fetchChildren()
  await childStore.fetchSettings()
})
</script>

<style scoped>
/* 滑块基础样式 */
.slider {
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  background: #e5e7eb;
  border-radius: 9999px;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #ff6b6b;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #ff6b6b;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

/* Teal 滑块 */
.slider-teal::-webkit-slider-thumb {
  background: #14b8a6;
}

.slider-teal::-moz-range-thumb {
  background: #14b8a6;
}

/* 切换按钮 */
.toggle-btn {
  position: relative;
  width: 44px;
  height: 24px;
  background-color: #d1d5db;
  border-radius: 9999px;
  transition: background-color 0.2s;
  cursor: pointer;
}

.toggle-btn-active {
  background-color: #ff6b6b;
}

.toggle-dot {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
