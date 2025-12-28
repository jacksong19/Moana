# Moana - AI 儿童教育内容生成平台

<div align="center">

**基于 AI 的儿童教育内容创作全栈平台**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python)](https://python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![WeChat MiniProgram](https://img.shields.io/badge/WeChat-MiniProgram-07C160?logo=wechat)](https://mp.weixin.qq.com/)

</div>

## 项目简介

Moana 是一个基于 AI 技术的儿童教育内容生成全栈平台，支持自动生成绘本、儿歌、视频等多种教育内容。平台采用前后端分离架构，由后端 API 服务、微信小程序（儿童端）和 Web 管理端（家长端）组成，提供完整的内容创作、播放、管理体验。

### 核心功能

- 🎨 **AI 绘本生成** - 基于文本描述自动生成带插图的绘本故事
- 🎵 **AI 儿歌创作** - 自动生成儿歌歌词和音频，支持歌词同步高亮
- 🎬 **AI 视频制作** - 基于图片和文本生成教育视频内容
- 🧠 **智能创作助手** - 基于标签和灵感自动生成创意内容
- 👶 **儿童模式** - 安全的儿童使用界面，带时间限制和内容过滤
- 📊 **学习报告** - 详细的学习数据统计和分析
- ⭐ **收藏管理** - 内容收藏和分类管理

## 项目结构

```
Moana/
├── backend/                 # 后端服务 (Python/FastAPI)
│   ├── moana/              # 核心应用代码
│   │   ├── agents/         # AI Agent 模块
│   │   ├── api/            # API 路由
│   │   ├── models/         # 数据模型
│   │   ├── pipelines/      # 内容生成流水线
│   │   ├── routers/        # 路由模块
│   │   ├── schemas/        # Pydantic 模式
│   │   ├── services/       # 业务服务
│   │   │   ├── audio/      # 音频处理
│   │   │   ├── image/      # 图像生成 (Gemini/Wanx/MiniMax/Flux)
│   │   │   ├── llm/        # 大语言模型 (Gemini/Claude/OpenRouter)
│   │   │   ├── music/      # 音乐生成 (Suno/MiniMax)
│   │   │   ├── storage/    # 存储服务 (OSS/本地)
│   │   │   ├── tts/        # 语音合成 (Gemini/Qwen/MiniMax)
│   │   │   └── video/      # 视频生成 (Veo/Wanx/MiniMax)
│   │   ├── styles/         # 绘画风格配置
│   │   └── utils/          # 工具函数
│   ├── alembic/            # 数据库迁移
│   ├── tests/              # 测试用例
│   ├── pyproject.toml      # Python 项目配置
│   ├── alembic.ini         # Alembic 配置
│   └── .env.example        # 环境变量模板
│
├── frontend/               # 前端应用
│   ├── miniprogram/        # 微信小程序 (儿童端)
│   │   ├── src/
│   │   │   ├── pages/      # 页面
│   │   │   ├── components/ # 组件
│   │   │   ├── api/        # API 接口
│   │   │   └── stores/     # Pinia 状态管理
│   │   └── package.json
│   │
│   └── web/                # Web 管理端 (家长端)
│       ├── src/
│       │   ├── views/      # 页面视图
│       │   ├── components/ # 组件
│       │   ├── api/        # API 接口
│       │   ├── stores/     # Pinia 状态管理
│       │   └── router/     # 路由配置
│       └── package.json
│
└── docs/                   # 项目文档
    ├── backend/            # 后端 API 文档
    └── *.md                # 小程序文档
```

## 技术栈

### 后端服务

| 技术 | 版本 | 说明 |
|------|------|------|
| Python | 3.11+ | 运行时环境 |
| FastAPI | 0.104+ | Web 框架 |
| SQLAlchemy | 2.0+ | ORM |
| PostgreSQL | 14+ | 数据库 |
| Alembic | 1.13+ | 数据库迁移 |
| Pydantic | 2.5+ | 数据验证 |
| LangChain | 0.1+ | AI Agent 编排 |

### AI 服务提供商

| 服务类型 | 主力方案 | 备选方案 |
|----------|----------|----------|
| LLM | Google Gemini 3 | Claude 4.5 / OpenRouter |
| 图像生成 | Google Imagen / 万相 | MiniMax / Flux |
| 语音合成 | Gemini TTS / Qwen TTS | MiniMax TTS |
| 音乐生成 | MiniMax Music | Suno |
| 视频生成 | Google Veo 3.1 | 万相 / MiniMax |

### 前端技术

**微信小程序端**
- uni-app 3.x + Vue 3 + TypeScript
- Wot Design Uni (UI 组件库)
- Pinia 3.x (状态管理)
- Vite 5.x (构建工具)

**Web 管理端**
- Vue 3 + TypeScript
- Vue Router 4.x
- TailwindCSS 3.x
- Axios (HTTP 客户端)
- ECharts 5.x (图表)

## 快速开始

### 前置要求

- Python >= 3.11
- Node.js >= 16.x
- PostgreSQL >= 14
- 微信开发者工具（仅小程序开发需要）

### 后端部署

```bash
# 1. 进入后端目录
cd backend

# 2. 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 3. 安装依赖
pip install -e .

# 4. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库和 API Keys

# 5. 运行数据库迁移
alembic upgrade head

# 6. 启动服务
uvicorn moana.main:app --host 0.0.0.0 --port 8000 --reload
```

### 微信小程序开发

```bash
# 1. 进入小程序目录
cd frontend/miniprogram

# 2. 安装依赖
npm install

# 3. 配置微信小程序 AppID
cp project.config.json.template project.config.json
cp project.private.config.json.template project.private.config.json
cp src/manifest.json.template src/manifest.json
# 编辑配置文件，替换 YOUR_WECHAT_APPID_HERE

# 4. 开发模式编译
npm run dev:mp-weixin

# 5. 使用微信开发者工具导入 dist/dev/mp-weixin
```

### Web 管理端开发

```bash
# 1. 进入 web 目录
cd frontend/web

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 访问 http://localhost:5173
```

## 环境变量配置

后端服务需要配置以下环境变量（参考 `backend/.env.example`）：

```bash
# 数据库
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/moana

# AI 服务提供商选择
LLM_PROVIDER=gemini          # gemini | openrouter | claude
IMAGE_PROVIDER=gemini        # gemini | wanx | minimax | flux
TTS_PROVIDER=gemini          # gemini | qwen | minimax
MUSIC_PROVIDER=minimax       # minimax | suno
VIDEO_PROVIDER=veo           # veo | wanx | minimax

# Google API (Gemini / Veo / Imagen)
GOOGLE_API_KEY=your_api_key

# Anthropic Claude
ANTHROPIC_API_KEY=your_api_key

# 阿里云 DashScope (Qwen / 万相)
DASHSCOPE_API_KEY=your_api_key

# MiniMax
MINIMAX_API_KEY=your_api_key

# 存储配置 (OSS)
OSS_ACCESS_KEY=your_access_key
OSS_SECRET_KEY=your_secret_key
OSS_BUCKET=your_bucket
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
```

## API 文档

### 内容生成 API

```http
# 绘本生成（异步）
POST /api/v1/content/picture-book/async
GET  /api/v1/content/picture-book/status/{task_id}

# 儿歌生成（异步）
POST /api/v1/content/nursery-rhyme/async
GET  /api/v1/content/nursery-rhyme/status/{task_id}

# 视频生成
POST /api/v1/content/video

# 智能创作
POST /api/v1/content/smart
```

### 内容管理 API

```http
GET  /api/v1/content/list              # 内容列表
GET  /api/v1/content/{id}              # 内容详情
GET  /api/v1/content/{id}/asset-details # 素材参数
DELETE /api/v1/content/{id}            # 删除内容
```

### 用户相关 API

```http
POST /api/v1/auth/login                # 登录
POST /api/v1/auth/refresh              # 刷新 Token
GET  /api/v1/library/favorites         # 收藏列表
POST /api/v1/library/favorites/{id}    # 添加收藏
```

详细 API 文档请查看 `docs/backend/` 目录。

## 内容类型

| 类型 | 标识 | 说明 |
|------|------|------|
| 绘本 | `picture_book` | 图文结合的故事书，支持多种绘画风格 |
| 儿歌 | `nursery_rhyme` | 音频+歌词同步，支持多种音乐风格 |
| 视频 | `video` | 教育视频内容，基于图片生成 |

## 核心特性

### AI 内容生成

- **多模型支持**: 支持 Gemini、Claude、OpenRouter 等多种 LLM
- **异步生成机制**: 避免超时，支持长时间生成任务
- **实时进度反馈**: 生成过程分阶段显示
- **智能参数控制**: 支持绘画风格、时长、角色设定等高级参数
- **生成日志**: 完整的生成过程记录

### 用户体验

- **儿童模式**: 简化界面、时间限制（30分钟）、防误操作
- **内容收藏**: 快速访问喜欢的内容
- **播放记录**: 自动记录学习进度
- **离线缓存**: 音频和图片缓存

### 数据统计

- **学习时长**: 每日、每周、每月统计
- **内容分析**: 内容类型分布、最受欢迎内容
- **成长报告**: 可视化的学习成长轨迹

## 版本历史

### v1.1.0 (2025-12-28)

**架构升级**
- 🏗️ 项目重构为前后端分离的全栈架构
- 📁 前端代码整合到 `frontend/` 目录
- 🔧 后端代码独立为 `backend/` 模块

**后端新增**
- ✅ FastAPI 后端服务完整实现
- ✅ 多 AI 服务商支持 (Gemini/Claude/OpenRouter)
- ✅ 多媒体生成流水线 (图像/音频/视频)
- ✅ PostgreSQL + SQLAlchemy 数据持久化
- ✅ Alembic 数据库迁移
- ✅ 完整的测试覆盖

**前端优化**
- 🎵 儿歌播放器优化 - 歌词同步高亮增强
- 🧠 智能创作升级 - 完善标签灵感生成流程
- 📚 内容库改进 - 更好的内容展示和筛选

### v1.0.0

**功能特性**
- ✅ 绘本生成（支持多种绘画风格）
- ✅ 儿歌创作（Suno 音乐生成 + 歌词同步）
- ✅ 视频生成（基于 Veo 3.1）
- ✅ 智能创作（标签灵感生成）
- ✅ 儿童模式（时间限制 + 安全界面）
- ✅ Web 家长管理端

## 开发规范

### 代码风格

- Python: 遵循 PEP 8，使用 Ruff 格式化
- TypeScript: 使用 ESLint + Prettier
- Vue: 使用 Composition API

### Git 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建/工具配置
```

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 相关链接

- [FastAPI 官方文档](https://fastapi.tiangolo.com/)
- [Vue 3 官方文档](https://vuejs.org/)
- [微信小程序文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [TailwindCSS 文档](https://tailwindcss.com/)

---

<div align="center">

**用 ❤️ 为孩子们打造的教育平台**

Made with [Claude Code](https://claude.com/claude-code)

</div>
