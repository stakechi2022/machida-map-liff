# 町田市マップアプリ デプロイガイド

このガイドでは、開発者がGitHubにプッシュしたソースコードを、エンドユーザーが実際に使用できるようにデプロイする手順を説明します。

## 📋 前提条件

- Google Maps APIキー（取得方法は後述）
- LIFF ID（LINE Developersで取得）
- Webホスティングサービス（GitHub Pages、Netlify、Vercelなど）

---

## 🚀 デプロイ手順

### ステップ1: Google Maps APIキーの取得

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成
3. 「APIとサービス」→「ライブラリ」で以下を有効化:
   - Maps JavaScript API
   - Geocoding API
   - Places API
4. 「認証情報」→「認証情報を作成」→「APIキー」
5. APIキーをコピーして保存
6. （推奨）APIキーの制限を設定:
   - HTTPリファラー制限を追加
   - 使用するAPIのみに制限

### ステップ2: LIFF IDの取得

1. [LINE Developers Console](https://developers.line.biz/console/)にアクセス
2. プロバイダーとチャネル（LINE Login）を作成
3. LIFFタブで新しいLIFFアプリを追加:
   - サイズ: Full
   - エンドポイントURL: デプロイ先のURL
   - Scope: profile, openid
4. LIFF IDをコピー

### ステップ3: ソースコードの準備

#### 方法A: GitHubからクローン（推奨）

```bash
# リポジトリをクローン
git clone https://github.com/stakechi2022/machida-map-liff.git
cd machida-map-liff
```

#### 方法B: ZIPダウンロード

1. GitHubリポジトリページで「Code」→「Download ZIP」
2. ZIPを解凍

### ステップ4: 設定ファイルの作成

プロジェクトルートに `config.js` ファイルを作成:

```javascript
// config.js
const CONFIG = {
    // Google Maps APIキー
    GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY',
    
    // LIFF ID
    LIFF_ID: 'YOUR_LIFF_ID'
};
```

**重要**: `YOUR_GOOGLE_MAPS_API_KEY` と `YOUR_LIFF_ID` を実際の値に置き換えてください。

### ステップ5: HTMLファイルの更新

`index.html` の最後の方にあるGoogle Maps APIの読み込み部分を更新:

**変更前:**
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places&language=ja&callback=initMap" async defer></script>
```

**変更後（config.jsを使用する場合）:**
```html
<!-- Config JS -->
<script src="config.js"></script>
<!-- Google Maps API -->
<script>
    document.write('<script src="https://maps.googleapis.com/maps/api/js?key=' + CONFIG.GOOGLE_MAPS_API_KEY + '&libraries=places&language=ja&callback=initMap" async defer><\/script>');
</script>
```

または、直接APIキーを埋め込む場合:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&libraries=places&language=ja&callback=initMap" async defer></script>
```

### ステップ6: JavaScriptファイルの更新

`app.js` の32行目付近のLIFF ID設定を更新:

**変更前:**
```javascript
const liffId = '2008888917-5LvLxAk1'; // ここに実際のLIFF IDを設定してください
```

**変更後（config.jsを使用する場合）:**
```javascript
const liffId = CONFIG.LIFF_ID;
```

または、直接LIFF IDを埋め込む場合:
```javascript
const liffId = '1234567890-AbCdEfGh';
```

### ステップ7: デプロイ

#### オプションA: GitHub Pages（無料・簡単）

1. GitHubリポジトリの「Settings」→「Pages」
2. Source: main ブランチを選択
3. 「Save」をクリック
4. 数分後、URLが表示されます（例: https://username.github.io/machida-map-liff/）

**注意**: config.jsは.gitignoreで除外されているため、GitHub Pagesでは使用できません。HTMLとJSファイルに直接APIキーとLIFF IDを埋め込む必要があります。

#### オプションB: Netlify（無料・自動デプロイ）

1. [Netlify](https://www.netlify.com/)にサインアップ
2. 「New site from Git」をクリック
3. GitHubリポジトリを選択
4. デプロイ設定:
   - Build command: （空欄）
   - Publish directory: （空欄またはルート）
5. 環境変数を設定（オプション）
6. 「Deploy site」をクリック

#### オプションC: Vercel（無料・高速）

1. [Vercel](https://vercel.com/)にサインアップ
2. 「New Project」をクリック
3. GitHubリポジトリをインポート
4. 「Deploy」をクリック

#### オプションD: 独自サーバー

FTPやSCPで以下のファイルをアップロード:
- index.html
- app.js
- style.css
- config.js（設定済み）
- README.md（オプション）

### ステップ8: LIFF設定の更新

1. LINE Developers Consoleに戻る
2. LIFFアプリの設定を開く
3. エンドポイントURLを実際のデプロイ先URLに更新
4. 保存

### ステップ9: テスト

1. LINE Developers ConsoleでLIFF URLをコピー
2. LINEアプリでURLを開く
3. 地図が表示され、すべての機能が動作することを確認:
   - 地図表示
   - 住所検索
   - 物件選択とメモ記録
   - 黄色ハイライト表示

---

## 🔒 セキュリティのベストプラクティス

### 本番環境での推奨設定

1. **APIキーの制限**
   - HTTPリファラー制限を設定
   - 使用するAPIのみに制限
   - 定期的にキーをローテーション

2. **config.jsの取り扱い**
   - 本番環境では環境変数を使用
   - または、ビルドプロセスで埋め込み
   - 絶対にGitにコミットしない

3. **HTTPS必須**
   - LIFFアプリはHTTPSが必須
   - すべてのホスティングサービスでHTTPSを有効化

---

## 📁 デプロイに必要なファイル

```
machida-map-liff/
├── index.html          # メインHTML（必須）
├── app.js             # JavaScriptロジック（必須）
├── style.css          # スタイルシート（必須）
├── config.js          # 設定ファイル（作成が必要、Gitには含まれない）
├── README.md          # ドキュメント（オプション）
├── .gitignore         # Git除外設定（開発時のみ）
└── その他のドキュメント（オプション）
```

---

## ⚠️ よくある問題と解決方法

### 地図が表示されない

**原因**: Google Maps APIキーが正しく設定されていない

**解決方法**:
1. ブラウザの開発者ツール（F12）でコンソールを確認
2. APIキーエラーがある場合、config.jsまたはindex.htmlを確認
3. Google Cloud ConsoleでAPIが有効化されているか確認

### 「LIFF初期化エラー」が表示される

**原因**: LIFF IDが正しくない、またはエンドポイントURLが一致しない

**解決方法**:
1. app.jsのLIFF IDを確認
2. LINE Developers ConsoleでエンドポイントURLを確認
3. URLが完全一致しているか確認（末尾のスラッシュに注意）

### 住所検索が動作しない

**原因**: Geocoding APIが有効化されていない

**解決方法**:
1. Google Cloud ConsoleでGeocoding APIを有効化
2. APIキーの制限でGeocoding APIが許可されているか確認

### 記録が保存されない

**原因**: ブラウザのローカルストレージが無効

**解決方法**:
1. ブラウザの設定でCookieとサイトデータを許可
2. プライベートモードでは動作しない場合があります

---

## 💡 開発者向けメモ

### 環境変数を使用する場合（Netlify/Vercel）

**netlify.toml** または **vercel.json** で環境変数を設定:

```toml
# netlify.toml
[build.environment]
  GOOGLE_MAPS_API_KEY = "your-api-key"
  LIFF_ID = "your-liff-id"
```

ビルドスクリプトで環境変数をファイルに埋め込む処理を追加できます。

### 継続的デプロイ（CI/CD）

GitHubにプッシュすると自動的にデプロイされるように設定できます:
- Netlify: 自動的に設定される
- Vercel: 自動的に設定される
- GitHub Pages: GitHub Actionsで設定可能

---

## 📞 サポート

問題が発生した場合:
1. [`DEBUG_REPORT.md`](DEBUG_REPORT.md)を参照
2. [`GIT_GUIDE.md`](GIT_GUIDE.md)を参照（開発者向け）
3. ブラウザの開発者ツールでエラーを確認
4. GitHubのIssuesで質問

---

## 📝 更新履歴

- 2026-01-16: 初版作成（Google Maps対応版）
