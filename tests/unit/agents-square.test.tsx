import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Agents } from '@/pages/Agents';
import type { AgentSummary } from '@/types/agent';
import type { TeamSummary } from '@/types/team';

type AgentsStoreState = {
  agents: AgentSummary[];
  loading: boolean;
  error: string | null;
  fetchAgents: ReturnType<typeof vi.fn>;
  createAgent: ReturnType<typeof vi.fn>;
  deleteAgent: ReturnType<typeof vi.fn>;
};

type TeamsStoreState = {
  teams: TeamSummary[];
  loading: boolean;
  error: string | null;
  fetchTeams: ReturnType<typeof vi.fn>;
};

const { mockAgentsStore, mockTeamsStore, mockChannelsStore, mockChatState } = vi.hoisted(() => ({
  mockAgentsStore: {
    agents: [] as AgentSummary[],
    loading: false,
    error: null as string | null,
    fetchAgents: vi.fn(async () => undefined),
    createAgent: vi.fn(async () => ({ createdAgentId: 'new-agent' })),
    deleteAgent: vi.fn(async () => undefined),
  } satisfies AgentsStoreState,
  mockTeamsStore: {
    teams: [] as TeamSummary[],
    loading: false,
    error: null as string | null,
    fetchTeams: vi.fn(async () => undefined),
  } satisfies TeamsStoreState,
  mockChannelsStore: {
    channels: [],
    fetchChannels: vi.fn(async () => undefined),
  },
  mockChatState: {
    sessionLastActivity: {} as Record<string, number>,
  },
}));

vi.mock('@/stores/agents', () => ({
  useAgentsStore: () => mockAgentsStore,
}));

vi.mock('@/stores/teams', () => ({
  useTeamsStore: () => mockTeamsStore,
}));

vi.mock('@/stores/channels', () => ({
  useChannelsStore: () => mockChannelsStore,
}));

vi.mock('@/stores/chat', () => ({
  useChatStore: (selector: (state: typeof mockChatState) => unknown) => selector(mockChatState),
}));

vi.mock('@/stores/gateway', () => ({
  useGatewayStore: (selector: (state: { status: { state: string } }) => unknown) =>
    selector({ status: { state: 'running' } }),
}));

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
        'square.empty.title': 'No matching agents',
        'square.empty.description': 'Adjust the current filters.',
      };

      if (key in copy) {
        return copy[key];
      }

      return String(options?.defaultValue ?? key);
    },
  }),
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

function createTeam(overrides: Partial<TeamSummary>): TeamSummary {
  return {
    id: 'alpha',
    name: 'Alpha Team',
    leaderId: 'main',
    memberIds: ['alice'],
    description: '',
    status: 'active',
    createdAt: 1,
    updatedAt: 1,
    memberCount: 2,
    activeTaskCount: 1,
    lastActiveTime: undefined,
    leaderName: 'Main',
    memberAvatars: [],
    ...overrides,
  };
}

describe('Agents Employee Square page', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockAgentsStore.agents = [
      createAgent({
        id: 'main',
        name: 'Main',
        teamRole: 'leader',
        mainSessionKey: 'agent:main:main',
      }),
      createAgent({
        id: 'alice',
        name: 'Alice',
        teamRole: 'worker',
        mainSessionKey: 'agent:alice:main',
      }),
      createAgent({
        id: 'bravo',
        name: 'Bravo',
        teamRole: 'worker',
        chatAccess: 'leader_only',
        mainSessionKey: 'agent:bravo:main',
      }),
    ];

    mockTeamsStore.teams = [createTeam({ memberIds: ['alice'] })];
    mockChatState.sessionLastActivity = {
      'agent:main:main': Date.UTC(2026, 3, 3, 12, 0, 0) - 60_000,
      'agent:alice:main': Date.UTC(2026, 3, 3, 12, 0, 0) - 30_000,
    };
  });

  it('renders the Employee Square hero, filter strip, and card action labels', async () => {
    render(
      <MemoryRouter>
        <Agents />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockAgentsStore.fetchAgents).toHaveBeenCalled();
      expect(mockChannelsStore.fetchChannels).toHaveBeenCalled();
      expect(mockTeamsStore.fetchTeams).toHaveBeenCalled();
    });

    expect(screen.getByRole('heading', { name: 'Employee Square' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Leaders' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'With Team' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Chat' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Memory' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Details' }).length).toBeGreaterThan(0);
  });

  it('switches filters for leaders and agents with team membership', async () => {
    render(
      <MemoryRouter>
        <Agents />
      </MemoryRouter>,
    );

    await screen.findByText('Main');
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bravo')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Leaders' }));
    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    expect(screen.queryByText('Bravo')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'With Team' }));
    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Bravo')).not.toBeInTheDocument();
  });
});
