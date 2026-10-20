import fs from 'fs';

const html = fs.readFileSync('spec_data/investigation/orig-servicios-implementacion.html', 'utf8');

// Find all img tags in original implementacion
const imgs = [...html.matchAll(/<img[^>]+src=\"([^\">]+)\"[^>]*>/gi)].map(m => m[1]);
console.log('Images in implementacion:', imgs);

// Find all SVGs or icons
const svgs = [...html.matchAll(/<svg[\s\S]*?<\/svg>/gi)].length;
console.log('SVGs count:', svgs);
