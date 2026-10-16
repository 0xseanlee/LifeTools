// 執行前在 repo 根目錄啟動靜態伺服器，並安裝 Playwright 與 Chromium。
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');

(async () => {
    const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
    try {
        const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(`${process.env.TEST_BASE_URL || 'http://127.0.0.1:8776'}/pages/images-to-pdf.html`);
        assert.equal(await page.locator('#exportBtn').isDisabled(), true);
        // 使用可辨識的不同色塊與方向，驗證順序與旋轉後的頁面方向。
        const images = await page.evaluate(() => {
            return [[800, 400, 'red'], [400, 800, 'blue']].map(([width, height, color]) => {
                const canvas = document.createElement('canvas');
                canvas.width = width; canvas.height = height;
                const context = canvas.getContext('2d');
                context.fillStyle = color; context.fillRect(0, 0, width, height);
                return canvas.toDataURL('image/png').split(',')[1];
            });
        });
        await page.locator('#imageInput').setInputFiles(images.map((image, index) => ({ name: `${index}.png`, mimeType: 'image/png', buffer: Buffer.from(image, 'base64') })));
        await page.waitForFunction(() => document.querySelectorAll('.image-row').length === 2 && !document.querySelector('#exportBtn').disabled);
        await page.locator('.image-row').nth(1).getByRole('button', { name: '上移第 2 張圖片', exact: true }).click();
        assert.match(await page.locator('.image-name').first().textContent(), /1\.png/);
        await page.locator('.image-row').first().getByRole('button', { name: '旋轉第 1 張圖片', exact: true }).click();
        assert.equal(await page.locator('.thumbnail').first().evaluate(image => image.style.transform), 'rotate(90deg)');
        await page.locator('#pdfFilename').fill('測試合併.pdf');
        const downloadPromise = page.waitForEvent('download');
        await page.locator('#exportBtn').click();
        const download = await downloadPromise;
        assert.equal(download.suggestedFilename(), '測試合併.pdf');
        const output = process.env.TEST_PDF_PATH || path.join(os.tmpdir(), 'lifetools-images-test.pdf');
        await download.saveAs(output);
        await page.waitForFunction(() => !document.querySelector('#exportBtn').disabled);
        // 不支援的檔案與損毀圖片不應破壞已加入的清單。
        await page.locator('#imageInput').setInputFiles([{ name: 'bad.png', mimeType: 'image/png', buffer: Buffer.from('broken') }, { name: 'file.txt', mimeType: 'text/plain', buffer: Buffer.from('text') }]);
        await page.locator('#errorModal.show').waitFor();
        assert.match(await page.locator('#errorModalBody').textContent(), /bad.png/);
        assert.equal(await page.locator('.image-row').count(), 2);
        await page.locator('.modal-close-btn').click();
        await page.waitForFunction(() => getComputedStyle(document.getElementById('errorModal')).opacity === '0');
        await page.setViewportSize({ width: 390, height: 844 });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await page.screenshot({ path: process.env.TEST_SCREENSHOT_PATH || path.join(os.tmpdir(), 'lifetools-images-mobile.png'), fullPage: true });
        await page.locator('.image-row').first().getByRole('button', { name: '移除第 1 張圖片', exact: true }).click();
        assert.equal(await page.locator('.image-row').count(), 1);
        await page.locator('#clearBtn').click();
        assert.equal(await page.locator('#exportBtn').isDisabled(), true);
        assert.deepEqual(errors, []);
        console.log(`Browser checks passed; generated PDF: ${output}`);
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
