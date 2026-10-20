import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://flexone.pe/', { waitUntil: 'networkidle' });

  const sectionsData = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('main > section')).map((s, idx) => ({
      index: idx,
      id: s.id,
      className: s.className,
      h1: s.querySelector('h1')?.innerText?.trim(),
      h2: s.querySelector('h2')?.innerText?.trim(),
      h3s: Array.from(s.querySelectorAll('h3')).map(h => h.innerText?.trim()),
      ps: Array.from(s.querySelectorAll('p')).map(p => p.innerText?.trim()).slice(0, 5),
      buttons: Array.from(s.querySelectorAll('button, a.btn')).map(b => b.innerText?.trim()),
      images: Array.from(s.querySelectorAll('img')).map(img => img.getAttribute('src') || img.src)
    }));
  });

  fs.writeFileSync('spec_data/scraped-sections.json', JSON.stringify(sectionsData, null, 2));
  console.log('Sections extracted:', sectionsData.length);
  await browser.close();
}

main().catch(console.error);
