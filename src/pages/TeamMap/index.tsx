/**
 * Team Map Page — Frame 03b
 * 团队层级拓扑图：Org chart 显示 Agent 层级关系
 */
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAgentsStore } from '@/stores/agents';
import { useChatStore } from '@/stores/chat';
import type { AgentSummary } from '@/types/agent';

/* ─── Color palette ─── */

const GRADIENTS = [
  'linear-gradient(135deg, #60a5fa, #3b82f6)',
  'linear-gradient(135deg, #fb923c, #f97316)',
  'linear-gradient(135deg, #fbbf24, #f59e0b)',
  'linear-gradient(135deg, #c084fc, #a855f7)',
  'linear-gradient(135deg, #f472b6, #ec4899)',
  'linear-gradient(135deg, #34d399, #10b981)',
];

const ICONS = ['🔍', '🤖', '⚡', '🧠', '🛡️', '📊'];

function agentGradient(idx: number) { return GRADIENTS[idx % GRADIENTS.length]; }
function agentIcon(idx: number) { return ICONS[idx % ICONS.length]; }

/* ─── Recent activity helper ─── */

const RECENT_MS = 5 * 60 * 1000; // 5 min

function isRecentlyActive(ts: number | undefined): boolean {
  return !!ts && Date.now() - ts < RECENT_MS;
}

/* ─── Node card ─── */

function AgentNode({
  agent,
  idx,
  isRoot,
  isActive,
}: {
  agent: AgentSummary;
  idx: number;
  isRoot: boolean;
  isActive: boolean;
}) {
  const gradient = isRoot ? 'linear-gradient(135deg, #10b981, #059669)' : agentGradient(idx);
  const icon = isRoot ? '✦' : agentIcon(idx);

  return (
    <div
      className={cn(
        'rounded-2xl bg-white p-5 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)] cursor-pointer transition-all hover:-translate-y-0.5',
        isRoot
          ? 'w-[184px] border-2 border-clawx-ac shadow-[0_2px_16px_rgba(0,122,255,0.12)] hover:shadow-[0_4px_20px_rgba(0,122,255,0.18)]'
          : 'w-[160px] border border-black/[0.06] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]',
      )}
    >
      <div
        className={cn(
          'mx-auto mb-3 flex items-center justify-center rounded-2xl text-white',
          isRoot ? 'h-[52px] w-[52px] text-[24px]' : 'h-[48px] w-[48px] text-[20px]',
        )}
        style={{ background: gradient }}
      >
        {icon}
      </div>
      <p className={cn('font-semibold text-[#000000]', isRoot ? 'text-[15px]' : 'text-[14px]')}>
        {agent.name}
      </p>
      <p className="text-[12px] text-[#8e8e93]">{agent.id}</p>
      <div className="mt-2 flex items-center justify-center gap-2 text-[12px]">
        <span className={cn('flex items-center gap-1', isActive ? 'text-clawx-ac' : 'text-[#8e8e93]')}>
          <span className={cn('h-[6px] w-[6px] rounded-full', isActive ? 'bg-clawx-ac' : 'bg-[#d1d5db]')} />
          {isActive ? '活跃' : '待命'}
        </span>
        {agent.channelTypes.length > 0 && (
          <span className="text-[#10b981]">{agent.channelTypes.length} ch</span>
        )}
      </div>
    </div>
  );
}

/* ─── Dynamic SVG connector lines ─── */

function ConnectorLines({ childCount }: { childCount: number }) {
  if (childCount === 0) return null;

  // Each child node is 160px wide with 24px gap
  const nodeW = 160;
  const gap = 24;
  const totalW = childCount * nodeW + (childCount - 1) * gap;
  const svgW = Math.max(totalW, 200);
  const cx = svgW / 2;
  const midY = 28;

  // x centers of each child
  const childCenters = Array.from({ length: childCount }, (_, i) => {
    const startX = (svgW - totalW) / 2;
    return startX + i * (nodeW + gap) + nodeW / 2;
  });

  const leftX = childCenters[0];
  const rightX = childCenters[childCenters.length - 1];

  return (
    <svg
      width={svgW}
      height={56}
      className="-my-px overflow-visible"
      style={{ display: 'block' }}
    >
      {/* Vertical from root down to horizontal bar */}
      <line x1={cx} y1={0} x2={cx} y2={midY} stroke="#d1d5db" strokeWidth="1.5" />
      {/* Horizontal bar */}
      {childCount > 1 && (
        <line x1={leftX} y1={midY} x2={rightX} y2={midY} stroke="#d1d5db" strokeWidth="1.5" />
      )}
      {/* Vertical drops to each child */}
      {childCenters.map((x, i) => (
        <line key={i} x1={x} y1={midY} x2={x} y2={56} stroke="#d1d5db" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

/* ─── Empty state ─── */

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
      <span className="text-[40px]">🤖</span>
      <p className="text-[14px] text-[#8e8e93]">暂无 Agent</p>
      <p className="text-[12px] text-[#c6c6c8]">在「员工总览」页面创建 Agent 后显示</p>
    </div>
  );
}

/* ─── Main component ─── */

export function TeamMap() {
  const [activeTab, setActiveTab] = useState<'Teams' | 'Hierarchy'>('Hierarchy');
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const { agents, loading, fetchAgents, defaultAgentId } = useAgentsStore();
  const sessionLastActivity = useChatStore((s) => s.sessionLastActivity);

  useEffect(() => { void fetchAgents(); }, [fetchAgents]);

  const rootAgent = agents.find((a) => a.id === defaultAgentId) ?? agents[0] ?? null;
  const childAgents = agents.filter((a) => a.id !== rootAgent?.id);

  const zoomIn = () => setScale((s) => Math.min(2, +(s + 0.2).toFixed(1)));
  const zoomOut = () => setScale((s) => Math.max(0.4, +(s - 0.2).toFixed(1)));
  const zoomFit = () => setScale(1);

  return (
    <div className="flex h-full flex-col bg-[#f2f2f7] p-6">
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">

        {/* Legend top-right */}
        <div className="absolute right-5 top-4 flex items-center gap-4 text-[12px] text-[#3c3c43]">
          <span className="flex items-center gap-1.5">
            <span className="h-[7px] w-[7px] rounded-full bg-clawx-ac" />
            活跃
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-[7px] w-[7px] rounded-full bg-[#8e8e93]" />
            待命
          </span>
          {scale !== 1 && (
            <span className="text-[11px] text-[#c6c6c8]">{Math.round(scale * 100)}%</span>
          )}
          {loading && (
            <span className="text-[#c6c6c8]">加载中...</span>
          )}
        </div>

        {/* Content */}
        {activeTab === 'Hierarchy' ? (
          !loading && !rootAgent ? (
            <EmptyState />
          ) : (
            <div
              ref={containerRef}
              className="flex flex-1 items-center justify-center overflow-auto pb-16 pt-8"
            >
              <div
                className="flex flex-col items-center transition-transform duration-200"
                style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}
              >
                {rootAgent && (
                  <AgentNode
                    agent={rootAgent}
                    idx={0}
                    isRoot
                    isActive={isRecentlyActive(sessionLastActivity[rootAgent.mainSessionKey])}
                  />
                )}
                {childAgents.length > 0 && rootAgent && (
                  <ConnectorLines childCount={childAgents.length} />
                )}
                {childAgents.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-6">
                    {childAgents.map((agent, idx) => (
                      <AgentNode
                        key={agent.id}
                        agent={agent}
                        idx={idx}
                        isRoot={false}
                        isActive={isRecentlyActive(sessionLastActivity[agent.mainSessionKey])}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          <TeamsView agents={agents} loading={loading} sessionLastActivity={sessionLastActivity} />
        )}

        {/* Zoom controls (bottom-left) */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-1">
          {([
            { icon: '+', action: zoomIn, title: '放大' },
            { icon: '−', action: zoomOut, title: '缩小' },
            { icon: '⛶', action: zoomFit, title: '重置' },
          ] as const).map(({ icon, action, title }) => (
            <button
              key={icon}
              type="button"
              title={title}
              onClick={action}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 bg-white text-[14px] text-[#3c3c43] shadow-sm transition-colors hover:bg-[#f2f2f7]"
            >
              {icon}
            </button>
          ))}
        </div>

        {/* Tab switcher (bottom-center) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className="flex rounded-lg border border-black/10 bg-white p-0.5 shadow-sm">
            {(['Teams', 'Hierarchy'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'rounded-md px-4 py-1.5 text-[13px] transition-colors',
                  activeTab === tab
                    ? 'bg-[#1c1c1e] font-medium text-white'
                    : 'text-[#3c3c43] hover:bg-[#f2f2f7]',
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Teams view (channel-grouped cards) ─── */

function TeamsView({
  agents,
  loading,
  sessionLastActivity,
}: {
  agents: AgentSummary[];
  loading: boolean;
  sessionLastActivity: Record<string, number>;
}) {
  if (loading) {
    return <div className="flex flex-1 items-center justify-center text-[13px] text-[#8e8e93]">加载中...</div>;
  }
  if (agents.length === 0) {
    return <EmptyState />;
  }

  // Group agents by their channel types
  const channelGroups = new Map<string, AgentSummary[]>();
  channelGroups.set('全部', agents);
  for (const agent of agents) {
    for (const ch of agent.channelTypes) {
      const prev = channelGroups.get(ch) ?? [];
      channelGroups.set(ch, [...prev, agent]);
    }
  }
  if (channelGroups.get('全部')?.length === agents.length && channelGroups.size === 1) {
    // No channel assignments — just show all
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 pb-16">
      <div className="space-y-6">
        {[...channelGroups.entries()].map(([group, groupAgents]) => (
          <div key={group}>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.5px] text-[#8e8e93]">{group}</span>
              <span className="rounded-full bg-[#f2f2f7] px-2 py-0.5 text-[11px] text-[#8e8e93]">{groupAgents.length}</span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
              {groupAgents.map((agent, idx) => (
                <AgentNode
                  key={agent.id}
                  agent={agent}
                  idx={idx}
                  isRoot={false}
                  isActive={isRecentlyActive(sessionLastActivity[agent.mainSessionKey])}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeamMap;
