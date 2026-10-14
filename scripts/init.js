(function () {
    "use strict";

    const headerStyle = "color:#FF3B30;font-size:24px;font-weight:bold;background-color:#FFE5E5;padding:8px 16px;border-radius:4px;border:1px solid #FF3B30;";
    const bodyStyle = "color:#EAEAEA;font-size:14px;font-weight:bold;line-height:1.8;margin-top:10px;";

    for (let i = 1; i <= 3; i++) {
        console.log("%c⚠️ Security Warning [" + i + "/3] ⚠️", headerStyle);
        console.log("%c[" + i + "/3] 此控制台僅供除錯使用。請勿執行來源不明的程式碼。", bodyStyle);
    }

    try {
        if (window.self !== window.top) {
            var isInPages = location.pathname.indexOf("/pages/") !== -1;
            window.top.location.href = isInPages ? "embed.html" : "pages/embed.html";
        }
    } catch (_) {
        try {
            var isInPages2 = location.pathname.indexOf("/pages/") !== -1;
            window.parent.location.href = isInPages2 ? "embed.html" : "pages/embed.html";
        } catch (_) {}
    }

    const RATE_WINDOW = 60000;
    const RATE_LIMIT = 60;
    const LOCKOUT_DURATION = 300000;

    // 儲存空間被封鎖或已滿時，仍允許頁面與工具正常運行。
    function readStoredValue(key) {
        try { return localStorage.getItem(key); } catch (_) { return null; }
    }

    // 限流只限制請求，不移除使用者的頁面與輸入內容。
    function trackRequest() {
        const now = Date.now();
        const end = Number(readStoredValue("lifeToolsLockoutEnd")) || 0;
        if (now < end) return false;
        let history;
        try {
            history = JSON.parse(readStoredValue("lifeToolsRequestHistory") || "[]");
            if (!Array.isArray(history)) history = [];
        } catch (_) { history = []; }
        history = history.filter(function (t) {
            return Number.isFinite(t) && t <= now && now - t < RATE_WINDOW;
        });
        history.push(now);
        try {
            localStorage.setItem("lifeToolsRequestHistory", JSON.stringify(history));
            if (history.length > RATE_LIMIT) {
                localStorage.setItem("lifeToolsLockoutEnd", String(now + LOCKOUT_DURATION));
            } else if (end) {
                localStorage.removeItem("lifeToolsLockoutEnd");
            }
        } catch (_) {}
        return history.length <= RATE_LIMIT;
    }

    const originalFetch = window.fetch;
    // 僅更新同源設定檔的快取，保留外部 API 網址與呼叫者的選項。
    window.fetch = function (input, init) {
        if (!trackRequest()) {
            return Promise.reject(new Error("請求過於頻繁，請稍後再試。"));
        }
        const isRequest = input instanceof Request;
        const url = new URL(isRequest ? input.url : input, location.href);
        const method = (init && init.method || (isRequest ? input.method : "GET")).toUpperCase();
        const isLocalConfig = url.origin === location.origin &&
            /\/config\/.*\.json$/.test(url.pathname) && method === "GET";
        if (isLocalConfig) {
            url.searchParams.set("_t", String(Date.now()));
            const nextInit = Object.assign({}, init, { cache: "no-store" });
            const nextInput = isRequest ? new Request(url.href, input) : url.href;
            return originalFetch.call(window, nextInput, nextInit);
        }
        return originalFetch.call(window, input, init);
    };
})();
