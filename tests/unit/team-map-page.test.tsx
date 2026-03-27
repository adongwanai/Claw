import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AgentSummary } from '@/types/agent';
import { TeamMap } from '@/pages/TeamMap';

const { agentsStoreState, chatStoreState } = vi.hoisted(() => ({
  agentsStoreState: {
    agents: [] as AgentSummary[],
    loading: false,
    defaultAgentId: 'main',
    fetchAgents: vi.fn(async () => {}),
  },
  chatStoreState: {
    sessionLastActivity: {} as Record<string, number>,
  },
}));

vi.mock('@/stores/agents', () => ({
  useAgentsStore: () => agentsStoreState,
}));

vi.mock('@/stores/chat', () => ({
  useChatStore: (selector: (state: typeof chatStoreState) => unknown) => selector(chatStoreState),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('TeamMap page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    agentsStoreState.loading = false;
    agentsStoreState.defaultAgentId = 'main';
    agentsStoreState.agents = [
      {
        id: 'main',
        name: 'Main',
        persona: 'Primary agent',
        isDefault: true,
        model: 'gpt-5.4',
        modelDisplay: 'GPT-5.4',
        inheritedModel: false,
        workspace: '~/workspace',
        agentDir: '~/agents/main',
        mainSessionKey: 'agent:main:main',
        channelTypes: ['feishu'],
        teamRole: 'leader',
        chatAccess: 'direct',
        responsibility: 'Coordinate team operations',
      },
      {
        id: 'researcher',
        name: 'Researcher',
        persona: 'Finds information',
        isDefault: false,
        model: 'claude-sonnet-4',
        modelDisplay: 'Claude Sonnet 4',
        inheritedModel: true,
        workspace: '~/workspace-researcher',
        agentDir: '~/agents/researcher',
        mainSessionKey: 'agent:researcher:main',
        channelTypes: ['telegram'],
        teamRole: 'worker',
        chatAccess: 'leader_only',
        responsibility: 'Finds information',
      },
    ];
    chatStoreState.sessionLastActivity = {
      'agent:main:main': Date.now(),
      'agent:researcher:main': Date.now(),
    };
  });

  it('renders hierarchy, switches to teams view, and opens the detail drawer', async () => {
    render(<TeamMap />);

    await waitFor(() => {
      expect(agentsStoreState.fetchAgents).toHaveBeenCalled();
    });

    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(screen.getByText('Researcher')).toBeInTheDocument();
    expect(screen.getAllByText('teamMap.status.active').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText('Researcher'));
    expect(screen.getByText('teamMap.drawer.title')).toBeInTheDocument();
    expect(screen.getByText('teamMap.drawer.model')).toBeInTheDocument();
    expect(screen.getByText('teamMap.drawer.role')).toBeInTheDocument();
    expect(screen.getAllByText('teamMap.role.worker').length).toBeGreaterThan(0);
    expect(screen.getByText('teamMap.drawer.access')).toBeInTheDocument();
    expect(screen.getAllByText('teamMap.access.leader_only').length).toBeGreaterThan(0);
    expect(screen.getByText('teamMap.drawer.responsibility')).toBeInTheDocument();
    expect(screen.getByText('Finds information')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'teamMap.tabs.teams' }));
    expect(screen.getByText('teamMap.allGroup')).toBeInTheDocument();
  });
});
