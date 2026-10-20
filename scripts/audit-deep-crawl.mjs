import { chromium } from 'playwright';

const routes = [
  '/',
  '/funcionalidades/finanzas',
  '/funcionalidades/ventas',
  '/funcionalidades/tesoreria',
  '/funcionalidades/compras-inventario',
  '/funcionalidades/manufactura',
  '/funcionalidades/sitio-web',
  '/funcionalidades/servicios-proyectos',
  '/localizacion/contabilidad',
  '/localizacion/facturacion-electronica',
  '/localizacion/detracciones-retenciones',
  '/localizacion/planillas',
  '/localizacion/kardex-valorizado',
  '/localizacion/importaciones',
  '/servicios/implementacion',
  '/servicios/desarrollo',
  '/servicios/consultoria',
  '/servicios/capacitaciones',
  '/servicios/soporte',
  '/industrias',
  '/casos',
  '/blog',
  '/contacto',
  '/nosotros',
  '/planiflex',
  '/privacidad',
  '/soluciones',
  '/servicios'
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const issues = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      issues.push({ type: 'CONSOLE_ERROR', text: msg.text(), url: page.url() });
    }
  });

  page.on('response', resp => {
    if (resp.status() >= 400) {
      issues.push({ type: 'HTTP_' + resp.status(), url: resp.url(), page: page.url() });
    }
  });

  console.log(`Auditing ${routes.length} routes on http://localhost:4321/...`);

  for (const route of routes) {
    try {
      const resp = await page.goto('http://localhost:4321' + route, { waitUntil: 'domcontentloaded' });
      const status = resp?.status();
      if (status !== 200) {
        issues.push({ type: 'PAGE_STATUS_' + status, url: route });
      }

      // Check all images on the page
      const images = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.getAttribute('src'),
          naturalWidth: img.naturalWidth,
          complete: img.complete
        }));
      });

      for (const img of images) {
        if (!img.src || (img.complete && img.naturalWidth === 0)) {
          issues.push({ type: 'BROKEN_IMAGE', src: img.src, page: route });
        }
      }

      // Check horizontal overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      if (overflow) {
        issues.push({ type: 'HORIZONTAL_OVERFLOW', page: route });
      }

    } catch (err) {
      issues.push({ type: 'NAVIGATION_ERROR', route, error: err.message });
    }
  }

  console.log('=== AUDIT RESULTS ===');
  console.log('Total issues found:', issues.length);
  if (issues.length > 0) {
    console.log(JSON.stringify(issues, null, 2));
  } else {
    console.log('ALL ROUTES PASSED 100% CLEAN!');
  }

  await browser.close();
})();
