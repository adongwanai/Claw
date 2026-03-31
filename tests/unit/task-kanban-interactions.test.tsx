/**
 * Tests for TaskKanban interactions
 * Phase 02-03: Task card click and hover interactions
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskKanban from '@/pages/TaskKanban/index';
import { useApprovalsStore } from '@/stores/approvals';
import { useAgentsStore } from '@/stores/agents';
import { useRightPanelStore } from '@/stores/rightPanelStore';
import type { KanbanTask } from '@/types/task';
import type { AgentSummary } from '@/types/agent';

// Mock stores
vi.mock('@/stores/approvals');
vi.mock('@/stores/agents');
vi.mock('@/stores/rightPanelStore');

const mockTask: KanbanTask = {
  id: 'task-123',
  title: 'Test Task',
  description: 'Test description',
  status: 'todo',
  priority: 'high',
  assigneeId: 'agent-1',
  workState: 'working',
  isTeamTask: false,
  createdAt: '2026-03-31T10:00:00Z',
  updatedAt: '2026-03-31T12:00:00Z',
  runtimeSessionId: 'session-abc123',
};

const mockAgent: AgentSummary = {
  id: 'agent-1',
  name: 'Agent Alpha',
  model: 'claude-sonnet-4',
  modelDisplay: 'claude-sonnet-4',
  teamRole: 'worker',
  chatAccess: 'full',
};

describe('TaskKanban Interactions', () => {
  const mockOpenPanel = vi.fn();
  const mockFetchAgents = vi.fn();
  const mockFetchTasks = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useApprovalsStore).mockImplementation((selector: any) => {
      const state = {
        tasks: [mockTask],
        fetchTasks: mockFetchTasks,
      };
      return selector ? selector(state) : state;
    });

    vi.mocked(useAgentsStore).mockImplementation((selector: any) => {
      const state = {
        agents: [mockAgent],
        fetchAgents: mockFetchAgents,
      };
      return selector ? selector(state) : state;
    });

    vi.mocked(useRightPanelStore).mockImplementation((selector: any) => {
      const state = {
        openPanel: mockOpenPanel,
      };
      return selector ? selector(state) : state;
    });
  });

  it('should call openPanel with task type and taskId when task card is clicked', async () => {
    render(<TaskKanban />);

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    const taskCard = screen.getByText('Test Task').closest('div[class*="cursor-pointer"]');
    expect(taskCard).toBeInTheDocument();

    if (taskCard) {
      fireEvent.click(taskCard);
    }

    expect(mockOpenPanel).toHaveBeenCalledWith('task', 'task-123');
  });

  it('should wrap task card with tooltip component', async () => {
    render(<TaskKanban />);

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    // Verify the task card is wrapped in a tooltip trigger
    const taskCard = screen.getByText('Test Task').closest('div[class*="cursor-pointer"]');
    expect(taskCard).toBeInTheDocument();
    expect(taskCard?.getAttribute('data-state')).toBe('closed');
  });
});
