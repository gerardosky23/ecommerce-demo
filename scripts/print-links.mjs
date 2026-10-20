import fs from 'fs';

const headerContent = fs.readFileSync('src/components/common/HeaderIsland.svelte', 'utf8');
const regex = /href=["']([^"']+)["']/g;
let m;
const headerLinks = new Set();
while ((m = regex.exec(headerContent)) !== null) {
  headerLinks.add(m[1]);
}
console.log('Unique links in HeaderIsland.svelte:');
console.log(Array.from(headerLinks).sort());

const footerContent = fs.readFileSync('src/components/common/Footer.astro', 'utf8');
const footerLinks = new Set();
while ((m = regex.exec(footerContent)) !== null) {
  footerLinks.add(m[1]);
}
console.log('\nUnique links in Footer.astro:');
console.log(Array.from(footerLinks).sort());
