import { chromium } from 'playwright';
import fs from 'fs';

async function getProducts() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  console.log('Navigating to collections/all...');
  await page.goto('https://www.terrebleu.ca/collections/all', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  const data = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[href*="/products/"]'));
    const results = [];
    const seen = new Set();

    for (const a of anchors) {
      const href = a.getAttribute('href');
      if (!href || href.includes('?') || seen.has(href)) continue;

      const container = a.closest('.grid__item, .card, .product-card, li, .card-wrapper') || a;
      const text = container.innerText || '';
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

      const priceLine = lines.find(l => /\$\d+(\.\d{2})?/.test(l));
      const titleLine = lines.find(l => !/\$\d+/.test(l) && l.length > 3 && !l.toLowerCase().includes('quick') && !l.toLowerCase().includes('sale'));
      const img = container.querySelector('img')?.src || '';

      if (titleLine && priceLine && !seen.has(titleLine)) {
        seen.add(titleLine);
        seen.add(href);
        results.push({
          title: titleLine,
          price: priceLine,
          href,
          img
        });
      }
    }
    return results;
  });

  console.log(`Extracted ${data.length} products:`);
  console.log(data.slice(0, 8));
  fs.writeFileSync('./terrebleu-spec/products.json', JSON.stringify(data, null, 2));
  await browser.close();
}

getProducts().catch(console.error);
