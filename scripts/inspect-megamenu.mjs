import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const OUT_DIR = './spec_data/megamenu-audit';
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function inspectMegaMenus() {
  console.log('🚀 Iniciando inspección exhaustiva de Mega-Menús en https://flexone.pe/ ...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });

  const page = await context.newPage();
  await page.goto('https://flexone.pe/', { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(2000);

  // 1. Identificar todos los triggers del menú
  const navTriggers = await page.evaluate(() => {
    const header = document.querySelector('header');
    if (!header) return [];
    const items = Array.from(header.querySelectorAll('li, .nav-item, a, button'));
    return items.map((el, idx) => ({
      index: idx,
      text: el.innerText.trim().split('\n')[0],
      tag: el.tagName,
      className: el.className,
      selector: el.id ? `#${el.id}` : el.className ? `.${el.className.split(' ').join('.')}` : undefined
    })).filter(i => ['Soluciones', 'Localización Perú', 'Industrias', 'Servicios', 'Recursos'].includes(i.text));
  });

  console.log('🎯 Triggers encontrados:', navTriggers.map(t => t.text));

  const menuDetails = [];

  for (const item of ['Soluciones', 'Localización Perú', 'Servicios', 'Recursos']) {
    console.log(`\n🔎 Inspeccionando Mega-Menú: "${item}" ...`);
    try {
      const locator = page.locator(`header`).getByText(item, { exact: true }).first();
      await locator.scrollIntoViewIfNeeded();

      // Estado antes del hover
      const beforeHover = await page.evaluate(() => {
        const visibleDropdowns = Array.from(document.querySelectorAll('.dropdown-menu, [class*="sub-menu"], [class*="megamenu"], [class*="dropdown-item"]'))
          .filter(el => window.getComputedStyle(el).display !== 'none' && window.getComputedStyle(el).visibility !== 'hidden');
        return visibleDropdowns.length;
      });

      // Hover sobre el trigger
      await locator.hover();
      await page.waitForTimeout(600);

      // Captura del Mega Menú abierto
      const cleanName = item.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const ssPath = path.join(OUT_DIR, `megamenu-${cleanName}.png`);
      await page.screenshot({ path: ssPath });
      console.log(`   📸 Captura guardada: ${ssPath}`);

      // Extracción del DOM del Mega Menú revelado
      const menuData = await page.evaluate((menuTitle) => {
        // Encontrar el contenedor del submenú
        const dropdown = document.querySelector('.dropdown-menu.show, [class*="megamenu"], .dropdown:hover .dropdown-menu, li:hover ul, .sub-menu');
        if (!dropdown) return { found: false };

        const s = window.getComputedStyle(dropdown);
        const r = dropdown.getBoundingClientRect();

        const subItems = Array.from(dropdown.querySelectorAll('a, li, .card, [class*="item"]')).map(el => {
          const cs = window.getComputedStyle(el);
          return {
            tag: el.tagName,
            text: el.innerText.trim(),
            href: el.getAttribute('href'),
            fontSize: cs.fontSize,
            color: cs.color,
            fontWeight: cs.fontWeight
          };
        }).filter(i => i.text.length > 0 && i.text.length < 100);

        return {
          found: true,
          menuTitle,
          rect: { width: Math.round(r.width), height: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left) },
          styles: {
            display: s.display,
            position: s.position,
            backgroundColor: s.backgroundColor,
            borderRadius: s.borderRadius,
            boxShadow: s.boxShadow,
            border: s.border,
            padding: `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}`,
            gridTemplateColumns: s.gridTemplateColumns,
            flexDirection: s.flexDirection
          },
          html: dropdown.outerHTML.slice(0, 3000),
          subItems
        };
      }, item);

      menuDetails.push(menuData);
    } catch (err) {
      console.error(`   ❌ Error en ${item}:`, err.message);
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, 'megamenu-details.json'), JSON.stringify(menuDetails, null, 2));
  console.log(`\n🎉 Auditoría de Mega-Menús finalizada. Revisa "${OUT_DIR}".`);

  await browser.close();
}

inspectMegaMenus().catch(console.error);
