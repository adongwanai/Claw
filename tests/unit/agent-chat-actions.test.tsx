import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AgentSummary } from '@/types/agent';
import type { TeamSummary } from '@/types/team';
import { Agents } from '@/pages/Agents';
import { toast } from 'sonner';

const navigateMock = vi.fn();

type AgentsStoreState = {
  agents: AgentSummary[];
  loading: boolean;
  error: string | null;
  fetchAgents: ReturnType<typeof vi.fn>;
  createAgent: ReturnType<typeof vi.fn>;
  deleteAgent: ReturnType<typeof vi.fn>;
};

const { agentsStoreState, teamsStoreState, channelsStoreState, chatStoreState } = vi.hoisted(() => ({
  agentsStoreState: {
    agents: [] as AgentSummary[],
    loading: false,
    error: null as string | null,
    fetchAgents: vi.fn(async () => undefined),
    createAgent: vi.fn(async () => ({ createdAgentId: 'new-agent' })),
    deleteAgent: vi.fn(async () => undefined),
  } satisfies AgentsStoreState,
  teamsStoreState: {
    teams: [] as TeamSummary[],
    loading: false,
    error: null as string | null,
    fetchTeams: vi.fn(async () => undefined),
  },
  channelsStoreState: {
    channels: [],
    fetchChannels: vi.fn(async () => undefined),
  },
  chatStoreState: {
    sessionLastActivity: {} as Record<string, number>,
    openDirectAgentSession: vi.fn(() => 'agent:main:private-main'),
  },
}));

vi.mock('@/stores/agents', () => ({
  useAgentsStore: () => agentsStoreState,
}));

vi.mock('@/stores/teams', () => ({
  useTeamsStore: () => teamsStoreState,
}));

vi.mock('@/stores/channels', () => ({
  useChannelsStore: () => channelsStoreState,
}));

vi.mock('@/stores/chat', () => ({
  useChatStore: (selector: (state: typeof chatStoreState) => unknown) => selector(chatStoreState),
}));

vi.mock('@/stores/gateway', () => ({
  useGatewayStore: (selector: (state: { status: { state: string } }) => unknown) =>
    selector({ status: { state: 'running' } }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      const copy: Record<string, string> = {
        title: 'Employee Square',
        subtitle: 'Browse, create, and route into every agent from one square.',
        refresh: 'Refresh',
        addAgent: 'Add Agent',
        gatewayWarning: 'Gateway warning',
        'square.stats.all': 'All Agents',
        'square.stats.leaders': 'Leaders',
        'square.stats.workers': 'Workers',
        'square.filters.all': 'All',
        'square.filters.leader': 'Leaders',
        'square.filters.worker': 'Workers',
        'square.filters.direct': 'Direct Chat',
        'square.filters.leader_only': 'Leader Only',
        'square.filters.with_team': 'With Team',
        'square.actions.chat': 'Chat',
        'square.actions.memory': 'Memory',
        'square.actions.details': 'Details',
      };

      if (key in copy) {
        return copy[key];
      }

      return String(options?.defaultValue ?? key);
    },
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function createAgent(overrides: Partial<AgentSummary>): AgentSummary {
  return {
    id: 'main',
    name: 'Main',
    persona: 'Coordinates the team',
    isDefault: false,
    model: 'openai/gpt-5.4',
    modelDisplay: 'GPT-5.4',
    inheritedModel: false,
    workspace: '~/.openclaw/workspace',
    agentDir: '~/.openclaw/agents/main/agent',
    mainSessionKey: 'agent:main:main',
    channelTypes: ['feishu'],
    avatar: null,
    teamRole: 'leader',
    chatAccess: 'direct',
    responsibility: 'Coordinate work',
    reportsTo: null,
    directReports: [],
    ...overrides,
  };
}

function getCard(name: string): HTMLElement {
  const heading = screen.getByText(name);
  const card = heading.closest('article');
  if (!card) {
    throw new Error(`Card not found for ${name}`);
  }
  return card;
}

describe('Employee Square card actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    agentsStoreState.agents = [
      createAgent({ id: 'main', name: 'Main', mainSessionKey: 'agent:main:main' }),
      createAgent({
        id: 'researcher',
        name: 'Researcher',
        teamRole: 'worker',
        chatAccess: 'leader_only',
        mainSessionKey: 'agent:researcher:main',
      }),
    ];

    teamsStoreState.teams = [
      {
        id: 'team-alpha',
        name: 'Alpha Team',
        leaderId: 'main',
        memberIds: ['researcher'],
        description: '',
        status: 'active',
        createdAt: 1,
        updatedAt: 1,
        memberCount: 2,
        activeTaskCount: 1,
        lastActiveTime: undefined,
        leaderName: 'Main',
        memberAvatars: [],
      },
    ];

    chatStoreState.sessionLastActivity = {
      'agent:main:main': Date.now(),
      'agent:researcher:main': Date.now(),
    };
    chatStoreState.openDirectAgentSession.mockImplementation(() => 'agent:main:private-main');
  });

  it('launches direct chat and navigates to the unified chat surface', async () => {
    render(
      <MemoryRouter>
        <Agents />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(agentsStoreState.fetchAgents).toHaveBeenCalled();
    });

    fireEvent.click(within(getCard('Main')).getByRole('button', { name: 'Chat' }));

    expect(chatStoreState.openDirectAgentSession).toHaveBeenCalledWith('main');
    expect(navigateMock).toHaveBeenCalledWith('/');
  });

  it('routes Memory and Details actions into the agent detail route', async () => {
    render(
      <MemoryRouter>
        <Agents />
      </MemoryRouter>,
    );

    await screen.findByText('Main');

    fireEvent.click(within(getCard('Main')).getByRole('button', { name: 'Memory' }));
    fireEvent.click(within(getCard('Main')).getByRole('button', { name: 'Details' }));

    expect(navigateMock).toHaveBeenNthCalledWith(1, '/agents/main?tab=memory');
    expect(navigateMock).toHaveBeenNthCalledWith(2, '/agents/main');
  });

  it('surfaces leader-only chat errors through a toast instead of routing', async () => {
    chatStoreState.openDirectAgentSession.mockImplementation(() => {
      throw new Error('Leader route required');
    });

    render(
      <MemoryRouter>
        <Agents />
      </MemoryRouter>,
    );

    await screen.findByText('Researcher');

    fireEvent.click(within(getCard('Researcher')).getByRole('button', { name: 'Chat' }));

    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Leader route required'));
    expect(navigateMock).not.toHaveBeenCalledWith('/');
  });
});
