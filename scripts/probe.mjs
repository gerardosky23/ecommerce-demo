import { chromium } from 'playwright';

async function probe() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('https://www.egs.pe/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const title = await page.title();
    const navLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(a => ({
        text: a.innerText.trim(),
        href: a.href
      })).filter(l => l.text && l.href);
    });
    const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 2000));
    console.log(JSON.stringify({ title, navLinksCount: navLinks.length, sampleLinks: navLinks.slice(0, 15), snippet: bodyText.replace(/\s+/g, ' ').slice(0, 800) }, null, 2));
  } catch (err) {
    console.error('Probe error:', err);
  } finally {
    await browser.close();
  }
}

probe();
