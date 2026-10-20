import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const TARGET_URLS = [
  { name: 'home', url: 'https://www.terrebleu.ca/' },
  { name: 'catalog', url: 'https://www.terrebleu.ca/collections/all' },
  { name: 'product', url: 'https://www.terrebleu.ca/collections/the-terre-bleu-edit/products/the-comfort-edit' },
  { name: 'login', url: 'https://www.terrebleu.ca/account/login?return_url=%2Faccount' }
];

const OUT_DIR = './terrebleu-spec';
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function analyze() {
  console.log('🚀 Starting Playwright crawl of Terre Bleu...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  const allData = {};

  for (const item of TARGET_URLS) {
    console.log(`📡 Inspecting ${item.name}: ${item.url}`);
    const page = await context.newPage();
    try {
      await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(3000); // allow layout/fonts to settle

      // Take screenshot
      const shotPath = path.join(OUT_DIR, `${item.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });
      console.log(`📸 Saved screenshot to ${shotPath}`);

      // Extract details
      const pageInfo = await page.evaluate(() => {
        // Nav items / megamenu
        const navLinks = Array.from(document.querySelectorAll('header a, nav a')).map(a => ({
          text: a.innerText.trim(),
          href: a.href
        })).filter(x => x.text.length > 0 && x.text.length < 50);

        // Headings
        const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.innerText.trim());
        const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.innerText.trim()).slice(0, 10);

        // Product cards (if catalog or home)
        const products = Array.from(document.querySelectorAll('.product-card, .grid__item, [data-product-id], .card-wrapper')).map(el => {
          const title = el.querySelector('.card__heading, .product-title, h3, h2, a.full-unstyled-link')?.innerText?.trim();
          const price = el.querySelector('.price, .price-item, .money')?.innerText?.trim();
          const img = el.querySelector('img')?.src;
          return { title, price, img };
        }).filter(p => p.title && p.price).slice(0, 15);

        // Colors & styles sample
        const bodyStyle = window.getComputedStyle(document.body);
        const headerEl = document.querySelector('header');
        const headerStyle = headerEl ? window.getComputedStyle(headerEl) : null;

        return {
          title: document.title,
          h1s,
          h2s,
          navLinks: navLinks.slice(0, 30),
          products,
          bodyFont: bodyStyle.fontFamily,
          bgColor: bodyStyle.backgroundColor,
          headerBg: headerStyle ? headerStyle.backgroundColor : null
        };
      });

      allData[item.name] = pageInfo;
    } catch (err) {
      console.error(`❌ Error crawling ${item.name}:`, err.message);
      allData[item.name] = { error: err.message };
    } finally {
      await page.close();
    }
  }

  await browser.close();
  const jsonPath = path.join(OUT_DIR, 'extracted_data.json');
  fs.writeFileSync(jsonPath, JSON.stringify(allData, null, 2), 'utf-8');
  console.log(`✅ Saved extracted data to ${jsonPath}`);
}

analyze();
