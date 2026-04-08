/**
 * Tests for permissions-enforcer module
 * Runs in jsdom environment; electron and fs modules are mocked.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock electron app before importing the module under test
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/mock/userData'),
  },
}));

// Mock fs/promises
const mockAppendFile = vi.fn().mockResolvedValue(undefined);
vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>();
  return {
    ...actual,
    appendFile: (...args: unknown[]) => mockAppendFile(...args),
  };
});

// Mock the store getSetting
const mockGetSetting = vi.fn();
vi.mock('@electron/utils/store', () => ({
  getSetting: (...args: unknown[]) => mockGetSetting(...args),
}));

// Mock logger
vi.mock('@electron/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

import {
  checkPermission,
  appendAuditLog,
  type PermissionAction,
  type AuditEntry,
} from '@electron/utils/permissions-enforcer';

describe('permissions-enforcer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: standard risk level, empty lists
    mockGetSetting.mockImplementation((key: string) => {
      if (key === 'globalRiskLevel') return Promise.resolve('standard');
      if (key === 'filePathAllowlist') return Promise.resolve([]);
      if (key === 'terminalCommandBlocklist') return Promise.resolve([]);
      return Promise.resolve(undefined);
    });
  });

  describe('checkPermission - strict risk level', () => {
    beforeEach(() => {
      mockGetSetting.mockImplementation((key: string) => {
        if (key === 'globalRiskLevel') return Promise.resolve('strict');
        if (key === 'filePathAllowlist') return Promise.resolve([]);
        if (key === 'terminalCommandBlocklist') return Promise.resolve([]);
        return Promise.resolve(undefined);
      });
    });

    it('blocks file:write when globalRiskLevel is strict', async () => {
      const result = await checkPermission('file:write', { path: '/some/file.txt' });
      expect(result).toBe('block');
    });

    it('blocks terminal:exec when globalRiskLevel is strict', async () => {
      const result = await checkPermission('terminal:exec', { command: 'ls -la' });
      expect(result).toBe('block');
    });

    it('blocks mcp:tool when globalRiskLevel is strict', async () => {
      const result = await checkPermission('mcp:tool', { tool: 'some-tool' });
      expect(result).toBe('block');
    });

    it('blocks network:fetch when globalRiskLevel is strict', async () => {
      const result = await checkPermission('network:fetch', { url: 'https://example.com' });
      expect(result).toBe('block');
    });

    it('allows file:read when globalRiskLevel is strict', async () => {
      const result = await checkPermission('file:read', { path: '/some/file.txt' });
      expect(result).toBe('allow');
    });
  });

  describe('checkPermission - standard risk level', () => {
    it('returns confirm for file:write when globalRiskLevel is standard', async () => {
      const result = await checkPermission('file:write', { path: '/some/file.txt' });
      expect(result).toBe('confirm');
    });

    it('returns allow for file:read when globalRiskLevel is standard', async () => {
      const result = await checkPermission('file:read', { path: '/some/file.txt' });
      expect(result).toBe('allow');
    });

    it('returns confirm for terminal:exec when globalRiskLevel is standard', async () => {
      const result = await checkPermission('terminal:exec', { command: 'npm install' });
      expect(result).toBe('confirm');
    });

    it('returns confirm for network:fetch when globalRiskLevel is standard', async () => {
      const result = await checkPermission('network:fetch', { url: 'https://example.com' });
      expect(result).toBe('confirm');
    });

    it('returns confirm for mcp:tool when globalRiskLevel is standard', async () => {
      const result = await checkPermission('mcp:tool', { tool: 'some-tool' });
      expect(result).toBe('confirm');
    });
  });

  describe('checkPermission - permissive risk level', () => {
    beforeEach(() => {
      mockGetSetting.mockImplementation((key: string) => {
        if (key === 'globalRiskLevel') return Promise.resolve('permissive');
        if (key === 'filePathAllowlist') return Promise.resolve([]);
        if (key === 'terminalCommandBlocklist') return Promise.resolve([]);
        return Promise.resolve(undefined);
      });
    });

    it('allows network:fetch when globalRiskLevel is permissive', async () => {
      const result = await checkPermission('network:fetch', { url: 'https://example.com' });
      expect(result).toBe('allow');
    });

    it('allows file:write when globalRiskLevel is permissive', async () => {
      const result = await checkPermission('file:write', { path: '/some/file.txt' });
      expect(result).toBe('allow');
    });

    it('allows terminal:exec when globalRiskLevel is permissive', async () => {
      const result = await checkPermission('terminal:exec', { command: 'rm -rf /' });
      expect(result).toBe('allow');
    });
  });

  describe('filePathAllowlist override', () => {
    it('blocks file:write for paths NOT in allowlist when allowlist is non-empty', async () => {
      mockGetSetting.mockImplementation((key: string) => {
        if (key === 'globalRiskLevel') return Promise.resolve('permissive');
        if (key === 'filePathAllowlist') return Promise.resolve(['/allowed/path']);
        if (key === 'terminalCommandBlocklist') return Promise.resolve([]);
        return Promise.resolve(undefined);
      });
      const result = await checkPermission('file:write', { path: '/not/allowed/file.txt' });
      expect(result).toBe('block');
    });

    it('allows file:write for paths IN allowlist regardless of risk level', async () => {
      mockGetSetting.mockImplementation((key: string) => {
        if (key === 'globalRiskLevel') return Promise.resolve('strict');
        if (key === 'filePathAllowlist') return Promise.resolve(['/allowed/path']);
        if (key === 'terminalCommandBlocklist') return Promise.resolve([]);
        return Promise.resolve(undefined);
      });
      // Even in strict mode, if path is in allowlist it should not be blocked by allowlist
      // (allowlist overrides the block for that specific path)
      const result = await checkPermission('file:write', { path: '/allowed/path/file.txt' });
      // In strict mode, allowlist paths are still allowed (allowlist is a whitelist)
      expect(result).toBe('allow');
    });

    it('does not apply allowlist to non-file:write actions', async () => {
      mockGetSetting.mockImplementation((key: string) => {
        if (key === 'globalRiskLevel') return Promise.resolve('standard');
        if (key === 'filePathAllowlist') return Promise.resolve(['/allowed/path']);
        if (key === 'terminalCommandBlocklist') return Promise.resolve([]);
        return Promise.resolve(undefined);
      });
      const result = await checkPermission('file:read', { path: '/not/allowed/file.txt' });
      expect(result).toBe('allow');
    });
  });

  describe('terminalCommandBlocklist override', () => {
    it('blocks terminal:exec for commands matching blocklist regardless of risk level', async () => {
      mockGetSetting.mockImplementation((key: string) => {
        if (key === 'globalRiskLevel') return Promise.resolve('permissive');
        if (key === 'filePathAllowlist') return Promise.resolve([]);
        if (key === 'terminalCommandBlocklist') return Promise.resolve(['rm -rf']);
        return Promise.resolve(undefined);
      });
      const result = await checkPermission('terminal:exec', { command: 'rm -rf /' });
      expect(result).toBe('block');
    });

    it('allows terminal:exec for commands NOT in blocklist', async () => {
      mockGetSetting.mockImplementation((key: string) => {
        if (key === 'globalRiskLevel') return Promise.resolve('permissive');
        if (key === 'filePathAllowlist') return Promise.resolve([]);
        if (key === 'terminalCommandBlocklist') return Promise.resolve(['rm -rf']);
        return Promise.resolve(undefined);
      });
      const result = await checkPermission('terminal:exec', { command: 'npm install' });
      expect(result).toBe('allow');
    });
  });

  describe('appendAuditLog', () => {
    it('writes a JSON line to permissions-audit.jsonl', async () => {
      const entry: AuditEntry = {
        timestamp: '2026-04-08T00:00:00.000Z',
        action: 'file:write',
        result: 'block',
        context: { path: '/some/file.txt' },
        globalRiskLevel: 'strict',
      };
      await appendAuditLog(entry);
      expect(mockAppendFile).toHaveBeenCalledWith(
        expect.stringContaining('permissions-audit.jsonl'),
        expect.stringContaining('"action":"file:write"'),
        'utf8',
      );
    });

    it('includes all required fields in the audit entry', async () => {
      const entry: AuditEntry = {
        timestamp: '2026-04-08T00:00:00.000Z',
        action: 'terminal:exec',
        result: 'allow',
        context: { command: 'ls -la' },
        globalRiskLevel: 'permissive',
      };
      await appendAuditLog(entry);
      const writtenContent = mockAppendFile.mock.calls[0][1] as string;
      const parsed = JSON.parse(writtenContent.trim());
      expect(parsed).toMatchObject({
        timestamp: '2026-04-08T00:00:00.000Z',
        action: 'terminal:exec',
        result: 'allow',
        context: { command: 'ls -la' },
        globalRiskLevel: 'permissive',
      });
    });

    it('does not throw when appendFile fails', async () => {
      mockAppendFile.mockRejectedValueOnce(new Error('disk full'));
      const entry: AuditEntry = {
        timestamp: '2026-04-08T00:00:00.000Z',
        action: 'mcp:tool',
        result: 'block',
        context: { tool: 'some-tool' },
        globalRiskLevel: 'strict',
      };
      await expect(appendAuditLog(entry)).resolves.not.toThrow();
    });
  });

  describe('checkPermission writes audit log', () => {
    it('calls appendAuditLog after each permission check', async () => {
      await checkPermission('file:write', { path: '/test.txt' });
      expect(mockAppendFile).toHaveBeenCalledTimes(1);
      const writtenContent = mockAppendFile.mock.calls[0][1] as string;
      const parsed = JSON.parse(writtenContent.trim());
      expect(parsed).toMatchObject({
        action: 'file:write',
        result: 'confirm',
        globalRiskLevel: 'standard',
      });
    });
  });
});
