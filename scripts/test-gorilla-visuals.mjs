import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const OUT_DIR = path.resolve('public/test-captures');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  console.log('Navigating to http://localhost:4323/ ...');
  await page.goto('http://localhost:4323/', { waitUntil: 'networkidle' });

  // 1. Capture Hero with bottom fusion overlay
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, '01-hero-desktop.png') });
  console.log('Captured 01-hero-desktop.png');

  // 2. Scroll to Transition Section
  const transitionSection = page.locator('.transition-section');
  await transitionSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT_DIR, '02-transition-desktop.png') });
  console.log('Captured 02-transition-desktop.png');

  // Test interactive buttons: click Modo Estudio
  const estudioBtn = page.locator('button.profile-btn:has-text("Modo Estudio")');
  await estudioBtn.click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT_DIR, '02b-transition-estudio.png') });
  console.log('Captured 02b-transition-estudio.png');

  // Test interactive buttons: click Extensión Graves
  const gravesBtn = page.locator('button.profile-btn:has-text("Extensión Graves")');
  await gravesBtn.click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT_DIR, '02c-transition-graves.png') });
  console.log('Captured 02c-transition-graves.png');

  // Test slider adjustment
  const slider = page.locator('#anc-slider');
  await slider.fill('45');
  await page.waitForTimeout(300);
  console.log('Adjusted slider to 45%');

  // 3. Scroll to Sequence Track - Step 1
  const seq = page.locator('#secuencia');
  const seqBox = await seq.boundingBox();
  console.log('Sequence bounding box:', seqBox);

  // Scroll to Step 1 (around 35vh into track)
  await page.evaluate(() => {
    const el = document.getElementById('secuencia');
    if (el) window.scrollTo({ top: el.offsetTop + window.innerHeight * 0.35, behavior: 'instant' });
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT_DIR, '03-step1-isolation.png') });
  console.log('Captured 03-step1-isolation.png');

  // 4. Scroll to Step 2 (around 135vh into track)
  await page.evaluate(() => {
    const el = document.getElementById('secuencia');
    if (el) window.scrollTo({ top: el.offsetTop + window.innerHeight * 1.35, behavior: 'instant' });
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT_DIR, '04-step2-headband.png') });
  console.log('Captured 04-step2-headband.png');

  // 5. Scroll to Step 3 (around 235vh into track)
  await page.evaluate(() => {
    const el = document.getElementById('secuencia');
    if (el) window.scrollTo({ top: el.offsetTop + window.innerHeight * 2.35, behavior: 'instant' });
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT_DIR, '05-step3-drivers.png') });
  console.log('Captured 05-step3-drivers.png');

  // 6. Scroll to the very bottom of the page (Overlaid Specs Footer on top of the last frame)
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT_DIR, '06-step4-specs-overlay.png') });
  console.log('Captured 06-step4-specs-overlay.png');

  // 7. Mobile Viewport Check (375x812)
  await page.setViewportSize({ width: 375, height: 812 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT_DIR, '07-mobile-hero.png') });
  console.log('Captured 07-mobile-hero.png');

  await browser.close();

  console.log('Console errors count:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.error('Console errors:', consoleErrors);
  } else {
    console.log('All tests passed with zero console errors.');
  }
}

run().catch(err => {
  console.error('Error running test script:', err);
  process.exit(1);
});
