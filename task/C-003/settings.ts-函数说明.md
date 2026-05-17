# `lib/store/settings.ts` 函数说明

> 这个文件做了什么：**整个项目的"设置大脑"，记住用户的所有配置（选了哪个 AI、填了什么 Key、面板怎么摆放），刷新不丢。**

---

## 文件结构总览

```
第 1-47 行     清理工具函数
第 50-51 行     播放速度常量
第 53-321 行    SettingsState 接口（定义了"能记住哪些东西"）
第 324-446 行   六个默认值工厂函数（每个领域一份出厂设置）
第 448-649 行   八个"兜底保护"函数（确保数据完整、不出错）
第 651-718 行   旧版数据迁移（从旧版本升级时搬数据）
第 720-1722 行  主 Store + 全部操作函数（核心）
第 1724-1805 行 预设系统 + 导入导出（你模块 C 加的）
```

---

## 一、清理工具函数

### `pruneThinkingConfigs()` — 第 29 行

**干什么**：清理"思考配置"里的垃圾条目。

**为什么需要**：用户可能先选了模型 A（支持思考），配了思考参数；后来切到模型 B（不支持思考），那些参数就没用了。这个函数定期清理废弃的配置，防止越攒越多。

---

## 二、`SettingsState` 接口 — 第 53 行

**干什么**：定义"这个页面能记住的所有东西"的清单。

**为什么要这么多字段**：项目对接了十几家 AI 提供商（OpenAI、Anthropic、MiniMax 等），涉及模型选择、语音合成、图片生成、视频生成、PDF 解析、网页搜索……每种服务都需要存 key、URL、开关状态。所以字段很多，但都是同一类模式：哪个提供商 + 什么配置 + 开关。

**怎么读懂**：每块中文意思——

| 区域 | 字段组 | 记什么 |
|------|--------|--------|
| 模型 | `providerId`, `modelId`, `thinkingConfigs`, `providersConfig` | 选了哪个 AI 模型，参数怎么配 |
| 语音 | `ttsProviderId`, `ttsVoice`, `ttsSpeed`, `asrProviderId`, ... | 文字转语音和语音识别用哪个服务 |
| PDF | `pdfProviderId`, `pdfProvidersConfig` | 解析 PDF 用哪个服务 |
| 图片 | `imageProviderId`, `imageModelId`, `imageProvidersConfig` | 生成图片用哪个模型 |
| 视频 | `videoProviderId`, `videoModelId`, `videoProvidersConfig` | 生成视频用哪个模型 |
| 搜索 | `webSearchProviderId`, `webSearchProvidersConfig` | 联网搜索用哪个引擎 |
| 开关 | `ttsEnabled`, `asrEnabled`, `imageGenerationEnabled`, ... | 各功能的全局开关 |
| 播放 | `ttsMuted`, `ttsVolume`, `autoPlayLecture`, `playbackSpeed` | 播放控制的当前值 |
| Agent | `selectedAgentIds`, `maxTurns`, `agentMode`, `autoAgentCount` | AI 角色怎么选、对话几轮 |
| 布局 | `sidebarCollapsed`, `chatAreaCollapsed`, `chatAreaWidth` | 面板展开/折叠、宽度 |
| 操作 | 第 200-320 行那一堆 `setXxx` | 每个字段对应的"修改函数" |

---

## 三、六个默认值工厂函数 — 第 324-446 行

每个函数的作用：**如果用户还没配，就先用这套出厂设置顶上**。

| 函数 | 负责领域 | 默认值 |
|------|---------|--------|
| `getDefaultProvidersConfig()` | LLM 模型提供商 | 列出所有内置提供商，各留空白 key |
| `getDefaultAudioConfig()` | TTS/ASR 语音 | 浏览器原生 TTS + 浏览器原生语音识别 |
| `getDefaultPDFConfig()` | PDF 解析 | unpdf（免费） |
| `getDefaultImageConfig()` | 图片生成 | seedream（豆包），各提供商全关 |
| `getDefaultVideoConfig()` | 视频生成 | seedance（豆包），各提供商全关 |
| `getDefaultWebSearchConfig()` | 网络搜索 | tavily，百度子源全开 |

---

## 四、八个"兜底保护"函数 — 第 448-649 行

这些用户看不到，但在后台默默保护数据不出错。

### `hasProviderId()` — 第 451 行

**干什么**：检查"这个提供商还存不存在"。

**为什么需要**：代码升级后可能删掉旧提供商。如果 store 里还记着"用 xxx 提供商"，但 xxx 已经不在系统里了，就需要发现这个问题并重置。

### `ensureValidProviderSelections()` — 第 460 行

**干什么**：逐一检查每个"当前选中的提供商"是否还有效。失效就复位到默认值。

**为什么需要**：用户上次用了一个提供商，这次更新代码后该提供商被移除——如果不处理，页面可能崩溃。

### `ensureBuiltInProviders()` — 第 544 行

**干什么**：保证所有内置 LLM 提供商都在配置列表里，且模型列表是最新的。

**为什么需要**：代码加了新模型（比如 OpenAI 发布了新模型），但用户的 localStorage 存的是旧列表。这个函数自动补上新模型，同时保留用户自己加的自定义模型。

### `ensureBuiltInAudioProviders()` — 第 509 行

**干什么**：同上，针对语音提供商。

### `ensureBuiltInImageProviders()` — 第 595 行

**干什么**：同上，针对图片生成提供商。

### `ensureBuiltInVideoProviders()` — 第 610 行

**干什么**：同上，针对视频生成提供商。

### `ensureBuiltInWebSearchProviders()` — 第 625 行

**干什么**：同上，针对网络搜索提供商。

### `ensureBaiduSubSources()` — 第 641 行

**干什么**：确保百度的子搜索源（网页、百科、学术）三个字段都存在，缺的补默认值。

### `promoteLegacyCustomProviderBaseUrls()` — 第 581 行

**干什么**：修复旧版本自定义提供商的 URL 存放位置问题。

**为什么需要**：旧版本把 URL 存在 `defaultBaseUrl` 字段，新版本改为 `baseUrl`。这个函数把旧数据搬运到新位置。

---

## 五、旧版数据迁移 — 第 652 行

### `migrateFromOldStorage()`

**干什么**：把旧版本 localStorage 里的零散字段（`llmModel`、`providersConfig`、`ttsModel` 等）拼成新格式。

**为什么需要**：用户之前用过旧版本，浏览器里存着旧格式数据。升级后不迁移的话，用户之前配的模型、key 全丢了。

---

## 六、主 Store — 第 720 行

### `useSettingsStore`

**干什么**：整个设置系统的核心。用了 Zustand 库的 `create` + `persist`（自动存 localStorage）。

**为什么需要 persist**：不用 persist 的话，刷新页面所有设置归零，用户每次都重新配一遍。

**里面的操作函数逐个说**：

| 函数 | 中文意思 | 为什么需要 |
|------|---------|-----------|
| `setModel(id, model)` | 切换 AI 模型 | 用户选了新模型要记下来 |
| `setThinkingConfig(id, model, config)` | 设置思考参数 | 某些模型支持"思考预算"，需要单独配 |
| `setProviderConfig(id, config)` | 改某个提供商的配置 | 用户填了 API Key 或改了 Base URL |
| `setProvidersConfig(config)` | 整批替换提供商配置 | 导入设置时用 |
| `setTtsModel(model)` | 切换 TTS 模型 | 旧版遗留，兼容用 |
| `setTTSMuted(bool)` | 静音 | 用户点了静音按钮 |
| `setTTSVolume(num)` | 调音量（0-1） | 拖动音量滑块 |
| `setAutoPlayLecture(bool)` | 自动播放讲解 | 开关自动播放 |
| `setPlaybackSpeed(speed)` | 播放速度 | 1x / 1.25x / 1.5x / 2x |
| `setSelectedAgentIds(ids)` | 选了哪些 AI 角色 | 用户在 Agent 面板勾选 |
| `setMaxTurns(n)` | 最大对话轮次 | 控制讨论多久 |
| `setAgentMode(mode)` | Agent 模式（手动/自动） | 切换预设选人或自动生成 |
| `setAutoAgentCount(n)` | 自动模式生成几个角色 | 自动时生成 3 个还是 5 个 |
| `setSidebarCollapsed(bool)` | 侧边栏折叠 | 用户收起了侧边栏 |
| `setChatAreaCollapsed(bool)` | 聊天区折叠 | 用户收起了聊天区 |
| `setChatAreaWidth(px)` | 聊天区宽度 | 拖拽面板宽度 |
| `setTTSProvider(id)` | 选哪个 TTS 服务 | 切换文字转语音的服务商 |
| `setTTSVoice(voice)` | 选哪个声音 | 切换 AI 说话的嗓音 |
| `setTTSSpeed(speed)` | 语速 | 调快/调慢 |
| `setASRProvider(id)` | 选哪个语音识别 | 切换"语音转文字"的服务商 |
| `setASRLanguage(lang)` | 识别什么语言 | 中文/英文/日文 |
| `setTTSProviderConfig(id, config)` | 改 TTS 配置 | 填 key 或改 URL |
| `setASRProviderConfig(id, config)` | 改 ASR 配置 | 同上 |
| `setTTSEnabled(bool)` | TTS 总开关 | 关闭后所有 AI 不出声 |
| `setASREnabled(bool)` | ASR 总开关 | 关闭后麦克风无效 |
| `addCustomTTSProvider(...)` | 添加自定义 TTS | 用户添加自己的语音服务 |
| `removeCustomTTSProvider(id)` | 删除自定义 TTS | 删掉不再用的 |
| `addCustomASRProvider(...)` | 添加自定义 ASR | 同上 |
| `removeCustomASRProvider(id)` | 删除自定义 ASR | 同上 |
| `setPDFProvider(id)` | 选 PDF 解析服务 | unpdf / mineru 切换 |
| `setPDFProviderConfig(id, config)` | 改 PDF 配置 | 填 key |
| `setImageProvider(id)` | 选图片生成服务 | 自动选该服务的第一个模型 |
| `setImageModelId(id)` | 选图片模型 | 切换具体模型 |
| `setImageProviderConfig(id, config)` | 改图片配置 | 填 key |
| `setVideoProvider(id)` | 选视频生成服务 | 切换提供商 |
| `setVideoModelId(id)` | 选视频模型 | 切换具体模型 |
| `setVideoProviderConfig(id, config)` | 改视频配置 | 填 key |
| `setImageGenerationEnabled(bool)` | 图片生成总开关 | 打开/关闭，打开时检查有无可用提供商 |
| `setVideoGenerationEnabled(bool)` | 视频生成总开关 | 同上 |
| `setReviewOutlineEnabled(bool)` | 大纲审核开关 | 打开/关闭 |
| `setWebSearchProvider(id)` | 选搜索引擎 | tavily / bocha / brave / baidu |
| `setWebSearchProviderConfig(id, config)` | 改搜索配置 | 填 key |
| `setBaiduSubSources(sources)` | 百度子源开关 | 网页/百科/学术各自开关 |
| `fetchServerProviders()` | 从服务器拉提供商列表 | 服务端配了 key 的话，自动同步到前端 |

### `fetchServerProviders()` 特别说明 — 第 1064 行

**干什么**：请求 `/api/server-providers`，获得服务端配置了哪些提供商，自动同步到前端 store。

**为什么需要**：部署时在服务器环境变量里配了 key（不在前端暴露），前端不知道哪些能用。这个函数去问服务器"你那边开了哪些服务"，然后：
1. 标记哪些是服务端配的（`isServerConfigured: true`）
2. 自动选第一个可用的提供商
3. 处理各种异常（模型下架、提供商不可用等自动降级）

---

## 七、持久化中间件配置 — 第 1528-1721 行

### `migrate` — 第 1531 行

**干什么**：Zustand 每次从 localStorage 读回数据时调它，做版本升级。

**版本历史**：
- v0 → v1：清空硬编码的默认模型，强制用户主动选
- v1 → v2：删除旧的"深度研究"，换成"网络搜索"
- 每次还补全新加的字段（媒体生成开关、Agent 模式、思考配置等）

### `merge` — 第 1704 行

**干什么**：每次页面加载时，把 localStorage 里的旧数据和代码里的新默认值合并。

**为什么需要**：代码更新加了新提供商，用户 localStorage 里没有，merge 阶段自动补上，同时保留用户之前填的 key 和自定义设置。

---

## 八、预设系统 — 第 1724 行（你模块 C 的）

### `DEFAULT_PRESET` — 默认模式

正常上课状态：语音全开，面板收起，手动选 3 个 Agent。

### `DEMO_PRESET` — 演示模式

投屏用：关语音（避免意外出声），展开侧边栏展示结构。

### `COLLAB_PRESET` — 协作模式

讨论用：展开聊天区 400px，自动生成 5 个 Agent，语音全开。

### `ALL_PRESETS`

三个预设的数组，给 UI 遍历展示用。

### `applyPreset(preset)`

一键应用预设：把预设里定义的字段写进 store，没写的保持不变。

---

## 九、导入导出 — 第 1792 行（你模块 C 的）

### `exportSettings()`

把当前全部设置序列化为 JSON 字符串，可用于下载备份。

### `importSettings(json)`

从 JSON 字符串恢复设置，覆盖当前值。和 export 配对实现备份/恢复。
