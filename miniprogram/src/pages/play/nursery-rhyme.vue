<template>
  <view class="player-container">
    <!-- 梦幻背景 -->
    <view class="dreamy-background">
      <view class="gradient-layer"></view>
      <view class="stars-layer">
        <view v-for="i in 12" :key="i" class="star" :style="getStarStyle(i)"></view>
      </view>
      <view class="floating-notes">
        <text v-for="i in 5" :key="i" class="note" :style="getNoteStyle(i)">♪</text>
      </view>
    </view>

    <!-- 顶部导航 -->
    <view class="nav-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="back-button" @tap="handleClose">
        <text class="back-icon">‹</text>
      </view>
      <view class="nav-title-wrap">
        <text class="nav-title">{{ song?.title || '正在播放' }}</text>
      </view>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 主内容区 -->
    <view class="main-content">
      <!-- 视频/唱片区域 -->
      <view class="media-section">
        <!-- 视频模式 -->
        <view v-if="hasVideo && useVideoMode" class="video-wrapper">
          <video
            id="suno-video"
            class="suno-video"
            :src="song?.video_url"
            :poster="song?.cover_url"
            :controls="false"
            :show-center-play-btn="false"
            :show-play-btn="false"
            :show-fullscreen-btn="false"
            :show-progress="false"
            :enable-progress-gesture="false"
            :autoplay="false"
            :loop="true"
            :muted="true"
            object-fit="cover"
            @loadedmetadata="onVideoReady"
            @error="onVideoError"
          />
          <!-- 视频遮罩，点击播放/暂停 -->
          <view class="video-overlay" @tap="togglePlay">
            <view v-if="!isPlaying" class="video-play-hint">
              <text>▶</text>
            </view>
          </view>
          <!-- 切换到唱片模式按钮 -->
          <view class="mode-switch" @tap="useVideoMode = false">
            <text>🎵</text>
          </view>
        </view>

        <!-- 唱片模式 -->
        <view v-else class="vinyl-section">
          <view class="vinyl-wrapper">
            <!-- 唱臂 -->
            <view class="tone-arm" :class="{ playing: isPlaying }">
              <view class="arm-base"></view>
              <view class="arm-needle"></view>
            </view>
            <!-- 唱片 -->
            <view class="vinyl-disc" :class="{ spinning: isPlaying }">
              <view class="vinyl-grooves"></view>
              <view class="vinyl-label">
                <image
                  v-if="song?.cover_url"
                  :src="song.cover_url"
                  mode="aspectFill"
                  class="cover-image"
                  @load="coverLoaded = true"
                />
                <view v-else class="cover-placeholder">
                  <text>🎵</text>
                </view>
              </view>
              <view class="vinyl-center"></view>
            </view>
          </view>
          <!-- 切换到视频模式按钮 -->
          <view v-if="hasVideo" class="mode-switch vinyl-mode-switch" @tap="useVideoMode = true">
            <text>🎬</text>
          </view>
        </view>

        <!-- 歌曲信息 -->
        <view class="song-info">
          <text class="song-title-main">{{ song?.title || '儿歌' }}</text>
          <text class="song-meta">为 {{ song?.personalization?.child_name || '宝贝' }} 专属创作</text>
        </view>
      </view>

      <!-- 歌词区域 - 使用 scroll-top 精确居中滚动 -->
      <scroll-view
        class="lyrics-scroll"
        scroll-y
        :scroll-top="lyricsScrollTop"
        scroll-with-animation
        :enhanced="true"
        :show-scrollbar="false"
      >
        <!-- 顶部占位，高度=容器高度一半，确保第一句能居中 -->
        <view class="lyrics-padding-top" :style="{ height: lyricsPaddingHeight + 'px' }"></view>
        <view
          v-for="(line, index) in lyricsLines"
          :key="index"
          class="lyrics-line"
          :class="{
            active: index === currentLyricIndex,
            passed: index < currentLyricIndex
          }"
        >
          <text>{{ line }}</text>
        </view>
        <!-- 底部占位，高度=容器高度一半，确保最后一句能居中 -->
        <view class="lyrics-padding-bottom" :style="{ height: lyricsPaddingHeight + 'px' }"></view>
        <view v-if="lyricsLines.length === 0" class="no-lyrics-state">
          <view class="no-lyrics-icon">📝</view>
          <text class="no-lyrics-text">歌词加载中...</text>
          <text class="no-lyrics-hint">跟着旋律一起哼唱吧</text>
        </view>
      </scroll-view>
    </view>

    <!-- 底部控制区 -->
    <view class="control-panel">
      <!-- 进度条 -->
      <view class="progress-section">
        <text class="time-label">{{ formatTime(currentTime) }}</text>
        <view class="progress-track" @tap="onProgressTap">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }">
            <view class="progress-glow"></view>
          </view>
          <view class="progress-thumb" :style="{ left: progressPercent + '%' }"></view>
        </view>
        <text class="time-label">{{ formatTime(duration) }}</text>
      </view>

      <!-- 控制按钮 -->
      <view class="control-buttons">
        <view class="ctrl-btn" @tap="handleReplay">
          <view class="btn-icon">🔄</view>
        </view>

        <view class="play-btn-wrapper" @tap="togglePlay">
          <view class="play-btn" :class="{ playing: isPlaying }">
            <view v-if="audioBuffering" class="loading-spinner"></view>
            <text v-else class="play-icon">{{ isPlaying ? '❚❚' : '▶' }}</text>
          </view>
          <!-- 涟漪效果 -->
          <view v-if="isPlaying" class="ripple ripple-1"></view>
          <view v-if="isPlaying" class="ripple ripple-2"></view>
        </view>

        <!-- 切换版本按钮（Suno 返回 2 首时显示） -->
        <view v-if="hasMultipleTracks" class="ctrl-btn switch-btn" @tap="switchTrack">
          <view class="btn-icon">🔀</view>
          <text class="track-indicator">{{ currentTrackIndex + 1 }}/{{ allTracks.length }}</text>
        </view>
        <button v-else class="ctrl-btn share-btn" open-type="share">
          <view class="btn-icon">📤</view>
        </button>
      </view>

      <!-- 版本切换提示 -->
      <view v-if="hasMultipleTracks" class="track-hint">
        <text>当前播放版本 {{ currentTrackIndex + 1 }}，点击 🔀 切换</text>
      </view>

      <!-- 风格标签 -->
      <view v-if="song?.music_style" class="style-badge">
        <text>{{ getStyleName(song.music_style) }}</text>
      </view>
    </view>

    <!-- 加载遮罩 -->
    <view v-if="loading" class="loading-overlay">
      <view class="loader">
        <view class="loader-disc"></view>
        <text class="loader-text">加载中...</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import type { NurseryRhyme, MusicStyle } from '@/api/content'
import { getContentDetail } from '@/api/content'

// 状态
const songId = ref('')
const song = ref<NurseryRhyme | null>(null)
const loading = ref(true)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const statusBarHeight = ref(20)
const coverLoaded = ref(false)
const audioBuffering = ref(false)

// 多歌曲版本支持（Suno 每次返回 2 首）
const currentTrackIndex = ref(0)
const allTracks = computed(() => song.value?.all_tracks || [])
const hasMultipleTracks = computed(() => allTracks.value.length > 1)

// 视频播放支持（Suno 返回的音乐视频）
const hasVideo = computed(() => !!song.value?.video_url)
const videoContext = ref<UniApp.VideoContext | null>(null)
const videoReady = ref(false)
const useVideoMode = ref(true)  // 是否使用视频模式

// 歌词相关
interface LyricLine {
  time: number  // 时间戳（秒）
  text: string  // 歌词文本
}
const lyricsData = ref<LyricLine[]>([])  // 带时间戳的歌词
const lyricsLines = ref<string[]>([])     // 纯文本歌词（用于显示）
const currentLyricIndex = ref(0)

// 歌词滚动相关常量（单位：rpx）
const LYRIC_LINE_HEIGHT_RPX = 72  // 每行歌词固定高度
const LYRICS_CONTAINER_HEIGHT_RPX = 400  // 歌词容器大约高度（用于计算占位）

// 歌词滚动位置（使用 scroll-top 精确居中）
const lyricsScrollTop = ref(0)
const lyricsContainerHeight = ref(0)  // 实际容器高度（px）
const rpxToPxRatio = ref(0.5)  // rpx 转 px 的比例

// 歌词占位高度 = 容器高度的一半（让第一句/最后一句歌词能滚动到中间）
const lyricsPaddingHeight = computed(() => {
  // 如果容器高度还没获取到，使用默认值
  if (lyricsContainerHeight.value === 0) {
    return 150  // 默认 150px
  }
  // 占位高度 = 容器高度的一半 - 半行高度（让歌词中心对齐容器中心）
  const lineHeight = LYRIC_LINE_HEIGHT_RPX * rpxToPxRatio.value
  return Math.max(100, lyricsContainerHeight.value / 2 - lineHeight / 2)
})

// 计算歌词滚动位置，使当前歌词居中
function updateLyricsScrollPosition(index: number) {
  if (lyricsContainerHeight.value === 0) return

  const lineHeight = LYRIC_LINE_HEIGHT_RPX * rpxToPxRatio.value
  // 占位高度 = 容器高度的一半，这样第一句歌词可以滚动到中间
  const paddingTop = lyricsContainerHeight.value / 2

  // 计算目标滚动位置，使当前歌词行的中心与容器中心对齐
  // scrollTop = 占位高度 + 索引*行高 + 行高/2 - 容器高度/2
  //           = 索引*行高 + 行高/2 (因为 占位高度 = 容器高度/2)
  const targetScrollTop = index * lineHeight

  // 确保值变化以触发滚动（微信小程序的 scroll-top 有时需要值变化才触发）
  if (Math.abs(lyricsScrollTop.value - targetScrollTop) < 1) {
    // 值相同时，先设为略不同的值再设回来
    lyricsScrollTop.value = targetScrollTop + 0.5
    setTimeout(() => {
      lyricsScrollTop.value = targetScrollTop
    }, 10)
  } else {
    lyricsScrollTop.value = targetScrollTop
  }
}

// 音频实例
let audioContext: UniApp.InnerAudioContext | null = null

// 预加载封面图片
function preloadCover() {
  if (song.value?.cover_url) {
    // 小程序会自动缓存图片，这里只是提前触发加载
    console.log('[nursery-rhyme] 预加载封面:', song.value.cover_url)
  }
}

// 星星样式生成
function getStarStyle(i: number) {
  const positions = [
    { top: '8%', left: '15%' }, { top: '12%', left: '75%' },
    { top: '25%', left: '88%' }, { top: '35%', left: '5%' },
    { top: '45%', left: '92%' }, { top: '55%', left: '8%' },
    { top: '65%', left: '85%' }, { top: '75%', left: '12%' },
    { top: '82%', left: '78%' }, { top: '18%', left: '45%' },
    { top: '68%', left: '55%' }, { top: '88%', left: '35%' }
  ]
  const pos = positions[(i - 1) % positions.length]
  const delay = (i * 0.3) % 3
  const opacity = 0.3 + (i % 5) * 0.15
  return `top: ${pos.top}; left: ${pos.left}; animation-delay: ${delay}s; opacity: ${opacity};`
}

// 音符样式生成
function getNoteStyle(i: number) {
  const positions = [
    { left: '10%', top: '30%' }, { left: '85%', top: '25%' },
    { left: '20%', top: '60%' }, { left: '75%', top: '55%' },
    { left: '50%', top: '40%' }
  ]
  const pos = positions[(i - 1) % positions.length]
  const delay = i * 1.5
  const color = i % 2 === 0 ? '#FF6B9D' : '#9B6BFF'
  return `left: ${pos.left}; top: ${pos.top}; animation-delay: ${delay}s; color: ${color};`
}

// 计算属性
const progressPercent = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

// 将英文歌曲结构标记替换为中文
const structureMap: Record<string, string> = {
  'verse': '【主歌】',
  'chorus': '【副歌】',
  'bridge': '【桥段】',
  'intro': '【前奏】',
  'outro': '【尾奏】',
  'pre-chorus': '【预副歌】',
  'pre chorus': '【预副歌】',
  'hook': '【记忆点】',
  'refrain': '【副歌】',
  'interlude': '【间奏】'
}

// 替换歌词中的英文结构标记为中文
function replaceStructureTags(line: string): string {
  let result = line

  // 匹配格式1: [Verse] / [Chorus 1] / [VERSE]
  result = result.replace(/\[([A-Za-z][A-Za-z\s-]*)(?:\s*\d*)?\]/gi, (match, tag) => {
    const key = tag.toLowerCase().trim().replace(/\s+/g, '-')
    return structureMap[key] || structureMap[key.replace(/-/g, ' ')] || structureMap[key.replace(/-/g, '')] || ''
  })

  // 匹配格式2: **Verse** / **Chorus 1**
  result = result.replace(/\*\*([A-Za-z][A-Za-z\s-]*)(?:\s*\d*)?\*\*/gi, (match, tag) => {
    const key = tag.toLowerCase().trim().replace(/\s+/g, '-')
    return structureMap[key] || structureMap[key.replace(/-/g, ' ')] || ''
  })

  // 匹配格式3: 单独一行的结构标记（如 "Verse:" / "Chorus 1:" / "VERSE"）
  const structureKeys = Object.keys(structureMap).join('|').replace(/-/g, '[- ]?')
  const lineOnlyPattern = new RegExp(`^\\s*(${structureKeys})(?:\\s*\\d*)?\\s*:?\\s*$`, 'i')
  const lineMatch = result.match(lineOnlyPattern)
  if (lineMatch) {
    const key = lineMatch[1].toLowerCase().trim().replace(/\s+/g, '-')
    result = structureMap[key] || structureMap[key.replace(/-/g, ' ')] || ''
  }

  return result.trim()
}

// 解析歌词，支持后端时间戳格式、LRC 格式和纯文本
function parseLyrics(lyrics: any, totalDuration: number): { lines: string[], data: LyricLine[] } {
  if (!lyrics) return { lines: [], data: [] }

  // 1. 优先使用后端返回的精确时间戳 (Suno timestamped lyrics)
  if (typeof lyrics === 'object' && lyrics.timestamped && Array.isArray(lyrics.timestamped)) {
    console.log('[歌词] 使用后端精确时间戳，词数:', lyrics.timestamped.length)

    // 将词级时间戳聚合为行级时间戳
    const lines: string[] = []
    const data: LyricLine[] = []
    let currentLine = ''
    let lineStartTime = -1

    for (const item of lyrics.timestamped) {
      const word = item.word || ''
      const startTime = item.start_s || 0

      // 检测是否是新行（基于时间间隔或标点）
      const isNewLine = currentLine && (
        word === '\n' ||
        /^[。！？\n]$/.test(word) ||
        (lineStartTime >= 0 && startTime - lineStartTime > 4) // 超过4秒认为是新行
      )

      if (isNewLine && currentLine.trim()) {
        const processed = replaceStructureTags(currentLine)
        if (processed) {
          lines.push(processed)
          data.push({ time: lineStartTime, text: processed })
        }
        currentLine = ''
        lineStartTime = -1
      }

      if (word && word !== '\n') {
        if (lineStartTime < 0) {
          lineStartTime = startTime
        }
        currentLine += word
      }

      // 句末标点后换行
      if (/[。！？，、]$/.test(currentLine) && currentLine.length > 8) {
        const processed = replaceStructureTags(currentLine)
        if (processed) {
          lines.push(processed)
          data.push({ time: lineStartTime, text: processed })
        }
        currentLine = ''
        lineStartTime = -1
      }
    }

    // 处理最后一行
    if (currentLine.trim()) {
      const processed = replaceStructureTags(currentLine)
      if (processed) {
        lines.push(processed)
        data.push({ time: lineStartTime >= 0 ? lineStartTime : 0, text: processed })
      }
    }

    if (lines.length > 0) {
      return { lines, data }
    }
  }

  // 2. 获取纯文本歌词
  let text = ''
  if (typeof lyrics === 'string') {
    text = lyrics
  } else if (typeof lyrics === 'object') {
    text = lyrics.full_text || ''
    if (!text && lyrics.sections) {
      text = lyrics.sections.map((s: any) => s.content).join('\n\n')
    }
  }

  if (!text) return { lines: [], data: [] }

  // 预处理文本
  text = text
    .replace(/\\n/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')

  const rawLines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  // 3. 检测 LRC 时间戳格式 [mm:ss.xx]
  const lrcPattern = /^\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/
  const hasLrcTimestamps = rawLines.some(line => lrcPattern.test(line))

  if (hasLrcTimestamps) {
    const parsed: LyricLine[] = []
    for (const line of rawLines) {
      const match = line.match(lrcPattern)
      if (match) {
        const minutes = parseInt(match[1], 10)
        const seconds = parseInt(match[2], 10)
        const ms = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0
        const time = minutes * 60 + seconds + ms / 1000
        const rawContent = line.replace(lrcPattern, '').trim()
        // 替换结构标记
        const content = replaceStructureTags(rawContent)
        if (content && time >= 0) {
          parsed.push({ time, text: content })
        }
      }
    }
    parsed.sort((a, b) => a.time - b.time)
    return { lines: parsed.map(p => p.text), data: parsed }
  }

  // 4. 纯文本模式：基于字数权重分配时间，并替换结构标记
  const cleanLines = rawLines
    .map(line => replaceStructureTags(line))
    .filter(line => line.length > 0)

  if (cleanLines.length === 0 || totalDuration === 0) {
    return { lines: cleanLines, data: [] }
  }

  // 预留前奏和尾奏时间
  const introTime = Math.min(6, totalDuration * 0.1)
  const outroTime = Math.min(10, totalDuration * 0.15)
  const lyricsDuration = totalDuration - introTime - outroTime

  const totalChars = cleanLines.reduce((sum, line) => sum + Math.max(line.length, 3), 0)
  const data: LyricLine[] = []
  let currentTime = introTime

  for (const line of cleanLines) {
    data.push({ time: currentTime, text: line })
    const charWeight = Math.max(line.length, 3) / totalChars
    currentTime += lyricsDuration * charWeight
  }

  return { lines: cleanLines, data }
}

// 根据播放时间更新当前歌词
// 歌词提前量（秒）：补偿 onTimeUpdate 回调延迟 + 滚动动画时间
const LYRICS_OFFSET = 0.5

function updateCurrentLyric() {
  if (lyricsLines.value.length === 0) return

  // 添加提前量，让歌词显示比实际播放时间略早
  const now = currentTime.value + LYRICS_OFFSET
  const data = lyricsData.value

  // 如果有时间戳数据，使用精确匹配
  if (data.length > 0) {
    let newIndex = 0
    // 找到当前时间对应的歌词行（最后一个时间戳 <= 当前时间+提前量 的行）
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].time <= now) {
        newIndex = i
        break
      }
    }

    // 更新当前歌词索引并滚动
    if (newIndex !== currentLyricIndex.value) {
      currentLyricIndex.value = newIndex
      updateLyricsScrollPosition(newIndex)
      console.log('[歌词] 切换到第', newIndex + 1, '句:', data[newIndex]?.text?.substring(0, 10))
    }
    return
  }

  // 备用：如果没有时间戳，使用简单的线性映射
  if (duration.value === 0) return
  const progress = now / duration.value
  const newIndex = Math.min(
    Math.floor(progress * lyricsLines.value.length),
    lyricsLines.value.length - 1
  )

  if (newIndex !== currentLyricIndex.value && newIndex >= 0) {
    currentLyricIndex.value = newIndex
    updateLyricsScrollPosition(newIndex)
  }
}

// 监听歌词和时长变化，重新解析歌词
watch(
  () => [song.value?.lyrics, duration.value] as const,
  ([newLyrics, newDuration]) => {
    if (newLyrics && newDuration > 0) {
      const result = parseLyrics(newLyrics, newDuration)
      lyricsLines.value = result.lines
      lyricsData.value = result.data
      currentLyricIndex.value = 0
      console.log('[歌词解析] 行数:', result.lines.length, '时间戳数:', result.data.length)
    } else if (newLyrics) {
      // 时长还未获取，先解析文本
      const result = parseLyrics(newLyrics, 0)
      lyricsLines.value = result.lines
      lyricsData.value = []
      currentLyricIndex.value = 0
    }
  },
  { immediate: true }
)

// 当时长更新后重新计算时间戳
watch(
  () => duration.value,
  (newDuration) => {
    if (newDuration > 0 && lyricsLines.value.length > 0 && lyricsData.value.length === 0) {
      // 有歌词但没有时间戳，重新解析
      const result = parseLyrics(song.value?.lyrics, newDuration)
      lyricsData.value = result.data
      console.log('[歌词时间戳] 重新计算，时间戳数:', result.data.length)
    }
  }
)

// 音乐风格名称映射
const styleNames: Record<MusicStyle, string> = {
  cheerful: '🎉 欢快活泼',
  gentle: '🌸 温柔舒缓',
  playful: '🎈 俏皮可爱',
  lullaby: '🌙 摇篮曲风',
  educational: '📚 启蒙教育'
}

function getStyleName(style: MusicStyle): string {
  return styleNames[style] || style
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function togglePlay() {
  if (!audioContext) return

  if (isPlaying.value) {
    audioContext.pause()
    // 同步暂停视频
    if (videoContext.value && hasVideo.value && useVideoMode.value) {
      videoContext.value.pause()
    }
  } else {
    audioContext.play()
    // 同步播放视频（静音，音频来自 audioContext）
    if (videoContext.value && hasVideo.value && useVideoMode.value) {
      videoContext.value.play()
    }
  }
}

// 视频加载完成
function onVideoReady() {
  console.log('[视频] 加载完成')
  videoReady.value = true
}

// 视频加载失败，回退到唱片模式
function onVideoError(e: any) {
  console.error('[视频] 加载失败:', e)
  useVideoMode.value = false
  uni.showToast({ title: '视频加载失败，已切换到唱片模式', icon: 'none' })
}

// 初始化视频上下文
function initVideoContext() {
  if (hasVideo.value) {
    videoContext.value = uni.createVideoContext('suno-video')
    console.log('[视频] 上下文初始化')
  }
}

function handleReplay() {
  if (!audioContext) return
  audioContext.seek(0)
  currentLyricIndex.value = 0
  // watch 会自动调用 centerCurrentLyric()
  audioContext.play()

  // 同步重播视频
  if (videoContext.value && hasVideo.value && useVideoMode.value) {
    videoContext.value.seek(0)
    videoContext.value.play()
  }
}

// 切换歌曲版本（Suno 返回 2 首）
function switchTrack() {
  if (!hasMultipleTracks.value) return

  const nextIndex = (currentTrackIndex.value + 1) % allTracks.value.length
  currentTrackIndex.value = nextIndex

  const track = allTracks.value[nextIndex]
  if (track) {
    // 更新当前播放的音频
    if (audioContext) {
      audioContext.stop()
    }

    // 更新歌曲信息（保留原有数据，只更新音频相关）
    if (song.value) {
      song.value = {
        ...song.value,
        audio_url: track.audio_url,
        cover_url: track.cover_url || song.value.cover_url,
        duration: track.duration || song.value.duration,
        // 如果 track 有独立歌词，使用它
        lyrics: track.timestamped_lyrics ? {
          full_text: track.lyric || '',
          timestamped: track.timestamped_lyrics
        } : song.value.lyrics
      }
    }

    duration.value = track.duration || 0
    currentTime.value = 0
    currentLyricIndex.value = 0
    // watch 会自动调用 centerCurrentLyric()

    // 重新初始化音频
    initAudio()

    uni.showToast({
      title: `切换到版本 ${nextIndex + 1}`,
      icon: 'none',
      duration: 1500
    })
  }
}

function onProgressTap(e: any) {
  if (!audioContext || duration.value === 0) return

  const touch = e.touches?.[0] || e.changedTouches?.[0] || e.detail
  if (!touch) return

  const query = uni.createSelectorQuery()
  query.select('.progress-track').boundingClientRect((rect: any) => {
    if (!rect) return
    const x = (touch.clientX || touch.pageX) - rect.left
    const percent = Math.max(0, Math.min(1, x / rect.width))
    const seekTime = percent * duration.value
    audioContext?.seek(seekTime)
  }).exec()
}

function handleClose() {
  if (audioContext) {
    audioContext.stop()
    audioContext.destroy()
  }
  uni.navigateBack()
}

function initAudio() {
  if (!song.value?.audio_url) return

  uni.setInnerAudioOption({
    obeyMuteSwitch: false,
    mixWithOther: false
  })

  if (audioContext) {
    audioContext.stop()
    audioContext.destroy()
  }

  audioContext = uni.createInnerAudioContext()
  audioContext.volume = 1.0

  let audioUrl = song.value.audio_url
  if (audioUrl.startsWith('http://')) {
    audioUrl = audioUrl.replace('http://', 'https://')
  }

  audioContext.onCanplay(() => {
    audioBuffering.value = false
    if (audioContext?.duration && audioContext.duration > 0) {
      duration.value = audioContext.duration
    }
  })

  audioContext.onPlay(() => {
    isPlaying.value = true
  })

  audioContext.onPause(() => {
    isPlaying.value = false
  })

  audioContext.onStop(() => {
    isPlaying.value = false
  })

  audioContext.onEnded(() => {
    isPlaying.value = false
    currentTime.value = duration.value
  })

  audioContext.onTimeUpdate(() => {
    currentTime.value = audioContext?.currentTime || 0
    if (audioContext?.duration && audioContext.duration > 0) {
      duration.value = audioContext.duration
    }
    updateCurrentLyric()
  })

  audioContext.onError((err: any) => {
    console.error('音频错误:', err)
    uni.showToast({ title: '音频加载失败', icon: 'none' })
  })

  audioContext.onWaiting(() => {
    audioBuffering.value = true
  })

  audioContext.src = audioUrl

  setTimeout(() => {
    audioContext?.play()
  }, 500)
}

async function loadContent() {
  loading.value = true

  try {
    // 优先从临时存储读取（刚生成的儿歌）
    const tempSong = uni.getStorageSync('temp_nursery_rhyme')
    console.log('[nursery-rhyme] 临时存储数据:', tempSong)
    console.log('[nursery-rhyme] 临时存储数据 keys:', tempSong ? Object.keys(tempSong) : 'null')
    if (tempSong) {
      song.value = tempSong
      console.log('[nursery-rhyme] 设置 song.value')
      console.log('[nursery-rhyme] video_url:', tempSong.video_url)
      uni.removeStorageSync('temp_nursery_rhyme')
      duration.value = tempSong.duration || 0
      // 并行预加载封面和初始化音频
      preloadCover()
      initAudio()
      // 延迟初始化视频上下文（等待 DOM 渲染）
      setTimeout(() => initVideoContext(), 300)
      loading.value = false
      return
    }

    // 从 API 加载
    if (songId.value) {
      const result = await getContentDetail(songId.value)
      // 转换为 NurseryRhyme 类型
      song.value = result as unknown as NurseryRhyme
      duration.value = song.value.duration || 0
      // 并行预加载封面和初始化音频
      preloadCover()
      initAudio()
      // 延迟初始化视频上下文（等待 DOM 渲染）
      setTimeout(() => initVideoContext(), 300)
    }
  } catch (e) {
    console.error('加载儿歌失败:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
  } finally {
    loading.value = false
  }
}

// 分享配置
onShareAppMessage(() => ({
  title: song.value?.title || '来听这首有趣的儿歌',
  path: `/pages/play/nursery-rhyme?id=${songId.value}`,
  imageUrl: song.value?.cover_url || ''
}))

onShareTimeline(() => ({
  title: song.value?.title || '来听这首有趣的儿歌',
  query: `id=${songId.value}`,
  imageUrl: song.value?.cover_url || ''
}))

onLoad((options) => {
  console.log('[nursery-rhyme] onLoad, options:', options)
  songId.value = options?.id || ''

  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 20

  // 计算 rpx 转 px 比例（设计稿 750rpx = 屏幕宽度）
  rpxToPxRatio.value = sysInfo.windowWidth / 750
  console.log('[歌词滚动] rpx转px比例:', rpxToPxRatio.value)

  // 立即尝试加载内容
  loadContent()
})

onMounted(() => {
  console.log('[nursery-rhyme] onMounted, song.value:', song.value ? 'loaded' : 'null')
  // 如果 onLoad 中没有加载成功，再尝试一次
  if (!song.value) {
    console.log('[nursery-rhyme] onMounted: 重新尝试加载')
    loadContent()
  }

  // 获取歌词容器的实际高度
  setTimeout(() => {
    const query = uni.createSelectorQuery()
    query.select('.lyrics-scroll').boundingClientRect((rect: any) => {
      if (rect && rect.height > 0) {
        lyricsContainerHeight.value = rect.height
        console.log('[歌词滚动] 容器高度:', rect.height, 'px')
        // 初始化滚动位置
        updateLyricsScrollPosition(currentLyricIndex.value)
      }
    }).exec()
  }, 300)  // 等待 DOM 渲染完成
})

onUnmounted(() => {
  if (audioContext) {
    audioContext.stop()
    audioContext.destroy()
    audioContext = null
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

// === 颜色定义 ===
$dream-purple: #9B6BFF;
$dream-pink: #FF6B9D;
$dream-blue: #6B8BFF;
$dream-gold: #FFD700;

// === 主容器 ===
.player-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// === 梦幻背景 ===
.dreamy-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
}

.gradient-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    160deg,
    #1a0a2e 0%,
    #2d1b4e 25%,
    #1e3a5f 50%,
    #0f2027 75%,
    #0a0a14 100%
  );
}

.stars-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.star {
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  background: #fff;
  border-radius: 50%;
  animation: twinkle 2s ease-in-out infinite;
  box-shadow: 0 0 10rpx 2rpx rgba(255, 255, 255, 0.5);
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

.floating-notes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.note {
  position: absolute;
  font-size: 48rpx;
  opacity: 0.4;
  animation: float-up 8s ease-in-out infinite;
}

@keyframes float-up {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.2;
  }
  50% {
    transform: translateY(-60rpx) rotate(15deg);
    opacity: 0.5;
  }
}

// === 顶部导航 ===
.nav-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  padding: $spacing-sm $spacing-md;
  flex-shrink: 0;
}

.back-button {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  backdrop-filter: blur(10rpx);

  &:active {
    background: rgba(255, 255, 255, 0.2);
  }
}

.back-icon {
  font-size: 48rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 300;
  margin-top: -4rpx;
}

.nav-title-wrap {
  flex: 1;
  text-align: center;
  padding: 0 $spacing-sm;
}

.nav-title {
  font-size: $font-md;
  color: rgba(255, 255, 255, 0.95);
  font-weight: $font-medium;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-placeholder {
  width: 72rpx;
}

// === 主内容区 ===
.main-content {
  position: relative;
  z-index: 5;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 $spacing-lg;
  overflow: hidden;
  min-height: 0;
}

// === 媒体区域（视频/唱片） ===
.media-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-md 0;
  flex-shrink: 0;
}

// === 视频播放器 ===
.video-wrapper {
  position: relative;
  width: 400rpx;
  height: 400rpx;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow:
    0 8rpx 32rpx rgba(0, 0, 0, 0.4),
    0 0 0 4rpx rgba(255, 255, 255, 0.1);
}

.suno-video {
  width: 100%;
  height: 100%;
  border-radius: $radius-lg;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.video-play-hint {
  width: 80rpx;
  height: 80rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8rpx);

  text {
    font-size: 36rpx;
    color: #fff;
    margin-left: 6rpx;
  }
}

.mode-switch {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 56rpx;
  height: 56rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8rpx);
  z-index: 5;

  text {
    font-size: 28rpx;
  }

  &:active {
    background: rgba(0, 0, 0, 0.7);
  }
}

.vinyl-mode-switch {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
}

// === 唱片区域 ===
.vinyl-section {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.vinyl-wrapper {
  position: relative;
  width: 360rpx;
  height: 360rpx;
}

// 唱臂
.tone-arm {
  position: absolute;
  top: -20rpx;
  right: 20rpx;
  width: 120rpx;
  height: 120rpx;
  z-index: 3;
  transform-origin: 80% 20%;
  transform: rotate(-30deg);
  transition: transform 0.5s ease;

  &.playing {
    transform: rotate(-10deg);
  }
}

.arm-base {
  position: absolute;
  top: 0;
  right: 0;
  width: 24rpx;
  height: 24rpx;
  background: #444;
  border-radius: 50%;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.5);
}

.arm-needle {
  position: absolute;
  top: 12rpx;
  right: 8rpx;
  width: 100rpx;
  height: 8rpx;
  background: linear-gradient(90deg, #666, #333);
  border-radius: 4rpx;
  transform-origin: right center;
  transform: rotate(45deg);

  &::after {
    content: '';
    position: absolute;
    left: -8rpx;
    top: 50%;
    width: 16rpx;
    height: 4rpx;
    background: #888;
    transform: translateY(-50%);
    border-radius: 2rpx;
  }
}

// 唱片
.vinyl-disc {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    #1a1a1a 0%,
    #333 20%,
    #1a1a1a 40%,
    #333 60%,
    #1a1a1a 80%,
    #333 100%
  );
  box-shadow:
    0 8rpx 32rpx rgba(0, 0, 0, 0.6),
    0 0 0 6rpx rgba(255, 255, 255, 0.05),
    inset 0 0 40rpx rgba(0, 0, 0, 0.8);
  position: relative;

  &.spinning {
    animation: spin 4s linear infinite;
  }
}

.vinyl-grooves {
  position: absolute;
  top: 15%;
  left: 15%;
  right: 15%;
  bottom: 15%;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle at center,
    transparent 0px,
    transparent 2px,
    rgba(255,255,255,0.03) 2px,
    rgba(255,255,255,0.03) 3px
  );
}

.vinyl-label {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50%;
  height: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, $dream-purple, $dream-pink);
  box-shadow: inset 0 0 20rpx rgba(0,0,0,0.3);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $dream-purple, $dream-pink);

  text {
    font-size: 80rpx;
  }
}

.vinyl-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 24rpx;
  height: 24rpx;
  background: #1a1a1a;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 4rpx rgba(255, 255, 255, 0.1);
  z-index: 2;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 歌曲信息
.song-info {
  margin-top: $spacing-lg;
  text-align: center;
}

.song-title-main {
  display: block;
  font-size: $font-xl;
  color: #fff;
  font-weight: $font-semibold;
  margin-bottom: $spacing-xs;
  text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.5);
}

.song-meta {
  display: block;
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.6);
}

// === 歌词区域 - scroll-into-view 精确滚动 ===
.lyrics-scroll {
  flex: 1;
  width: 100%;
  min-height: 300rpx;
  padding: 0 $spacing-md;
  box-sizing: border-box;
}

// 歌词内部的上下占位（高度由 JS 动态设置）
.lyrics-padding-top,
.lyrics-padding-bottom {
  flex-shrink: 0;
  // 默认高度，会被 JS 动态覆盖
  height: 150rpx;
}

.lyrics-line {
  display: flex;
  justify-content: center;
  align-items: center;
  // 固定行高，确保滚动计算准确
  height: 72rpx;
  min-height: 72rpx;
  width: 100%;
  text-align: center;
  flex-shrink: 0;
  box-sizing: border-box;

  text {
    font-size: 30rpx;
    color: rgba(255, 255, 255, 0.4);
    line-height: 1.4;
    transition: color 0.3s ease, text-shadow 0.3s ease;
    display: inline-block;
    max-width: 90%;
    // 超长文本用省略号
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &.passed text {
    color: rgba($dream-purple, 0.6);
  }

  &.active {
    // 不用 transform: scale，避免改变实际高度
    text {
      font-size: 34rpx;
      font-weight: $font-semibold;
      color: #fff;
      text-shadow:
        0 0 20rpx $dream-purple,
        0 0 40rpx $dream-pink;
    }
  }
}

.no-lyrics-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl 0;
}

.no-lyrics-icon {
  font-size: 80rpx;
  margin-bottom: $spacing-sm;
}

.no-lyrics-text {
  font-size: $font-md;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: $spacing-xs;
}

.no-lyrics-hint {
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.4);
}

// === 底部控制区 ===
.control-panel {
  position: relative;
  z-index: 10;
  padding: $spacing-md $spacing-lg;
  padding-bottom: calc(#{$spacing-lg} + env(safe-area-inset-bottom));
  flex-shrink: 0;
  background: linear-gradient(to top, rgba(10, 10, 20, 0.9), transparent);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

// 进度条
.progress-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-lg;
  width: 100%;
}

.time-label {
  font-size: $font-xs;
  color: rgba(255, 255, 255, 0.5);
  min-width: 72rpx;
  font-variant-numeric: tabular-nums;

  &:first-child {
    text-align: right;
  }
  &:last-child {
    text-align: left;
  }
}

.progress-track {
  flex: 1;
  height: 8rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: $radius-full;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, $dream-purple, $dream-pink);
  border-radius: $radius-full;
  position: relative;
  transition: width 0.15s linear;
}

.progress-glow {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 40rpx;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6));
  animation: glow-pulse 1.5s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.progress-thumb {
  position: absolute;
  top: 50%;
  width: 20rpx;
  height: 20rpx;
  background: #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.4), 0 0 12rpx $dream-purple;
}

// 控制按钮
.control-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xl;
  margin-bottom: $spacing-md;
}

.ctrl-btn {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border: none;
  padding: 0;
  transition: all 0.2s ease;

  &::after {
    display: none;
  }

  &:active {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(0.95);
  }
}

.btn-icon {
  font-size: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.play-btn-wrapper {
  position: relative;
}

.play-btn {
  width: 120rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $dream-purple, $dream-pink);
  border-radius: 50%;
  box-shadow:
    0 8rpx 32rpx rgba($dream-purple, 0.5),
    0 0 0 4rpx rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
  }

  &.playing {
    animation: play-pulse 2s ease-in-out infinite;
  }
}

@keyframes play-pulse {
  0%, 100% { box-shadow: 0 8rpx 32rpx rgba($dream-purple, 0.5), 0 0 0 4rpx rgba(255, 255, 255, 0.1); }
  50% { box-shadow: 0 12rpx 48rpx rgba($dream-pink, 0.6), 0 0 0 6rpx rgba(255, 255, 255, 0.15); }
}

.play-icon {
  font-size: 48rpx;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

// 涟漪效果
.ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120rpx;
  height: 120rpx;
  border: 2rpx solid rgba($dream-purple, 0.5);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ripple-expand 2s ease-out infinite;
  pointer-events: none;

  &.ripple-2 {
    animation-delay: 1s;
  }
}

@keyframes ripple-expand {
  0% {
    width: 120rpx;
    height: 120rpx;
    opacity: 0.6;
  }
  100% {
    width: 200rpx;
    height: 200rpx;
    opacity: 0;
  }
}

// 切换版本按钮
.switch-btn {
  position: relative;

  .track-indicator {
    position: absolute;
    bottom: -4rpx;
    left: 50%;
    transform: translateX(-50%);
    font-size: 18rpx;
    color: rgba(255, 255, 255, 0.7);
    white-space: nowrap;
  }
}

// 版本切换提示
.track-hint {
  text-align: center;
  margin-bottom: $spacing-sm;

  text {
    font-size: $font-xs;
    color: rgba(255, 255, 255, 0.5);
  }
}

// 风格标签
.style-badge {
  text-align: center;

  text {
    display: inline-block;
    padding: $spacing-xs $spacing-md;
    background: rgba($dream-purple, 0.2);
    border: 1rpx solid rgba($dream-purple, 0.3);
    border-radius: $radius-full;
    font-size: $font-xs;
    color: rgba(255, 255, 255, 0.8);
  }
}

// === 加载遮罩 ===
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(160deg, #1a0a2e, #0a0a14);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-md;
}

.loader-disc {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $dream-purple, $dream-pink);
  animation: spin 1.5s linear infinite;
  box-shadow: 0 0 40rpx rgba($dream-purple, 0.5);

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 30rpx;
    height: 30rpx;
    background: #1a0a2e;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
}

.loader-text {
  font-size: $font-md;
  color: rgba(255, 255, 255, 0.8);
}
</style>
