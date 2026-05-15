# OpenMAIC 重构计划 · Sprint 0 — N

> 📌 团队编制：队长 + 队员1 + 队员2 + 队员3
> 📌 来源文档：`task/REFACTORING_PLAN(1).pdf` (v0.2.1 → v1.0.0)
> 📌 格式约定：每个任务编号格式 `[Phase]-[序号]`，状态标记： 🔴 未开始 → 🔵 进行中 → ✅ 已完成

**核心原则：每人独立负责一个模块，无跨人依赖。总前置任务由队长完成。**

***

## 总前置任务 · 队长负责 (Week 1-3)

> 所有其他模块必须在队长完成这些任务后才能开始

***

### `P1-001` 类型系统标准化

> 重构 `lib/types/` 为模块化结构，建立清晰可扩展的类型层

- **前置任务**：无（整个项目的起点）
- **负责人**：队长
- **状态**：✅ 已完成
- **涉及文件**：`lib/types/provider.ts`, `lib/types/stage.ts`, `lib/types/action.ts`, `lib/types/chat.ts`, `lib/types/generation.ts`

**检验标准：**

- [ ] `lib/types/` 拆分为独立模块文件（provider / stage / action / chat / generation）
- [ ] 每个 Action 类型（20+）添加 JSDoc 注释说明用途
- [ ] `ProviderId` 从硬编码联合类型改为运行时可注册的扩展机制
- [ ] Stage / Scene / SceneContent 统一序列化/反序列化接口
- [ ] 所有 API 输入添加 Zod schema 验证（替代手动类型断言）

**产出文件：**

```
lib/types/
  index.ts              # barrel exports
  provider.ts           # ProviderId 运行时注册制
  stage.ts              # Stage, Scene 类型 + 序列化接口
  action.ts             # Action 联合类型 + JSDoc
  chat.ts               # ChatSession, StatelessChatRequest, StatelessEvent
  generation.ts         # UserRequirements, SceneOutline
  schemas/
    api-inputs.ts       # Zod schemas for API validation
```

***

### `P1-002` 提供商层优化

> 简化 14+ 提供商配置，减少 if/else 分支

- **前置任务**：`P1-001`（类型基础）
- **负责人**：队长
- **状态**：✅ 已完成
- **涉及文件**：`lib/ai/providers.ts`, `lib/ai/llm.ts`, `lib/ai/model-metadata.ts`, `lib/ai/thinking-config.ts`

**检验标准：**

- [ ] `getCompatThinkingBodyParams()` 中 10+ 个 case 分支重构为策略模式
- [ ] MiniMax URL、Google Proxy 等提供商特定逻辑提取为独立适配器文件
- [ ] 新增提供商能力探测 API（自动检测模型支持的能力）
- [ ] 支持热加载提供商配置（无需重启服务）
- [ ] 新增：提供商健康检查仪表板
- [ ] 新增：自动故障转移机制
- [ ] 新增：成本追踪（token 用量 + 费用估算）

**产出文件：**

```
lib/ai/
  providers.ts          # 重构：策略模式注册表
  llm.ts                # 简化后
  model-metadata.ts     # 能力探测 API
  thinking-config.ts    # 不变
  thinking-context.ts   # 不变
  adapters/
    minimax-adapter.ts  # MiniMax 特定逻辑
    google-adapter.ts   # Google Proxy 逻辑
  strategies/
    thinking-strategy.ts  # 策略模式替代 case 分支
  health.ts             # 提供商健康检查
  failover.ts           # 自动故障转移
  cost-tracker.ts       # 成本追踪
```

***

### `P2-001` 编排引擎重构

> 将 `director-graph.ts`（548 行）拆解为可独立测试的模块

- **前置任务**：`P1-001`（类型基础）
- **负责人**：队长
- **状态**：✅ 已完成
- **涉及文件**：`lib/orchestration/director-graph.ts`

**检验标准：**

- [ ] `director-graph.ts` 拆分为 4 个文件，每个 <200 行
- [ ] `graph-definition.ts` — 图结构定义，纯声明式 (\~100 行)
- [ ] `director-node.ts` — 导演节点逻辑 (\~150 行)
- [ ] `agent-node.ts` — 智能体生成节点逻辑 (\~200 行)
- [ ] `state-manager.ts` — 状态管理 (\~100 行)
- [ ] 画布尺寸、长度限制等硬编码值提取为配置常量
- [ ] 新增：智能体插件系统（第三方扩展）
- [ ] 新增：对话历史压缩（长对话自动摘要）
- [ ] 新增：智能体记忆系统（跨轮次记住关键信息）

**产出文件：**

```
lib/orchestration/
  director-graph.ts       # barrel: 导出图实例
  graph-definition.ts     # 纯声明式图结构
  director-node.ts        # 导演节点：LLM 路由 + 规则引擎
  agent-node.ts           # 智能体节点：提示词构建 → LLM 调用 → JSON 解析
  state-manager.ts        # 状态管理：消息裁剪 + 版本控制
  config.ts               # 提取的配置常量（画布尺寸、长度限制等）
  plugins/
    types.ts              # AgentPlugin 接口
    registry.ts           # 插件注册表
  compression/
    history-compressor.ts # 对话历史压缩
  memory/
    agent-memory.ts       # 跨轮次记忆
```

***

### `P5-001` API 层重构

> 统一错误处理 + 速率限制 + 版本管理 + OpenAPI 文档

- **前置任务**：`P1-001` + `P1-002`（类型和提供商层就绪）
- **负责人**：队长
- **状态**：✅ 已完成
- **涉及文件**：`app/api/*/route.ts`（全部 API 路由）

**检验标准：**

- [ ] 统一错误处理中间件（各路由分散处理改为统一）
- [ ] 请求速率限制
- [ ] API 版本管理（`/api/v1/...`）
- [ ] OpenAPI 文档自动生成

**产出文件：**

```
app/api/
  v1/                   # 版本化路由前缀
    chat/
    generate-classroom/
    generate/
    classroom/
    pbl/
  middleware/
    error-handler.ts    # 统一错误处理
    rate-limiter.ts     # 速率限制
  openapi/
    spec.json           # OpenAPI 规范
    route.ts            # Swagger UI
```

***

## 模块 A · 生成管线 (Week 4-6)

> 📌 负责人：**队员1**
> 目标：两阶段管线拆分 + JSON 修复 + 单元测试

> ⚠️ 本模块前置任务：`P1-001`（队长类型系统）

***

### `A-001` 两阶段生成管线拆分

> 将 `scene-generator.ts`（最大文件）拆分为独立内容生成器

- **前置任务**：`P1-001`
- **负责人**：队员1
- **状态**：🔴 未开始
- **涉及文件**：`lib/generation/scene-generator.ts`, `lib/generation/pipeline-runner.ts`

**检验标准：**

- [ ] `scene-generator.ts` 拆分为：`scene-content/`（各类型内容生成器）和 `scene-actions/`（动作生成器）
- [ ] 新增 `element-fixer.ts` — 元素修复/标准化
- [ ] 新增 `media-resolver.ts` — 图片/视频 ID 解析
- [ ] Widget 推断逻辑重写（§3.1）
- [ ] 中文 fallback 语音文本全部改为英文/多语言（§3.1）
- [ ] 格式化工具硬编码文本替换为可配置模板（§3.1）
- [ ] 新增：增量生成（边看大纲边修改）
- [ ] 新增：质量评分（完整性、连贯性自动评估）
- [ ] 新增：生成缓存（相似需求复用）
- [ ] 并行优化：带并发限制的 p-map 替代 Promise.all

**产出文件：**

```
lib/generation/
  pipeline-runner.ts    # 顶层编排（重构）
  outline-generator.ts  # Stage 1（保留）
  scene-content/
    slide-generator.ts
    quiz-generator.ts
    interactive-generator.ts
    pbl-generator.ts
  scene-actions/
    slide-actions.ts
    quiz-actions.ts
    interactive-actions.ts
  element-fixer.ts      # 元素修复/标准化
  media-resolver.ts     # 图片/视频 ID 解析
  quality-scorer.ts     # 质量评分
  cache.ts              # 生成缓存
```

***

### `A-002` JSON 修复与解析增强

> 将 `json-repair.ts` 重构为可插拔管道

- **前置任务**：`P1-001`（类型系统提供 Zod schema）
- **负责人**：队员1
- **状态**：🔴 未开始
- **涉及文件**：`lib/generation/json-repair.ts`

**检验标准：**

- [ ] 修复策略重构为可插拔管道（非硬编码链）
- [ ] 结构化输出模式验证（Zod schema 校验修复后 JSON）
- [ ] 修复链遥测：记录哪些修复策略被触发
- [ ] 遥测数据用于提示词优化反馈循环

**产出文件：**

```
lib/generation/
  json-repair.ts        # 重构：可插拔管道
  repair-pipeline.ts    # 管道编排器
  strategies/
    bracket-fixer.ts
    quote-fixer.ts
    trailing-comma.ts
    ...                 # 各修复策略插件
  telemetry/
    repair-telemetry.ts # 修复链遥测
```

***

### `A-003` 模块 A · 单元测试

> 为生成管线和 JSON 修复编写测试

- **前置任务**：`A-001`, `A-002`（队员1自有任务，不依赖他人）
- **负责人**：队员1
- **产出位置**：`__tests__/`

**检验标准：**

- [ ] 各场景生成器独立测试：slide / quiz / interactive / pbl
- [ ] 元素修复测试：畸形输入修复后结构正确
- [ ] 质量评分测试：评分逻辑与场景内容匹配
- [ ] 生成缓存测试：相似请求命中缓存，不同请求重新生成
- [ ] JSON 修复管道测试：各策略独立生效，管道顺序正确
- [ ] 结构化验证测试：非法 JSON 被拒绝，合法 JSON 通过
- [ ] 遥测测试：修复策略触发记录准确

**产出文件：**

```
__tests__/
  generation/
    slide-generator.test.ts
    quiz-generator.test.ts
    interactive-generator.test.ts
    pbl-generator.test.ts
    element-fixer.test.ts
    media-resolver.test.ts
    quality-scorer.test.ts
    cache.test.ts
  json-repair/
    repair-pipeline.test.ts
    strategies/
      bracket-fixer.test.ts
      quote-fixer.test.ts
    telemetry.test.ts
```

***

## 模块 B · 提示词与监控 (Week 4-7)

> 📌 负责人：**队员2**
> 目标：提示词系统 + 智能体注册表 + 监控系统 + 单元测试

> ⚠️ 本模块前置任务：`P1-001`（队长类型系统）+ `P2-001`（队长编排引擎）

***

### `B-001` 提示词系统重构

> 将 21 个专有模板替换为模块化、可配置的提示词系统

- **前置任务**：`P1-001` + `P2-001`
- **状态**：🔴 未开始
- **负责人**：队员2
- **涉及文件**：`lib/prompts/templates/*`（全部 21 个模板）
- **必须替换内容**：文档 §3.1 标记的所有"必须替换"项

**检验标准：**

- [ ] 旧模板目录 `lib/prompts/templates/` 完全废弃，新架构 `lib/prompts/` 启用
- [ ] 新目录结构按文档 §4.4 执行：`core/`, `roles/`, `student-personas/`, `generators/`
- [ ] 全部 21 个模板重写为基于公开教学法设计的新提示词
- [ ] 提示词组合引擎可用：将多个片段组合成完整提示词
- [ ] 支持用户自定义提示词片段覆盖默认值
- [ ] 提示词版本管理（A/B 测试框架）
- [ ] 多语言提示词支持（非英文硬编码）
- [ ] 提示词热更新（修改后无需重启）
- [ ] 默认智能体人设替换为通用英文版本（§3.1）
- [ ] 角色行为准则重写为通用教学角色定义（§3.1）
- [ ] 导演路由规则重写为通用对话路由（§3.1）
- [ ] 动作描述系统重写为通用工具描述（§3.1）

**产出文件：**

```
lib/prompts/
  core/
    agent-base.md         # 基础智能体提示词
    director-base.md      # 基础导演提示词
    output-format.md      # 输出格式规范
  roles/
    teacher.md            # 教师角色定义
    assistant.md          # 助教角色定义
  student-personas/
    curious.md            # 好奇宝宝
    analytical.md         # 分析师
    creative.md           # 创意型
    note-taker.md         # 笔记员
  generators/
    outline.md            # 大纲生成
    slide-content.md      # 幻灯片内容
    slide-actions.md      # 幻灯片动作
    quiz.md               # 测验
    quiz-actions.md       # 测验动作
    widget-teacher-actions.md
    interactive-outlines.md
    interactive-actions.md
    pbl-design.md
    pbl-actions.md
    web-search-query-rewrite.md
  composability.ts        # 提示词组合引擎
  version-manager.ts      # 版本管理 + A/B 测试
  i18n/
    zh.ts               # 中文提示词
    ja.ts               # 日文
    ...                 # 其他语言
```

***

### `B-002` 智能体注册表重构

> 将硬编码的 6 个默认智能体替换为可扩展的模板系统

- **前置任务**：`B-001`（队员2自有前置，提示词就绪）
- **状态**：🔴 未开始
- **负责人**：队员2
- **涉及文件**：`lib/orchestration/registry/store.ts`

**检验标准：**

- [ ] 6 个硬编码智能体改为模板系统
- [ ] 新目录结构按文档 §4.5 执行
- [ ] 支持用户通过 UI 自定义智能体
- [ ] LLM 自动生成智能体（agent-profiles API）改进为基于模板
- [ ] 智能体组合规则（角色搭配推荐）

**产出文件：**

```
lib/orchestration/registry/
  types.ts              # AgentConfig, AgentTemplate 接口
  store.ts              # Zustand store（保留并重构）
  templates/
    teacher.ts          # 教师模板
    assistant.ts        # 助教模板
    students/
      curious.ts        # 好奇宝宝
      analyst.ts        # 分析师
      creative.ts       # 创意型
      note-taker.ts     # 笔记员
  factory.ts            # 智能体工厂 — 从模板创建实例
  combination-rules.ts  # 角色组合规则
```

***

### `B-003` 测试与监控系统

> 单元测试覆盖 + 集成测试 + 性能监控 + 错误追踪

- **前置任务**：`P1-001` + `P2-001`
- **状态**：🔴 未开始
- **负责人**：队员2
- **产出位置**：`__tests__/`, `lib/monitoring/`

**检验标准：**

- [ ] 编排层单元测试（当前无覆盖）
- [ ] 生成管线集成测试
- [ ] 性能监控：生成时间、LLM 响应时间、token 消耗
- [ ] 错误追踪（Sentry 或类似方案）
- [ ] 新增：环境配置验证器（启动时检查环境变量）
- [ ] 新增：健康检查增强（检查各提供商连接状态）
- [ ] 新增：Docker 镜像优化（多阶段构建减小体积）

**产出文件：**

```
__tests__/
  integration/
    generate-pipeline.test.ts
    chat-endpoint.test.ts
    classroom-crud.test.ts
lib/monitoring/
  performance.ts        # 性能监控
  error-tracker.ts      # 错误追踪
  env-validator.ts      # 环境配置验证
  health-check.ts       # 健康检查
docker/
  Dockerfile.prod       # 多阶段构建
  Dockerfile.dev
```

***

### `B-004` 模块 B · 单元测试

> 为提示词系统、智能体注册表、监控系统编写测试

- **前置任务**：`B-001`, `B-002`, `B-003`（队员2自有任务，不依赖他人）
- **状态**：🔴 未开始
- **负责人**：队员2
- **产出位置**：`__tests__/`

**检验标准：**

- [ ] 提示词组合测试：多片段组合输出完整且无冲突
- [ ] 提示词版本测试：A/B 版本切换生效
- [ ] 提示词多语言测试：中文/日文提示词加载正确
- [ ] 智能体工厂测试：从模板创建实例字段完整
- [ ] 智能体组合测试：推荐的角色组合不产生冲突
- [ ] API 错误处理中间件测试：各类错误返回统一格式
- [ ] 速率限制测试：超限请求被正确拒绝
- [ ] 性能监控测试：指标采集和上报正确
- [ ] 错误追踪测试：异常被正确记录
- [ ] 环境验证器测试：缺少必需变量时启动失败并提示
- [ ] Docker 测试：多阶段构建镜像体积减小

**产出文件：**

```
__tests__/
  prompts/
    composability.test.ts
    version-manager.test.ts
    i18n.test.ts
  registry/
    factory.test.ts
    combination-rules.test.ts
  api/
    error-handler.test.ts
    rate-limiter.test.ts
  monitoring/
    performance.test.ts
    error-tracker.test.ts
    env-validator.test.ts
  docker/
    multi-stage-build.test.ts
```

***

## 模块 C · 前端架构 (Week 4-7)

> 📌 负责人：**队员3**
> 目标：状态管理 + 组件架构 + 前端测试

> ⚠️ 本模块前置任务：`P1-001`（队长类型系统）+ `P2-001`（队长编排引擎）

***

### `C-001` 状态管理优化

> 将 `settings.ts` store 拆分为多个子 store

- **前置任务**：`P1-001` + `P2-001`
- **状态**：🔴 未开始
- **负责人**：队员3
- **涉及文件**：`lib/store/settings.ts`, `lib/store/stage.ts`, `lib/store/canvas.ts`

**检验标准：**

- [ ] `settings.ts` 拆分为 5 个子 store：llm / audio / media / layout / agents
- [ ] 新增状态变更日志（调试多智能体 state 变化）
- [ ] IndexedDB 迁移系统支持 schema 版本升级
- [ ] 新增：设置导入/导出（JSON 文件）
- [ ] 新增：设置预设（教育模式 / 演示模式 / 开发模式）

**产出文件：**

```
lib/store/
  settings/
    llm.ts                # LLM 提供商配置
    audio.ts              # 音频配置
    media.ts              # 媒体生成配置
    layout.ts             # 布局配置
    agents.ts             # 智能体配置
  stage.ts                # 主状态 store（保留）
  canvas.ts               # 画布 UI（保留）
  migration.ts            # IndexedDB 迁移
  logger.ts               # 状态变更日志
  presets/
    education.ts          # 教育模式预设
    demo.ts               # 演示模式预设
    development.ts        # 开发模式预设
  import-export.ts        # 设置导入/导出
```

***

### `C-002` 组件架构优化

> 拆分大组件，提取通用框架

- **前置任务**：`C-001`（队员3自有前置，状态管理就绪）
- **状态**：🔴 未开始
- **负责人**：队员3
- **涉及文件**：`components/agent-bar.tsx`（41KB）, `components/slide-renderer/`, `components/slide-editor/`, `components/canvas/hooks/`

**检验标准：**

- [ ] `agent-bar.tsx`（41KB）拆分为多个子组件（每个 <100 行）
- [ ] slide-renderer/Editor/Canvas/hooks/ 中 \~10 个交互 hook 提取为通用 Canvas 框架
- [ ] 添加组件级 Error Boundary
- [ ] 虚拟化长列表（场景列表、聊天历史）
- [ ] 新增：暗色/亮色主题完善
- [ ] 新增：响应式布局优化（移动端支持）
- [ ] 新增：键盘快捷键系统完善

**产出文件：**

```
components/
  agent-bar/
    index.tsx
    agent-avatar.tsx
    agent-status.tsx
    agent-message.tsx
  canvas/
    hooks/              # 通用 Canvas 框架 hooks
    use-pan.ts
    use-zoom.ts
    use-selection.ts
  error-boundaries/
    component-error-boundary.tsx
  virtual-lists/
    scene-list.tsx
    chat-history.tsx
  theme/
    dark-theme.ts
    light-theme.ts
  responsive/
    mobile-layout.tsx
  keyboard/
    shortcuts.ts
```

***

### `C-003` 模块 C · 前端测试

> 为前端状态管理和组件编写测试

- **前置任务**：`C-001`, `C-002`（队员3自有任务，不依赖他人）
- **状态**：🔴 未开始
- **负责人**：队员3
- **产出位置**：`__tests__/`

**检验标准：**

- [ ] 各子 store 测试：llm / audio / media / layout / agents 独立生效
- [ ] IndexedDB 迁移测试：旧 schema 到新 schema 升级正确
- [ ] 设置导入/导出测试：JSON 往返数据一致
- [ ] 设置预设测试：切换预设后所有值正确
- [ ] agent-bar 子组件测试：各子组件渲染正确
- [ ] Canvas hooks 测试：pan / zoom / selection 行为正确
- [ ] Error Boundary 测试：组件抛错时边界生效
- [ ] 虚拟列表测试：长列表只渲染可见项
- [ ] 主题测试：暗色/亮色切换生效
- [ ] 响应式测试：移动端布局正确
- [ ] 快捷键测试：各快捷键触发正确行为

**产出文件：**

```
__tests__/
  store/
    settings-llm.test.ts
    settings-audio.test.ts
    settings-media.test.ts
    settings-layout.test.ts
    settings-agents.test.ts
    migration.test.ts
    import-export.test.ts
    presets.test.ts
  components/
    agent-bar.test.tsx
    canvas-hooks.test.tsx
    error-boundary.test.tsx
    virtual-list.test.tsx
    theme.test.tsx
    responsive.test.tsx
    shortcuts.test.tsx
```

***

## Phase 6 · 集成测试 + 总验收 (Week 11-12)

> 📌 负责人：**队长**
> 目标：全功能端到端测试 + 性能调优 + 文档完善

***

### `P6-001` 端到端集成测试（队长总测试）

> 覆盖所有功能路径，验证全系统协同工作

- **前置任务**：`A-003`, `B-004`, `C-003`（所有模块单元测试完成）
- **状态**：🔴 未开始
- **负责人**：队长
- **产出位置**：`__tests__/e2e/`

**检验标准：**

| #  | 测试路径                      | 描述                             | 状态   |
| -- | ------------------------- | ------------------------------ | ---- |
| 1  | 课堂创建 → 大纲生成 → 场景生成 → 开始上课 | 完整课堂生成流程                       | \[ ] |
| 2  | 多智能体对话循环                  | 导演调度 → 教师发言 → 助教补充 → 学生提问 → 循环 | \[ ] |
| 3  | 用户提问 → 导演路由 → 智能体回应       | 用户介入多智能体循环                     | \[ ] |
| 4  | 白板操作 → 冲突检测 → 布局调整        | 白板交互全流程                        | \[ ] |
| 5  | PBL 模式                    | 项目式学习完整流程                      | \[ ] |
| 6  | 提供商切换 → 故障转移              | 主提供商失败时自动切换                    | \[ ] |
| 7  | 提示词热更新                    | 修改提示词后无需重启生效                   | \[ ] |
| 8  | 智能体自定义 → 创建 → 使用          | 用户自定义智能体全流程                    | \[ ] |
| 9  | 增量生成                      | 边修改大纲边生成内容                     | \[ ] |
| 10 | 设置导入/导出 → 预设切换            | 设置管理全流程                        | \[ ] |
| 11 | 暗色/亮色主题 → 响应式布局 → 快捷键     | 前端功能全覆盖                        | \[ ] |
| 12 | API v1 全端点                | 所有 API 版本化端点                   | \[ ] |
| 13 | 速率限制 → 错误处理               | API 安全机制                       | \[ ] |
| 14 | 性能监控 + 错误追踪               | 监控系统端到端                        | \[ ] |
| 15 | 多语言支持                     | 7 种语言切换                        | \[ ] |
| 16 | 生成缓存                      | 相似请求命中缓存                       | \[ ] |
| 17 | 质量评分                      | 场景生成后自动评估                      | \[ ] |
| 18 | 对话历史压缩                    | 长对话不丢失关键信息                     | \[ ] |
| 19 | 智能体记忆跨轮次                  | 记住用户偏好和进度                      | \[ ] |
| 20 | JSON 修复链                  | 各种畸形 JSON 被正确修复                | \[ ] |

**产出文件：**

```
__tests__/e2e/
  classroom-lifecycle.test.ts       # 测试 1
  multi-agent-loop.test.ts          # 测试 2
  user-intervention.test.ts         # 测试 3
  whiteboard-flow.test.ts           # 测试 4
  pbl-flow.test.ts                  # 测试 5
  provider-failover.test.ts         # 测试 6
  prompt-hot-reload.test.ts         # 测试 7
  agent-customization.test.ts       # 测试 8
  incremental-generation.test.ts    # 测试 9
  settings-management.test.ts       # 测试 10
  frontend-features.test.ts         # 测试 11
  api-v1-full.test.ts               # 测试 12
  api-security.test.ts              # 测试 13
  monitoring-flow.test.ts           # 测试 14
  i18n-flow.test.ts                 # 测试 15
  cache-flow.test.ts                # 测试 16
  quality-scorer-flow.test.ts       # 测试 17
  history-compression.test.ts       # 测试 18
  agent-memory.test.ts              # 测试 19
  json-repair-flow.test.ts          # 测试 20
```

***

### `P6-002` 性能调优

> 根据监控数据优化瓶颈

- **前置任务**：`P6-001`
- **状态**：🔴 未开始
- **负责人**：队长
- **参考文档**：§6.1 性能优化、§6.2 可靠性优化、§6.3 可扩展性优化、§6.4 多智能体优化

**检验标准：**

- [ ] Token 消耗降低 40%+（提示词缓存 + 动态压缩）
- [ ] 生成速度提升：带并发限制的并行生成 + 流式输出
- [ ] 首屏加载：大纲生成完成后立即展示，逐页填充
- [ ] 内存占用：分页加载 + 场景懒加载
- [ ] 错误恢复：智能重试 + 断点续传 + 降级策略
- [ ] 导演决策快速路径：规则引擎预判 + LLM 兜底
- [ ] 对话连贯性：分层摘要（关键信息提取 + 滑动窗口）
- [ ] 角色平衡：发言计数器 + 强制轮转兜底
- [ ] 上下文窗口：智能裁剪（保留关键对话 + 摘要历史）
- [ ] 白板冲突预防 + 自动布局

***

### `P6-003` 文档完善

> 为重构后的系统编写完整文档

- **前置任务**：`P6-002`（性能调优完成）
- **负责人**：队长
- **产出位置**：`docs/`

**检验标准：**

- [ ] 架构文档（更新后的系统架构图 + 各层说明）
- [ ] API 文档（OpenAPI 自动生成 + 手动补充）
- [ ] 类型文档（各类型用途 + 关系图）
- [ ] 智能体文档（模板使用 + 自定义指南）
- [ ] 提示词文档（组合引擎使用 + 多语言支持）
- [ ] 部署文档（Docker + 环境变量 + 健康检查）
- [ ] 测试文档（测试运行指南 + 覆盖报告）
- [ ] 迁移指南（v0.2.1 → v1.0.0 升级步骤）

**产出文件：**

```
docs/
  architecture.md
  api-reference.md
  types-reference.md
  agents-guide.md
  prompts-guide.md
  deployment.md
  testing-guide.md
  migration-guide.md
```

***

## 任务依赖图

```
总前置任务 · 队长 (Week 1-3)
├── P1-001 类型系统标准化 ─────────────── 队长
│   ├── P1-002 提供商层优化 ───────────── 队长
│   │
├── P2-001 编排引擎重构 ───────────────── 队长
│   │
├── P5-001 API 层重构 ─────────────────── 队长
│
    │
    ├─ 模块 A · 生成管线 (队员1, Week 4-6)
    │   ├── A-001 两阶段管线拆分
    │   │   └── A-002 JSON 修复增强
    │   │       └── A-003 模块A测试
    │
    ├─ 模块 B · 提示词与监控 (队员2, Week 4-7)
    │   ├── B-001 提示词系统重构 ────┐
    │   │   └── B-002 智能体注册表 ──┤
    │   │       └── B-004 模块B测试 ←┘
    │   │
    │   └── B-003 监控系统 ──────────────┘
    │       └── (合并到 B-004)
    │
    └─ 模块 C · 前端架构 (队员3, Week 4-7)
        ├── C-001 状态管理优化
        │   └── C-002 组件架构优化
        │       └── C-003 模块C测试
    │
    ↓
Phase 6 · 队长总验收 (Week 11-12)
├── P6-001 端到端集成测试 ───────────── 队长
│   │
├── P6-002 性能调优 ─────────────────── 队长
│   │
└── P6-003 文档完善 ─────────────────── 队长
```

***

## 队员分工总览

| 角色      | 任务编号   | 任务名                                         | 周期         |
| ------- | ------ | ------------------------------------------- | ---------- |
| **队长**  | P1-001 | 类型系统标准化（整个项目起点，无前置）                         | Week 1-2   |
| **队长**  | P1-002 | 提供商层优化（策略模式 + 健康检查 + 故障转移 + 成本追踪）           | Week 1-2   |
| **队长**  | P2-001 | 编排引擎重构（图拆分 + 插件系统 + 压缩 + 记忆）                | Week 3-5   |
| **队长**  | P5-001 | API 层重构（错误处理 + 速率限制 + 版本管理 + OpenAPI）       | Week 3-5   |
| **队长**  | P6-001 | 端到端集成测试（20 项全功能测试）                          | Week 11-12 |
| **队长**  | P6-002 | 性能调优（10 项优化策略）                              | Week 11-12 |
| **队长**  | P6-003 | 文档完善（8 份文档）                                 | Week 11-12 |
| **队员1** | A-001  | 两阶段生成管线拆分（内容生成器 + 缓存 + 质量评分）                | Week 4-6   |
| **队员1** | A-002  | JSON 修复与解析增强（可插拔管道 + Zod 验证 + 遥测）           | Week 4-6   |
| **队员1** | A-003  | 模块A单元测试（生成管线 + JSON 修复测试）                   | Week 4-6   |
| **队员2** | B-001  | 提示词系统重构（21 个模板重写 + 组合引擎 + A/B + 多语言）        | Week 4-7   |
| **队员2** | B-002  | 智能体注册表重构（模板系统 + 工厂 + 组合规则）                  | Week 4-7   |
| **队员2** | B-003  | 测试与监控系统（集成测试 + 性能监控 + 错误追踪 + Docker）        | Week 4-7   |
| **队员2** | B-004  | 模块B单元测试（提示词 + 注册表 + 监控测试）                   | Week 4-7   |
| **队员3** | C-001  | 状态管理优化（5 个子 store + 迁移 + 预设 + 导入导出）         | Week 4-7   |
| **队员3** | C-002  | 组件架构优化（agent-bar 拆分 + Canvas 框架 + 主题 + 响应式） | Week 4-7   |
| **队员3** | C-003  | 模块C前端测试（状态管理 + 组件测试）                        | Week 4-7   |

**关键设计：三个模块可同时启动（只需队长总前置任务完成），模块间无交叉依赖。**

***

## 必须替换的专有内容清单（文档 §3.1，严格对照）

| 内容               | 位置                                 | 替换方案           | 对应任务  |
| ---------------- | ---------------------------------- | -------------- | ----- |
| 21 个提示词模板        | `lib/prompts/templates/*`          | 全部重写为新提示词      | B-001 |
| 默认智能体人设          | `registry/store.ts` 6 个默认 agent    | 替换为通用英文版本      | B-002 |
| 角色行为准则           | `prompt-builder.ts` roleGuidelines | 重写为通用教学角色定义    | B-001 |
| 导演路由规则           | `director-prompt.ts`               | 重写为通用对话路由      | B-001 |
| 动作描述系统           | `tool-schemas.ts`                  | 重写为通用工具描述      | B-001 |
| 场景生成管线逻辑         | `scene-generator.ts` 启发式规则         | 重写 widget 推断逻辑 | A-001 |
| 中文 fallback 语音文本 | `scene-generator.ts`               | 改为英文/多语言       | A-001 |
| 格式化工具硬编码文本       | `prompt-formatters.ts`             | 替换为可配置模板       | A-001 |

***

## 新增功能对应任务（文档 §5）

| 新增功能         | 对应任务   | 优先级 |
| ------------ | ------ | --- |
| 提供商健康检查仪表板   | P1-002 | P1  |
| 自动故障转移       | P1-002 | P1  |
| 成本追踪         | P1-002 | P2  |
| 智能体插件系统      | P2-001 | P2  |
| 对话历史压缩       | P2-001 | P1  |
| 智能体记忆系统      | P2-001 | P1  |
| 提示词版本管理      | B-001  | P2  |
| 增量生成         | A-001  | P1  |
| 质量评分         | A-001  | P2  |
| 生成缓存         | A-001  | P2  |
| 设置导入/导出      | C-001  | P2  |
| 设置预设         | C-001  | P2  |
| 暗色/亮色主题      | C-002  | P2  |
| 响应式布局        | C-002  | P2  |
| 键盘快捷键        | C-002  | P2  |
| API 速率限制     | P5-001 | P1  |
| OpenAPI 文档   | P5-001 | P2  |
| 性能监控         | B-003  | P1  |
| 错误追踪         | B-003  | P1  |
| 环境配置验证器      | B-003  | P1  |
| Docker 多阶段构建 | B-003  | P2  |

