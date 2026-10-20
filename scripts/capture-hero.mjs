import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
  return map[ext] || 'application/octet-stream';
}

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  let filePath = path.join(distDir, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.writeHead(200, { 'Content-Type': getContentType(filePath) });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404); res.end();
  }
});

server.listen(5434, async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } });
  await page.goto('http://localhost:5434/', { waitUntil: 'networkidle' });
  const hero = await page.locator('#heroSection');
  await hero.screenshot({ path: 'dist/verification-hero-full.png' });
  console.log('Hero full screenshot saved to dist/verification-hero-full.png');
  await browser.close();
  server.close();
});
