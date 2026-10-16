// 靜態伺服器預設使用 8776 埠；需安裝 Playwright 與 Chromium。
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const JSZip = require('../scripts/vendor/jszip-3.10.2.min.js');

(async () => {
    const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
    const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'lifetools-converter-test-'));
    try {
        const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(`${process.env.TEST_BASE_URL || 'http://127.0.0.1:8776'}/pages/file-converter.html`);
        assert.equal(await page.locator('#convertBtn').isDisabled(), true);
        // 操作實際選檔與下拉選單，下載輸出檔供內容驗證。
        async function upload(name, mimeType, buffer) {
            await page.locator('#fileInput').setInputFiles({ name, mimeType, buffer });
            await page.waitForFunction(() => !document.getElementById('targetFormat').disabled);
        }
        async function convert(target) {
            await page.locator('#targetFormat').selectOption(target);
            await page.locator('#convertBtn').click();
            const outcome = await Promise.race([
                page.locator('#resultPanel').waitFor({ state: 'visible', timeout: 30000 }).then(() => 'success'),
                page.locator('#errorModal.show').waitFor({ timeout: 30000 }).then(() => 'error')
            ]);
            if (outcome === 'error') throw new Error(`${target}: ${await page.locator('#errorModalBody').textContent()}`);
            const event = page.waitForEvent('download');
            await page.locator('#downloadLink').click();
            const download = await event;
            const location = path.join(folder, download.suggestedFilename());
            await download.saveAs(location);
            console.log(`Converted ${target}: ${download.suggestedFilename()}`);
            return fs.readFile(location);
        }
        const png = Buffer.from(await page.evaluate(() => {
            const canvas = document.createElement('canvas'); canvas.width = 120; canvas.height = 60;
            const context = canvas.getContext('2d'); context.fillStyle = 'red'; context.fillRect(0, 0, 60, 60);
            return canvas.toDataURL().split(',')[1];
        }), 'base64');
        await upload('sample.png', 'image/png', png);
        assert.deepEqual(await page.locator('#targetFormat option').evaluateAll(options => options.map(option => option.value)), ['png', 'jpg', 'webp', 'pdf']);
        const jpg = await convert('jpg');
        assert.equal(jpg.subarray(0, 2).toString('hex'), 'ffd8');
        // 透明區域在 JPG 中應為白色，驗證內容不是僅更改副檔名。
        const white = await page.evaluate(async base64 => {
            const image = new Image(); image.src = `data:image/jpeg;base64,${base64}`; await image.decode();
            const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
            const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
            return Array.from(context.getImageData(100, 30, 1, 1).data);
        }, jpg.toString('base64'));
        assert.ok(white.slice(0, 3).every(value => value > 245));
        const webp = await convert('webp'); assert.equal(webp.subarray(8, 12).toString(), 'WEBP');
        const convertedPng = await convert('png'); assert.equal(convertedPng.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
        const imagePdf = await convert('pdf'); assert.equal(imagePdf.subarray(0, 5).toString(), '%PDF-');
        // 使用兩頁文字 PDF，驗證頁碼、圖片 ZIP 與文字擷取。
        const pdfBytes = Buffer.from(await page.evaluate(() => {
            const doc = new window.jspdf.jsPDF(); doc.text('Hello converter page one', 20, 20);
            doc.addPage(); doc.text('Second page selected', 20, 20);
            return Array.from(new Uint8Array(doc.output('arraybuffer')));
        }));
        await upload('document.pdf', 'application/pdf', pdfBytes);
        await page.locator('#firstPage').fill('2'); await page.locator('#lastPage').fill('2');
        const zipData = await convert('png-zip');
        const zip = await JSZip.loadAsync(zipData);
        assert.deepEqual(Object.keys(zip.files), ['page-002.png']);
        assert.equal((await zip.file('page-002.png').async('nodebuffer')).subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
        const jpgZip = await JSZip.loadAsync(await convert('jpg-zip'));
        assert.equal((await jpgZip.file('page-002.jpg').async('nodebuffer')).subarray(0, 2).toString('hex'), 'ffd8');
        const text = (await convert('txt')).toString('utf8');
        assert.match(text, /Second page selected/); assert.doesNotMatch(text, /Hello converter/);
        // 含逗號、雙引號、換行與特殊欄位名的 CSV round-trip。
        const csv = 'name,note,__proto__\r\n小明,"hi, ""there""\nnext",safe\r\n';
        await upload('data.csv', 'text/csv', Buffer.from(csv));
        const json = await convert('json'); const data = JSON.parse(json);
        assert.equal(data[0].note, 'hi, "there"\nnext'); assert.equal(data[0].__proto__, 'safe');
        await upload('data.json', 'application/json', json);
        const csvOutput = (await convert('csv')).toString('utf8');
        assert.ok(csvOutput.startsWith('\uFEFF')); assert.match(csvOutput, /"hi, ""there""\nnext"/);
        const pretty = (await convert('json')).toString(); assert.equal(JSON.parse(pretty)[0].name, '小明');
        await upload('lines.txt', 'text/plain', Buffer.from('第一行\n第二行'));
        assert.deepEqual(JSON.parse(await convert('json')), ['第一行', '第二行']);
        assert.match((await convert('csv')).toString(), /text\r\n第一行\r\n第二行/);
        // 使用獨立建立的 PCM WAV fixture，重新解碼輸出確認時長。
        const sampleRate = 8000; const samples = 800; const wav = Buffer.alloc(44 + samples * 2);
        wav.write('RIFF'); wav.writeUInt32LE(36 + samples * 2, 4); wav.write('WAVE', 8); wav.write('fmt ', 12);
        wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
        wav.writeUInt32LE(sampleRate, 24); wav.writeUInt32LE(sampleRate * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
        wav.write('data', 36); wav.writeUInt32LE(samples * 2, 40);
        for (let index = 0; index < samples; index++) wav.writeInt16LE(Math.round(Math.sin(index * 2 * Math.PI * 440 / sampleRate) * 16000), 44 + index * 2);
        await upload('tone.wav', 'audio/wav', wav);
        const outputWav = await convert('wav'); assert.equal(outputWav.subarray(0, 4).toString(), 'RIFF');
        const duration = await page.evaluate(async bytes => {
            const context = new AudioContext();
            try { const decoded = await context.decodeAudioData(new Uint8Array(bytes).buffer); return decoded.duration; }
            finally { await context.close(); }
        }, Array.from(outputWav));
        assert.ok(Math.abs(duration - .1) < .01);
        // 錯誤輸入不應產生下載結果，使用者可以修正後再轉。
        await upload('broken.json', 'application/json', Buffer.from('{bad'));
        await page.locator('#convertBtn').click(); await page.locator('#errorModal.show').waitFor();
        assert.match(await page.locator('#errorModalBody').textContent(), /JSON 格式不正確/);
        assert.equal(await page.locator('#resultPanel').isVisible(), false);
        await page.locator('.modal-close-btn').click();
        await page.waitForFunction(() => getComputedStyle(document.getElementById('errorModal')).opacity === '0');
        await upload('sample.png', 'image/png', png); await convert('webp');
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: path.join(folder, 'desktop.png'), fullPage: true });
        await page.setViewportSize({ width: 390, height: 844 });
        await page.evaluate(() => window.scrollTo(0, 0));
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await page.screenshot({ path: path.join(folder, 'mobile.png'), fullPage: true });
        await page.locator('#clearBtn').click(); assert.equal(await page.locator('#convertBtn').isDisabled(), true);
        assert.deepEqual(errors, []);
        console.log(`All conversion browser checks passed. Artifacts: ${folder}`);
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
