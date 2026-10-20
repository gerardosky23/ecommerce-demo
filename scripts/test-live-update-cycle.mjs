import { chromium } from 'playwright';

async function testLiveUpdate() {
  console.log('🔄 Testing End-to-End Live Reactivity between Backoffice and Flexone Site...');

  // 1. Authenticate to Backoffice API
  const authRes = await fetch('http://localhost:8090/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  if (!authRes.ok) throw new Error('Auth failed: ' + authRes.statusText);
  const { token } = await authRes.json();
  console.log('🔑 Authenticated successfully to Backoffice!');

  // 2. Fetch current config
  const getRes = await fetch('http://localhost:8090/api/v1/sites/flexone-pe', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const siteConfig = await getRes.json();
  const originalPhone = siteConfig.contact_rail.phone_label;
  console.log('📞 Current Phone Label in Backoffice:', originalPhone);

  // 3. Open Flexone in Playwright
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Hover or click phone button to reveal popover
  await page.click('#nc-btn-phone');
  await page.waitForTimeout(300);
  const initialDisplayedPhone = await page.textContent('.nc-pop-phone-num');
  console.log('🖥️ Phone displayed on Flexone before update:', initialDisplayedPhone.trim());

  // 4. Update Phone in Backoffice to a new value
  const testPhone = '+51 999 111 222';
  siteConfig.contact_rail.phone_label = testPhone;
  const updateRes = await fetch('http://localhost:8090/api/v1/sites/flexone-pe', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(siteConfig)
  });
  if (!updateRes.ok) throw new Error('Update failed: ' + updateRes.statusText);
  console.log('💾 Updated phone in Backoffice to:', testPhone);

  // 5. Trigger focus event or wait for 4s poll
  console.log('⏱️ Waiting for real-time reactivity (poll/focus)...');
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await page.waitForTimeout(1000);

  const updatedDisplayedPhone = await page.textContent('.nc-pop-phone-num');
  console.log('🖥️ Phone displayed on Flexone AFTER update:', updatedDisplayedPhone.trim());

  if (updatedDisplayedPhone.trim() !== testPhone) {
    throw new Error(`Reactivity failed! Expected ${testPhone}, got ${updatedDisplayedPhone.trim()}`);
  }
  console.log('✨ Live Reactivity Verified! The page updated dynamically without reload!');

  // 6. Restore original phone
  siteConfig.contact_rail.phone_label = originalPhone;
  await fetch('http://localhost:8090/api/v1/sites/flexone-pe', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(siteConfig)
  });
  console.log('↩️ Restored original phone in Backoffice to:', originalPhone);

  await browser.close();
  console.log('🎉 Full End-to-End Live Reactivity Test PASSED!');
}

testLiveUpdate().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
