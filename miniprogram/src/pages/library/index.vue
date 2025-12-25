<template>
  <view class="page-container">
    <!-- 梦幻背景层 -->
    <view class="dreamy-bg">
      <view class="aurora aurora-1"></view>
      <view class="aurora aurora-2"></view>
      <view class="aurora aurora-3"></view>
      <view class="floating-orb orb-1"></view>
      <view class="floating-orb orb-2"></view>
    </view>

    <!-- 自定义导航栏 -->
    <view class="nav-bar">
      <view class="nav-content">
        <view class="nav-icon-wrap">
          <view class="nav-icon-glow"></view>
          <text class="nav-icon">📚</text>
        </view>
        <view class="nav-title-area">
          <text class="nav-title">内容库</text>
          <text class="nav-subtitle">{{ contentList.length }} 个创作</text>
        </view>
      </view>
    </view>

    <!-- 筛选栏 - 精美胶囊设计 -->
    <view class="filter-section">
      <scroll-view class="filter-scroll" scroll-x :show-scrollbar="false">
        <view class="filter-bar">
          <view
            v-for="filter in filters"
            :key="filter.value"
            class="filter-item"
            :class="{ active: currentFilter === filter.value, [`filter-${filter.value}`]: true }"
            @tap="currentFilter = filter.value"
          >
            <view class="filter-glow" v-if="currentFilter === filter.value"></view>
            <text class="filter-icon">{{ filter.icon }}</text>
            <text class="filter-name">{{ filter.name }}</text>
            <view class="filter-count" v-if="getFilterCount(filter.value) > 0">
              <text>{{ getFilterCount(filter.value) }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 内容列表 -->
    <scroll-view
      class="content-scroll"
      scroll-y
      @scrolltolower="loadMore"
      enhanced
      :show-scrollbar="false"
    >
      <!-- 骨架屏加载状态 -->
      <view v-if="loading && contentList.length === 0" class="skeleton-grid">
        <SkeletonCard v-for="i in 4" :key="i" type="vertical" />
      </view>

      <view v-else-if="contentList.length === 0" class="empty-state">
        <view class="empty-card">
          <view class="empty-illustration">
            <view class="empty-ring r1"></view>
            <view class="empty-ring r2"></view>
            <view class="empty-icon-wrap">
              <text class="empty-icon">📚</text>
            </view>
          </view>
          <text class="empty-title">还没有内容</text>
          <text class="empty-desc">去创作中心生成第一个绘本吧</text>
          <view class="empty-btn" @tap="goToCreate">
            <view class="btn-shine"></view>
            <view class="btn-content">
              <text class="btn-sparkle">✨</text>
              <text class="btn-text">开始创作</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="content-grid">
        <view
          v-for="item in contentList"
          :key="item.id"
          class="content-card"
          :class="'card-' + inferContentType(item)"
          @tap="goToDetail(item)"
          @longpress="showActionSheet(item)"
        >
          <view class="card-glow"></view>
          <view class="card-cover">
            <!-- 加载占位符 -->
            <view v-if="needsLoading(item) && !imageLoaded[item.id]" class="cover-loading">
              <view class="loading-shimmer"></view>
            </view>
            <!-- 绘本类型：图片轮播预览 -->
            <swiper
              v-if="inferContentType(item) === 'picture_book' && item.pages && item.pages.length > 1"
              class="cover-swiper"
              :autoplay="true"
              :interval="3000"
              :duration="500"
              :circular="true"
              :indicator-dots="false"
            >
              <swiper-item v-for="(page, pageIndex) in item.pages" :key="pageIndex">
                <image
                  :src="page.image_url"
                  mode="aspectFill"
                  class="swiper-img"
                  lazy-load
                  @load="onImageLoad(item.id)"
                  @error="onImageError(item.id)"
                />
              </swiper-item>
            </swiper>
            <!-- 视频类型或有视频的儿歌：无声自动播放预览 -->
            <video
              v-else-if="(inferContentType(item) === 'video' || inferContentType(item) === 'nursery_rhyme') && (item as any).video_url"
              :src="(item as any).video_url"
              :autoplay="true"
              :loop="true"
              :muted="true"
              :controls="false"
              :show-play-btn="false"
              :show-center-play-btn="false"
              :show-fullscreen-btn="false"
              :show-progress="false"
              :enable-progress-gesture="false"
              object-fit="cover"
              class="cover-video"
              @error="(e: any) => console.error('[video preview] 加载失败:', item.title, e)"
            />
            <!-- 有封面图：显示封面（绘本优先缩略图，儿歌优先原图） -->
            <image
              v-else-if="getCoverUrl(item)"
              :src="getCoverUrl(item)"
              mode="aspectFill"
              class="cover-img"
              lazy-load
              @load="onImageLoad(item.id)"
              @error="onImageError(item.id)"
            />
            <!-- 无封面也无视频：显示占位符 -->
            <view v-else class="cover-placeholder">
              <text>{{ getTypeIcon(inferContentType(item)) }}</text>
            </view>
            <view class="card-type-badge" :class="'badge-' + inferContentType(item)">
              <text class="badge-icon">{{ getTypeIcon(inferContentType(item)) }}</text>
              <text class="badge-text">{{ getTypeLabel(inferContentType(item)) }}</text>
            </view>
            <view class="play-btn" :class="'play-' + inferContentType(item)" @tap.stop="goToPlay(item)">
              <view class="play-ring"></view>
              <text class="play-icon">▶</text>
            </view>
          </view>
          <view class="card-info">
            <text class="card-title">{{ item.title }}</text>
            <view class="card-meta">
              <view v-if="item.personalization?.child_name" class="meta-child">
                <text class="meta-avatar">👶</text>
                <text class="meta-name">{{ item.personalization.child_name }}</text>
              </view>
              <text class="meta-time">{{ formatTime(item.created_at) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="(loading || contentStore.isLoadingMore) && contentList.length > 0" class="loading-more">
        <view class="loading-dots">
          <view class="dot d1"></view>
          <view class="dot d2"></view>
          <view class="dot d3"></view>
        </view>
        <text>加载更多...</text>
      </view>

      <view v-if="!hasMore && contentList.length > 0" class="no-more">
        <view class="no-more-line"></view>
        <text>已经到底啦</text>
        <view class="no-more-line"></view>
      </view>

      <!-- 底部安全区 -->
      <view class="safe-bottom"></view>
    </scroll-view>

    <!-- 素材参数弹窗 -->
    <view v-if="showAssetModal" class="asset-modal-mask" @tap="closeAssetModal">
      <view class="asset-modal" @tap.stop>
        <view class="asset-modal-header">
          <view class="header-decor"></view>
          <view class="header-content">
            <view class="header-icon">🎨</view>
            <text class="header-title">创作详情</text>
          </view>
          <view class="header-close" @tap="closeAssetModal">
            <text>×</text>
          </view>
        </view>

        <view v-if="assetLoading" class="asset-loading">
          <view class="loading-bubble">
            <view class="bubble b1"></view>
            <view class="bubble b2"></view>
            <view class="bubble b3"></view>
          </view>
          <text class="loading-text">正在加载...</text>
        </view>

        <scroll-view v-else-if="currentAssetDetails" class="asset-modal-content" scroll-y>
          <view class="overview-card" :class="{ 'nursery-rhyme': isNurseryRhyme() }">
            <view class="overview-main">
              <view class="overview-avatar">{{ isNurseryRhyme() ? '🎵' : '👶' }}</view>
              <view class="overview-info">
                <text class="overview-name">{{ currentAssetDetails.user_inputs?.child_name || '宝贝' }}的{{ isNurseryRhyme() ? '儿歌' : '绘本' }}</text>
                <text class="overview-meta">{{ currentAssetDetails.user_inputs?.creation_mode === 'smart' ? '✨ 智能创作' : '📚 预设主题' }} · {{ currentAssetDetails.total_count }}个素材</text>
              </view>
            </view>
            <view class="theme-info-row">
              <view class="theme-card category">
                <view class="theme-emoji">{{ getThemeCategoryEmoji(currentAssetDetails.user_inputs?.theme_category) }}</view>
                <view class="theme-text">
                  <text class="theme-label-cn">{{ getThemeCategoryLabel(currentAssetDetails.user_inputs?.theme_category) }}</text>
                  <text class="theme-label-en">{{ currentAssetDetails.user_inputs?.theme_category }}</text>
                </view>
              </view>
              <view class="theme-card topic">
                <view class="theme-emoji">📖</view>
                <view class="theme-text">
                  <text class="theme-label-cn">{{ currentAssetDetails.user_inputs?.theme_topic }}</text>
                  <text class="theme-label-en">主题故事</text>
                </view>
              </view>
              <view v-if="currentAssetDetails.user_inputs?.age_months" class="theme-card age">
                <view class="theme-emoji">🎂</view>
                <view class="theme-text">
                  <text class="theme-label-cn">{{ Math.floor(currentAssetDetails.user_inputs.age_months / 12) }}岁{{ currentAssetDetails.user_inputs.age_months % 12 ? currentAssetDetails.user_inputs.age_months % 12 + '个月' : '' }}</text>
                  <text class="theme-label-en">年龄</text>
                </view>
              </view>
            </view>
          </view>

          <view v-if="currentAssetDetails.user_inputs?.custom_prompt" class="prompt-card">
            <view class="prompt-header">
              <text class="prompt-icon">💭</text>
              <text class="prompt-label">创作灵感</text>
            </view>
            <text class="prompt-content">{{ currentAssetDetails.user_inputs.custom_prompt }}</text>
          </view>

          <!-- 绘本配置区块 -->
          <view v-if="!isNurseryRhyme()" class="config-section">
            <view class="config-section-header">
              <text class="config-section-icon">⚙️</text>
              <text class="config-section-title">创作配置</text>
            </view>
            <view class="config-flow">
              <view v-if="currentAssetDetails.generation_config?.image" class="config-group">
                <view class="config-group-label">
                  <text class="group-icon">🖼</text>
                  <text class="group-text">图片</text>
                </view>
                <view class="config-tags">
                  <view class="config-tag image">
                    <text class="tag-icon">🎨</text>
                    <text class="tag-label">风格</text>
                    <text class="tag-value">{{ getStyleLabel(currentAssetDetails.generation_config.image.style) }}</text>
                  </view>
                  <view class="config-tag image">
                    <text class="tag-icon">📐</text>
                    <text class="tag-label">尺寸</text>
                    <text class="tag-value">{{ currentAssetDetails.generation_config.image.width }}×{{ currentAssetDetails.generation_config.image.height }}</text>
                  </view>
                  <view class="config-tag image">
                    <text class="tag-icon">🌈</text>
                    <text class="tag-label">色调</text>
                    <text class="tag-value">{{ getColorPaletteLabel(currentAssetDetails.generation_config.image.color_palette) }}</text>
                  </view>
                  <view v-if="currentAssetDetails.generation_config.image.protagonist" class="config-tag image">
                    <text class="tag-icon">🐰</text>
                    <text class="tag-label">主角</text>
                    <text class="tag-value">{{ getProtagonistLabel(currentAssetDetails.generation_config.image.protagonist.animal) }}</text>
                  </view>
                </view>
              </view>
              <view v-if="currentAssetDetails.generation_config?.audio" class="config-group">
                <view class="config-group-label">
                  <text class="group-icon">🔊</text>
                  <text class="group-text">音频</text>
                </view>
                <view class="config-tags">
                  <view class="config-tag audio">
                    <text class="tag-icon">🎙</text>
                    <text class="tag-label">音色</text>
                    <text class="tag-value">{{ getVoiceLabel(currentAssetDetails.generation_config.audio.voice_id) }}</text>
                  </view>
                  <view class="config-tag audio">
                    <text class="tag-icon">📄</text>
                    <text class="tag-label">素材</text>
                    <text class="tag-value">{{ currentAssetDetails.assets?.filter(a => a.type === 'audio').length || 0 }}段旁白</text>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 儿歌提示词增强区块 -->
          <view v-if="isNurseryRhyme() && getNurseryRhymePromptEnhancement()" class="prompt-enhance-card">
            <view class="prompt-enhance-header">
              <text class="prompt-enhance-icon">✨</text>
              <text class="prompt-enhance-title">提示词增强</text>
              <text class="prompt-enhance-model">{{ getNurseryRhymePromptEnhancement()?.model || '' }}</text>
            </view>
            <view class="prompt-compare">
              <view class="prompt-item original">
                <text class="prompt-item-label">💭 用户创意</text>
                <text class="prompt-item-content">{{ getNurseryRhymePromptEnhancement()?.original || '-' }}</text>
              </view>
              <view class="prompt-arrow">→</view>
              <view class="prompt-item enhanced">
                <text class="prompt-item-label">🚀 增强后</text>
                <text class="prompt-item-content">{{ getNurseryRhymePromptEnhancement()?.enhanced || '-' }}</text>
              </view>
            </view>
          </view>

          <!-- 儿歌音乐参数区块 -->
          <view v-if="isNurseryRhyme() && getNurseryRhymeMusicConfig()" class="music-config-section">
            <view class="music-config-header">
              <text class="music-config-icon">🎵</text>
              <text class="music-config-title">音乐生成参数</text>
            </view>
            <view class="music-config-content">
              <!-- 基础信息行 -->
              <view class="music-info-row">
                <view v-if="getNurseryRhymeMusicConfig()?.music_mood" class="music-info-item">
                  <text class="info-label">风格</text>
                  <text class="info-value">{{ getMusicLabel('music_mood', getNurseryRhymeMusicConfig()?.music_mood || '') }}</text>
                </view>
                <view v-if="getNurseryRhymeMusicConfig()?.music_genre" class="music-info-item">
                  <text class="info-label">流派</text>
                  <text class="info-value">{{ getMusicLabel('music_genre', getNurseryRhymeMusicConfig()?.music_genre || '') }}</text>
                </view>
                <view v-if="getNurseryRhymeMusicConfig()?.tempo" class="music-info-item">
                  <text class="info-label">节奏</text>
                  <text class="info-value">{{ getNurseryRhymeMusicConfig()?.tempo }} BPM</text>
                </view>
                <view v-if="getNurseryRhymeMusicConfig()?.energy_level" class="music-info-item">
                  <text class="info-label">能量</text>
                  <text class="info-value">{{ getNurseryRhymeMusicConfig()?.energy_level }}/10</text>
                </view>
              </view>

              <!-- 人声设置 -->
              <view class="music-group">
                <view class="music-group-label">
                  <text class="group-icon">🎤</text>
                  <text class="group-text">人声</text>
                </view>
                <view class="music-tags">
                  <view v-if="getNurseryRhymeMusicConfig()?.vocal_type" class="music-tag vocal">
                    <text class="tag-label">类型</text>
                    <text class="tag-value">{{ getMusicLabel('vocal_type', getNurseryRhymeMusicConfig()?.vocal_type || '') }}</text>
                  </view>
                  <view v-if="getNurseryRhymeMusicConfig()?.vocal_emotion" class="music-tag vocal">
                    <text class="tag-label">情感</text>
                    <text class="tag-value">{{ getMusicLabel('vocal_emotion', getNurseryRhymeMusicConfig()?.vocal_emotion || '') }}</text>
                  </view>
                  <view v-if="getNurseryRhymeMusicConfig()?.vocal_style" class="music-tag vocal">
                    <text class="tag-label">风格</text>
                    <text class="tag-value">{{ getMusicLabel('vocal_style', getNurseryRhymeMusicConfig()?.vocal_style || '') }}</text>
                  </view>
                </view>
              </view>

              <!-- 乐器与音效 -->
              <view v-if="(getNurseryRhymeMusicConfig()?.instruments?.length || 0) > 0 || (getNurseryRhymeMusicConfig()?.sound_effects?.length || 0) > 0" class="music-group">
                <view class="music-group-label">
                  <text class="group-icon">🎹</text>
                  <text class="group-text">乐器&音效</text>
                </view>
                <view class="music-tags">
                  <view v-if="(getNurseryRhymeMusicConfig()?.instruments?.length || 0) > 0" class="music-tag instrument">
                    <text class="tag-label">乐器</text>
                    <text class="tag-value">{{ formatArrayLabels(getNurseryRhymeMusicConfig()?.instruments, getInstrumentLabel) }}</text>
                  </view>
                  <view v-if="(getNurseryRhymeMusicConfig()?.sound_effects?.length || 0) > 0" class="music-tag effect">
                    <text class="tag-label">音效</text>
                    <text class="tag-value">{{ formatArrayLabels(getNurseryRhymeMusicConfig()?.sound_effects, getSoundEffectLabel) }}</text>
                  </view>
                </view>
              </view>

              <!-- 其他设置 -->
              <view class="music-group">
                <view class="music-group-label">
                  <text class="group-icon">🌐</text>
                  <text class="group-text">其他</text>
                </view>
                <view class="music-tags">
                  <view v-if="getNurseryRhymeMusicConfig()?.language" class="music-tag other">
                    <text class="tag-label">语言</text>
                    <text class="tag-value">{{ getMusicLabel('language', getNurseryRhymeMusicConfig()?.language || '') }}</text>
                  </view>
                  <view v-if="getNurseryRhymeMusicConfig()?.song_structure" class="music-tag other">
                    <text class="tag-label">结构</text>
                    <text class="tag-value">{{ getMusicLabel('song_structure', getNurseryRhymeMusicConfig()?.song_structure || '') }}</text>
                  </view>
                  <view v-if="getNurseryRhymeMusicConfig()?.cultural_style" class="music-tag other">
                    <text class="tag-label">文化</text>
                    <text class="tag-value">{{ getMusicLabel('cultural_style', getNurseryRhymeMusicConfig()?.cultural_style || '') }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 儿歌歌词区块 -->
          <view v-if="isNurseryRhyme() && getNurseryRhymeLyricsConfig()" class="lyrics-card">
            <view class="lyrics-header">
              <text class="lyrics-icon">📝</text>
              <text class="lyrics-title">歌词</text>
              <view v-if="getNurseryRhymeLyricsConfig()?.has_timestamps" class="lyrics-badge">
                <text>⏱ 带时间戳</text>
              </view>
            </view>
            <scroll-view class="lyrics-content" scroll-y>
              <text class="lyrics-text">{{ getNurseryRhymeLyricsConfig()?.full_text || '暂无歌词' }}</text>
            </scroll-view>
          </view>

          <view class="models-card" :class="{ 'nursery-rhyme': isNurseryRhyme() }">
            <view class="models-header">
              <text class="models-icon">🤖</text>
              <text class="models-title">AI 模型</text>
            </view>
            <!-- 绘本模型 -->
            <view v-if="!isNurseryRhyme()" class="models-list">
              <view class="model-item">
                <view class="model-dot story"></view>
                <text class="model-label">故事</text>
                <text class="model-value">{{ currentAssetDetails.generated_by?.story_model || '-' }}</text>
              </view>
              <view class="model-item">
                <view class="model-dot image"></view>
                <text class="model-label">图片</text>
                <text class="model-value">{{ currentAssetDetails.generation_config?.image?.model !== 'unknown' ? currentAssetDetails.generation_config?.image?.model : '-' }}</text>
              </view>
              <view class="model-item">
                <view class="model-dot audio"></view>
                <text class="model-label">语音</text>
                <text class="model-value">{{ currentAssetDetails.generation_config?.audio?.model !== 'unknown' ? currentAssetDetails.generation_config?.audio?.model : '-' }}</text>
              </view>
            </view>
            <!-- 儿歌模型 -->
            <view v-else class="models-list">
              <view class="model-item">
                <view class="model-dot prompt"></view>
                <text class="model-label">提示词</text>
                <text class="model-value">{{ currentAssetDetails.generated_by?.prompt_model || '-' }}</text>
              </view>
              <view class="model-item">
                <view class="model-dot music"></view>
                <text class="model-label">音乐</text>
                <text class="model-value">{{ currentAssetDetails.generated_by?.music_model || getNurseryRhymeMusicConfig()?.model || '-' }}</text>
              </view>
            </view>
          </view>

          <view v-if="currentAssetDetails.enhancement_params?.story_enhancement || currentAssetDetails.enhancement_params?.visual_enhancement" class="enhance-card">
            <view class="enhance-header">
              <text class="enhance-icon">✨</text>
              <text class="enhance-title">风格增强</text>
            </view>
            <view v-if="currentAssetDetails.enhancement_params.story_enhancement" class="enhance-group">
              <text class="enhance-label">📖 故事</text>
              <view class="enhance-pills">
                <text v-if="currentAssetDetails.enhancement_params.story_enhancement.narrative_pace" class="pill story">{{ getStoryLabel('narrative_pace', currentAssetDetails.enhancement_params.story_enhancement.narrative_pace) }}</text>
                <text v-if="currentAssetDetails.enhancement_params.story_enhancement.interaction_density" class="pill story">{{ getStoryLabel('interaction_density', currentAssetDetails.enhancement_params.story_enhancement.interaction_density) }}</text>
                <text v-if="currentAssetDetails.enhancement_params.story_enhancement.educational_focus" class="pill story">{{ getStoryLabel('educational_focus', currentAssetDetails.enhancement_params.story_enhancement.educational_focus) }}</text>
                <text v-if="currentAssetDetails.enhancement_params.story_enhancement.language_style" class="pill story">{{ getStoryLabel('language_style', currentAssetDetails.enhancement_params.story_enhancement.language_style) }}</text>
                <text v-if="currentAssetDetails.enhancement_params.story_enhancement.plot_complexity" class="pill story">{{ getStoryLabel('plot_complexity', currentAssetDetails.enhancement_params.story_enhancement.plot_complexity) }}</text>
                <text v-if="currentAssetDetails.enhancement_params.story_enhancement.ending_style" class="pill story">{{ getStoryLabel('ending_style', currentAssetDetails.enhancement_params.story_enhancement.ending_style) }}</text>
              </view>
            </view>
            <view v-if="currentAssetDetails.enhancement_params.visual_enhancement" class="enhance-group">
              <text class="enhance-label">🎨 视觉</text>
              <view class="enhance-pills">
                <text v-if="currentAssetDetails.enhancement_params.visual_enhancement.time_atmosphere" class="pill visual">{{ getVisualLabel('time_atmosphere', currentAssetDetails.enhancement_params.visual_enhancement.time_atmosphere) }}</text>
                <text v-if="currentAssetDetails.enhancement_params.visual_enhancement.scene_environment" class="pill visual">{{ getVisualLabel('scene_environment', currentAssetDetails.enhancement_params.visual_enhancement.scene_environment) }}</text>
                <text v-if="currentAssetDetails.enhancement_params.visual_enhancement.emotional_tone" class="pill visual">{{ getVisualLabel('emotional_tone', currentAssetDetails.enhancement_params.visual_enhancement.emotional_tone) }}</text>
                <text v-if="currentAssetDetails.enhancement_params.visual_enhancement.composition_style" class="pill visual">{{ getVisualLabel('composition_style', currentAssetDetails.enhancement_params.visual_enhancement.composition_style) }}</text>
                <text v-if="currentAssetDetails.enhancement_params.visual_enhancement.lighting_effect" class="pill visual">{{ getVisualLabel('lighting_effect', currentAssetDetails.enhancement_params.visual_enhancement.lighting_effect) }}</text>
              </view>
            </view>
          </view>

          <view v-if="currentAssetDetails.assets?.length" class="assets-section">
            <view class="assets-header">
              <text class="assets-icon">📄</text>
              <text class="assets-title">素材详情</text>
              <text class="assets-count">{{ currentAssetDetails.assets.length }}项</text>
            </view>
            <!-- 绘本素材列表 -->
            <view v-if="!isNurseryRhyme()" class="assets-list">
              <view
                v-for="(asset, index) in currentAssetDetails.assets"
                :key="index"
                class="asset-card"
                :class="asset.type"
              >
                <view class="asset-badge">
                  <text class="badge-icon">{{ asset.type === 'image' ? '🖼' : '🔊' }}</text>
                  <text class="badge-text">P{{ asset.page_num }}</text>
                </view>
                <view v-if="asset.type === 'image' && asset.prompt" class="asset-content">
                  <text class="content-label">Prompt</text>
                  <text class="content-text">{{ asset.prompt }}</text>
                </view>
                <view v-if="asset.type === 'audio'" class="asset-content">
                  <view v-if="asset.text" class="audio-text-wrap">
                    <text class="content-label">旁白</text>
                    <text class="content-text audio">{{ asset.text }}</text>
                  </view>
                  <view v-if="asset.duration" class="audio-duration">
                    <text class="duration-icon">⏱</text>
                    <text class="duration-val">{{ asset.duration.toFixed(1) }}s</text>
                  </view>
                </view>
              </view>
            </view>
            <!-- 儿歌素材列表 -->
            <view v-else class="assets-list nursery-rhyme">
              <view
                v-for="(asset, index) in currentAssetDetails.assets"
                :key="index"
                class="asset-card"
                :class="asset.type"
              >
                <view class="asset-badge" :class="asset.type">
                  <text class="badge-icon">{{ getAssetTypeIcon(asset.type) }}</text>
                  <text class="badge-text">{{ getAssetTypeLabel(asset.type) }}</text>
                </view>
                <view class="asset-info">
                  <view v-if="asset.duration" class="asset-duration">
                    <text class="duration-icon">⏱</text>
                    <text class="duration-val">{{ formatDuration(asset.duration) }}</text>
                  </view>
                  <view v-if="asset.track_num" class="asset-track">
                    <text class="track-label">音轨</text>
                    <text class="track-num">#{{ asset.track_num }}</text>
                  </view>
                  <view v-if="asset.format" class="asset-format">
                    <text>{{ asset.format.toUpperCase() }}</text>
                  </view>
                  <view v-if="asset.source" class="asset-source">
                    <text>{{ asset.source }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <view class="modal-safe-bottom"></view>
        </scroll-view>
      </view>
    </view>

    <!-- 删除确认弹窗 -->
    <view v-if="showDeleteModal" class="delete-modal-mask" @tap="cancelDelete">
      <view class="delete-modal" :class="{ active: showDeleteModal }" @tap.stop>
        <view class="delete-icon-wrap">
          <text class="delete-icon">🥺</text>
        </view>
        <view v-if="deleteTarget" class="delete-preview">
          <image
            v-if="getDeleteTargetCover()"
            class="delete-cover"
            :src="getDeleteTargetCover()"
            mode="aspectFill"
          />
          <view v-else class="delete-cover-placeholder">📚</view>
          <text class="delete-title">{{ deleteTarget.title }}</text>
        </view>
        <view class="delete-message">
          <text class="message-main">确定要删除这个作品吗？</text>
          <text class="message-sub">删除后将无法恢复哦~</text>
        </view>
        <view class="delete-buttons">
          <view class="delete-btn cancel" @tap="cancelDelete">
            <text>再想想</text>
          </view>
          <view class="delete-btn confirm" :class="{ loading: isDeleting }" @tap="executeDelete">
            <text v-if="!isDeleting">确认删除</text>
            <text v-else>删除中...</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useContentStore } from '@/stores/content'
import { getContentDetail, getAssetDetails, type PictureBook, type AssetDetailsResponse, type NurseryRhymeGenerationConfig, type MusicGenerationConfig } from '@/api/content'
import SkeletonCard from '@/components/SkeletonCard/SkeletonCard.vue'

const contentStore = useContentStore()

const filters = [
  { name: '全部', value: 'all', icon: '🌟' },
  { name: '绘本', value: 'picture_book', icon: '📚' },
  { name: '儿歌', value: 'nursery_rhyme', icon: '🎵' },
  { name: '视频', value: 'video', icon: '🎬' }
]

const currentFilter = ref('all')
const loading = ref(false)
const hasMore = ref(true)

const imageLoaded = ref<Record<string, boolean>>({})

const showAssetModal = ref(false)
const assetLoading = ref(false)
const currentAssetDetails = ref<AssetDetailsResponse | null>(null)

const showDeleteModal = ref(false)
const deleteTarget = ref<PictureBook | null>(null)
const isDeleting = ref(false)

function onImageLoad(id: string) {
  imageLoaded.value[id] = true
}

function onImageError(id: string) {
  imageLoaded.value[id] = true
}

function needsLoading(item: any): boolean {
  const contentType = inferContentType(item)
  if (contentType === 'video') {
    return false
  }
  if (contentType === 'picture_book' && item.pages && item.pages.length > 0) {
    return true
  }
  if (contentType === 'nursery_rhyme' && item.cover_url) {
    return true
  }
  return false
}

const contentList = computed(() => {
  if (currentFilter.value === 'all') {
    return contentStore.generatedList
  }
  return contentStore.generatedList.filter(
    item => inferContentType(item) === currentFilter.value
  )
})

function getFilterCount(filterValue: string): number {
  if (filterValue === 'all') {
    return contentStore.generatedList.length
  }
  return contentStore.generatedList.filter(
    item => inferContentType(item) === filterValue
  ).length
}

function inferContentType(item: any): string {
  if (item.content_type) return item.content_type
  if (item.video_url) return 'video'
  if (item.audio_url && !item.pages) return 'nursery_rhyme'
  return 'picture_book'
}

// 获取封面 URL（列表页优先使用缩略图以加快加载）
function getCoverUrl(item: any): string {
  const contentType = inferContentType(item)
  // 绘本优先使用缩略图（8KB vs 45KB+）
  if (contentType === 'picture_book') {
    return item.cover_thumb_url || item.cover_url || ''
  }
  // 儿歌优先使用 cover_url，其次 suno_cover_url
  return item.cover_url || item.suno_cover_url || ''
}

function getTypeIcon(type: string) {
  const icons: Record<string, string> = {
    picture_book: '📚',
    nursery_rhyme: '🎵',
    video: '🎬'
  }
  return icons[type] || '📚'
}

function getTypeLabel(type: string) {
  const labels: Record<string, string> = {
    picture_book: '绘本',
    nursery_rhyme: '儿歌',
    video: '视频'
  }
  return labels[type] || '绘本'
}

function formatTime(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return `${date.getMonth() + 1}/${date.getDate()}`
}

async function loadData(refresh = false) {
  if (loading.value) return

  loading.value = true
  try {
    if (refresh) {
      imageLoaded.value = {}
    }

    await contentStore.fetchGeneratedList(refresh)
    hasMore.value = contentStore.hasMoreContent

    await fetchContentDetails()
  } catch (e) {
    console.error('加载失败:', e)
  } finally {
    loading.value = false
  }
}

async function fetchContentDetails() {
  const needsDetail = contentStore.generatedList.filter((item: any) => {
    return item.content_type === 'picture_book' && (!item.pages || item.pages.length === 0)
  })

  if (needsDetail.length === 0) return

  const detailPromises = needsDetail.map(async (book: any) => {
    try {
      const detail = await getContentDetail(book.id)
      const index = contentStore.generatedList.findIndex(item => item.id === book.id)
      if (index !== -1) {
        contentStore.generatedList[index] = { ...contentStore.generatedList[index], ...detail }
      }
    } catch (e) {
      console.error('[library] 获取绘本详情失败:', book.title, e)
    }
  })

  await Promise.all(detailPromises)
}

async function loadMore() {
  if (!hasMore.value || loading.value || contentStore.isLoadingMore) return

  try {
    await contentStore.fetchMoreContent()
    hasMore.value = contentStore.hasMoreContent

    // 补充新加载内容的详情
    await fetchContentDetails()
  } catch (e) {
    console.error('加载更多失败:', e)
  }
}

function goToCreate() {
  uni.switchTab({ url: '/pages/create/index' })
}

function goToDetail(item: PictureBook) {
  const contentType = inferContentType(item)
  if (contentType === 'nursery_rhyme') {
    uni.navigateTo({ url: `/pages/play/nursery-rhyme?id=${item.id}` })
  } else if (contentType === 'video') {
    uni.navigateTo({ url: `/pages/play/video?id=${item.id}` })
  } else {
    uni.navigateTo({ url: `/pages/play/picture-book?id=${item.id}` })
  }
}

function goToPlay(item: PictureBook) {
  const contentType = inferContentType(item)
  if (contentType === 'nursery_rhyme') {
    uni.navigateTo({ url: `/pages/play/nursery-rhyme?id=${item.id}&autoplay=1` })
  } else if (contentType === 'video') {
    uni.navigateTo({ url: `/pages/play/video?id=${item.id}` })
  } else {
    uni.navigateTo({ url: `/pages/play/picture-book?id=${item.id}&autoplay=1` })
  }
}

function showActionSheet(item: PictureBook) {
  uni.showActionSheet({
    itemList: ['查看素材参数', '删除'],
    success: (res) => {
      if (res.tapIndex === 0) {
        viewAssetDetails(item)
      } else if (res.tapIndex === 1) {
        confirmDelete(item)
      }
    }
  })
}

async function viewAssetDetails(item: PictureBook) {
  showAssetModal.value = true
  assetLoading.value = true
  currentAssetDetails.value = null

  try {
    const details = await getAssetDetails(item.id)
    currentAssetDetails.value = details
  } catch (e) {
    console.error('[library] 获取素材参数失败:', e)
    uni.showToast({ title: '获取失败', icon: 'none' })
    showAssetModal.value = false
  } finally {
    assetLoading.value = false
  }
}

function closeAssetModal() {
  showAssetModal.value = false
  currentAssetDetails.value = null
}

const STYLE_LABELS: Record<string, Record<string, string>> = {
  art_style: {
    pixar_3d: '皮克斯3D',
    watercolor: '水彩画',
    flat_vector: '扁平矢量',
    crayon: '蜡笔画',
    anime: '动漫风格',
    storybook: '绘本风格',
    cartoon: '卡通风格'
  },
  color_palette: {
    pastel: '柔和粉彩',
    vibrant: '鲜艳明亮',
    warm: '温暖色调',
    cool: '冷色调',
    monochrome: '单色调'
  },
  protagonist: {
    bunny: '小兔子',
    bear: '小熊',
    cat: '小猫',
    dog: '小狗',
    panda: '熊猫',
    fox: '小狐狸'
  },
  narrative_pace: { relaxed: '轻松舒缓', lively: '紧凑活泼', progressive: '循序渐进' },
  interaction_density: { minimal: '少互动', moderate: '适中', intensive: '多互动' },
  educational_focus: { cognitive: '认知学习', behavioral: '行为引导', emotional: '情感培养', imaginative: '想象激发' },
  language_style: { simple: '简洁直白', rhythmic: '韵律押韵', onomatopoeia: '拟声丰富', repetitive: '重复强化' },
  plot_complexity: { linear: '简单线性', twist: '有小波折', ensemble: '多角色互动' },
  ending_style: { warm: '温馨收尾', open: '开放想象', summary: '总结回顾' },
  time_atmosphere: { morning: '清晨阳光', afternoon: '午后温暖', sunset: '傍晚金色', night: '夜晚星空', dreamy: '梦幻魔法' },
  scene_environment: { indoor: '温馨室内', garden: '花园户外', forest: '森林探险', beach: '海边沙滩', clouds: '云端梦境' },
  emotional_tone: { cheerful: '欢乐活泼', cozy: '温馨甜蜜', playful: '轻松幽默', peaceful: '安静祥和', curious: '神秘好奇' },
  composition_style: { close_up: '角色特写', panorama: '全景场景', interaction: '互动场景', narrative: '故事叙事' },
  lighting_effect: { soft_natural: '柔和自然', warm_sunlight: '温暖阳光', dreamy_glow: '梦幻光晕', cozy_lamp: '夜灯温馨' }
}

function getStyleLabel(style: string): string {
  return STYLE_LABELS.art_style[style] || style
}

function getColorPaletteLabel(palette: string): string {
  return STYLE_LABELS.color_palette[palette] || palette
}

function getProtagonistLabel(animal: string): string {
  return STYLE_LABELS.protagonist[animal] || animal
}

function getStoryLabel(key: string, value: string): string {
  return STYLE_LABELS[key]?.[value] || value
}

function getVisualLabel(key: string, value: string): string {
  return STYLE_LABELS[key]?.[value] || value
}

const THEME_CATEGORY_EMOJI: Record<string, string> = {
  friendship: '👫',
  emotions: '💝',
  family: '👨‍👩‍👧',
  nature: '🌿',
  animals: '🐾',
  adventure: '🚀',
  daily_life: '🏠',
  cognition: '🧠',
  seasons: '🌸',
  imagination: '✨'
}

const THEME_CATEGORY_LABELS: Record<string, string> = {
  friendship: '友谊',
  emotions: '情感',
  family: '家庭',
  nature: '自然',
  animals: '动物',
  adventure: '冒险',
  daily_life: '日常生活',
  cognition: '认知学习',
  seasons: '季节',
  imagination: '想象力'
}

const VOICE_LABELS: Record<string, string> = {
  Kore: '可蕊 · 温柔女声',
  Charon: '沙龙 · 稳重男声',
  Fenrir: '芬里尔 · 活泼童声',
  Aoede: '奥德 · 甜美女声',
  Puck: '帕克 · 调皮童声'
}

// 儿歌音乐参数标签映射
const MUSIC_LABELS: Record<string, Record<string, string>> = {
  music_mood: {
    cheerful: '欢快活泼',
    gentle: '温柔舒缓',
    playful: '调皮有趣',
    lullaby: '摇篮曲',
    educational: '教育启蒙',
    energetic: '活力充沛',
    mysterious: '神秘探索',
    inspiring: '励志向上',
    relaxed: '轻松惬意'
  },
  music_genre: {
    pop: '流行',
    rock: '摇滚',
    jazz: '爵士',
    classical: '古典',
    folk: '民谣',
    electronic: '电子',
    hiphop: '嘻哈',
    country: '乡村',
    reggae: '雷鬼'
  },
  vocal_type: {
    soft_female: '柔和女声',
    warm_male: '温暖男声',
    child: '童声',
    child_voice: '童声',
    chorus: '合唱',
    duet: '二重唱',
    instrumental: '纯音乐'
  },
  vocal_emotion: {
    happy: '快乐',
    tender: '温柔',
    playful: '调皮',
    calm: '平静',
    dreamy: '梦幻',
    passionate: '热情',
    gentle: '温和',
    mysterious: '神秘'
  },
  vocal_style: {
    clear: '清晰',
    breathy: '气声',
    powerful: '有力',
    soft: '柔和'
  },
  song_structure: {
    simple: '简单',
    standard: '标准',
    full: '完整',
    chorus_only: '仅副歌',
    progressive: '渐进式',
    narrative: '叙事型',
    call_response: '呼应式',
    rap: '说唱',
    aaba: 'AABA',
    custom: '自定义'
  },
  language: {
    chinese: '中文',
    english: '英文',
    japanese: '日语',
    korean: '韩语',
    spanish: '西班牙语',
    french: '法语'
  },
  cultural_style: {
    chinese: '中式',
    western: '西式',
    japanese: '日式',
    korean: '韩式',
    latin: '拉丁',
    african: '非洲'
  }
}

// 乐器标签映射
const INSTRUMENT_LABELS: Record<string, string> = {
  piano: '钢琴',
  guitar: '吉他',
  ukulele: '尤克里里',
  xylophone: '木琴',
  drums: '鼓',
  violin: '小提琴',
  flute: '长笛',
  saxophone: '萨克斯',
  trumpet: '小号',
  harmonica: '口琴',
  accordion: '手风琴',
  bells: '铃铛',
  maracas: '沙锤',
  tambourine: '铃鼓'
}

// 音效标签映射
const SOUND_EFFECT_LABELS: Record<string, string> = {
  nature: '自然声',
  animal: '动物声',
  clap: '拍手',
  laugh: '笑声',
  cheer: '欢呼',
  whistle: '口哨',
  bell: '铃声',
  water: '水声',
  bird: '鸟鸣',
  rain: '雨声'
}

function getThemeCategoryEmoji(category: string): string {
  return THEME_CATEGORY_EMOJI[category] || '📚'
}

function getThemeCategoryLabel(category: string): string {
  return THEME_CATEGORY_LABELS[category] || category
}

function getVoiceLabel(voiceId: string): string {
  return VOICE_LABELS[voiceId] || voiceId
}

// 获取音乐参数标签
function getMusicLabel(key: string, value: string): string {
  return MUSIC_LABELS[key]?.[value] || value
}

// 获取乐器标签
function getInstrumentLabel(instrument: string): string {
  return INSTRUMENT_LABELS[instrument] || instrument
}

// 获取音效标签
function getSoundEffectLabel(effect: string): string {
  return SOUND_EFFECT_LABELS[effect] || effect
}

// 判断是否为儿歌类型
function isNurseryRhyme(): boolean {
  return currentAssetDetails.value?.content_type === 'nursery_rhyme'
}

// 获取儿歌音乐配置
function getNurseryRhymeMusicConfig(): MusicGenerationConfig | null {
  if (!isNurseryRhyme() || !currentAssetDetails.value) return null
  const config = currentAssetDetails.value.generation_config as NurseryRhymeGenerationConfig
  return config?.music || null
}

// 获取儿歌歌词配置
function getNurseryRhymeLyricsConfig() {
  if (!isNurseryRhyme() || !currentAssetDetails.value) return null
  const config = currentAssetDetails.value.generation_config as NurseryRhymeGenerationConfig
  return config?.lyrics || null
}

// 获取儿歌提示词增强
function getNurseryRhymePromptEnhancement() {
  if (!isNurseryRhyme() || !currentAssetDetails.value) return null
  return currentAssetDetails.value.enhancement_params?.prompt_enhancement || null
}

// 格式化数组为显示文本
function formatArrayLabels(arr: string[] | undefined, labelFn: (s: string) => string): string {
  if (!arr || arr.length === 0) return '-'
  return arr.map(labelFn).join('、')
}

// 格式化时长
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 获取素材类型图标
function getAssetTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    image: '🖼',
    audio: '🔊',
    cover_image: '🎨',
    suno_cover: '🎵',
    video: '🎬',
    audio_track: '🎧'
  }
  return icons[type] || '📄'
}

// 获取素材类型标签
function getAssetTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    image: '图片',
    audio: '音频',
    cover_image: '封面',
    suno_cover: 'Suno封面',
    video: '视频',
    audio_track: '音轨'
  }
  return labels[type] || type
}

function confirmDelete(item: PictureBook) {
  deleteTarget.value = item
  showDeleteModal.value = true
}

function cancelDelete() {
  showDeleteModal.value = false
  deleteTarget.value = null
}

async function executeDelete() {
  if (!deleteTarget.value || isDeleting.value) return

  isDeleting.value = true
  try {
    await contentStore.removeContent(deleteTarget.value.id)
    showDeleteModal.value = false
    deleteTarget.value = null
    uni.showToast({ title: '删除成功', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '删除失败', icon: 'none' })
  } finally {
    isDeleting.value = false
  }
}

function getDeleteTargetCover(): string {
  if (!deleteTarget.value) return ''
  const item = deleteTarget.value
  if (item.pages && item.pages.length > 0) {
    return item.pages[0].image_url || ''
  }
  if (item.cover_url) {
    return item.cover_url
  }
  return ''
}

watch(currentFilter, () => {
})

onShow(() => {
  // 只在列表为空时刷新，避免每次都清空图片加载状态
  // 用户可以通过下拉刷新来主动更新数据
  if (contentStore.generatedList.length === 0) {
    loadData(true)
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page-container {
  min-height: 100vh;
  background: $bg-cream;
  display: flex;
  flex-direction: column;
  width: 750rpx;
  overflow: hidden;
  position: relative;
}

// ============================================
// 梦幻背景层
// ============================================
.dreamy-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.aurora {
  position: absolute;
  border-radius: 50%;
  filter: blur(60rpx);
  opacity: 0.4;

  &.aurora-1 {
    width: 400rpx;
    height: 400rpx;
    background: linear-gradient(135deg, $book-light 0%, rgba($book-primary, 0.3) 100%);
    top: -100rpx;
    right: -80rpx;
    animation: auroraFloat 8s ease-in-out infinite;
  }

  &.aurora-2 {
    width: 350rpx;
    height: 350rpx;
    background: linear-gradient(135deg, $song-light 0%, rgba($song-primary, 0.3) 100%);
    top: 45%;
    left: -100rpx;
    animation: auroraFloat 10s ease-in-out infinite 2s;
  }

  &.aurora-3 {
    width: 300rpx;
    height: 300rpx;
    background: linear-gradient(135deg, $video-light 0%, rgba($video-primary, 0.3) 100%);
    bottom: 10%;
    right: -60rpx;
    animation: auroraFloat 12s ease-in-out infinite 4s;
  }
}

@keyframes auroraFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(20rpx, -30rpx) scale(1.05); }
  66% { transform: translate(-15rpx, 20rpx) scale(0.95); }
}

.floating-orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(255,255,255,0));
  opacity: 0.5;

  &.orb-1 {
    width: 60rpx;
    height: 60rpx;
    top: 25%;
    right: 15%;
    animation: orbFloat 6s ease-in-out infinite;
  }

  &.orb-2 {
    width: 40rpx;
    height: 40rpx;
    bottom: 30%;
    left: 12%;
    animation: orbFloat 8s ease-in-out infinite 1s;
  }
}

@keyframes orbFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-25rpx); }
}

// ============================================
// 导航栏
// ============================================
.nav-bar {
  position: relative;
  z-index: 10;
  padding: calc(env(safe-area-inset-top) + 60rpx) 32rpx 24rpx;
}

.nav-content {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.nav-icon-wrap {
  position: relative;
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: $radius-lg;
  background: $gradient-dreamy;
  filter: blur(12rpx);
  opacity: 0.6;
}

.nav-icon {
  position: relative;
  z-index: 1;
  font-size: 40rpx;
}

.nav-title-area {
  flex: 1;
}

.nav-title {
  display: block;
  font-size: 44rpx;
  font-weight: 800;
  color: $text-primary;
}

.nav-subtitle {
  display: block;
  font-size: $font-sm;
  color: $text-tertiary;
  margin-top: 4rpx;
}

// ============================================
// 筛选栏
// ============================================
.filter-section {
  position: relative;
  z-index: 10;
  padding: 0 0 16rpx;
}

.filter-scroll {
  padding: 0 32rpx;
}

.filter-bar {
  display: flex;
  gap: 16rpx;
  padding-right: 32rpx;
}

.filter-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  background: rgba(255, 255, 255, 0.9);
  border: 2rpx solid rgba(255, 255, 255, 0.8);
  border-radius: $radius-full;
  box-shadow: $shadow-sm;
  flex-shrink: 0;
  overflow: hidden;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.95);
  }

  &.active {
    border-color: transparent;
    box-shadow: $shadow-md;

    .filter-name {
      font-weight: 600;
    }
  }

  &.filter-all.active {
    background: linear-gradient(135deg, #FFF8F5 0%, #FFE8E0 100%);
    .filter-name { color: $primary; }
    .filter-glow { background: $gradient-primary; }
    .filter-count { background: $primary; }
  }

  &.filter-picture_book.active {
    background: linear-gradient(135deg, #FFF8F5 0%, $book-light 100%);
    .filter-name { color: $book-primary; }
    .filter-glow { background: $book-gradient; }
    .filter-count { background: $book-primary; }
  }

  &.filter-nursery_rhyme.active {
    background: linear-gradient(135deg, #F8FFF8 0%, $song-light 100%);
    .filter-name { color: $song-primary; }
    .filter-glow { background: $song-gradient; }
    .filter-count { background: $song-primary; }
  }

  &.filter-video.active {
    background: linear-gradient(135deg, #FFFDF5 0%, $video-light 100%);
    .filter-name { color: $video-primary; }
    .filter-glow { background: $video-gradient; }
    .filter-count { background: $video-primary; }
  }
}

.filter-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.15;
  border-radius: $radius-full;
}

.filter-icon {
  font-size: 24rpx;
  position: relative;
  z-index: 1;
}

.filter-name {
  font-size: 26rpx;
  color: $text-secondary;
  position: relative;
  z-index: 1;
  transition: color 0.3s ease;
}

.filter-count {
  position: relative;
  z-index: 1;
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 8rpx;
  border-radius: 16rpx;
  background: $text-tertiary;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 20rpx;
    color: #fff;
    font-weight: 600;
  }
}

// ============================================
// 内容滚动区
// ============================================
.content-scroll {
  flex: 1;
  position: relative;
  z-index: 1;
  padding: 16rpx 32rpx;
  width: 750rpx;
  box-sizing: border-box;
}

// ============================================
// 内容网格
// ============================================
.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.content-card {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  border-radius: $radius-xl;
  overflow: hidden;
  box-shadow: $shadow-card;
  border: 1rpx solid rgba(255, 255, 255, 0.8);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:active {
    transform: scale(0.97);
    box-shadow: $shadow-sm;
  }

  &.card-picture_book {
    .card-type-badge { background: linear-gradient(135deg, $book-primary 0%, darken($book-primary, 8%) 100%); }
    .play-btn { background: $book-gradient; box-shadow: $shadow-colored-book; }
    .play-ring { border-color: rgba($book-primary, 0.3); }
  }

  &.card-nursery_rhyme {
    .card-type-badge { background: linear-gradient(135deg, $song-primary 0%, darken($song-primary, 8%) 100%); }
    .play-btn { background: $song-gradient; box-shadow: $shadow-colored-song; }
    .play-ring { border-color: rgba($song-primary, 0.3); }
  }

  &.card-video {
    .card-type-badge { background: linear-gradient(135deg, $video-primary 0%, darken($video-primary, 8%) 100%); }
    .play-btn { background: $video-gradient; box-shadow: $shadow-colored-video; }
    .play-ring { border-color: rgba($video-primary, 0.3); }
  }
}

.card-glow {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba($book-primary, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.card-cover {
  position: relative;
  width: 100%;
  height: 220rpx;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 220rpx;
  pointer-events: none;
}

.cover-swiper {
  width: 100%;
  height: 220rpx;
}

.swiper-img {
  width: 100%;
  height: 100%;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $gradient-dreamy;

  text {
    font-size: 64rpx;
  }
}

.cover-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  background: $bg-soft;
  overflow: hidden;
}

.loading-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    $bg-soft 0%,
    rgba(255, 255, 255, 0.5) 50%,
    $bg-soft 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.card-type-badge {
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 14rpx;
  border-radius: $radius-full;
  box-shadow: $shadow-sm;

  .badge-icon {
    font-size: 18rpx;
  }

  .badge-text {
    font-size: 20rpx;
    color: #fff;
    font-weight: 600;
  }
}

.play-btn {
  position: absolute;
  bottom: 12rpx;
  right: 12rpx;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  .play-ring {
    position: absolute;
    top: -6rpx;
    left: -6rpx;
    right: -6rpx;
    bottom: -6rpx;
    border-radius: 50%;
    border: 2rpx solid;
    animation: playRingPulse 2s ease-out infinite;
  }

  .play-icon {
    position: relative;
    z-index: 1;
    font-size: 20rpx;
    color: #fff;
    margin-left: 4rpx;
  }

  &:active {
    transform: scale(0.9);
  }
}

@keyframes playRingPulse {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.4); opacity: 0; }
}

.card-info {
  padding: 16rpx;
}

.card-title {
  display: block;
  font-size: $font-base;
  font-weight: 600;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 10rpx;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}

.meta-child {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 4rpx 10rpx;
  background: $bg-soft;
  border-radius: $radius-sm;

  .meta-avatar {
    font-size: 18rpx;
  }

  .meta-name {
    font-size: 22rpx;
    color: $text-secondary;
  }
}

.meta-time {
  font-size: 22rpx;
  color: $text-tertiary;
}

// ============================================
// 空状态
// ============================================
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx 32rpx;
}

.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 48rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 40rpx;
  box-shadow: $shadow-lg;
  border: 1rpx solid rgba(255, 255, 255, 0.8);
}

.empty-illustration {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 32rpx;
}

.empty-ring {
  position: absolute;
  border-radius: 50%;
  border: 2rpx solid rgba($primary, 0.2);

  &.r1 {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    animation: emptyRingPulse 3s ease-out infinite;
  }

  &.r2 {
    top: -15rpx;
    left: -15rpx;
    right: -15rpx;
    bottom: -15rpx;
    opacity: 0.5;
    animation: emptyRingPulse 3s ease-out infinite 0.5s;
  }
}

@keyframes emptyRingPulse {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.3); opacity: 0; }
}

.empty-icon-wrap {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $gradient-dreamy;
  border-radius: 50%;
  box-shadow: $shadow-md;
}

.empty-icon {
  font-size: 56rpx;
}

.empty-title {
  font-size: $font-xl;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: $font-base;
  color: $text-tertiary;
  margin-bottom: 40rpx;
}

.empty-btn {
  position: relative;
  min-width: 260rpx;
  height: 96rpx;
  border-radius: 48rpx;
  overflow: hidden;
  background: $gradient-primary;
  box-shadow: $shadow-button;

  &:active {
    transform: scale(0.96);
  }
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: btnShine 3s ease-in-out infinite;
}

@keyframes btnShine {
  0% { left: -100%; }
  50%, 100% { left: 150%; }
}

.btn-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.btn-sparkle {
  font-size: 28rpx;
}

.btn-text {
  font-size: $font-md;
  font-weight: 600;
  color: #fff;
}

// ============================================
// 骨架屏
// ============================================
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

// ============================================
// 加载更多
// ============================================
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 32rpx;
}

.loading-dots {
  display: flex;
  gap: 8rpx;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: $primary;
  animation: dotBounce 1.4s ease-in-out infinite;

  &.d1 { animation-delay: 0s; }
  &.d2 { animation-delay: 0.2s; }
  &.d3 { animation-delay: 0.4s; }
}

@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(1); opacity: 0.5; }
  40% { transform: scale(1.3); opacity: 1; }
}

.loading-more text {
  font-size: 26rpx;
  color: $text-tertiary;
}

// ============================================
// 没有更多
// ============================================
.no-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 32rpx;
}

.no-more-line {
  width: 60rpx;
  height: 1rpx;
  background: linear-gradient(90deg, transparent 0%, $border-medium 50%, transparent 100%);
}

.no-more text {
  font-size: $font-sm;
  color: $text-placeholder;
}

// ============================================
// 底部安全区
// ============================================
.safe-bottom {
  height: calc(env(safe-area-inset-bottom) + 120rpx);
}

// ============================================
// 弹窗样式 (保持原有样式)
// ============================================
.asset-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8rpx);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.asset-modal {
  width: 750rpx;
  max-height: 85vh;
  background: linear-gradient(180deg, #FFF9F5 0%, #FFFFFF 100%);
  border-radius: 48rpx 48rpx 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  box-shadow: 0 -8rpx 40rpx rgba(0, 0, 0, 0.1);
}

.asset-modal-header {
  position: relative;
  padding: 40rpx 32rpx 24rpx;
  flex-shrink: 0;
}

.header-decor {
  position: absolute;
  top: 16rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 80rpx;
  height: 8rpx;
  background: linear-gradient(90deg, #FFD6CC 0%, #FFA07A 100%);
  border-radius: 4rpx;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 16rpx;
}

.header-icon {
  font-size: 44rpx;
}

.header-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #2D3436;
  letter-spacing: 2rpx;
}

.header-close {
  position: absolute;
  top: 36rpx;
  right: 24rpx;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  transition: all 0.2s;

  text {
    font-size: 36rpx;
    color: #636E72;
    font-weight: 300;
  }

  &:active {
    background: rgba(0, 0, 0, 0.1);
    transform: scale(0.95);
  }
}

.asset-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx;
  gap: 24rpx;
}

.loading-bubble {
  display: flex;
  gap: 12rpx;
}

.bubble {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  animation: bubble-bounce 1.4s ease-in-out infinite;

  &.b1 { background: #FFB5BA; animation-delay: 0s; }
  &.b2 { background: #B5D8FF; animation-delay: 0.2s; }
  &.b3 { background: #C5F0A4; animation-delay: 0.4s; }
}

@keyframes bubble-bounce {
  0%, 80%, 100% { transform: scale(1); opacity: 0.6; }
  40% { transform: scale(1.3); opacity: 1; }
}

.loading-text {
  font-size: 28rpx;
  color: #9B9B9B;
  letter-spacing: 2rpx;
}

.asset-modal-content {
  flex: 1;
  padding: 0 28rpx 28rpx;
  overflow-y: auto;
  box-sizing: border-box;
  width: 100%;
}

.modal-safe-bottom {
  height: calc(env(safe-area-inset-bottom) + 40rpx);
}

.overview-card {
  background: linear-gradient(135deg, #FFF5F0 0%, #FFE8E0 50%, #FFD6CC 100%);
  border-radius: 28rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(255, 160, 122, 0.15);
}

.overview-main {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.overview-avatar {
  width: 80rpx;
  height: 80rpx;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.overview-info { flex: 1; }

.overview-name {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 6rpx;
}

.overview-meta {
  font-size: 24rpx;
  color: #636E72;
}

.theme-info-row {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.theme-card {
  flex: 1;
  min-width: 180rpx;
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 16rpx 18rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.85);

  &.category { background: linear-gradient(135deg, rgba(255, 182, 193, 0.3) 0%, rgba(255, 218, 185, 0.25) 100%); }
  &.topic { background: linear-gradient(135deg, rgba(173, 216, 230, 0.3) 0%, rgba(221, 160, 221, 0.2) 100%); }
  &.age { background: linear-gradient(135deg, rgba(152, 251, 152, 0.25) 0%, rgba(175, 238, 238, 0.2) 100%); }
}

.theme-emoji {
  width: 52rpx;
  height: 52rpx;
  background: white;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.theme-text {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
  overflow: hidden;
}

.theme-label-cn {
  font-size: 26rpx;
  font-weight: 600;
  color: #2D3436;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.theme-label-en {
  font-size: 20rpx;
  color: #9B9B9B;
  text-transform: capitalize;
}

.prompt-card {
  background: white;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  border: 2rpx solid rgba(255, 200, 150, 0.3);
}

.prompt-header {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 16rpx;
}

.prompt-icon { font-size: 32rpx; }

.prompt-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #636E72;
}

.prompt-content {
  font-size: 28rpx;
  color: #2D3436;
  line-height: 1.7;
  padding: 16rpx;
  background: #FFF9F5;
  border-radius: 16rpx;
}

.config-section {
  background: white;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.config-section-header {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.config-section-icon { font-size: 28rpx; }

.config-section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2D3436;
}

.config-flow {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.config-group {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.config-group-label {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 14rpx;
  background: #F8F9FA;
  border-radius: 10rpx;
  align-self: flex-start;
}

.group-icon { font-size: 20rpx; }

.group-text {
  font-size: 22rpx;
  font-weight: 600;
  color: #636E72;
}

.config-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.config-tag {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 16rpx;
  border-radius: 16rpx;
  background: #F5F5F5;

  &.image { background: linear-gradient(135deg, rgba(116, 185, 255, 0.15) 0%, rgba(129, 236, 236, 0.1) 100%); }
  &.audio { background: linear-gradient(135deg, rgba(162, 155, 254, 0.15) 0%, rgba(253, 121, 168, 0.08) 100%); }
}

.tag-icon { font-size: 22rpx; flex-shrink: 0; }

.tag-label {
  font-size: 22rpx;
  color: #9B9B9B;
  flex-shrink: 0;
}

.tag-value {
  font-size: 24rpx;
  font-weight: 600;
  color: #2D3436;
  max-width: 200rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.models-card {
  background: linear-gradient(135deg, #E8F4FD 0%, #F0E6FF 100%);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.models-header {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.models-icon { font-size: 32rpx; }

.models-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2D3436;
}

.models-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.model-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 14rpx 18rpx;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16rpx;
}

.model-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  flex-shrink: 0;

  &.story { background: #00B894; }
  &.image { background: #74B9FF; }
  &.audio { background: #A29BFE; }
  &.prompt { background: #FF9F43; }
  &.music { background: #00CEC9; }
}

.model-label {
  font-size: 24rpx;
  color: #636E72;
  width: 60rpx;
  flex-shrink: 0;
}

.model-value {
  flex: 1;
  font-size: 24rpx;
  font-weight: 500;
  color: #2D3436;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.enhance-card {
  background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.enhance-header {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.enhance-icon { font-size: 32rpx; }

.enhance-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2D3436;
}

.enhance-group {
  margin-bottom: 18rpx;
  &:last-child { margin-bottom: 0; }
}

.enhance-label {
  display: block;
  font-size: 24rpx;
  color: #636E72;
  margin-bottom: 12rpx;
}

.enhance-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.pill {
  display: inline-block;
  font-size: 22rpx;
  font-weight: 500;
  padding: 8rpx 18rpx;
  border-radius: 20rpx;

  &.story { background: rgba(255, 112, 67, 0.15); color: #E64A19; }
  &.visual { background: rgba(255, 183, 77, 0.2); color: #F57C00; }
}

.assets-section { margin-bottom: 20rpx; }

.assets-header {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 16rpx;
  padding: 0 4rpx;
}

.assets-icon { font-size: 28rpx; }

.assets-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2D3436;
}

.assets-count {
  margin-left: auto;
  font-size: 22rpx;
  color: #9B9B9B;
  background: #F5F5F5;
  padding: 6rpx 14rpx;
  border-radius: 12rpx;
}

.assets-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.asset-card {
  background: white;
  border-radius: 20rpx;
  padding: 18rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.04);
  border-left: 6rpx solid transparent;

  &.image { border-left-color: #74B9FF; }
  &.audio { border-left-color: #A29BFE; }
}

.asset-badge {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 14rpx;
  background: #F8F9FA;
  border-radius: 12rpx;
  margin-bottom: 14rpx;

  .badge-icon { font-size: 22rpx; }
  .badge-text { font-size: 22rpx; font-weight: 600; color: #636E72; }
}

.asset-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.content-label {
  font-size: 22rpx;
  color: #9B9B9B;
  font-weight: 500;
}

.content-text {
  font-size: 24rpx;
  color: #2D3436;
  line-height: 1.6;
  padding: 14rpx;
  background: #FAFAFA;
  border-radius: 12rpx;
  word-break: break-all;

  &.audio { background: #F8F4FF; }
}

.audio-text-wrap { flex: 1; }

.audio-duration {
  display: flex;
  align-items: center;
  gap: 6rpx;
  align-self: flex-end;
  padding: 8rpx 14rpx;
  background: rgba(162, 155, 254, 0.1);
  border-radius: 12rpx;
  margin-top: 8rpx;
}

.duration-icon { font-size: 20rpx; }

.duration-val {
  font-size: 22rpx;
  font-weight: 600;
  color: #A29BFE;
}

// ============================================
// 删除确认弹窗
// ============================================
.delete-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}

.delete-modal {
  width: 580rpx;
  background: white;
  border-radius: 32rpx;
  padding: 40rpx 36rpx 36rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
}

.delete-icon-wrap {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #FFE5E5 0%, #FFECD2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28rpx;
}

.delete-icon { font-size: 52rpx; }

.delete-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24rpx;
}

.delete-cover {
  width: 160rpx;
  height: 160rpx;
  border-radius: 20rpx;
  object-fit: cover;
  margin-bottom: 16rpx;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.1);
}

.delete-cover-placeholder {
  width: 160rpx;
  height: 160rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #FFE5E5 0%, #F0F0F0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  margin-bottom: 16rpx;
}

.delete-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #2D3436;
  max-width: 400rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
}

.delete-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 36rpx;
}

.message-main {
  font-size: 28rpx;
  font-weight: 600;
  color: #2D3436;
}

.message-sub {
  font-size: 24rpx;
  color: #9B9B9B;
}

.delete-buttons {
  display: flex;
  gap: 20rpx;
  width: 100%;
}

.delete-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.2s ease;

  &.cancel {
    background: #F5F5F5;
    color: #636E72;
    &:active { background: #E8E8E8; }
  }

  &.confirm {
    background: linear-gradient(135deg, #FF7675 0%, #E17055 100%);
    color: white;
    box-shadow: 0 6rpx 20rpx rgba(225, 112, 85, 0.35);
    &:active { transform: scale(0.97); }
    &.loading { opacity: 0.7; pointer-events: none; }
  }
}

// ============================================
// 儿歌专用样式
// ============================================

// 概览卡片 - 儿歌配色
.overview-card.nursery-rhyme {
  background: linear-gradient(135deg, #E8F8F5 0%, #D5F5E3 50%, #ABEBC6 100%);
  box-shadow: 0 4rpx 20rpx rgba(46, 204, 113, 0.15);
}

// 模型卡片 - 儿歌配色
.models-card.nursery-rhyme {
  background: linear-gradient(135deg, #E8F8F5 0%, #D4EFDF 100%);
}

// 提示词增强卡片
.prompt-enhance-card {
  background: linear-gradient(135deg, #FFF9E6 0%, #FFF3CD 100%);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(255, 193, 7, 0.1);
}

.prompt-enhance-header {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.prompt-enhance-icon { font-size: 32rpx; }

.prompt-enhance-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2D3436;
}

.prompt-enhance-model {
  margin-left: auto;
  font-size: 20rpx;
  color: #9B9B9B;
  padding: 4rpx 12rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8rpx;
}

.prompt-compare {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.prompt-item {
  padding: 16rpx;
  border-radius: 16rpx;

  &.original {
    background: rgba(255, 255, 255, 0.7);
  }

  &.enhanced {
    background: linear-gradient(135deg, rgba(46, 204, 113, 0.1) 0%, rgba(39, 174, 96, 0.15) 100%);
  }
}

.prompt-item-label {
  display: block;
  font-size: 22rpx;
  color: #636E72;
  margin-bottom: 8rpx;
}

.prompt-item-content {
  font-size: 26rpx;
  color: #2D3436;
  line-height: 1.6;
}

.prompt-arrow {
  text-align: center;
  font-size: 28rpx;
  color: #00B894;
}

// 音乐配置区块
.music-config-section {
  background: white;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  border: 2rpx solid rgba(46, 204, 113, 0.2);
}

.music-config-header {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.music-config-icon { font-size: 32rpx; }

.music-config-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2D3436;
}

.music-config-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.music-info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.music-info-item {
  flex: 1;
  min-width: 140rpx;
  padding: 14rpx 18rpx;
  background: linear-gradient(135deg, #E8F8F5 0%, #D5F5E3 100%);
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.info-label {
  font-size: 20rpx;
  color: #636E72;
}

.info-value {
  font-size: 26rpx;
  font-weight: 600;
  color: #00B894;
}

.music-group {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.music-group-label {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 14rpx;
  background: #F8F9FA;
  border-radius: 10rpx;
  align-self: flex-start;
}

.music-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.music-tag {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 16rpx;
  border-radius: 16rpx;
  background: #F5F5F5;

  &.vocal { background: linear-gradient(135deg, rgba(155, 89, 182, 0.1) 0%, rgba(142, 68, 173, 0.08) 100%); }
  &.instrument { background: linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(41, 128, 185, 0.08) 100%); }
  &.effect { background: linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(192, 57, 43, 0.08) 100%); }
  &.other { background: linear-gradient(135deg, rgba(149, 165, 166, 0.15) 0%, rgba(127, 140, 141, 0.1) 100%); }

  .tag-label {
    font-size: 22rpx;
    color: #9B9B9B;
    flex-shrink: 0;
  }

  .tag-value {
    font-size: 24rpx;
    font-weight: 600;
    color: #2D3436;
  }
}

// 歌词卡片
.lyrics-card {
  background: white;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.lyrics-header {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 16rpx;
}

.lyrics-icon { font-size: 28rpx; }

.lyrics-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2D3436;
}

.lyrics-badge {
  margin-left: auto;
  padding: 4rpx 12rpx;
  background: linear-gradient(135deg, #00B894 0%, #00CEC9 100%);
  border-radius: 8rpx;

  text {
    font-size: 20rpx;
    color: white;
    font-weight: 500;
  }
}

.lyrics-content {
  max-height: 400rpx;
  padding: 16rpx;
  background: #FAFAFA;
  border-radius: 16rpx;
}

.lyrics-text {
  font-size: 26rpx;
  color: #2D3436;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

// 儿歌素材列表
.assets-list.nursery-rhyme {
  .asset-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16rpx 18rpx;
    border-left-width: 6rpx;
    border-left-style: solid;

    &.cover_image { border-left-color: #FF9F43; }
    &.suno_cover { border-left-color: #E17055; }
    &.audio { border-left-color: #00B894; }
    &.video { border-left-color: #6C5CE7; }
    &.audio_track { border-left-color: #00CEC9; }
  }

  .asset-badge {
    display: inline-flex;
    align-items: center;
    gap: 6rpx;
    padding: 8rpx 14rpx;
    border-radius: 12rpx;
    margin-bottom: 0;

    &.cover_image { background: rgba(255, 159, 67, 0.15); }
    &.suno_cover { background: rgba(225, 112, 85, 0.15); }
    &.audio { background: rgba(0, 184, 148, 0.15); }
    &.video { background: rgba(108, 92, 231, 0.15); }
    &.audio_track { background: rgba(0, 206, 201, 0.15); }
  }

  .asset-info {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .asset-duration {
    display: flex;
    align-items: center;
    gap: 4rpx;
    padding: 6rpx 12rpx;
    background: rgba(0, 184, 148, 0.1);
    border-radius: 10rpx;

    .duration-icon { font-size: 18rpx; }
    .duration-val {
      font-size: 22rpx;
      font-weight: 600;
      color: #00B894;
    }
  }

  .asset-track {
    display: flex;
    align-items: center;
    gap: 4rpx;
    padding: 6rpx 12rpx;
    background: rgba(0, 206, 201, 0.1);
    border-radius: 10rpx;

    .track-label {
      font-size: 20rpx;
      color: #636E72;
    }
    .track-num {
      font-size: 22rpx;
      font-weight: 600;
      color: #00CEC9;
    }
  }

  .asset-format {
    padding: 4rpx 10rpx;
    background: #F0F0F0;
    border-radius: 8rpx;

    text {
      font-size: 18rpx;
      color: #636E72;
      font-weight: 500;
    }
  }

  .asset-source {
    padding: 4rpx 10rpx;
    background: rgba(255, 159, 67, 0.1);
    border-radius: 8rpx;

    text {
      font-size: 18rpx;
      color: #FF9F43;
      font-weight: 500;
    }
  }
}
</style>
