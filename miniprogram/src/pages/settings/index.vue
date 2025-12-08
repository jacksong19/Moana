<template>
  <view class="page-container">
    <!-- 导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="back-btn" @tap="goBack">
          <text>‹</text>
        </view>
        <text class="nav-title">设置</text>
        <view class="nav-right"></view>
      </view>
    </view>
    <view class="nav-placeholder" :style="{ height: navHeight + 'px' }"></view>

    <scroll-view class="main-scroll" scroll-y>
      <!-- 时间管理 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">⏱️ 时间管理</text>
        </view>

        <view class="setting-card">
          <!-- 每日限制 -->
          <view class="setting-item">
            <view class="setting-info">
              <text class="setting-label">每日观看限制</text>
              <text class="setting-desc">设置每天最多观看时长</text>
            </view>
            <view class="setting-control">
              <text class="control-value">{{ settings.daily_limit_minutes }} 分钟</text>
              <text class="control-arrow">›</text>
            </view>
          </view>

          <!-- 滑块调节 -->
          <view class="slider-control">
            <slider
              :value="settings.daily_limit_minutes"
              :min="15"
              :max="120"
              :step="15"
              activeColor="#FF6B6B"
              backgroundColor="#FFE4D4"
              block-color="#FF6B6B"
              @change="onDailyLimitChange"
            />
            <view class="slider-labels">
              <text>15分钟</text>
              <text>120分钟</text>
            </view>
          </view>

          <view class="divider"></view>

          <!-- 单次限制 -->
          <view class="setting-item">
            <view class="setting-info">
              <text class="setting-label">单次观看限制</text>
              <text class="setting-desc">每次连续观看的最长时间</text>
            </view>
            <view class="setting-control">
              <text class="control-value">{{ settings.session_limit_minutes }} 分钟</text>
            </view>
          </view>

          <view class="slider-control">
            <slider
              :value="settings.session_limit_minutes"
              :min="10"
              :max="30"
              :step="5"
              activeColor="#4ECDC4"
              backgroundColor="#D4F5F3"
              block-color="#4ECDC4"
              @change="onSessionLimitChange"
            />
            <view class="slider-labels">
              <text>10分钟</text>
              <text>30分钟</text>
            </view>
          </view>

          <view class="divider"></view>

          <!-- 休息提醒 -->
          <view class="setting-item">
            <view class="setting-info">
              <text class="setting-label">休息提醒</text>
              <text class="setting-desc">每 10 分钟提醒休息眼睛</text>
            </view>
            <switch
              :checked="settings.rest_reminder_enabled"
              color="#FF6B6B"
              @change="onRestReminderChange"
            />
          </view>
        </view>
      </view>

      <!-- 今日统计 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">📊 今日统计</text>
        </view>

        <view class="stats-card">
          <view class="stat-item">
            <view class="stat-icon">⏱️</view>
            <view class="stat-info">
              <text class="stat-value">{{ todayStats.duration }}分钟</text>
              <text class="stat-label">今日观看</text>
            </view>
            <view class="stat-progress">
              <view
                class="progress-fill"
                :style="{ width: todayStats.progress + '%' }"
              ></view>
            </view>
          </view>

          <view class="stat-item">
            <view class="stat-icon">📚</view>
            <view class="stat-info">
              <text class="stat-value">{{ todayStats.count }}个</text>
              <text class="stat-label">观看内容</text>
            </view>
          </view>

          <view class="stat-item">
            <view class="stat-icon">🔥</view>
            <view class="stat-info">
              <text class="stat-value">{{ todayStats.streak }}天</text>
              <text class="stat-label">连续学习</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 关于 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">ℹ️ 关于</text>
        </view>

        <view class="setting-card">
          <view class="setting-item" @tap="showVersion">
            <view class="setting-info">
              <text class="setting-label">版本</text>
            </view>
            <view class="setting-control">
              <text class="control-value">1.0.0</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部安全区 -->
      <view class="safe-bottom"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useChildStore } from '@/stores/child'
import { getPlayStats } from '@/api/play'

const childStore = useChildStore()

const statusBarHeight = ref(20)
const navHeight = ref(88)

const settings = reactive({
  daily_limit_minutes: 60,
  session_limit_minutes: 20,
  rest_reminder_enabled: true
})

const todayStats = reactive({
  duration: 0,
  count: 0,
  streak: 0,
  progress: 0
})

function goBack() {
  uni.navigateBack()
}

function onDailyLimitChange(e: any) {
  settings.daily_limit_minutes = e.detail.value
  saveSettings()
}

function onSessionLimitChange(e: any) {
  settings.session_limit_minutes = e.detail.value
  saveSettings()
}

function onRestReminderChange(e: any) {
  settings.rest_reminder_enabled = e.detail.value
  saveSettings()
}

async function saveSettings() {
  try {
    await childStore.updateSettings({
      daily_limit_minutes: settings.daily_limit_minutes,
      session_limit_minutes: settings.session_limit_minutes,
      rest_reminder_enabled: settings.rest_reminder_enabled
    })
    uni.showToast({ title: '已保存', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}

function showVersion() {
  uni.showToast({ title: 'Moana v1.0.0', icon: 'none' })
}

async function loadData() {
  // 加载设置
  await childStore.fetchSettings()
  Object.assign(settings, childStore.settings)

  // 加载统计
  if (childStore.currentChild) {
    try {
      const stats = await getPlayStats(childStore.currentChild.id)
      todayStats.duration = Math.round(stats.today_duration)
      todayStats.count = stats.total_plays
      todayStats.streak = stats.streak_days
      todayStats.progress = Math.min(100, (stats.today_duration / settings.daily_limit_minutes) * 100)
    } catch (e) {
      console.log('加载统计失败')
    }
  }
}

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 20
  navHeight.value = statusBarHeight.value + 44

  loadData()
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page-container {
  min-height: 100vh;
  background: $bg-base;
}

// 导航栏
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: $z-sticky;
  background: $bg-base;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 $spacing-md;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;

  text {
    font-size: 48rpx;
    color: $text-primary;
    line-height: 1;
  }
}

.nav-title {
  font-size: $font-md;
  font-weight: $font-semibold;
  color: $text-primary;
}

.nav-right {
  width: 64rpx;
}

.nav-placeholder {
  flex-shrink: 0;
}

.main-scroll {
  padding: $spacing-md;
}

// 区块
.section {
  margin-bottom: $spacing-lg;
}

.section-header {
  margin-bottom: $spacing-sm;
  padding: 0 $spacing-xs;
}

.section-title {
  font-size: $font-md;
  font-weight: $font-bold;
  color: $text-primary;
}

// 设置卡片
.setting-card {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-sm 0;
  box-shadow: $shadow-sm;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md;
}

.setting-info {
  flex: 1;
}

.setting-label {
  display: block;
  font-size: $font-base;
  font-weight: $font-medium;
  color: $text-primary;
}

.setting-desc {
  display: block;
  font-size: $font-sm;
  color: $text-secondary;
  margin-top: 4rpx;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
}

.control-value {
  font-size: $font-base;
  color: $primary;
  font-weight: $font-medium;
}

.control-arrow {
  font-size: $font-lg;
  color: $text-light;
}

.slider-control {
  padding: 0 $spacing-md $spacing-md;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: $spacing-xs;

  text {
    font-size: $font-xs;
    color: $text-light;
  }
}

.divider {
  height: 1rpx;
  background: $uni-border-color;
  margin: 0 $spacing-md;
}

// 统计卡片
.stats-card {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-sm;
}

.stat-item {
  background: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  text-align: center;
  box-shadow: $shadow-sm;
}

.stat-icon {
  font-size: 40rpx;
  margin-bottom: $spacing-xs;
}

.stat-info {
  margin-bottom: $spacing-xs;
}

.stat-value {
  display: block;
  font-size: $font-md;
  font-weight: $font-bold;
  color: $text-primary;
}

.stat-label {
  display: block;
  font-size: $font-xs;
  color: $text-secondary;
}

.stat-progress {
  height: 8rpx;
  background: rgba($primary, 0.15);
  border-radius: $radius-full;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: $primary;
  border-radius: $radius-full;
  transition: width $duration-base;
}

.safe-bottom {
  height: 100rpx;
}
</style>
