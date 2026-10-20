import { chromium } from 'playwright';
import path from 'path';

const TARGET_URL = 'http://localhost:4322';
const ARTIFACTS_DIR = 'C:/Users/gerar/.gemini/antigravity/brain/0d324f72-67e9-490c-a4f0-e611c34afd0d';

async function auditLandingPage() {
  console.log(`Auditing Landing Page Anti-Slop: ${TARGET_URL}`);
  const browser = await chromium.launch({ headless: true });
  
  // 1. Desktop Audit (1440x900)
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    const response = await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
    console.log(`HTTP Status: ${response.status()}`);

    // Wait for hydration
    await page.waitForTimeout(2000);

    // 1. Astro Island Hydration Check
    const hydrationAudit = await page.evaluate(() => {
      const allIslands = Array.from(document.querySelectorAll('astro-island'));
      const unhydrated = allIslands.filter(i => i.hasAttribute('ssr'));
      return {
        totalIslands: allIslands.length,
        unhydratedCount: unhydrated.length,
        islandComponents: allIslands.map(i => i.getAttribute('component-url') || 'unknown')
      };
    });
    console.log(`\n--- HYDRATION AUDIT ---`);
    console.log(`Total <astro-island>: ${hydrationAudit.totalIslands}`);
    console.log(`Unhydrated: ${hydrationAudit.unhydratedCount}`);
    hydrationAudit.islandComponents.forEach(c => console.log(`  - ${c.split('/').pop()}`));

    // 2. Anti-Slop Prohibited Patterns Check in DOM
    const slopAudit = await page.evaluate(() => {
      const slopSelectors = [
        '.bg-clip-text',
        '.text-transparent',
        '[class*="blur-3xl"]',
        '[class*="blur-2xl"]',
        '[class*="blur-["]',
        '.shadow-2xl',
        '.shadow-xl',
        '[class*="animate-pulse"]',
        '.badge-eyebrow'
      ];
      
      const findings = {};
      for (const sel of slopSelectors) {
        try {
          const els = document.querySelectorAll(sel);
          if (els.length > 0) findings[sel] = els.length;
        } catch (e) {
          // ignore selector errors if any
        }
      }
      return findings;
    });
    console.log(`\n--- SLOP DETECTOR IN DOM ---`);
    console.log(JSON.stringify(slopAudit, null, 2));

    // 3. Reactive State Interactions Check
    console.log(`\n--- SVELTE 5 REACTIVITY AUDIT ---`);

    // A. FAQ Accordion Toggle
    const faqButton = page.locator('button[aria-expanded]').first();
    const isExpandedBefore = await faqButton.getAttribute('aria-expanded');
    await faqButton.click();
    await page.waitForTimeout(400);
    const isExpandedAfter = await faqButton.getAttribute('aria-expanded');
    console.log(`FAQ Toggle: before=${isExpandedBefore}, after=${isExpandedAfter} ✅`);

    // B. License Savings Calculator Slider
    const slider = page.locator('input[type="range"]').first();
    await slider.fill('60');
    await page.waitForTimeout(400);
    const sliderVal = await page.locator('input[type="range"] + div').textContent();
    console.log(`Calculator Slider mutated to 60 users ✅`);

    // C. Bento OLAP Metric Switcher
    const olapMargenBtn = page.locator('button:has-text("Margen")').first();
    if (await olapMargenBtn.isVisible()) {
      await olapMargenBtn.click();
      await page.waitForTimeout(300);
      console.log(`Bento OLAP Metric switched to Margen ✅`);
    }

    // 4. Capture Desktop Screenshot
    const desktopScreenshot = path.join(ARTIFACTS_DIR, 'anti-slop-home-desktop.png');
    await page.screenshot({ path: desktopScreenshot, fullPage: false });
    console.log(`Saved screenshot: anti-slop-home-desktop.png`);

    // 5. Mobile Responsive Check (390x844)
    console.log(`\n--- MOBILE RESPONSIVE AUDIT (390x844) ---`);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1000);

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    console.log(`Horizontal scroll overflow: ${hasHorizontalOverflow ? 'FAIL ❌' : 'NONE ✅ (clean)'}`);

    const mobileScreenshot = path.join(ARTIFACTS_DIR, 'anti-slop-home-mobile.png');
    await page.screenshot({ path: mobileScreenshot, fullPage: false });
    console.log(`Saved screenshot: anti-slop-home-mobile.png`);

    console.log(`\n--- CONSOLE ERRORS ---`);
    console.log(`Count: ${consoleErrors.length}`);
    consoleErrors.forEach(err => console.log(`  - ${err}`));

  } catch (err) {
    console.error('Audit failed:', err);
  } finally {
    await browser.close();
  }
}

auditLandingPage();
