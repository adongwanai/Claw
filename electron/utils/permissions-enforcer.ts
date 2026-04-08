/**
 * Permissions Enforcer
 * Runtime enforcement layer for Tool Permissions.
 * Gates KTClaw-initiated file writes, terminal execution, network actions, and MCP tool invocations.
 * Records all enforcement events in an audit log.
 */
import { app } from 'electron';
import { join } from 'node:path';
import { appendFile } from 'node:fs/promises';
import { getSetting } from './store';
import { logger } from './logger';

export type PermissionAction =
  | 'file:read'
  | 'file:write'
  | 'terminal:exec'
  | 'network:fetch'
  | 'mcp:tool';

export type PermissionResult = 'allow' | 'block' | 'confirm';

export interface PermissionContext {
  path?: string;
  command?: string;
  tool?: string;
  url?: string;
}

export interface AuditEntry {
  timestamp: string;
  action: PermissionAction;
  result: PermissionResult | 'confirm-auto-allowed';
  context: PermissionContext;
  globalRiskLevel: string;
}

function getAuditLogPath(): string {
  return join(app.getPath('userData'), 'permissions-audit.jsonl');
}

/**
 * Append a single audit entry as a JSON line to permissions-audit.jsonl.
 * Never throws — errors are caught and logged.
 */
export async function appendAuditLog(entry: AuditEntry): Promise<void> {
  try {
    const line = JSON.stringify(entry) + '\n';
    await appendFile(getAuditLogPath(), line, 'utf8');
  } catch (err) {
    logger.error('[permissions-enforcer] Failed to write audit log:', err);
  }
}

/**
 * Check whether an action is permitted given the current settings.
 *
 * Priority:
 * 1. filePathAllowlist override for file:write (non-empty list → block paths not in list, allow paths in list)
 * 2. terminalCommandBlocklist override for terminal:exec (matching commands → block)
 * 3. Risk level matrix (strict / standard / permissive)
 */
export async function checkPermission(
  action: PermissionAction,
  ctx: PermissionContext,
): Promise<PermissionResult> {
  const [globalRiskLevel, filePathAllowlist, terminalCommandBlocklist] = await Promise.all([
    getSetting('globalRiskLevel') as Promise<string>,
    getSetting('filePathAllowlist') as Promise<string[]>,
    getSetting('terminalCommandBlocklist') as Promise<string[]>,
  ]);

  const riskLevel = (globalRiskLevel as string) || 'standard';
  const allowlist = Array.isArray(filePathAllowlist) ? filePathAllowlist : [];
  const blocklist = Array.isArray(terminalCommandBlocklist) ? terminalCommandBlocklist : [];

  let result: PermissionResult;

  // 1. filePathAllowlist override for file:write
  if (action === 'file:write' && allowlist.length > 0) {
    const pathValue = ctx.path ?? '';
    const inAllowlist = allowlist.some((allowed) => pathValue.startsWith(allowed));
    if (inAllowlist) {
      result = 'allow';
    } else {
      result = 'block';
    }
    await appendAuditLog({ timestamp: new Date().toISOString(), action, result, context: ctx, globalRiskLevel: riskLevel });
    return result;
  }

  // 2. terminalCommandBlocklist override for terminal:exec
  if (action === 'terminal:exec' && blocklist.length > 0) {
    const cmd = ctx.command ?? '';
    const blocked = blocklist.some((pattern) => cmd.includes(pattern));
    if (blocked) {
      result = 'block';
      await appendAuditLog({ timestamp: new Date().toISOString(), action, result, context: ctx, globalRiskLevel: riskLevel });
      return result;
    }
  }

  // 3. Risk level matrix
  if (riskLevel === 'strict') {
    // reads always allowed; all write/exec/network/mcp → block
    result = action === 'file:read' ? 'allow' : 'block';
  } else if (riskLevel === 'permissive') {
    result = 'allow';
  } else {
    // standard: reads → allow; writes/exec/network/mcp → confirm
    result = action === 'file:read' ? 'allow' : 'confirm';
  }

  await appendAuditLog({ timestamp: new Date().toISOString(), action, result, context: ctx, globalRiskLevel: riskLevel });
  return result;
}
