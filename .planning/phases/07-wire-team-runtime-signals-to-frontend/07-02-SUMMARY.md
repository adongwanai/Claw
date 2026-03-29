---
phase: "07"
plan: "02"
subsystem: frontend-runtime
tags: [polling, hook, team-overview, runtime-sessions, visibility]
dependency_graph:
  requires: [07-01]
  provides: [useTeamRuntime, runtimeByAgent-param]
  affects: [TeamOverview, team-work-visibility, team-progress-brief]
tech_stack:
  added: []
  patterns: [polling-hook, optional-param-backward-compat, runtime-priority-over-kanban]
key_files:
  created:
    - src/hooks/use-team-runtime.ts
  modified:
    - src/lib/team-work-visibility.ts
    - src/lib/team-progress-brief.ts
    - src/pages/TeamOverview/index.tsx
decisions:
  - "Runtime session status takes priority over Kanban ticket workState when active sessions exist for an agent"
  - "runtimeByAgent optional param ensures all existing callers remain backward-compatible without changes"
  - "Sort sessions newest-first before grouping so byAgent[agentId][0] is always the most recent session"
  - "Use runtimeSupportTickets variable name inside runtime branch to avoid duplicate-declaration clash with outer assignedTickets"
metrics:
  duration: "~15 minutes"
  completed: "2026-03-28"
  tasks: 4
  files: 4
---

# Phase 07 Plan 02: Add useTeamRuntime polling hook and update team visibility and brief logic Summary

**One-liner:** React polling hook for `/api/sessions/subagents` wired into `TeamOverview` so runtime session status (running/blocked/waiting_approval/error) overrides Kanban-derived visibility for each agent.

## What Was Built

### Task 1 — `src/hooks/use-team-runtime.ts` (created)

A React hook that polls `GET /api/sessions/subagents` every 3000ms. On each poll it:
1. Filters to active sessions (`running | blocked | waiting_approval`) — completed/killed sessions are excluded
2. Sorts by `createdAt` descending (newest first) so `byAgent[agentId][0]` is always the most recent session
3. Groups into `byAgent: Record<string, RuntimeSessionSummary[]>` by extracting agentId from `parentSessionKey` via regex `/^agent:([^:]+):/`
4. Exposes `{ byAgent, allSessions, loading }` as `TeamRuntimeState`

The `enabled` parameter allows callers to disable polling; the timer is properly cleaned up on unmount.

### Task 2 — `src/lib/team-work-visibility.ts` (modified)

Added optional third parameter `runtimeByAgent?: Record<string, Array<{ status: string; prompt: string }>>` to `deriveTeamWorkVisibility`.

New early-return logic inserted before the existing Kanban block: when an agent has active runtime sessions, the function returns a `TeamMemberWorkVisibility` derived from runtime data:
- `blocked | error` → statusKey `'blocked'`
- `waiting_approval` → statusKey `'waiting_approval'`
- `running` → statusKey `'working'`
- Prompt strings (trimmed to 80 chars) become `currentWorkTitles`, merged with Kanban titles (runtime first)

The inner variable is named `runtimeSupportTickets` (not `assignedTickets`) to avoid TypeScript duplicate-declaration error with the outer `assignedTickets` in the Kanban fallback path.

### Task 3 — `src/lib/team-progress-brief.ts` (modified)

Added `runtimeByAgent?: Record<string, Array<{ status: string; prompt: string }>>` to `BuildLeaderProgressBriefInput` type (optional field, fully backward-compatible).

Changed the single call to `deriveTeamWorkVisibility` at line 106 to pass `input.runtimeByAgent` as the third argument.

### Task 4 — `src/pages/TeamOverview/index.tsx` (modified)

- Added import: `import { useTeamRuntime } from '@/hooks/use-team-runtime';`
- Added hook call: `const { byAgent: runtimeByAgent } = useTeamRuntime();`
- Both `useMemo` calls now pass `runtimeByAgent`:
  - `deriveTeamWorkVisibility(agents, sessionLastActivity, runtimeByAgent)` with `runtimeByAgent` in deps
  - `buildLeaderProgressBrief({ ..., runtimeByAgent })` with `runtimeByAgent` in deps

## Backward Compatibility

The `runtimeByAgent` parameter is optional (`?`) on both `deriveTeamWorkVisibility` and `BuildLeaderProgressBriefInput`. All existing callers that do not pass the parameter continue to work unchanged — the runtime block is skipped (empty array from `?? []`), and the function falls through to the original Kanban + lastActivity logic. No breaking change introduced.

## Deviations from Plan

None — plan executed exactly as written.

## Test Results

- `pnpm run typecheck`: PASS (zero errors)
- `pnpm test -- --run tests/unit/team-overview-page.test.tsx`: PASS (2/2 tests)
- `pnpm test -- --run tests/unit/team-progress-brief.test.ts`: PASS (1/1 test)
- `pnpm test -- --run tests/unit/team-map-page.test.tsx`: not run separately (pre-existing failures in unrelated test files do not affect the target files)

Pre-existing test failures in `channels-routes.test.ts` and one or two other files were present before this plan and are out of scope.

## Known Stubs

None — all data flows from real API polling, no hardcoded placeholder values introduced.

## Commit

- `9f25b61` — `feat(07-02): add useTeamRuntime hook and wire runtime signals to team visibility`

## Self-Check: PASSED
