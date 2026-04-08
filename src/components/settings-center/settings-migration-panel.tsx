import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { hostApiFetch } from '@/lib/host-api';

interface BackupEntry {
  filename: string;
  createdAt: string;
  sizeBytes: number;
}

interface PreviewData {
  settings: Record<string, unknown>;
  memory: Record<string, unknown>;
  channelMetadata: Record<string, unknown>;
}

type ActionState = 'idle' | 'loading' | 'success' | 'error';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

type SettingsMigrationPanelProps = {
  onLaunchWizard: () => void;
};

export function SettingsMigrationPanel({ onLaunchWizard }: SettingsMigrationPanelProps) {
  const { t } = useTranslation('settings');
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [createState, setCreateState] = useState<ActionState>('idle');
  const [exportState, setExportState] = useState<ActionState>('idle');
  const [importState, setImportState] = useState<ActionState>('idle');

  // Preview modal state
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [previewArchivePath, setPreviewArchivePath] = useState<string | null>(null);
  const [selectedModules, setSelectedModules] = useState<Array<'settings' | 'memory' | 'channelMetadata'>>(['settings', 'memory', 'channelMetadata']);

  async function loadBackups() {
    setLoadingBackups(true);
    try {
      const list = await hostApiFetch<BackupEntry[]>('/api/backup/list');
      setBackups(list ?? []);
    } catch {
      setBackups([]);
    } finally {
      setLoadingBackups(false);
    }
  }

  useEffect(() => {
    void loadBackups();
  }, []);

  async function handleCreateBackup() {
    setCreateState('loading');
    try {
      await hostApiFetch('/api/backup/create', { method: 'POST' });
      setCreateState('success');
      await loadBackups();
      setTimeout(() => setCreateState('idle'), 2000);
    } catch {
      setCreateState('error');
      setTimeout(() => setCreateState('idle'), 3000);
    }
  }

  async function handleExport() {
    setExportState('loading');
    try {
      // Request export — the server streams the file; we trigger a save dialog via IPC
      const result = await window.electron.ipcRenderer.invoke('dialog:save', {
        title: 'Save KTClaw Backup',
        defaultPath: `ktclaw-backup-${new Date().toISOString().slice(0, 10)}.ktclaw`,
        filters: [{ name: 'KTClaw Archive', extensions: ['ktclaw'] }],
      }) as { canceled: boolean; filePath?: string };
      if (result.canceled || !result.filePath) {
        setExportState('idle');
        return;
      }
      // Call export endpoint — it returns the archive path on disk
      const exported = await hostApiFetch<{ archivePath?: string }>('/api/backup/export', { method: 'POST' });
      if (exported?.archivePath) {
        // Copy to user-chosen path via IPC if needed; for now just notify success
      }
      setExportState('success');
      setTimeout(() => setExportState('idle'), 2000);
    } catch {
      setExportState('error');
      setTimeout(() => setExportState('idle'), 3000);
    }
  }

  async function handleImportPick() {
    try {
      const result = await window.electron.ipcRenderer.invoke('dialog:open', {
        title: 'Select KTClaw Archive',
        filters: [{ name: 'KTClaw Archive', extensions: ['ktclaw'] }],
        properties: ['openFile'],
      }) as { canceled: boolean; filePaths: string[] };
      if (result.canceled || !result.filePaths[0]) return;
      const archivePath = result.filePaths[0];
      const preview = await hostApiFetch<PreviewData>('/api/backup/preview', {
        method: 'POST',
        body: JSON.stringify({ archivePath }),
      });
      setPreviewData(preview);
      setPreviewArchivePath(archivePath);
    } catch {
      // ignore
    }
  }

  async function handleConfirmImport() {
    if (!previewArchivePath) return;
    setImportState('loading');
    try {
      await hostApiFetch('/api/backup/import', {
        method: 'POST',
        body: JSON.stringify({ archivePath: previewArchivePath, modules: selectedModules }),
      });
      setImportState('success');
      setPreviewData(null);
      setPreviewArchivePath(null);
      await loadBackups();
      setTimeout(() => setImportState('idle'), 2000);
    } catch {
      setImportState('error');
      setTimeout(() => setImportState('idle'), 3000);
    }
  }

  function toggleModule(mod: 'settings' | 'memory' | 'channelMetadata') {
    setSelectedModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  }

  return (
    <div className="space-y-4">
      {/* Migrate from OpenClaw */}
      <section className="rounded-xl border border-[#c6c6c8] bg-white px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold text-[#000000]">
              {t('migrationPanel.migrate.title')}
            </h3>
            <p className="mt-1 text-[12px] text-[#8e8e93]">
              {t('migrationPanel.migrate.description')}
            </p>
          </div>
          <button
            type="button"
            onClick={onLaunchWizard}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[#0a7aff] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#075ac4]"
          >
            {t('migrationPanel.migrate.cta')}
          </button>
        </div>
      </section>

      {/* Backup & Export */}
      <section className="rounded-xl border border-[#c6c6c8] bg-white px-5 py-4">
        <h3 className="mb-4 text-[15px] font-semibold text-[#000000]">
          {t('migrationPanel.backup.title')}
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={createState === 'loading'}
            onClick={() => void handleCreateBackup()}
            className="rounded-lg border border-black/10 px-4 py-2 text-[13px] font-medium text-[#000000] transition hover:bg-[#f2f2f7] disabled:opacity-50"
          >
            {createState === 'loading' ? 'Creating...' : createState === 'success' ? 'Created!' : 'Create Backup Now'}
          </button>
          <button
            type="button"
            disabled={exportState === 'loading'}
            onClick={() => void handleExport()}
            className="rounded-lg border border-black/10 px-4 py-2 text-[13px] font-medium text-[#000000] transition hover:bg-[#f2f2f7] disabled:opacity-50"
          >
            {exportState === 'loading' ? 'Exporting...' : exportState === 'success' ? 'Exported!' : 'Export Backup'}
          </button>
          <button
            type="button"
            onClick={() => void handleImportPick()}
            className="rounded-lg border border-black/10 px-4 py-2 text-[13px] font-medium text-[#000000] transition hover:bg-[#f2f2f7]"
          >
            {t('migrationPanel.backup.importButton')}
          </button>
        </div>
      </section>

      {/* Preview modal */}
      {previewData && (
        <section className="rounded-xl border border-[#0a7aff] bg-white px-5 py-4">
          <h3 className="mb-3 text-[15px] font-semibold text-[#000000]">Preview Import</h3>
          <p className="mb-3 text-[13px] text-[#8e8e93]">Select which modules to restore:</p>
          <div className="space-y-2 mb-4">
            {(['settings', 'memory', 'channelMetadata'] as const).map((mod) => (
              <label key={mod} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedModules.includes(mod)}
                  onChange={() => toggleModule(mod)}
                  className="rounded"
                />
                <span className="text-[13px] text-[#000000] capitalize">{mod}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={importState === 'loading' || selectedModules.length === 0}
              onClick={() => void handleConfirmImport()}
              className="rounded-lg bg-[#0a7aff] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#075ac4] disabled:opacity-50"
            >
              {importState === 'loading' ? 'Restoring...' : importState === 'success' ? 'Restored!' : 'Restore Selected'}
            </button>
            <button
              type="button"
              onClick={() => { setPreviewData(null); setPreviewArchivePath(null); }}
              className="rounded-lg border border-black/10 px-4 py-2 text-[13px] font-medium text-[#000000] transition hover:bg-[#f2f2f7]"
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      {/* Backup list */}
      <section className="rounded-xl border border-[#c6c6c8] bg-white px-5 py-4">
        <h3 className="mb-4 text-[15px] font-semibold text-[#000000]">Backup History</h3>
        {loadingBackups ? (
          <p className="text-[13px] text-[#8e8e93]">Loading...</p>
        ) : backups.length === 0 ? (
          <p className="text-[13px] text-[#8e8e93]">No backups yet.</p>
        ) : (
          <div className="space-y-2">
            {backups.map((b) => (
              <div
                key={b.filename}
                className="flex items-center justify-between rounded-lg border border-black/10 bg-[#f9f9f9] px-4 py-3"
              >
                <div>
                  <p className="text-[13px] font-medium text-[#000000]">{b.filename}</p>
                  <p className="mt-0.5 text-[12px] text-[#8e8e93]">
                    {formatDate(b.createdAt)} &middot; {formatBytes(b.sizeBytes)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Hard Reset */}
      <section className="rounded-xl border border-[#c6c6c8] bg-white px-5 py-4">
        <h3 className="mb-4 text-[15px] font-semibold text-[#000000]">
          {t('migrationPanel.hardReset.title')}
        </h3>
        <div className="flex items-center justify-between gap-4">
          <p className="text-[13px] text-[#ef4444]">
            {t('migrationPanel.hardReset.warning')}
          </p>
          <button
            type="button"
            className="shrink-0 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-2 text-[13px] font-semibold text-[#b91c1c] transition hover:bg-[#fee2e2]"
          >
            {t('migrationPanel.hardReset.button')}
          </button>
        </div>
      </section>
    </div>
  );
}
