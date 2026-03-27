# ClawX 持久化开发指令

工作目录：`C:\Users\22688\Desktop\ClawX-main\.worktrees\team-control-plane-mvp`

---

## 角色分工

| 角色 | 工具 | 职责 |
|------|------|------|
| **Claude Code（你）** | 本体 | 架构设计、任务拆分、代码审查、质量把关 |
| **Codex MCP（GPT-5.3 high）** | `mcp__codex-mcp__codex` | 批量写代码、修改文件、运行命令 |

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
- Renderer/Main 边界：Renderer 只能通过 host-api/api-client，不直接调用 gateway endpoint
- 文档联动：功能变更后同步检查 `README.md`、`README.zh-CN.md`（必要时同 PR 更新）
- 验证命令：
  - `pnpm run typecheck`
  - `pnpm run lint`
  - `pnpm run build:vite`
  - `pnpm test`

---

## 当前焦点

`PLAN-2026-03-27-TEAM-CONTROL-PLANE-MVP`

目标：把 TeamOverview / TeamMap / AgentDetail 从“静态成员展示”升级为“可配置 + 可观察”的团队控制面 MVP，不引入新 Team 实体，复用现有 agent/runtime/kanban 能力。

---

## 新需求来源（spec / plan / context）

1. `docs/superpowers/specs/2026-03-27-team-control-plane-mvp-design.md`
2. `docs/superpowers/plans/2026-03-27-team-control-plane-mvp.md`
3. `team-项目文档.md`

---

## 本阶段已完成（已从待办移除）

- agent 模型新增并持久化：
  - `teamRole: 'leader' | 'worker'`
  - `chatAccess: 'direct' | 'leader_only'`
  - `responsibility: string`
- `PUT /api/agents/:id` 已支持上述字段
- `AgentDetail` 已新增 Team Settings 可编辑区（role/access/responsibility/reportsTo）
- `TeamOverview` 已支持角色/访问模式/职责/活跃态展示
- `TeamMap` 已支持角色/访问模式/职责展示（节点 + 详情抽屉）
- 相关 i18n 键与回归测试已补齐并通过 targeted suite

---

## 当前未完成需求（仅保留待办）

### P0

- 当前阶段已收口，无阻塞待办
- 已完成：
  - README 双语同步
  - focused tests / typecheck / lint / build 全通过
  - TaskKanban 3 个 pre-existing typecheck 错误修复

### P1（下一阶段候选，不在当前 MVP 必做）

- `leader_only` 的强约束直聊拦截（从“展示语义”升级为“系统级限制”）
- 团队级绩效/成本分析面板
- 跨 Team 协作路由

---

## 明确不要回退

- 不要重新加回聊天页顶部 `Export` 按钮
- `Docs / Help` 继续保持停用，除非用户再次明确要求恢复
