import fs from 'fs';

function inspect(filePath) {
  console.log(`\n=================== ${filePath} ===================`);
  const html = fs.readFileSync(filePath, 'utf8');

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  console.log('Title:', titleMatch ? titleMatch[1].trim() : 'N/A');

  const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' '));
  console.log('H1:', h1Matches);

  const h2Matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' '));
  console.log('H2s:', h2Matches);

  const h3Matches = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' '));
  console.log('H3s:', h3Matches.slice(0, 15));
}

inspect('spec_data/investigation/orig-servicios-implementacion.html');
inspect('spec_data/investigation/orig-localizacion-planillas.html');
