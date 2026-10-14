// 逐次握手並限制整體等待時間，避免請求重疊或網路無回應時永久等待。
function connect(interval, timeout) {
    if (interval === undefined) interval = 1000;
    if (timeout === undefined) timeout = 30000;
    if (!Number.isFinite(interval) || interval < 0 || !Number.isFinite(timeout) || timeout <= 0) {
        return Promise.reject(new Error("Invalid connection timing"));
    }
    return new Promise(function (resolve, reject) {
        const controller = new AbortController();
        let retryTimer;
        let settled = false;
        const deadlineTimer = setTimeout(function () {
            finish(new Error("Connection timeout"));
            controller.abort();
        }, timeout);

        // 統一清理計時器，確保 Promise 只完成一次。
        function finish(error, body) {
            if (settled) return;
            settled = true;
            clearTimeout(deadlineTimer);
            clearTimeout(retryTimer);
            if (error) reject(error);
            else resolve(body);
        }

        // 上一次回應處理完畢才排程下一次握手。
        function attemptConnection() {
            fetch("https://lifeapi.zone.id/connect", { signal: controller.signal })
                .then(function (res) {
                    if (!res.ok) throw new Error("HTTP " + res.status);
                    return res.text();
                })
                .then(function (body) {
                    if (settled) return;
                    if (body.indexOf("CONNECTED") !== -1) finish(null, body);
                    else retryTimer = setTimeout(attemptConnection, interval);
                })
                .catch(function (err) { finish(err); });
        }
        attemptConnection();
    });
}
