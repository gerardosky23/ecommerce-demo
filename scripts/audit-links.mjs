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
const hrefRegex = /href=["']([^"'#][^"']*)["']/g;
const links = new Set();
const linkSources = {};

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    const href = match[1];
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('/images') || href.startsWith('/clientes') || href.startsWith('/favicon')) continue;
    // strip query and hash
    const cleanHref = href.split('?')[0].split('#')[0];
    if (!cleanHref) continue;
    links.add(cleanHref);
    if (!linkSources[cleanHref]) linkSources[cleanHref] = [];
    linkSources[cleanHref].push(path.relative('src', f).replace(/\\/g, '/'));
  }
});

// Check which routes exist in src/pages
const pages = getFiles('src/pages', ['.astro']);
const validRoutes = new Set();
pages.forEach(p => {
  let route = '/' + path.relative('src/pages', p).replace(/\\/g, '/').replace(/\.(astro|md)$/, '');
  if (route.endsWith('/index')) route = route.slice(0, -6);
  if (route === '') route = '/';
  validRoutes.add(route);
});

console.log('Valid routes count:', validRoutes.size);
console.log('Unique internal links found:', links.size);

const broken = [];
links.forEach(l => {
  const norm = l.endsWith('/') && l.length > 1 ? l.slice(0, -1) : l;
  if (!validRoutes.has(norm) && !validRoutes.has(norm + '/index')) {
    // Also ignore dynamic routes like /blog/[slug] if it starts with /blog/
    if (norm.startsWith('/blog/')) {
      return;
    }
    broken.push({ link: l, sources: linkSources[l] });
  }
});

if (broken.length === 0) {
  console.log('SUCCESS: No broken internal links found!');
} else {
  console.log('BROKEN LINKS FOUND:', JSON.stringify(broken, null, 2));
}
