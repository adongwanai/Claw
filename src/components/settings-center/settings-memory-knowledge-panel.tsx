import { startTransition, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { SettingsMemoryBrowser } from './settings-memory-browser';
import { SettingsMemoryStrategy } from './settings-memory-strategy';

type MemoryTabId = 'strategy' | 'browser';

const MEMORY_TABS: MemoryTabId[] = ['strategy', 'browser'];

export function SettingsMemoryKnowledgePanel() {
  const { t } = useTranslation('settings');
  const [activeTab, setActiveTab] = useState<MemoryTabId>('strategy');

  return (
    <div className="space-y-6">
      <div className="border-b border-black/[0.08]">
        <div role="tablist" aria-label={t('memoryKnowledge.tabsAriaLabel')} className="flex flex-wrap gap-6">
          {MEMORY_TABS.map((tabId) => {
            const active = tabId === activeTab;

            return (
              <button
                key={tabId}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  startTransition(() => setActiveTab(tabId));
                }}
                className={cn(
                  'border-b-2 pb-3 text-[13px] font-medium transition-colors',
                  active
                    ? 'border-[#0a7aff] text-[#0a7aff]'
                    : 'border-transparent text-[#8e8e93] hover:text-[#111827]',
                )}
              >
                {tabId === 'strategy'
                  ? t('memoryKnowledge.tabs.strategy')
                  : t('memoryKnowledge.tabs.browser')}
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
