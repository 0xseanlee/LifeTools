<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title>工具正在全力建造中！ - Life Tools</title>
    <meta name="description" content="Life Tools 精緻工具箱的新功能正在全力開發中。輕量、安全、免登入的本地端萬用生活小工具，敬請期待！">
    <meta name="author" content="0xseanlee">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <script src="/scripts/init.js"></script>

    <style>
        /* 全域基本樣式 */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Noto Sans TC', sans-serif;
        }

        :root {
            --primary-color: #FF8C00;
            --primary-hover: #E07B00;
            --primary-light: #FFF5EC;
            --text-dark: #2C3E50;
            --text-muted: #7F8C8D;
            --bg-light: #FDFBF7;
            --bg-card-section: #F5EFEB;
            --white: #FFFFFF;
            --transition-speed: 0.3s;
        }

        body {
            background-color: var(--bg-light);
            color: var(--text-dark);
            line-height: 1.6;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            overflow-x: hidden;
        }

        /* 頂部導覽列 */
        .navbar {
            background-color: var(--white);
            border-bottom: 2px solid var(--primary-light);
            position: sticky;
            top: 0;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .navbar-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 12px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: nowrap;
            gap: 15px;
        }

        .nav-logo {
            font-size: 24px;
            font-weight: 700;
            color: var(--primary-color);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: transform var(--transition-speed) ease;
            flex-shrink: 0;
        }

        .nav-logo:hover {
            transform: scale(1.03);
        }

        .nav-right {
            display: flex;
            align-items: center;
            gap: 20px;
            flex-wrap: nowrap;
            flex-grow: 1;
            justify-content: flex-end;
        }

        .nav-link {
            color: var(--text-dark);
            text-decoration: none;
            font-weight: 500;
            font-size: 16px;
            transition: color var(--transition-speed) ease;
            flex-shrink: 0;
        }

        .nav-link:hover {
            color: var(--primary-color);
        }

        .search-box {
            display: flex;
            align-items: center;
            background-color: var(--primary-light);
            border: 1.5px solid transparent;
            border-radius: 30px;
            padding: 4px 4px 4px 16px;
            transition: all var(--transition-speed) ease;
            max-width: 300px;
            width: 100%;
        }

        .search-box:focus-within {
            border-color: var(--primary-color);
            background-color: var(--white);
            box-shadow: 0 0 8px rgba(255, 140, 0, 0.15);
        }

        .search-input {
            border: none;
            background: transparent;
            outline: none;
            color: var(--text-dark);
            font-size: 14px;
            width: 100%;
            padding-right: 8px;
        }

        .search-btn {
            background-color: var(--primary-color);
            border: none;
            color: var(--white);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color var(--transition-speed) ease, transform var(--transition-speed) ease;
            flex-shrink: 0;
        }

        /* 主內容區 - 滿版居中排版 */
        .main-container {
            background-color: var(--bg-card-section);
            padding: 60px 20px;
            flex-grow: 1;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .coming-soon-card {
            max-width: 600px;
            width: 100%;
            background-color: var(--white);
            border-radius: 24px;
            padding: 50px 40px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
            border: 1px solid rgba(0, 0, 0, 0.02);
            text-align: center;
            animation: fadeInUp 0.6s ease-out;
        }

        /* 建造中動畫 Icon */
        .animated-icon-wrapper {
            position: relative;
            display: inline-block;
            margin-bottom: 30px;
        }

        .base-gear {
            font-size: 80px;
            color: var(--primary-color);
            animation: spinClockwise 8s linear infinite;
        }

        .sub-gear {
            font-size: 40px;
            color: var(--text-muted);
            position: absolute;
            bottom: -5px;
            right: -15px;
            animation: spinCounterClockwise 4s linear infinite;
            background-color: var(--white);
            border-radius: 50%;
            padding: 2px;
        }

        .card-title {
            font-size: 26px;
            font-weight: 700;
            color: var(--text-dark);
            margin-bottom: 12px;
        }

        .card-desc {
            font-size: 16px;
            color: var(--text-muted);
            margin-bottom: 35px;
            line-height: 1.6;
        }

        /* 回首頁快捷按鈕與互動動畫 */
        .back-home-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background-color: var(--primary-color);
            color: var(--white);
            text-decoration: none;
            padding: 14px 32px;
            font-size: 16px;
            font-weight: 700;
            border-radius: 30px;
            box-shadow: 0 4px 15px rgba(255, 140, 0, 0.2);
            transition: all var(--transition-speed) ease;
        }

        .back-home-btn:hover {
            background-color: var(--primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 140, 0, 0.3);
        }

        .back-home-btn i {
            transition: transform var(--transition-speed) ease;
        }

        .back-home-btn:hover i {
            transform: translateX(-4px); /* 滑鼠懸停時箭頭往左微動，暗示返回 */
        }

        /* 頁尾 */
        .footer {
            background-color: var(--white);
            padding: 30px 20px;
            text-align: center;
            border-top: 1px solid var(--primary-light);
            font-size: 14px;
            color: var(--text-muted);
        }

        /* 齒輪與淡入動畫定義 */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes spinClockwise {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        @keyframes spinCounterClockwise {
            from { transform: rotate(0deg); }
            to { transform: rotate(-360deg); }
        }

        /* 響應式優化 */
        @media (max-width: 600px) {
            .navbar-container {
                padding: 10px 12px;
                gap: 8px;
            }
            .nav-logo { font-size: 20px; }
            .nav-right { gap: 10px; max-width: 65%; }
            .nav-link { font-size: 14px; }
            .search-box { padding: 3px 3px 3px 10px; }
            .search-input { font-size: 13px; }
            .search-btn { width: 28px; height: 28px; }
            .coming-soon-card { padding: 40px 20px; }
            .card-title { font-size: 22px; }
            .card-desc { font-size: 14px; }
        }
    </style>
</head>
<body>

    <nav class="navbar" aria-label="主要導覽列">
        <div class="navbar-container">
            <a href="/" class="nav-logo" aria-label="Life Tools 首頁">
                <i class="fa-solid fa-toolbox" aria-hidden="true"></i> Life Tools
            </a>
            <div class="nav-right">
                <a href="/pages/about.html" class="nav-link">關於我們</a>
                <div class="search-box" role="search">
                    <input type="text" id="navSearchInput" class="search-input" placeholder="搜尋工具..." aria-label="搜尋框">
                    <button id="navSearchBtn" class="search-btn" aria-label="確認搜尋">
                        <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <main class="main-container">
        <article class="coming-soon-card">
            
            <div class="animated-icon-wrapper">
                <i class="fa-solid fa-gear base-gear"></i>
                <i class="fa-solid fa-gear sub-gear"></i>
            </div>
            
            <h2 class="card-title">新功能正在全力建造中！</h2>
            <p class="card-desc">
                感謝你的點擊。為了提供最精緻的使用體驗，工程師正在深夜一邊喝著咖啡、一邊瘋狂趕工這個小工具。
                <br>本站堅持 100% 本地端安全運行與免登入無廣告，敬請期待它的華麗登場！
            </p>
            
            <a href="/" class="back-home-btn">
                <i class="fa-solid fa-arrow-left"></i> 返回工具箱首頁
            </a>
            
        </article>
    </main>

    <footer class="footer">
        &copy; 0xseanlee, all rights reserved.
    </footer>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // 初始化導覽列搜尋控制項
            initSearchEvents();
        });

        // 處理頂部導覽列搜尋重導向處理機制
        function executeSearch(query) {
            const trimmedQuery = query.trim();
            if (trimmedQuery) {
                window.location.href = `/pages/search.html?q=${encodeURIComponent(trimmedQuery)}`;
            }
        }

        // 綁定導覽列搜尋之鍵盤 Enter 與滑鼠點擊行為
        function initSearchEvents() {
            const navInput = document.getElementById('navSearchInput');
            const navBtn = document.getElementById('navSearchBtn');

            // 1. 監聽搜尋按鈕點擊
            navBtn.addEventListener('click', () => {
                executeSearch(navInput.value);
            });

            // 2. 監聽搜尋框鍵盤 Enter 鍵
            navInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    executeSearch(navInput.value);
                }
            });
        }
    </script>
</body>
</html>
