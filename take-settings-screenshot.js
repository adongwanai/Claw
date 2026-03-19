const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const REPORT_DIR = path.join(__dirname, '.gstack/qa-reports/screenshots');
fs.mkdirSync(REPORT_DIR, { recursive: true });

async function shot(page, name) {
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(REPORT_DIR, `${name}.png`), fullPage: false });
  console.log(`[saved] ${name}.png`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 12000 });

  // Navigate to settings
  await page.locator('button[title="设置"]').click();
  await shot(page, 'settings-general');

  // automation-defaults
  await page.locator('text=自动化默认策略').first().click();
  await shot(page, 'settings-automation');

  // memory-knowledge (strategy tab)
  await page.locator('text=记忆与知识').first().click();
  await shot(page, 'settings-memory-strategy');

  // memory browser tab
  await page.locator('text=数据浏览器').first().click();
  await shot(page, 'settings-memory-browser');

  // skills-mcp
  await page.locator('text=Skills 与 MCP').first().click();
  await shot(page, 'settings-skills-mcp');

  // tool-permissions
  await page.locator('text=工具权限').first().click();
  await shot(page, 'settings-tool-permissions');

  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
