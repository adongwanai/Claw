import type { AgentSummary } from '@/types/agent';

type WorkState = 'idle' | 'starting' | 'working' | 'blocked' | 'waiting_approval' | 'scheduled' | 'done' | 'failed';

type KanbanTicket = {
  id: string;
  title: string;
  assigneeId?: string;
  workState?: WorkState;
  status?: string;
};

export type TeamWorkStatusKey = 'blocked' | 'waiting_approval' | 'working' | 'active' | 'idle';

export type TeamMemberWorkVisibility = {
  statusKey: TeamWorkStatusKey;
  activeTaskCount: number;
  currentWorkTitles: string[];
};

const STORAGE_KEY = 'clawport-kanban';

function loadTickets(): KanbanTicket[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as KanbanTicket[]) : [];
  } catch {
    return [];
  }
}

export function deriveTeamWorkVisibility(
  agents: AgentSummary[],
  sessionLastActivity: Record<string, number>,
  runtimeByAgent?: Record<string, Array<{ status: string; prompt: string }>>,
): Record<string, TeamMemberWorkVisibility> {
  const tickets = loadTickets();
  const now = Date.now();
  const recentMs = 5 * 60 * 1000;

  return Object.fromEntries(agents.map((agent) => {
    // Runtime session data takes priority over Kanban tickets
    const runtimeSessions = runtimeByAgent?.[agent.id] ?? [];
    const activeRuntime = runtimeSessions.filter(
      (s) => s.status === 'running' || s.status === 'blocked' || s.status === 'waiting_approval' || s.status === 'error',
    );

    if (activeRuntime.length > 0) {
      // Map runtime status → TeamWorkStatusKey
      const runtimeStatusKey: TeamWorkStatusKey =
        activeRuntime.some((s) => s.status === 'blocked' || s.status === 'error')
          ? 'blocked'
          : activeRuntime.some((s) => s.status === 'waiting_approval')
            ? 'waiting_approval'
            : 'working';

      const runtimeWorkTitles = activeRuntime
        .filter((s) => s.prompt?.trim())
        .map((s) => s.prompt.trim().slice(0, 80));

      // Merge runtime titles with kanban titles (runtime first)
      // Note: rename local variable to avoid clash with the outer `assignedTickets` declared below
      const runtimeSupportTickets = tickets.filter((ticket) => ticket.assigneeId === agent.id);
      const kanbanTitles = runtimeSupportTickets
        .filter((ticket) => (ticket.workState ?? 'idle') !== 'idle' && (ticket.status ?? '') !== 'done')
        .map((ticket) => ticket.title);

      return [agent.id, {
        statusKey: runtimeStatusKey,
        activeTaskCount: runtimeWorkTitles.length + kanbanTitles.length,
        currentWorkTitles: [...runtimeWorkTitles, ...kanbanTitles],
      }];
    }

    // Fall through to existing Kanban + lastActivity logic when no active runtime sessions
    const assignedTickets = tickets.filter((ticket) => ticket.assigneeId === agent.id);
    const currentWorkTitles = assignedTickets
      .filter((ticket) => (ticket.workState ?? 'idle') !== 'idle' && (ticket.status ?? '') !== 'done')
      .map((ticket) => ticket.title);

    const workStates = new Set(assignedTickets.map((ticket) => ticket.workState ?? 'idle'));
    const statusKey: TeamWorkStatusKey = workStates.has('blocked')
      ? 'blocked'
      : workStates.has('waiting_approval')
        ? 'waiting_approval'
        : (workStates.has('working') || workStates.has('starting') || workStates.has('scheduled'))
          ? 'working'
          : ((sessionLastActivity[agent.mainSessionKey] ?? 0) > now - recentMs ? 'active' : 'idle');

    return [agent.id, {
      statusKey,
      activeTaskCount: currentWorkTitles.length,
      currentWorkTitles,
    }];
  }));
}
