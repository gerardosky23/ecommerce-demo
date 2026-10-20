import { chromium } from 'playwright';
import { spawn } from 'child_process';

async function testInteractions() {
  console.log('🚀 Levantando servidor preview para prueba interactiva E2E...');
  const server = spawn('npm.cmd', ['run', 'preview', '--', '--port', '4321'], {
    shell: true,
    stdio: 'pipe'
  });

  await new Promise((r) => setTimeout(r, 3000));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  console.log('📡 Navegando a http://localhost:4321/ ...');
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle', timeout: 30000 });

  // 1. Probar Sticky Header al hacer scroll
  console.log('🧪 Probando scroll y Sticky Header...');
  await page.evaluate(() => window.scrollTo(0, 300));
  await page.waitForTimeout(500);
  const headerHeight = await page.locator('header').evaluate((el) => window.getComputedStyle(el).height);
  console.log(`   ✅ Altura de Header scrolled: ${headerHeight} (esperado ~64px)`);

  // 2. Probar Mega-Menú Soluciones en Desktop
  console.log('🧪 Probando hover en Mega-Menú Soluciones...');
  const solucionesBtn = page.locator('header nav button:has-text("Soluciones")');
  await solucionesBtn.hover();
  await page.waitForTimeout(400);
  const dropdownVisible = await page.locator('text=Módulos Integrados').isVisible();
  console.log(`   ✅ Mega-Menú visible al hover: ${dropdownVisible}`);

  // 3. Probar Carrusel de Plataforma
  console.log('🧪 Probando controles del carrusel de aplicaciones...');
  const nextBtn = page.locator('#soluciones button[aria-label="Siguiente diapositiva"]');
  await nextBtn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600); // esperar hidratación client:visible
  if (await nextBtn.isVisible()) {
    await nextBtn.click();
    await page.waitForTimeout(400);
    console.log('   ✅ Clic en siguiente diapositiva exitoso');
  }

  // 4. Probar Acordeón de FAQs
  console.log('🧪 Probando expansión de FAQ Accordion...');
  const faqItem = page.locator('#preguntas button').first();
  await faqItem.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600); // esperar hidratación client:visible
  if (await faqItem.isVisible()) {
    await faqItem.click();
    await page.waitForTimeout(400);
    console.log('   ✅ Clic en FAQ para expandir exitoso');
  }

  // 5. Probar Menú Móvil
  console.log('🧪 Probando navegación móvil en viewport 375px...');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  const burger = page.locator('header button[aria-label="Abrir menú de navegación"]');
  if (await burger.isVisible()) {
    await burger.click();
    await page.waitForTimeout(400);
    const drawerOpen = await page.locator('aside[aria-label="Menú móvil"]').isVisible();
    console.log(`   ✅ Drawer móvil abierto: ${drawerOpen}`);
  }

  await browser.close();
  server.kill();

  console.log(`\n🎉 Pruebas de interactividad finalizadas con ${errors.length} errores de consola.`);
  process.exit(0);
}

testInteractions().catch((err) => {
  console.error('Error en pruebas interactivas:', err);
  process.exit(1);
});
