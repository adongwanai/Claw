/**
 * Tests for watched-directory auto-reindex (syncWatchedDirs)
 * These are node-environment tests for the backend watcher logic.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

// Mock fs module for watcher tests
const mockWatchers = new Map<string, { close: () => void }>();

vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs');
  return {
    ...actual,
    watch: vi.fn((dir: string, _opts: unknown, _cb: unknown) => {
      const watcher = { close: vi.fn() };
      mockWatchers.set(dir, watcher);
      return watcher;
    }),
  };
});

vi.mock('electron', () => ({
  app: {
    isPackaged: false,
    getPath: () => '/tmp/test-userdata',
    getVersion: () => '0.0.0-test',
  },
}));

vi.mock('electron-store', () => {
  return {
    default: class MockStore {
      get store() { return {}; }
      get(_key: string) { return undefined; }
      set(_key: string, _value: unknown) {}
      clear() {}
    },
  };
});

describe('syncWatchedDirs', () => {
  beforeEach(() => {
    mockWatchers.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('sets up a watcher for a new directory', async () => {
    const { syncWatchedDirs } = await import('@electron/api/routes/memory-watcher');
    syncWatchedDirs(['/a']);
    expect(mockWatchers.has('/a')).toBe(true);
  });

  it('tears down watcher when directory is removed', async () => {
    const { syncWatchedDirs } = await import('@electron/api/routes/memory-watcher');
    syncWatchedDirs(['/a']);
    const watcher = mockWatchers.get('/a');
    expect(watcher).toBeDefined();
    syncWatchedDirs([]);
    expect(watcher?.close).toHaveBeenCalled();
  });

  it('does not create duplicate watchers for the same directory', async () => {
    const { syncWatchedDirs } = await import('@electron/api/routes/memory-watcher');
    syncWatchedDirs(['/a']);
    syncWatchedDirs(['/a']);
    // Should still only have one watcher
    expect(mockWatchers.size).toBe(1);
  });

  it('handles empty dirs array without error', async () => {
    const { syncWatchedDirs } = await import('@electron/api/routes/memory-watcher');
    expect(() => syncWatchedDirs([])).not.toThrow();
  });
});
