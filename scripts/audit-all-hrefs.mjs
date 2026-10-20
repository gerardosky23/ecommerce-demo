import fs from 'fs';
import path from 'path';

function getFiles(dir, exts = ['.astro', '.svelte']) {
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

const files = getFiles('src');
const allHrefs = new Map();

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.matchAll(/href=["']([^"']+)["']/g);
  for (const m of matches) {
    const href = m[1];
    if (!allHrefs.has(href)) allHrefs.set(href, []);
    allHrefs.get(href).push(path.relative('src', f).replace(/\\/g, '/'));
  }
});

for (const [href, sources] of allHrefs.entries()) {
  console.log(href.padEnd(50), sources.length + ' refs');
}
