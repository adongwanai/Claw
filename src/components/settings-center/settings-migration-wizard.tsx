import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Circle, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, label: 'Choose scope' },
  { id: 2, label: 'Compatibility report' },
  { id: 3, label: 'Confirm & execute' },
] as const;

const SCOPE_OPTIONS = [
  {
    id: 'agents',
    title: 'Agents & defaults',
    description: 'Migrate agent configs, defaults, and templates stored under `agents/`.',
    meta: '4 sources • 186 KB',
  },
  {
    id: 'skills',
    title: 'Skills catalog',
    description: 'Bring published and local skills plus metadata referenced from `skills/`.',
    meta: '18 skills • 1.2 MB',
  },
  {
    id: 'workspaces',
    title: 'Workspaces & history',
    description: 'Copy workspace folders, transcripts, and runtime snapshots below `workspace/`.',
    meta: '3 workspaces • 2.7 GB',
  },
  {
    id: 'providers',
    title: 'Provider & gateway configs',
    description: 'Bring AI provider keys, gateway overrides, and custom proxy rules.',
    meta: '2 providers • 12 entries',
  },
  {
    id: 'identity',
    title: 'Identity & security',
    description: 'Carry over `IDENTITY.md`, keyring references, and session tokens.',
    meta: '1 file • 2 KB',
  },
] as const;

const COMPATIBILITY_CHECKS = [
  {
    id: 'channels',
    title: 'Channels configuration',
    detail: 'openclaw.json contains channel metadata compatible with AutoClaw.',
    status: 'pass' as const,
  },
  {
    id: 'agentDefaults',
    title: 'Agent defaults',
    detail: 'agents.defaults is present and parses without validation errors.',
    status: 'pass' as const,
  },
  {
    id: 'workspace',
    title: 'Workspace directory',
    detail: 'workspace/ exists and contains user projects smaller than 5 GB.',
    status: 'pass' as const,
  },
  {
    id: 'skillCache',
    title: 'Skills cache & extensions',
    detail: 'skills/ directory missing; cloning will require manual review.',
    status: 'fail' as const,
  },
  {
    id: 'cron',
    title: 'Cron & scheduling',
    detail: 'Cron jobs referencing runtime files were not detected in the backup.',
    status: 'fail' as const,
  },
  {
    id: 'gateway',
    title: 'Gateway endpoints',
    detail: 'Gateway config uses host-specific ports; map them after migration.',
    status: 'pass' as const,
  },
  {
    id: 'identity',
    title: 'Identity proof',
    detail: '`IDENTITY.md` exists and matches this environment.',
    status: 'pass' as const,
  },
];

const EXECUTION_CHECKLIST = [
  'All configurations are backed up to `~/.openclaw.backup/`.',
  'AutoClaw defaults are set to read-only until migration completes.',
  'Telemetry & runtime overrides are paused during migration.',
];

type SettingsMigrationWizardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SettingsMigrationWizard({ open, onOpenChange }: SettingsMigrationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [acknowledged, setAcknowledged] = useState(false);

  const selectedCount = selectedScopes.length;

  const scopeSummary = useMemo(() => {
    if (!selectedCount) {
      return 'Pick one or more scope items to proceed';
    }
    return `${selectedCount} of ${SCOPE_OPTIONS.length} sources selected`;
  }, [selectedCount]);

  if (!open) {
    return null;
  }

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const toggleScope = (id: string) => {
    setSelectedScopes((prev) =>
      prev.includes(id) ? prev.filter((scopeId) => scopeId !== id) : [...prev, id],
    );
  };

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <div className="space-y-5">
          <p className="text-sm text-[#667085]">{scopeSummary}</p>
          <div className="grid gap-3">
            {SCOPE_OPTIONS.map((scope) => {
              const isSelected = selectedScopes.includes(scope.id);
              return (
                <button
                  type="button"
                  key={scope.id}
                  onClick={() => toggleScope(scope.id)}
                  className={cn(
                    'flex flex-col gap-2 rounded-[16px] border p-4 text-left transition',
                    isSelected
                      ? 'border-[#0a7aff] bg-[#f5f7ff] shadow-[0_10px_30px_rgba(10,122,255,0.15)]'
                      : 'border-black/[0.08] bg-white hover:border-[#0a7aff]/60',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded-full border text-[11px]',
                          isSelected
                            ? 'border-[#0a7aff] bg-[#0a7aff] text-white'
                            : 'border-[#d1d5db] text-transparent',
                        )}
                      >
                        <Circle className="h-2.5 w-2.5" aria-hidden />
                      </span>
                      <span className="text-sm font-semibold text-[#111827]">{scope.title}</span>
                    </div>
                    <span className="text-[12px] font-medium text-[#0a7aff]">{scope.meta}</span>
                  </div>
                  <p className="text-[13px] text-[#667085]">{scope.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-4">
          {COMPATIBILITY_CHECKS.map((check) => {
            const isPass = check.status === 'pass';
            const StatusIcon = isPass ? CheckCircle2 : XCircle;
            return (
              <div
                key={check.id}
                className="flex items-start gap-4 rounded-[16px] border border-black/[0.06] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
              >
                <StatusIcon
                  className={cn('mt-1 h-5 w-5 flex-shrink-0', isPass ? 'text-emerald-600' : 'text-rose-600')}
                  aria-label={isPass ? 'pass' : 'fail'}
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#111827]">{check.title}</div>
                  <p className="text-[13px] text-[#667085]">{check.detail}</p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide',
                    isPass ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600',
                  )}
                >
                  {isPass ? 'Pass' : 'Manual review'}
                </span>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <ul className="space-y-3 text-sm text-[#111827]">
          {EXECUTION_CHECKLIST.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1 h-3 w-3 rounded-full bg-[#0a7aff]" aria-hidden />
              <span className="text-[13px] text-[#111827]">{item}</span>
            </li>
          ))}
        </ul>
        <div className="rounded-[14px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5" aria-hidden />
            <p>
              Ensuring `skills/` and cron jobs are recreated manually prevents data loss. Verify these
              assets exist before confirming.
            </p>
          </div>
        </div>
        <label className="flex items-center gap-3 text-sm text-[#111827]">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
            className="h-4 w-4 rounded border-black/[0.1] text-[#0a7aff]"
          />
          I understand the migration plan and accept the manual follow-up steps.
        </label>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="migration-wizard-title"
        className="relative w-full max-w-3xl overflow-hidden rounded-[22px] border border-black/[0.08] bg-white shadow-[0_25px_60px_rgba(15,23,42,0.25)]"
      >
        <header className="flex items-start justify-between border-b border-black/[0.08] px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8e8e93]">Migration wizard</p>
            <h1 id="migration-wizard-title" className="mt-2 text-2xl font-semibold text-[#111827]">
              AutoClaw migration
            </h1>
          </div>
          <button
            type="button"
            aria-label="Close migration wizard"
            onClick={() => onOpenChange(false)}
            className="rounded-full border border-black/[0.06] p-2 text-[#4b5563] shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition hover:border-[#111827]/60"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <div className="border-b border-black/[0.07] px-6 py-4">
          <div className="flex flex-wrap items-center gap-3">
            {STEPS.map((step) => {
              const isActive = step.id === currentStep;
              return (
                <div
                  key={step.id}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition',
                    isActive ? 'bg-[#0a7aff] text-white' : 'bg-[#f4f5f7] text-[#667085]',
                  )}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white text-[11px]">
                    {step.id}
                  </span>
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="text-xs font-semibold uppercase tracking-widest text-[#667085]">Step {currentStep}</div>
            <h2 className="text-xl font-semibold text-[#111827]">
              {STEPS.find((step) => step.id === currentStep)?.label}
            </h2>
          </div>

          {renderStepContent()}
        </div>

        <footer className="flex items-center justify-between border-t border-black/[0.08] px-6 py-4">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              aria-label={`Back to ${STEPS[currentStep - 2]?.label}`}
              className="rounded-[12px] border border-black/[0.1] px-4 py-2 text-sm font-medium text-[#111827] transition hover:border-black/[0.2]"
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-[12px] border border-black/[0.1] px-4 py-2 text-sm font-medium text-[#111827] transition hover:border-black/[0.2]"
            >
              Cancel
            </button>
          )}

          {currentStep === 3 ? (
            <button
              type="button"
              onClick={() => {
                if (acknowledged) {
                  onOpenChange(false);
                }
              }}
              disabled={!acknowledged}
              aria-label="Start migration"
              className={cn(
                'rounded-[12px] px-5 py-2 text-sm font-semibold transition',
                acknowledged
                  ? 'bg-[#0a7aff] text-white shadow-[0_6px_15px_rgba(10,122,255,0.35)]'
                  : 'cursor-not-allowed bg-[#cbd5e1] text-white',
              )}
            >
              Start migration
            </button>
          ) : (
            <button
              type="button"
              onClick={nextStep}
              disabled={currentStep === 1 && selectedCount === 0}
              aria-label={`Go to ${STEPS[currentStep]?.label}`}
              className={cn(
                'rounded-[12px] px-5 py-2 text-sm font-semibold transition',
                currentStep === 1 && selectedCount === 0
                  ? 'cursor-not-allowed bg-[#e2e8f0] text-[#94a3b8]'
                  : 'bg-[#0a7aff] text-white shadow-[0_6px_15px_rgba(10,122,255,0.35)] hover:bg-[#0366d6]',
              )}
            >
              Next
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
