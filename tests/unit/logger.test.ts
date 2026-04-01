// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('electron', () => ({
  app: {
    isPackaged: false,
    getPath: vi.fn(() => 'C:/Users/test/AppData/Roaming/KTClaw-dev'),
    getVersion: vi.fn(() => '0.0.0-test'),
  },
}));

describe('logger', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('does not throw when console.info fails with broken pipe', async () => {
    const logger = await import('@electron/utils/logger');
    logger.setLogLevel(logger.LogLevel.INFO);

    const brokenPipe = Object.assign(new Error('EPIPE: broken pipe, write'), { code: 'EPIPE' });
    vi.spyOn(console, 'info').mockImplementation(() => {
      throw brokenPipe;
    });

    expect(() => logger.info('startup log')).not.toThrow();
    expect(logger.getRecentLogs()).toEqual(
      expect.arrayContaining([expect.stringContaining('startup log')]),
    );
  });

  it('does not throw when console.debug fails with broken pipe', async () => {
    const logger = await import('@electron/utils/logger');
    logger.setLogLevel(logger.LogLevel.DEBUG);

    const brokenPipe = Object.assign(new Error('EPIPE: broken pipe, write'), { code: 'EPIPE' });
    vi.spyOn(console, 'debug').mockImplementation(() => {
      throw brokenPipe;
    });

    expect(() => logger.debug('gateway state change')).not.toThrow();
    expect(logger.getRecentLogs()).toEqual(
      expect.arrayContaining([expect.stringContaining('gateway state change')]),
    );
  });
});
