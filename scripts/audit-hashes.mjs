import fs from 'fs';
import path from 'path';

function getFiles(dir, exts = ['.astro', '.svelte']) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file, exts));
    } else if (exts.some(ext => file.endsWith(ext))) {
      results.push(file);
    }
  });
  return results;
}

const files = getFiles('src');
const hrefRegex = /href=["']([^"']*)["']/g;
const idRegex = /id=["']([^"']+)["']/g;

// Map page -> set of ids
const pageIds = {};

// collect all ids in all files
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  let match;
  const ids = new Set();
  while ((match = idRegex.exec(content)) !== null) {
    ids.add(match[1]);
  }
  pageIds[f] = ids;
});

// For each astro page, collect its ids and ids of components it imports
const pages = getFiles('src/pages', ['.astro']);
const routeIds = {};

pages.forEach(p => {
  let route = '/' + path.relative('src/pages', p).replace(/\\/g, '/').replace(/\.(astro|md)$/, '');
  if (route.endsWith('/index')) route = route.slice(0, -6);
  if (route === '') route = '/';

  const content = fs.readFileSync(p, 'utf8');
  const ids = new Set(pageIds[p] || []);
  // scan imported files recursively
  const importRegex = /import\s+.*?\s+from\s+['"](.*?)['"]/g;
  let imp;
  while ((imp = importRegex.exec(content)) !== null) {
    let impPath = imp[1];
    if (impPath.startsWith('.')) {
      let resolved = path.resolve(path.dirname(p), impPath);
      if (!fs.existsSync(resolved)) {
        if (fs.existsSync(resolved + '.astro')) resolved += '.astro';
        else if (fs.existsSync(resolved + '.svelte')) resolved += '.svelte';
      }
      if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
        const compContent = fs.readFileSync(resolved, 'utf8');
        let m;
        while ((m = idRegex.exec(compContent)) !== null) {
          ids.add(m[1]);
        }
      }
    }
  }
  routeIds[route] = ids;
});

// Check hash targets
const hashLinks = [];
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    const href = match[1];
    if (href.includes('#') && !href.startsWith('http') && !href.startsWith('mailto')) {
      const [r, hash] = href.split('#');
      hashLinks.push({ file: f, href, route: r || '/', hash });
    }
  }
});

console.log('Checking hash links:');
const missingHashes = [];
hashLinks.forEach(({ file, href, route, hash }) => {
  if (hash === 'main') return; // skip #main skip link
  const ids = routeIds[route];
  if (!ids) {
    missingHashes.push({ file: path.relative('src', file), href, reason: 'Route not found: ' + route });
  } else if (!ids.has(hash)) {
    missingHashes.push({ file: path.relative('src', file), href, reason: `ID #${hash} not found in route ${route}. Available IDs: ${Array.from(ids).join(', ')}` });
  }
});

console.log('Total hash links checked:', hashLinks.length);
if (missingHashes.length === 0) {
  console.log('All hash targets exist!');
} else {
  console.log('Missing hash targets:', JSON.stringify(missingHashes, null, 2));
}
