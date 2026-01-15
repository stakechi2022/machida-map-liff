// 町田市の中心座標
const MACHIDA_CENTER = {
    lat: 35.5437,
    lng: 139.4467
};

// グローバル変数
let map;
let geocoder;
let statusElement;
let selectedLocation = null;
let propertyRecords = {};
let highlightCircles = {};
let infoWindow;

// ローカルストレージのキー
const STORAGE_KEY = 'machida_property_records';

// 1ヶ月のミリ秒
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

// Google Maps初期化（コールバック関数）
window.initMap = function() {
    initializeMap();
};

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

    } catch (error) {
        console.error('LIFF初期化エラー:', error);
        statusElement.textContent = 'エラーが発生しました';
        statusElement.style.color = '#ff4444';
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
        // Google Mapの作成
        map = new google.maps.Map(document.getElementById('map'), {
            center: MACHIDA_CENTER,
            zoom: 13,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true
        });

        // Geocoderの初期化
        geocoder = new google.maps.Geocoder();

        // InfoWindowの初期化
        infoWindow = new google.maps.InfoWindow();

        // 町田市の主要スポットにマーカーを追加
        addMachidaMarkers();

        // 地図クリックイベント
        map.addListener('click', (event) => {
            onMapClick(event.latLng);
        });

        // ステータス更新
        if (statusElement.textContent === 'LIFF初期化中...' || 
            statusElement.textContent === '読み込み中...') {
            statusElement.textContent = '地図表示完了';
        }
        setTimeout(() => {
            statusElement.style.opacity = '0.7';
        }, 2000);

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
function searchAddress() {
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

    // Google Maps Geocoding APIで住所をジオコーディング
    geocoder.geocode({ address: address, region: 'JP' }, (results, status) => {
        if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            const formattedAddress = results[0].formatted_address;
            
            // 地図を移動してズーム
            map.setCenter(location);
            map.setZoom(18);
            
            // マーカーを追加
            const marker = new google.maps.Marker({
                position: location,
                map: map,
                animation: google.maps.Animation.DROP
            });

            // InfoWindowを表示
            infoWindow.setContent(`
                <div style="min-width: 200px; padding: 10px;">
                    <h3 style="margin: 0 0 8px 0; color: #06C755; font-size: 14px;">📍 ${formattedAddress}</h3>
                    <button onclick="openRecordPanelFromSearch(${location.lat()}, ${location.lng()}, '${formattedAddress.replace(/'/g, "\\'")}')" 
                            style="background: #06C755; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; width: 100%;">
                        📝 記録を追加
                    </button>
                </div>
            `);
            infoWindow.open(map, marker);
            
            statusElement.textContent = '住所が見つかりました';
            setTimeout(() => {
                statusElement.style.opacity = '0.7';
            }, 2000);
        } else {
            statusElement.textContent = '住所が見つかりませんでした';
            alert('住所が見つかりませんでした。入力内容を確認してください。\nステータス: ' + status);
            setTimeout(() => {
                statusElement.textContent = '地図表示完了';
                statusElement.style.opacity = '0.7';
            }, 3000);
        }
    });
}

// 検索から記録パネルを開く（グローバル関数）
window.openRecordPanelFromSearch = function(lat, lng, address) {
    selectedLocation = { lat, lng, address };
    openRecordPanel();
};

// 地図クリック時の処理（逆ジオコーディングで住所を取得）
function onMapClick(latLng) {
    statusElement.textContent = '住所を取得中...';
    statusElement.style.opacity = '1';

    // 逆ジオコーディングで住所を取得
    geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === 'OK' && results[0]) {
            const address = results[0].formatted_address;
            selectedLocation = {
                lat: latLng.lat(),
                lng: latLng.lng(),
                address: address
            };
            openRecordPanel();
            
            statusElement.textContent = '地図表示完了';
            setTimeout(() => {
                statusElement.style.opacity = '0.7';
            }, 1000);
        } else {
            // 住所が取得できない場合は緯度経度を使用
            selectedLocation = {
                lat: latLng.lat(),
                lng: latLng.lng(),
                address: `緯度: ${latLng.lat().toFixed(6)}, 経度: ${latLng.lng().toFixed(6)}`
            };
            openRecordPanel();
            
            statusElement.textContent = '地図表示完了';
            setTimeout(() => {
                statusElement.style.opacity = '0.7';
            }, 1000);
        }
    });
}

// 記録パネルを開く
function openRecordPanel() {
    const panel = document.getElementById('record-panel');
    const recordInfo = document.getElementById('record-info');
    const memoInput = document.getElementById('memo-input');
    const deleteBtn = document.getElementById('delete-record-btn');

    // 住所をキーとして使用
    const addressKey = normalizeAddress(selectedLocation.address);
    const existingRecord = propertyRecords[addressKey];

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

    const addressKey = normalizeAddress(selectedLocation.address);
    const timestamp = Date.now();

    propertyRecords[addressKey] = {
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        address: selectedLocation.address,
        memo: memo,
        timestamp: timestamp
    };

    savePropertyRecords();
    addHighlight(addressKey, selectedLocation.lat, selectedLocation.lng, selectedLocation.address, memo, timestamp);
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

    const addressKey = normalizeAddress(selectedLocation.address);
    
    delete propertyRecords[addressKey];
    savePropertyRecords();
    removeHighlight(addressKey);
    closeRecordPanel();

    statusElement.textContent = '記録を削除しました';
    statusElement.style.opacity = '1';
    setTimeout(() => {
        statusElement.textContent = '地図表示完了';
        statusElement.style.opacity = '0.7';
    }, 2000);
}

// ハイライトを追加
function addHighlight(addressKey, lat, lng, address, memo, timestamp) {
    // 既存のハイライトを削除
    removeHighlight(addressKey);

    // 円形のハイライトを追加
    const circle = new google.maps.Circle({
        strokeColor: '#FFD700',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FFFF00',
        fillOpacity: 0.6,
        map: map,
        center: { lat, lng },
        radius: 20,
        clickable: true
    });

    // クリックイベント
    circle.addListener('click', () => {
        infoWindow.setContent(`
            <div style="min-width: 200px; padding: 10px;">
                <h3 style="margin: 0 0 8px 0; color: #FFD700; font-size: 14px;">📝 記録済み物件</h3>
                <p style="margin: 5px 0; font-size: 12px;"><strong>住所:</strong> ${address}</p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>メモ:</strong> ${memo}</p>
                <p style="margin: 5px 0; font-size: 11px; color: #666;">記録日時: ${new Date(timestamp).toLocaleString('ja-JP')}</p>
                <button onclick="editRecord('${addressKey.replace(/'/g, "\\'")}', ${lat}, ${lng}, '${address.replace(/'/g, "\\'")}')" 
                        style="background: #06C755; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; width: 100%; margin-top: 5px;">
                    ✏️ 編集
                </button>
            </div>
        `);
        infoWindow.setPosition({ lat, lng });
        infoWindow.open(map);
    });

    highlightCircles[addressKey] = circle;
}

// ハイライトを削除
function removeHighlight(addressKey) {
    if (highlightCircles[addressKey]) {
        highlightCircles[addressKey].setMap(null);
        delete highlightCircles[addressKey];
    }
}

// 記録を編集（グローバル関数）
window.editRecord = function(addressKey, lat, lng, address) {
    const record = propertyRecords[addressKey];
    if (record) {
        selectedLocation = {
            lat: lat,
            lng: lng,
            address: address
        };
        openRecordPanel();
    }
};

// 住所を正規化（キーとして使用）
function normalizeAddress(address) {
    // 空白を削除し、統一されたキーを作成
    return address.replace(/\s+/g, '').trim();
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
            Object.keys(propertyRecords).forEach(addressKey => {
                const record = propertyRecords[addressKey];
                const age = now - record.timestamp;
                
                if (age < ONE_MONTH_MS) {
                    // 1ヶ月以内の記録はハイライト表示
                    addHighlight(addressKey, record.lat, record.lng, record.address, record.memo, record.timestamp);
                } else {
                    // 1ヶ月以上経過した記録は非表示（データは保持）
                    console.log(`記録が期限切れです: ${addressKey}`);
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
    
    Object.keys(propertyRecords).forEach(addressKey => {
        const record = propertyRecords[addressKey];
        const age = now - record.timestamp;
        
        if (age >= ONE_MONTH_MS && highlightCircles[addressKey]) {
            // 期限切れのハイライトを削除
            removeHighlight(addressKey);
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
