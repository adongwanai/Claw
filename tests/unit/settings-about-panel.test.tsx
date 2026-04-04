import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsAboutPanel } from '@/components/settings-center/settings-about-panel';

const {
  hostApiFetchMock,
  invokeIpcMock,
  clipboardWriteText,
  settingsState,
  updateState,
} = vi.hoisted(() => ({
  hostApiFetchMock: vi.fn(),
  invokeIpcMock: vi.fn(),
  clipboardWriteText: vi.fn(),
  settingsState: {
    devModeUnlocked: false,
    setDevModeUnlocked: vi.fn(),
    remoteRpcEnabled: false,
    setRemoteRpcEnabled: vi.fn(),
    p2pSyncEnabled: false,
    setP2pSyncEnabled: vi.fn(),
    telemetryEnabled: true,
    setTelemetryEnabled: vi.fn(),
  },
  updateState: {
    currentVersion: '1.0.0',
  },
}));

vi.mock('@/lib/host-api', () => ({
  hostApiFetch: hostApiFetchMock,
}));

vi.mock('@/lib/api-client', () => ({
  invokeIpc: invokeIpcMock,
}));

vi.mock('@/stores/settings', () => ({
  useSettingsStore: (selector: (state: typeof settingsState) => unknown) => selector(settingsState),
}));

vi.mock('@/stores/update', () => ({
  useUpdateStore: (selector: (state: typeof updateState) => unknown) => selector(updateState),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? _key,
  }),
}));

describe('SettingsAboutPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hostApiFetchMock.mockResolvedValue({ success: true, exitCode: 0 });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: clipboardWriteText },
    });
  });

  it('renders product information while keeping diagnostics behind folded subsections', () => {
    render(<SettingsAboutPanel onRerunSetup={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'KTClaw' })).toBeInTheDocument();
    expect(screen.getByText(/Graphical AI assistant for OpenClaw teams/i)).toBeInTheDocument();
    expect(screen.getByText(/Version 1.0.0/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Developer Diagnostics' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Maintenance & Recovery' })).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: 'Run Doctor' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reset All Settings' })).not.toBeInTheDocument();
  });

  it('runs doctor actions and developer controls from the diagnostics subsection', async () => {
    render(<SettingsAboutPanel onRerunSetup={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Developer Diagnostics' }));

    fireEvent.click(screen.getByRole('button', { name: 'Run Doctor' }));
    await waitFor(() => {
      expect(hostApiFetchMock).toHaveBeenCalledWith(
        '/api/app/openclaw-doctor',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ mode: 'diagnose' }),
        }),
      );
    });

    fireEvent.click(screen.getByRole('button', { name: 'Run Doctor Fix' }));
    await waitFor(() => {
      expect(hostApiFetchMock).toHaveBeenCalledWith(
        '/api/app/openclaw-doctor',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ mode: 'fix' }),
        }),
      );
    });

    fireEvent.click(screen.getByRole('switch', { name: 'Developer Mode' }));
    expect(settingsState.setDevModeUnlocked).toHaveBeenCalledWith(true);

    fireEvent.click(screen.getByRole('switch', { name: 'Remote RPC access' }));
    expect(settingsState.setRemoteRpcEnabled).toHaveBeenCalledWith(true);

    fireEvent.click(screen.getByRole('switch', { name: 'Anonymous telemetry' }));
    expect(settingsState.setTelemetryEnabled).toHaveBeenCalledWith(false);
  });

  it('provides feedback, environment copy, and maintenance actions inside About', async () => {
    const onRerunSetup = vi.fn();
    render(<SettingsAboutPanel onRerunSetup={onRerunSetup} />);

    fireEvent.click(screen.getByRole('button', { name: 'Report an issue' }));
    expect(invokeIpcMock).toHaveBeenCalledWith(
      'shell:openExternal',
      'https://github.com/anthropics/claude-code/issues',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Copy environment summary' }));
    expect(clipboardWriteText).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Maintenance & Recovery' }));
    fireEvent.click(screen.getByRole('button', { name: 'Re-run Setup' }));
    expect(onRerunSetup).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: 'Reset All Settings' }));
    await waitFor(() => {
      expect(hostApiFetchMock).toHaveBeenCalledWith(
        '/api/settings/reset',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    fireEvent.click(screen.getByRole('button', { name: 'Clear Server Data' }));
    await waitFor(() => {
      expect(hostApiFetchMock).toHaveBeenCalledWith(
        '/api/app/clear-server-data',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });
});
