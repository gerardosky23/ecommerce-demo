import fs from 'fs';
import path from 'path';

function getFiles(dir, exts = ['.astro']) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) results = results.concat(getFiles(file, exts));
    else if (exts.some(ext => file.endsWith(ext))) results.push(file);
  });
  return results;
}

const pages = getFiles('src/pages');
pages.forEach(p => {
  const rel = path.relative('src/pages', p).replace(/\\/g, '/');
  if (rel === 'index.astro') return;
  const content = fs.readFileSync(p, 'utf8');
  const hasSubHero = content.includes('<SubpageHero');
  const sectionMatch = content.match(/<section[^>]*class=["']([^"']*)["']/);
  const mainMatch = content.match(/<main[^>]*class=["']([^"']*)["']/);
  console.log(rel.padEnd(45), hasSubHero ? 'Uses <SubpageHero />' : ('First <section>: ' + (sectionMatch ? sectionMatch[1] : 'NONE')));
});
