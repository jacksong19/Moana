# 绘本艺术风格 - 前端参数与后端交互文档

## 问题描述

用户报告：选择"动漫风格-Q版萌系"(chibi)，但生成的绘本使用的是"皮克斯3D"(pixar_3d)风格。

## 1. 艺术风格选项列表

前端定义了 **5 大分类、32 种艺术风格**：

| 分类 | 分类ID | 风格值 (API传参) | 显示名称 |
|------|--------|-----------------|----------|
| **3D风格** | threed | `pixar_3d` | 皮克斯3D (推荐默认) |
| | | `pixar` | 皮克斯电影 |
| | | `dreamworks` | 梦工厂 |
| | | `disney_3d` | 迪士尼3D |
| | | `clay` | 粘土风格 |
| | | `figurine` | 手办风格 |
| | | `low_poly` | 低多边形 |
| **插画风格** | illustration | `storybook` | 绘本风格 |
| | | `watercolor` | 水彩风格 |
| | | `cartoon` | 卡通风格 |
| | | `flat` | 扁平风格 |
| | | `crayon` | 蜡笔风格 |
| | | `colored_pencil` | 彩铅风格 |
| **动漫风格** | anime | `anime` | 日式动漫 |
| | | **`chibi`** | **Q版萌系** ← 用户选择的 |
| | | `ghibli` | 吉卜力 |
| | | `shinkai` | 新海诚 |
| | | `manga` | 漫画风格 |
| | | `comic_book` | 美式漫画 |
| **艺术风格** | artistic | `oil_painting` | 油画 |
| | | `impressionist` | 印象派 |
| | | `sketch` | 素描 |
| | | `ink_wash` | 水墨画 |
| | | `pop_art` | 波普艺术 |
| | | `art_nouveau` | 新艺术 |
| | | `pixel_art` | 像素艺术 |
| **手工风格** | craft | `papercut` | 剪纸风格 |
| | | `felt_craft` | 不织布 |
| | | `origami` | 折纸风格 |
| | | `embroidery` | 刺绣风格 |
| | | `mosaic` | 马赛克 |
| | | `stained_glass` | 彩色玻璃 |

## 2. 前端→后端 API 请求格式

**API 端点**: `POST /content/picture-book/async`

**请求参数示例**（用户选择 Q版萌系 时）：
```json
{
  "child_name": "玥玥",
  "age_months": 36,
  "theme_topic": "bedtime",
  "theme_category": "habit",
  "art_style": "chibi",
  "protagonist": {
    "animal": "bunny"
  },
  "voice_id": "Kore"
}
```

**关键字段**: `art_style`
- 类型: string
- 用户选择 Q版萌系 时，值应为 `"chibi"`
- 默认值（未选择时）: `"pixar_3d"`

## 3. 前端代码关键位置

| 功能 | 文件位置 | 行号 |
|------|---------|------|
| 风格选项定义 | `src/pages/create/picture-book.vue` | 368-411 |
| 默认值设置 | 同上 | 418 (`'pixar_3d'`) |
| 选择处理函数 | 同上 | 428-441 (`selectArtStyle`) |
| API 请求构建 | 同上 | 805 (`art_style: selectedArtStyle.value`) |
| API 类型定义 | `src/api/content.ts` | 60-72 |

## 4. 交互流程

```
用户操作                    前端代码                      后端API
────────────────────────────────────────────────────────────────────
1. 进入风格设置步骤
   (currentStep = 1)

2. 切换到"动漫风格"分类   switchStyleCategory('anime')
   ↓                      console.log 输出分类切换

3. 点击"Q版萌系"卡片      selectArtStyle('chibi')
   ↓                      selectedArtStyle = 'chibi'
                          console.log 输出风格选择

4. 点击"下一步"           handleNext()
   ↓                      console.log 输出当前选择

5. 点击"开始创作"         startGenerate()
   ↓                      构建 requestParams
                          art_style: selectedArtStyle.value
                          console.log 输出完整参数
   ↓
                          generatePictureBookAsync(params) ──→ POST /content/picture-book/async
                                                              body: { art_style: "chibi", ... }
```

## 5. 前端已添加的调试日志

日志前缀：
- `[绘本-风格选择]` - 分类切换和风格选择
- `[绘本-步骤]` - 步骤跳转和状态记录
- `[绘本]` - API 请求参数

**关键日志输出示例**：
```
[绘本-风格选择] 分类切换: threed → anime (动漫风格)，当前选中风格: pixar_3d
[绘本-风格选择] 艺术风格变更: pixar_3d → chibi (Q版萌系)
[绘本-步骤] 风格设置完成，art_style=chibi, protagonist=bunny, voice=Kore
[绘本-步骤] 开始创作，最终 art_style=chibi
[绘本] 发起异步生成请求，完整参数: {"art_style":"chibi",...}
[绘本] art_style 参数: chibi (selectedArtStyle.value = chibi)
```

## 6. 后端排查建议

### 6.1 检查接口是否正确接收参数
```python
# 在 /content/picture-book/async 接口中打印
print(f"[绘本接口] 收到请求，art_style = {request.art_style}")
```

### 6.2 检查是否有默认值覆盖逻辑
- 是否存在 `art_style` 为空/None 时使用 `"pixar_3d"` 的逻辑
- 是否存在风格映射/转换逻辑

### 6.3 检查图片生成服务调用
- 实际调用 AI 图片生成时，传递的 style 参数是什么
- 是否有风格白名单，`chibi` 是否在支持列表中

### 6.4 检查数据库记录
```sql
-- 查询生成的绘本记录
SELECT id, title, art_style, created_at
FROM picture_books
WHERE title LIKE '%玥玥去睡觉%'
ORDER BY created_at DESC;
```

## 7. 复现步骤

请用户在微信开发者工具中重新操作，同时打开 Console 面板：

1. 进入创作绘本页面
2. 选择任意主题
3. 切换到"动漫风格"分类
4. 点击"Q版萌系"
5. 观察 Console 是否输出 `[绘本-风格选择] 艺术风格变更: xxx → chibi`
6. 点击下一步 → 开始创作
7. 观察 Console 输出的完整请求参数

**结论判断**：
- 如果前端日志显示 `art_style=chibi`，但生成结果是皮克斯3D风格 → **问题在后端**
- 如果前端日志显示 `art_style=pixar_3d` → **问题在前端选择逻辑**

---

文档生成时间: 2025-12-19
