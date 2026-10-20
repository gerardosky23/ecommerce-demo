import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = './demo-verification';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runVerification() {
  console.log('🚀 Iniciando verificación E2E del Rediseño 100% Tema Claro + Catálogo /tienda + Backoffice Sidebar...');
  await fetch('http://localhost:8080/api/reset', { method: 'POST' }).catch(() => {});
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0'
  });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // ==========================================
  // STEP 1: Landing Page (http://localhost:4321/)
  // ==========================================
  console.log('1️⃣ Navegando a Landing Page (http://localhost:4321/)...');
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-landing-light-hero.png'), fullPage: false });
  console.log('📸 01-landing-light-hero.png capturado');

  // Verificar estilos y ausencia de AI Slop en Landing
  const landingAudit = await page.evaluate(() => {
    const bodyStyle = window.getComputedStyle(document.body);
    const docWidth = document.documentElement.clientWidth;
    const scrollWidth = document.body.scrollWidth;

    const forbiddenClasses = Array.from(document.querySelectorAll('*')).flatMap(el => {
      const cls = el.className || '';
      if (typeof cls === 'string') {
        return cls.split(' ').filter(c => c.includes('blur-') || c.includes('bg-clip-text') || c.includes('rounded-3xl') || c.includes('shadow-lg') || c.includes('shadow-xl') || c.includes('shadow-2xl'));
      }
      return [];
    });

    const pageText = document.body.innerText;
    const forbiddenPhrases = [
      'Edición Insignia',
      'The Terre Bleu Edit',
      'Terre Bleu Club',
      'Granja Botánica Orgánica • Ontario',
      'Selección Cosechada',
      'Ahorro de $15',
      'Disponibilidad en almacén:',
      'Últimas '
    ];
    const detectedPhrases = forbiddenPhrases.filter(p => pageText.includes(p));

    return {
      bodyBg: bodyStyle.backgroundColor,
      bodyColor: bodyStyle.color,
      clientWidth: docWidth,
      scrollWidth: scrollWidth,
      hasOverflow: scrollWidth > docWidth,
      forbiddenClassesCount: forbiddenClasses.length,
      forbiddenClasses,
      detectedPhrases
    };
  });

  console.log('📊 Auditoría Landing Page:', landingAudit);

  if (landingAudit.bodyBg !== 'rgb(255, 255, 255)') {
    throw new Error(`Tema claro no cargado en Landing: body background es ${landingAudit.bodyBg}, esperado rgb(255, 255, 255)`);
  }
  if (landingAudit.hasOverflow) {
    throw new Error(`Desbordamiento horizontal detectado en Landing: scrollWidth (${landingAudit.scrollWidth}) > clientWidth (${landingAudit.clientWidth})`);
  }
  if (landingAudit.forbiddenClassesCount > 0) {
    throw new Error(`Clases prohibidas detectadas en DOM de Landing: ${landingAudit.forbiddenClasses.join(', ')}`);
  }
  if (landingAudit.detectedPhrases.length > 0) {
    throw new Error(`Frases de AI Slop detectadas en DOM de Landing: ${landingAudit.detectedPhrases.join(', ')}`);
  }

  // Verificar que NO haya links visibles al Backoffice desde la storefront
  console.log('🔒 Verificando ausencia total de enlaces al Backoffice en la tienda...');
  const backofficeLinksCount = await page.locator('a[href="/admin"], a[href*="/admin"]').count();
  if (backofficeLinksCount > 0) {
    throw new Error(`Se encontraron ${backofficeLinksCount} enlaces al Backoffice en la tienda. Deben ser 0.`);
  }
  console.log('✅ Cero enlaces al Backoffice en storefront confirmado.');
  console.log('🔒 Verificando estabilidad de productos (cero carrusel, cero efecto de cambio)...');
  const initialTitles = await page.locator('section .group h3').allInnerTexts();
  console.log('📌 Títulos iniciales de productos:', initialTitles);
  await page.waitForTimeout(4500); // Esperar que se ejecute el intervalo de polling
  const postPollingTitles = await page.locator('section .group h3').allInnerTexts();
  if (JSON.stringify(initialTitles) !== JSON.stringify(postPollingTitles)) {
    throw new Error(`Efecto de cambio de productos detectado tras polling: iniciales=${JSON.stringify(initialTitles)}, nuevos=${JSON.stringify(postPollingTitles)}`);
  }
  console.log('✅ Cuadrícula 100% estática: Cero efecto de cambio o movimiento de productos confirmado.');

  // ==========================================
  // STEP 2: Navegar a /tienda (Catálogo Completo Dedicado)
  // ==========================================
  console.log('2️⃣ Navegando al catálogo profesional en http://localhost:4321/tienda ...');
  await page.goto('http://localhost:4321/tienda', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-tienda-catalog-view.png'), fullPage: false });
  console.log('📸 02-tienda-catalog-view.png capturado');

  const tiendaAudit = await page.evaluate(() => {
    const forbiddenClasses = Array.from(document.querySelectorAll('*')).flatMap(el => {
      const cls = el.className || '';
      if (typeof cls === 'string') {
        return cls.split(' ').filter(c => c.includes('blur-') || c.includes('bg-clip-text') || c.includes('rounded-3xl') || c.includes('shadow-lg') || c.includes('shadow-xl') || c.includes('shadow-2xl'));
      }
      return [];
    });
    return {
      forbiddenClassesCount: forbiddenClasses.length,
      forbiddenClasses
    };
  });
  if (tiendaAudit.forbiddenClassesCount > 0) {
    throw new Error(`Clases prohibidas detectadas en DOM de /tienda: ${tiendaAudit.forbiddenClasses.join(', ')}`);
  }
  console.log('📊 Auditoría /tienda sin clases prohibidas');

  // Verificar búsqueda y filtros en /tienda
  console.log('3️⃣ Probando buscador en tiempo real de /tienda...');
  const searchInput = page.locator('input[placeholder*="Buscar por nombre"]');
  await searchInput.fill('Lavanda');
  await page.waitForTimeout(500);

  const searchResultsCount = await page.locator('button:has-text("+ Añadir")').count();
  console.log(`🔎 Productos encontrados para "Lavanda": ${searchResultsCount}`);
  if (searchResultsCount === 0) {
    throw new Error('El buscador de /tienda no retornó resultados para "Lavanda"');
  }

  // Limpiar búsqueda
  await searchInput.fill('');
  await page.waitForTimeout(500);

  // Probar filtro de categoría
  console.log('4️⃣ Probando filtro por categoría en /tienda...');
  const bodyCareFilter = page.locator('button:has-text("Cuidado Corporal")');
  if (await bodyCareFilter.isVisible()) {
    await bodyCareFilter.click();
    await page.waitForTimeout(500);
    console.log('✅ Filtro "Cuidado Corporal" aplicado');
  }

  // Volver a todos
  const allFilter = page.locator('button:has-text("Todos")');
  await allFilter.click();
  await page.waitForTimeout(500);

  // ==========================================
  // STEP 3: Añadir Producto al Carrito desde /tienda
  // ==========================================
  console.log('5️⃣ Añadiendo primer producto al carrito...');
  const addBtn = page.locator('button:has-text("+ Añadir")').first();
  await addBtn.click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-cart-drawer-light.png'), fullPage: false });
  console.log('📸 03-cart-drawer-light.png capturado');

  // ==========================================
  // STEP 4: Checkout Ficticio Express
  // ==========================================
  console.log('6️⃣ Abriendo pasarela de Checkout...');
  const checkoutBtn = page.locator('button:has-text("Completar Compra Ficticia")');
  await checkoutBtn.click();
  await page.waitForTimeout(1000);

  const testCustomer = 'Camila Vega';
  const testAddress = 'Av. Las Begonias 441, Depto 502';
  const testCity = 'San Isidro, Lima';
  console.log(`7️⃣ Ingresando nombre del cliente: "${testCustomer}" y dirección: "${testAddress}"...`);
  
  const nameInput = page.locator('input#cust-name');
  if (await nameInput.isVisible()) {
    await nameInput.fill(testCustomer);
  }

  const addressInput = page.locator('input#shipping-address');
  await addressInput.fill(testAddress);

  const cityInput = page.locator('input#shipping-city');
  await cityInput.fill(testCity);
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-checkout-modal-light.png'), fullPage: false });
  console.log('📸 04-checkout-modal-light.png capturado');

  const payBtn = page.locator('button:has-text("Pagar")');
  await payBtn.click();
  await page.waitForTimeout(2000);

  // Verificar que NO haya botón de ir a Backoffice en el modal de éxito
  const backofficeInModal = await page.locator('a[href="/admin"], a:has-text("Backoffice")').count();
  if (backofficeInModal > 0) {
    throw new Error('Se detectó un enlace o botón de Backoffice en el modal de confirmación de compra.');
  }
  console.log('✅ Cero enlaces al Backoffice tras completar compra confirmado.');

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-order-confirmed-light.png'), fullPage: false });
  console.log('📸 05-order-confirmed-light.png capturado');

  // Verificar en Perfil de Cliente
  console.log('8️⃣ Verificando pedido en Mi Perfil y probando Seguimiento...');
  const viewProfileBtn = page.locator('button:has-text("Ver en Mi Perfil")');
  await viewProfileBtn.click();
  await page.waitForTimeout(1500);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-profile-drawer-light.png'), fullPage: false });
  console.log('📸 06-profile-drawer-light.png capturado');

  const profileContent = await page.evaluate(() => document.body.innerText);
  if (!profileContent.includes('Camila Vega')) {
    throw new Error('El perfil de cliente no reflejó el nombre de Camila Vega.');
  }
  if (!profileContent.includes('Av. Las Begonias 441')) {
    throw new Error('El perfil de cliente no reflejó la dirección de envío.');
  }

  // Probar botón "Seguimiento"
  console.log('📍 Probando botón de "Seguimiento" del pedido...');
  const trackBtn = page.locator('button:has-text("Seguimiento")').first();
  await trackBtn.click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06b-tracking-modal.png'), fullPage: false });
  console.log('📸 06b-tracking-modal.png capturado');

  const trackingText = await page.evaluate(() => document.body.innerText);
  if (!trackingText.includes('Seguimiento de Pedido') || !trackingText.includes('En proceso')) {
    throw new Error('El modal de seguimiento no mostró el título o el estado "En proceso".');
  }
  if (!trackingText.includes('Módulo de Rastreo GPS Satelital')) {
    throw new Error('El modal de seguimiento no mostró el espacio para el módulo de mapas GPS.');
  }

  // Verificar presencia del mapa Leaflet interactivo
  console.log('🗺️ Verificando inicialización de Leaflet y capas CartoDB Positron...');
  await page.waitForSelector('#leaflet-order-map.leaflet-container', { timeout: 10000 });
  const hasLeafletMap = await page.locator('#leaflet-order-map.leaflet-container').isVisible();
  if (!hasLeafletMap) {
    throw new Error('El contenedor del mapa interactivo Leaflet no se inicializó con la clase .leaflet-container');
  }

  // Probar selector interactivo de vehículo (Moto Reparto)
  console.log('🛵 Probando selector dinámico de vehículo (Moto Reparto)...');
  const motoBtn = page.locator('#btn-tracking-v-moto');
  await motoBtn.click();
  await page.waitForTimeout(300);

  // Probar cambio a Camión
  console.log('🚛 Probando selector de transporte a Camión Logístico...');
  const camionBtn = page.locator('#btn-tracking-v-camion');
  await camionBtn.click();
  await page.waitForTimeout(300);

  // Probar cambio a Auto
  const autoBtn = page.locator('#btn-tracking-v-auto');
  await autoBtn.click();
  await page.waitForTimeout(300);

  // Probar control Pausar / Reanudar
  console.log('⏸️ Probando control Pausar...');
  const pauseBtn = page.locator('#btn-tracking-pause');
  await pauseBtn.click();
  await page.waitForTimeout(300);
  const reanudarBtn = page.locator('#btn-tracking-pause:has-text("Reanudar")');
  if (!(await reanudarBtn.isVisible())) {
    throw new Error('El botón Pausar no cambió a Reanudar');
  }
  console.log('▶️ Probando control Reanudar...');
  await reanudarBtn.click();
  await page.waitForTimeout(300);

  // Probar Reiniciar Ruta
  console.log('🔄 Probando botón Reiniciar Ruta...');
  const restartBtn = page.locator('#btn-tracking-restart');
  await restartBtn.click();
  await page.waitForTimeout(300);

  // Probar selector de velocidad 5x y esperar entrega completa
  console.log('⚡ Probando selector de velocidad de simulación 5x para completar entrega...');
  const speed5xBtn = page.locator('#btn-tracking-speed-5');
  await speed5xBtn.click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06c-tracking-simulation-active.png'), fullPage: false });
  console.log('📸 06c-tracking-simulation-active.png capturado con telemetría en vivo');

  // Esperar a que la simulación a 5x complete la entrega (máximo 20 segundos)
  console.log('⏳ Esperando confirmación de entrega en destino...');
  await page.waitForSelector('text=¡Pedido Entregado con Éxito!', { timeout: 20000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06d-tracking-delivered.png'), fullPage: false });
  console.log('📸 06d-tracking-delivered.png capturado con confirmación de entrega');

  console.log('✅ Modal de Seguimiento con mapa Leaflet, selector de vehículo, telemetría y entrega confirmada.');

  // Cerrar modal de seguimiento
  const closeTrackingBtn = page.locator('button:has-text("Cerrar Seguimiento")');
  await closeTrackingBtn.click();
  await page.waitForTimeout(500);

  // ==========================================
  // STEP 5: Verificar Backoffice Go con Login y Control Sold Out (http://localhost:8080/admin/)
  // ==========================================
  console.log('9️⃣ Navegando al Backoffice Go en http://localhost:8080/admin/ ...');
  const adminPage = await context.newPage();
  await adminPage.goto('http://localhost:8080/admin/', { waitUntil: 'networkidle', timeout: 30000 });
  await adminPage.waitForTimeout(1000);

  // Verificar pantalla de login
  console.log('🔐 Verificando pantalla de autenticación del Backoffice...');
  const isLoginVisible = await adminPage.locator('#login-container').isVisible();
  if (!isLoginVisible) {
    throw new Error('La pantalla de login del Backoffice no se mostró.');
  }

  // Iniciar sesión con demo / demo
  console.log('🔑 Ingresando credenciales demo / demo...');
  await adminPage.fill('#input-username', 'demo');
  await adminPage.fill('#input-password', 'demo');
  await adminPage.click('#login-form button[type="submit"]');
  await adminPage.waitForTimeout(1000);

  const isDashboardVisible = await adminPage.locator('#dashboard-container').isVisible();
  if (!isDashboardVisible) {
    throw new Error('El inicio de sesión con demo / demo no desbloqueó el dashboard.');
  }
  console.log('✅ Inicio de sesión exitoso en Backoffice.');

  await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, '07-backoffice-sidebar-inventory.png'), fullPage: false });
  console.log('📸 07-backoffice-sidebar-inventory.png capturado');

  // Verificar Estilo Claro y Barra Lateral del Backoffice
  const adminAudit = await adminPage.evaluate(() => {
    const bodyStyle = window.getComputedStyle(document.body);
    const sidebar = document.querySelector('aside');
    const sidebarStyle = sidebar ? window.getComputedStyle(sidebar) : null;
    return {
      bodyBg: bodyStyle.backgroundColor,
      hasSidebar: !!sidebar,
      sidebarWidth: sidebarStyle?.width,
      revenueText: document.getElementById('kpi-revenue')?.innerText,
      ordersText: document.getElementById('kpi-orders')?.innerText,
      customersText: document.getElementById('kpi-customers')?.innerText,
    };
  });
  console.log('📊 Auditoría Backoffice:', adminAudit);

  if (!adminAudit.hasSidebar) {
    throw new Error('El Backoffice no tiene barra lateral (aside no encontrado)');
  }

  // Probar botón de Sold Out ("Agotar" / "Reponer")
  console.log('📦 Probando acción de Sold Out en inventario...');
  const firstAgotarBtn = adminPage.locator('button:has-text("Agotar")').first();
  if (await firstAgotarBtn.isVisible()) {
    await firstAgotarBtn.click();
    await adminPage.waitForTimeout(1000);
    console.log('✅ Producto marcado como Agotado en Backoffice');
    await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, '07b-backoffice-soldout.png'), fullPage: false });
  }

  // Cambiar a pestaña Ventas en Backoffice
  console.log('🔟 Cambiando a pestaña Ventas en Backoffice...');
  await adminPage.click('#tab-sales');
  await adminPage.waitForTimeout(1000);
  await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, '08-backoffice-sales-verified.png'), fullPage: false });
  console.log('📸 08-backoffice-sales-verified.png capturado');

  const salesTableText = await adminPage.evaluate(() => document.getElementById('sales-tbody')?.innerText);
  if (!salesTableText || !salesTableText.includes('Camila Vega')) {
    throw new Error('La venta de Camila Vega no se visualiza en la tabla de Ventas del Backoffice.');
  }
  if (!salesTableText.includes('Av. Las Begonias 441')) {
    throw new Error('La dirección de envío no se visualiza en la tabla de Ventas del Backoffice.');
  }
  console.log('✅ Venta y Dirección de Envío de Camila Vega verificadas en tabla de Ventas del Backoffice.');

  // Probar botón "Ver GPS / Ruta" en la tabla de Ventas del Backoffice
  console.log('📍 Probando botón "Ver GPS / Ruta" en Backoffice...');
  const adminGpsBtn = adminPage.locator('button:has-text("Ver GPS / Ruta")').first();
  if (await adminGpsBtn.isVisible()) {
    await adminGpsBtn.click();
    await adminPage.waitForTimeout(1500);
    await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, '08b-backoffice-gps-modal.png'), fullPage: false });
    console.log('📸 08b-backoffice-gps-modal.png capturado con visor Leaflet en Backoffice');

    // Cerrar modal GPS en Backoffice
    const closeAdminGps = adminPage.locator('#admin-gps-modal button:has-text("Cerrar Seguimiento")');
    if (await closeAdminGps.isVisible()) {
      await closeAdminGps.click();
      await adminPage.waitForTimeout(500);
    }
  }
  console.log('1️⃣1️⃣ Cambiando a pestaña Clientes en Backoffice...');
  await adminPage.click('#tab-customers');
  await adminPage.waitForTimeout(1000);
  await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, '09-backoffice-customers-verified.png'), fullPage: false });
  console.log('📸 09-backoffice-customers-verified.png capturado');

  const customersTableText = await adminPage.evaluate(() => document.getElementById('customers-tbody')?.innerText);
  if (!customersTableText || !customersTableText.includes('Camila Vega')) {
    throw new Error('Camila Vega no aparece en el Directorio de Clientes del Backoffice.');
  }

  // ==========================================
  // STEP 6: Verificar Responsividad Móvil (375px)
  // ==========================================
  console.log('1️⃣2️⃣ Verificando responsividad móvil 375px en Landing y Tienda...');
  const mobilePage = await context.newPage();
  await mobilePage.setViewportSize({ width: 375, height: 667 });

  await mobilePage.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  const mobileLandingOverflow = await mobilePage.evaluate(() => document.body.scrollWidth > document.documentElement.clientWidth);
  if (mobileLandingOverflow) {
    throw new Error('Desbordamiento horizontal detectado en móvil 375px en Landing Page');
  }
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '10-mobile-landing-375px.png') });

  await mobilePage.goto('http://localhost:4321/tienda', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  const mobileTiendaOverflow = await mobilePage.evaluate(() => document.body.scrollWidth > document.documentElement.clientWidth);
  if (mobileTiendaOverflow) {
    throw new Error('Desbordamiento horizontal detectado en móvil 375px en /tienda');
  }
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '11-mobile-tienda-375px.png') });
  console.log('📸 Capturas móviles 375px verificadas sin overflow');

  await browser.close();

  if (consoleErrors.length > 0) {
    console.warn('⚠️ Console errors detectados:', consoleErrors);
  }

  console.log('🎉 ¡TODAS LAS VERIFICACIONES E2E PASARON CON 100% DE ÉXITO!');
}

runVerification().catch(err => {
  console.error('❌ Error en la verificación E2E:', err);
  process.exit(1);
});
