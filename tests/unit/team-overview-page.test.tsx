import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AgentSummary } from '@/types/agent';
import { TeamOverview } from '@/pages/TeamOverview';

const { agentsStoreState, chatStoreState, gatewayStoreState } = vi.hoisted(() => ({
  agentsStoreState: {
    agents: [] as AgentSummary[],
    loading: false,
    error: null as string | null,
    fetchAgents: vi.fn(async () => {}),
    createAgent: vi.fn(async () => {}),
    deleteAgent: vi.fn(async () => {}),
  },
  chatStoreState: {
    sessionLastActivity: {} as Record<string, number>,
  },
  gatewayStoreState: {
    status: {
      state: 'stopped',
      port: 18789,
    },
  },
}));

vi.mock('@/stores/agents', () => ({
  useAgentsStore: () => agentsStoreState,
}));

vi.mock('@/stores/chat', () => ({
  useChatStore: (selector: (state: typeof chatStoreState) => unknown) => selector(chatStoreState),
}));

vi.mock('@/stores/gateway', () => ({
  useGatewayStore: (selector: (state: typeof gatewayStoreState) => unknown) => selector(gatewayStoreState),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('TeamOverview page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    agentsStoreState.loading = false;
    agentsStoreState.error = null;
    agentsStoreState.agents = [];
    gatewayStoreState.status = { state: 'running', port: 18789 };
    chatStoreState.sessionLastActivity = {};
  });

  it('shows header and empty state when no agents exist', async () => {
    render(<TeamOverview />);
    await waitFor(() => {
      expect(agentsStoreState.fetchAgents).toHaveBeenCalled();
    });

    expect(screen.getByRole('heading', { name: 'teamOverview.title' })).toBeInTheDocument();
    expect(screen.getByText('teamOverview.summary')).toBeInTheDocument();
    expect(screen.getByText('teamOverview.empty.title')).toBeInTheDocument();
    expect(screen.getByText('teamOverview.empty.description')).toBeInTheDocument();
  });

  it('renders agent data and opens create modal', async () => {
    const agent: AgentSummary = {
      id: 'main',
      name: 'Navigator',
      persona: 'Guides the ships',
      isDefault: true,
      model: 'gpt-5.4',
      modelDisplay: 'GPT-5.4',
      inheritedModel: true,
      workspace: '~/workspace',
      agentDir: '~/agents/main',
      mainSessionKey: 'agent:main:main',
      channelTypes: ['feishu'],
      teamRole: 'leader',
      chatAccess: 'leader_only',
      responsibility: 'Coordinate team execution',
    };

    agentsStoreState.agents = [agent];
    chatStoreState.sessionLastActivity = { [agent.mainSessionKey]: Date.now() };

    render(<TeamOverview />);
    await waitFor(() => {
      expect(agentsStoreState.fetchAgents).toHaveBeenCalled();
    });

    expect(screen.getByText(agent.name)).toBeInTheDocument();
    expect(screen.getByText(agent.id)).toBeInTheDocument();
    expect(screen.getByText('teamOverview.defaultBadge')).toBeInTheDocument();
    expect(screen.getByText(agent.modelDisplay)).toBeInTheDocument();
    expect(screen.getByText('teamOverview.card.model')).toBeInTheDocument();
    expect(screen.getByText('teamOverview.card.lastActive')).toBeInTheDocument();
    expect(screen.getByText('teamOverview.time.justNow')).toBeInTheDocument();
    expect(screen.getByText('teamOverview.card.channels')).toBeInTheDocument();
    expect(screen.getByTitle('feishu')).toBeInTheDocument();
    expect(screen.getByText('teamOverview.card.inherited')).toBeInTheDocument();
    expect(screen.getByText('teamOverview.card.role')).toBeInTheDocument();
    expect(screen.getByText('teamOverview.role.leader')).toBeInTheDocument();
    expect(screen.getByText('teamOverview.card.access')).toBeInTheDocument();
    expect(screen.getByText('teamOverview.access.leader_only')).toBeInTheDocument();
    expect(screen.getByText('teamOverview.card.responsibility')).toBeInTheDocument();
    expect(screen.getByText('Coordinate team execution')).toBeInTheDocument();
    expect(screen.getByText('teamOverview.card.activity')).toBeInTheDocument();
    expect(screen.getByText('teamOverview.activity.active')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'teamOverview.hireButton' }));
    expect(screen.getByText('teamOverview.createModal.title')).toBeInTheDocument();
  });
});
