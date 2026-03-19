import { useState } from 'react';
import { cn } from '@/lib/utils';

type SortKey = 'date' | 'name' | 'size';

interface MemoryFile {
  id: string;
  type: 'daily' | 'longterm';
  label: string;
  date: string;
  size: string;
  ago: string;
  tag?: string;
  tagColor?: string;
  breadcrumb: string;
  filename: string;
  meta: string;
  content: string;
}

const MEMORY_FILES: MemoryFile[] = [
  {
    id: 'f1',
    type: 'daily',
    label: 'Daily Memory',
    date: '2026-03-10',
    size: '1.2KB',
    ago: '2h ago',
    tag: 'Daily',
    tagColor: 'bg-[#007aff] text-white',
    breadcrumb: 'memory',
    filename: '2026-03-10.md',
    meta: '12 lines · 1.2KB · 2h ago',
    content: `# 每日 Memory 初始化完成 ✌

**日期**

- 状态: 2026-03-10 (Day 6)

**文件创建**

- 状态: /root/.openclaw/workspace/memory/2026-03-10.md ✅

**目标回顾**

- 状态: 已从 03-09 继承：继续推进 V8 多源融合日报，完成 Agent Reach / Multi Search Engine 集成，测试

**昨日文件**

- 状态: 已读取 2026-03-09.md

---

🌅 新的一天开始啦！有什么新任务尽管说~`,
  },
  {
    id: 'f2',
    type: 'daily',
    label: 'Daily Memory',
    date: '2026-03-09',
    size: '3.4KB',
    ago: '1d ago',
    tag: undefined,
    breadcrumb: 'memory',
    filename: '2026-03-09.md',
    meta: '48 lines · 3.4KB · 1d ago',
    content: `# Daily Memory 2026-03-09

Agents completed 12 tasks. V8 multi-source digest in progress.`,
  },
  {
    id: 'f3',
    type: 'longterm',
    label: 'Long-Term Memory',
    date: '2026-03-08',
    size: '33.8KB',
    ago: '2d ago',
    tag: 'Evergreen',
    tagColor: 'bg-[#dcfce7] text-[#059669]',
    breadcrumb: 'memory',
    filename: 'longterm.md',
    meta: '412 lines · 33.8KB · 2d ago',
    content: `# Long-Term Memory

Persistent knowledge base. Architecture decisions, project context, team info.`,
  },
  {
    id: 'f4',
    type: 'daily',
    label: 'Daily Memory',
    date: '2026-03-08',
    size: '2.8KB',
    ago: '2d ago',
    tag: undefined,
    breadcrumb: 'memory',
    filename: '2026-03-08.md',
    meta: '35 lines · 2.8KB · 2d ago',
    content: `# Daily Memory 2026-03-08

Sprint planning sync. Backend team capacity review.`,
  },
  {
    id: 'f5',
    type: 'daily',
    label: 'Daily Memory',
    date: '2026-03-07',
    size: '4.1KB',
    ago: '3d ago',
    tag: undefined,
    breadcrumb: 'memory',
    filename: '2026-03-07.md',
    meta: '52 lines · 4.1KB · 3d ago',
    content: `# Daily Memory 2026-03-07

Weekly retro done. Architecture v1.2 approved.`,
  },
];

export function SettingsMemoryBrowser() {
  const [activeFileId, setActiveFileId] = useState(MEMORY_FILES[0].id);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [search, setSearch] = useState('');

  const activeFile = MEMORY_FILES.find((f) => f.id === activeFileId) ?? MEMORY_FILES[0];

  const filtered = MEMORY_FILES.filter(
    (f) =>
      f.label.toLowerCase().includes(search.toLowerCase()) ||
      f.filename.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex min-h-[540px] gap-0 overflow-hidden rounded-xl border border-black/[0.08]">
      {/* Left panel */}
      <div className="flex w-[220px] shrink-0 flex-col border-r border-black/[0.06] bg-white">
        {/* Search */}
        <div className="border-b border-black/[0.06] px-3 py-2.5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memory..."
            className="w-full rounded-lg border border-black/10 bg-[#f9f9f9] px-3 py-1.5 text-[12px] text-[#000000] outline-none focus:border-[#007aff] focus:bg-white"
          />
        </div>

        {/* Sort tabs */}
        <div className="flex gap-2 border-b border-black/[0.06] px-3 py-2">
          {(['date', 'name', 'size'] as SortKey[]).map((key) => {
            const labels: Record<SortKey, string> = { date: 'Date', name: 'Name', size: 'Size' };
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSortKey(key)}
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors',
                  sortKey === key
                    ? 'bg-[#ef4444] text-white'
                    : 'text-[#8e8e93] hover:text-[#000000]',
                )}
              >
                {labels[key]}
              </button>
            );
          })}
        </div>

        {/* File list */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {filtered.map((file) => {
            const active = file.id === activeFileId;
            return (
              <button
                key={file.id}
                type="button"
                onClick={() => setActiveFileId(file.id)}
                className={cn(
                  'flex flex-col items-start gap-0.5 border-b border-black/[0.04] px-3 py-3 text-left transition-colors',
                  active ? 'bg-[#e8f1ff]' : 'hover:bg-[#f2f2f7]',
                )}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px]">{file.type === 'daily' ? '📄' : '📘'}</span>
                    <span className="truncate text-[12px] font-medium text-[#000000]">
                      {file.label}
                    </span>
                  </div>
                  {file.tag && (
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                        file.tagColor,
                      )}
                    >
                      {file.tag}
                    </span>
                  )}
                  {!file.tag && (
                    <span className="shrink-0 text-[11px] text-[#007aff]">{file.date}</span>
                  )}
                </div>
                <span className="text-[11px] text-[#8e8e93]">
                  {file.size} · {file.ago}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-3">
          <div className="flex items-center gap-1.5 text-[12px] text-[#8e8e93]">
            <button type="button" className="hover:text-[#000000]">
              &lt; Files
            </button>
            <span>/</span>
            <span>{activeFile.breadcrumb}</span>
            <span>/</span>
            <span className="font-medium text-[#000000]">{activeFile.filename}</span>
            {activeFile.tag && (
              <span
                className={cn(
                  'ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                  activeFile.tagColor,
                )}
              >
                {activeFile.tag}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-1 text-[12px] text-[#3c3c43] hover:text-[#000000]"
            >
              <span>⎘</span> Copy
            </button>
            <button
              type="button"
              className="flex items-center gap-1 text-[12px] text-[#3c3c43] hover:text-[#000000]"
            >
              <span>✏</span> Edit
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="border-b border-black/[0.04] px-5 py-2">
          <p className="text-[11px] text-[#8e8e93]">{activeFile.meta}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="rounded-xl border border-black/[0.06] bg-[#fafafa] px-6 py-5">
            <pre className="whitespace-pre-wrap font-sans text-[13px] leading-7 text-[#111827]">
              {activeFile.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
