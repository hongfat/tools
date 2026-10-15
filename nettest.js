// 跳脫 HTML 特殊字元，避免外部資料（如 TXT 記錄）被當成標籤執行
function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

// --- 1. 網站連線測試 (Ping) 邏輯 ---
let pingIntervalId = null;
let isPinging = false;
const pingHistory = []; // 儲存 { success: bool, latency: number, time: string }

function prepareUrl(inputUrl) {
    let url = inputUrl.trim();
    if (!url) return null;
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }
    try {
        const urlObj = new URL(url);
        urlObj.searchParams.set('_t', Date.now()); // 防止瀏覽器快取
        return urlObj.toString();
    } catch (e) {
        return null;
    }
}

async function performSinglePing(target) {
    const prepared = prepareUrl(target);
    if (!prepared) {
        return { success: false, latency: 0, error: '網址格式錯誤' };
    }

    const startTime = performance.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 秒逾時

    try {
        // 使用 no-cors 以防止跨網域 CORS 問題阻擋連線測試本身
        await fetch(prepared, {
            mode: 'no-cors',
            cache: 'no-store',
            credentials: 'omit',
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        const endTime = performance.now();
        return {
            success: true,
            latency: Math.round(endTime - startTime)
        };
    } catch (error) {
        clearTimeout(timeoutId);
        const endTime = performance.now();
        return {
            success: false,
            latency: error.name === 'AbortError' ? 5000 : Math.round(endTime - startTime),
            error: error.name === 'AbortError' ? '連線逾時' : '連線失敗'
        };
    }
}

function updatePingMetrics() {
    const total = pingHistory.length;
    const successes = pingHistory.filter(p => p.success).length;
    const currentEl = document.getElementById('currentLatency');
    const avgEl = document.getElementById('avgLatency');
    const countsEl = document.getElementById('pingCounts');
    const lossEl = document.getElementById('packetLoss');

    countsEl.textContent = `${successes} / ${total}`;

    if (total > 0) {
        const lossRate = Math.round(((total - successes) / total) * 100);
        lossEl.textContent = `${lossRate}%`;

        const lastPing = pingHistory[total - 1];
        if (lastPing.success) {
            currentEl.textContent = `${lastPing.latency} ms`;
            currentEl.style.color = '#2ec4b6';
        } else {
            currentEl.textContent = '失敗';
            currentEl.style.color = '#e71d36';
        }

        const successPings = pingHistory.filter(p => p.success);
        if (successPings.length > 0) {
            const avg = Math.round(successPings.reduce((sum, p) => sum + p.latency, 0) / successPings.length);
            avgEl.textContent = `${avg} ms`;
        } else {
            avgEl.textContent = '-';
        }
    } else {
        currentEl.textContent = '-';
        currentEl.style.color = 'var(--primary-text-color)';
        avgEl.textContent = '-';
        lossEl.textContent = '0%';
    }
}

function updatePingLogTable() {
    const body = document.getElementById('pingLogBody');
    if (pingHistory.length === 0) {
        body.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--secondary-text-color);">尚無測試紀錄，請點擊「開始測試」</td></tr>`;
        return;
    }

    let html = '';
    // 反向排序，最新的紀錄顯示在最上方
    for (let i = pingHistory.length - 1; i >= 0; i--) {
        const record = pingHistory[i];
        const index = i + 1;
        const statusBadge = record.success
            ? '<span class="badge success">成功</span>'
            : `<span class="badge danger">${record.error || '失敗'}</span>`;
        const latencyText = record.success ? `${record.latency} ms` : '-';

        html += `
            <tr>
                <td>${index}</td>
                <td>${record.time}</td>
                <td>${statusBadge}</td>
                <td style="font-family: monospace;">${latencyText}</td>
            </tr>
        `;
    }
    body.innerHTML = html;
}

function updatePingChart() {
    const svg = document.getElementById('pingChart');
    const dynamicGroup = document.getElementById('chartDynamicGroup');
    if (!svg || !dynamicGroup) return;

    dynamicGroup.innerHTML = '';
    if (pingHistory.length === 0) return;

    const maxPoints = 20;
    const subset = pingHistory.slice(-maxPoints);

    // 尋找最大延遲作為圖表 Y 軸的最大高度（最小設為 200 ms）
    let maxVal = 200;
    subset.forEach(p => {
        if (p.success && p.latency > maxVal) {
            maxVal = p.latency;
        }
    });
    maxVal = Math.ceil(maxVal * 1.15); // 保留頂部 15% 留白

    const width = 600;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // 1. 繪製 Y 軸格線與刻度
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
        const val = Math.round((maxVal / gridLines) * i);
        const y = padding.top + chartHeight - (chartHeight / gridLines) * i;

        // 格線
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', padding.left);
        line.setAttribute('y1', y);
        line.setAttribute('x2', width - padding.right);
        line.setAttribute('y2', y);
        line.setAttribute('class', 'chart-grid-line');
        dynamicGroup.appendChild(line);

        // 文字標籤
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', padding.left - 10);
        text.setAttribute('y', y + 4);
        text.setAttribute('text-anchor', 'end');
        text.setAttribute('class', 'chart-axis-label');
        text.textContent = `${val} ms`;
        dynamicGroup.appendChild(text);
    }

    // 2. 計算點的座標
    const points = [];
    const stepX = subset.length > 1 ? chartWidth / (subset.length - 1) : chartWidth;

    subset.forEach((p, idx) => {
        const x = padding.left + idx * stepX;
        // 若連線失敗，點降至底部
        const y = p.success
            ? padding.top + chartHeight - (p.latency / maxVal) * chartHeight
            : padding.top + chartHeight;
        points.push({ x, y, latency: p.latency, success: p.success, index: pingHistory.length - subset.length + idx + 1 });
    });

    // 3. 繪製折線圖與漸層覆蓋區域
    if (points.length > 0) {
        let linePathD = '';
        let areaPathD = '';
        let firstSuccess = true;

        // 產生路徑字串（僅連接成功點以避免突兀的下墜至 0）
        points.forEach((pt) => {
            if (pt.success) {
                if (firstSuccess) {
                    linePathD = `M ${pt.x} ${pt.y}`;
                    areaPathD = `M ${pt.x} ${padding.top + chartHeight} L ${pt.x} ${pt.y}`;
                    firstSuccess = false;
                } else {
                    linePathD += ` L ${pt.x} ${pt.y}`;
                    areaPathD += ` L ${pt.x} ${pt.y}`;
                }
            }
        });

        if (!firstSuccess) {
            // 尋找最後一個成功點以封閉漸層區域
            let lastSuccess = null;
            for (let i = points.length - 1; i >= 0; i--) {
                if (points[i].success) {
                    lastSuccess = points[i];
                    break;
                }
            }
            if (lastSuccess) {
                areaPathD += ` L ${lastSuccess.x} ${padding.top + chartHeight} Z`;
            }

            // 漸層填充區
            const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            areaPath.setAttribute('d', areaPathD);
            areaPath.setAttribute('class', 'chart-area');
            dynamicGroup.appendChild(areaPath);

            // 折線
            const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            linePath.setAttribute('d', linePathD);
            linePath.setAttribute('class', 'chart-line');
            dynamicGroup.appendChild(linePath);
        }

        // 4. 繪製端點與浮動提示資訊
        points.forEach((pt) => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', pt.x);
            circle.setAttribute('cy', pt.y);
            circle.setAttribute('r', '4');
            circle.setAttribute('class', 'chart-dot');

            if (!pt.success) {
                circle.setAttribute('stroke', '#e71d36');
                circle.setAttribute('fill', '#e71d36');
            } else {
                circle.setAttribute('stroke', 'var(--accent-color)');
            }

            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = pt.success ? `第 ${pt.index} 次測試\n反應時間: ${pt.latency} ms` : `第 ${pt.index} 次測試\n連線狀態: 失敗`;
            circle.appendChild(title);
            dynamicGroup.appendChild(circle);
        });

        // 5. 標記 X 軸刻度 (只標記頭尾與中間點，避免文字重疊)
        points.forEach((pt, idx) => {
            if (idx === 0 || idx === points.length - 1 || (points.length > 2 && idx === Math.floor(points.length / 2))) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', pt.x);
                text.setAttribute('y', padding.top + chartHeight + 18);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('class', 'chart-axis-label');
                text.textContent = `#${pt.index}`;
                dynamicGroup.appendChild(text);
            }
        });
    }
}

async function triggerPingStep() {
    const targetInput = document.getElementById('targetUrl');
    const target = targetInput.value.trim();
    if (!target) return;

    const timeNow = new Date().toLocaleTimeString('zh-TW', { hour12: false });
    const result = await performSinglePing(target);

    pingHistory.push({
        success: result.success,
        latency: result.latency,
        error: result.error,
        time: timeNow
    });

    updatePingMetrics();
    updatePingLogTable();
    updatePingChart();
}

function togglePing() {
    const startBtn = document.getElementById('startPingBtn');
    const continuousCheck = document.getElementById('continuousPing');

    if (isPinging) {
        // 停止測試
        isPinging = false;
        startBtn.textContent = '開始測試';
        startBtn.style.backgroundColor = 'var(--accent-color)';
        if (pingIntervalId) {
            clearInterval(pingIntervalId);
            pingIntervalId = null;
        }
    } else {
        // 開始測試
        isPinging = true;
        startBtn.textContent = '停止測試';
        startBtn.style.backgroundColor = '#e71d36'; // 紅色停止按鈕

        // 執行第一次測試
        triggerPingStep();

        if (continuousCheck.checked) {
            pingIntervalId = setInterval(triggerPingStep, 2000);
        } else {
            isPinging = false;
            startBtn.textContent = '開始測試';
            startBtn.style.backgroundColor = 'var(--accent-color)';
        }
    }
}

// --- 2. 常用網站檢測邏輯 ---
const presetSites = [
    { name: 'Google 搜尋', url: 'www.google.com' },
    { name: 'GitHub 社群', url: 'github.com' },
    { name: 'Cloudflare DNS', url: '1.1.1.1' },
    { name: 'YouTube 影音', url: 'www.youtube.com' },
    { name: '微軟官方網站', url: 'www.microsoft.com' },
    { name: '維基百科', url: 'www.wikipedia.org' },
    { name: 'AWS 雲端服務', url: 'aws.amazon.com' },
    { name: 'Yahoo 奇摩', url: 'www.yahoo.com' }
];

function initializeBatchTable() {
    const body = document.getElementById('batchTableBody');
    let html = '';
    presetSites.forEach((site, index) => {
        html += `
            <tr id="batch-row-${index}">
                <td style="font-weight: bold;">${site.name}</td>
                <td style="font-family: monospace; color: var(--secondary-text-color);">${site.url}</td>
                <td class="status-cell"><span class="badge warning">未測試</span></td>
                <td class="latency-cell" style="font-family: monospace;">-</td>
            </tr>
        `;
    });
    body.innerHTML = html;
}

async function runBatchTest() {
    const startBtn = document.getElementById('startBatchBtn');
    startBtn.disabled = true;
    startBtn.textContent = '測試中...';

    for (let i = 0; i < presetSites.length; i++) {
        const site = presetSites[i];
        const row = document.getElementById(`batch-row-${i}`);
        if (!row) continue;

        const statusCell = row.querySelector('.status-cell');
        const latencyCell = row.querySelector('.latency-cell');

        statusCell.innerHTML = '<span class="status-indicator"><span class="status-dot testing"></span> 檢測中</span>';
        latencyCell.textContent = '-';

        const result = await performSinglePing(site.url);

        if (result.success) {
            statusCell.innerHTML = '<span class="badge success">成功</span>';
            latencyCell.textContent = `${result.latency} ms`;
        } else {
            statusCell.innerHTML = `<span class="badge danger">${result.error || '失敗'}</span>`;
            latencyCell.textContent = '-';
        }
    }

    startBtn.disabled = false;
    startBtn.textContent = '開始批次測試';
}

// --- 3. DNS 記錄查詢 (DoH) 邏輯 ---
const dnsTypes = {
    1: 'A',
    2: 'NS',
    5: 'CNAME',
    6: 'SOA',
    15: 'MX',
    16: 'TXT',
    28: 'AAAA',
    257: 'CAA'
};

// 快取 IP 地理位置查詢結果，避免重複請求與限流
const ipLocationCache = {};

async function fetchIpLocationData(ip) {
    if (ipLocationCache[ip]) {
        return ipLocationCache[ip];
    }

    const response = await fetch(`https://api.ip.sb/geoip/${encodeURIComponent(ip)}`);
    if (!response.ok) {
        throw new Error(`IP 查詢服務回應錯誤 (${response.status})`);
    }

    const data = await response.json();
    if (!data || !data.ip) {
        throw new Error('找不到此 IP 的位置資訊');
    }

    ipLocationCache[ip] = data;
    return data;
}

async function queryIpLocation(event) {
    event.preventDefault();

    const ipInput = document.getElementById('lookupIp');
    const queryBtn = document.getElementById('queryIpBtn');
    const status = document.getElementById('ipLookupStatus');
    const result = document.getElementById('ipLookupResult');
    const ip = ipInput.value.trim();

    const isIpv4 = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(ip);
    let isIpv6 = false;
    if (ip.includes(':')) {
        try {
            new URL(`http://[${ip}]/`);
            isIpv6 = true;
        } catch (error) {
            isIpv6 = false;
        }
    }

    result.style.display = 'none';
    status.style.display = 'block';
    status.style.color = '#e71d36';
    if (!isIpv4 && !isIpv6) {
        status.textContent = '請輸入有效的 IPv4 或 IPv6 地址。';
        return;
    }

    queryBtn.disabled = true;
    status.style.color = 'var(--secondary-text-color)';
    status.textContent = '查詢中...';

    try {
        const data = await fetchIpLocationData(ip);
        document.getElementById('lookupResultIp').textContent = data.ip || ip;
        document.getElementById('lookupResultIsp').textContent = data.isp || '—';
        document.getElementById('lookupResultAsn').textContent = data.asn || '—';
        document.getElementById('lookupResultCountry').textContent = [data.country, data.country_code].filter(Boolean).join(' (') + (data.country_code ? ')' : '') || '—';
        document.getElementById('lookupResultCity').textContent = [data.region, data.city].filter(Boolean).join(' / ') || '—';
        document.getElementById('lookupResultTimezone').textContent = data.timezone || '—';
        document.getElementById('lookupResultGeo').textContent = data.latitude != null && data.longitude != null
            ? `${data.latitude}, ${data.longitude}`
            : '—';
        result.style.display = 'grid';
        status.textContent = '查詢完成。';
        status.style.color = 'var(--primary-text-color)';
    } catch (error) {
        console.error('IP 位置查詢錯誤:', error);
        status.textContent = '查詢失敗，請確認 IP 地址或稍後再試。';
    } finally {
        queryBtn.disabled = false;
    }
}

async function getIpLocation(ip) {
    const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipv4Regex.test(ip) && !ip.includes(':')) {
        return '—';
    }

    try {
        const data = await fetchIpLocationData(ip);
        const locationParts = [data.country, data.city, data.isp].filter(Boolean);
        return locationParts.join(' - ') || '無位置資訊';
    } catch (e) {
        console.error(`無法獲取 IP ${ip} 的地理位置:`, e);
    }
    return '查詢失敗';
}

async function queryDns() {
    const domainInput = document.getElementById('dnsDomain');
    let domain = domainInput.value.trim();

    if (!domain) return;

    // 自動過濾輸入內容以擷取純網網域
    if (/^https?:\/\//i.test(domain)) {
        try {
            const urlObj = new URL(domain);
            domain = urlObj.hostname;
        } catch (e) {
            domain = domain.replace(/^https?:\/\//i, '').split('/')[0];
        }
    } else {
        domain = domain.split('/')[0];
    }
    domain = domain.split(':')[0]; // 移除可能包含的埠號 (port)

    // 將清理後的純網域回填至輸入框，告知使用者實際查詢的網域
    domainInput.value = domain;

    const typeSelect = document.getElementById('dnsType');
    const type = typeSelect.value;
    const queryBtn = document.getElementById('queryDnsBtn');
    const loader = document.getElementById('dnsLoader');
    const resultSection = document.getElementById('dnsResultSection');
    const resultBody = document.getElementById('dnsResultBody');

    // 顯示載入中
    queryBtn.disabled = true;
    loader.style.display = 'block';
    resultSection.style.display = 'none';

    try {
        // 使用 Cloudflare DNS-over-HTTPS JSON API
        const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`;
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/dns-json'
            }
        });
        const data = await response.json();

        resultBody.innerHTML = '';

        if (data.Status !== 0) {
            // Status 0 代表 NOERROR (成功)
            resultBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #e71d36;">查詢失敗，錯誤代碼 Status: ${data.Status}</td></tr>`;
        } else if (!data.Answer || data.Answer.length === 0) {
            resultBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--secondary-text-color);">此網域無對應之 ${type} 記錄</td></tr>`;
        } else {
            let html = '';
            data.Answer.forEach((ans, index) => {
                const typeName = dnsTypes[ans.type] || ans.type;
                const isIp = ans.type === 1 || ans.type === 28;
                const locationId = `dns-location-${index}`;
                const initialLocation = isIp ? '查詢中...' : '—';

                html += `
                    <tr>
                        <td style="font-family: monospace; word-break: break-all;">${escapeHtml(ans.name)}</td>
                        <td><span class="badge success" style="font-size: 0.75rem;">${escapeHtml(typeName)}</span></td>
                        <td style="font-family: monospace;">${escapeHtml(ans.TTL)}</td>
                        <td style="font-family: monospace; word-break: break-all;">${escapeHtml(ans.data)}</td>
                        <td id="${locationId}" style="font-size: 0.9rem; color: var(--secondary-text-color);">${initialLocation}</td>
                    </tr>
                `;

                // 非同步查詢 IP 所在地，避免阻塞主執行緒
                if (isIp) {
                    getIpLocation(ans.data).then(locationVal => {
                        const cell = document.getElementById(locationId);
                        if (cell) {
                            cell.textContent = locationVal;
                        }
                    });
                }
            });
            resultBody.innerHTML = html;
        }
    } catch (error) {
        console.error('DNS 查詢錯誤:', error);
        resultBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #e71d36;">連線 DoH 伺服器失敗，請確認您的網路連線。</td></tr>`;
    } finally {
        queryBtn.disabled = false;
        loader.style.display = 'none';
        resultSection.style.display = 'block';
    }
}

// --- 4. 本機網路資訊邏輯 ---
let ipLoaded = false;

async function fetchIpInfo() {
    const clientIpEl = document.getElementById('clientIp');
    const clientIspEl = document.getElementById('clientIsp');
    const clientAsnEl = document.getElementById('clientAsn');
    const clientCountryEl = document.getElementById('clientCountry');
    const clientCityEl = document.getElementById('clientCity');
    const clientGeoEl = document.getElementById('clientGeo');
    const browserOnlineEl = document.getElementById('browserOnline');
    const connectionTypeEl = document.getElementById('connectionType');
    const userAgentInfoEl = document.getElementById('userAgentInfo');

    // 1. 本地資訊
    browserOnlineEl.innerHTML = navigator.onLine
        ? '<span class="badge success">已連線</span>'
        : '<span class="badge danger">離線</span>';

    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    connectionTypeEl.textContent = conn ? `${conn.effectiveType || '未知'} (${conn.type || '未指定'})` : '瀏覽器不支援';
    userAgentInfoEl.textContent = navigator.userAgent;

    try {
        // 使用 api.ip.sb (支援 HTTPS 與 CORS，免註冊，穩定度高)
        const response = await fetch('https://api.ip.sb/geoip');
        const data = await response.json();

        if (!data) {
            throw new Error('IP 資訊查詢失敗');
        }

        clientIpEl.textContent = data.ip || '-';
        clientIspEl.textContent = data.isp || '-';
        clientAsnEl.textContent = data.asn || '-';
        clientCountryEl.textContent = `${data.country || ''} (${data.country_code || ''})`;
        clientCityEl.textContent = `${data.region || ''} ${data.city || ''}`;

        if (data.latitude && data.longitude) {
            const latLon = `${data.latitude}, ${data.longitude}`;
            const mapsLink = document.createElement('a');
            mapsLink.href = `https://www.google.com/maps?q=${encodeURIComponent(latLon)}`;
            mapsLink.target = '_blank';
            mapsLink.rel = 'noopener';
            mapsLink.className = 'maps-link';
            mapsLink.textContent = 'Google 地圖 ↗';
            clientGeoEl.textContent = `${latLon} `;
            clientGeoEl.appendChild(mapsLink);
        } else {
            clientGeoEl.textContent = '-';
        }

        ipLoaded = true;
    } catch (error) {
        console.error('IP 資訊獲取錯誤:', error);

        // 降級方案：僅獲取 IP
        try {
            const fallbackRes = await fetch('https://api.ipify.org?format=json');
            const fallbackData = await fallbackRes.json();
            clientIpEl.textContent = fallbackData.ip || '查詢失敗';
        } catch (e) {
            clientIpEl.textContent = '查詢失敗';
        }

        clientIspEl.textContent = '查詢失敗';
        clientAsnEl.textContent = '查詢失敗';
        clientCountryEl.textContent = '查詢失敗';
        clientCityEl.textContent = '查詢失敗';
        clientGeoEl.textContent = '查詢失敗';
    }
}

// --- 初始化頁面 ---
document.addEventListener('DOMContentLoaded', () => {
    // 切換到本機網路資訊頁籤時才載入 IP 資訊
    initTabs(tabId => {
        if (tabId === 'ip-tab' && !ipLoaded) fetchIpInfo();
    });
    initializeBatchTable();
    // 繪製初始空的圖表格線
    updatePingChart();
});
