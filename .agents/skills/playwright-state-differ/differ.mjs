import { chromium } from 'playwright';

export async function inspectSelectorStates({ url, selector, viewport = { width: 1440, height: 900 } }) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  const page = await context.newPage();

  console.log(`🔍 Inspeccionando selector "${selector}" en ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(1000);

  const target = page.locator(selector).first();
  if (await target.count() === 0) {
    console.error(`❌ Selector "${selector}" no encontrado.`);
    await browser.close();
    return null;
  }

  const propsToTrack = [
    'transform',
    'transition',
    'backgroundColor',
    'color',
    'boxShadow',
    'opacity',
    'borderColor',
    'visibility',
    'maxHeight',
    'display'
  ];

  async function getComputedFiltered() {
    return await target.evaluate((el, props) => {
      const s = window.getComputedStyle(el);
      const res = {};
      props.forEach((p) => {
        res[p] = s[p];
      });
      return {
        styles: res,
        html: el.outerHTML,
        childrenCount: el.querySelectorAll('*').length
      };
    }, propsToTrack);
  }

  // 1. Estado Initial
  const initialState = await getComputedFiltered();

  // 2. Estado Hover
  await target.hover();
  await page.waitForTimeout(400);
  const hoverState = await getComputedFiltered();

  // 3. Estado Click
  await target.click().catch(() => {});
  await page.waitForTimeout(400);
  const clickState = await getComputedFiltered();

  function calculateDiff(base, changed) {
    const diff = {};
    for (const [k, v] of Object.entries(changed.styles)) {
      if (base.styles[k] !== v) {
        diff[k] = { from: base.styles[k], to: v };
      }
    }
    return {
      styleDiffs: diff,
      newDomRevealed: changed.childrenCount > base.childrenCount,
      childrenDiff: changed.childrenCount - base.childrenCount
    };
  }

  const hoverDiff = calculateDiff(initialState, hoverState);
  const clickDiff = calculateDiff(initialState, clickState);

  await browser.close();

  const report = {
    selector,
    initial: initialState.styles,
    hoverDiff,
    clickDiff
  };

  console.log('📊 Diferencial de estados obtenido:');
  console.log(JSON.stringify(report, null, 2));
  return report;
}

// Ejecución directa por CLI
if (process.argv[1]?.endsWith('differ.mjs')) {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => a.replace(/^--/, '').split('='))
  );
  inspectSelectorStates({
    url: args.url || 'https://flexone.pe/',
    selector: args.selector || 'header nav'
  }).catch(console.error);
}
