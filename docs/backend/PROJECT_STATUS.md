# Moana (Kids) 项目状态

> AI 原生早教内容生成系统 - 项目进度追踪

**最后更新**: 2025-12-24 15:40 (香港时间)

---

## 整体进度

```
后端开发        ████████████████████████████  100%
后端测试        ████████████████████████████  100%
后端部署        ████████████████████████████  100%
性能优化        ████████████████████████████  100%  ← 新完成
前端开发        ████████████████████░░░░░░░░   70%  ← 进行中
系统联调        ████████████░░░░░░░░░░░░░░░░   45%  ← 进行中
```

---

## 最近完成 (2025-12-24)

### 性能优化 (12/18-12/24)
1. **图片优化** - WebP 转换 + 缩略图生成
   - `ImageOptimizer` 服务：原图转 WebP，生成 400px 缩略图
   - 列表 API 使用缩略图，详情 API 提供完整图片
   - 文件大小减少约 60-80%

2. **音频优化** - WAV 转 AAC
   - `AudioConverter` 服务：WAV -> AAC (m4a)
   - 文件大小减少约 75%
   - 保持高音质（128kbps AAC）

3. **网络优化** - GZip 压缩
   - FastAPI GZip 中间件
   - API 响应自动压缩

### 儿歌 v2 API (12/15-12/18)
1. `NurseryRhymeRequestV2` - 支持 31+ 参数
2. `PromptEnhancer` - Gemini 驱动的提示词增强
3. 资源详情 API (`/content/{id}/asset-details`)
4. 内容诊断 API (`/content/{id}/diagnostics`)

### 独立视频 API (12/19)
1. Google Veo 2 集成
2. 视频模板系统
3. 参考图管理
4. 首帧生成 API

### 智能创作 (12/20-12/22)
1. 提示词分析器 (`PromptAnalyzer`)
2. 智能绘本创建 API (`/content/smart-picture-book`)
3. 支持自然语言描述生成内容

---

## TODO 清单

### 已完成
- [x] 后端 MVP 部署 (端口 8080, API 前缀 /api/v1)
- [x] 微信登录配置 (真实 AppID/Secret)
- [x] 孩子 CRUD API
- [x] 内容列表/详情 API
- [x] 内容自动保存到数据库
- [x] LLM 服务工厂模式 (Gemini/OpenRouter)
- [x] 图像/TTS 服务工厂模式
- [x] 图片 WebP 优化 + 缩略图
- [x] 音频 WAV -> AAC 转换
- [x] GZip 响应压缩
- [x] 儿歌 v2 API (31+ 参数)
- [x] 独立视频生成 API
- [x] 智能绘本创建 API

### 待完成
- [ ] **前端 MVP 完善**
  - [x] 项目初始化 (uni-app)
  - [x] 微信登录流程
  - [x] 主题选择页面
  - [x] 内容生成流程
  - [ ] 播放器组件优化
  - [ ] 内容库页面 (已有 API)
  - [ ] 时间管理功能
- [ ] **系统完善**
  - [ ] 配置 HTTPS
  - [ ] 提交小程序审核

---

## 项目结构

```
/root/kids/
├── src/moana/                 # 后端源码
│   ├── main.py               # FastAPI 入口 (API 前缀: /api/v1)
│   ├── config.py             # 配置管理
│   ├── database.py           # 数据库连接
│   ├── models/               # SQLAlchemy 模型 (9个)
│   ├── api/                  # 核心 API
│   │   ├── child.py          # 孩子 CRUD
│   │   ├── content.py        # 内容生成+列表
│   │   ├── video_config.py   # 视频配置
│   │   └── standalone_video.py  # 独立视频
│   ├── routers/              # 认证等 API
│   ├── agents/               # AI Agents (6个)
│   ├── services/             # 外部服务集成
│   │   ├── llm/              # LLM (Gemini/Claude/OpenRouter)
│   │   ├── image/            # 图像 (MiniMax/Flux/Qwen)
│   │   ├── tts/              # TTS (Qwen/FishSpeech)
│   │   ├── audio/            # 音频处理 (AudioConverter)
│   │   ├── video/            # 视频 (Google Veo/Wanx)
│   │   └── smart/            # 智能分析 (PromptAnalyzer)
│   ├── pipelines/            # 内容生成流水线
│   └── themes/               # 主题配置
├── alembic/                   # 数据库迁移
├── tests/                     # 测试用例 (50+)
├── scripts/                   # 工具脚本
│   ├── generate_voice_previews.py  # 音色预览生成
│   ├── migrate_asset_details.py    # 数据迁移
│   └── test_phase3.py              # 阶段3测试
└── docs/                      # 文档
```

---

## API 端点

**API 前缀**: `/api/v1` (专用子域名 kids.jackverse.cn)

| 模块 | 端点 | 说明 |
|------|------|------|
| 健康检查 | GET /health | 服务状态 |
| 认证 | POST /auth/wechat/login | 微信登录 |
| 认证 | POST /auth/refresh | 刷新 token |
| 认证 | GET /auth/me | 当前用户 |
| 孩子 | GET /child/list | 孩子列表 |
| 孩子 | POST /child | 创建孩子 |
| 孩子 | GET/PUT/DELETE /child/{id} | CRUD |
| 孩子 | GET/PUT /child/{id}/settings | 设置 |
| 内容 | GET /content/list | 内容列表 (缩略图) |
| 内容 | GET /content/{id} | 内容详情 |
| 内容 | GET /content/{id}/asset-details | 资源详情 |
| 内容 | GET /content/{id}/diagnostics | 诊断信息 |
| 内容 | GET /content/themes | 主题列表 |
| 内容 | POST /content/picture-book | 生成绘本 |
| 内容 | POST /content/nursery-rhyme | 生成儿歌 |
| 内容 | POST /content/smart-picture-book | 智能绘本 |
| 视频 | GET /video/templates | 模板列表 |
| 视频 | GET /video/references | 参考图列表 |
| 视频 | POST /video/first-frame | 首帧生成 |
| 视频 | POST /standalone-video/generate | 独立视频 |
| 播放 | POST /play/start | 开始播放 |
| 播放 | POST /play/{id}/progress | 更新进度 |
| 播放 | GET /play/history/{child_id} | 播放历史 |

**API 文档**: https://kids.jackverse.cn/docs

---

## 性能数据

| 操作 | 优化前 | 优化后 | 改进 |
|------|--------|--------|------|
| 绘本生成 | ~68s | ~62s | -9% |
| 图片大小 | ~500KB | ~100KB | -80% |
| 音频大小 | ~400KB | ~100KB | -75% |
| API 响应 | - | GZip | ~60% |

---

## 部署信息

### 服务器环境
- OS: TencentOS Server 3.3
- Python: 3.12
- PostgreSQL: 10.23
- 端口: 8080 (Kids)
- 域名: kids.jackverse.cn (Cloudflare)

### 启动命令
```bash
cd /root/kids
PYTHONPATH=src python3.12 -m uvicorn moana.main:app --host 0.0.0.0 --port 8080
```

### 环境变量
配置文件: `/root/kids/.env`

| 变量 | 状态 | 说明 |
|------|------|------|
| DATABASE_URL | OK | PostgreSQL 连接 |
| JWT_SECRET_KEY | OK | JWT 签名 |
| LLM_PROVIDER | OK | gemini |
| GOOGLE_API_KEY | OK | Gemini API |
| DASHSCOPE_API_KEY | OK | 阿里云 TTS |
| MINIMAX_API_KEY | OK | 图像生成 |
| SUNO_API_KEY | OK | 音乐生成 |
| WECHAT_APP_ID | OK | 微信登录 |
| WECHAT_APP_SECRET | OK | 微信登录 |

---

## 下次开发继续点

**当前任务**:
1. 前端内容库页面 (API 已就绪)
2. 播放器组件优化
3. 时间管理功能

**后续任务**:
1. 配置 HTTPS
2. 提交小程序审核
