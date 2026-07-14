# SCITL TOOL BOX

SCITL TOOL BOX 是一個基於純前端技術建置、安全且功能豐富的常用工具箱網站。本專案以現代化、響應式（Responsive）的網頁介面，提供日常與技術所需的各類換算與測試工具，所有敏感資料均在瀏覽器本地處理，不進行任何後端伺服器傳輸，確保隱私安全。

---

## 🚀 技術特色

- **純前端架構 (Static HTML / JS / CSS)**：無後端資料庫與伺服器依賴，直接在用戶瀏覽器執行，載入極速且保證資料隱私不外洩。
- **高安全隨機數**：密碼產生器捨棄不安全的 `Math.random()`，採用瀏覽器原生的 `window.crypto.getRandomValues()` 密碼學安全隨機數生成 API。
- **實時外部服務整合**：
  - **匯率數據**：串接 [ExchangeRate-API](https://www.exchangerate-api.com) 的免費實時 API，動態獲取全球最新匯率資訊。
  - **DNS 查詢**：串接 [Cloudflare DNS-over-HTTPS (DoH) API](https://cloudflare-dns.com)，於前端實現安全且無阻礙的 DNS 紀錄解析。
  - **國旗圖示**：使用 [FlagCDN](https://flagcdn.com) 服務動態顯示各國貨幣國旗標識。
- **本地農曆數據整合**：引入 [traditional-chinese-calendar-database](https://github.com/hungtcs/traditional-chinese-calendar-database) 的本地編譯模組，實現精準的西元與農曆雙向轉換。

---

## 🛠️ 功能模組說明

### 1. 單位換算 (`unitconv.html`)
提供五大類常用單位的即時換算，輸入任一數值即可同時同步所有其他單位，並支援折疊/展開面板：
- **長度換算**：公分 (cm)、公尺 (m)、公里 (km)、公釐 (mm)、微米 (μm)、奈米 (nm)、英吋 (in)、英呎 (ft)、碼 (yd)、英哩 (mi)、海浬 (nmi)、台尺、光年 (ly)。
- **重量換算**：毫克 (mg)、克 (g)、公斤 (kg)、公噸 (t)、盎司 (oz)、磅 (lb)、台斤、台兩、克拉 (ct)、黃金 (錢)、黃金 (兩)、黃金 (盎司)。
- **面積換算**：平方公釐 (mm²)、平方公分 (cm²)、平方公尺 (m²)、公畝 (a)、公頃 (ha)、平方公里 (km²)、平方英吋 (in²)、平方英呎 (ft²)、平方碼 (yd²)、英畝 (ac)、平方英哩 (mi²)、甲、分、坪、疊 (榻榻米)。
- **容量換算**：毫升 (ml)、公升 (L)、立方公尺 (m³)、美制液盎司 (fl oz)、英制液盎司 (fl oz)、美制品脫 (pt)、美制夸脫 (qt)、美制加侖 (gal)、英制加侖 (gal)。
- **溫度換算**：攝氏度 (°C)、華氏度 (°F)、克耳文 (K)。

### 2. 日期時間換算 (`dateconv.html`)
- **西元轉農曆**：結合本地傳統農曆資料庫，精準查詢西元對應之農曆年（天干地支）、月、日與星期。
- **日期天數計算**：輸入開始與結束日期，計算相差天數，並精確分解為相差幾年、幾個月、幾天。
- **日期加減計算**：以某一基準日期為底，計算加或減 $N$ 天後的目標日期。
- **時間戳轉換 (Timestamp)**：提供標準時間（本地）、UNIX 時間（秒）、UNIX 時間（毫秒）、ISO 8601 (UTC)、ISO 8601 (本地時區) 以及 ISO 8601 基本格式之即時雙向轉換，並支援一鍵重設為當前時間。

### 3. 貨幣匯率換算 (`currency.html`)
- 整合 20 種全球主要貨幣（包含新台幣 TWD、美元 USD、歐元 EUR、日圓 JPY、韓元 KRW、人民幣 CNY 等）。
- 輸入任一貨幣金額，即時轉換出其他 19 種貨幣的最新等值金額。
- 顯示最後匯率更新時間（當地時間與 UTC 時間）。

### 4. 網路連線與 DNS 測試工具 (`nettest.html`)
- **網站連線測試**：輸入網址，支持每 2 秒一次的持續 Ping 測試，顯示當前延遲、平均延遲、測試成功率與封包遺失率，並繪製最近 20 次的即時延遲折線圖（以 SVG 動態渲染）。
- **常用網站檢測**：一鍵批次檢測包含 Google、Facebook、Github、Youtube 等常用網站的連線狀態及反應時間。
- **DNS 記錄查詢**：支持查詢 A、AAAA、CNAME、MX、TXT、NS 等 DNS 紀錄類型，並額外解析 IP 所在地。
- **本機網路資訊**：獲取您當前的公網 IP 地址、電信商 (ISP)、自治系統 (ASN)、國家/地區、城市/區域、經緯度座標以及本機瀏覽器的 UA 和連線狀態。

### 5. 密碼產生器 (`passwordgen.html`)
- 生成高強度的隨機密碼，長度可在 4 到 64 字元之間自訂。
- 可選擇是否包含大寫字母 (A-Z)、小寫字母 (a-z)、數字 (0-9) 以及特殊符號 (!@#$%^&*)。
- 支援一鍵複製到剪貼簿。

### 6. 世界時間 (`worldtime.html`)
- **本機時間展示**：以動態橫幅顯示目前本機系統時間、日期、星期及時區偏移量。
- **世界城市時鐘網格**：以卡片形式實時動態顯示世界多個主要城市的時間，並智能算出相對於本機時間是「今天/明天/昨天」以及「快/慢幾小時」。
- **自訂城市管理**：提供各大城市時區選單，用戶可自訂增減卡片，並利用瀏覽器 `localStorage` 記憶您的偏好。
- **跨時區會議時間對照器**：拖動 24 小時滑桿（步長 15 分鐘），可同步對照所選日期下，各個時區在該時間點的對應時間，方便規劃跨國商務或線上會議。


---

## 📚 資料來源與參考連結

- 新北市政府開放資料每日作息對照：[新北市政府開放資料平台](https://data.ntpc.gov.tw/datasets/308dcd75-6434-45bc-a95f-584da4fed251)
- 台灣行事曆 API 參考：[taiwan-calendar](https://github.com/880831ian/taiwan-calendar)
- 傳統中文曆法與農曆資料庫：[traditional-chinese-calendar-database](https://github.com/hungtcs/traditional-chinese-calendar-database/tree/master)
- 傳統中文曆法範例實作：[Browser ESModule Example](https://hungtcs.github.io/traditional-chinese-calendar-database/examples/browser-esmodule.html)
- 即時匯率服務：[ExchangeRate-API](https://www.exchangerate-api.com)
- 國旗圖示服務：[FlagCDN](https://flagcdn.com)
- DNS 安全查詢：[Cloudflare DNS-over-HTTPS](https://cloudflare-dns.com)
