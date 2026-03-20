/**
 * MCP Tab — MCP 服务器管理
 * 列出、启用/禁用、添加、删除 MCP 服务器配置
 */
import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Power, PowerOff, RefreshCw, X, Server, AlertCircle } from 'lucide-react';
import { hostApiFetch } from '@/lib/host-api';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────

interface McpServer {
  name: string;
  command: string;
  args: string[];
  env: Record<string, string>;
  enabled: boolean;
  transport: 'stdio' | 'sse' | 'http';
  url?: string;
  addedAt: string;
}

const TRANSPORT_COLORS: Record<string, string> = {
  stdio: 'bg-[#dbeafe] text-[#1d4ed8]',
  sse:   'bg-[#dcfce7] text-[#15803d]',
  http:  'bg-[#f3e8ff] text-[#7e22ce]',
};

// ── Form Modal ───────────────────────────────────────────────────

interface FormModalProps {
  initial?: McpServer | null;
  onClose: () => void;
  onSave: (data: Partial<McpServer>) => Promise<void>;
}

function FormModal({ initial, onClose, onSave }: FormModalProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [transport, setTransport] = useState<'stdio' | 'sse' | 'http'>(initial?.transport ?? 'stdio');
  const [command, setCommand] = useState(initial?.command ?? '');
  const [argsRaw, setArgsRaw] = useState((initial?.args ?? []).join(' '));
  const [url, setUrl] = useState(initial?.url ?? '');
  const [envRaw, setEnvRaw] = useState(
    Object.entries(initial?.env ?? {}).map(([k, v]) => `${k}=${v}`).join('\n'),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) { setError('名称不能为空'); return; }
    if (transport === 'stdio' && !command.trim()) { setError('命令不能为空'); return; }
    if ((transport === 'sse' || transport === 'http') && !url.trim()) { setError('URL 不能为空'); return; }
    setSaving(true);
    setError('');
    try {
      const env: Record<string, string> = {};
      for (const line of envRaw.split('\n')) {
        const idx = line.indexOf('=');
        if (idx > 0) env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
      }
      await onSave({
        name: name.trim(),
        transport,
        command: command.trim(),
        args: argsRaw.trim() ? argsRaw.trim().split(/\s+/) : [],
        url: url.trim() || undefined,
        env,
        enabled: initial?.enabled !== false,
      });
      onClose();
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[#c6c6c8] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#f2f2f7] px-6 py-4">
          <h3 className="text-[16px] font-semibold">{initial ? '编辑 MCP 服务器' : '添加 MCP 服务器'}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#8e8e93] hover:bg-[#f2f2f7]"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-[#fef2f2] px-3 py-2 text-[13px] text-[#ef4444]">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#3c3c43]">名称</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!!initial}
              placeholder="my-mcp-server"
              className="w-full rounded-xl border border-[#c6c6c8] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#007aff] disabled:bg-[#f2f2f7] disabled:text-[#8e8e93]"
            />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#3c3c43]">传输类型</label>
            <div className="flex gap-2">
              {(['stdio', 'sse', 'http'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTransport(t)}
                  className={cn('rounded-lg px-3 py-1.5 text-[12px] font-medium border transition-colors', transport === t ? 'border-[#007aff] bg-[#007aff]/10 text-[#007aff]' : 'border-[#c6c6c8] text-[#3c3c43] hover:bg-[#f2f2f7]')}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {transport === 'stdio' ? (
            <>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-[#3c3c43]">命令</label>
                <input
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="uvx / npx / python"
                  className="w-full rounded-xl border border-[#c6c6c8] bg-white px-3 py-2 font-mono text-[13px] outline-none focus:border-[#007aff]"
                />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-[#3c3c43]">参数（空格分隔）</label>
                <input
                  value={argsRaw}
                  onChange={(e) => setArgsRaw(e.target.value)}
                  placeholder="mcp-server-github --port 8080"
                  className="w-full rounded-xl border border-[#c6c6c8] bg-white px-3 py-2 font-mono text-[13px] outline-none focus:border-[#007aff]"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#3c3c43]">URL</label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://localhost:8080/sse"
                className="w-full rounded-xl border border-[#c6c6c8] bg-white px-3 py-2 font-mono text-[13px] outline-none focus:border-[#007aff]"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#3c3c43]">环境变量（每行 KEY=VALUE）</label>
            <textarea
              value={envRaw}
              onChange={(e) => setEnvRaw(e.target.value)}
              rows={3}
              placeholder={'GITHUB_TOKEN=ghp_xxx\nAPI_KEY=sk-xxx'}
              className="w-full rounded-xl border border-[#c6c6c8] bg-white px-3 py-2 font-mono text-[13px] outline-none focus:border-[#007aff] resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#f2f2f7] px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-[#c6c6c8] px-4 py-2 text-[13px] text-[#3c3c43] hover:bg-[#f2f2f7]">取消</button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-xl bg-[#007aff] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#0056cc] disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────

export function McpTab() {
  const [servers, setServers] = useState<McpServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<McpServer | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hostApiFetch<{ servers: McpServer[] }>('/api/mcp');
      setServers(data?.servers ?? []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleToggle = useCallback(async (name: string) => {
    try {
      const res = await hostApiFetch<{ enabled: boolean }>(`/api/mcp/${encodeURIComponent(name)}/toggle`, { method: 'PATCH' });
      setServers((prev) => prev.map((s) => s.name === name ? { ...s, enabled: res.enabled } : s));
    } catch (err) {
      setError(String(err));
    }
  }, []);

  const handleDelete = useCallback(async (name: string) => {
    if (!confirm(`确认删除 MCP 服务器「${name}」？`)) return;
    try {
      await hostApiFetch(`/api/mcp/${encodeURIComponent(name)}`, { method: 'DELETE' });
      setServers((prev) => prev.filter((s) => s.name !== name));
    } catch (err) {
      setError(String(err));
    }
  }, []);

  const handleSave = useCallback(async (data: Partial<McpServer>) => {
    await hostApiFetch<{ server: McpServer }>('/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await load();
  }, [load]);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] text-[#8e8e93]">管理 Model Context Protocol 服务器，为 Agent 提供外部工具能力</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={load}
            className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-[13px] text-[#3c3c43] hover:bg-[#f2f2f7]"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            刷新
          </button>
          <button
            type="button"
            onClick={() => { setEditing(null); setFormOpen(true); }}
            className="flex items-center gap-1.5 rounded-xl bg-[#007aff] px-3 py-1.5 text-[13px] font-medium text-white hover:bg-[#0056cc]"
          >
            <Plus className="h-3.5 w-3.5" />
            添加服务器
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-[#ef4444]/30 bg-[#fef2f2] px-4 py-3 text-[13px] text-[#ef4444]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-[14px] text-[#8e8e93]">加载中...</div>
      ) : servers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Server className="h-12 w-12 text-[#c6c6c8]" />
          <p className="text-[14px] font-medium text-[#3c3c43]">暂无 MCP 服务器</p>
          <p className="text-[12px] text-[#8e8e93]">点击「添加服务器」配置第一个 MCP 服务器</p>
          <button
            type="button"
            onClick={() => { setEditing(null); setFormOpen(true); }}
            className="mt-2 flex items-center gap-1.5 rounded-xl bg-[#007aff] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#0056cc]"
          >
            <Plus className="h-4 w-4" />
            添加服务器
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {servers.map((server) => (
            <div
              key={server.name}
              className={cn(
                'flex items-start justify-between gap-4 rounded-2xl border px-5 py-4 transition-all',
                server.enabled
                  ? 'border-black/[0.06] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
                  : 'border-black/[0.04] bg-[#f9f9f9] opacity-60',
              )}
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-[#000000]">{server.name}</span>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', TRANSPORT_COLORS[server.transport] ?? 'bg-[#f2f2f7] text-[#3c3c43]')}>
                    {server.transport}
                  </span>
                  {!server.enabled && (
                    <span className="rounded-full bg-[#f2f2f7] px-2 py-0.5 text-[10px] text-[#8e8e93]">已禁用</span>
                  )}
                </div>

                {server.transport === 'stdio' ? (
                  <code className="block truncate rounded-lg bg-[#f2f2f7] px-3 py-1.5 font-mono text-[12px] text-[#3c3c43]">
                    {[server.command, ...server.args].join(' ')}
                  </code>
                ) : (
                  <code className="block truncate rounded-lg bg-[#f2f2f7] px-3 py-1.5 font-mono text-[12px] text-[#3c3c43]">
                    {server.url}
                  </code>
                )}

                {Object.keys(server.env).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(server.env).map((k) => (
                      <span key={k} className="rounded-full border border-[#c6c6c8] px-2 py-0.5 font-mono text-[10px] text-[#8e8e93]">{k}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => void handleToggle(server.name)}
                  title={server.enabled ? '禁用' : '启用'}
                  className={cn(
                    'rounded-xl p-2 transition-colors',
                    server.enabled
                      ? 'text-[#10b981] hover:bg-[#f0fdf4]'
                      : 'text-[#8e8e93] hover:bg-[#f2f2f7]',
                  )}
                >
                  {server.enabled ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditing(server); setFormOpen(true); }}
                  className="rounded-xl p-2 text-[#3c3c43] hover:bg-[#f2f2f7]"
                  title="编辑"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(server.name)}
                  className="rounded-xl p-2 text-[#ef4444] hover:bg-[#fef2f2]"
                  title="删除"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {formOpen && (
        <FormModal
          initial={editing}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
