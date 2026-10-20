import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:4322...');
  await page.goto('http://localhost:4322', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000); // allow embed.js & hydration

  // 1. Capture Hero Section with 3D Tilt Mockup and Telemetry
  console.log('Capturing Hero...');
  const hero = page.locator('#main > section:first-of-type');
  await page.screenshot({
    path: 'C:/Users/gerar/.gemini/antigravity/brain/0d324f72-67e9-490c-a4f0-e611c34afd0d/egs-home-polished-hero.png',
    fullPage: false
  });

  // Move mouse over Hero showcase to trigger tilt
  console.log('Testing 3D tilt on Hero showcase...');
  const showcase = page.locator('div[role="region"][aria-label*="Showcase"]');
  if (await showcase.count() > 0) {
    const box = await showcase.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.3);
      await page.waitForTimeout(400);
      await page.screenshot({
        path: 'C:/Users/gerar/.gemini/antigravity/brain/0d324f72-67e9-490c-a4f0-e611c34afd0d/egs-home-polished-hero-tilt.png',
        fullPage: false
      });
    }
  }

  // 2. Scroll to Bento Grid and test spotlight hover
  console.log('Capturing Bento Grid...');
  const bentoSection = page.locator('section:has-text("Ecosistema Modular Integrado")');
  await bentoSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  // Hover over Card 1
  const card1 = page.locator('article:has-text("EGS SMART ERP con Inteligencia Artificial")');
  if (await card1.count() > 0) {
    const cBox = await card1.boundingBox();
    if (cBox) {
      await page.mouse.move(cBox.x + cBox.width * 0.5, cBox.y + cBox.height * 0.5);
      await page.waitForTimeout(400);
    }
  }
  await page.screenshot({
    path: 'C:/Users/gerar/.gemini/antigravity/brain/0d324f72-67e9-490c-a4f0-e611c34afd0d/egs-home-polished-bento.png',
    fullPage: false
  });

  // 3. Scroll to Carousel & Calculator
  console.log('Capturing Apps Carousel & Savings Calculator...');
  const calcSection = page.locator('#ahorro');
  await calcSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  // Move slider to 65 users
  const slider = page.locator('#ahorro input[type="range"]');
  if (await slider.count() > 0) {
    await slider.fill('65');
    await page.waitForTimeout(400);
  }

  await page.screenshot({
    path: 'C:/Users/gerar/.gemini/antigravity/brain/0d324f72-67e9-490c-a4f0-e611c34afd0d/egs-home-polished-calculator.png',
    fullPage: false
  });

  // 4. Full Page Snapshot
  console.log('Capturing Full Page Snapshot...');
  await page.screenshot({
    path: 'C:/Users/gerar/.gemini/antigravity/brain/0d324f72-67e9-490c-a4f0-e611c34afd0d/egs-home-polished-full.png',
    fullPage: true
  });

  console.log('All polished screenshots captured successfully!');
  await browser.close();
}

main().catch(console.error);
