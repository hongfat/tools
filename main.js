// --- 共用頁面框架：側邊欄與導覽列 ---
const NAV_LINKS = [
    ['index.html', '首頁'],
    ['unitconv.html', '單位換算'],
    ['nettest.html', '網路連線測試'],
    ['dateconv.html', '日期時間換算'],
    ['worldtime.html', '世界時間'],
    ['currency.html', '貨幣匯率換算'],
    ['passwordgen.html', '密碼／隨機產生器'],
    ['encode.html', '編碼／解碼'],
    ['subnet.html', '子網路計算機'],
    ['qrcode.html', 'QR Code 產生器'],
    ['hash.html', '雜湊產生器'],
];

// 若頁面（例如瀏覽器快取的舊版 HTML）已內含側邊欄與導覽列，就不重複插入
if (!document.getElementById('mySidebar')) document.body.insertAdjacentHTML('afterbegin', `
    <div id="mySidebar" class="sidebar">
        ${NAV_LINKS.map(([href, name]) => `<a href="${href}">${name}</a>`).join('\n        ')}
    </div>
    <nav class="navbar">
        <div class="navbar-left">
            <span class="openbtn" onclick="toggleNav(event)">&#9776;</span>
        </div>
        <div class="navbar-right">
            <a href="index.html" class="navbar-brand">SCITL TOOL BOX</a>
            <div id="datetime-display" class="nav-links"></div>
        </div>
    </nav>`);

// --- 日期時間顯示 ---
function updateDateTime() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const dateTimeString = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
        `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const displayElement = document.getElementById('datetime-display');
    if (displayElement) {
        displayElement.textContent = dateTimeString;
    }
}
updateDateTime();
setInterval(updateDateTime, 1000);

// 取得本地時區的 YYYY-MM-DD（toISOString 會回傳 UTC 日期，在 UTC+8 的凌晨會差一天）
function getLocalDateString(date = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// --- 安全亂數 ---
// 回傳 0 到 max - 1 的均勻亂數整數；以拒絕取樣避免取模造成的分佈偏差
function randomInt(max) {
    const limit = 0x100000000 - (0x100000000 % max);
    const buf = new Uint32Array(1);
    do { window.crypto.getRandomValues(buf); } while (buf[0] >= limit);
    return buf[0] % max;
}

// --- 側邊欄 ---
const sidebar = document.getElementById('mySidebar');

function toggleNav(event) {
    event.stopPropagation(); // 阻止事件冒泡到頁面內容
    if (sidebar.style.width === '250px') {
        closeNav();
    } else {
        openNav();
    }
}

function openNav() {
    sidebar.style.width = '250px';
}

function closeNav() {
    sidebar.style.width = '0';
}

// 點擊頁面其他區域時收合側邊欄
document.addEventListener('click', (event) => {
    if (!sidebar.contains(event.target)) closeNav();
});

// --- 共用頁籤切換 ---
// 頁籤按鈕以 data-tab 指向內容區塊 id；onSwitch(tabId) 可在切換後執行額外動作
function initTabs(onSwitch) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
            if (onSwitch) onSwitch(btn.dataset.tab);
        });
    });
}
