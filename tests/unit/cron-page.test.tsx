import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Cron } from '@/pages/Cron';

const hostApiFetchMock = vi.fn();

const jobs = [
  {
    id: 'job-release-check',
    name: 'Release Check',
    message: 'Generate release readiness summary',
    schedule: { kind: 'cron', expr: '0 9 * * 1', tz: 'Asia/Shanghai' },
    enabled: true,
    createdAt: '2026-03-24T08:00:00.000Z',
    updatedAt: '2026-03-24T08:30:00.000Z',
    nextRun: '2026-03-31T01:00:00.000Z',
    sessionTarget: 'isolated',
    delivery: { mode: 'announce', channel: 'feishu', to: 'release-room' },
    lastRun: {
      time: '2026-03-24T08:10:00.000Z',
      success: false,
      error: 'Channel delivery failed: feishu webhook timeout',
      duration: 4200,
    },
  },
  {
    id: 'job-daily-digest',
    name: 'Daily Digest',
    message: 'Summarize yesterday updates',
    schedule: '0 7 * * *',
    enabled: true,
    createdAt: '2026-03-24T07:00:00.000Z',
    updatedAt: '2026-03-24T07:10:00.000Z',
    nextRun: '2026-03-25T07:00:00.000Z',
    sessionTarget: 'isolated',
    delivery: { mode: 'none' },
    lastRun: {
      time: '2026-03-24T07:05:00.000Z',
      success: true,
      duration: 1500,
    },
  },
];

const cronStoreState = {
  jobs,
  loading: false,
  error: null as string | null,
  fetchJobs: vi.fn(async () => {}),
  createJob: vi.fn(async () => jobs[0]),
  updateJob: vi.fn(async () => {}),
  deleteJob: vi.fn(async () => {}),
  toggleJob: vi.fn(async () => {}),
  triggerJob: vi.fn(async () => {}),
  setJobs: vi.fn(),
};

vi.mock('@/stores/cron', () => ({
  useCronStore: (selector?: (state: typeof cronStoreState) => unknown) =>
    typeof selector === 'function' ? selector(cronStoreState) : cronStoreState,
}));

vi.mock('@/lib/host-api', () => ({
  hostApiFetch: hostApiFetchMock,
}));

describe('Cron page richer detail views', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hostApiFetchMock.mockResolvedValue({
      runs: [
        {
          sessionId: 'run-1',
          status: 'error',
          summary: 'Feishu delivery did not acknowledge within timeout window',
          error: 'webhook timeout',
          durationMs: 4200,
          ts: Date.parse('2026-03-24T08:10:00.000Z'),
          model: 'glm-5-turbo',
          provider: 'zhipu',
        },
      ],
    });
  });

  it('shows delivery and failure context in the overview cards', () => {
    render(<Cron />);

    expect(screen.getByText('Release Check')).toBeInTheDocument();
    expect(screen.getByText(/Delivery: feishu/i)).toBeInTheDocument();
    expect(screen.getByText(/release-room/i)).toBeInTheDocument();
    expect(screen.getByText(/Channel delivery failed/i)).toBeInTheDocument();
  });

  it('opens a richer detail panel from pipelines and loads run context', async () => {
    render(<Cron />);

    fireEvent.click(screen.getByRole('button', { name: '流水线 Pipelines' }));
    fireEvent.click(screen.getAllByRole('button', { name: '详情' })[0]);

    expect(await screen.findByText('运行详情')).toBeInTheDocument();
    expect(screen.getByText(/Delivery: feishu/i)).toBeInTheDocument();
    expect(screen.getByText('isolated')).toBeInTheDocument();

    await waitFor(() => {
      expect(hostApiFetchMock).toHaveBeenCalledWith('/api/cron/runs/job-release-check');
    });
    expect(screen.getByText(/glm-5-turbo/i)).toBeInTheDocument();
    expect(screen.getByText(/Feishu delivery did not acknowledge/i)).toBeInTheDocument();
  });
});
