const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = 'C:\\Users\\gideo\\OneDrive\\Desktop\\EC0\\UI_Mockups';

async function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

async function run() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 }
    });
    
    try {
        const page = await context.newPage();
        
        // 1. Figure 4.1: User Registration
        console.log('Capturing Figure 4.1...');
        await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle' });
        await page.fill('input[type="password"]', 'P@ssw0rd123'); // trigger validation ui
        await page.fill('input[placeholder="e.g. Ama Serwaa"]', 'John Doe');
        await page.fill('input[placeholder="you@example.com"]', 'john@example.com');
        await delay(1000);
        await page.screenshot({ path: path.join(OUTPUT_DIR, 'Figure_4.1_Registration_Login.png') });

        // 2. Figure 4.2: Marketplace Homepage
        console.log('Capturing Figure 4.2...');
        await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
        await delay(1500); // wait for images
        await page.screenshot({ path: path.join(OUTPUT_DIR, 'Figure_4.2_Marketplace_Homepage.png'), fullPage: true });

        // helper to login
        const loginAs = async (email, password) => {
            await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
            await page.fill('input[type="email"]', email);
            await page.fill('input[type="password"]', password);
            await page.click('button[type="submit"]');
            await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(e => {});
            await delay(1000);
        };

        // 3. Figure 4.3: AI Verification Interface (Vendor)
        console.log('Capturing Figure 4.3...');
        await loginAs('info@greensolutions.com', 'password123');
        await page.goto('http://localhost:5173/add-product', { waitUntil: 'networkidle' });
        
        // Fill form and submit to trigger AI Verification
        await page.fill('input[placeholder*="Bamboo Toothbrush"]', 'Eco Friendly Bamboo Mug');
        await page.fill('input[placeholder="0.00"]', '25');
        await page.fill('input[placeholder="1"]', '50');
        await page.fill('input[placeholder*="FSC"]', 'FSC, Organic');
        await page.fill('textarea', 'Made of 100% natural bamboo.');
        await page.click('button[type="submit"]');
        
        // wait for the verification result to appear (the green/red box)
        try {
            await page.waitForSelector('h3:has-text("AI Verification")', { timeout: 10000 });
            await delay(3000); // wait for animations
        } catch (e) {}
        await page.screenshot({ path: path.join(OUTPUT_DIR, 'Figure_4.3_AI_Verification.png') });

        // Logout
        await page.click('text=Profile');
        await delay(500);
        const logoutBtn = await page.$("button:has-text('Logout')");
        if (logoutBtn) {
            await logoutBtn.click();
            await delay(1000);
        }

        // 4. Figure 4.4: Checkout and Escrow (Buyer)
        console.log('Capturing Figure 4.4...');
        await loginAs('buyer@eco.com', 'password123');
        // add item to cart
        await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
        await delay(1000);
        const addToCartBtns = await page.$$('button:has-text("Add to Cart")');
        if (addToCartBtns.length > 0) {
            await addToCartBtns[0].click();
            await delay(1500);
        }
        await page.goto('http://localhost:5173/checkout', { waitUntil: 'networkidle' });
        await delay(1500);
        await page.screenshot({ path: path.join(OUTPUT_DIR, 'Figure_4.4_Checkout_Escrow.png'), fullPage: true });

        // Logout
        await page.goto('http://localhost:5173/profile', { waitUntil: 'networkidle' });
        await delay(500);
        const logoutBtn2 = await page.$("button:has-text('Logout')");
        if (logoutBtn2) {
            await logoutBtn2.click();
            await delay(1000);
        }

        // 5. Figure 4.5: Admin Dashboard
        console.log('Capturing Figure 4.5...');
        await loginAs('admin@eco.com', 'password123');
        await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle' });
        await delay(2000); // wait for charts to render
        await page.screenshot({ path: path.join(OUTPUT_DIR, 'Figure_4.5_Administrator_Dashboard.png'), fullPage: true });

        console.log('All done!');
    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

run();
