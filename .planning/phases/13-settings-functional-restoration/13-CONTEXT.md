# Phase 13: Settings Functional Restoration - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Restore settings capabilities that already exist in the product model or UI vocabulary but are currently disabled, placeholder-only, or store-only. The phase must preserve Phase 08's 9-section Settings IA and must not reintroduce decorative controls that lack runtime behavior.

Included:
- Real Tool Permissions enforcement for KTClaw-initiated execution entrypoints
- Real Migration & Backup workflows, including preview-first selective restore and automatic backups
- Real Memory Strategy controls limited to manual operations plus watched-directory auto reindex
- Real desktop behavior settings: autostart-minimized semantics, close-to-tray behavior, and high-value system notifications
- Real identity settings for `brandSubtitle` and `myName`

Excluded:
- Remote RPC runtime exposure
- P2P sync runtime
- Full memory content-generation automation such as nightly reflection
- A new notification center or cross-device notification product
- A second Settings IA or additional top-level Settings sections
</domain>

<decisions>
## Implementation Decisions

### Phase Scope
- **D-01:** Phase 13 restores only existing settings capabilities that already belong to the current product shape; it does not absorb `Remote RPC` or `P2P` as new runtime subsystems.
- **D-02:** Phase 13 must keep the fixed 9-section Settings IA locked in Phase 08. Restoring capability is allowed; restructuring the Settings information architecture is not.
- **D-03:** Existing single-instance desktop behavior is not new scope for Phase 13, but it is a non-regression constraint. KTClaw must continue to allow only one desktop client instance and focus the existing window on re-open.

### Tool Permissions
- **D-04:** Tool Permissions must cover all KTClaw-initiated execution entrypoints, not only agent/runtime tool calls.
- **D-05:** Enforcement scope includes KTClaw-triggered file writes, terminal execution, network/package-manager actions, tool grants, and other in-app execution surfaces such as MCP/tool invocation flows where applicable.
- **D-06:** Tool Permissions must be real runtime enforcement, not renderer-only validation or documentation copy.
- **D-07:** Risk levels are locked as:
  - `strict`: hard block
  - `standard`: read operations allowed, write/dangerous operations require confirmation
  - `permissive`: allow and audit
- **D-08:** Auditability matters. Even when actions are allowed, the system should preserve enough event information to explain what was allowed or blocked.

### Migration & Backup
- **D-09:** Import/restore flow must be `preview first`, then `selective restore by module`. No blind immediate overwrite.
- **D-10:** Phase 13 includes a complete productized Migration & Backup flow rather than a minimal import/export-only version.
- **D-11:** The `.ktclaw` archive includes settings, memory, and channel/provider metadata, but excludes sensitive secrets and keychain material.
- **D-12:** Sensitive credentials remain outside `.ktclaw` archives and continue to rely on platform-secure storage.
- **D-13:** Automatic backup policy is:
  - take a backup before dangerous operations
  - also run scheduled backups
  - retain the most recent 10 backups

### Memory Strategy
- **D-14:** Phase 13 restores only partial automation for Memory Strategy.
- **D-15:** The automation boundary is `watched directories + automatic reindex`.
- **D-16:** Phase 13 does not include full memory content-generation automation such as nightly reflection or context-consolidation generation jobs.
- **D-17:** Memory Strategy must continue to use the shared memory substrate already used by Settings and Team Map. No second memory system is allowed.

### Desktop Behavior
- **D-18:** `startMinimized` only applies to autostart launches. A user manually opening KTClaw should still get a normal visible window.
- **D-19:** `minimizeToTray` semantics are locked as:
  - window close button hides to tray
  - minimize button remains a normal minimize action
- **D-20:** Notification restoration is limited to desktop system notifications for high-value events.
- **D-21:** High-value notification events are:
  - task completed
  - sync failed
  - human intervention required
- **D-22:** Phase 13 does not create a full notification center, low-value event stream, or complex notification rules engine.

### Identity Settings
- **D-23:** `brandSubtitle` and `myName` must become real user-visible settings rather than store-only values.
- **D-24:** `brandSubtitle` must affect the main product branding surface.
- **D-25:** `myName` must affect chat welcome/default user-facing naming behavior.
- **D-26:** Phase 13 restores real behavior and identity settings first; purely decorative avatar cosmetics remain lower priority and are not required to ship in this phase.

### the agent's Discretion
- The exact UI composition for preview/diff presentation in Migration & Backup
- The exact audit log surface for Tool Permissions, as long as enforcement semantics remain intact
- The implementation detail for watched-directory detection and debounce behavior
- The exact notification copy and iconography for the three high-value event classes
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and Phase Contracts
- `.planning/ROADMAP.md` - Phase 13 goal, dependency, and success criteria
- `.planning/PROJECT.md` - project-wide values, especially the requirement that Settings remain focused and truthful
- `.planning/REQUIREMENTS.md` - active requirements tied to Settings and shared agent memory flows
- `.planning/PRODUCT-RESTRUCTURE.md` - original Settings convergence product direction and long-term product boundaries

### Prior Phase Decisions
- `.planning/phases/08-settings-convergence/08-CONTEXT.md` - locked 9-section IA, Settings boundaries, and Phase 08-specific non-goals
- `.planning/phases/05-employee-square/05-CONTEXT.md` - agent memory ownership and detail-page boundary
- `.planning/phases/04-team-map-evolution/04-CONTEXT.md` - Team Map memory/skills ownership and synchronization expectations
- `.planning/phases/06-channel-redesign/06-CONTEXT.md` - prior channel configuration scope decisions relevant to backup/metadata packaging

### Current Implementation Surfaces
- `src/pages/Settings/index.tsx` - active Settings shell and section routing
- `src/stores/settings.ts` - renderer-side settings state, persistence intent, and currently store-only capabilities
- `electron/utils/store.ts` - main-process settings persistence plus export/import helpers
- `electron/api/routes/settings.ts` - host Settings API boundary
- `electron/main/index.ts` - desktop lifecycle, single-instance behavior, tray/close behavior, and startup semantics
- `electron/main/launch-at-startup.ts` - launch-at-login implementation
- `electron/api/routes/memory.ts` - memory snapshot/analyze/reindex APIs
- `electron/api/routes/app.ts` - OpenClaw Doctor, update control, and clear-server-data routes
- `src/pages/Chat/ChatMessage.tsx` - user-visible tool-call rendering behavior now controlled by settings

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `electron/utils/store.ts` already exposes `exportSettings()` and `importSettings()`, which gives Migration & Backup an immediate settings serialization base.
- `electron/api/routes/memory.ts` already has `/api/memory/snapshot`, `/api/memory/analyze`, and `/api/memory/reindex`, which can anchor the memory portion of restoration without inventing a new backend.
- `electron/api/routes/app.ts` already has `clear-server-data` and `openclaw-doctor`, so About/maintenance flows have real backend hooks.
- `electron/main/index.ts` already enforces single-instance behavior and tray-hide-on-close behavior, which means Phase 13 should extend desktop settings without regressing those guarantees.
- `src/stores/settings.ts` already contains the dormant fields for most of the downscoped settings, so planning can focus on runtime consumers and truthful UI rather than inventing a new settings model.

### Established Patterns
- Renderer settings should persist through `hostApiFetch('/api/settings...')`; the renderer should not talk directly to backend services outside the established host boundary.
- Main process owns desktop lifecycle semantics such as autostart, tray behavior, and process-level constraints.
- Shared memory behavior must continue to route through the existing memory API family instead of introducing ad-hoc editors or private persistence.
- Settings pages should expose only capabilities that have a real runtime effect. Phase 13 exists precisely because this rule was being violated.

### Integration Points
- Tool Permissions needs integration points across settings storage, renderer affordances, host API, and actual execution chokepoints.
- Migration & Backup needs to join settings persistence, memory APIs, provider/channel metadata serialization, and dangerous-operation flows.
- Desktop behavior restoration crosses `src/stores/settings.ts`, `electron/api/routes/settings.ts`, `electron/main/index.ts`, and tray/startup handling.
- Identity settings restoration needs to reconnect settings state to product chrome and chat-facing copy paths.

</code_context>

<specifics>
## Specific Ideas

- The user explicitly wants the previously downscoped settings restored as real product capability, not as decorative placeholders.
- The user explicitly accepted a full productized Migration & Backup experience, but still wants `.ktclaw` archives to exclude sensitive credentials.
- The user explicitly wants only one KTClaw desktop instance per machine and wants second launch to focus the already-running window; this is already implemented and must be preserved.

</specifics>

<deferred>
## Deferred Ideas

- `Remote RPC` runtime enablement
- `P2P Sync` runtime enablement
- Full memory content-generation automation (`nightly reflection`, generated `context consolidation`)
- A full notification center or low-value notification rules engine
- Purely decorative avatar-cosmetic controls if they do not materially affect product behavior

</deferred>

---

*Phase: 13-settings-functional-restoration*
*Context gathered: 2026-04-08*
