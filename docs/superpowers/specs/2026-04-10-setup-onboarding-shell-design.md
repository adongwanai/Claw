# Setup Onboarding Shell Design

**Date:** 2026-04-10
**Scope:** First-run `/setup` onboarding only

## Goal

Fix the first-run Setup experience so users can always move between steps, the AI Provider step only advances after a real saved provider/default-provider state exists, and the page remains usable across desktop and smaller viewport sizes.

## Current Problems

- The Setup page renders its navigation below a tall step card, so the Provider step can push the action row out of the initial viewport and make the flow feel blocked.
- The Provider step currently unlocks progression from local UI state (`providerConfigured`) rather than a round-trip confirmation that the provider account and default-provider selection were actually persisted.
- The Setup page uses a bespoke layout that is hard to reuse or harden for other wizard-like pages later.

## Decision

Introduce a reusable `WizardShell` layout component and migrate `Setup` onto it now.

Reasoning:

- The blocking UX problem is primarily a shell/layout issue, not a Provider-form issue.
- A reusable shell lets this fix stay local to Setup now while creating a safe migration path for other wizard-style surfaces later.
- The Provider step can keep its existing real backend save path, but its completion signal must be upgraded from optimistic local state to verified persisted state.

## Scope Boundaries

### In Scope

- `Setup` page layout, navigation behavior, and Provider-step completion rules
- A reusable wizard shell component that only `Setup` adopts in this change
- Tests covering Setup layout/navigation/provider verification behavior

### Out of Scope

- Changing the 5-step Setup sequence
- Refactoring Feishu/WeChat/Migration wizards onto the new shell in this change
- Changing provider runtime sync architecture beyond what is needed to verify save success
- Redesigning the visual theme of every wizard in the app

## UX Requirements

### Setup Shell

- The Setup page must use a three-zone layout:
  - fixed/stable header area for title bar, stepper, and current-step title
  - scrollable content area for the active step
  - sticky action footer that remains visible at the bottom of the viewport
- The footer must stay visible regardless of step content height.
- The footer must adapt to smaller widths without clipping buttons.
- On narrow layouts, footer controls may stack vertically.
- On wider layouts, footer controls should remain left/right aligned.

### Navigation

- `Previous` must be available on every step except the first step.
- `Next` must remain visible on all non-installing steps.
- `Installing` remains a managed step:
  - hide manual `Next`
  - preserve skip/error-recovery affordances already present in step content
- `Skip setup` may remain hidden on the Runtime step.
- The completion step still finishes via `Get Started`.

### Provider Step

- The user must not be allowed to continue solely because a local success flag was set.
- After a successful save request, the step must re-fetch provider snapshot state and verify:
  - a provider account exists for the chosen vendor/account id
  - the selected account is the default provider account
- Only after both checks pass should the step mark itself complete.
- If save succeeds but verification fails, the step must surface an explicit error and keep `Next` disabled.
- Ollama/local providers must still work without a user-supplied API key.

## Functional Design

### New Unit: `WizardShell`

Create a focused shell component responsible for:

- rendering the shared wizard page scaffold
- rendering the progress stepper
- rendering the current-step heading/subheading
- hosting the scrollable content slot
- rendering a sticky footer action slot
- handling responsive footer layout classes

`WizardShell` should not know anything about Setup-specific provider/runtime/installing logic. It is a layout/container unit only.

### Setup Page Responsibilities After Split

`Setup` should remain responsible for:

- current step index
- step completion rules
- button labels and handlers
- choosing which step component to render

`Setup` should stop owning raw shell layout details like ad hoc spacing and bottom action placement.

### Provider-Step Verification Flow

When the provider form saves successfully:

1. Save or update the provider account through the existing host-api route.
2. Set the default provider account through the existing host-api route.
3. Re-fetch provider snapshot state.
4. Resolve the expected account id.
5. Verify the expected account exists in `snapshot.accounts`.
6. Verify `snapshot.defaultAccountId === expectedAccountId`.
7. Only then call the step-completion callback that enables `Next`.

If any verification condition fails:

- show a clear error toast/message
- keep the step incomplete
- do not auto-advance

## Data Flow

### Existing Save Path To Keep

The Provider step should continue using the real routes already wired into runtime sync:

- `POST /api/provider-accounts`
- `PUT /api/provider-accounts/:id`
- `PUT /api/provider-accounts/default`

These routes already trigger runtime sync through:

- `syncSavedProviderToRuntime`
- `syncUpdatedProviderToRuntime`
- `syncDefaultProviderToRuntime`

This means the Setup Provider step is not a placeholder and should remain connected to the live project behavior.

### New Verification Read Path

After save/default writes succeed, the step should re-read:

- `/api/provider-accounts`
- `/api/providers`
- `/api/provider-vendors`
- `/api/provider-accounts/default`

through the existing `fetchProviderSnapshot()` helper.

## Error Handling

### Layout / Navigation

- Long step content must never hide the primary navigation path.
- Footer layout must not overflow horizontally at common laptop widths.

### Provider Step

- Validation errors remain inline/toast-based as they are today.
- Persistence failures must keep the step incomplete.
- Post-save verification mismatches must be treated as failures, not silent success.
- OAuth success should also pass through the same persisted-state verification gate before enabling `Next`.

## Files To Touch

- Create: `src/components/wizard/wizard-shell.tsx`
- Modify: `src/pages/Setup/index.tsx`
- Modify: `tests/unit/setup-gate.test.tsx`
- Create or modify: `tests/unit/setup-provider-step.test.tsx`
- Create or modify: `tests/unit/setup-layout.test.tsx`

## Testing Strategy

### Setup Layout

- Verify the Setup page renders a dedicated footer action area outside the scroll-heavy content body.
- Verify the footer action row is present on the Provider step.
- Verify `Previous` is visible from step 2 onward.

### Provider Step

- Verify saving a provider is not enough by itself; the step only becomes complete after snapshot verification passes.
- Verify a missing default-provider assignment keeps `Next` disabled.
- Verify a verified successful save enables `Next`.
- Verify Ollama/local provider still succeeds without a typed API key.

### Regression

- Verify Runtime step still gates progression on successful checks.
- Verify Installing step still auto-advances and does not expose manual `Next`.
- Verify Complete step still marks setup complete and navigates home.

## Success Criteria

- Users can always see a way back and forward in Setup without scrolling blind for controls.
- The Provider step cannot falsely report completion when runtime-facing persistence did not land.
- Setup remains the only page migrated to the new shell in this change.
- Existing first-run routing and completion behavior remain intact outside the intended UX fixes.
