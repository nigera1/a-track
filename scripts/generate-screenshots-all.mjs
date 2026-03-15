import puppeteer from 'puppeteer';

(async () => {
    console.log('Launching browser for screenshots...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.evaluateOnNewDocument(() => {
        window.print = () => {};
    });

    await page.setViewport({ width: 1400, height: 900 });

    const pages = [
        { name: 'dashboard', url: 'http://localhost:3000/dashboard' },
        { name: 'orders', url: 'http://localhost:3000/orders' },
        { name: 'deals', url: 'http://localhost:3000/deals' },
        { name: 'analytics', url: 'http://localhost:3000/analytics' },
        { name: 'customers', url: 'http://localhost:3000/customers' },
        { name: 'suppliers', url: 'http://localhost:3000/suppliers' }
    ];

    for (const p of pages) {
        console.log(`Taking screenshot: ${p.name}...`);
        await page.goto(p.url, { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: `C:\\Users\\geran\\.gemini\\antigravity\\brain\\fd3700ec-351a-4b6d-9316-1a393c804128\\${p.name}.png` });
    }

    console.log('Taking screenshot for Order Detail & Invoice...');
    try {
        await page.goto('http://localhost:3000/orders', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 1000));
        
        const orderLink = await page.$('table tbody tr');
        if (orderLink) {
            await orderLink.click();
            await new Promise(r => setTimeout(r, 1500));
            
            await page.screenshot({ path: `C:\\Users\\geran\\.gemini\\antigravity\\brain\\fd3700ec-351a-4b6d-9316-1a393c804128\\order_detail.png` });

            await page.evaluate(() => {
                const btns = Array.from(document.querySelectorAll('button'));
                const invoiceBtn = btns.find(b => b.textContent && b.textContent.includes('Invoice'));
                if (invoiceBtn) invoiceBtn.click();
            });
            await new Promise(r => setTimeout(r, 500));
            
            await page.screenshot({ path: `C:\\Users\\geran\\.gemini\\antigravity\\brain\\fd3700ec-351a-4b6d-9316-1a393c804128\\invoice.png`, fullPage: true });
        } else {
            console.log('No order link found.');
        }
    } catch(err) {
        console.error('Invoice gen error:', err.message);
    }

    await browser.close();
    console.log('Screenshots complete!');
})();
