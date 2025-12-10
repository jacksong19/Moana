<template>
  <view class="page-container">
    <NavBar title="内容库" />

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view
        v-for="filter in filters"
        :key="filter.value"
        class="filter-item"
        :class="{ active: currentFilter === filter.value }"
        @tap="currentFilter = filter.value"
      >
        <text>{{ filter.name }}</text>
      </view>
    </view>

    <!-- 内容列表 -->
    <scroll-view
      class="content-scroll"
      scroll-y
      @scrolltolower="loadMore"
    >
      <view v-if="loading && contentList.length === 0" class="loading-state">
        <view class="loading-icon animate-spin">🌊</view>
        <text>加载中...</text>
      </view>

      <view v-else-if="contentList.length === 0" class="empty-state">
        <text class="empty-icon">📚</text>
        <text class="empty-title">还没有内容</text>
        <text class="empty-desc">去创作中心生成第一个绘本吧</text>
        <view class="empty-btn" @tap="goToCreate">
          <text>开始创作</text>
        </view>
      </view>

      <view v-else class="content-grid">
        <ContentCard
          v-for="item in contentList"
          :key="item.id"
          :title="item.title"
          :type="item.content_type || 'picture_book'"
          :cover-url="item.cover_url"
          :duration="item.total_duration"
          :child-name="item.personalization?.child_name"
          :created-at="item.created_at"
          :show-play="true"
          @tap="goToDetail(item)"
          @play="goToPlay(item)"
          @longpress="showActionSheet(item)"
        />
      </view>

      <view v-if="loading && contentList.length > 0" class="loading-more">
        <text>加载更多...</text>
      </view>

      <view v-if="!hasMore && contentList.length > 0" class="no-more">
        <text>没有更多了</text>
      </view>

      <!-- 底部安全区 -->
      <view class="safe-bottom"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useContentStore } from '@/stores/content'
import NavBar from '@/components/NavBar/NavBar.vue'
import ContentCard from '@/components/ContentCard/ContentCard.vue'
import type { PictureBook } from '@/api/content'

const contentStore = useContentStore()

const filters = [
  { name: '全部', value: 'all' },
  { name: '绘本', value: 'picture_book' },
  { name: '儿歌', value: 'nursery_rhyme' },
  { name: '视频', value: 'video' }
]

const currentFilter = ref('all')
const loading = ref(false)
const hasMore = ref(true)

const contentList = computed(() => {
  if (currentFilter.value === 'all') {
    return contentStore.generatedList
  }
  return contentStore.generatedList.filter(
    item => (item as any).content_type === currentFilter.value
  )
})

async function loadData(refresh = false) {
  if (loading.value) return

  loading.value = true
  try {
    await contentStore.fetchGeneratedList(refresh)
    hasMore.value = contentStore.generatedList.length >= 20
  } catch (e) {
    console.error('加载失败:', e)
  } finally {
    loading.value = false
  }
}

function loadMore() {
  if (!hasMore.value || loading.value) return
  // 加载更多逻辑
}

function goToCreate() {
  uni.switchTab({ url: '/pages/create/index' })
}

function goToDetail(item: PictureBook) {
  uni.navigateTo({
    url: `/pages/play/picture-book?id=${item.id}`
  })
}

function goToPlay(item: PictureBook) {
  uni.navigateTo({
    url: `/pages/play/picture-book?id=${item.id}&autoplay=1`
  })
}

function showActionSheet(item: PictureBook) {
  uni.showActionSheet({
    itemList: ['删除'],
    itemColor: '#FF4D4F',
    success: (res) => {
      if (res.tapIndex === 0) {
        confirmDelete(item)
      }
    }
  })
}

function confirmDelete(item: PictureBook) {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除「${item.title}」吗？删除后无法恢复。`,
    confirmColor: '#FF4D4F',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '删除中...' })
          await contentStore.removeContent(item.id)
          uni.hideLoading()
          uni.showToast({ title: '删除成功', icon: 'success' })
        } catch (e) {
          uni.hideLoading()
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

watch(currentFilter, () => {
  // 筛选变化时可以重新加载
})

onShow(() => {
  loadData(true)
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page-container {
  min-height: 100vh;
  background: $gradient-warm;
  display: flex;
  flex-direction: column;
}

.filter-bar {
  display: flex;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  background: $bg-base;
}

.filter-item {
  padding: $spacing-xs $spacing-md;
  background: $bg-card;
  border-radius: $radius-full;
  border: 2rpx solid transparent;
  transition: all $duration-fast;

  &.active {
    background: $primary;
    border-color: $primary;

    text { color: $text-white; }
  }

  text {
    font-size: $font-sm;
    color: $text-secondary;
  }
}

.content-scroll {
  flex: 1;
  padding: $spacing-md;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-sm;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx $spacing-lg;
}

.loading-icon {
  font-size: 80rpx;
  margin-bottom: $spacing-md;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: $spacing-md;
}

.empty-title {
  font-size: $font-lg;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.empty-desc {
  font-size: $font-base;
  color: $text-secondary;
  margin-bottom: $spacing-lg;
}

.empty-btn {
  padding: $spacing-sm $spacing-lg;
  background: $gradient-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-button;

  text {
    font-size: $font-base;
    font-weight: $font-semibold;
    color: $text-white;
  }

  &:active {
    transform: scale(0.95);
  }
}

.loading-more,
.no-more {
  text-align: center;
  padding: $spacing-md;

  text {
    font-size: $font-sm;
    color: $text-light;
  }
}

.safe-bottom {
  height: calc(#{$spacing-xl} + 100rpx);
}
</style>
