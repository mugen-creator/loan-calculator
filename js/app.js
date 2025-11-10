/**
 * アプリケーションメインロジック
 */

// グローバル変数
let chartHandler;
let currentSchedule = [];
let currentCalculator = null;

// DOM要素
const elements = {
    // 入力
    principal: document.getElementById('principal'),
    principalValue: document.getElementById('principalValue'),
    rate: document.getElementById('rate'),
    rateValue: document.getElementById('rateValue'),
    months: document.getElementById('months'),
    monthsValue: document.getElementById('monthsValue'),
    monthlyPayment: document.getElementById('monthlyPayment'),
    monthlyPaymentValue: document.getElementById('monthlyPaymentValue'),
    minPayment: document.getElementById('minPayment'),
    paymentType: document.getElementsByName('paymentType'),
    calculateBtn: document.getElementById('calculateBtn'),

    // タブ
    tabButtons: document.querySelectorAll('.tab-button'),
    periodTab: document.getElementById('periodTab'),
    amountTab: document.getElementById('amountTab'),

    // 結果
    resultSection: document.getElementById('resultSection'),
    monthlyPaymentResult: document.getElementById('monthlyPaymentResult'),
    paymentNote: document.getElementById('paymentNote'),
    periodResult: document.getElementById('periodResult'),
    totalResult: document.getElementById('totalResult'),
    totalNote: document.getElementById('totalNote'),
    interestResult: document.getElementById('interestResult'),
    interestNote: document.getElementById('interestNote'),
    scheduleTableBody: document.getElementById('scheduleTableBody'),
    showAllBtn: document.getElementById('showAllBtn'),

    // グラフ
    chartTabs: document.querySelectorAll('.chart-tab')
};

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Chart.jsハンドラー初期化
    chartHandler = new ChartHandler('chartCanvas');

    // イベントリスナー設定
    setupEventListeners();

    // 初期値設定
    updateInputValues();
    updateMinPayment();
}

function setupEventListeners() {
    // スライダー入力
    elements.principal.addEventListener('input', (e) => {
        elements.principalValue.textContent = formatNumber(e.target.value) + '円';
        updateMinPayment();
    });

    elements.rate.addEventListener('input', (e) => {
        elements.rateValue.textContent = parseFloat(e.target.value).toFixed(1) + '%';
        updateMinPayment();
    });

    elements.months.addEventListener('input', (e) => {
        elements.monthsValue.textContent = e.target.value + 'ヶ月';
    });

    elements.monthlyPayment.addEventListener('input', (e) => {
        elements.monthlyPaymentValue.textContent = formatNumber(e.target.value) + '円';
    });

    // タブ切り替え
    elements.tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchTab(tab);
        });
    });

    // 計算ボタン
    elements.calculateBtn.addEventListener('click', calculate);

    // グラフタブ
    elements.chartTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const chartType = e.target.dataset.chart;
            switchChartTab(chartType);
        });
    });

    // すべて表示ボタン
    elements.showAllBtn.addEventListener('click', () => {
        showFullSchedule();
    });
}

function updateInputValues() {
    elements.principalValue.textContent = formatNumber(elements.principal.value) + '円';
    elements.rateValue.textContent = parseFloat(elements.rate.value).toFixed(1) + '%';
    elements.monthsValue.textContent = elements.months.value + 'ヶ月';
    elements.monthlyPaymentValue.textContent = formatNumber(elements.monthlyPayment.value) + '円';
}

function updateMinPayment() {
    const principal = parseInt(elements.principal.value);
    const rate = parseFloat(elements.rate.value);
    const tempCalc = new LoanCalculator(principal, rate, 120, 'equal');
    const minPayment = tempCalc.calculateMinPayment();

    elements.minPayment.textContent = formatNumber(minPayment) + '円';
    elements.monthlyPayment.min = minPayment;

    // 現在の値が最低返済額より小さい場合、調整
    if (parseInt(elements.monthlyPayment.value) < minPayment) {
        elements.monthlyPayment.value = minPayment;
        elements.monthlyPaymentValue.textContent = formatNumber(minPayment) + '円';
    }
}

function switchTab(tab) {
    elements.tabButtons.forEach(btn => {
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    if (tab === 'period') {
        elements.periodTab.classList.add('active');
        elements.amountTab.classList.remove('active');
    } else {
        elements.periodTab.classList.remove('active');
        elements.amountTab.classList.add('active');
    }
}

function getSelectedPaymentType() {
    for (const radio of elements.paymentType) {
        if (radio.checked) {
            return radio.value;
        }
    }
    return 'equal';
}

function getActiveTab() {
    for (const btn of elements.tabButtons) {
        if (btn.classList.contains('active')) {
            return btn.dataset.tab;
        }
    }
    return 'period';
}

function calculate() {
    const principal = parseInt(elements.principal.value);
    const rate = parseFloat(elements.rate.value);
    const paymentType = getSelectedPaymentType();
    const activeTab = getActiveTab();

    let months;

    if (activeTab === 'period') {
        // 返済期間で計算
        months = parseInt(elements.months.value);
    } else {
        // 返済額で計算
        const monthlyPayment = parseInt(elements.monthlyPayment.value);

        if (paymentType === 'equal') {
            months = LoanCalculator.calculateMonthsFromPayment(principal, rate, monthlyPayment);
        } else {
            months = LoanCalculator.calculateMonthsFromPaymentPrincipal(principal, rate, monthlyPayment);
        }

        if (!months || months <= 0) {
            alert('入力された返済額では返済できません。返済額を増やしてください。');
            return;
        }
    }

    // 計算実行
    currentCalculator = new LoanCalculator(principal, rate, months, paymentType);
    currentSchedule = currentCalculator.calculateSchedule();

    // 結果表示
    displayResults();

    // グラフ表示
    chartHandler.showBalanceChart(currentSchedule);

    // スケジュール表示
    displaySchedule();

    // 結果セクションを表示
    elements.resultSection.style.display = 'block';

    // スクロール
    elements.resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function displayResults() {
    const monthlyPayment = currentCalculator.getMonthlyPayment();
    const totalPayment = currentCalculator.calculateTotalPayment();
    const totalInterest = currentCalculator.calculateTotalInterest();

    // 月々の返済額
    if (monthlyPayment.type === 'equal') {
        elements.monthlyPaymentResult.textContent = formatNumber(monthlyPayment.first) + '円';
        elements.paymentNote.textContent = '毎月一定';
    } else {
        elements.monthlyPaymentResult.textContent = formatNumber(monthlyPayment.first) + '円';
        elements.paymentNote.textContent = `初回 → 最終回: ${formatNumber(monthlyPayment.last)}円`;
    }

    // 返済期間
    elements.periodResult.textContent = formatPeriod(currentCalculator.months);

    // 総返済額
    elements.totalResult.textContent = formatNumber(totalPayment) + '円';
    const diff = totalPayment - currentCalculator.principal;
    elements.totalNote.textContent = `借入額 + ${formatNumber(diff)}円`;

    // 利息合計
    elements.interestResult.textContent = formatNumber(totalInterest) + '円';
    const interestRatio = (totalInterest / totalPayment * 100).toFixed(1);
    elements.interestNote.textContent = `総返済額の${interestRatio}%`;
}

function displaySchedule(showAll = false) {
    elements.scheduleTableBody.innerHTML = '';

    let scheduleToShow;

    if (showAll || currentSchedule.length <= 15) {
        scheduleToShow = currentSchedule;
        elements.showAllBtn.style.display = 'none';
    } else {
        // 最初の12回と最後の3回を表示
        scheduleToShow = [
            ...currentSchedule.slice(0, 12),
            ...currentSchedule.slice(-3)
        ];
        elements.showAllBtn.style.display = 'block';
    }

    scheduleToShow.forEach((item, index) => {
        const row = document.createElement('tr');

        // 省略がある場合、中間に区切り行を挿入
        if (!showAll && currentSchedule.length > 15 && index === 12) {
            const separatorRow = document.createElement('tr');
            separatorRow.innerHTML = `<td colspan="5" style="text-align: center; color: #A0AEC0;">...</td>`;
            elements.scheduleTableBody.appendChild(separatorRow);
        }

        row.innerHTML = `
            <td>${item.month}</td>
            <td>${formatNumber(item.payment)}円</td>
            <td>${formatNumber(item.principal)}円</td>
            <td>${formatNumber(item.interest)}円</td>
            <td>${formatNumber(item.balance)}円</td>
        `;

        elements.scheduleTableBody.appendChild(row);
    });
}

function showFullSchedule() {
    displaySchedule(true);
}

function switchChartTab(chartType) {
    // タブのアクティブ状態を切り替え
    elements.chartTabs.forEach(tab => {
        if (tab.dataset.chart === chartType) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // グラフを切り替え
    chartHandler.switchChart(chartType, currentSchedule);
}
