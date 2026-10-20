import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// Define las URLs/rutas a clonar (funciona para multipágina o rutas de SPA)
const ROUTES = [
  { name: 'home', url: process.env.TARGET_URL || 'https://ejemplo.com/' },
  // { name: 'pricing', url: 'https://ejemplo.com/pricing' },
  // { name: 'features', url: 'https://ejemplo.com/features' },
  // { name: 'contact', url: 'https://ejemplo.com/contact' }
];

const OUTPUT_DIR = './spec_data';
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });

  for (const route of ROUTES) {
    console.log(`📡 Procesando ruta: ${route.name} (${route.url})...`);
    await page.goto(route.url, { waitUntil: 'networkidle' });

    // 1. Captura de pantalla de resolución completa
    await page.screenshot({
      path: path.join(OUTPUT_DIR, `${route.name}-reference.png`),
      fullPage: true
    });

    // 2. Extracción de estilos globales, layout y tokens
    const spec = await page.evaluate(() => {
      const getStyles = (el) => {
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          id: el.id || undefined,
          className: el.className ? String(el.className) : undefined,
          rect: { width: Math.round(r.width), height: Math.round(r.height) },
          styles: {
            display: s.display,
            gap: s.gap,
            padding: `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}`,
            margin: `${s.marginTop} ${s.marginRight} ${s.marginBottom} ${s.marginLeft}`,
            backgroundColor: s.backgroundColor,
            color: s.color,
            fontFamily: s.fontFamily,
            fontSize: s.fontSize,
            fontWeight: s.fontWeight,
            lineHeight: s.lineHeight,
            borderRadius: s.borderRadius,
            border: s.border,
            boxShadow: s.boxShadow
          }
        };
      };

      // Secciones clave de la vista
      const sections = Array.from(document.querySelectorAll('header, nav, main, section, footer, [role="dialog"], [data-spa-view]'));
      
      // Variables CSS globales en :root
      const rootStyles = window.getComputedStyle(document.documentElement);
      const rootCssVars = Array.from(document.styleSheets)
        .flatMap(sheet => {
          try { return Array.from(sheet.cssRules); } catch { return []; }
        })
        .filter(rule => rule.selectorText === ':root')
        .reduce((acc, rule) => {
          for (const prop of rule.style) {
            if (prop.startsWith('--')) acc[prop] = rootStyles.getPropertyValue(prop).trim();
          }
          return acc;
        }, {});

      return {
        title: document.title,
        rootCssVars,
        sections: sections.map(s => getStyles(s))
      };
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${route.name}-spec.json`),
      JSON.stringify(spec, null, 2)
    );
  }

  await browser.close();
  console.log(`\n🎉 Extracción finalizada. Revisa la carpeta "${OUTPUT_DIR}".`);
})();
