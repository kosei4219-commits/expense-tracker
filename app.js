// ===========================
// Configuration
// ===========================
const CONFIG = {
    GAS_URL: 'https://script.google.com/macros/s/AKfycbwl4p2T5p6vR2rd4Sxvdziy4fi3CsKWDxKiMRGlf0MJYEl4aekLp58xtBrweai_f-RJ/exec', // TODO: Google Apps Script Web App URLを設定してください
    STORAGE_KEY: 'expenses',
    CATEGORIES: ['食費', '交通費', '娯楽費', '光熱費', '医療費', 'その他'],
    CATEGORY_CONFIG: {
        '食費': { icon: '🍔', color: '#ff6b6b' },
        '交通費': { icon: '🚇', color: '#4ecdc4' },
        '娯楽費': { icon: '🎮', color: '#45b7d1' },
        '光熱費': { icon: '💡', color: '#f9ca24' },
        '医療費': { icon: '💊', color: '#a29bfe' },
        'その他': { icon: '📦', color: '#95afc0' }
    }
};

// ===========================
// DOM Elements
// ===========================
const elements = {
    form: document.getElementById('expense-form'),
    dateInput: document.getElementById('expense-date'),
    categoryInput: document.getElementById('expense-category'),
    amountInput: document.getElementById('expense-amount'),
    memoInput: document.getElementById('expense-memo'),
    expenseList: document.getElementById('expense-list'),
    totalAmount: document.getElementById('total-amount'),
    categoryStats: document.getElementById('category-stats'),
    syncButton: document.getElementById('sync-button')
};

// ===========================
// Data Management
// ===========================

/**
 * LocalStorageから支出データを読み込む
 */
function loadExpenses() {
    try {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (!stored) return [];

        const data = JSON.parse(stored);
        return data.expenses || [];
    } catch (error) {
        console.error('データ読み込みエラー:', error);
        return [];
    }
}

/**
 * LocalStorageに支出データを保存
 */
function saveExpenses(expenses) {
    try {
        const data = { expenses };
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('データ保存エラー:', error);
        alert('データの保存に失敗しました');
    }
}

/**
 * 新しい支出を追加
 */
function addExpense(expense) {
    const expenses = loadExpenses();
    expense.id = Date.now();
    expenses.push(expense);
    saveExpenses(expenses);

    // Google Spreadsheetに自動転送
    if (CONFIG.GAS_URL) {
        syncToSpreadsheet(expense);
    }

    return expense;
}

/**
 * 支出を削除
 */
function deleteExpense(id) {
    const expenses = loadExpenses();
    const filtered = expenses.filter(exp => exp.id !== id);
    saveExpenses(filtered);
}

// ===========================
// Google Spreadsheet Sync
// ===========================

/**
 * 新規支出をSpreadsheetに自動転送
 */
function syncToSpreadsheet(expense) {
    if (!CONFIG.GAS_URL) {
        console.warn('GAS URLが設定されていません');
        return;
    }

    fetch(CONFIG.GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'add',
            expense: expense
        })
    })
        .then(() => console.log('✅ Spreadsheetに転送成功:', expense))
        .catch(error => console.error('❌ 転送エラー:', error));
}

/**
 * 全データを一括同期
 */
function syncAllToSpreadsheet() {
    if (!CONFIG.GAS_URL) {
        alert('⚠️ Google Apps Script URLが設定されていません\n\napp.js の CONFIG.GAS_URL を設定してください');
        return;
    }

    const expenses = loadExpenses();

    if (expenses.length === 0) {
        alert('同期するデータがありません');
        return;
    }

    fetch(CONFIG.GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'sync_all',
            expenses: expenses
        })
    })
        .then(() => {
            alert(`✅ ${expenses.length}件のデータを同期しました`);
            console.log('同期完了:', expenses);
        })
        .catch(error => {
            alert('❌ 同期エラー: ' + error.message);
            console.error('同期エラー:', error);
        });
}

// ===========================
// Statistics Calculation
// ===========================

/**
 * カテゴリー別統計を計算
 */
function calculateStats(expenses) {
    const stats = {
        total: 0,
        categories: {}
    };

    // 全カテゴリーを初期化
    CONFIG.CATEGORIES.forEach(cat => {
        stats.categories[cat] = 0;
    });

    // 集計
    expenses.forEach(expense => {
        stats.total += expense.amount;
        if (stats.categories[expense.category] !== undefined) {
            stats.categories[expense.category] += expense.amount;
        }
    });

    return stats;
}

// ===========================
// UI Rendering
// ===========================

/**
 * 支出一覧を描画
 */
function renderExpenseList() {
    const expenses = loadExpenses();
    const sortedExpenses = expenses.sort((a, b) => b.id - a.id); // 新しい順

    if (sortedExpenses.length === 0) {
        elements.expenseList.innerHTML = `
            <div class="empty-state">
                <p>📝 まだ支出が記録されていません</p>
                <p class="empty-state-sub">上のフォームから支出を追加してください</p>
            </div>
        `;
        return;
    }

    elements.expenseList.innerHTML = sortedExpenses.map(expense => {
        const config = CONFIG.CATEGORY_CONFIG[expense.category] || CONFIG.CATEGORY_CONFIG['その他'];
        return `
            <div class="expense-item">
                <div class="expense-header">
                    <span class="expense-date">${formatDate(expense.date)}</span>
                    <span class="expense-category" style="background-color: ${config.color}33; color: ${config.color}">
                        ${config.icon} ${expense.category}
                    </span>
                </div>
                <div class="expense-body">
                    <span class="expense-memo">${expense.memo || '（メモなし）'}</span>
                    <div class="expense-amount-container">
                        <span class="expense-amount">¥${formatNumber(expense.amount)}</span>
                        <button class="btn-delete" onclick="handleDelete(${expense.id})">🗑️ 削除</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * カテゴリー別統計を描画
 */
function renderStats() {
    const expenses = loadExpenses();
    const stats = calculateStats(expenses);

    // 合計金額を更新
    elements.totalAmount.textContent = `¥${formatNumber(stats.total)}`;

    // カテゴリー別統計を描画
    elements.categoryStats.innerHTML = CONFIG.CATEGORIES.map(category => {
        const amount = stats.categories[category] || 0;
        const config = CONFIG.CATEGORY_CONFIG[category];

        if (amount === 0) return ''; // 金額が0の場合は表示しない

        return `
            <div class="category-item">
                <div class="category-icon" style="background-color: ${config.color}33">
                    ${config.icon}
                </div>
                <div class="category-info">
                    <div class="category-name">${category}</div>
                    <div class="category-amount" style="color: ${config.color}">
                        ¥${formatNumber(amount)}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // すべてのカテゴリーが0の場合
    if (stats.total === 0) {
        elements.categoryStats.innerHTML = `
            <div class="empty-state">
                <p>統計データがありません</p>
            </div>
        `;
    }
}

/**
 * 画面全体を更新
 */
function updateUI() {
    renderExpenseList();
    renderStats();
}

// ===========================
// Event Handlers
// ===========================

/**
 * フォーム送信処理
 */
function handleFormSubmit(e) {
    e.preventDefault();

    const expense = {
        date: elements.dateInput.value,
        category: elements.categoryInput.value,
        amount: parseInt(elements.amountInput.value, 10),
        memo: elements.memoInput.value.trim()
    };

    // バリデーション
    if (!expense.date || !expense.category || !expense.amount || expense.amount < 1) {
        alert('すべての必須項目を正しく入力してください');
        return;
    }

    // 支出を追加
    addExpense(expense);

    // フォームをリセット
    elements.form.reset();
    elements.dateInput.value = getTodayDate();

    // UI更新
    updateUI();

    // 成功メッセージ
    console.log('✅ 支出を追加しました:', expense);
}

/**
 * 削除ボタン処理
 */
function handleDelete(id) {
    if (confirm('この支出を削除しますか？')) {
        deleteExpense(id);
        updateUI();
        console.log('🗑️ 支出を削除しました: ID', id);
    }
}

/**
 * 同期ボタン処理
 */
function handleSync() {
    syncAllToSpreadsheet();
}

// ===========================
// Utility Functions
// ===========================

/**
 * 今日の日付を取得（YYYY-MM-DD形式）
 */
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 日付をフォーマット
 */
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];

    return `${year}年${month}月${day}日 (${weekday})`;
}

/**
 * 数値をカンマ区切りでフォーマット
 */
function formatNumber(num) {
    return num.toLocaleString('ja-JP');
}

// ===========================
// Initialization
// ===========================

/**
 * アプリケーション初期化
 */
function init() {
    console.log('💰 Expense Tracker を起動しました');

    // 今日の日付をデフォルト設定
    elements.dateInput.value = getTodayDate();

    // イベントリスナー登録
    elements.form.addEventListener('submit', handleFormSubmit);
    elements.syncButton.addEventListener('click', handleSync);

    // 初期表示
    updateUI();

    // GAS URL未設定の警告
    if (!CONFIG.GAS_URL) {
        console.warn('⚠️ Google Apps Script URLが設定されていません\n自動同期機能を使用するには、app.js の CONFIG.GAS_URL を設定してください');
    }
}

// ページ読み込み時に初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
