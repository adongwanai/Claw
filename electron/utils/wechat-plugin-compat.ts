import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const NORMALIZE_IMPORT = 'import { normalizeAccountId } from "openclaw/plugin-sdk/account-id";';
const SHIM_MARKER = '// KTClaw compatibility shim for OpenClaw 2026.3.22';
const NORMALIZE_SHIM = `${SHIM_MARKER}
function normalizeAccountId(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  const normalized = trimmed
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+/g, "")
    .replace(/-+$/g, "");
  return normalized || "default";
}`;

export function patchWeChatPluginCompatibilitySource(source: string): string {
  if (!source.includes(NORMALIZE_IMPORT)) {
    return source;
  }
  if (source.includes(SHIM_MARKER)) {
    return source;
  }
  return source.replace(NORMALIZE_IMPORT, NORMALIZE_SHIM);
}

export function patchInstalledWeChatPluginCompatibility(pluginRoot: string): boolean {
  const candidateFiles = [
    join(pluginRoot, 'src', 'channel.ts'),
    join(pluginRoot, 'src', 'channel.js'),
  ];

  let patched = false;
  for (const filePath of candidateFiles) {
    if (!existsSync(filePath)) continue;
    const original = readFileSync(filePath, 'utf8');
    const next = patchWeChatPluginCompatibilitySource(original);
    if (next !== original) {
      writeFileSync(filePath, next, 'utf8');
      patched = true;
    }
  }

  return patched;
}

const FEISHU_NORMALIZE_IMPORT = "import { DEFAULT_ACCOUNT_ID, normalizeAccountId } from 'openclaw/plugin-sdk';";
const FEISHU_PLUGIN_IMPORT_JS = "import { FEISHU_CONFIG_JSON_SCHEMA } from '../core/config-schema.js';";
const FEISHU_PLUGIN_IMPORT_TS = "import { FEISHU_CONFIG_JSON_SCHEMA } from '../core/config-schema';";
const FEISHU_MONITOR_STATIC_IMPORT_JS = "import { monitorFeishuProvider } from './monitor.js';";
const FEISHU_MONITOR_STATIC_IMPORT_TS = "import { monitorFeishuProvider } from './monitor';";
const FEISHU_MONITOR_DYNAMIC_IMPORT_JS = "const { monitorFeishuProvider } = await import('./monitor.js');";
const FEISHU_MONITOR_DYNAMIC_IMPORT_TS = "const { monitorFeishuProvider } = await import('./monitor');";
const FEISHU_NORMALIZE_SHIM = `${SHIM_MARKER}
const DEFAULT_ACCOUNT_ID = 'default';
function normalizeAccountId(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  const normalized = trimmed
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+/g, '')
    .replace(/-+$/g, '');
  return normalized || DEFAULT_ACCOUNT_ID;
}`;

export function patchFeishuPluginCompatibilitySource(source: string): string {
  let next = source;

  if (next.includes(FEISHU_NORMALIZE_IMPORT) && !next.includes(SHIM_MARKER)) {
    next = next.replace(FEISHU_NORMALIZE_IMPORT, FEISHU_NORMALIZE_SHIM);
  }

  if (next.includes(FEISHU_MONITOR_DYNAMIC_IMPORT_JS) && !next.includes(FEISHU_MONITOR_STATIC_IMPORT_JS)) {
    next = next.replace(
      FEISHU_PLUGIN_IMPORT_JS,
      `${FEISHU_PLUGIN_IMPORT_JS}\n${FEISHU_MONITOR_STATIC_IMPORT_JS}`,
    );
    next = next.replace(FEISHU_MONITOR_DYNAMIC_IMPORT_JS, '');
  }

  if (next.includes(FEISHU_MONITOR_DYNAMIC_IMPORT_TS) && !next.includes(FEISHU_MONITOR_STATIC_IMPORT_TS)) {
    next = next.replace(
      FEISHU_PLUGIN_IMPORT_TS,
      `${FEISHU_PLUGIN_IMPORT_TS}\n${FEISHU_MONITOR_STATIC_IMPORT_TS}`,
    );
    next = next.replace(FEISHU_MONITOR_DYNAMIC_IMPORT_TS, '');
  }

  return next;
}

export function patchInstalledFeishuPluginCompatibility(pluginRoot: string): boolean {
  const candidateFiles = [
    join(pluginRoot, 'src', 'core', 'accounts.js'),
    join(pluginRoot, 'src', 'core', 'accounts.ts'),
    join(pluginRoot, 'src', 'channel', 'plugin.js'),
    join(pluginRoot, 'src', 'channel', 'plugin.ts'),
  ];

  let patched = false;
  for (const filePath of candidateFiles) {
    if (!existsSync(filePath)) continue;
    const original = readFileSync(filePath, 'utf8');
    const next = patchFeishuPluginCompatibilitySource(original);
    if (next !== original) {
      writeFileSync(filePath, next, 'utf8');
      patched = true;
    }
  }

  return patched;
}
