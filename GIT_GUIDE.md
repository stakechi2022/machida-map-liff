# .gitignore と Git Push ガイド

## 📋 目次
1. [.gitignoreとは？](#gitignoreとは)
2. [このプロジェクトの.gitignore](#このプロジェクトのgitignore)
3. [GitへPushする手順](#gitへpushする手順)
4. [重要な注意事項](#重要な注意事項)

---

## .gitignoreとは？

### 基本概念

**`.gitignore`** は、Gitリポジトリに**含めたくないファイル**を指定するための設定ファイルです。

### なぜ必要なのか？

以下のようなファイルはGitリポジトリに含めるべきではありません：

1. **機密情報を含むファイル**
   - APIキー、パスワード、トークンなど
   - 例: `config.js`（このプロジェクト）

2. **自動生成されるファイル**
   - ビルド成果物、ログファイルなど
   - 例: `node_modules/`, `dist/`, `*.log`

3. **個人設定ファイル**
   - エディタ設定、OS固有のファイルなど
   - 例: `.vscode/`, `.DS_Store`, `Thumbs.db`

### どのように動作するのか？

`.gitignore`に記載されたパターンに一致するファイルは：
- ✅ `git add`しても追加されない
- ✅ `git status`で表示されない
- ✅ `git commit`に含まれない
- ✅ GitHubなどにPushされない

---

## このプロジェクトの.gitignore

### 現在の設定内容

[`.gitignore`](.gitignore)ファイルの内容：

```gitignore
# 機密情報を含む設定ファイル
config.js

# エディタ設定
.vscode/
.idea/

# OS生成ファイル
.DS_Store
Thumbs.db

# ログファイル
*.log

# 一時ファイル
*.tmp
*.temp
```

### 各項目の説明

#### 1. 機密情報を含む設定ファイル
```gitignore
config.js
```
- **対象**: [`config.js`](config.js)
- **理由**: LIFF IDとGoogle Maps APIキーが含まれている
- **重要度**: 🔴 **最重要** - これが漏洩すると不正利用される可能性がある

#### 2. エディタ設定
```gitignore
.vscode/
.idea/
```
- **対象**: Visual Studio CodeやIntelliJ IDEAの設定フォルダ
- **理由**: 個人の開発環境設定は共有不要
- **重要度**: 🟡 中程度

#### 3. OS生成ファイル
```gitignore
.DS_Store    # macOS
Thumbs.db    # Windows
```
- **対象**: OSが自動生成するメタデータファイル
- **理由**: プロジェクトに不要で、他のOSユーザーには無意味
- **重要度**: 🟡 中程度

#### 4. ログファイル
```gitignore
*.log
```
- **対象**: すべての`.log`拡張子のファイル
- **理由**: 実行時に生成されるログは共有不要
- **重要度**: 🟢 低

#### 5. 一時ファイル
```gitignore
*.tmp
*.temp
```
- **対象**: 一時ファイル
- **理由**: 作業中の一時データは共有不要
- **重要度**: 🟢 低

---

## GitへPushする手順

### 前提条件の確認

Pushする前に、以下を必ず確認してください：

#### ✅ チェックリスト

1. **config.jsが.gitignoreに含まれているか？**
   ```bash
   # Windowsの場合
   type .gitignore | findstr config.js
   
   # Mac/Linuxの場合
   grep config.js .gitignore
   ```
   → `config.js`が表示されればOK

2. **config.jsがGit管理下にないか確認**
   ```bash
   git status
   ```
   → `config.js`が表示されなければOK
   → もし表示される場合は、以下を実行：
   ```bash
   git rm --cached config.js
   git commit -m "Remove config.js from Git tracking"
   ```

### 初回Push手順（新規リポジトリ）

#### ステップ1: Gitリポジトリの初期化

```bash
# リポジトリを初期化
git init

# 現在のブランチをmainに変更（推奨）
git branch -M main
```

#### ステップ2: ファイルをステージング

```bash
# すべてのファイルを追加（.gitignoreで除外されたファイルは自動的に除外される）
git add .

# 何が追加されるか確認
git status
```

**確認ポイント:**
- ✅ `config.js`が**表示されない**こと
- ✅ 以下のファイルが表示されること：
  - `.gitignore`
  - `index.html`
  - `app.js`
  - `style.css`
  - `README.md`
  - `DEBUG_REPORT.md`

#### ステップ3: コミット

```bash
git commit -m "Initial commit: 町田市献本マップLIFFアプリ"
```

#### ステップ4: リモートリポジトリの設定

GitHubでリポジトリを作成後：

```bash
# リモートリポジトリを追加（URLは自分のリポジトリに置き換える）
git remote add origin https://github.com/YOUR_USERNAME/machida-map-liff.git

# リモートリポジトリを確認
git remote -v
```

#### ステップ5: Push

```bash
# mainブランチにPush
git push -u origin main
```

### 2回目以降のPush手順

変更を加えた後：

```bash
# 変更されたファイルを確認
git status

# 変更をステージング
git add .

# コミット（変更内容を説明するメッセージを記載）
git commit -m "機能追加: 住所検索機能の改善"

# Push
git push
```

---

## 重要な注意事項

### 🔴 絶対にやってはいけないこと

#### 1. config.jsをGitに含めない

**NG例:**
```bash
# これをやってはいけない！
git add config.js
git commit -m "Add config"
git push
```

**理由:**
- APIキーとLIFF IDが公開される
- 不正利用される可能性がある
- 一度Pushすると履歴に残る（削除しても復元可能）

#### 2. .gitignoreを削除しない

`.gitignore`ファイルは必ずリポジトリに含めてください。

#### 3. 既にPushしてしまった場合の対処

もし誤って`config.js`をPushしてしまった場合：

1. **すぐにAPIキーを無効化する**
   - Google Cloud ConsoleでAPIキーを削除
   - LINE DevelopersでLIFF IDを再生成

2. **Gitの履歴から削除する**（高度な操作）
   ```bash
   # 履歴から完全に削除（注意: 強制的な操作）
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch config.js" \
     --prune-empty --tag-name-filter cat -- --all
   
   # 強制Push
   git push origin --force --all
   ```

3. **新しいAPIキーとLIFF IDを設定**

### 🟢 推奨される運用方法

#### チーム開発の場合

1. **READMEに設定手順を記載**（既に記載済み）
   - 各メンバーが自分で`config.js`を作成
   - 設定例をREADMEに記載

2. **環境変数の使用を検討**（将来的な改善）
   ```javascript
   // 環境変数から読み込む例
   const CONFIG = {
       LIFF_ID: process.env.LIFF_ID,
       GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY
   };
   ```

3. **デプロイ時の注意**
   - GitHub Pagesなどにデプロイする際は、`config.js`を手動でアップロード
   - または、デプロイ先の環境変数機能を使用

#### 個人開発の場合

1. **ローカルにconfig.jsを保持**
   - バックアップを別の安全な場所に保存
   - パスワードマネージャーに保存するのも良い

2. **定期的に.gitignoreを確認**
   ```bash
   git status
   ```
   で`config.js`が表示されないことを確認

---

## 実践例：完全なPushフロー

### シナリオ: 新しい機能を追加してPushする

```bash
# 1. 現在の状態を確認
git status

# 2. config.jsが含まれていないことを確認
# （表示されなければOK）

# 3. 変更をステージング
git add .

# 4. 再度確認（config.jsが含まれていないこと）
git status

# 5. コミット
git commit -m "機能追加: 物件記録機能の改善"

# 6. Push
git push

# 7. GitHubで確認
# ブラウザでリポジトリを開き、config.jsが含まれていないことを確認
```

---

## トラブルシューティング

### Q1: config.jsが誤ってステージングされた

**解決方法:**
```bash
# ステージングから削除
git reset HEAD config.js

# 確認
git status
```

### Q2: .gitignoreを追加したのにconfig.jsが表示される

**原因:** 既にGit管理下にある場合、.gitignoreは効かない

**解決方法:**
```bash
# Git管理から削除（ファイル自体は削除されない）
git rm --cached config.js

# コミット
git commit -m "Remove config.js from Git tracking"
```

### Q3: どのファイルがPushされるか事前に確認したい

**解決方法:**
```bash
# ステージングされたファイルを確認
git diff --cached --name-only

# または
git status
```

---

## まとめ

### 重要ポイント

1. ✅ **`.gitignore`は機密情報を守る重要なファイル**
2. ✅ **`config.js`は絶対にGitに含めない**
3. ✅ **Pushする前に必ず`git status`で確認**
4. ✅ **誤ってPushした場合は、すぐにAPIキーを無効化**

### 安全なワークフロー

```
コード変更
    ↓
git status で確認
    ↓
config.jsが含まれていないことを確認
    ↓
git add .
    ↓
再度 git status で確認
    ↓
git commit
    ↓
git push
    ↓
GitHubで最終確認
```

このガイドに従えば、機密情報を安全に保ちながら、コードをGitで管理できます。
