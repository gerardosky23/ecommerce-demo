import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

async function downloadAsset(urlStr) {
  return new Promise((resolve) => {
    try {
      const u = new URL(urlStr);
      let localRel = u.pathname;
      if (localRel.startsWith('/')) localRel = localRel.slice(1);
      // Clean path
      const localPath = path.join(process.cwd(), 'public', localRel);
      const dir = path.dirname(localPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const client = u.protocol === 'https:' ? https : http;
      client.get(urlStr, (res) => {
        if (res.statusCode === 200) {
          const stream = fs.createWriteStream(localPath);
          res.pipe(stream);
          stream.on('finish', () => {
            console.log(`[SAVED] ${localRel}`);
            resolve(localRel);
          });
          stream.on('error', () => resolve(null));
        } else {
          resolve(null);
        }
      }).on('error', () => resolve(null));
    } catch {
      resolve(null);
    }
  });
}

async function main() {
  console.log('Iniciando extracción de assets multimedia...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://flexone.pe/', { waitUntil: 'networkidle', timeout: 45000 });

  const imageUrls = await page.evaluate(() => {
    const urls = new Set();
    document.querySelectorAll('img').forEach((img) => {
      if (img.src) urls.add(img.src);
    });
    document.querySelectorAll('source').forEach((s) => {
      if (s.srcset) urls.add(s.srcset.split(' ')[0]);
    });
    return Array.from(urls);
  });

  console.log(`Encontradas ${imageUrls.length} imágenes.`);
  for (const url of imageUrls) {
    await downloadAsset(url);
  }

  await browser.close();
  console.log('Assets descargados en public/');
}

main().catch(console.error);
