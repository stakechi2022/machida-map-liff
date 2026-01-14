# 町田市マップ LIFF アプリ

町田市の地図を表示するLINE Front-end Framework (LIFF)アプリケーションです。

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

## 🚀 セットアップ手順

### 1. LINE Developersでの設定

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

### 2. アプリケーションの設定

`app.js` ファイルの15行目を編集:

```javascript
const liffId = '2006643843-XXXXXXXX'; // ここに取得したLIFF IDを設定
```

実際のLIFF IDに置き換えてください。

### 3. デプロイ

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

### 4. LIFF URLの更新

デプロイ後、LINE Developers ConsoleのLIFF設定で、エンドポイントURLを実際のデプロイ先URLに更新してください。

### 5. テスト

1. LINE Developers ConsoleのLIFFタブで「LIFF URL」をコピー
2. LINEアプリでそのURLを開く、または友だちに送信して開く
3. 地図が表示されることを確認

## 📱 使い方

1. LIFFアプリを開くとLINEログインが求められます
2. ログイン後、町田市の地図が表示されます
3. マーカーをタップすると、スポット情報が表示されます
4. 地図はピンチイン/アウトで拡大縮小できます
5. LINEアプリ内で開いた場合、「閉じる」ボタンでアプリを終了できます

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
