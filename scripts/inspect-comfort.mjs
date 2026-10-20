import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://www.terrebleu.ca/collections/the-terre-bleu-edit/products/the-comfort-edit', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const info = await page.evaluate(() => {
    const title = document.querySelector('h1')?.innerText?.trim();
    const price = document.querySelector('.price, .price-item, .money')?.innerText?.trim();
    const desc = document.querySelector('.product__description, .rte')?.innerText?.trim();
    const imgs = Array.from(document.querySelectorAll('img[src*="cdn/shop"]')).map(img => img.src).slice(0, 5);
    return { title, price, desc: desc ? desc.slice(0, 250) : '', imgs };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
}
main().catch(console.error);
