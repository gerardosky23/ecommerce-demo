import { chromium } from 'playwright';
import path from 'path';

const BASE_URL = 'http://localhost:4322';
const ARTIFACTS_DIR = 'C:/Users/gerar/.gemini/antigravity/brain/0d324f72-67e9-490c-a4f0-e611c34afd0d';

async function captureScreenshots() {
  console.log('Capturing visual verification screenshots...');
  const browser = await chromium.launch({ headless: true });

  const pagesToCapture = [
    { route: '/', name: 'audit-home-desktop', vp: { width: 1440, height: 900 } },
    { route: '/', name: 'audit-home-mobile', vp: { width: 375, height: 812 } },
    { route: '/sistemas/smart-erp', name: 'audit-smart-erp-desktop', vp: { width: 1440, height: 900 } },
    { route: '/soluciones/contabilidad-sire', name: 'audit-sire-desktop', vp: { width: 1440, height: 900 } },
    { route: '/soluciones/crm', name: 'audit-crm-desktop', vp: { width: 1440, height: 900 } },
    { route: '/soluciones/crm', name: 'audit-crm-mobile', vp: { width: 375, height: 812 } }
  ];

  for (const item of pagesToCapture) {
    const page = await browser.newPage({ viewport: item.vp, deviceScaleFactor: 2 });
    try {
      await page.goto(`${BASE_URL}${item.route}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);
      const outPath = path.join(ARTIFACTS_DIR, `${item.name}.png`);
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`Saved screenshot: ${item.name}.png`);
    } catch (e) {
      console.error(`Error capturing ${item.route}:`, e.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('Done capturing screenshots!');
}

captureScreenshots();
