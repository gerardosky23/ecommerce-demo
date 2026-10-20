import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.TARGET_URL || 'https://flexone.pe/';
const OUTPUT_DIR = './spec_data';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runCrawler() {
  console.log(`🚀 Iniciando Playwright Crawler en: ${BASE_URL}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  // 1. Visitar la página inicial para descubrir la estructura y rutas internas
  console.log(`📡 Navegando a ${BASE_URL}...`);
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });

  // Descubrir rutas internas del menú y navegación
  const discoveredRoutes = await page.evaluate((baseUrl) => {
    const links = Array.from(document.querySelectorAll('a[href]'));
    const routes = new Map();
    routes.set('home', baseUrl);

    for (const a of links) {
      try {
        const u = new URL(a.href, baseUrl);
        if (u.origin === new URL(baseUrl).origin) {
          const pathname = u.pathname.replace(/\/$/, '') || '/';
          if (pathname === '/') continue;

          // Sanitizar nombre de archivo
          const cleanName = pathname.replace(/^\//, '').replace(/[^a-zA-Z0-9_-]/g, '-');
          if (cleanName && !routes.has(cleanName) && !pathname.match(/\.(png|jpg|jpeg|svg|pdf|css|js|webp)$/i)) {
            routes.set(cleanName, u.href);
          }
        }
      } catch (err) {}
    }

    return Array.from(routes.entries()).map(([name, url]) => ({ name, url }));
  }, BASE_URL);

  console.log(`🎯 Rutas encontradas (${discoveredRoutes.length}):`);
  discoveredRoutes.forEach((r) => console.log(`   - [${r.name}] -> ${r.url}`));

  // Procesar cada ruta descubierta
  for (const route of discoveredRoutes) {
    console.log(`\n📸 Extrayendo datos de ruta: ${route.name} (${route.url})...`);
    try {
      if (route.name !== 'home') {
        await page.goto(route.url, { waitUntil: 'networkidle', timeout: 60000 });
      }

      // Esperar renderizado y fuentes
      await page.waitForTimeout(2000);

      // Scroll suave para cargar imágenes en lazy-loading antes del screenshot
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 400;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              window.scrollTo(0, 0);
              resolve();
            }
          }, 80);
        });
      });

      await page.waitForTimeout(1000);

      // 1. Captura de referencia en alta definición (1440x900, deviceScaleFactor: 2)
      const screenshotPath = path.join(OUTPUT_DIR, `${route.name}-reference.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`   ✅ Captura guardada: ${screenshotPath}`);

      // 2. Extraer especificaciones computadas y tokens de diseño
      const spec = await page.evaluate(() => {
        const getStyles = (el) => {
          const s = window.getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return {
            tag: el.tagName.toLowerCase(),
            id: el.id || undefined,
            className: el.className ? String(el.className) : undefined,
            role: el.getAttribute('role') || undefined,
            ariaLabel: el.getAttribute('aria-label') || undefined,
            rect: {
              width: Math.round(r.width),
              height: Math.round(r.height),
              top: Math.round(r.top + window.scrollY),
              left: Math.round(r.left + window.scrollX)
            },
            styles: {
              display: s.display,
              flexDirection: s.flexDirection !== 'row' ? s.flexDirection : undefined,
              justifyContent: s.justifyContent !== 'normal' ? s.justifyContent : undefined,
              alignItems: s.alignItems !== 'normal' ? s.alignItems : undefined,
              gridTemplateColumns: s.gridTemplateColumns !== 'none' ? s.gridTemplateColumns : undefined,
              gap: s.gap !== 'normal' ? s.gap : undefined,
              padding: `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}`,
              margin: `${s.marginTop} ${s.marginRight} ${s.marginBottom} ${s.marginLeft}`,
              backgroundColor: s.backgroundColor !== 'rgba(0, 0, 0, 0)' ? s.backgroundColor : undefined,
              color: s.color,
              fontFamily: s.fontFamily,
              fontSize: s.fontSize,
              fontWeight: s.fontWeight,
              lineHeight: s.lineHeight,
              letterSpacing: s.letterSpacing !== 'normal' ? s.letterSpacing : undefined,
              borderRadius: s.borderRadius !== '0px' ? s.borderRadius : undefined,
              border: s.border !== '0px none rgb(0, 0, 0)' ? s.border : undefined,
              boxShadow: s.boxShadow !== 'none' ? s.boxShadow : undefined
            }
          };
        };

        // Identificar bloques semánticos
        const semanticElements = Array.from(
          document.querySelectorAll('header, nav, main, section, footer, article, [role="navigation"], [role="banner"], [role="contentinfo"]')
        );

        // Identificar elementos de interacción clave (botones, enlaces, tarjetas, inputs)
        const interactiveElements = Array.from(
          document.querySelectorAll('button, a.btn, [role="button"], input, select, textarea, .card, [class*="card"], [class*="btn"]')
        ).slice(0, 30);

        // Variables CSS en :root
        const rootStyles = window.getComputedStyle(document.documentElement);
        const rootCssVars = Array.from(document.styleSheets)
          .flatMap((sheet) => {
            try {
              return Array.from(sheet.cssRules);
            } catch {
              return [];
            }
          })
          .filter((rule) => rule.selectorText === ':root')
          .reduce((acc, rule) => {
            for (const prop of rule.style) {
              if (prop.startsWith('--')) {
                acc[prop] = rootStyles.getPropertyValue(prop).trim();
              }
            }
            return acc;
          }, {});

        // Paleta de colores detectada
        const uniqueColors = new Set();
        document.querySelectorAll('*').forEach((el) => {
          const cs = window.getComputedStyle(el);
          if (cs.color) uniqueColors.add(cs.color);
          if (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            uniqueColors.add(cs.backgroundColor);
          }
        });

        return {
          title: document.title,
          url: window.location.href,
          palette: Array.from(uniqueColors).slice(0, 30),
          rootCssVars,
          sections: semanticElements.map((el) => getStyles(el)),
          interactiveElements: interactiveElements.map((el) => getStyles(el))
        };
      });

      const specPath = path.join(OUTPUT_DIR, `${route.name}-spec.json`);
      fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));
      console.log(`   ✅ Especificaciones guardadas: ${specPath}`);
    } catch (err) {
      console.error(`   ❌ Error procesando ruta ${route.name}:`, err.message);
    }
  }

  await browser.close();
  console.log(`\n🎉 Extracción completada. Revisa los archivos generados en "${OUTPUT_DIR}".`);
}

runCrawler().catch((err) => {
  console.error('Fatal error en crawler:', err);
  process.exit(1);
});
