# LifeTools

## 1. repo介紹:
這個repo裡的程式碼為靜態網站(HTML)，會被架設在Tencent Cloud的Edgeone。

## 2. 資料夾以及檔案的介紹
[/](/) 這是根目錄

[/config](/config) 這是放詮釋資料和設定等的地方

[/pages](/pages) 這裡是放各種小工具HTML的folder

[/scripts](/scripts) 這是放HTML腳本的地方

## 3. 檔案, 程式寫法
每個腳本程式的function或動作要有註解 (//)
每個function或變數要用駝峰式命名法(例如蛇形式是 get_user_data 駝峰式是 getUserData)

有任何寫法不會的可以問BrightSpecter或是找專門介紹那個檔案的.md 介紹檔
每個HTML程式都要在<head>的標籤內新增
```
<script src="/scripts/init.html"></script>
```
每個工具都要到/config/metadata.json註冊 不然不會出現在搜尋結果

## AI Prompt
給AI的prompt:
```md
你是一位資深的網頁前端工程師。請為「LifeTools 精緻工具箱」設計一個實用、美觀、且具備現代感的小工具網頁。請務必嚴格遵守以下所有開發與設計規範：

---

### 1. 基礎規範與程式風格
1. **初始化腳本**：必須在 `<head>` 標籤內加入以下標籤：
   `<script src="/scripts/init.js"></script>`
2. **命名規範**：JavaScript 變數與函式必須使用「駝峰式命名法」（例如：`getUserData`, `calculateResult`）。
3. **程式註解**：每個函式或主要動作步驟，都必須撰寫單行註解（`//`）。
4. **架構限制**：這是一個單一的 HTML 檔案，所有的 CSS 必須寫在 `<style>` 標籤中，JavaScript 必須寫在 `<script>` 標籤中，不引用外部自訂的 CSS/JS 檔案（除了必要的圖標庫如 Font Awesome 6.4.0、Google Fonts 或特定標準開源輔助庫）。

---

### 2. 響應式佈局 (Responsive Layout) & 體驗
- **滿版適應**：網頁必須適應所有螢幕解析度（從手機到桌機）。使用 `box-sizing: border-box`、Flexbox 或 CSS Grid 進行排版。
- **捲動優化**：內容自動填充到最大可用空間。版面配置流暢，不論在哪種裝置上，使用者只需輕鬆上下滑動即可瀏覽完整內容，避免出現非必要的橫向滾動條。
- **行動端防擠壓**：針對行動端（Mobile），Logo、導覽列與按鈕在小尺寸擠壓時，必須使用 `flex-shrink: 0`、`min-width: 0` 等屬性防破版。

---

### 3. 頂部導覽列 (Navigation Bar) 規範
頂部必須包含一條固定（或置頂）的導覽列，風格如下：
- **配色**：使用親和力高、溫暖的暖色系:柔和暖橘 `#FF8C00`（確保對比度足夠且視覺舒適）。
- **左側**：標題「Life Tools」，點擊連結至 `/`。
- **右側配置**：
  1. 連結「關於我們」，點擊連結至 `/pages/about.html`。
  2. 搜尋欄位：包含一個輸入框與搜尋按鈕。
     - 當使用者在輸入框按下「Enter」鍵，或點擊右側的搜尋按鈕時，必須跳轉至 `/pages/search.html?q=輸入內容`。
     - 需使用 JavaScript 處理此跳轉邏輯。

---

### 4. 視覺、互動與自訂彈窗 (UI/UX)
- **現代感設計**：避免過時的扁平或粗糙排版。使用柔和圓角（`border-radius`）、細緻陰影（`box-shadow`）、漸層背景與適當的留白。
- **載入與過渡**：頁面載入時需有流暢的淡入（Fade-in）或升起動畫。按鈕、互動元件必須有 Hover/Active 狀態的過渡動畫（`transition: 0.3s`），例如微幅放大或陰影加深。
- **⚠️ 嚴禁使用原生 Alert**：全站禁止使用原生瀏覽器的 `alert()` 阻斷式視窗。
- **自訂彈窗 (Custom Modal)**：所有錯誤、防呆提示或警告，必須使用自訂的 `.modal-overlay` 彈窗（搭配淡入、彈出縮放動畫）來呈現，並提供關閉/確認按鈕。
- **Toast 提示**：微小互動成功（例如複製、清除金鑰）請使用底部的 Toast 提示（`showToastNotification(message)`）顯示 2.5 秒。
- **語言與版權**：語系使用繁體中文（`lang="zh-TW"`）。頁面底下必須有著作權宣告文字：
  `&copy; 0xseanlee, all rights reserved.`

---

### 5. 功能類型判定與技術規格 (技術核心，請根據本次開發項目自動套用 A, B 或 C 分流)

#### 【類型 A：純前端離線工具】 (如：BMI計算機、隨機座位、時間時鐘)
- 不需要引入 LifeAPI。

#### 【類型 B：一般 API 聯網工具】 (如：IP檢測器)
- 必須在 `<head>` 中引入 SDK：`<script src="https://0xseanlee.github.io/LifeTools/scripts/lifeapi.js"></script>`。
- 執行 fetch 請求前，必須先執行 `connect().then(exfunc).catch(console.error)` 連線握手成功後，才能呼叫 API。

#### 【類型 C：PRO 專業版工具】 (如：AI占卜師、短網址產生器)
- 必須在 `<head>` 中引入 SDK：`<script src="https://0xseanlee.github.io/LifeTools/scripts/lifeapi.js"></script>`。
- 執行 fetch 請求前，必須先執行 `connect()` 連線握手，且 POST 請求時必須在 body 內帶入 `passkey: proKey` 參數。
- **Pro 授權啟用彈窗**：
  - 初始化若無儲存金鑰，自動彈出無法隨意關閉的 `proModal`。
  - 彈窗包含密碼輸入框（`id="proKeyInput"`）與啟用按鈕，且必須將其包裹在 `<form>` 標籤中，以避免 Chrome 出現 form-less 密碼欄位安全警告。
  - 啟用按鈕下方包含「點擊此處清除舊密鑰」的清除按鈕（`clearProKey()`）。
  - 彈窗底部包含註冊提示：「尚未擁有密鑰？請寄信聯絡 sean0970802201@gmail.com 申請。」
- **Pro 標籤與登出按鈕**：
  - 若本機已有密鑰，初始化時自動在 `<h1>` 標題右側渲染金色 PRO 皇冠徽章（`<span class="pro-badge"><i class="fa-solid fa-crown"></i>PRO</span>`）。
  - 在主畫面的輸入框/操作按鈕下方，顯現「登出並清除 Pro 密鑰」的按鈕（`#logoutBtn`，預設為 `display: none;`）。點擊時觸發 `clearProKey()`。
  - 若 API 回應 `403`，必須在 catch 中自動清除無效 `localStorage` 密鑰、清空輸入、拔除 Pro 徽章，並於 1.5 秒後自動彈出 `proModal` 供重新輸入。
  - 存在localStorage的密鑰統一使用"proKey"作為鍵對值的鍵 (可以使用localStorage.getItem("proKey"))

---

### 6. SEO 搜尋引擎優化與結構化資料
1. **多媒體詮釋標籤**：網頁 `<head>` 內必須包含適當的 Meta Description、Keywords、Robots、標準網址 Canonical 以及 Open Graph (og:title, og:description) 與 Twitter Card 分享標籤。
2. **預連線**：使用 `<link rel="preconnect" ...>` 對 Fonts 等常用外部庫進行預解析，加速網頁載入。
3. **JSON-LD 結構化資料**：在 `<head>` 中嵌入 `application/ld+json`，使用 `WebApplication` 格式宣告此工具的名稱、網域路徑與功能，提升搜尋引擎 Rich Snippets 評分。

---

### 7. 交付產出要求
1. 請提供**完整的單一 HTML 檔案程式碼**（所有的 CSS 位於 `<style>`，JS 位於 `<script>`）。
2. 請提供註冊到 `/config/metadata.json` 所需的全新格式 JSON 項目（必須包含 Font Awesome 的 `"icon"` 欄位。若是 Pro 工具，則必須包含 `"pro": true`）。
   - **一般工具 JSON 格式範例：**
     `{ "name": "工具名稱", "description": "工具描述。", "path": "/pages/tool.html", "icon": "fa-solid fa-toolbox" }`
   - **PRO 工具 JSON 格式範例：**
     `{ "name": "工具名稱", "description": "工具描述。", "path": "/pages/tool.html", "icon": "fa-solid fa-link", "pro": true }`

---

### 8. 本次要開發的工具功能需求：
[在此處詳細輸入您想開發的工具功能描述與規格]
```

## 4. Pro工具
Pro工具 也就是說這個工具需要透過我們發送密鑰才能使用。
Pro工具定義以及要求: 
### 1. Pro工具要做的比其他工具還更具方便性，創意性和難度
### 2. Pro工具的核心在後端 因為前端毫無隱私可言 (例如LLM API服務)
### 3. Pro工具的許可證(一組passkey)是要由0xseanlee(開發者)發送密鑰給使用者 並且在使用者打開Pro工具時要輸入才能使用該工具的功能
### 4. Pro工具的metadata.json要多一個key:value 就是要多"pro": true

LifeAPI PRO API介紹: [PRO.md](https://github.com/0xseanlee/LifeAPI/blob/main/PRO.md)
