# Google Spreadsheet 連携設定ガイド

Expense TrackerアプリとGoogle Spreadsheetを連携させる詳細な手順を説明します。

## 📋 概要

この設定により、Webアプリで入力した支出データが自動的にGoogleスプレッドシートに保存されるようになります。

- **自動転送**: 支出を追加すると即座にスプレッドシートに保存
- **手動同期**: 「同期」ボタンで全データを一括転送
- **データ永続化**: クラウド上でデータを安全に保管

---

## ステップ1: Google Spreadsheetの作成

### 1-1. 新規スプレッドシート作成

1. ブラウザで https://sheets.google.com にアクセス
2. **➕ 新規** をクリックして「空白のスプレッドシート」を作成
3. スプレッドシート名を「支出管理」などに変更

### 1-2. ヘッダー行を設定

1行目に以下のヘッダーを入力します：

| A列 | B列 | C列 | D列 | E列 |
|-----|-----|-----|-----|-----|
| ID | 日付 | カテゴリー | 金額 | メモ |

**入力例**:
- A1セルに `ID` と入力
- B1セルに `日付` と入力
- C1セルに `カテゴリー` と入力
- D1セルに `金額` と入力
- E1セルに `メモ` と入力

### 1-3. 列の幅を調整（任意）

見やすくするため、各列の幅を調整します：
- A列（ID）: 140px
- B列（日付）: 100px
- C列（カテゴリー）: 100px
- D列（金額）: 80px
- E列（メモ）: 200px

---

## ステップ2: Google Apps Script (GAS) の設定

### 2-1. Apps Script エディタを開く

1. スプレッドシートの上部メニューから **拡張機能** をクリック
2. **Apps Script** を選択
3. 新しいタブでApps Scriptエディタが開きます

### 2-2. スクリプトコードを貼り付け

デフォルトで表示されている `myFunction()` のコードを **すべて削除** し、以下のコードを貼り付けます：

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // ヘッダーが未設定の場合は設定
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['ID', '日付', 'カテゴリー', '金額', 'メモ']);
    }
    
    if (data.action === 'add') {
      // 新規追加：1件のデータを追加
      const expense = data.expense;
      sheet.appendRow([
        expense.id,
        expense.date,
        expense.category,
        expense.amount,
        expense.memo
      ]);
      
    } else if (data.action === 'sync_all') {
      // 一括同期：既存データをクリアして全データを再書き込み
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
      
      data.expenses.forEach(expense => {
        sheet.appendRow([
          expense.id,
          expense.date,
          expense.category,
          expense.amount,
          expense.memo
        ]);
      });
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 2-3. プロジェクト名を設定

1. エディタ上部の「無題のプロジェクト」をクリック
2. プロジェクト名を「Expense Tracker API」などに変更
3. Enter キーで保存

### 2-4. 保存

1. 💾 アイコン または `Ctrl+S` でコードを保存
2. 「プロジェクトを保存しました」と表示されればOK

---

## ステップ3: Web アプリとしてデプロイ

### 3-1. デプロイを開始

1. エディタ右上の **デプロイ** ボタンをクリック
2. **新しいデプロイ** を選択

### 3-2. デプロイ設定

1. **種類の選択** の横の⚙️（歯車アイコン）をクリック
2. **ウェブアプリ** を選択

3. 以下の設定を行います：

   **説明（任意）**:
   ```
   Expense Tracker データ同期API
   ```

   **次のユーザーとして実行**:
   - **自分（あなたのメールアドレス）** を選択

   **アクセスできるユーザー**:
   - **全員** を選択
   
   > ⚠️ 重要: 必ず「全員」を選択してください。これにより、GitHub Pagesからもアクセス可能になります。

4. **デプロイ** ボタンをクリック

### 3-3. 権限の承認

初回デプロイ時、権限の承認が必要です：

1. **アクセスを承認** をクリック
2. Googleアカウントを選択
3. 「このアプリは Google で確認されていません」と表示される場合：
   - **詳細** をクリック
   - **（プロジェクト名）に移動（安全ではないページ）** をクリック
4. **許可** をクリック

### 3-4. Web App URL をコピー

デプロイが完了すると、**ウェブアプリ** の URL が表示されます。

**例**:
```
https://script.google.com/macros/s/AKfycby...略.../exec
```

1. この URL の横にある **📋 コピー** アイコンをクリック
2. この URL を一時的にメモ帳などに保存しておきます

> 💡 ヒント: この URL は後で `app.js` に設定します

---

## ステップ4: app.js の編集

### 4-1. app.js を開く

1. VSCode または任意のテキストエディタで `app.js` を開きます
2. ファイルの先頭（1行目～）に以下のコードがあります：

```javascript
// ===========================
// Configuration
// ===========================
const CONFIG = {
    GAS_URL: '', // TODO: Google Apps Script Web App URLを設定してください
    STORAGE_KEY: 'expenses',
    CATEGORIES: ['食費', '交通費', '娯楽費', '光熱費', '医療費', 'その他'],
    // ... (以下省略)
};
```

### 4-2. GAS_URL を設定

`GAS_URL: '',` の部分を編集します。

**変更前**:
```javascript
GAS_URL: '', // TODO: Google Apps Script Web App URLを設定してください
```

**変更後**:
```javascript
GAS_URL: 'https://script.google.com/macros/s/AKfycby...略.../exec',
```

**重要なポイント**:
- ✅ URL全体を **シングルクォーテーション `'...'`** で囲む
- ✅ URL の最後に **カンマ `,`** を付ける
- ✅ コメント `// TODO:...` は削除してもOK

### 4-3. 保存

1. `Ctrl+S` でファイルを保存
2. エディタを閉じます

---

## ステップ5: 動作確認

### 5-1. ブラウザでアプリを開く

1. `index.html` をブラウザで開く
2. 開発者ツール（F12）を開いてコンソールを表示

### 5-2. テスト支出を追加

1. 支出記録フォームに以下を入力：
   - 日付: 今日
   - カテゴリー: 食費
   - 金額: 1000
   - メモ: テスト

2. **支出を追加** ボタンをクリック

### 5-3. コンソールで確認

開発者コンソールに以下のメッセージが表示されればOK：

```
✅ Spreadsheetに転送成功: {id: 1735315200000, date: "2025-12-28", ...}
```

### 5-4. スプレッドシートで確認

1. Google Spreadsheetのタブに戻る
2. 2行目にテストデータが追加されていることを確認

| ID | 日付 | カテゴリー | 金額 | メモ |
|----|------|-----------|------|------|
| 1735315200000 | 2025-12-28 | 食費 | 1000 | テスト |

---

## ステップ6: GitHubにプッシュ（更新）

`app.js` を編集したので、GitHubにも反映します。

```bash
cd "C:\Users\kosei\OneDrive - OUMail (The University of Osaka)\VEXUM\新人研修課題4"

git add app.js
git commit -m "Add: Google Spreadsheet URL設定"
git push
```

---

## 🔧 トラブルシューティング

### エラー: 「⚠️ Google Apps Script URLが設定されていません」

**原因**: `GAS_URL` が空文字列のまま

**対処法**:
1. `app.js` の `GAS_URL: ''` を確認
2. Apps ScriptのデプロイURLが正しく設定されているか確認
3. シングルクォーテーションで囲まれているか確認

### エラー: コンソールに「❌ 転送エラー」と表示

**原因1**: URLが間違っている
- Apps ScriptのデプロイURLを再確認

**原因2**: Apps Scriptの「アクセスできるユーザー」が「全員」になっていない
- Apps Scriptのデプロイ設定を「全員」に変更して再デプロイ

**原因3**: CORS エラー
- `mode: 'no-cors'` が設定されているか確認（既に設定済み）

### データがスプレッドシートに表示されない

**確認ポイント**:
1. ブラウザのコンソールでエラーが出ていないか
2. Apps Scriptの実行ログを確認
   - Apps Script エディタ → **実行数** タブ
3. スプレッドシートの最新データを表示（F5でリロード）

---

## 📚 補足情報

### Apps Script の実行ログを確認する方法

1. Apps Script エディタを開く
2. 左メニューの **実行数** をクリック
3. 最近の実行履歴とエラーログを確認できます

### デプロイURLを再確認する方法

1. Apps Script エディタを開く
2. 右上の **デプロイ** → **デプロイを管理** をクリック
3. 「ウェブアプリ」のURLを確認・コピー

### セキュリティについて

- Apps Scriptの「アクセスできるユーザー: 全員」は、URLを知っている人なら誰でもアクセス可能
- 機密情報を含むデータは保存しないことを推奨
- 必要に応じて認証機能を追加することも可能

---

## ✅ 完了！

これで、Expense Trackerアプリの支出データが自動的にGoogle Spreadsheetに保存されるようになりました！

**動作確認済みの機能**:
- ✅ 支出追加時の自動転送
- ✅ 「同期」ボタンでの一括同期
- ✅ LocalStorage とスプレッドシートの二重保存

何か問題が発生した場合は、トラブルシューティングを参照するか、開発者コンソールのエラーメッセージを確認してください。
