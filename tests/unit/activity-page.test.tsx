import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Activity } from '@/pages/Activity';
import { hostApiFetch } from '@/lib/host-api';

vi.mock('@/lib/host-api', () => ({
  hostApiFetch: vi.fn(),
}));

function createDeferred<T>() {
  let resolve: (value: T) => void;
  let reject: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve: resolve!, reject: reject! };
}

describe('Activity page structured log view', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('parses logs, shows summary cards, supports filters, and toggles raw details', async () => {
    const deferred = createDeferred<{ content: string }>();
    vi.mocked(hostApiFetch).mockReturnValueOnce(deferred.promise);

    render(<Activity />);
    expect(screen.getByText('Loading activity logs...')).toBeInTheDocument();

    deferred.resolve({
      content: [
        '2026-03-24T10:00:00Z [INFO] System boot completed',
        '2026-03-24T10:01:10Z [WARN] cron heartbeat delayed by 12s',
        '2026-03-24T10:02:30Z [ERROR] agent planner failed: tool timeout',
        '2026-03-24T10:03:40Z [DEBUG] channel feishu inbound id=abc123',
      ].join('\n'),
    });

    expect(await screen.findByRole('heading', { name: 'Activity logs' })).toBeInTheDocument();
    expect(screen.getByText('Total entries')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Errors')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    const searchInput = screen.getByLabelText('Search logs');
    fireEvent.change(searchInput, { target: { value: 'planner' } });
    expect(screen.getByText('agent planner failed')).toBeInTheDocument();
    expect(screen.queryByText('System boot completed')).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: '' } });

    const categorySelect = screen.getByLabelText('Category filter');
    fireEvent.change(categorySelect, { target: { value: 'channel' } });
    expect(screen.getByText('channel feishu inbound id=abc123')).toBeInTheDocument();
    expect(screen.queryByText('cron heartbeat delayed by 12s')).not.toBeInTheDocument();

    fireEvent.change(categorySelect, { target: { value: 'error' } });
    expect(screen.getByText('agent planner failed')).toBeInTheDocument();
    expect(screen.queryByText('channel feishu inbound id=abc123')).not.toBeInTheDocument();

    fireEvent.change(categorySelect, { target: { value: 'all' } });

    const levelSelect = screen.getByLabelText('Level filter');
    fireEvent.change(levelSelect, { target: { value: 'error' } });
    expect(screen.getByText('agent planner failed')).toBeInTheDocument();
    expect(screen.queryByText('channel feishu inbound id=abc123')).not.toBeInTheDocument();

    fireEvent.change(levelSelect, { target: { value: 'all' } });

    const showRawButtons = await screen.findAllByRole('button', { name: 'Show raw' });
    fireEvent.click(showRawButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('Raw line')).toBeInTheDocument();
    });
    expect(screen.getByText('2026-03-24T10:00:00Z [INFO] System boot completed')).toBeInTheDocument();
  });

  it('groups multiline log continuations into a single structured entry', async () => {
    vi.mocked(hostApiFetch).mockResolvedValueOnce({
      content: [
        '2026-03-24T10:00:00Z [INFO] System boot completed',
        '2026-03-24T10:02:30Z [ERROR] agent planner failed: tool timeout',
        'Error: tool timeout while waiting for shell result',
        '    at runTool (planner.ts:42:13)',
      ].join('\n'),
    });

    render(<Activity />);

    expect(await screen.findByText('2')).toBeInTheDocument();
    expect(screen.getByText('agent planner failed')).toBeInTheDocument();

    const rawButtons = await screen.findAllByRole('button', { name: 'Show raw' });
    fireEvent.click(rawButtons[1]);

    expect(await screen.findByText(/Error: tool timeout while waiting for shell result/i)).toBeInTheDocument();
    expect(screen.getAllByText(/at runTool \(planner\.ts:42:13\)/i).length).toBeGreaterThan(0);
  });

  it('renders an empty state when api logs content is blank', async () => {
    vi.mocked(hostApiFetch).mockResolvedValueOnce({ content: '  \n  ' });

    render(<Activity />);

    expect(await screen.findByText('No activity logs found.')).toBeInTheDocument();
  });

  it('renders an error state when logs request fails', async () => {
    vi.mocked(hostApiFetch).mockRejectedValueOnce(new Error('network down'));

    render(<Activity />);

    expect(await screen.findByText('Failed to load activity logs.')).toBeInTheDocument();
    expect(screen.getByText('network down')).toBeInTheDocument();
  });
});
