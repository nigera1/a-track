import puppeteer from 'puppeteer';

(async () => {
    console.log('Launching browser...');
    // Important: we need to handle window.print() so puppeteer doesn't hang
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Evaluate on new document to mock window.print
    await page.evaluateOnNewDocument(() => {
        window.print = () => {};
    });

    // Set viewport
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
        console.log(`Generating PDF for ${p.name}...`);
        await page.goto(p.url, { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 1000)); // wait for animations/data
        await page.pdf({
            path: `C:\\Users\\geran\\OneDrive\\Desktop\\a-track\\${p.name}.pdf`,
            format: 'A4',
            printBackground: true,
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
        });
    }

    console.log('Generating Order Invoice PDF...');
    try {
        await page.goto('http://localhost:3000/orders', { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 1000));
        
        // Find an order link and click it
        const orderLink = await page.$('table tbody tr');
        if (orderLink) {
            await orderLink.click();
            await new Promise(r => setTimeout(r, 1500));
            
            // Enable invoice mode
            await page.evaluate(() => {
                const btns = Array.from(document.querySelectorAll('button'));
                const invoiceBtn = btns.find(b => b.textContent && b.textContent.includes('Invoice'));
                if (invoiceBtn) invoiceBtn.click();
            });
            await new Promise(r => setTimeout(r, 500));
            
            await page.pdf({
                path: `C:\\Users\\geran\\OneDrive\\Desktop\\a-track\\invoice_example.pdf`,
                format: 'A4',
                printBackground: true
            });
        }
    } catch(err) {
        console.error('Invoice gen error:', err.message);
    }

    await browser.close();
    console.log('All done!');
})();
