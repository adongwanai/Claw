// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  patchFeishuPluginCompatibilitySource,
  patchWeChatPluginCompatibilitySource,
} from '@electron/utils/wechat-plugin-compat';

describe('wechat plugin compatibility shim', () => {
  it('replaces normalizeAccountId sdk import with local shim', () => {
    const source = [
      'import type { OpenClawConfig } from "openclaw/plugin-sdk/core";',
      'import { normalizeAccountId } from "openclaw/plugin-sdk/account-id";',
      'const normalized = normalizeAccountId(accountId);',
    ].join('\n');

    const patched = patchWeChatPluginCompatibilitySource(source);

    expect(patched).toContain('KTClaw compatibility shim');
    expect(patched).not.toContain('openclaw/plugin-sdk/account-id');
    expect(patched).toContain('const normalized = normalizeAccountId(accountId);');
  });

  it('rewrites feishu runtime dynamic import to a static import compatible with Windows file URLs', () => {
    const source = [
      'import { FEISHU_CONFIG_JSON_SCHEMA } from \'../core/config-schema.js\';',
      'const pluginLog = larkLogger(\'channel/plugin\');',
      'async function startAccount() {',
      '  const { monitorFeishuProvider } = await import(\'./monitor.js\');',
      '  return monitorFeishuProvider({});',
      '}',
    ].join('\n');

    const patched = patchFeishuPluginCompatibilitySource(source);

    expect(patched).toContain("import { monitorFeishuProvider } from './monitor.js';");
    expect(patched).not.toContain("await import('./monitor.js')");
    expect(patched).toContain('return monitorFeishuProvider({});');
  });
});
