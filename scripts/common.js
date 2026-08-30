function initNavbarSearch() {
    var input = document.getElementById("navSearchInput");
    var btn = document.getElementById("navSearchBtn");
    if (!input || !btn) return;
    function doSearch() {
        var q = input.value.trim();
        if (q) window.location.href = "/pages/search.html?q=" + encodeURIComponent(q);
    }
    btn.addEventListener("click", doSearch);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") doSearch(); });
}

function showModal(message, title) {
    var overlay = document.getElementById("errorModal") || document.getElementById("customModal");
    var body = document.getElementById("errorModalBody") || document.getElementById("customModalBody");
    var titleEl = overlay ? overlay.querySelector(".modal-title") : null;
    if (!overlay || !body) {
        var t = document.createElement("div");
        t.className = "toast";
        t.textContent = message;
        document.body.appendChild(t);
        requestAnimationFrame(function () { t.classList.add("show"); });
        setTimeout(function () { t.classList.remove("show"); setTimeout(function () { t.remove(); }, 300); }, 2500);
        return;
    }
    if (title && titleEl) titleEl.textContent = title;
    body.textContent = message;
    overlay.classList.add("show");
}

function closeErrorModal() {
    var o = document.getElementById("errorModal") || document.getElementById("customModal");
    if (o) o.classList.remove("show");
}

function closeCustomModal() { closeErrorModal(); }

function showToastNotification(msg) {
    var t = document.getElementById("toast");
    if (!t) {
        t = document.createElement("div");
        t.id = "toast";
        t.className = "toast";
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove("show"); }, 2500);
}

function escapeHtml(text) {
    var map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return String(text).replace(/[&<>"']/g, function (m) { return map[m]; });
}

function clearProKey() {
    localStorage.removeItem("proKey");
    var badge = document.querySelector(".pro-badge");
    if (badge) badge.remove();
    var btn = document.getElementById("logoutBtn");
    if (btn) btn.style.display = "none";
    var modal = document.getElementById("proModal");
    if (modal) modal.classList.add("show");
    showToastNotification("已清除 Pro 密鑰");
}

function handleProAuthError() {
    localStorage.removeItem("proKey");
    var badge = document.querySelector(".pro-badge");
    if (badge) badge.remove();
    var input = document.getElementById("proKeyInput");
    if (input) input.value = "";
    var btn = document.getElementById("logoutBtn");
    if (btn) btn.style.display = "none";
    setTimeout(function () {
        var modal = document.getElementById("proModal");
        if (modal) modal.classList.add("show");
    }, 1500);
}

document.addEventListener("DOMContentLoaded", function () {
    initNavbarSearch();
    var overlays = document.querySelectorAll(".modal-overlay");
    overlays.forEach(function (o) {
        o.addEventListener("click", function (e) {
            if (e.target === o && !o.classList.contains("pro-modal-card")) {
                var isPro = o.id === "proModal";
                if (!isPro) o.classList.remove("show");
            } else if (e.target === o && o.id !== "proModal") {
                o.classList.remove("show");
            }
        });
    });
});
