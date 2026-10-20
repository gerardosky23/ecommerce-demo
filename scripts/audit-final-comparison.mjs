import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const dir = 'spec_data/final_audit';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:4321/...');
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });

  // 1. Bento Grid
  console.log('Capturing Bento Grid...');
  const bentoHeading = page.locator('text=Odoo, implementado para la');
  await bentoHeading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const bentoSection = page.locator('section').filter({ hasText: 'Odoo, implementado para la' }).first();
  await bentoSection.screenshot({ path: `${dir}/replica-bento-grid.png` });

  // 2. Platform Apps Carousel
  console.log('Capturing Platform Apps Carousel...');
  const carousel = page.locator('#soluciones');
  await carousel.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await carousel.screenshot({ path: `${dir}/replica-apps-carousel.png` });

  // 3. Carousel Hover State (Finanzas card)
  console.log('Capturing Carousel Hover State...');
  const firstCard = carousel.locator('.group').first();
  await firstCard.hover();
  await page.waitForTimeout(400);
  await firstCard.screenshot({ path: `${dir}/replica-carousel-card-hover.png` });

  // 4. Next Steps Section
  console.log('Capturing Next Steps Section...');
  const nextSteps = page.locator('section').filter({ hasText: 'ok… suena bien' }).first();
  await nextSteps.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await nextSteps.screenshot({ path: `${dir}/replica-next-steps.png` });

  // 5. Mega Menu: Industrias
  console.log('Capturing Mega Menu: Industrias...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  const indBtn = page.locator('nav button:has-text("Industrias")');
  await indBtn.hover();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${dir}/replica-megamenu-industrias.png` });

  // 6. Mega Menu: Servicios
  console.log('Capturing Mega Menu: Servicios...');
  const servBtn = page.locator('nav button:has-text("Servicios")');
  await servBtn.hover();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${dir}/replica-megamenu-servicios.png` });

  // 7. Subpage: /servicios/desarrollo
  console.log('Navigating to /servicios/desarrollo...');
  await page.goto('http://localhost:4321/servicios/desarrollo', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${dir}/replica-servicios-desarrollo.png`, fullPage: true });

  // 8. Subpage: /industrias
  console.log('Navigating to /industrias...');
  await page.goto('http://localhost:4321/industrias', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${dir}/replica-industrias.png`, fullPage: true });

  console.log('Final audit screenshots captured successfully in spec_data/final_audit/!');
  await browser.close();
})();
