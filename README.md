# Expense Tracker - 支出管理アプリ

日々の支出を記録・管理するWebアプリケーション

## 🌟 特徴

- **支出記録**: 日付、カテゴリー、金額、メモを記録
- **カテゴリー別集計**: 6つのカテゴリーで支出を分類・集計
- **データ永続化**: LocalStorageでデータを保存
- **Google Spreadsheet連携**: 自動同期機能（オプション）
- **モダンなUI**: グラスモーフィズムとダークテーマ
- **レスポンシブ**: モバイル・タブレット・デスクトップ対応

## 📦 カテゴリー

- 🍔 食費
- 🚇 交通費
- 🎮 娯楽費
- 💡 光熱費
- 💊 医療費
- 📦 その他

## 🚀 使い方

### ローカルで実行

1. このリポジトリをクローンまたはダウンロード
2. `index.html` をブラウザで開く

```bash
# クローン
git clone https://github.com/kosei4219-commits/expense-tracker.git
cd expense-tracker

# ブラウザで開く
start index.html  # Windows
open index.html   # macOS
```

### GitHub Pages でホスティング

このアプリは GitHub Pages でホスティングされています：

**URL**: https://kosei4219-commits.github.io/expense-tracker/

## ⚙️ Google Spreadsheet連携の設定（オプション）

### 1. Google Spreadsheet を作成

1. Google Spreadsheetで新規シートを作成
2. 以下のヘッダーを1行目に設定：
   - A1: `ID`
   - B1: `日付`
   - C1: `カテゴリー`
   - D1: `金額`
   - E1: `メモ`

### 2. Google Apps Script を設定

1. Spreadsheetで「拡張機能」→「Apps Script」を開く
2. 以下のコードを貼り付け：

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
      // 新規追加
      const expense = data.expense;
      sheet.appendRow([
        expense.id,
        expense.date,
        expense.category,
        expense.amount,
        expense.memo
      ]);
      
    } else if (data.action === 'sync_all') {
      // 一括同期
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

3. 「デプロイ」→「新しいデプロイ」
4. 種類: **ウェブアプリ**
5. 実行ユーザー: **自分**
6. アクセスできるユーザー: **全員**
7. デプロイ後、**Web App URL** をコピー

### 3. アプリに URL を設定

`app.js` の1行目を編集：

```javascript
const CONFIG = {
    GAS_URL: 'YOUR_WEB_APP_URL_HERE', // ← ここにコピーしたURLを貼り付け
    // ...
};
```

## 📁 プロジェクト構成

```
expense-tracker/
├── index.html          # メインHTMLファイル
├── style.css           # スタイルシート
├── app.js              # JavaScriptロジック
├── 仕様書.md           # 詳細な仕様書
├── GitHub-Push-Guide.md # GitHubプッシュガイド
├── README.md           # このファイル
└── prompts.txt         # 開発ログ
```

## 🛠️ 使用技術

- **HTML5**: セマンティックHTML
- **CSS3**: CSS Variables、Flexbox、Grid、Animations
- **JavaScript (ES6+)**: Vanilla JavaScript
- **LocalStorage API**: データ永続化
- **Fetch API**: Google Spreadsheet連携
- **Google Apps Script**: バックエンド連携

## 📱 対応ブラウザ

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 ライセンス

MIT License

## 👤 作者

kosei4219-commits

## 🤝 貢献

プルリクエストを歓迎します！

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📞 サポート

問題が発生した場合は、[Issues](https://github.com/kosei4219-commits/expense-tracker/issues) で報告してください。
