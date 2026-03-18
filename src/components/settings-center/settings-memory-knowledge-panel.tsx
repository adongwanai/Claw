import { startTransition, useState } from 'react';
import { cn } from '@/lib/utils';
import { SettingsMemoryBrowser } from './settings-memory-browser';
import { SettingsMemoryStrategy } from './settings-memory-strategy';

type MemoryTabId = 'strategy' | 'browser';

const MEMORY_TABS: Array<{ id: MemoryTabId; label: string }> = [
  { id: 'strategy', label: '策略配置' },
  { id: 'browser', label: '数据浏览器' },
];

export function SettingsMemoryKnowledgePanel() {
  const [activeTab, setActiveTab] = useState<MemoryTabId>('browser');

  return (
    <div className="space-y-6">
      <div className="border-b border-black/[0.08]">
        <div role="tablist" aria-label="Memory knowledge tabs" className="flex flex-wrap gap-6">
          {MEMORY_TABS.map((tab) => {
            const active = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  startTransition(() => setActiveTab(tab.id));
                }}
                className={cn(
                  'border-b-2 pb-3 text-[13px] font-medium transition-colors',
                  active
                    ? 'border-[#0a7aff] text-[#0a7aff]'
                    : 'border-transparent text-[#8e8e93] hover:text-[#111827]',
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'browser' ? <SettingsMemoryBrowser /> : null}
      {activeTab === 'strategy' ? <SettingsMemoryStrategy /> : null}
    </div>
  );
}
