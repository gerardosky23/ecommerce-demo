import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log('Testing interactive elements on http://localhost:4321/ ...');
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });

  // 1. Test Mega Menu Hover
  const solucionesBtn = page.locator('nav button:has-text("Soluciones")');
  await solucionesBtn.hover();
  await page.waitForTimeout(350);
  const megaMenu = page.locator('div[role="region"][aria-label="Submenú desplegable"]');
  const isMegaMenuVisible = await megaMenu.isVisible();
  console.log('1. MegaMenu hover visible:', isMegaMenuVisible ? 'PASS' : 'FAIL');

  // 2. Test Carousel in Home (scroll into view to trigger client:visible)
  const carouselSection = page.locator('#soluciones');
  await carouselSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const carouselCards = page.locator('#soluciones .flex > div');
  const carouselCount = await carouselCards.count();
  console.log('2. Embla Carousel rendered cards:', carouselCount > 0 ? `PASS (${carouselCount} slides)` : 'FAIL');

  // 3. Test WhatsApp Floating Button
  const waBtn = page.locator('aside[aria-label="Contacto por WhatsApp"] a');
  const hasWA = await waBtn.isVisible();
  console.log('3. Floating WhatsApp button visible:', hasWA ? 'PASS' : 'FAIL');

  // 4. Test Mobile Hamburger Viewport
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(300);
  const hamburger = page.locator('button[aria-label="Abrir menú de navegación"]');
  const hasHamburger = await hamburger.isVisible();
  console.log('4. Mobile Hamburger visible at 375px:', hasHamburger ? 'PASS' : 'FAIL');

  // Click hamburger
  await hamburger.click();
  await page.waitForTimeout(350);
  const mobileDrawer = page.locator('aside[aria-label="Menú móvil"]');
  const isDrawerOpen = await mobileDrawer.isVisible();
  console.log('5. Mobile Drawer opens cleanly:', isDrawerOpen ? 'PASS' : 'FAIL');

  // 6. Test Accordion in a subpage with FAQ (/servicios/implementacion)
  await page.goto('http://localhost:4321/servicios/implementacion', { waitUntil: 'networkidle' });
  const faqHeading = page.locator('h2:has-text("Preguntas")');
  await faqHeading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  // Check that item 0 is already open by default
  const defaultAnswer = page.locator('text=Entre 10 y 15 semanas en un proyecto típico');
  const isDefaultOpen = await defaultAnswer.isVisible();
  console.log('6. FAQ Accordion item 0 open by default:', isDefaultOpen ? 'PASS' : 'FAIL');

  // Click second question (index 1) which is closed by default
  const secondFaqTrigger = page.locator('button:has-text("¿Cuánto cuesta?")');
  await secondFaqTrigger.click();
  await page.waitForTimeout(350);
  const secondAnswer = page.locator('text=Lo principal es la implementación');
  const isSecondVisible = await secondAnswer.isVisible();
  console.log('7. FAQ Accordion expands second item on click:', isSecondVisible ? 'PASS' : 'FAIL');

  await browser.close();
  console.log('All interactive checks completed successfully!');
})();
