import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('E2E guardrails', () => {
  it('does not allow the e2e script to silently pass with zero tests', () => {
    const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.['test:e2e']).toBeDefined();
    expect(packageJson.scripts?.['test:e2e']).not.toContain('--pass-with-no-tests');
    expect(packageJson.scripts?.['test:e2e:headed']).not.toContain('--pass-with-no-tests');
  });

  it('includes a Playwright config and at least one real e2e smoke spec', () => {
    expect(existsSync(resolve(process.cwd(), 'playwright.config.ts'))).toBe(true);
    expect(existsSync(resolve(process.cwd(), 'tests/e2e/app-smoke.spec.ts'))).toBe(true);
  });

  it('runs Playwright smoke coverage in the main CI workflow', () => {
    const checkWorkflow = readFileSync(resolve(process.cwd(), '.github/workflows/check.yml'), 'utf8');

    expect(checkWorkflow).toContain('playwright install');
    expect(checkWorkflow).toContain('pnpm run test:e2e');
  });
});
