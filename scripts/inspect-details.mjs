import fs from 'fs';

const htmlImpl = fs.readFileSync('spec_data/investigation/orig-servicios-implementacion.html', 'utf8');

console.log('--- IMPLEMENTACION FAQS ---');
const faqs = [...htmlImpl.matchAll(/<details[\s\S]*?<\/details>/gi)].map(d => {
  const sum = (d[0].match(/<summary[^>]*>([\s\S]*?)<\/summary>/i) || [])[1]?.replace(/<[^>]+>/g, '').trim();
  const content = d[0].replace(/<summary[\s\S]*?<\/summary>/i, '').replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
  return { q: sum, a: content };
});
faqs.forEach((f, i) => {
  console.log(`Q${i+1}: ${f.q}`);
  console.log(`A${i+1}: ${f.a}\n`);
});

console.log('--- IMPLEMENTACION HERO ---');
const heroMatch = htmlImpl.match(/<h1[\s\S]*?<\/section>/i);
if (heroMatch) {
  console.log(heroMatch[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
}

console.log('\n--- PLANILLAS FAQS ---');
const htmlPlan = fs.readFileSync('spec_data/investigation/orig-localizacion-planillas.html', 'utf8');
const faqsPlan = [...htmlPlan.matchAll(/<details[\s\S]*?<\/details>/gi)].map(d => {
  const sum = (d[0].match(/<summary[^>]*>([\s\S]*?)<\/summary>/i) || [])[1]?.replace(/<[^>]+>/g, '').trim();
  const content = d[0].replace(/<summary[\s\S]*?<\/summary>/i, '').replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
  return { q: sum, a: content };
});
faqsPlan.forEach((f, i) => {
  console.log(`Q${i+1}: ${f.q}`);
  console.log(`A${i+1}: ${f.a}\n`);
});

console.log('--- PLANILLAS HERO ---');
const heroPlanMatch = htmlPlan.match(/<h1[\s\S]*?<\/section>/i);
if (heroPlanMatch) {
  console.log(heroPlanMatch[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
}
