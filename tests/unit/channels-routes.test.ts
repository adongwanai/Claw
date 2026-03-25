import type { IncomingMessage, ServerResponse } from 'http';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  sendJson: vi.fn(),
  listConfiguredChannels: vi.fn(async () => ['feishu']),
}));

vi.mock('@electron/api/route-utils', () => ({
  sendJson: mocks.sendJson,
  parseJsonBody: vi.fn(),
}));

vi.mock('@electron/utils/channel-config', () => ({
  listConfiguredChannels: mocks.listConfiguredChannels,
  deleteChannelConfig: vi.fn(),
  getChannelFormValues: vi.fn(),
  saveChannelConfig: vi.fn(),
  setChannelEnabled: vi.fn(),
  validateChannelConfig: vi.fn(),
  validateChannelCredentials: vi.fn(),
}));

vi.mock('@electron/utils/agent-config', () => ({
  assignChannelToAgent: vi.fn(),
  clearAllBindingsForChannel: vi.fn(),
}));

vi.mock('@electron/utils/whatsapp-login', () => ({
  whatsAppLoginManager: {
    start: vi.fn(),
    stop: vi.fn(),
  },
}));

vi.mock('electron', () => ({
  app: {
    isPackaged: false,
    getAppPath: () => 'C:/test-app',
  },
}));

function createRequest(method: string): IncomingMessage {
  return { method } as IncomingMessage;
}

describe('channels routes', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('returns normalized runtime capabilities for configured channels', async () => {
    const { handleChannelRoutes } = await import('@electron/api/routes/channels');
    const ctx = {
      gatewayManager: {
        getStatus: () => ({ state: 'running', port: 18789 }),
        rpc: vi.fn(async (method: string) => {
          if (method === 'channels.status') {
            return {
              channels: {
                feishu: { configured: true, running: true },
              },
              channelAccounts: {
                feishu: [
                  {
                    accountId: 'default',
                    configured: true,
                    connected: true,
                  },
                ],
              },
              channelDefaultAccountId: {
                feishu: 'default',
              },
            };
          }
          throw new Error(`Unexpected RPC method: ${method}`);
        }),
        debouncedRestart: vi.fn(),
        debouncedReload: vi.fn(),
      },
    } as never;

    const handled = await handleChannelRoutes(
      createRequest('GET'),
      {} as ServerResponse,
      new URL('http://127.0.0.1:3210/api/channels/capabilities'),
      ctx,
    );

    expect(handled).toBe(true);
    expect(mocks.sendJson).toHaveBeenLastCalledWith(expect.anything(), 200, {
      success: true,
      capabilities: [
        expect.objectContaining({
          channelId: 'feishu-default',
          channelType: 'feishu',
          status: 'connected',
          availableActions: ['disconnect', 'test', 'send', 'configure'],
          capabilityFlags: expect.objectContaining({
            supportsSchemaSummary: true,
          }),
          configSchemaSummary: expect.objectContaining({
            totalFieldCount: 2,
            requiredFieldCount: 2,
          }),
        }),
      ],
    });
  });
});
