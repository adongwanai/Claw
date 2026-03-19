import { useState } from 'react';
import { cn } from '@/lib/utils';

// Step 1: Compatibility report items
const COMPAT_ITEMS = [
  { id: 'channels', label: 'Channels (IM 通道配置)', desc: '从 openclaw.json 中提取 channels 配置', pass: true },
  { id: 'agentDefaults', label: 'Agent 默认配置', desc: '迁移 agents.defaults 设置', pass: true },
  { id: 'workspace', label: '工作区文件 (workspace/)', desc: '复制 workspace/ 目录下的文件 (39 KB)', pass: true },
  { id: 'agents', label: 'Agent 配置 (agents/)', desc: '复制 agents/ 目录下的配置 (16 KB)', pass: true },
  { id: 'skills', label: '技能配置 (skills/)', desc: '复制 skills/ 目录（请注意安全提醒）', pass: true },
  { id: 'cron', label: '定时任务 (cron/)', desc: '复制 cron/ 定时任务配置', pass: true },
  { id: 'identity', label: '身份信息 (IDENTITY.md)', desc: '复制 IDENTITY.md 身份文件', pass: true },
  { id: 'memory', label: 'Agent 记忆库', desc: '记忆库不存在', pass: false },
  { id: 'history', label: '对话历史 (0 个会话)', desc: '未找到对话历史', pass: false },
  { id: 'providers', label: '模型提供商配置', desc: '没有可迁移的自定义模型提供商（zai/zhi…', pass: false },
  { id: 'browser', label: '浏览器状态', desc: '浏览器数据不存在', pass: false },
  { id: 'media', label: '媒体文件', desc: '媒体文件不存在', pass: false },
  { id: 'plugins', label: '插件 (plugins/)', desc: 'AutoClaw 使用不同的插件架构，无法迁移', pass: false },
  { id: 'gateway', label: 'Gateway 配置', desc: 'Gateway 架构不同，无法直接迁移', pass: false },
] as const;

// Step 2: Only the passing items are selectable
const SCOPE_ITEMS = COMPAT_ITEMS.filter((item) => item.pass);

type SettingsMigrationWizardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SettingsMigrationWizard({ open, onOpenChange }: SettingsMigrationWizardProps) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string[]>(SCOPE_ITEMS.map((i) => i.id));
  const [acknowledged, setAcknowledged] = useState(false);

  if (!open) return null;

  const totalSteps = 3;

  const toggleItem = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const allSelected = selected.length === SCOPE_ITEMS.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" aria-hidden onClick={() => onOpenChange(false)} />

      <div
        role="dialog"
        aria-modal="true"
        className="relative flex w-full max-w-[520px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-black/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2f2f7] text-[22px]">
              🗂
            </div>
            <div>
              <h1 className="text-[17px] font-semibold text-[#000000]">配置迁移</h1>
              <p className="text-[12px] text-[#8e8e93]">从 OpenClaw 迁移配置到 AutoClaw</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e5e5ea] text-[#3c3c43] hover:bg-[#d1d1d6]"
          >
            ✕
          </button>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 py-3">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                i + 1 === step ? 'bg-[#3c3c43]' : 'bg-[#d1d1d6]',
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-2">
          {step === 1 && <CompatibilityStep />}
          {step === 2 && (
            <ScopeStep
              selected={selected}
              allSelected={allSelected}
              onToggle={toggleItem}
              onToggleAll={() =>
                setSelected(allSelected ? [] : SCOPE_ITEMS.map((i) => i.id))
              }
            />
          )}
          {step === 3 && (
            <ConfirmStep acknowledged={acknowledged} onAcknowledgeChange={setAcknowledged} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-black/[0.06] px-6 py-4">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep((s) => s - 1) : onOpenChange(false))}
            className="flex items-center gap-1 rounded-full border border-black/10 px-4 py-2 text-[13px] font-medium text-[#000000] hover:bg-[#f2f2f7]"
          >
            ‹ 上一步
          </button>

          <div className="flex items-center gap-3">
            {step < totalSteps && (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="rounded-full px-4 py-2 text-[13px] font-medium text-[#8e8e93] hover:text-[#000000]"
              >
                跳过
              </button>
            )}
            {step < totalSteps ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-1 rounded-full bg-[#ff6a00] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#e05d00]"
              >
                › 下一步
              </button>
            ) : (
              <button
                type="button"
                disabled={!acknowledged}
                onClick={() => {
                  if (acknowledged) onOpenChange(false);
                }}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-5 py-2 text-[13px] font-semibold text-white transition',
                  acknowledged
                    ? 'bg-[#ff6a00] hover:bg-[#e05d00]'
                    : 'cursor-not-allowed bg-[#c7c7cc]',
                )}
              >
                🚀 开始迁移
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompatibilityStep() {
  return (
    <div className="space-y-4 py-2">
      {/* Icon + title */}
      <div className="flex flex-col items-center py-4 text-center">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M8 14 L16 22 L8 14" stroke="none" />
          <line x1="6" y1="16" x2="13" y2="23" stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="13" y1="23" x2="20" y2="12" stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="26" y1="16" x2="42" y2="16" stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="6" y1="32" x2="13" y2="39" stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="13" y1="39" x2="20" y2="28" stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="26" y1="32" x2="42" y2="32" stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <h2 className="mt-1 text-[22px] font-bold text-[#000000]">迁移兼容性报告</h2>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {COMPAT_ITEMS.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            {/* Status icon */}
            {item.pass ? (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#34c759] text-white text-[13px] font-bold">
                ✓
              </span>
            ) : (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#ffd6d6] text-[#ff3b30] text-[13px] font-bold">
                ✕
              </span>
            )}
            {/* Label */}
            <span
              className={cn(
                'shrink-0 text-[14px]',
                item.pass ? 'font-semibold text-[#000000]' : 'text-[#8e8e93]',
              )}
            >
              {item.label}
            </span>
            {/* Dotted separator */}
            <span className="flex-1 border-b border-dashed border-[#c7c7cc]" />
            {/* Description */}
            <span className="shrink-0 text-right text-[13px] text-[#8e8e93]">{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

type ScopeStepProps = {
  selected: string[];
  allSelected: boolean;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
};

function ScopeStep({ selected, allSelected, onToggle, onToggleAll }: ScopeStepProps) {
  return (
    <div className="space-y-4 py-2">
      {/* Icon + title */}
      <div className="flex flex-col items-center py-4 text-center">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <line x1="6" y1="16" x2="13" y2="23" stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="13" y1="23" x2="20" y2="12" stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="26" y1="16" x2="42" y2="16" stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="6" y1="32" x2="13" y2="39" stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="13" y1="39" x2="20" y2="28" stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="26" y1="32" x2="42" y2="32" stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <h2 className="mt-1 text-[22px] font-bold text-[#000000]">选择迁移范围</h2>
        <p className="mt-1 text-[13px] text-[#8e8e93]">选择要迁移的配置项</p>
      </div>

      {/* Select-all row */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onToggleAll}
          className="text-[13px] text-[#3c3c43] hover:text-[#000000]"
        >
          {allSelected ? '取消全选' : '全选'}
        </button>
        <span className="text-[13px] text-[#8e8e93]">
          {selected.length}/{SCOPE_ITEMS.length}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {SCOPE_ITEMS.map((item) => {
          const isSelected = selected.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle(item.id)}
              className="flex w-full items-center gap-3 rounded-xl bg-[#f2f2f7] px-4 py-3 text-left"
            >
              {/* Orange checkbox */}
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-[13px]',
                  isSelected ? 'bg-[#ff6a00]' : 'bg-[#c7c7cc]',
                )}
              >
                ✓
              </span>
              {/* Label */}
              <span className="shrink-0 text-[14px] font-semibold text-[#000000]">{item.label}</span>
              {/* Dotted separator */}
              <span className="flex-1 border-b border-dashed border-[#c7c7cc]" />
              {/* Desc */}
              <span className="shrink-0 text-right text-[13px] text-[#8e8e93]">{item.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type ConfirmStepProps = {
  acknowledged: boolean;
  onAcknowledgeChange: (v: boolean) => void;
};

function ConfirmStep({ acknowledged, onAcknowledgeChange }: ConfirmStepProps) {
  return (
    <div className="space-y-5 py-4">
      {/* Warning icon + title */}
      <div className="flex flex-col items-center py-4 text-center">
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
          <path
            d="M26 6 L48 44 H4 Z"
            stroke="#1c1c1e"
            strokeWidth="2.5"
            strokeLinejoin="round"
            fill="none"
          />
          <line x1="26" y1="22" x2="26" y2="34" stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="26" cy="40" r="1.5" fill="#1c1c1e" />
        </svg>
        <h2 className="mt-3 text-[22px] font-bold text-[#000000]">确认执行迁移</h2>
      </div>

      {/* Checklist */}
      <div className="space-y-4">
        {[
          '原配置不删除（复制非移动）',
          '冲突保留 AutoClaw 默认值',
          '备份至 ~/.openclaw.backup/',
        ].map((item) => (
          <div key={item} className="flex items-center gap-3">
            <span className="text-[15px] text-[#3c3c43]">✓</span>
            <span className="text-[14px] text-[#3c3c43]">{item}</span>
          </div>
        ))}
      </div>

      {/* Security warning */}
      <div className="flex items-center gap-2 rounded-full border border-[#f5c842] bg-[#fffbea] px-4 py-3">
        <span className="text-[15px]">🛡️</span>
        <span className="text-[15px]">💧</span>
        <span className="text-[13px] text-[#3c3c43]">
          安全提醒：skills/ 可能含自定义脚本，迁移前建议审查
        </span>
      </div>

      {/* Acknowledge checkbox */}
      <button
        type="button"
        onClick={() => onAcknowledgeChange(!acknowledged)}
        className="flex items-center gap-3"
      >
        <span
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[11px] text-white',
            acknowledged
              ? 'border-[#ff6a00] bg-[#ff6a00]'
              : 'border-[#c7c7cc] bg-white',
          )}
        >
          {acknowledged ? '✓' : ''}
        </span>
        <span className="text-[14px] text-[#3c3c43]">我已了解迁移风险，确认执行</span>
      </button>
    </div>
  );
}
