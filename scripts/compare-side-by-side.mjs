import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const OUT_DIR = './spec_data/comparison';
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function runDetailedComparison() {
  console.log('🔬 Iniciando comparativa exhaustiva: flexone.pe vs localhost:4321 ...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });

  const pageOrig = await context.newPage();
  const pageLocal = await context.newPage();

  console.log('📡 Cargando sitio original (https://flexone.pe/)...');
  await pageOrig.goto('https://flexone.pe/', { waitUntil: 'networkidle', timeout: 45000 });
  await pageOrig.waitForTimeout(2000);

  console.log('📡 Cargando sitio local (http://localhost:4321/)...');
  await pageLocal.goto('http://localhost:4321/', { waitUntil: 'networkidle', timeout: 30000 });
  await pageLocal.waitForTimeout(2000);

  // 1. Capturas Full Page
  console.log('📸 Tomando capturas de página completa...');
  await pageOrig.screenshot({ path: path.join(OUT_DIR, 'orig-fullpage.png'), fullPage: true });
  await pageLocal.screenshot({ path: path.join(OUT_DIR, 'local-fullpage.png'), fullPage: true });

  // 2. Extracción de tokens reales del DOM en ambos sitios
  const extractMetrics = async (page) => {
    return await page.evaluate(() => {
      const getCS = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          width: Math.round(r.width),
          height: Math.round(r.height),
          fontFamily: s.fontFamily,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          lineHeight: s.lineHeight,
          color: s.color,
          backgroundColor: s.backgroundColor,
          padding: `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}`,
          margin: `${s.marginTop} ${s.marginRight} ${s.marginBottom} ${s.marginLeft}`,
          borderRadius: s.borderRadius
        };
      };

      return {
        bodyBg: window.getComputedStyle(document.body).backgroundColor,
        containerWidth: document.querySelector('.container, .max-w-7xl, main > div')?.getBoundingClientRect().width,
        h1: getCS('h1'),
        h2: getCS('h2'),
        heroBtn: getCS('main a[href*="contacto"], .btn-primary, [class*="btn"]'),
        navbar: getCS('header'),
        navbarLink: getCS('header nav a, header nav button'),
        sectionFirst: getCS('section')
      };
    });
  };

  const metricsOrig = await extractMetrics(pageOrig);
  const metricsLocal = await extractMetrics(pageLocal);

  // 3. Capturas por Viewport (Fold 1, Fold 2, Fold 3)
  const folds = [
    { name: '01-hero-header', scrollY: 0 },
    { name: '02-trust-bento', scrollY: 850 },
    { name: '03-normativa', scrollY: 1700 },
    { name: '04-platform-carousel', scrollY: 2550 },
    { name: '05-methodology-proinnovate', scrollY: 3400 },
    { name: '06-faqs-footer', scrollY: 4200 }
  ];

  for (const fold of folds) {
    await pageOrig.evaluate((y) => window.scrollTo(0, y), fold.scrollY);
    await pageLocal.evaluate((y) => window.scrollTo(0, y), fold.scrollY);
    await pageOrig.waitForTimeout(500);
    await pageLocal.waitForTimeout(500);

    await pageOrig.screenshot({ path: path.join(OUT_DIR, `orig-${fold.name}.png`) });
    await pageLocal.screenshot({ path: path.join(OUT_DIR, `local-${fold.name}.png`) });
  }

  await browser.close();

  const report = {
    metricsOrig,
    metricsLocal
  };

  fs.writeFileSync(path.join(OUT_DIR, 'diff-report.json'), JSON.stringify(report, null, 2));
  console.log('✅ Comparativa completada. Reporte guardado en spec_data/comparison/diff-report.json');
}

runDetailedComparison().catch(console.error);
