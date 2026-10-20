import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:4322';

const ROUTES = [
  '/',
  '/sistemas/smart-erp',
  '/soluciones/contabilidad-sire',
  '/soluciones/kardex-valorizado',
  '/infraestructura/proxmox',
  '/servicios/migracion-sap',
  '/industrias/manufactura',
  '/nosotros',
  '/contacto',
  '/casos'
];

async function runAudit() {
  console.log(`Starting Typography & Button UI/UX Audit on ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  
  const report = {
    pagesAudited: 0,
    headingStats: {},
    paragraphStats: {},
    buttonStats: {},
    issues: []
  };

  for (const route of ROUTES) {
    const url = `${BASE_URL}${route}`;
    // Test both Desktop (1440x900) and Mobile (375x812)
    for (const viewport of [{ width: 1440, height: 900, name: 'desktop' }, { width: 375, height: 812, name: 'mobile' }]) {
      const page = await browser.newPage({ viewport });
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        report.pagesAudited++;

        const pageAnalysis = await page.evaluate(({ route, vpName }) => {
          const findings = {
            h1: [],
            h2: [],
            h3: [],
            p: [],
            buttons: [],
            overflows: []
          };

          // Helper to get element details
          function getDetails(el) {
            const cs = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            const parent = el.parentElement;
            const parentRect = parent ? parent.getBoundingClientRect() : null;
            const fs = parseFloat(cs.fontSize);
            const lh = parseFloat(cs.lineHeight) || fs * 1.2;
            const ratio = lh / fs;
            
            return {
              tag: el.tagName.toLowerCase(),
              text: el.innerText.trim().slice(0, 60),
              fontSize: cs.fontSize,
              fontWeight: cs.fontWeight,
              lineHeight: cs.lineHeight,
              ratio: Math.round(ratio * 100) / 100,
              letterSpacing: cs.letterSpacing,
              color: cs.color,
              bgColor: cs.backgroundColor,
              padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
              borderRadius: cs.borderRadius,
              width: rect.width,
              height: rect.height,
              isOverflowing: el.scrollWidth > el.clientWidth + 2
            };
          }

          document.querySelectorAll('h1').forEach(el => findings.h1.push(getDetails(el)));
          document.querySelectorAll('h2').forEach(el => findings.h2.push(getDetails(el)));
          document.querySelectorAll('h3').forEach(el => findings.h3.push(getDetails(el)));
          
          document.querySelectorAll('p').forEach(el => {
            if (el.innerText.trim().length > 10) {
              findings.p.push(getDetails(el));
            }
          });

          document.querySelectorAll('button, a[class*="rounded"], a[class*="btn"], a[class*="px-"]').forEach(el => {
            if (el.offsetParent !== null && el.innerText.trim().length > 0) {
              findings.buttons.push(getDetails(el));
            }
          });

          // Check horizontal overflow
          document.querySelectorAll('*').forEach(el => {
            if (el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 4) {
              // Ignore body/html
              if (el !== document.body && el !== document.documentElement && !el.classList.contains('overflow-x-auto') && !el.classList.contains('marquee-track')) {
                findings.overflows.push({
                  tag: el.tagName.toLowerCase(),
                  className: el.className.toString().slice(0, 80),
                  scrollWidth: el.scrollWidth,
                  clientWidth: el.clientWidth,
                  text: el.innerText.trim().slice(0, 40)
                });
              }
            }
          });

          return findings;
        }, { route, vpName: viewport.name });

        // Aggregate statistics
        ['h1', 'h2', 'h3'].forEach(hTag => {
          pageAnalysis[hTag].forEach(item => {
            const key = `${hTag}_${viewport.name}_${item.fontSize}_${item.fontWeight}`;
            report.headingStats[key] = (report.headingStats[key] || 0) + 1;
            
            // Check UI/UX rules
            if (item.ratio < 1.05 && hTag === 'h1') {
              report.issues.push(`[${viewport.name}] ${route}: H1 line-height too tight (${item.lineHeight} on ${item.fontSize}): "${item.text}"`);
            }
            if (item.ratio > 1.4 && (hTag === 'h1' || hTag === 'h2')) {
              report.issues.push(`[${viewport.name}] ${route}: ${hTag.toUpperCase()} line-height too loose (${item.ratio}): "${item.text}"`);
            }
          });
        });

        pageAnalysis.p.forEach(item => {
          const key = `p_${viewport.name}_${item.fontSize}_${item.fontWeight}`;
          report.paragraphStats[key] = (report.paragraphStats[key] || 0) + 1;

          if (item.ratio < 1.3 && item.text.length > 50) {
            report.issues.push(`[${viewport.name}] ${route}: Paragraph line-height cramped (${item.ratio}): "${item.text}"`);
          }
        });

        pageAnalysis.buttons.forEach(btn => {
          const key = `btn_${viewport.name}_${btn.padding}_${btn.fontSize}_${btn.fontWeight}`;
          report.buttonStats[key] = (report.buttonStats[key] || 0) + 1;
        });

        if (pageAnalysis.overflows.length > 0) {
          pageAnalysis.overflows.forEach(o => {
            report.issues.push(`[${viewport.name}] ${route}: Horizontal overflow in <${o.tag} class="${o.className}"> (${o.scrollWidth}px > ${o.clientWidth}px): "${o.text}"`);
          });
        }

      } catch (err) {
        console.error(`Error auditing ${route} on ${viewport.name}:`, err.message);
      } finally {
        await page.close();
      }
    }
  }

  await browser.close();

  console.log('\n=== AUDIT SUMMARY ===');
  console.log(`Total Pages / Viewports Audited: ${report.pagesAudited}`);
  
  console.log('\nTop Heading Configurations:');
  Object.entries(report.headingStats).sort((a,b) => b[1] - a[1]).slice(0, 15).forEach(([k, count]) => {
    console.log(`  ${k}: ${count} instances`);
  });

  console.log('\nTop Paragraph Configurations:');
  Object.entries(report.paragraphStats).sort((a,b) => b[1] - a[1]).slice(0, 15).forEach(([k, count]) => {
    console.log(`  ${k}: ${count} instances`);
  });

  console.log('\nTop Button Configurations:');
  Object.entries(report.buttonStats).sort((a,b) => b[1] - a[1]).slice(0, 15).forEach(([k, count]) => {
    console.log(`  ${k}: ${count} instances`);
  });

  console.log(`\nDetected Issues (${report.issues.length}):`);
  report.issues.slice(0, 30).forEach(iss => console.log(`  - ${iss}`));
  if (report.issues.length > 30) {
    console.log(`  ... and ${report.issues.length - 30} more.`);
  }

  return report;
}

runAudit();
