import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[ERROR] ${err.message}`));

  await page.goto('http://localhost:4322', { waitUntil: 'networkidle' });
  console.log('Page Title:', await page.title());
  console.log('Logs:', logs);

  const rail = await page.$('.nc-rail-dock');
  console.log('Contact Rail Present?:', !!rail);

  const heroTitle = await page.$eval('h1', el => el.textContent.trim());
  console.log('Hero Title:', heroTitle);

  const banner = await page.$eval('header div', el => el ? el.textContent.trim() : 'No banner');
  console.log('Top Banner:', banner);

  await page.screenshot({ path: 'C:/Users/gerar/.gemini/antigravity/brain/0d324f72-67e9-490c-a4f0-e611c34afd0d/egs-live-status.png', fullPage: false });
  console.log('Screenshot taken!');

  await browser.close();
}

main().catch(console.error);
