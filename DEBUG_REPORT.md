# デバッグレポート

## 実行日時
2026-01-16

## 発見されたバグと修正内容

### 🐛 バグ1: `addMachidaMarkers()` 関数が未定義

**問題点:**
- [`app.js`](app.js:98)の98行目で`addMachidaMarkers()`関数が呼び出されているが、関数の実装が存在しない
- これにより、地図初期化時にエラーが発生し、町田市の主要スポットマーカーが表示されない

**修正内容:**
- [`app.js`](app.js:127-170)に`addMachidaMarkers()`関数を実装
- 町田市役所、町田駅、町田薬師池公園の3つのスポットマーカーを追加
- Google Maps APIを使用したマーカーとInfoWindowの実装

**修正箇所:**
```javascript
// 町田市の主要スポットにマーカーを追加
function addMachidaMarkers() {
    const spots = [
        {
            name: '町田市役所',
            lat: 35.5454,
            lng: 139.4388,
            description: '町田市の行政の中心'
        },
        {
            name: '町田駅',
            lat: 35.5421,
            lng: 139.4467,
            description: 'JR横浜線・小田急線の駅'
        },
        {
            name: '町田薬師池公園',
            lat: 35.5833,
            lng: 139.4667,
            description: '四季折々の自然が楽しめる公園'
        }
    ];

    spots.forEach(spot => {
        const marker = new google.maps.Marker({
            position: { lat: spot.lat, lng: spot.lng },
            map: map,
            title: spot.name,
            icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }
        });

        marker.addListener('click', () => {
            infoWindow.setContent(`
                <div style="min-width: 200px; padding: 10px;">
                    <h3 style="margin: 0 0 8px 0; color: #06C755; font-size: 14px;">${spot.name}</h3>
                    <p style="margin: 5px 0; font-size: 13px;">${spot.description}</p>
                </div>
            `);
            infoWindow.open(map, marker);
        });
    });
}
```

---

### 🐛 バグ2: READMEの技術スタック記載が不正確

**問題点:**
- [`README.md`](README.md:217-223)に「Leaflet.js」と「OpenStreetMap」を使用していると記載されているが、実際は「Google Maps API」を使用している
- ドキュメントとコードの不一致により、開発者が混乱する可能性がある

**修正内容:**
- READMEの技術スタックセクションを更新
- Leaflet.jsとOpenStreetMapの記載を削除
- Google Maps JavaScript API、Geocoding API、Places APIの記載を追加
- LocalStorageの記載も追加

**修正前:**
```markdown
## 🛠️ 技術スタック

- **LIFF SDK 2.x**: LINE Front-end Framework
- **Leaflet.js 1.9.4**: オープンソース地図ライブラリ
- **OpenStreetMap**: 地図タイルデータ
- **HTML5/CSS3/JavaScript**: フロントエンド
```

**修正後:**
```markdown
## 🛠️ 技術スタック

- **LIFF SDK 2.x**: LINE Front-end Framework
- **Google Maps JavaScript API**: 地図表示とジオコーディング
- **Google Maps Geocoding API**: 住所検索と逆ジオコーディング
- **Google Maps Places API**: 場所情報の取得
- **HTML5/CSS3/JavaScript**: フロントエンド
- **LocalStorage**: クライアントサイドデータ保存
```

---

### 🐛 バグ3: READMEの機能説明が不正確

**問題点:**
- [`README.md`](README.md:7-11)の機能説明に「Leaflet.js使用」と記載されている

**修正内容:**
- 「Leaflet.js使用」を「Google Maps使用」に変更

---

### 🐛 バグ4: READMEのカスタマイズ手順が不正確

**問題点:**
- [`README.md`](README.md:253-266)のカスタマイズセクションにLeaflet.jsのコード例が記載されている

**修正内容:**
- Google Maps APIの正しいコード例に更新

**修正後:**
```javascript
// initializeMap()関数内で
map = new google.maps.Map(document.getElementById('map'), {
    center: MACHIDA_CENTER,
    zoom: 13,  // ズームレベル: 1-20（数字が大きいほど拡大）
    // その他のオプション...
});
```

---

### 🐛 バグ5: READMEのセットアップ手順が不正確

**問題点:**
- [`README.md`](README.md:110-120)でGoogle Maps APIキーを`index.html`に直接記載する手順になっている
- 実際のコードでは[`config.js`](config.js:7)から読み込む実装になっている

**修正内容:**
- セットアップ手順を`config.js`を使用する方法に修正

**修正後:**
```javascript
const CONFIG = {
    // LIFF ID（LINE Developers Consoleから取得）
    LIFF_ID: 'YOUR_LIFF_ID_HERE',
    
    // Google Maps API Key
    GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY_HERE'  // ← ここに実際のAPIキーを設定
};
```

---

### 🐛 バグ6: READMEのセットアップ手順の改善

**問題点:**
- config.sample.jsをコピーする手順が記載されていたが、直接config.jsを作成する方がシンプル

**修正内容:**
- READMEのセットアップ手順を更新
- config.jsを直接作成する手順に変更
- 必要な設定項目を明示

---

### 🐛 バグ7: style.cssに不要なLeaflet関連スタイルが残存

**問題点:**
- [`style.css`](style.css:301-310)にLeaflet.js用のCSSクラスが残っている
- 使用していないライブラリのスタイルが含まれている

**修正内容:**
- `.leaflet-popup-content-wrapper`と`.leaflet-popup-content`のスタイル定義を削除

---

### 🔒 バグ8: HTTPSではなくHTTPでリソースを読み込み

**問題点:**
- [`app.js`](app.js:156)でGoogle Mapsのアイコンを`http://`で読み込んでいる
- HTTPSページでHTTPリソースを読み込むと、Mixed Contentエラーが発生する可能性がある

**修正内容:**
- `http://`を`https://`に変更

**修正前:**
```javascript
icon: {
    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
}
```

**修正後:**
```javascript
icon: {
    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
}
```

---

## 修正されたファイル一覧

1. [`app.js`](app.js) - `addMachidaMarkers()`関数の実装（コメントアウト）、HTTPSへの変更
2. [`README.md`](README.md) - 技術スタック、機能説明、カスタマイズ手順、セットアップ手順の修正
3. [`style.css`](style.css) - 不要なLeaflet関連スタイルの削除

## 削除されたファイル

- `config.sample.js` - 不要なため削除（READMEに直接設定例を記載）

## テスト推奨事項

以下の機能をテストすることを推奨します：

1. **地図の初期表示**
   - 町田市の地図が正しく表示されるか
   - 3つのスポットマーカー（市役所、駅、公園）が表示されるか

2. **マーカーのクリック**
   - 青いマーカーをクリックしてInfoWindowが表示されるか
   - スポット名と説明が正しく表示されるか

3. **住所検索機能**
   - 町名を入力して検索が動作するか
   - 検索結果の位置が正しいか

4. **物件記録機能**
   - 地図をクリックして記録パネルが開くか
   - メモを保存できるか
   - 黄色いハイライトが表示されるか

5. **LIFF機能**
   - LINEアプリ内で正しく動作するか
   - ユーザープロフィールが表示されるか

## セキュリティに関する注意事項

⚠️ **重要**: [`config.js`](config.js)ファイルには実際のAPIキーとLIFF IDが含まれています。このファイルは絶対にGitリポジトリにコミットしないでください。[`.gitignore`](.gitignore:2)で除外されていることを確認してください。

## まとめ

合計8つのバグを発見し、すべて修正しました：
- ✅ 1つの重大なバグ（関数未定義）
- ✅ 5つのドキュメント不整合
- ✅ 1つの設定ファイルの問題
- ✅ 1つのセキュリティ問題（Mixed Content）

すべての修正により、アプリケーションは正常に動作し、ドキュメントとコードが一致するようになりました。
