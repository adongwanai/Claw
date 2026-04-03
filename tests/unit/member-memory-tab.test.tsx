import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AgentSummary } from '@/types/agent';
import { hostApiFetch } from '@/lib/host-api';
import { MemberMemoryTab } from '@/components/team-map/MemberMemoryTab';

vi.mock('@/lib/host-api', () => ({
  hostApiFetch: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (options?.defaultValue && typeof options.defaultValue === 'string') {
        return options.defaultValue;
      }
      return key;
    },
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const agent: AgentSummary = {
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
  channelTypes: [],
  teamRole: 'worker',
  chatAccess: 'leader_only',
  responsibility: 'Finds information',
};

describe('MemberMemoryTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();

    vi.mocked(hostApiFetch).mockImplementation(async (path, init) => {
      if (path === '/api/memory?scope=researcher') {
        return {
          files: [
            {
              relativePath: 'MEMORY.md',
              label: 'MEMORY.md',
              content: 'Initial memory',
              lastModified: '2026-04-02T00:00:00.000Z',
            },
          ],
        };
      }

      if (path === '/api/memory/file' && init?.method === 'PUT') {
        return { ok: true };
      }

      if (path === '/api/memory/reindex' && init?.method === 'POST') {
        return { ok: true };
      }

      throw new Error(`Unexpected hostApiFetch call: ${String(path)}`);
    });
  });

  it('loads the current agent MEMORY.md from the scoped memory API', async () => {
    render(<MemberMemoryTab agent={agent} />);

    expect(await screen.findByDisplayValue('Initial memory')).toBeInTheDocument();
    expect(hostApiFetch).toHaveBeenCalledWith('/api/memory?scope=researcher');
  });

  it('autosaves MEMORY.md after 1500ms with the agent scope and save states', async () => {
    render(<MemberMemoryTab agent={agent} />);

    const textarea = await screen.findByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Updated memory' } });

    expect(screen.getByText('Saving...')).toBeInTheDocument();

    await new Promise((resolve) => setTimeout(resolve, 1600));
    await waitFor(() => {
      expect(hostApiFetch).toHaveBeenCalledWith(
        '/api/memory/file',
        expect.objectContaining({
          method: 'PUT',
        }),
      );
    });

    const putCall = vi.mocked(hostApiFetch).mock.calls.find(
      ([path, init]) => path === '/api/memory/file' && init?.method === 'PUT',
    );
    const payload = JSON.parse(String(putCall?.[1]?.body));
    expect(payload).toEqual({
      relativePath: 'MEMORY.md',
      content: 'Updated memory',
      scope: 'researcher',
      expectedMtime: '2026-04-02T00:00:00.000Z',
    });

    await waitFor(() => {
      expect(screen.getByText('Synced')).toBeInTheDocument();
    });
  });
});
