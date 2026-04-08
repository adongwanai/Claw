# Phase 13: Settings Functional Restoration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `13-CONTEXT.md`; this file preserves the alternatives considered.

**Date:** 2026-04-08T16:48:21.8704869+08:00
**Phase:** 13-settings-functional-restoration
**Areas discussed:** phase boundary, tool permissions scope, migration archive scope, restore strategy, backup policy, memory strategy automation, desktop behavior, notifications, identity settings

---

## Phase Boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Only restore existing settings capabilities | Keep Phase 13 limited to turning existing downscoped settings into real working behavior | ✅ |
| Restore existing settings + Remote RPC | Expand scope to include Remote RPC runtime capability | |
| Restore everything including P2P | Expand phase into a broad new systems phase | |

**User's choice:** Only restore existing settings capabilities.

---

## Tool Permissions Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Cover all KTClaw-initiated execution entrypoints | File, terminal, network, MCP/tool-related actions triggered by KTClaw | ✅ |
| Cover only agent/runtime tool chain | Restrict enforcement to OpenClaw/agent flows only | |
| Split policy between runtime and desktop features | Use separate rule models for different execution surfaces | |

**User's choice:** Cover all KTClaw-initiated execution entrypoints.

---

## Migration & Restore Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Preview + selective restore | Show what will change, then restore per module | ✅ |
| Preview + full overwrite | Preview first, but apply everything at once | |
| Immediate full overwrite | Restore archive contents directly with no preview | |

**User's choice:** Preview + selective restore.

---

## Archive Boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Settings + memory + metadata, no secrets | Package reusable app state without sensitive credentials | ✅ |
| Include encrypted secrets | Carry credentials in the archive via extra encryption flow | |
| Package everything possible | Maximal archive scope | |

**User's choice:** Settings + memory + metadata, no secrets.

---

## Automatic Backup Policy

### Trigger Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Dangerous operations + scheduled backups | Backup before risky actions and also run periodic backups | ✅ |
| Dangerous operations only | No periodic history | |
| Scheduled backups only | No pre-risk backup guardrail | |
| Dangerous operations + every settings/memory edit | Highest frequency, highest archive churn | |

**User's choice:** Dangerous operations + scheduled backups.

### Retention

| Option | Description | Selected |
|--------|-------------|----------|
| Keep latest 10 backups | Simple rolling retention | ✅ |
| Keep latest 20 backups | Higher storage footprint | |
| Time-tiered retention | More advanced archival policy | |
| Unlimited retention | Unbounded growth | |

**User's choice:** Keep latest 10 backups.

---

## Tool Permissions Semantics

### Top-Level Model

| Option | Description | Selected |
|--------|-------------|----------|
| Risk-level based behavior | Enforcement changes based on strict / standard / permissive | ✅ |
| Hard block everything | Maximum safety, lower usability | |
| Confirm everything | Simpler but noisier | |
| Audit only | Not real permission control | |

**User's choice:** Risk-level based behavior.

### Standard Tier Detail

| Option | Description | Selected |
|--------|-------------|----------|
| Strict hard-block / standard confirm / permissive audit | Uniform standard confirmation model | |
| Strict hard-block / standard read-allow write-confirm / permissive audit | Read paths stay usable, writes stay protected | ✅ |
| Strict hard-block / standard rememberable grants / permissive audit | Confirmation model with persistent grants | |

**User's choice:** Strict hard-block / standard read-allow write-confirm / permissive audit.

---

## Memory Strategy Automation

### Phase Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Manual strategy only | No automation work in this phase | |
| Manual + partial automation | Restore only bounded, non-generative automation | ✅ |
| Full memory automation | Include generative background strategy jobs | |

**User's choice:** Manual + partial automation.

### Automation Boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Directory watching + auto reindex | Bounded automation tied to existing memory pipeline | ✅ |
| Directory watching + auto reindex + timed snapshot/analyze | Adds more scheduled jobs | |
| Timed snapshot/analyze only | No watched directories | |

**User's choice:** Directory watching + auto reindex.

---

## Desktop Behavior

### Start Minimized

| Option | Description | Selected |
|--------|-------------|----------|
| Apply only to autostart launches | Manual launch still opens visibly | ✅ |
| Apply to all launches | User-initiated opens also stay minimized | |
| Minimize only, never hide to tray | Different startup semantics | |

**User's choice:** Apply only to autostart launches.

### Close-to-Tray Semantics

| Option | Description | Selected |
|--------|-------------|----------|
| Close hides to tray, minimize stays minimize | Preserve normal minimize semantics | ✅ |
| Close and minimize both go to tray | Stronger resident-app behavior | |
| Hide to tray only when background work exists | Dynamic close policy | |

**User's choice:** Close hides to tray, minimize stays minimize.

### Notification Scope

| Option | Description | Selected |
|--------|-------------|----------|
| System notifications for high-value events only | Focused desktop notification model | ✅ |
| Notify for most state changes | Noisier but broad coverage | |
| In-app badge only | Not true restoration of desktop notifications | |

**User's choice:** System notifications for high-value events only.

### High-Value Events

| Option | Description | Selected |
|--------|-------------|----------|
| Task completed / sync failed / human intervention required | High-signal set | ✅ |
| Add long-running blocked states too | Broader alerting | |
| Failures and human intervention only | More conservative, no success alerts | |

**User's choice:** Task completed / sync failed / human intervention required.

---

## Identity Settings

| Option | Description | Selected |
|--------|-------------|----------|
| Brand area + chat-facing naming | `brandSubtitle` affects branding, `myName` affects user-facing chat naming | ✅ |
| Brand area only | Pure chrome-level identity | |
| Chat-facing naming only | No brand-surface changes | |

**User's choice:** Brand area + chat-facing naming.

---

## Non-Regression Constraint

- The user explicitly called out single-instance desktop behavior: one KTClaw client per machine, and a second launch should focus the already-running client. This was confirmed as an existing behavior that Phase 13 must preserve.

## Deferred Ideas

- Remote RPC runtime enablement
- P2P sync runtime enablement
- Full memory content-generation automation
- Full notification-center productization
