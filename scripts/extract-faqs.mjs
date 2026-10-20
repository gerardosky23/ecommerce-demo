import fs from 'fs';

function extractAllFaqs(html, heading) {
  const start = html.indexOf(heading);
  if (start === -1) return [];
  const end = html.indexOf('</section>', start);
  const chunk = html.substring(start, end);
  
  // Accordion buttons / questions
  const btnMatches = [...chunk.matchAll(/<button[^>]*class=\"[^\"]*accordion-button[^\"]*\"[^>]*>([\s\S]*?)<\/button>/gi)];
  const bodyMatches = [...chunk.matchAll(/<div[^>]*class=\"[^\"]*accordion-body[^\"]*\"[^>]*>([\s\S]*?)<\/div>/gi)];

  const faqs = btnMatches.map((btn, i) => ({
    q: btn[1].replace(/<[^>]+>/g, '').trim(),
    a: bodyMatches[i] ? bodyMatches[i][1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : ''
  }));
  return faqs;
}

const htmlImpl = fs.readFileSync('spec_data/investigation/orig-servicios-implementacion.html', 'utf8');
console.log('Implementacion FAQs:', extractAllFaqs(htmlImpl, 'Preguntas frecuentes'));

const htmlPlan = fs.readFileSync('spec_data/investigation/orig-localizacion-planillas.html', 'utf8');
console.log('\nPlanillas FAQs:', extractAllFaqs(htmlPlan, 'Preguntas sobre la planilla en Odoo'));
