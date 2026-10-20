import { chromium } from 'playwright';

async function testLogoSwap() {
  console.log('🔄 Testing Live Logo Swap without Page Reload...');

  // 1. Auth to Backoffice
  const authRes = await fetch('http://localhost:8090/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const { token } = await authRes.json();

  // 2. Fetch current config
  const getRes = await fetch('http://localhost:8090/api/v1/sites/flexone-pe', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const siteConfig = await getRes.json();
  const originalLogoDark = siteConfig.brand.logo_dark_url;
  console.log('🖼️ Current logo_dark_url:', originalLogoDark);

  // 3. Open site in Playwright
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const headerLogo = page.locator('header a[href="/"] img, nav a[href="/"] img').first();
  const initialSrc = await headerLogo.getAttribute('src');
  console.log('🖥️ Header logo on site initially:', initialSrc);

  // 4. Update logo in Backoffice to a new test image
  const testLogo = '/uploads/flexone-pe/1792200375_nextcollege_negro.png';
  siteConfig.brand.logo_dark_url = testLogo;
  await fetch('http://localhost:8090/api/v1/sites/flexone-pe', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(siteConfig)
  });
  console.log('💾 Updated logo_dark_url in Backoffice to:', testLogo);

  // 5. Trigger focus event (simulating switching from backoffice tab to website tab)
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await page.waitForTimeout(800);

  const updatedSrc = await headerLogo.getAttribute('src');
  console.log('🖥️ Header logo on site AFTER live focus sync:', updatedSrc);

  const expectedUpdated = 'http://localhost:8090/uploads/flexone-pe/1792200375_nextcollege_negro.png';
  if (updatedSrc !== expectedUpdated) {
    throw new Error(`Logo swap failed! Expected ${expectedUpdated}, got ${updatedSrc}`);
  }
  console.log('✨ Live Logo Swap Verified successfully!');

  // 6. Restore original logo
  siteConfig.brand.logo_dark_url = originalLogoDark;
  await fetch('http://localhost:8090/api/v1/sites/flexone-pe', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(siteConfig)
  });
  console.log('↩️ Restored original logo in Backoffice to:', originalLogoDark);

  // Trigger sync again to confirm restoration
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await page.waitForTimeout(800);

  const restoredSrc = await headerLogo.getAttribute('src');
  console.log('🖥️ Header logo after restoration sync:', restoredSrc);

  await browser.close();
  console.log('🎉 Logo Live Swap Test 100% PASSED!');
}

testLogoSwap().catch(err => {
  console.error('❌ Logo swap test failed:', err);
  process.exit(1);
});
