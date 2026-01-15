// 町田市の中心座標
const MACHIDA_CENTER = {
    lat: 35.5437,
    lng: 139.4467
};

// グローバル変数
let map;
let statusElement;
let selectedLocation = null;
let propertyRecords = {};
let highlightLayers = {};

// ローカルストレージのキー
const STORAGE_KEY = 'machida_property_records';

// 1ヶ月のミリ秒
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

// LIFF初期化
async function initializeLiff() {
    try {
        statusElement = document.getElementById('status');
        statusElement.className = 'loading';
        statusElement.textContent = 'LIFF初期化中...';

        // LIFF IDを環境変数から取得（実際の使用時は設定が必要）
        const liffId = '2008888917-5LvLxAk1'; // ここに実際のLIFF IDを設定してください
        
        await liff.init({ liffId: liffId });

        if (liff.isLoggedIn()) {
            statusElement.textContent = '接続完了';
            await getUserProfile();
        } else {
            statusElement.textContent = 'ログインしてください';
            liff.login();
        }

        // 閉じるボタンの表示と機能設定
        const closeBtn = document.getElementById('close-btn');
        if (liff.isInClient()) {
            closeBtn.style.display = 'block';
            closeBtn.addEventListener('click', () => {
                liff.closeWindow();
            });
        }

        // 地図の初期化
        initializeMap();

    } catch (error) {
        console.error('LIFF初期化エラー:', error);
        statusElement.textContent = 'エラーが発生しました';
        statusElement.style.color = '#ff4444';
        
        // エラーが発生してもマップは表示する
        initializeMap();
    }
}

// ユーザープロフィール取得
async function getUserProfile() {
    try {
        const profile = await liff.getProfile();
        const userInfoElement = document.getElementById('user-info');
        
        userInfoElement.innerHTML = `
            <p><strong>ようこそ！</strong></p>
            <p>👤 ${profile.displayName}</p>
            <p>📧 ${profile.statusMessage || 'ステータスメッセージなし'}</p>
        `;
    } catch (error) {
        console.error('プロフィール取得エラー:', error);
    }
}

// 地図の初期化
function initializeMap() {
    try {
        // Leafletマップの作成
        map = L.map('map').setView([MACHIDA_CENTER.lat, MACHIDA_CENTER.lng], 13);

        // OpenStreetMapタイルレイヤーの追加
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        // 町田市の主要スポットにマーカーを追加
        addMachidaMarkers();

        // 地図クリックイベント
        map.on('click', onMapClick);

        // 地図が読み込まれたらステータスを更新
        map.whenReady(() => {
            if (statusElement.textContent === 'LIFF初期化中...' || 
                statusElement.textContent === '読み込み中...') {
                statusElement.textContent = '地図表示完了';
            }
            setTimeout(() => {
                statusElement.style.opacity = '0.7';
            }, 2000);
        });

        // ローカルストレージから記録を読み込み
        loadPropertyRecords();

        // イベントリスナーの設定
        setupEventListeners();

    } catch (error) {
        console.error('地図初期化エラー:', error);
        statusElement.textContent = '地図の読み込みに失敗しました';
        statusElement.style.color = '#ff4444';
    }
}

// 町田市の主要スポットにマーカーを追加
function addMachidaMarkers() {
    const spots = [
        {
            name: '町田駅',
            lat: 35.5437,
            lng: 139.4467,
            description: '小田急線・JR横浜線が乗り入れる町田市の中心駅'
        },
        {
            name: '町田市役所',
            lat: 35.5486,
            lng: 139.4386,
            description: '町田市の行政の中心'
        },
        {
            name: '薬師池公園',
            lat: 35.5833,
            lng: 139.4167,
            description: '四季折々の自然が楽しめる都立公園'
        },
        {
            name: '町田リス園',
            lat: 35.5833,
            lng: 139.4194,
            description: '約200匹のタイワンリスと触れ合える動物園'
        },
        {
            name: '町田天満宮',
            lat: 35.5456,
            lng: 139.4481,
            description: '学問の神様・菅原道真を祀る神社'
        }
    ];

    // カスタムアイコンの作成
    const customIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    // 各スポットにマーカーを追加
    spots.forEach(spot => {
        const marker = L.marker([spot.lat, spot.lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(`
                <div style="min-width: 200px;">
                    <h3 style="margin: 0 0 8px 0; color: #06C755; font-size: 16px;">${spot.name}</h3>
                    <p style="margin: 0; font-size: 13px; color: #666;">${spot.description}</p>
                </div>
            `);
    });

    // 町田市の境界を示す円を追加（おおよその範囲）
    L.circle([MACHIDA_CENTER.lat, MACHIDA_CENTER.lng], {
        color: '#06C755',
        fillColor: '#06C755',
        fillOpacity: 0.1,
        radius: 5000
    }).addTo(map);
}

// イベントリスナーの設定
function setupEventListeners() {
    // 住所検索ボタン
    document.getElementById('search-btn').addEventListener('click', searchAddress);
    
    // Enterキーで検索
    ['town-name', 'chome', 'banchi', 'go'].forEach(id => {
        document.getElementById(id).addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchAddress();
            }
        });
    });

    // 記録保存ボタン
    document.getElementById('save-record-btn').addEventListener('click', saveRecord);
    
    // 記録削除ボタン
    document.getElementById('delete-record-btn').addEventListener('click', deleteRecord);
    
    // キャンセルボタン
    document.getElementById('cancel-record-btn').addEventListener('click', closeRecordPanel);
}

// 住所検索
async function searchAddress() {
    const townName = document.getElementById('town-name').value.trim();
    const chome = document.getElementById('chome').value.trim();
    const banchi = document.getElementById('banchi').value.trim();
    const go = document.getElementById('go').value.trim();

    if (!townName) {
        alert('町名を入力してください');
        return;
    }

    // 東京都町田市 + 入力された住所を組み立て
    let address = `東京都町田市${townName}`;
    if (chome) address += `${chome}丁目`;
    if (banchi) address += `${banchi}番地`;
    if (go) address += `${go}号`;

    statusElement.textContent = '住所を検索中...';
    statusElement.style.opacity = '1';

    try {
        // Nominatim APIで住所をジオコーディング
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
        );
        const data = await response.json();

        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            
            // 地図を移動してズーム
            map.setView([lat, lng], 18);
            
            // マーカーを追加
            const marker = L.marker([lat, lng])
                .addTo(map)
                .bindPopup(`
                    <div style="min-width: 200px;">
                        <h3 style="margin: 0 0 8px 0; color: #06C755; font-size: 14px;">📍 ${address}</h3>
                        <button onclick="openRecordPanelFromSearch(${lat}, ${lng}, '${address}')" 
                                style="background: #06C755; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; width: 100%;">
                            📝 記録を追加
                        </button>
                    </div>
                `)
                .openPopup();
            
            statusElement.textContent = '住所が見つかりました';
            setTimeout(() => {
                statusElement.style.opacity = '0.7';
            }, 2000);
        } else {
            statusElement.textContent = '住所が見つかりませんでした';
            alert('住所が見つかりませんでした。入力内容を確認してください。');
            setTimeout(() => {
                statusElement.textContent = '地図表示完了';
                statusElement.style.opacity = '0.7';
            }, 3000);
        }
    } catch (error) {
        console.error('住所検索エラー:', error);
        statusElement.textContent = '検索エラーが発生しました';
        alert('住所検索中にエラーが発生しました');
        setTimeout(() => {
            statusElement.textContent = '地図表示完了';
            statusElement.style.opacity = '0.7';
        }, 3000);
    }
}

// 検索から記録パネルを開く（グローバル関数）
window.openRecordPanelFromSearch = function(lat, lng, address) {
    selectedLocation = { lat, lng, address };
    openRecordPanel();
};

// 地図クリック時の処理
function onMapClick(e) {
    selectedLocation = {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        address: `緯度: ${e.latlng.lat.toFixed(6)}, 経度: ${e.latlng.lng.toFixed(6)}`
    };
    openRecordPanel();
}

// 記録パネルを開く
function openRecordPanel() {
    const panel = document.getElementById('record-panel');
    const recordInfo = document.getElementById('record-info');
    const memoInput = document.getElementById('memo-input');
    const deleteBtn = document.getElementById('delete-record-btn');

    const locationKey = getLocationKey(selectedLocation.lat, selectedLocation.lng);
    const existingRecord = propertyRecords[locationKey];

    recordInfo.innerHTML = `
        <strong>📍 選択位置:</strong><br>
        ${selectedLocation.address}
    `;

    if (existingRecord) {
        memoInput.value = existingRecord.memo;
        deleteBtn.style.display = 'block';
        recordInfo.innerHTML += `<br><small>記録日時: ${new Date(existingRecord.timestamp).toLocaleString('ja-JP')}</small>`;
    } else {
        memoInput.value = '';
        deleteBtn.style.display = 'none';
    }

    panel.style.display = 'block';
    memoInput.focus();
}

// 記録パネルを閉じる
function closeRecordPanel() {
    document.getElementById('record-panel').style.display = 'none';
    selectedLocation = null;
}

// 記録を保存
function saveRecord() {
    const memo = document.getElementById('memo-input').value.trim();
    
    if (!memo) {
        alert('メモを入力してください');
        return;
    }

    const locationKey = getLocationKey(selectedLocation.lat, selectedLocation.lng);
    const timestamp = Date.now();

    propertyRecords[locationKey] = {
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        address: selectedLocation.address,
        memo: memo,
        timestamp: timestamp
    };

    savePropertyRecords();
    addHighlight(locationKey, selectedLocation.lat, selectedLocation.lng);
    closeRecordPanel();

    statusElement.textContent = '記録を保存しました';
    statusElement.style.opacity = '1';
    setTimeout(() => {
        statusElement.textContent = '地図表示完了';
        statusElement.style.opacity = '0.7';
    }, 2000);
}

// 記録を削除
function deleteRecord() {
    if (!confirm('この記録を削除しますか？')) {
        return;
    }

    const locationKey = getLocationKey(selectedLocation.lat, selectedLocation.lng);
    
    delete propertyRecords[locationKey];
    savePropertyRecords();
    removeHighlight(locationKey);
    closeRecordPanel();

    statusElement.textContent = '記録を削除しました';
    statusElement.style.opacity = '1';
    setTimeout(() => {
        statusElement.textContent = '地図表示完了';
        statusElement.style.opacity = '0.7';
    }, 2000);
}

// ハイライトを追加
function addHighlight(locationKey, lat, lng) {
    // 既存のハイライトを削除
    removeHighlight(locationKey);

    // 円形のハイライトを追加
    const circle = L.circle([lat, lng], {
        color: '#FFD700',
        fillColor: '#FFFF00',
        fillOpacity: 0.6,
        radius: 20,
        weight: 2
    }).addTo(map);

    // ポップアップを追加
    const record = propertyRecords[locationKey];
    circle.bindPopup(`
        <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #FFD700; font-size: 14px;">📝 記録済み物件</h3>
            <p style="margin: 5px 0; font-size: 13px;"><strong>メモ:</strong> ${record.memo}</p>
            <p style="margin: 5px 0; font-size: 11px; color: #666;">記録日時: ${new Date(record.timestamp).toLocaleString('ja-JP')}</p>
            <button onclick="editRecord('${locationKey}')" 
                    style="background: #06C755; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; width: 100%; margin-top: 5px;">
                ✏️ 編集
            </button>
        </div>
    `);

    highlightLayers[locationKey] = circle;
}

// ハイライトを削除
function removeHighlight(locationKey) {
    if (highlightLayers[locationKey]) {
        map.removeLayer(highlightLayers[locationKey]);
        delete highlightLayers[locationKey];
    }
}

// 記録を編集（グローバル関数）
window.editRecord = function(locationKey) {
    const record = propertyRecords[locationKey];
    if (record) {
        selectedLocation = {
            lat: record.lat,
            lng: record.lng,
            address: record.address
        };
        openRecordPanel();
    }
};

// 位置のキーを生成（緯度経度を丸めて同じ場所として扱う）
function getLocationKey(lat, lng) {
    return `${lat.toFixed(5)}_${lng.toFixed(5)}`;
}

// ローカルストレージに保存
function savePropertyRecords() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(propertyRecords));
    } catch (error) {
        console.error('保存エラー:', error);
        alert('記録の保存に失敗しました');
    }
}

// ローカルストレージから読み込み
function loadPropertyRecords() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            propertyRecords = JSON.parse(stored);
            
            // 期限切れの記録をチェックして表示
            const now = Date.now();
            Object.keys(propertyRecords).forEach(locationKey => {
                const record = propertyRecords[locationKey];
                const age = now - record.timestamp;
                
                if (age < ONE_MONTH_MS) {
                    // 1ヶ月以内の記録はハイライト表示
                    addHighlight(locationKey, record.lat, record.lng);
                } else {
                    // 1ヶ月以上経過した記録は非表示（データは保持）
                    console.log(`記録が期限切れです: ${locationKey}`);
                }
            });
        }
    } catch (error) {
        console.error('読み込みエラー:', error);
    }
}

// 定期的に期限切れをチェック（1分ごと）
setInterval(() => {
    const now = Date.now();
    let hasExpired = false;
    
    Object.keys(propertyRecords).forEach(locationKey => {
        const record = propertyRecords[locationKey];
        const age = now - record.timestamp;
        
        if (age >= ONE_MONTH_MS && highlightLayers[locationKey]) {
            // 期限切れのハイライトを削除
            removeHighlight(locationKey);
            hasExpired = true;
        }
    });
    
    if (hasExpired) {
        console.log('期限切れの記録を非表示にしました');
    }
}, 60000); // 60秒ごとにチェック

// ページ読み込み時にLIFFを初期化
window.addEventListener('load', () => {
    initializeLiff();
});

// エラーハンドリング
window.addEventListener('error', (event) => {
    console.error('グローバルエラー:', event.error);
});
