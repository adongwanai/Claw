const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const REPORT_DIR = path.join(__dirname, '.gstack/qa-reports/screenshots');
fs.mkdirSync(REPORT_DIR, { recursive: true });

async function shot(page, name) {
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(REPORT_DIR, `${name}.png`), fullPage: false });
  console.log(`[saved] ${name}.png`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 12000 });

  // Home
  await shot(page, '01-home');

  // 打印侧边栏所有可点击元素
  const sidebar = await page.locator('nav, aside, [class*="sidebar"], [class*="Sidebar"]').first().innerHTML().catch(() => '');
  console.log('sidebar html sample:', sidebar.slice(0, 2000));

  // 尝试 text= 选择器（更宽松）
  const items = await page.locator('text=飞书').all();
  console.log('飞书 elements count:', items.length);
  for (const item of items) {
    const tag = await item.evaluate(el => el.tagName);
    const cls = await item.evaluate(el => el.className);
    console.log(`  tag=${tag} class=${cls}`);
  }

  // 点击
  await page.locator('text=飞书').first().click({ timeout: 5000 });
  await shot(page, '02-channels');

  await page.locator('text=任务看板').first().click({ timeout: 5000 });
  await shot(page, '03-kanban');

  await page.locator('text=任务日程').first().click({ timeout: 5000 });
  await shot(page, '04-cron');

  await page.locator('text=团队看板').first().click({ timeout: 5000 });
  await shot(page, '05-team-map');

  await page.locator('text=团队总览').first().click({ timeout: 5000 });
  await shot(page, '06-team-overview');

  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
