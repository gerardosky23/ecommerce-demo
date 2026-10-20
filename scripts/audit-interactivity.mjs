import { chromium } from 'playwright';

async function auditSite() {
  const browser = await chromium.launch({ headless: true });

  console.log('🔍 Iniciando auditoría de interactividad sobre https://flexone.pe/ ...');

  // 1. Desktop Audit (1440x900)
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://flexone.pe/', { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(1500);

  // A. Header scroll behavior
  const headerInitial = await page.evaluate(() => {
    const h = document.querySelector('header');
    if (!h) return null;
    const s = window.getComputedStyle(h);
    return {
      position: s.position,
      top: s.top,
      height: s.height,
      backgroundColor: s.backgroundColor,
      boxShadow: s.boxShadow,
      backdropFilter: s.backdropFilter
    };
  });

  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(500);

  const headerScrolled = await page.evaluate(() => {
    const h = document.querySelector('header');
    if (!h) return null;
    const s = window.getComputedStyle(h);
    return {
      position: s.position,
      top: s.top,
      height: s.height,
      backgroundColor: s.backgroundColor,
      boxShadow: s.boxShadow,
      backdropFilter: s.backdropFilter
    };
  });

  // B. Nav Dropdowns / Menus
  const navItems = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('header nav a, header nav button, header nav li'));
    return items.map((el) => ({
      text: el.innerText.trim(),
      tag: el.tagName,
      hasDropdown: el.querySelector('ul, div, [class*="menu"], [class*="dropdown"]') !== null
    })).filter((i) => i.text.length > 0 && i.text.length < 30);
  });

  // Test hover on nav dropdown triggers
  const dropdownTest = await page.evaluate(async () => {
    const links = Array.from(document.querySelectorAll('header nav > ul > li, header nav a'));
    const results = [];
    for (const l of links) {
      const text = l.innerText.trim();
      const beforeNodes = document.querySelectorAll('[class*="dropdown"], [class*="sub-menu"], [class*="menu-item"] ul').length;
      l.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 200));
      const afterNodes = document.querySelectorAll('[class*="dropdown"], [class*="sub-menu"], [class*="menu-item"] ul').length;
      results.push({ text, diffNodes: afterNodes - beforeNodes });
    }
    return results;
  });

  // C. Carousels & Sliders check
  const carouselsFound = await page.evaluate(() => {
    const selectors = [
      '.swiper',
      '.slick-slider',
      '.owl-carousel',
      '[class*="carousel"]',
      '[class*="slider"]',
      '[class*="marquee"]'
    ];
    return selectors.map((sel) => ({
      selector: sel,
      count: document.querySelectorAll(sel).length
    })).filter((r) => r.count > 0);
  });

  // D. Buttons & Card Hover styles
  const buttonHoverDiff = await page.evaluate(async () => {
    const btn = document.querySelector('a.btn, button.btn, header a[href*="contacto"], main a[href*="contacto"], .btn-primary, [class*="btn"]');
    if (!btn) return null;
    const s1 = window.getComputedStyle(btn);
    const before = {
      transform: s1.transform,
      backgroundColor: s1.backgroundColor,
      color: s1.color,
      boxShadow: s1.boxShadow,
      transition: s1.transition
    };

    btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 250));
    const s2 = window.getComputedStyle(btn);
    const after = {
      transform: s2.transform,
      backgroundColor: s2.backgroundColor,
      color: s2.color,
      boxShadow: s2.boxShadow
    };
    return { before, after, selector: btn.className };
  });

  // 2. Mobile Audit (375x812)
  const mobilePage = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await mobilePage.goto('https://flexone.pe/', { waitUntil: 'networkidle', timeout: 45000 });
  await mobilePage.waitForTimeout(1000);

  const mobileNav = await mobilePage.evaluate(async () => {
    const burger = document.querySelector('button[aria-label*="menu"], [class*="burger"], [class*="toggler"], header button, .menu-toggle');
    if (!burger) return { burgerFound: false };

    const beforeClick = {
      drawerVisible: document.querySelector('[class*="mobile-menu"], [class*="drawer"], nav[aria-expanded="true"]') !== null
    };

    burger.click();
    await new Promise((r) => setTimeout(r, 350));

    const afterClick = {
      drawerVisible: document.querySelector('[class*="mobile-menu"], [class*="drawer"], nav[aria-expanded="true"]') !== null,
      burgerClass: burger.className
    };

    return { burgerFound: true, beforeClick, afterClick };
  });

  await browser.close();

  console.log('\n📊 RESULTADOS DE LA AUDITORÍA:');
  console.log(JSON.stringify({
    headerInitial,
    headerScrolled,
    carouselsFound,
    buttonHoverDiff,
    mobileNav
  }, null, 2));
}

auditSite().catch(console.error);
