# GitHub へのプッシュ手順ガイド

## 前提条件

### 必要なもの
- GitHubアカウント
- Gitがインストールされていること
- GitHubへの認証設定（SSH or Personal Access Token）

### Git のインストール確認
```bash
git --version
```

## 手順1: GitHubリポジトリの作成

### ブラウザでGitHubにアクセス
1. https://github.com にアクセス
2. 右上の `+` → `New repository` をクリック

### リポジトリ設定
- **Repository name**: `expense-tracker` （任意の名前）
- **Description**: `日々の支出を記録・管理するWebアプリケーション`
- **Public / Private**: お好みで選択
- **Initialize this repository with**: 
  - ✅ Add a README file （チェック推奨）
  - ✅ Add .gitignore: None （後で手動作成）
  - ❌ Choose a license: None （必要に応じて）

### リポジトリ作成後
- リポジトリのURLをコピー
  - HTTPS: `https://github.com/username/expense-tracker.git`
  - SSH: `git@github.com:username/expense-tracker.git`

## 手順2: ローカルでGitリポジトリを初期化

### プロジェクトディレクトリに移動
```bash
cd "C:\Users\kosei\OneDrive - OUMail (The University of Osaka)\VEXUM\新人研修課題4"
```

### Gitリポジトリを初期化
```bash
git init
```

### .gitignore ファイルを作成
```bash
# 以下の内容で .gitignore を作成
# Node modules
node_modules/

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Environment variables
.env
.env.local

# Logs
*.log

# Build outputs
dist/
build/

# Temporary files
*.tmp
```

### リモートリポジトリを追加
```bash
# HTTPS の場合
git remote add origin https://github.com/username/expense-tracker.git

# SSH の場合
git remote add origin git@github.com:username/expense-tracker.git
```

## 手順3: ファイルをステージング・コミット

### 現在のファイル状態を確認
```bash
git status
```

### すべてのファイルをステージング
```bash
git add .
```

### または、個別にファイルを追加
```bash
git add index.html
git add style.css
git add app.js
git add 仕様書.md
```

### コミット
```bash
git commit -m "Initial commit: Expense Tracker アプリの初期バージョン"
```

## 手順4: GitHubにプッシュ

### メインブランチの確認・変更
```bash
# 現在のブランチ名を確認
git branch

# main ブランチに変更（GitHubのデフォルトに合わせる）
git branch -M main
```

### リモートリポジトリにプッシュ
```bash
git push -u origin main
```

### 初回プッシュ時の認証

#### HTTPS の場合
- ユーザー名: GitHubのユーザー名
- パスワード: **Personal Access Token**（通常のパスワードは使用不可）

**Personal Access Tokenの作成方法**:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. Scopes: `repo` にチェック
4. Generate token
5. 表示されたトークンをコピー（再表示不可なので注意）
6. Gitのパスワード入力時にこのトークンを使用

#### SSH の場合
- SSH鍵の設定が必要
- 参考: https://docs.github.com/ja/authentication/connecting-to-github-with-ssh

## 手順5: プッシュ成功の確認

### GitHubで確認
1. https://github.com/username/expense-tracker にアクセス
2. ファイルが正しくアップロードされているか確認

### ブラウザでの確認
```
コミット履歴
ファイル一覧
README.md の表示
```

## 手順6: GitHub Pages でホスティング（オプション）

### GitHub Pages の有効化
1. リポジトリの `Settings` タブをクリック
2. 左メニューから `Pages` を選択
3. **Source** セクション:
   - Branch: `main`
   - Folder: `/ (root)`
4. `Save` をクリック

### 数分待ってからアクセス
```
https://username.github.io/expense-tracker/
```

## 今後の更新手順

### ファイルを変更した後
```bash
# 変更を確認
git status

# 変更をステージング
git add .

# コミット
git commit -m "機能追加: カテゴリー別グラフ表示"

# プッシュ
git push
```

### 変更履歴を確認
```bash
git log --oneline
```

## トラブルシューティング

### エラー: `fatal: remote origin already exists`
```bash
# リモートを削除してから再追加
git remote remove origin
git remote add origin https://github.com/username/expense-tracker.git
```

### エラー: `failed to push some refs`
```bash
# リモートの変更を先に取得
git pull origin main --rebase
git push -u origin main
```

### 認証エラー
```bash
# 認証情報をクリア
git credential reject
# 再度プッシュすると認証を求められる
git push
```

## 推奨ワークフロー

### 1. 開発開始前
```bash
# 最新の状態を取得
git pull
```

### 2. 開発中
```bash
# こまめにコミット
git add .
git commit -m "詳細な変更内容"
```

### 3. 開発完了後
```bash
# プッシュ
git push
```

## 参考リンク

- [GitHub Docs](https://docs.github.com/ja)
- [Git 公式ドキュメント](https://git-scm.com/doc)
- [GitHub Pages](https://pages.github.com/)
