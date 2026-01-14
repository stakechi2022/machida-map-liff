// 町田市の中心座標
const MACHIDA_CENTER = {
    lat: 35.5437,
    lng: 139.4467
};

// グローバル変数
let map;
let statusElement;

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

// ページ読み込み時にLIFFを初期化
window.addEventListener('load', () => {
    initializeLiff();
});

// エラーハンドリング
window.addEventListener('error', (event) => {
    console.error('グローバルエラー:', event.error);
});
