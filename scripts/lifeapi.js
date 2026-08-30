function connect(interval, timeout) {
    if (interval === undefined) interval = 1000;
    if (timeout === undefined) timeout = 30000;
    return new Promise(function (resolve, reject) {
        var start = Date.now();
        var timer = setInterval(function () {
            fetch("https://lifeapi.zone.id/connect")
                .then(function (res) {
                    if (!res.ok) throw new Error("HTTP " + res.status);
                    return res.text();
                })
                .then(function (body) {
                    if (body.indexOf("CONNECTED") !== -1) {
                        clearInterval(timer);
                        resolve(body);
                    } else if (Date.now() - start >= timeout) {
                        clearInterval(timer);
                        reject(new Error("Connection timeout"));
                    }
                })
                .catch(function (err) {
                    clearInterval(timer);
                    reject(err);
                });
        }, interval);
    });
}
