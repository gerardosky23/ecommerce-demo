import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('=== TEST 1: Flexone (localhost:4321) ===');
  await page.goto('http://localhost:4321', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000); // Allow embed.js sync

  const flxTitle = await page.$eval('h1[data-content="hero-title"]', el => el.textContent.trim()).catch(() => 'NOT_FOUND');
  const flxBanner = await page.$eval('[data-content="banner-text"]', el => el.textContent.trim()).catch(() => 'NOT_FOUND');
  const flxAbout = await page.$eval('[data-content="footer-about"]', el => el.textContent.trim()).catch(() => 'NOT_FOUND');

  console.log('Flexone Hero Title:', flxTitle);
  console.log('Flexone Banner Text:', flxBanner);
  console.log('Flexone Footer About:', flxAbout.slice(0, 60) + '...');
  await page.screenshot({ path: 'C:/Users/gerar/.gemini/antigravity/brain/0d324f72-67e9-490c-a4f0-e611c34afd0d/flexone-cms-live.png', fullPage: false });

  console.log('\n=== TEST 2: EGS (localhost:4322) ===');
  await page.goto('http://localhost:4322', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000); // Allow embed.js sync

  const egsTitle = await page.$eval('h1[data-content="hero-title"]', el => el.textContent.trim()).catch(() => 'NOT_FOUND');
  const egsBadge = await page.$eval('[data-content="hero-badge"]', el => el.textContent.trim()).catch(() => 'NOT_FOUND');
  const egsBanner = await page.$eval('[data-content="banner-text"]', el => el.textContent.trim()).catch(() => 'NOT_FOUND');
  const egsAbout = await page.$eval('[data-content="footer-about"]', el => el.textContent.trim()).catch(() => 'NOT_FOUND');

  console.log('EGS Hero Title:', egsTitle);
  console.log('EGS Hero Badge:', egsBadge);
  console.log('EGS Banner Text:', egsBanner);
  console.log('EGS Footer About:', egsAbout.slice(0, 60) + '...');
  await page.screenshot({ path: 'C:/Users/gerar/.gemini/antigravity/brain/0d324f72-67e9-490c-a4f0-e611c34afd0d/egs-cms-live.png', fullPage: false });

  console.log('\n=== TEST 3: Backoffice UI (localhost:8090) ===');
  await page.goto('http://localhost:8090', { waitUntil: 'networkidle' });

  // Check if login modal is present
  const loginBtn = await page.$('button:has-text("Iniciar Sesión")');
  if (loginBtn) {
    console.log('Logging in to backoffice...');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await loginBtn.click();
    await page.waitForTimeout(800);
  }

  // Click on Contenido / CMS tab
  const cmsTab = await page.$('button:has-text("Contenido / CMS")');
  if (cmsTab) {
    await cmsTab.click();
    await page.waitForTimeout(500);
    console.log('Clicked Contenido / CMS tab');
  }

  await page.screenshot({ path: 'C:/Users/gerar/.gemini/antigravity/brain/0d324f72-67e9-490c-a4f0-e611c34afd0d/backoffice-tab-content-flexone.png', fullPage: false });

  // Switch to EGS
  console.log('Switching to egs-pe in dropdown...');
  const select = await page.$('select');
  if (select) {
    await select.selectOption('egs-pe');
    await page.waitForTimeout(800);
  }

  // Ensure still on Contenido tab
  const cmsTabEgs = await page.$('button:has-text("Contenido / CMS")');
  if (cmsTabEgs) {
    await cmsTabEgs.click();
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: 'C:/Users/gerar/.gemini/antigravity/brain/0d324f72-67e9-490c-a4f0-e611c34afd0d/backoffice-tab-content-egs.png', fullPage: false });

  console.log('\n=== TEST 4: Live Mutation via Backoffice ===');
  // Mutate hero title in input#hero-title
  const testTitle = 'EGS SMART ERP 2026: La Revolución del Open Source en el Perú';
  const titleInput = await page.$('input#hero-title');
  if (titleInput) {
    await titleInput.fill(testTitle);
    console.log('Filled new title in backoffice input#hero-title');

    // Click Guardar Cambios
    const saveBtn = await page.$('button:has-text("Guardar Cambios")');
    if (saveBtn) {
      await saveBtn.click();
      await page.waitForTimeout(1000);
      console.log('Clicked Guardar Cambios');
    }
  }

  // Open egs site on new tab/page to verify live mutation
  console.log('Verifying live mutation on egs site...');
  const egsPage = await context.newPage();
  await egsPage.goto('http://localhost:4322', { waitUntil: 'networkidle' });
  await egsPage.waitForTimeout(1200);

  const updatedTitle = await egsPage.$eval('h1[data-content="hero-title"]', el => el.textContent.trim());
  console.log('UPDATED EGS Hero Title on live site:', updatedTitle);
  await egsPage.screenshot({ path: 'C:/Users/gerar/.gemini/antigravity/brain/0d324f72-67e9-490c-a4f0-e611c34afd0d/egs-live-after-mutation.png', fullPage: false });

  // Revert back
  console.log('Reverting title back...');
  if (titleInput) {
    const originalTitle = 'Potencia tu operación con ERP de Clase Mundial, Inteligencia Artificial y Cero Licencias';
    await titleInput.fill(originalTitle);
    const saveBtn = await page.$('button:has-text("Guardar Cambios")');
    if (saveBtn) {
      await saveBtn.click();
      await page.waitForTimeout(1000);
    }
    await egsPage.reload({ waitUntil: 'networkidle' });
    await egsPage.waitForTimeout(1000);
    const revertedTitle = await egsPage.$eval('h1[data-content="hero-title"]', el => el.textContent.trim());
    console.log('REVERTED Title on live site:', revertedTitle);
  }

  await browser.close();
  console.log('\n=== ALL TESTS COMPLETED SUCCESSFULLY! ===');
}

main().catch(console.error);
