import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = './spec_data/investigation';
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function investigate() {
  console.log('🚀 Investigando las 5 secciones críticas en https://flexone.pe/ ...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await context.newPage();

  await page.goto('https://flexone.pe/', { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(2000);

  // 1. Investigar Navbar: ¿Tiene Industrias dropdown o link? ¿Qué clases y atributos tiene?
  console.log('1️⃣ Analizando Navbar e Industrias...');
  const navData = await page.evaluate(() => {
    const header = document.querySelector('header');
    const navItems = Array.from(header.querySelectorAll('.nav-item, li, nav a, nav button'));
    return navItems.map(el => ({
      text: el.innerText.trim(),
      tag: el.tagName,
      className: el.className,
      href: el.getAttribute('href'),
      ariaExpanded: el.getAttribute('aria-expanded'),
      innerHTML: el.innerHTML.slice(0, 200)
    })).filter(i => i.text.length > 0 && i.text.length < 50);
  });
  fs.writeFileSync(path.join(OUT_DIR, 'nav-data.json'), JSON.stringify(navData, null, 2));

  // 2. Investigar Bento Grid
  console.log('2️⃣ Analizando Bento Grid...');
  const bentoLocator = page.locator('section').filter({ hasText: 'Localización peruana completa' }).first();
  if (await bentoLocator.count() > 0) {
    await bentoLocator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await bentoLocator.screenshot({ path: path.join(OUT_DIR, 'orig-bento-grid.png') });
    const bentoHtml = await bentoLocator.evaluate(el => el.outerHTML);
    fs.writeFileSync(path.join(OUT_DIR, 'orig-bento-grid.html'), bentoHtml, 'utf8');
  }

  // 3. Investigar Apps Carousel ("Todo tu negocio en una sola plataforma")
  console.log('3️⃣ Analizando Carrusel de Aplicaciones ("Todo tu negocio en una sola plataforma")...');
  const appsLocator = page.locator('section').filter({ hasText: 'Todo tu negocio en una sola plataforma' }).first();
  if (await appsLocator.count() > 0) {
    await appsLocator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await appsLocator.screenshot({ path: path.join(OUT_DIR, 'orig-apps-carousel.png') });
    const appsHtml = await appsLocator.evaluate(el => el.outerHTML);
    fs.writeFileSync(path.join(OUT_DIR, 'orig-apps-carousel.html'), appsHtml, 'utf8');
  }

  // 4. Investigar "ok... suena bien, ¿y ahora qué hago?"
  console.log('4️⃣ Analizando Next Steps ("ok... suena bien, ¿y ahora qué hago?")...');
  const nextStepsLocator = page.locator('section').filter({ hasText: 'suena bien' }).first();
  if (await nextStepsLocator.count() > 0) {
    await nextStepsLocator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await nextStepsLocator.screenshot({ path: path.join(OUT_DIR, 'orig-next-steps.png') });
    const nextHtml = await nextStepsLocator.evaluate(el => el.outerHTML);
    fs.writeFileSync(path.join(OUT_DIR, 'orig-next-steps.html'), nextHtml, 'utf8');
  }

  // 5. Investigar URL /servicios/desarrollo
  console.log('5️⃣ Analizando qué ocurre en https://flexone.pe/servicios/desarrollo ...');
  try {
    const resp = await page.goto('https://flexone.pe/servicios/desarrollo', { timeout: 15000 });
    console.log('   Status code:', resp.status(), 'URL final:', page.url());
    await page.screenshot({ path: path.join(OUT_DIR, 'orig-servicios-desarrollo.png') });
    const pageHtml = await page.evaluate(() => document.body.innerHTML.slice(0, 1000));
    fs.writeFileSync(path.join(OUT_DIR, 'orig-servicios-desarrollo.html'), pageHtml, 'utf8');
  } catch (err) {
    console.log('   Error navegando a /servicios/desarrollo:', err.message);
  }

  await browser.close();
  console.log('✅ Investigación de los 5 puntos completada.');
}

investigate().catch(console.error);
