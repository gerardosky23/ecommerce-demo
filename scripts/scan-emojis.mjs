import fs from 'fs';
import path from 'path';

// Regex for finding emojis (Unicode ranges)
const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/u;

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(fullPath));
    } else if (file.endsWith('.astro') || file.endsWith('.svelte')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walkDir('src');
console.log(`Scanning ${files.length} files for residual emojis...`);

let foundCount = 0;
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Ignore comments or normal text if no emoji
    const match = line.match(emojiRegex);
    if (match) {
      console.log(`[EMOJI] ${file}:${idx + 1} -> ${match[0]} in line: "${line.trim().substring(0, 80)}"`);
      foundCount++;
    }
  });
}

console.log(`\nScan finished. Total emoji occurrences: ${foundCount}`);
