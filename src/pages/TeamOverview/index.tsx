import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTeamsStore } from '@/stores/teams';
import { useAgentsStore } from '@/stores/agents';
import { TeamGrid } from '@/components/team/TeamGrid';
import { DndContext, DragOverlay, type DragStartEvent, type DragEndEvent } from '@dnd-kit/core';
import { AgentPanel } from '@/components/team/AgentPanel';
import { CreateTeamZone } from '@/components/team/CreateTeamZone';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function TeamOverview() {
  const { t } = useTranslation('common');
  const { teams, loading, error, fetchTeams, deleteTeam } = useTeamsStore();
  const { agents } = useAgentsStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    void fetchTeams();
  }, [fetchTeams]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (_event: DragEndEvent) => {
    setActiveId(null);
    // 拖拽完成逻辑将在 Plan 04 实现
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full flex-col bg-slate-50 p-6 xl:p-8">
        <div className="flex flex-1 flex-col overflow-y-auto rounded-[32px] bg-white p-8 shadow-sm border border-slate-200/60 mr-80">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
              {t('teamOverview.title')}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              {loading
                ? t('status.loading')
                : error
                  ? t('status.loadFailed')
                  : t('teamOverview.summary', { count: teams.length })}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
              {t('status.loading')}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="flex flex-1 items-center justify-center text-sm text-rose-500">
              {error}
            </div>
          )}

          {/* Team Grid */}
          {!loading && !error && (
            <TeamGrid
              teams={teams}
              loading={loading}
              onDeleteTeam={deleteTeam}
            />
          )}
        </div>

        {/* 创建区（左侧固定） */}
        <CreateTeamZone />

        {/* Agent 面板（右侧固定） */}
        <AgentPanel />

        {/* 拖拽预览 (per D-13) */}
        <DragOverlay>
          {activeId ? (
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-lg opacity-80">
              <AgentPreview agentId={activeId} agents={agents} />
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

function AgentPreview({ agentId, agents }: { agentId: string; agents: any[] }) {
  const agent = agents.find(a => a.id === agentId);
  if (!agent) return null;

  const initials = agent.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        {agent.avatar ? (
          <img src={agent.avatar} alt={agent.name} className="object-cover" />
        ) : (
          <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
            {initials}
          </AvatarFallback>
        )}
      </Avatar>
      <span className="font-medium text-sm">{agent.name}</span>
    </div>
  );
}

export default TeamOverview;
