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

const files = getFiles('src/components/home');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const matches = [...content.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);
  const buttons = [...content.matchAll(/<button[^>]*>(.*?)<\/button>/gs)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  const rel = path.relative('src/components/home', f);
  console.log('--- ' + rel + ' ---');
  if (matches.length > 0) console.log('  Hrefs:', matches);
  if (buttons.length > 0) console.log('  Buttons:', buttons);
});
