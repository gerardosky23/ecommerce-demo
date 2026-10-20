import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const logoInfo = await page.evaluate(() => {
    const logos = Array.from(document.querySelectorAll('img[data-brand="logo"], header img, nav img, footer img'));
    return logos.map(img => ({
      alt: img.alt,
      src: img.src,
      dataBrand: img.getAttribute('data-brand'),
      dataVariant: img.getAttribute('data-brand-variant'),
      appliedSrc: img.getAttribute('data-applied-src')
    }));
  });
  console.log(JSON.stringify(logoInfo, null, 2));
  await page.screenshot({ path: 'C:/Users/gerar/.gemini/antigravity/brain/0d324f72-67e9-490c-a4f0-e611c34afd0d/debug-flexone-logo.png' });
  await browser.close();
}

main().catch(console.error);
