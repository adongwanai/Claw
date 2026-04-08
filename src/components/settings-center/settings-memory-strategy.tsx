import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/stores/settings';
import { hostApiFetch } from '@/lib/host-api';

type ActionState = 'idle' | 'loading' | 'success' | 'error';

function useMemoryAction(endpoint: string): { state: ActionState; run: () => Promise<void> } {
  const [state, setState] = useState<ActionState>('idle');
  const run = async () => {
    setState('loading');
    try {
      await hostApiFetch(endpoint, { method: 'POST' });
      setState('success');
      setTimeout(() => setState('idle'), 2000);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  };
  return { state, run };
}

function ActionButton({
  label,
  state,
  onClick,
}: {
  label: string;
  state: ActionState;
  onClick: () => void;
}) {
  const { t } = useTranslation('settings');
  const disabled = state === 'loading';
  const displayLabel =
    state === 'loading'
      ? t('memoryBrowser.loading')
      : state === 'success'
        ? t('memoryBrowser.saved')
        : state === 'error'
          ? t('memoryBrowser.readFailed', { error: '' }).replace(': ', '')
          : label;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="shrink-0 rounded-lg border border-black/10 px-4 py-2 text-[13px] font-medium text-[#000000] transition hover:bg-[#f2f2f7] disabled:opacity-50"
    >
      {displayLabel}
    </button>
  );
}

export function SettingsMemoryStrategy() {
  const { t } = useTranslation('settings');
  const watchedMemoryDirs = useSettingsStore((s) => s.watchedMemoryDirs);
  const setWatchedMemoryDirs = useSettingsStore((s) => s.setWatchedMemoryDirs);
  const [newDirInput, setNewDirInput] = useState('');
  const [showInput, setShowInput] = useState(false);

  const snapshot = useMemoryAction('/api/memory/snapshot');
  const analyze = useMemoryAction('/api/memory/analyze');
  const reindex = useMemoryAction('/api/memory/reindex');

  function handleAddDir() {
    const trimmed = newDirInput.trim();
    if (!trimmed) return;
    if (!watchedMemoryDirs.includes(trimmed)) {
      setWatchedMemoryDirs([...watchedMemoryDirs, trimmed]);
    }
    setNewDirInput('');
    setShowInput(false);
  }

  function handleRemoveDir(dir: string) {
    setWatchedMemoryDirs(watchedMemoryDirs.filter((d) => d !== dir));
  }

  return (
    <div className="space-y-4">
      {/* Manual memory operations */}
      <section className="rounded-xl border border-[#c6c6c8] bg-white px-5 py-4">
        <h3 className="mb-4 text-[15px] font-semibold text-[#000000]">
          {t('memoryStrategy.global.title')}
        </h3>
        <div className="flex flex-wrap gap-3">
          <ActionButton
            label={t('memoryStrategy.localKnowledge.reindex')}
            state={snapshot.state}
            onClick={() => void snapshot.run()}
          />
          <ActionButton
            label="Analyze"
            state={analyze.state}
            onClick={() => void analyze.run()}
          />
          <ActionButton
            label="Reindex"
            state={reindex.state}
            onClick={() => void reindex.run()}
          />
        </div>
      </section>

      {/* Watched directories */}
      <section className="rounded-xl border border-[#c6c6c8] bg-white px-5 py-4">
        <h3 className="mb-4 text-[15px] font-semibold text-[#000000]">
          {t('memoryStrategy.localKnowledge.title')}
        </h3>
        <div className="space-y-3">
          {watchedMemoryDirs.length === 0 && (
            <p className="text-[13px] text-[#8e8e93]">No watched directories configured.</p>
          )}
          {watchedMemoryDirs.map((dir) => (
            <div
              key={dir}
              className="flex items-center justify-between rounded-lg border border-black/10 bg-[#f9f9f9] px-4 py-3"
            >
              <p className="text-[13px] font-medium text-[#000000] break-all">{dir}</p>
              <button
                type="button"
                aria-label={`Remove ${dir}`}
                onClick={() => handleRemoveDir(dir)}
                className="ml-3 shrink-0 rounded-md border border-black/10 px-2.5 py-1 text-[12px] text-[#ef4444] hover:bg-[#fee2e2]"
              >
                Remove
              </button>
            </div>
          ))}

          {showInput ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newDirInput}
                onChange={(e) => setNewDirInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddDir(); }}
                placeholder="/path/to/directory"
                className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-[13px] text-[#000000] outline-none focus:border-clawx-ac"
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddDir}
                className="rounded-lg bg-[#0a7aff] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#075ac4]"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => { setShowInput(false); setNewDirInput(''); }}
                className="rounded-lg border border-black/10 px-4 py-2 text-[13px] font-medium text-[#000000] transition hover:bg-[#f2f2f7]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowInput(true)}
              className="w-full rounded-lg border border-dashed border-black/10 py-2.5 text-[13px] text-[#8e8e93] transition-colors hover:bg-[#f2f2f7]"
            >
              {t('memoryStrategy.localKnowledge.addDirectory')}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
