import fs from 'fs';

function inspectFaqSection(html, heading) {
  const idx = html.indexOf(heading);
  if (idx !== -1) {
    const chunk = html.substring(idx, idx + 4000);
    console.log(`\n=== FAQ SECTION for "${heading}" ===`);
    console.log(chunk.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').substring(0, 1500));
  }
}

const htmlImpl = fs.readFileSync('spec_data/investigation/orig-servicios-implementacion.html', 'utf8');
inspectFaqSection(htmlImpl, 'Preguntas frecuentes');

const htmlPlan = fs.readFileSync('spec_data/investigation/orig-localizacion-planillas.html', 'utf8');
inspectFaqSection(htmlPlan, 'Preguntas sobre la planilla en Odoo');
