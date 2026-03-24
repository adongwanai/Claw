# ClawX 持久化开发指令

工作目录：`C:\Users\22688\Desktop\ClawX-main`

---

## 角色分工

| 角色 | 工具 | 职责 |
|------|------|------|
| **Claude Code（你）** | 本体 | 架构设计、任务拆分、代码审查、质量把关 |
| **Codex MCP（GPT-5.3 high）** | `mcp__codex-mcp__codex` | 批量写代码、修改文件、运行命令 |

优先用 Codex 写业务代码，Claude 负责架构与审查。

---

## 持久化工作流

### 会话开始

```bash
git log --oneline -8
cat continue/task.json | python -c "import sys,json; d=json.load(sys.stdin); print(d.get('current_focus',''))"
tail -30 continue/progress.txt
```

### 会话结束

1. 更新 `continue/task.json`
2. 追加 `continue/progress.txt`
3. 每完成一批任务做一次本地 `commit`
4. 更新本文件 `Prompt.md`

---

## 技术约束

- 框架：Electron + React 19 + TypeScript + Tailwind CSS + Vite
- 状态管理：Zustand，stores 在 `src/stores/`
- API 调用：必须走 `hostApiFetch<T>()` / `invokeIpc`，不要直接 `fetch` backend
- 主题 token：
  - `--bg: #ffffff`
  - `--bg2: #f2f2f7`
  - `--bg3: #e5e5ea`
  - `--tx: #000000`
  - `--tx2: #3c3c43`
  - `--tx3: #8e8e93`
  - `--bd: #c6c6c8`
  - `--ac: #007aff`
- Sidebar：展开 `260px` / 收起 `64px`
- 验证命令：
  - `pnpm run typecheck`
  - `pnpm exec tsc -p tsconfig.node.json --noEmit`
  - `pnpm run lint`
  - `pnpm run build:vite`
  - `pnpm test`
  - `pnpm run test:e2e`

---

## 当前焦点

`PLAN-2026-03-24-PLATFORM-CLOSURE`

目标：继续完成平台级与深度功能剩余需求，不再重复已完成的 Chat / Search / Session Management / Docs 停用 / QuickAction / mhchem / Cron 详情 / Activity 中文 / Playwright smoke 批次。

---

## 当前剩余需求

### P0

#### 1. MCP runtime closure

- 补齐 MCP runtime 生命周期
- 补 `start/stop/connect/listTools/callTool`
- 补 per-server 日志查看
- 补工具可见性 / tool discovery
- 当前仅有配置 CRUD：`electron/api/routes/mcp.ts`、`src/pages/Skills/McpTab.tsx`

#### 2. Release / install / E2E 深化

- 当前已补真实 Playwright smoke 与 CI 执行
- 剩余：
  - 扩展到不止单一 browser-preview smoke
  - 补 release smoke
  - 补 install smoke
  - 继续加深 CI 门禁

#### 3. i18n 收口

- 继续把硬编码文案迁回 locale
- 增加 locale parity / 覆盖检查
- 当前 Activity 已切中文，但全仓仍有大量硬编码

### P1

#### 4. Chat / Workbench 深化

- 思维链展示增强：
  - 流式 reasoning 展示
  - 自动展开 / 收起
  - reasoning 生成中状态提示
- QuickAction 深化：
  - 二级 `PromptPanel`
  - 技能映射
  - 回填输入框
- AskUserQuestion wizard 深化：
  - 支持结构化 `toolInput.questions`
  - 支持回填已有答案
  - 展示请求上下文
- 工具调用确认 UI：
  - 专门确认弹窗
  - 完整 tool input
  - 危险操作告警
- 文件变更预览：
  - 至少按 turn/tool group 展开 edit/write/multiedit 输入与结果

#### 5. Kanban 深化

- `assigneeRole`
- 更完整的 ticket detail panel
- ticket chat history
- 向 agent 追问 ticket
- agent work / retry / 状态联动
- 进行中任务禁止手动拖拽

#### 6. Cron 深化

- 面向运维的总览层：
  - 状态筛选
  - delivery 配置概览
  - 配置错误 / 执行错误 banner
  - 最近更新时间
- Pipeline 建模 / 编辑闭环：
  - `PipelineWizard`
  - `PipelineGraph`
- 失败重试 / 失败告警 / 投递策略：
  - `failureAlertAfter`
  - `failureAlertCooldownSeconds`
  - `failureAlertChannel`
  - `deliveryBestEffort`

#### 7. Costs 深化

- 按 job / cron 提供 drill-down
- `TopCrons`
- job cost table
- 更完整图表与明细层
- 优化分析：
  - optimization score
  - anomaly detection
  - week-over-week
  - cache savings
  - insights
- realtime usage stream

#### 8. Memory 深化

- 按照不同的分身agent，可以看到它们不同的memory，以及它们的其他文件：AGENTS.md、HEARTBEAT.md、IDENTITY.md、SOUL.md、TOOLS.md、USER.md。并且可编辑
- full-text search
- 命中数与高亮
- editor helpers：
  - copy / download
  - unsaved changes 提示
  - reindex after save
- safer write pipeline：
  - 路径白名单
  - mtime 冲突检测
  - 内容规范化
  - git snapshot
  - 原子写入
- health analysis：
  - health score
  - stale daily logs
  - AI-powered analysis
- 多路径知识源 / `extraPaths` / QMD collection

#### 9. Multi-agent runtime / tool registry

- subagent orchestration
- `sessions_spawn`
- subagent `list/kill/steer/wait`
- thread / session mode
- attachments / sandbox / timeout
- runtime 工具注册机制
- skills 到 runtime bridge

#### 10. Channels / backend runtime 能力

- IM 消息格式适配与 capability runtime
- `actions/capabilities/schema/status` 抽象
- 本地 API auth gate 深化
- 多用户隔离与 rate limiting

#### 11. Agent detail page

- 独立 agent 详情页
- metadata / hierarchy
- `reportsTo / directReports`
- cron 关联视图
- avatar upload / remove

#### 12. Settings 深化

- 全局 logo / icon 上传
- agent 图片 override
- `Re-run Setup`
- `Reset All Settings`
- `Clear Server Data`

#### 13. Docs / Help system

- 当前按用户要求保持停用
- 仅在用户再次明确要求时恢复
- 恢复时需补齐：
  - `/docs`
  - 章节导航
  - 页面内搜索
  - deep link
  - 内置文档体系

### P2

#### 14. 应用自动更新链路一致性

- 决定是否补 Host API update route
- 继续保证 update 链路一致
- 渐进发布 / 多 channel 策略继续补齐：
  - rollout delay / jitter
  - beta check interval
  - attempt state persistence

#### 15. 通用 UX 收尾

- unified toast
- 持久可关闭反馈
- skeleton
- motion token
- empty-state illustration
- mobile chat adaptation

#### 16. a11y / 工程治理

- a11y 自动化防回归
- a11y lint / test gate
- docs governance
- boundary / dead-code / cycle 脚本化检查

---

## 明确不要回退

- 不要重新加回聊天页顶部 `Export` 按钮
- `Docs / Help` 继续保持停用，除非用户再次明确要求恢复

---

## 当前参考优先级

1. `MCP runtime closure`
2. `Release / install / E2E 深化`
3. `i18n 收口`
4. `Chat / Kanban / Costs / Memory / multi-agent runtime`
