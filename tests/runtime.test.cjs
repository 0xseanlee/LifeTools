const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

// 建立隔離環境，記錄原生 fetch 收到的參數。
function loadInit(storage = new Map()) {
    const calls = [];
    const window = { fetch: async (...args) => { calls.push(args); return {}; } };
    window.self = window.top = window;
    const document = { documentElement: { innerHTML: 'page content' } };
    const context = vm.createContext({ window, document, Request, URL, console: { log() {} },
        location: { href: 'https://example.com/LifeTools/index.html', origin: 'https://example.com', pathname: '/LifeTools/index.html' },
        localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) } });
    vm.runInContext(fs.readFileSync(path.join(root, 'scripts/init.js'), 'utf8'), context);
    return { window, document, calls };
}

test('rate limit rejects requests while preserving page content', async () => {
    const { window, document, calls } = loadInit();
    for (let i = 0; i < 60; i++) await window.fetch('/test');
    await assert.rejects(window.fetch('/test'), /請求過於頻繁/);
    assert.equal(document.documentElement.innerHTML, 'page content');
    assert.equal(calls.length, 60);
});

test('blocked storage does not break initialization or fetch', async () => {
    const { window, calls } = loadInit({ get() { throw new Error('Blocked'); } });
    await window.fetch('/test');
    assert.equal(calls.length, 1);
});

test('config cache bypass accepts URL and Request without mutating options', async () => {
    const { window, calls } = loadInit();
    const options = Object.freeze({ cache: 'default', headers: { 'X-Test': 'yes' } });
    await window.fetch(new URL('https://example.com/LifeTools/config/metadata.json?lang=zh#top'), options);
    const url = new URL(calls[0][0]);
    assert.equal(url.searchParams.get('lang'), 'zh');
    assert.ok(url.searchParams.has('_t'));
    assert.equal(url.hash, '#top');
    assert.equal(calls[0][1].cache, 'no-store');
    await window.fetch(new Request('https://example.com/LifeTools/config/metadata.json'));
    assert.ok(new URL(calls[1][0].url).searchParams.has('_t'));
    const external = 'https://api.example.com/config/data.json?signature=original';
    await window.fetch(external, options);
    assert.equal(calls[2][0], external);
    assert.equal(calls[2][1], options);
});

// 使用短逾時測試握手停滯、成功與重試清理。
function loadConnect(fetch) {
    const context = vm.createContext({ fetch, AbortController, setTimeout, clearTimeout });
    vm.runInContext(fs.readFileSync(path.join(root, 'scripts/lifeapi.js'), 'utf8'), context);
    return context.connect;
}

test('handshake times out and aborts a stalled request', async () => {
    let signal;
    const connect = loadConnect((url, options) => { signal = options.signal; return new Promise(() => {}); });
    await assert.rejects(connect(1, 30), /Connection timeout/);
    assert.equal(signal.aborted, true);
});

test('handshake retries serially and stops once connected', async () => {
    let calls = 0;
    let active = 0;
    const connect = loadConnect(async () => {
        assert.equal(++active, 1);
        const body = ++calls === 1 ? 'WAITING' : 'CONNECTED';
        await new Promise(resolve => setTimeout(resolve, 10));
        active--;
        return { ok: true, text: async () => body };
    });
    assert.equal(await connect(1, 200), 'CONNECTED');
    await new Promise(resolve => setTimeout(resolve, 20));
    assert.equal(calls, 2);
});

test('handshake propagates HTTP errors', async () => {
    const connect = loadConnect(async () => ({ ok: false, status: 503 }));
    await assert.rejects(connect(1, 100), /HTTP 503/);
});

// 透過頁面實際函式重現按鍵序列。
function loadCalculator() {
    const elements = new Map();
    const messages = [];
    const makeElement = () => ({ textContent: '', innerHTML: '', appendChild() {} });
    const document = { addEventListener() {}, createElement: makeElement,
        getElementById(id) { if (!elements.has(id)) elements.set(id, makeElement()); return elements.get(id); } };
    const context = vm.createContext({ document, showModal: message => messages.push(message),
        localStorage: { getItem() { return null; }, setItem() {} } });
    const html = fs.readFileSync(path.join(root, 'pages/calculator.html'), 'utf8');
    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
        if (!/src=|application\/ld\+json/i.test(match[1])) vm.runInContext(match[2], context);
    }
    return { context, messages, output: () => document.getElementById('calcOutput').textContent };
}

test('changing a pending operator preserves the first operand', () => {
    const { context: c, output } = loadCalculator();
    c.appendNumber('5'); c.appendOperator('*'); c.appendOperator('+'); c.appendNumber('2'); c.calculateResult();
    assert.equal(output(), '7');
    c.appendOperator('+'); c.appendNumber('3'); c.appendOperator('*'); c.appendNumber('2'); c.calculateResult();
    assert.equal(output(), '20');
});

test('remainder by zero reports an error without recording NaN', () => {
    const { context: c, messages, output } = loadCalculator();
    c.appendNumber('5'); c.appendOperator('%'); c.appendNumber('0'); c.calculateResult();
    assert.equal(messages.length, 1);
    assert.equal(output(), '0');
    assert.equal(vm.runInContext('historyData.length', c), 0);
});

test('all inline and shared scripts parse and registered tools exist', () => {
    const files = ['index.html', ...fs.readdirSync(path.join(root, 'pages')).filter(f => f.endsWith('.html')).map(f => 'pages/' + f)];
    for (const file of files) {
        const html = fs.readFileSync(path.join(root, file), 'utf8');
        for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
            if (/application\/ld\+json/i.test(match[1])) JSON.parse(match[2]);
            else if (!/src=/i.test(match[1])) new vm.Script(match[2], { filename: file });
        }
    }
    for (const file of fs.readdirSync(path.join(root, 'scripts'))) new vm.Script(fs.readFileSync(path.join(root, 'scripts', file), 'utf8'));
    for (const tool of JSON.parse(fs.readFileSync(path.join(root, 'config/metadata.json'), 'utf8'))) assert.ok(fs.existsSync(path.join(root, tool.path)), tool.path);
});
