# 町田市マップ LIFF アプリ

町田市の地図を表示するLINE Front-end Framework (LIFF)アプリケーションです。

**🆕 Google Maps版にアップグレード！住所単位での物件管理に対応しました。**

## 📋 機能

- 🗺️ 町田市の地図表示（Leaflet.js使用）
- 📍 主要スポットのマーカー表示
  - 町田駅
  - 町田市役所
  - 薬師池公園
  - 町田リス園
  - 町田天満宮
- 👤 LINEユーザープロフィール表示
- 📱 レスポンシブデザイン

### 🆕 新機能（物件記録システム）

- 🔍 **住所検索機能**
  - 町名、丁目、番地、号を入力して住所を検索
  - 東京都町田市の住所に対応
  - 番地や号が未入力でも大まかな位置を表示
  - Google Maps Geocoding APIで高精度な検索
  
- 📝 **物件記録機能（住所ベース）**
  - 地図上をクリックして物件を選択
  - **逆ジオコーディングで自動的に住所を取得**
  - **住所単位で物件を管理**（緯度経度ではなく住所がキー）
  - メモを記録して保存
  - 記録された物件は黄色くハイライト表示
  
- 💾 **記録管理**
  - 記録の編集・削除が可能
  - タイムスタンプで記録日時を保存
  - ローカルストレージに自動保存
  - 同じ住所の記録は統合管理
  
- ⏰ **自動期限管理**
  - 記録日から1ヶ月経過すると自動的にハイライトが消える
  - データは保持されるため、再編集で再表示可能

### 🎯 主な改善点

- **Google Maps採用**: より詳細で正確な地図表示
- **住所ベース管理**: 緯度経度ではなく住所単位で物件を識別
- **逆ジオコーディング**: クリック位置から自動的に住所を取得
- **高精度検索**: Google Maps APIによる正確な住所検索

## 🚀 セットアップ手順

### 1. Google Maps APIキーの取得

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. 「APIとサービス」→「ライブラリ」に移動
4. 以下のAPIを有効化:
   - **Maps JavaScript API**
   - **Geocoding API**
   - **Places API**
5. 「APIとサービス」→「認証情報」に移動
6. 「認証情報を作成」→「APIキー」を選択
7. 作成されたAPIキーをコピー
8. （推奨）APIキーの制限を設定:
   - アプリケーションの制限: HTTPリファラー
   - APIの制限: Maps JavaScript API, Geocoding API, Places API

### 2. LINE Developersでの設定

1. [LINE Developers Console](https://developers.line.biz/console/)にアクセス
2. プロバイダーを作成（既存のものを使用してもOK）
3. 新しいチャネルを作成
   - チャネルタイプ: **LINE Login**
   - チャネル名: 任意（例: 町田市マップ）
4. チャネル基本設定で以下を確認:
   - チャネルID
   - チャネルシークレット
5. LIFF タブに移動
6. 「追加」ボタンをクリック
7. LIFF アプリ情報を入力:
   - **LIFFアプリ名**: 町田市マップ
   - **サイズ**: Full
   - **エンドポイントURL**: デプロイ先のURL（例: https://yourdomain.com/machida-map-liff/）
   - **Scope**: profile, openid
   - **ボットリンク機能**: オプション（必要に応じて）
8. 作成後、**LIFF ID**をコピー

### 3. アプリケーションの設定

#### Google Maps APIキーの設定

`index.html` ファイルの最後の方にあるGoogle Maps APIの読み込み部分を編集:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places&language=ja&callback=initMap" async defer></script>
```

`YOUR_GOOGLE_MAPS_API_KEY` を取得したAPIキーに置き換えてください。

#### LIFF IDの設定

`app.js` ファイルの32行目を編集:

```javascript
const liffId = '2008888917-5LvLxAk1'; // ここに取得したLIFF IDを設定
```

実際のLIFF IDに置き換えてください。

### 4. デプロイ

以下のファイルをWebサーバーにアップロード:
- `index.html`
- `style.css`
- `app.js`

#### デプロイ先の例:
- **GitHub Pages**: 無料、簡単
- **Netlify**: 無料、自動デプロイ
- **Vercel**: 無料、高速
- **Firebase Hosting**: 無料枠あり

#### GitHub Pagesの場合:
```bash
# リポジトリを作成してプッシュ
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/machida-map-liff.git
git push -u origin main

# Settings > Pages でブランチを選択してデプロイ
```

### 5. LIFF URLの更新

デプロイ後、LINE Developers ConsoleのLIFF設定で、エンドポイントURLを実際のデプロイ先URLに更新してください。

### 6. テスト

1. LINE Developers ConsoleのLIFFタブで「LIFF URL」をコピー
2. LINEアプリでそのURLを開く、または友だちに送信して開く
3. 地図が表示されることを確認

## 📱 使い方

### 基本操作

1. LIFFアプリを開くとLINEログインが求められます
2. ログイン後、町田市の地図が表示されます
3. マーカーをタップすると、スポット情報が表示されます
4. 地図はピンチイン/アウトで拡大縮小できます
5. LINEアプリ内で開いた場合、「閉じる」ボタンでアプリを終了できます

### 住所検索

1. 画面上部の検索フォームに住所情報を入力
   - 町名: 必須（例: 原町田）
   - 丁目: 任意（例: 1）
   - 番地: 任意（例: 2）
   - 号: 任意（例: 3）
2. 「🔍 検索」ボタンをクリック
3. 該当する位置に地図が移動し、マーカーが表示されます
4. マーカーのポップアップから「📝 記録を追加」をクリックして記録できます

### 物件記録

1. **地図から直接記録**
   - 地図上の任意の場所をクリック
   - 記録パネルが表示されます
   - メモを入力して「💾 記録を保存」をクリック

2. **検索から記録**
   - 住所検索で物件を見つける
   - マーカーのポップアップから「📝 記録を追加」をクリック
   - メモを入力して保存

3. **記録の編集**
   - 黄色くハイライトされた物件をクリック
   - ポップアップの「✏️ 編集」ボタンをクリック
   - メモを編集して保存

4. **記録の削除**
   - 記録済み物件を編集モードで開く
   - 「🗑️ 記録を削除」ボタンをクリック
   - 確認ダイアログで「OK」を選択

### ハイライト表示

- 記録された物件は黄色い円でハイライト表示されます
- 記録日から1ヶ月経過すると自動的にハイライトが消えます
- データは保持されるため、編集することで再度ハイライト表示できます

## 🛠️ 技術スタック

- **LIFF SDK 2.x**: LINE Front-end Framework
- **Leaflet.js 1.9.4**: オープンソース地図ライブラリ
- **OpenStreetMap**: 地図タイルデータ
- **HTML5/CSS3/JavaScript**: フロントエンド

## 📂 ファイル構成

```
machida-map-liff/
├── index.html      # メインHTMLファイル
├── style.css       # スタイルシート
├── app.js          # JavaScriptロジック（LIFF初期化、地図表示）
└── README.md       # このファイル
```

## 🔧 カスタマイズ

### マーカーの追加

`app.js` の `addMachidaMarkers()` 関数内の `spots` 配列に新しいスポットを追加:

```javascript
{
    name: 'スポット名',
    lat: 緯度,
    lng: 経度,
    description: '説明文'
}
```

### 地図の初期表示位置・ズームレベル変更

`app.js` の `MACHIDA_CENTER` 定数と `initializeMap()` 関数内のズームレベル（13）を変更:

```javascript
const MACHIDA_CENTER = {
    lat: 35.5437,  // 緯度
    lng: 139.4467  // 経度
};

// ズームレベル: 1-19（数字が大きいほど拡大）
map = L.map('map').setView([MACHIDA_CENTER.lat, MACHIDA_CENTER.lng], 13);
```

### デザインのカスタマイズ

`style.css` を編集してカラーやレイアウトを変更できます。

## ⚠️ 注意事項

- LIFF IDは必ず設定してください（設定しないとエラーになります）
- HTTPSでのホスティングが必須です
- LIFFアプリはLINEアプリ内またはLINEブラウザで開く必要があります
- 外部ブラウザで直接開くとLIFF機能が制限される場合があります

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🤝 貢献

バグ報告や機能追加の提案は、Issueまたはプルリクエストでお願いします。

## 📞 サポート

問題が発生した場合は、以下を確認してください:
1. LIFF IDが正しく設定されているか
2. HTTPSでホスティングされているか
3. LINE Developers Consoleの設定が正しいか
4. ブラウザのコンソールにエラーメッセージが表示されていないか
