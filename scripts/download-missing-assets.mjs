import fs from 'fs';
import path from 'path';

async function downloadIfMissing(url) {
  try {
    const urlObj = new URL(url);
    const localRelPath = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
    const localFullPath = path.join('public', localRelPath);

    if (fs.existsSync(localFullPath)) {
      return { url, localFullPath, status: 'already_exists' };
    }

    const dir = path.dirname(localFullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    console.log(`Downloading: ${url} -> ${localFullPath}`);
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) {
      console.warn(`Failed to fetch ${url}: ${res.status}`);
      return { url, status: 'failed_' + res.status };
    }
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(localFullPath, Buffer.from(arrayBuffer));
    return { url, localFullPath, status: 'downloaded' };
  } catch (err) {
    console.warn(`Error downloading ${url}:`, err.message);
    return { url, status: 'error' };
  }
}

async function run() {
  const htmls = [
    fs.readFileSync('spec_data/investigation/orig-servicios-implementacion.html', 'utf8'),
    fs.readFileSync('spec_data/investigation/orig-localizacion-planillas.html', 'utf8')
  ];

  const allUrls = new Set();
  for (const html of htmls) {
    const matches = [...html.matchAll(/https:\/\/web\.assets\.flexone\.pe\/[^\s\"\'<>)]+/gi)];
    for (const m of matches) {
      allUrls.add(m[0]);
    }
  }

  console.log(`Found ${allUrls.size} asset URLs to verify.`);
  for (const u of allUrls) {
    await downloadIfMissing(u);
  }
  console.log('Finished downloading all missing assets.');
}

run();
