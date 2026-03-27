import puppeteer from 'puppeteer-core';

(async () => {
  console.log('Launching Chromium...');

  try {
    const browser = await puppeteer.launch({
      executablePath: '/tmp/chromium/chromium',
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    console.log('✅ Chromium launched successfully!');

    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 667 }); // iPhone SE

    console.log('📱 Testing navigation...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0', timeout: 10000 });

    console.log('✅ Page loaded!');
    console.log('Title:', await page.title());

    // Get page content
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Page contains:', bodyText.substring(0, 200) + '...');

    // Check for key elements
    const hasQuickLog = await page.evaluate(() => {
      return document.body.innerText.includes('Quick Log');
    });
    console.log('Has Quick Log section:', hasQuickLog ? '✅' : '❌');

    await browser.close();
    console.log('✅ Browser closed successfully');
    console.log('\n🎉 Browser automation is WORKING!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
