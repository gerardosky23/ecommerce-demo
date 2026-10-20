import { chromium } from 'playwright';

export async function harvestCarousel({ url, carouselSelector = '.swiper, [class*="carousel"], [class*="slider"]' }) {
  const browser = await chromium.launch({ headless: true });

  const results = {};

  for (const vp of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 375, height: 812 }
  ]) {
    console.log(`🎡 Cosechando carruseles en ${url} (${vp.name} - ${vp.width}px)...`);
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(1000);

    const data = await page.evaluate(async (selector) => {
      const carousels = Array.from(document.querySelectorAll(selector));
      const extracted = [];

      for (const c of carousels) {
        // Encontrar botones de paginación o siguiente
        const nextBtn = c.querySelector('[class*="next"], [class*="arrow-right"], button[aria-label*="next"]');
        const dots = Array.from(c.querySelectorAll('[class*="pagination"] [class*="bullet"], [class*="dot"]'));

        // Forzar clic secuencial para lazy load
        if (dots.length > 0) {
          for (const d of dots) {
            d.click();
            await new Promise((r) => setTimeout(r, 400));
          }
        } else if (nextBtn) {
          for (let i = 0; i < 6; i++) {
            nextBtn.click();
            await new Promise((r) => setTimeout(r, 400));
          }
        }

        const slides = Array.from(c.querySelectorAll('[class*="slide"], [class*="item"], li')).map((s) => ({
          title: s.querySelector('h1, h2, h3, h4, h5, strong')?.textContent?.trim() || '',
          text: s.querySelector('p, span')?.textContent?.trim() || '',
          imgSrc: s.querySelector('img')?.src || s.querySelector('img')?.getAttribute('data-src') || '',
          imgAlt: s.querySelector('img')?.alt || '',
          tag: s.tagName
        }));

        const firstSlide = c.querySelector('[class*="slide"], [class*="item"]');
        let cardStyles = {};
        if (firstSlide) {
          const s = window.getComputedStyle(firstSlide);
          cardStyles = {
            width: s.width,
            padding: s.padding,
            borderRadius: s.borderRadius,
            backgroundColor: s.backgroundColor,
            boxShadow: s.boxShadow
          };
        }

        const computed = window.getComputedStyle(c);
        extracted.push({
          carouselClass: c.className,
          gap: computed.gap,
          display: computed.display,
          slideCount: slides.length,
          slides,
          cardStyles
        });
      }

      return extracted;
    }, carouselSelector);

    results[vp.name] = data;
    await page.close();
  }

  await browser.close();
  console.log(`✅ Cosecha completada. Carruseles encontrados en desktop: ${results.desktop?.length || 0}`);
  return results;
}

if (process.argv[1]?.endsWith('harvester.mjs')) {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => a.replace(/^--/, '').split('='))
  );
  harvestCarousel({
    url: args.url || 'https://flexone.pe/'
  }).then((r) => console.log(JSON.stringify(r, null, 2))).catch(console.error);
}
