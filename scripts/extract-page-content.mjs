import fs from 'fs';

function extractSections(filePath, outputFile) {
  const html = fs.readFileSync(filePath, 'utf8');
  // extract sections
  const sectionMatches = [...html.matchAll(/<section[\s\S]*?<\/section>/gi)];
  const extracted = sectionMatches.map((s, idx) => {
    const raw = s[0];
    const h1 = (raw.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]?.replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
    const h2 = (raw.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i) || [])[1]?.replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
    const h3s = [...raw.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' '));
    const paragraphs = [...raw.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' '));
    const lis = [...raw.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' '));
    return {
      index: idx,
      h1,
      h2,
      h3s,
      paragraphs: paragraphs.slice(0, 10),
      lis: lis.slice(0, 10),
      rawSample: raw.substring(0, 500)
    };
  });
  fs.writeFileSync(outputFile, JSON.stringify(extracted, null, 2), 'utf8');
  console.log(`Saved ${extracted.length} sections to ${outputFile}`);
}

extractSections('spec_data/investigation/orig-servicios-implementacion.html', 'spec_data/investigation/parsed-implementacion.json');
extractSections('spec_data/investigation/orig-localizacion-planillas.html', 'spec_data/investigation/parsed-planillas.json');
