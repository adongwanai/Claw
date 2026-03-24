# 2026-03-24 Reference Gap Analysis

## Context

- Date: 2026-03-24
- Current project root: `C:/Users/22688/Desktop/ClawX-main`
- Goal: compare ClawX against the reference projects, identify reusable capabilities and major gaps, and persist the findings without changing product code.
- Method:
  - Four read-only subagents, each assigned one research domain.
  - Targeted local verification on the main thread for repo structure, tests, CI, TS config, i18n, and page/backend entry points.
  - No edits to `src/`, `electron/`, or `tests/` as part of the research itself.

## Scope

### Current project

- `C:/Users/22688/Desktop/ClawX-main/src/pages/`
- `C:/Users/22688/Desktop/ClawX-main/src/components/`
- `C:/Users/22688/Desktop/ClawX-main/src/stores/`
- `C:/Users/22688/Desktop/ClawX-main/electron/`
- `C:/Users/22688/Desktop/ClawX-main/electron/api/routes/`
- `C:/Users/22688/Desktop/ClawX-main/electron/gateway/`
- `C:/Users/22688/Desktop/ClawX-main/electron/services/`
- `C:/Users/22688/Desktop/ClawX-main/electron/utils/`

### Reference projects

- `C:/Users/22688/Desktop/ClawX-main/reference/LobsterAI-main/`
- `C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/`
- `C:/Users/22688/Desktop/ClawX-main/reference/openclaw-main/`
- `C:/Users/22688/Desktop/ClawX-main/reference/openclaw-control-center-main/`

## 1. UI/UX Function Gap

- 【不完善】数学公式渲染（化学公式）｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Chat/MarkdownContent.tsx`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/LobsterAI-main/src/renderer/components/MarkdownContent.tsx`｜当前已支持 `remark-math` + `rehype-katex`，但未引入 `katex/contrib/mhchem`，化学公式覆盖面弱于参考实现。
- 【不完善】思维链展示｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Chat/ChatMessage.tsx`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/LobsterAI-main/src/renderer/components/cowork/CoworkSessionDetail.tsx`｜当前只有静态折叠块，默认收起且无流式状态提示；参考实现会随流式自动展开/收起，并用脉冲点提示 reasoning 正在生成。
- 【不完善】QuickAction bar｜当前：`C:/Users/22688/Desktop/ClawX-main/src/components/workbench/workbench-empty-state.tsx`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/LobsterAI-main/src/renderer/components/quick-actions/QuickActionBar.tsx`、`C:/Users/22688/Desktop/ClawX-main/reference/LobsterAI-main/src/renderer/components/quick-actions/PromptPanel.tsx`｜当前快捷动作只出现在空会话页，点击后直接发消息；参考实现是常驻 QuickActionBar，并能展开二级 PromptPanel、映射技能、回填输入框。
- 【缺失】Slash 命令｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Chat/ChatInput.tsx`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/components/chat/ConversationView.tsx`、`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/lib/slash-commands.ts`｜当前输入框没有 `/` 命令解析、候选下拉、键盘导航与执行逻辑。
- 【缺失】会话搜索｜当前：`C:/Users/22688/Desktop/ClawX-main/src/components/layout/Sidebar.tsx`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/LobsterAI-main/src/renderer/components/cowork/CoworkSearchModal.tsx`、`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/components/GlobalSearch.tsx`｜当前侧栏只有会话列表与右键菜单，没有搜索入口；参考项目提供会话搜索弹窗或全局 `Cmd/Ctrl+K` 搜索。
- 【缺失】会话置顶｜当前：`C:/Users/22688/Desktop/ClawX-main/src/components/layout/Sidebar.tsx`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/LobsterAI-main/src/renderer/components/cowork/CoworkSessionItem.tsx`｜当前会话右键菜单只有批量选择和删除；参考实现支持 pin/unpin，并在排序与图标状态上体现。
- 【缺失】会话导出｜当前：`C:/Users/22688/Desktop/ClawX-main/src/components/layout/Sidebar.tsx`、`C:/Users/22688/Desktop/ClawX-main/src/pages/Chat/index.tsx`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/LobsterAI-main/src/renderer/components/cowork/CoworkSessionDetail.tsx`｜当前会话入口和详情都没有导出动作；参考实现支持将会话导出为结果图片并给出成功/失败反馈。
- 【不完善】AskUserQuestion wizard｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/TaskKanban/AskUserQuestionWizard.tsx`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/LobsterAI-main/src/renderer/components/cowork/CoworkQuestionWizard.tsx`、`C:/Users/22688/Desktop/ClawX-main/reference/LobsterAI-main/src/renderer/components/cowork/CoworkPermissionModal.tsx`｜当前向导能分步答题，但只基于 `approval.prompt` 解析问题；参考实现还能回填已有答案、读取结构化 `toolInput.questions`，并展示请求命令上下文。
- 【不完善】工具调用确认 UI｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/TaskKanban/index.tsx`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/LobsterAI-main/src/renderer/components/cowork/CoworkPermissionModal.tsx`｜当前审批区是看板顶部的简化卡片，只显示命令名、agent、prompt；参考实现是专门确认弹窗，能展示 tool name、完整 tool input、批准/拒绝语义和危险操作告警。
- 【不完善】文件变更预览｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/TaskKanban/index.tsx`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/LobsterAI-main/src/renderer/components/cowork/CoworkSessionDetail.tsx`｜当前审批时几乎看不到目标文件或变更结果；参考实现虽不是真正 side-by-side diff，但至少能把 `edit/write/multiedit` 工具输入与结果按 turn/tool group 展开。
- 【不完善】Toast 样式统一性｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Chat/index.tsx`、`C:/Users/22688/Desktop/ClawX-main/src/components/layout/Sidebar.tsx`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/LobsterAI-main/src/renderer/components/Toast.tsx`｜当前主要是分散的 `sonner` 调用，未见品牌化 toast 组件。
- 【不完善】操作反馈完整度｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Chat/index.tsx`、`C:/Users/22688/Desktop/ClawX-main/src/components/channels/ChannelConfigModal.tsx`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/LobsterAI-main/src/renderer/components/cowork/CoworkSessionDetail.tsx`、`C:/Users/22688/Desktop/ClawX-main/reference/LobsterAI-main/src/renderer/components/Toast.tsx`｜当前多数操作只有一次性 success/error 文案，缺少持久可关闭反馈和结果反馈闭环。
- 【不完善】聊天页响应式与移动端适配｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Chat/index.tsx`、`C:/Users/22688/Desktop/ClawX-main/src/pages/Chat/ChatInput.tsx`、`C:/Users/22688/Desktop/ClawX-main/src/components/workbench/context-rail.tsx`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/app/chat/page.tsx`、`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/components/MobileSidebar.tsx`｜当前布局以桌面双栏为主，没有移动端会话全屏层和返回逻辑。
- 【不完善】过渡动画体系｜当前：`C:/Users/22688/Desktop/ClawX-main/src/components/layout/Sidebar.tsx`、`C:/Users/22688/Desktop/ClawX-main/src/pages/Chat/index.tsx`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/app/globals.css`、`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/components/chat/ConversationView.tsx`｜当前以基础 `transition` 和简单 loading 动作为主，缺少统一动画 token 与组件级进入/退出动效。
- 【缺失】骨架屏｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Chat/index.tsx`、`C:/Users/22688/Desktop/ClawX-main/src/components/common/LoadingSpinner.tsx`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/components/ui/skeleton.tsx`｜当前加载态基本是转圈或“加载中”文本，没有骨架占位。
- 【不完善】空状态插画与视觉引导｜当前：`C:/Users/22688/Desktop/ClawX-main/src/components/workbench/workbench-empty-state.tsx`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/app/chat/page.tsx`｜当前空状态以 emoji 和卡片为主，缺少插画化视觉锚点与快捷键引导。

## 2. Backend Capability Gap

- `⚠️部分` MCP 配置管理｜当前：`C:/Users/22688/Desktop/ClawX-main/electron/api/routes/mcp.ts`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/LobsterAI-main/src/main/libs/mcpServerManager.ts`｜当前只有 `mcp-servers.json` CRUD 和 `enabled` 开关，属于静态配置层。
- `❌缺失` MCP 生命周期管理｜当前：`C:/Users/22688/Desktop/ClawX-main/electron/api/routes/mcp.ts`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/LobsterAI-main/src/main/libs/mcpServerManager.ts`｜当前未见 `start/stop/connect/listTools/callTool` 这类 runtime 管理器。
- `❌缺失` MCP 日志查看｜当前：`C:/Users/22688/Desktop/ClawX-main/electron/api/routes/mcp.ts`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/openclaw-main/src/agents/pi-bundle-mcp-tools.ts`｜当前没有 MCP 专属 stderr 捕获或按 server 维度日志暴露。
- `✅已有` 多 agent 静态配置与资源隔离｜当前：`C:/Users/22688/Desktop/ClawX-main/electron/utils/agent-config.ts`、`C:/Users/22688/Desktop/ClawX-main/electron/api/routes/agents.ts`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/openclaw-main/src/agents/tools/sessions-spawn-tool.ts`｜当前能创建 agent、复制 workspace/runtime 文件、绑定 channel/account，但这是静态配置层而非运行时协作引擎。
- `❌缺失` 多 agent 协作编排｜当前：`C:/Users/22688/Desktop/ClawX-main/electron/utils/agent-config.ts`、`C:/Users/22688/Desktop/ClawX-main/electron/api/routes/agents.ts`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/openclaw-main/src/agents/tools/sessions-spawn-tool.ts`、`C:/Users/22688/Desktop/ClawX-main/reference/openclaw-main/src/agents/tools/subagents-tool.ts`｜当前未见 `sessions_spawn`、subagent `list/kill/steer/wait`、thread/session mode、attachments、sandbox、timeout 等协作能力。
- `⚠️部分` 技能系统｜当前：`C:/Users/22688/Desktop/ClawX-main/electron/gateway/clawhub.ts`、`C:/Users/22688/Desktop/ClawX-main/electron/utils/skill-config.ts`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/openclaw-main/src/agents/cli-runner/bundle-mcp.ts`、`C:/Users/22688/Desktop/ClawX-main/reference/openclaw-main/src/agents/pi-bundle-mcp-tools.ts`｜当前技能更多是搜索、安装、启用、配置与预装分发；参考把 bundle/MCP 能力注入 agent runtime。
- `❌缺失` 工具注册机制｜当前：`C:/Users/22688/Desktop/ClawX-main/electron/utils/skill-config.ts`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/openclaw-main/src/agents/pi-bundle-mcp-tools.ts`、`C:/Users/22688/Desktop/ClawX-main/reference/openclaw-main/src/plugins/runtime/types.ts`｜当前未见把技能/插件注册为 agent 可执行工具的 backend 机制。
- `✅已有` 定时任务基础 CRUD｜当前：`C:/Users/22688/Desktop/ClawX-main/electron/api/routes/cron.ts`、`C:/Users/22688/Desktop/ClawX-main/electron/main/ipc-handlers.ts`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/openclaw-main/src/gateway/server-methods/cron.ts`｜基础的 `list/add/update/remove/run` 已有。
- `⚠️部分` 定时任务运行历史｜当前：`C:/Users/22688/Desktop/ClawX-main/electron/api/routes/cron.ts`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/openclaw-main/src/gateway/server-methods/cron.ts`｜当前能读单 job `jsonl` 并做 session-history fallback，但缺少全局分页、状态过滤、delivery 状态过滤和 query/sort。
- `❌缺失` Cron 失败重试、失败告警与投递策略｜当前：`C:/Users/22688/Desktop/ClawX-main/electron/api/routes/cron.ts`、`C:/Users/22688/Desktop/ClawX-main/electron/main/ipc-handlers.ts`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/openclaw-main/ui/src/ui/views/cron.ts`｜当前未见 `failureAlertAfter`、`failureAlertCooldownSeconds`、`failureAlertChannel`、`deliveryBestEffort` 等链路。
- `✅已有` 记忆文件存储与抽取｜当前：`C:/Users/22688/Desktop/ClawX-main/electron/api/routes/memory.ts`、`C:/Users/22688/Desktop/ClawX-main/electron/api/routes/memory-extract.ts`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/openclaw-main/src/agents/tools/memory-tool.ts`｜当前能管理 `MEMORY.md` / `memory/*.md` 并做规则 + LLM judge 抽取。
- `⚠️部分` 记忆检索与向量化｜当前：`C:/Users/22688/Desktop/ClawX-main/electron/api/routes/memory.ts`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/openclaw-main/src/agents/tools/memory-tool.ts`、`C:/Users/22688/Desktop/ClawX-main/reference/openclaw-main/docs/concepts/memory.md`｜当前更多是在读取 `memorySearch` 配置并代理 `openclaw memory status/reindex`。
- `❌缺失` 知识库管理 / 多路径集合 / QMD｜当前：`C:/Users/22688/Desktop/ClawX-main/electron/api/routes/memory.ts`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/openclaw-main/docs/concepts/memory.md`｜当前证据仍局限单 workspace 文件树，缺少 `extraPaths`、QMD collection、scope/citation 策略管理。
- `✅已有` 通道配置、凭证校验、插件安装｜当前：`C:/Users/22688/Desktop/ClawX-main/electron/api/routes/channels.ts`、`C:/Users/22688/Desktop/ClawX-main/electron/utils/channel-config.ts`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/openclaw-main/src/channels/plugins/types.core.ts`｜当前配置层做得比较全。
- `❌缺失` IM 消息格式适配与能力发现 runtime｜当前：`C:/Users/22688/Desktop/ClawX-main/electron/utils/channel-config.ts`、`C:/Users/22688/Desktop/ClawX-main/electron/gateway/client.ts`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/openclaw-main/src/channels/plugins/types.core.ts`｜当前主要是表单到配置结构的转换，缺少 `actions/capabilities/schema/status` 级抽象。
- `⚠️部分` 本地 API 鉴权｜当前：`C:/Users/22688/Desktop/ClawX-main/electron/api/route-utils.ts`、`C:/Users/22688/Desktop/ClawX-main/electron/api/server.ts`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/openclaw-main/src/gateway/auth.ts`、`C:/Users/22688/Desktop/ClawX-main/reference/openclaw-control-center-main/src/runtime/local-token-auth.ts`｜当前只有 `x-clawx-host-session` 与 trusted origin，缺少更完整 auth gate。
- `❌缺失` 多用户隔离与 rate limiting｜当前：`C:/Users/22688/Desktop/ClawX-main/electron/utils/agent-config.ts`、`C:/Users/22688/Desktop/ClawX-main/electron/api/server.ts`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/openclaw-main/src/gateway/auth.ts`、`C:/Users/22688/Desktop/ClawX-main/reference/openclaw-main/src/gateway/auth-rate-limit.ts`｜当前仍是本机单用户控制层设计。
- `✅已有` Secrets 本地安全存储｜当前：`C:/Users/22688/Desktop/ClawX-main/electron/services/secrets/secret-store.ts`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/openclaw-main/src/gateway/auth.ts`｜当前对 provider secrets 的本地加密是明确存在的。
- `✅已有` Electron 自动更新主链路｜当前：`C:/Users/22688/Desktop/ClawX-main/electron/main/updater.ts`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/openclaw-main/apps/macos/Sources/OpenClaw/MenuBar.swift`｜桌面端 `check/download/install/channel/countdown` 链路相对完整。
- `⚠️部分` 渐进发布与跨安装形态更新策略｜当前：`C:/Users/22688/Desktop/ClawX-main/electron/main/updater.ts`｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/openclaw-main/src/infra/update-startup.ts`｜当前有 feed channel 切换，但未见 stable rollout delay/jitter、beta check interval、attempt state persistence 等更成熟策略。

## 3. Page Completeness Gap

### Kanban

- 票据职责标签缺失｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/components/kanban/CreateTicketModal.tsx`、`TicketCard.tsx`、`TicketDetailPanel.tsx`、`lib/kanban/types.ts`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/TaskKanban/index.tsx`｜ClawPort 的 ticket 有 `assigneeRole`，ClawX 只有 `priority + assignee`。
- 详情面板能力明显不足｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/components/kanban/TicketDetailPanel.tsx`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/TaskKanban/index.tsx`｜ClawPort 详情侧栏能加载 ticket chat history、向 agent 追问 ticket、流式收消息并持久化；ClawX 详情侧栏主要是静态信息查看。
- 拖拽与执行状态联动不足｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/lib/kanban/useAgentWork.ts`、`app/kanban/page.tsx`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/TaskKanban/index.tsx`｜ClawPort `todo` 任务会自动触发 agent work，进行中任务禁止手动移动，失败后可 retry，并自动写回结果和 chat history；ClawX 只有前端拖拽改列和简单状态字段。

### Cron

- 缺少面向运维的总览层｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/app/crons/page.tsx`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Cron/index.tsx`｜ClawPort 有状态筛选、delivery 配置概览、执行错误/配置错误 banner、最近更新时间；ClawX 只有 Overview / Schedule / Pipelines 三个 tab。
- 缺少 pipeline 配置创建/编辑闭环｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/components/crons/PipelineWizard.tsx`、`app/crons/page.tsx`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Cron/index.tsx`｜ClawPort 有 `PipelineGraph` + `PipelineWizard`，ClawX 没有等价的 pipeline 建模/编辑 UI。
- 运行历史和日志查看更薄｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/components/crons/PipelineDetailPanel.tsx`、`app/crons/page.tsx`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Cron/index.tsx`｜ClawPort cron 详情会显示 timezone、delivery、consecutive errors、copyable `lastError`、recent runs、pipeline inputs/outputs，并可带 cron context 对话。

### Costs

- 缺少按 cron/job 的成本视角｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/components/costs/CostsPage.tsx`、`lib/costs.ts`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Costs/index.tsx`｜ClawPort 有 `TopCrons`、job cost table、top spender 等按任务聚合的成本视图。
- 图表和明细层不完整｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/components/costs/DailyCostChart.tsx`、`TokenDonut.tsx`、`RunDetailTable.tsx`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Costs/index.tsx`｜ClawX 只有较简化的 dashboard 图和 recent entries。
- 缺少优化分析层｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/components/costs/OptimizationPanel.tsx`、`CostsPage.tsx`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Costs/index.tsx`｜ClawPort 有 optimization score、anomaly detection、week-over-week、cache savings、insights 和 Agent Optimizer AI 分析区。
- 缺少实时 usage stream｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/components/costs/CostsPage.tsx`、`app/api/usage/stream/route.ts`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Costs/index.tsx`｜ClawPort 通过 SSE 订阅 `/api/usage/stream`。

### Memory

- 搜索能力不足｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/app/memory/page.tsx`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Memory/index.tsx`｜ClawPort 搜索会扫正文、显示命中数并高亮匹配；ClawX 只按 `label/relativePath` 过滤。
- 编辑器工具链不足｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/app/memory/page.tsx`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Memory/index.tsx`｜ClawPort 有 copy/download、JSON 高亮、unsaved changes 提示、editing hints、reindex after save。
- 编辑安全机制不足｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/lib/memory-write.ts`、`app/api/memory/route.ts`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Memory/index.tsx`｜ClawPort 的写入链路有路径白名单、mtime 冲突检测、内容规范化、git snapshot、原子写。
- 缺少记忆健康分析层｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/app/memory/page.tsx`、`lib/memory.ts`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Memory/index.tsx`｜ClawPort 有 health score、check 列表、stale daily logs、AI-powered memory health analysis/chat。

### Docs

- 独立 Docs / Help 系统缺失｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/app/docs/page.tsx`、`components/NavLinks.tsx`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/App.tsx`、`C:/Users/22688/Desktop/ClawX-main/src/components/layout/Sidebar.tsx`｜ClawX 没有 docs route，也没有 sidebar docs 入口。
- 内置文档覆盖缺失｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/app/docs/page.tsx`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Memory/index.tsx`｜ClawPort 内置 Getting Started、Architecture、Agents、Best Practices、API Reference、Cron System、Theming、Components、Troubleshooting 等章节；ClawX 只有 Memory 页面里的 Guide 子页。
- 文档检索与导航能力缺失｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/app/docs/page.tsx`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/App.tsx`｜ClawPort 有 section search、键盘导航、hash deep-link。

### Activity

- 缺少结构化审计事件视图｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/app/activity/page.tsx`、`components/activity/LogBrowser.tsx`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Activity/index.tsx`｜ClawPort 读取结构化 `entries + summary`，每条含 `source/level/category/jobId/duration/details`；ClawX 仍是文本日志按正则拆行。
- 过滤维度不足｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/components/activity/LogBrowser.tsx`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Activity/index.tsx`｜ClawPort 可按 `all/error/cron/config` 过滤，并显示 total/errors/sources summary cards。
- 时间线 / 详情层更弱｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/components/activity/LogBrowser.tsx`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Activity/index.tsx`｜ClawPort 每条 event 可展开 raw JSON、duration、source/category；ClawX 只有原始 message 行。
- 缺少 live logs 入口｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/app/activity/page.tsx`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Activity/index.tsx`｜ClawPort 页面可打开 live stream widget。

### Settings

- 缺少工作台 logo / icon 上传｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/app/settings/page.tsx`、`lib/settings.ts`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Settings/index.tsx`、`C:/Users/22688/Desktop/ClawX-main/src/stores/settings.ts`｜ClawPort 可上传 portal icon、预览、清空，并与 emoji/background 联动。
- 缺少设置页内 agent 图片 override｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/app/settings/page.tsx`、`lib/settings.ts`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Settings/index.tsx`、`C:/Users/22688/Desktop/ClawX-main/src/components/agents/AgentSettingsModal.tsx`｜ClawPort 可为每个 agent 上传 / 移除 profile image override。
- 缺少重跑初始化 / 清理数据动作｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/app/settings/page.tsx`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/components/settings-center/settings-shell-data.ts`、`C:/Users/22688/Desktop/ClawX-main/src/pages/Settings/index.tsx`｜ClawPort 提供 `Re-run Setup`、`Reset All Settings`、`Clear Server Data`。

### Agent Management

- 缺少独立 agent 详情页｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/app/agents/[id]/page.tsx`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Agents/index.tsx`、`C:/Users/22688/Desktop/ClawX-main/src/components/agents/AgentSettingsModal.tsx`｜ClawPort 每个 agent 有单独详情路由，ClawX 只有列表页 + modal。
- 缺少 agent 元数据展示｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/app/agents/[id]/page.tsx`、`lib/types.ts`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/types/agent.ts`、`C:/Users/22688/Desktop/ClawX-main/src/components/agents/AgentSettingsModal.tsx`｜ClawPort 详情会显示 `title / description / tools / SOUL.md / voiceId / color / emoji`。
- 缺少层级关系视图｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/app/agents/[id]/page.tsx`、`lib/types.ts`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/types/agent.ts`、`C:/Users/22688/Desktop/ClawX-main/src/pages/Agents/index.tsx`｜ClawPort 有 `reportsTo / directReports` 导航。
- 缺少 agent 关联 cron 视图｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/app/agents/[id]/page.tsx`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/pages/Agents/index.tsx`、`C:/Users/22688/Desktop/ClawX-main/src/components/agents/AgentSettingsModal.tsx`｜ClawPort 会在 agent 详情页列出该 agent 的 crons 并提供跳转。
- 缺少 agent 头像照片上传 / 移除｜参考：`C:/Users/22688/Desktop/ClawX-main/reference/clawport-ui-main/app/agents/[id]/page.tsx`｜当前：`C:/Users/22688/Desktop/ClawX-main/src/components/agents/AgentSettingsModal.tsx`｜ClawX 当前 agent 管理仍以文本配置和 channel 绑定为主。

## 4. Engineering Quality and DX Gap

- 测试覆盖（3/5）｜当前结论：单测面不小，但关键用户闭环缺少真实 E2E。证据：当前项目约 `74` 个测试文件，测试入口见 `C:/Users/22688/Desktop/ClawX-main/package.json`；`test:e2e` 为 `playwright test --pass-with-no-tests`。参考：`openclaw-main` 有平台级 `test:coverage`、`test:e2e`、`install-smoke`、`live`、`docker` 级别测试矩阵。
- 类型安全（4/5）｜当前结论：TS 基线良好，已进入严格类型区间，但还没到平台级强约束。证据：`C:/Users/22688/Desktop/ClawX-main/tsconfig.json` 和 `tsconfig.node.json` 开了 `strict`；允许范围内仅少量显式 `any`。参考：`openclaw-main` 和 `clawport-ui-main` 同样开启 `strict`，但 `openclaw-main` 还把更多边界治理脚本化。
- 错误处理（3/5）｜当前结论：UI 侧已有基本兜底，但全局异常治理和回归测试偏弱。证据：`C:/Users/22688/Desktop/ClawX-main/src/App.tsx` 与 `src/components/common/ErrorBoundary.tsx` 有错误边界；但未见主进程级 `uncaughtException` / `unhandledRejection` 治理测试。参考：`openclaw-main` 有 `src/infra/unhandled-rejections.fatal-detection.test.ts` 等异常路径测试。
- 国际化（2/5）｜当前结论：机制已建立，但覆盖并未收口。证据：`C:/Users/22688/Desktop/ClawX-main/src/i18n/` 下有 `en / zh / ja` 共 27 个 locale 文件，但 `src/pages` 和 `src/components` 仍存在大量硬编码文案；自动校验只看到配置和语言检测测试。参考：`openclaw-main` 对 locale registry 和 docs i18n 有更系统的治理。
- 无障碍（2/5）｜当前结论：有基础语义化处理，但缺少系统化保障。证据：`src/pages` / `src/components` 已出现不少 `aria-*`、`role`、键盘处理与 focus 管理；但当前 CI 和 package scripts 中没有专门的 a11y lint/test gate。
- 构建与发布（3/5）｜当前结论：已有可发版能力，但流水线深度明显弱于平台级参考。证据：当前只有 `check.yml`、`comms-regression.yml`、`package-win-manual.yml`、`release.yml` 四个 workflow。参考：`openclaw-main` 还包含 `codeql`、`install-smoke`、`workflow-sanity`、`release:check`、dead-code 等更深门禁。
- 文档（2/5）｜当前结论：README 三语齐全，但文档治理没有工程化。证据：当前根目录有 `README.md`、`README.zh-CN.md`、`README.ja-JP.md`，并有 `docs/superpowers/`；但当前仓未见 `CONTRIBUTING.md` 或架构文档门禁。参考：`openclaw-main` 和 `clawport-ui-main` docs 目录更完整，并把 docs 检查纳入脚本与发布流程。
- 代码组织（3/5）｜当前结论：分层清楚，但边界治理仍偏人工。证据：当前 renderer / components / stores / electron 的目录边界较明确，且有 `app-request-security` / `preload-security` 之类边界测试；但未见 cycle / boundary / dead-code 检查脚本。参考：`openclaw-main` 已把 boundary、dead-code、release check 等治理显式固化到脚本。

## Repeated Themes

- ClawX 已经有不少“页面外壳”和“静态配置层”，但很多能力还没有在本仓 backend 内闭环为真正的 runtime。
- 聊天、会话、审批、活动日志、成本分析这些高频使用路径，普遍缺少“搜索、结构化详情、持续反馈、导出/追踪”层。
- ClawPort 提供的优势主要是页面完整度、操作深度和帮助系统，而不是底层桌面能力。
- LobsterAI 提供的优势主要是 Cowork 聊天体验、审批确认流、QuickAction、会话管理和 MCP runtime 管理思路。
- openclaw-main 提供的优势主要是多 agent runtime、工具注册、channel runtime、安全与更新治理、平台级测试与 CI 深度。
- 工程面最大差距不是是否使用 TypeScript 或是否有测试，而是是否把关键质量约束持续化、自动化和可回归化。

## Recommended Next Planning Tracks

- P0. Chat search and command surface: Slash commands、全局搜索、会话搜索、置顶、导出。
- P0. MCP runtime closure: server lifecycle、per-server logs、tool discovery and invocation visibility。
- P0. Structured operations visibility: Activity 结构化事件、Cron 运行详情、delivery/error context。
- P0. Engineering gates: real Playwright E2E、CI coverage depth、release/install smoke、i18n parity checks。
- P1. Multi-agent runtime and tool registration: subagent orchestration、tool registry、skills to runtime bridge。
- P1. Costs and observability depth: job/cron cost drill-down、optimization insights、realtime usage stream。
- P1. Memory management depth: full-text search、safer write pipeline、health analysis、multi-path knowledge sources。
- P1. Docs and information architecture: standalone Docs / Help、deep links、search、agent detail pages、cron associations。
- P2. UX polish: unified toast、skeletons、transitions、empty-state illustration、mobile chat adaptation。
- P2. Personalization and governance: global icon/logo upload、agent profile images、a11y automation hardening。
