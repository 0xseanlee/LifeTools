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
            window.top.location.href = "/pages/embed.html";
        }
    } catch (_) {
        try { window.parent.location.href = "/pages/embed.html"; } catch (_) {}
    }

    const RATE_WINDOW = 60000;
    const RATE_LIMIT = 60;
    const LOCKOUT_DURATION = 300000;

    function isLockedOut() {
        const end = parseInt(localStorage.getItem("lifeToolsLockoutEnd") || "0", 10);
        if (Date.now() < end) {
            document.documentElement.innerHTML = "";
            return true;
        }
        if (end) localStorage.removeItem("lifeToolsLockoutEnd");
        return false;
    }

    function trackRequest() {
        if (isLockedOut()) return;
        const now = Date.now();
        let history;
        try {
            history = JSON.parse(localStorage.getItem("lifeToolsRequestHistory") || "[]");
            if (!Array.isArray(history)) history = [];
        } catch (_) { history = []; }
        history = history.filter(function (t) { return now - t < RATE_WINDOW; });
        history.push(now);
        try { localStorage.setItem("lifeToolsRequestHistory", JSON.stringify(history)); } catch (_) {}
        if (history.length > RATE_LIMIT) {
            localStorage.setItem("lifeToolsLockoutEnd", String(now + LOCKOUT_DURATION));
            document.documentElement.innerHTML = "";
        }
    }

    const originalFetch = window.fetch;
    window.fetch = function (input, init) {
        trackRequest();
        let url = "";
        if (typeof input === "string") url = input;
        else if (input instanceof Request) url = input.url;
        const isLocalConfig = url && (url.endsWith(".json") || url.includes("/config/"));
        if (isLocalConfig) {
            const sep = url.includes("?") ? "&" : "?";
            const bustedUrl = url + sep + "_t=" + Date.now();
            const nextInit = init || {};
            nextInit.cache = "no-store";
            if (input instanceof Request) input = new Request(bustedUrl, input);
            else input = bustedUrl;
            return originalFetch(input, nextInit);
        }
        return originalFetch(input, init);
    };

    if (isLockedOut()) return;
})();
