# SCITL TOOL BOX

SCITL TOOL BOX 是一個基於純前端技術建置的常用工具箱網站（<https://tool.scitl.net>）。本專案以響應式（Responsive）網頁介面，提供日常與技術所需的各類換算與測試工具。沒有自有後端與資料庫，所有運算都在瀏覽器本地完成；僅在需要即時資料（匯率、DNS、IP 位置）時才會呼叫下方列出的第三方服務。

---

## 🚀 技術特色

- **純前端架構 (Static HTML / JS / CSS)**：無後端與資料庫依賴，可直接部署在任何靜態網站空間（如 GitHub Pages）。
- **共用頁面框架**：側邊欄、頂端導覽列、日期時間顯示與頁籤切換邏輯統一放在 `main.js`，新增頁面只需在 `NAV_LINKS` 加一筆。
- **高安全隨機數**：密碼產生器採用 `window.crypto.getRandomValues()`，並以拒絕取樣避免取模偏差，且保證每個勾選的字元類型至少出現一次。
- **輸出跳脫**：來自外部（如 DNS TXT 記錄）的內容一律先跳脫 HTML 再顯示，localStorage 讀回的設定也會先驗證。
- **本地農曆數據**：引入 [traditional-chinese-calendar-database](https://github.com/hungtcs/traditional-chinese-calendar-database) 的編譯模組與 `all.bin` 資料檔，支援 1901–2100 年的農曆、干支與節氣查詢。

---

## 🛠️ 功能模組說明

### 1. 單位換算 (`unitconv.html`)
以頁籤切換六大類單位，輸入任一數值即同步換算其他所有單位，各頁籤皆有「重設」按鈕：
- **長度**：公分、公尺、公里、公釐、微米、奈米、英吋、英呎、碼、英哩、海浬、台尺、光年。
- **重量**：毫克、克、公斤、公噸、盎司、磅、台斤、台兩、克拉、黃金（錢／兩／盎司）。
- **面積**：平方公釐、平方公分、平方公尺、公畝、公頃、平方公里、平方英吋、平方英呎、平方碼、英畝、平方英哩、甲、分、坪、疊（榻榻米）。
- **容量**：毫升、公升、立方公尺、美制／英制液盎司、美制品脫、美制夸脫、美制／英制加侖。
- **溫度**：攝氏、華氏、克耳文。
- **壓力**：帕 (Pa)、百帕 (hPa)、千帕 (kPa)、兆帕 (MPa)、巴 (bar)、毫巴 (mbar)、kgf/cm²、psi、inHg、inH₂O、atm、mmHg、Torr、mmH₂O（可用於輪胎胎壓換算）。

### 2. 日期時間換算 (`dateconv.html`)
以頁籤切換四個功能：
- **西元轉農曆**：查詢西元日期對應的農曆年（天干地支、生肖）、月、日、星期與節氣。
- **日期天數計算**：計算兩個日期相差的天數，並分解為年、月、日。
- **日期加減計算**：以基準日期加減 N 天，同時顯示對應農曆。
- **Timestamp 轉換**：標準時間、UNIX 時間（秒／毫秒）、ISO 8601（UTC／本地時區／基本格式）即時雙向轉換，可一鍵重設為現在時間。

### 3. 貨幣匯率換算 (`currency.html`)
- 整合 20 種主要貨幣（TWD、USD、EUR、JPY、KRW、CNY、HKD 等），輸入任一幣別即同步換算其他幣別。
- 依基準幣別快取匯率，避免重複請求；顯示匯率更新時間（當地與 UTC）。
- 匯率僅供參考，實際交易以銀行公告為準。

### 4. 網路連線與 DNS 測試工具 (`nettest.html`，邏輯在 `nettest.js`)
- **網站連線測試**：可持續（每 2 秒）測試，顯示當前／平均延遲、成功率、封包遺失率，並繪製最近 20 次的 SVG 折線圖與連線紀錄。透過瀏覽器 `fetch` 量測，反映的是 HTTP 連線時間，不是 ICMP ping。
- **常用網站檢測**：一鍵批次檢測 Google、GitHub、Cloudflare DNS、YouTube、Microsoft、Wikipedia、AWS、Yahoo。
- **DNS 記錄查詢**：支援 A、AAAA、CNAME、MX、TXT、NS，並附上 A／AAAA 記錄的 IP 所在地。
- **IP 位置查詢**：輸入 IPv4／IPv6 查詢 ISP、ASN、國家、城市、時區與經緯度。
- **本機網路資訊**：顯示公網 IP、ISP、ASN、地理位置、瀏覽器連線狀態與 User-Agent。

### 5. 密碼產生器 (`passwordgen.html`)
- 長度 4–64 字元，可選大寫、小寫、數字、符號，一鍵複製。

### 6. 世界時間 (`worldtime.html`)
- 本機時間看板、世界城市時鐘卡片（含今天／明天／昨天與快慢時數）。
- 可自訂城市並以 `localStorage` 記憶偏好。
- 跨時區會議對照：以 15 分鐘為單位的滑桿，對照指定日期各時區的對應時間。

---

## 📁 專案結構

| 檔案 | 說明 |
| --- | --- |
| `index.html` | 首頁（工具列表） |
| `unitconv.html` / `dateconv.html` / `currency.html` / `worldtime.html` / `passwordgen.html` | 各工具頁面 |
| `nettest.html` + `nettest.js` | 網路連線測試頁面與其邏輯 |
| `main.js` | 共用側邊欄／導覽列、時間顯示、頁籤切換 (`initTabs`)、本地日期工具 |
| `style.css` | 全站樣式 |
| `lunar/` | 農曆模組（`dist/index.esm.js`）與資料（`database/all.bin`） |

> 修改 `main.js` 或 `nettest.js` 後，請同步調整 HTML 中 `?v=` 版本參數，避免瀏覽器使用舊快取。

---

## 🔌 第三方服務與隱私說明

網站本身不收集資料，但下列功能會把必要的查詢內容送往第三方，使用時請留意：

| 用途 | 服務 | 送出的資料 |
| --- | --- | --- |
| 匯率 | [ExchangeRate-API Open Access](https://www.exchangerate-api.com/docs/free)（`open.er-api.com`） | 基準幣別 |
| DNS 查詢 | [Cloudflare DNS-over-HTTPS](https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/make-api-requests/dns-json/) | 查詢的網域 |
| IP 位置／本機 IP | [ipwho.is](https://ipwhois.io)（備援：[ipify](https://www.ipify.org)） | 查詢的 IP（本機資訊則為您的公網 IP） |
| 國旗圖示 | [FlagCDN](https://flagcdn.com) | 圖片請求 |
| 網站流量統計 | Google Analytics | 瀏覽行為 |

---

## 📚 資料來源與參考連結

- 傳統中文曆法與農曆資料庫：[traditional-chinese-calendar-database](https://github.com/hungtcs/traditional-chinese-calendar-database)
- 傳統中文曆法範例實作：[Browser ESModule Example](https://hungtcs.github.io/traditional-chinese-calendar-database/examples/browser-esmodule.html)
- 即時匯率服務：[ExchangeRate-API](https://www.exchangerate-api.com)
- 國旗圖示服務：[FlagCDN](https://flagcdn.com)
- DNS 安全查詢：[Cloudflare DNS-over-HTTPS](https://cloudflare-dns.com)
