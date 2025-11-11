/**
 * 複数借入シミュレーション機能
 */

// グローバル変数
let multipleChartHandler;
let selectedLenders = [];
let multipleLoanResults = [];

// DOM要素
const multipleElements = {
    lenderCheckboxes: document.querySelectorAll('.lender-checkbox input[type="checkbox"]'),
    multipleLoanForms: document.getElementById('multipleLoanForms'),
    calculateMultipleBtn: document.getElementById('calculateMultipleBtn'),
    multipleResultSection: document.getElementById('multipleResultSection'),

    // 結果表示
    multipleMonthlyTotal: document.getElementById('multipleMonthlyTotal'),
    multiplePrincipalTotal: document.getElementById('multiplePrincipalTotal'),
    multipleTotalPayment: document.getElementById('multipleTotalPayment'),
    multipleInterestTotal: document.getElementById('multipleInterestTotal'),
    multipleBreakdownBody: document.getElementById('multipleBreakdownBody'),
    multipleBreakdownCards: document.getElementById('multipleBreakdownCards'),

    // グラフ
    multipleChartTabs: document.querySelectorAll('[data-mchart]')
};

// 初期化
function initializeMultipleLoan() {
    multipleChartHandler = new ChartHandler('multipleChartCanvas');

    // イベントリスナー設定
    multipleElements.lenderCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleLenderSelection);
    });

    multipleElements.calculateMultipleBtn.addEventListener('click', calculateMultiple);

    multipleElements.multipleChartTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const chartType = e.target.dataset.mchart;
            switchMultipleChart(chartType);
        });
    });
}

// 貸金業者選択ハンドラー
function handleLenderSelection(e) {
    const checkbox = e.target;
    const lenderId = checkbox.value;
    const lenderName = checkbox.dataset.name;
    const defaultRate = parseFloat(checkbox.dataset.rate);

    if (checkbox.checked) {
        // フォームを追加
        addLenderForm(lenderId, lenderName, defaultRate);
    } else {
        // フォームを削除
        removeLenderForm(lenderId);
    }
}

// 貸金業者フォーム追加
function addLenderForm(lenderId, lenderName, defaultRate) {
    const formHTML = `
        <div class="multiple-loan-form ${lenderId}" id="form-${lenderId}">
            <h3>${lenderName}</h3>

            <div class="form-group">
                <label for="${lenderId}-principal" class="form-label">
                    借入金額
                    <span class="label-value" id="${lenderId}-principalValue">10万円</span>
                </label>
                <input type="range" id="${lenderId}-principal" class="form-range"
                       min="10000" max="2000000" step="10000" value="100000">
                <div class="range-labels">
                    <span>1万円</span>
                    <span>200万円</span>
                </div>
            </div>

            <div class="form-group">
                <label for="${lenderId}-rate" class="form-label">
                    金利(年率)
                    <span class="label-value" id="${lenderId}-rateValue">${defaultRate.toFixed(1)}%</span>
                </label>
                <input type="range" id="${lenderId}-rate" class="form-range"
                       min="1.0" max="20.0" step="0.1" value="${defaultRate}">
                <div class="range-labels">
                    <span>1.0%</span>
                    <span>20.0%</span>
                </div>
            </div>

            <div class="form-group">
                <label for="${lenderId}-months" class="form-label">
                    返済期間
                    <span class="label-value" id="${lenderId}-monthsValue">12ヶ月</span>
                </label>
                <input type="range" id="${lenderId}-months" class="form-range"
                       min="1" max="120" step="1" value="12">
                <div class="range-labels">
                    <span>1ヶ月</span>
                    <span>120ヶ月</span>
                </div>
            </div>
        </div>
    `;

    multipleElements.multipleLoanForms.insertAdjacentHTML('beforeend', formHTML);

    // イベントリスナーを追加
    const principalInput = document.getElementById(`${lenderId}-principal`);
    const rateInput = document.getElementById(`${lenderId}-rate`);
    const monthsInput = document.getElementById(`${lenderId}-months`);

    principalInput.addEventListener('input', (e) => {
        document.getElementById(`${lenderId}-principalValue`).textContent = formatNumber(e.target.value) + '円';
    });

    rateInput.addEventListener('input', (e) => {
        document.getElementById(`${lenderId}-rateValue`).textContent = parseFloat(e.target.value).toFixed(1) + '%';
    });

    monthsInput.addEventListener('input', (e) => {
        document.getElementById(`${lenderId}-monthsValue`).textContent = e.target.value + 'ヶ月';
    });
}

// 貸金業者フォーム削除
function removeLenderForm(lenderId) {
    const form = document.getElementById(`form-${lenderId}`);
    if (form) {
        form.remove();
    }
}

// 複数借入計算
function calculateMultiple() {
    const checkedCheckboxes = Array.from(multipleElements.lenderCheckboxes).filter(cb => cb.checked);

    if (checkedCheckboxes.length === 0) {
        alert('少なくとも1つの貸金業者を選択してください。');
        return;
    }

    multipleLoanResults = [];

    checkedCheckboxes.forEach(checkbox => {
        const lenderId = checkbox.value;
        const lenderName = checkbox.dataset.name;

        const principal = parseInt(document.getElementById(`${lenderId}-principal`).value);
        const rate = parseFloat(document.getElementById(`${lenderId}-rate`).value);
        const months = parseInt(document.getElementById(`${lenderId}-months`).value);

        const calculator = new LoanCalculator(principal, rate, months, 'equal');
        const schedule = calculator.calculateSchedule();
        const monthlyPayment = calculator.calculateEqualPayment();
        const totalPayment = calculator.calculateTotalPayment();
        const totalInterest = calculator.calculateTotalInterest();

        multipleLoanResults.push({
            id: lenderId,
            name: lenderName,
            principal: principal,
            rate: rate,
            months: months,
            monthlyPayment: monthlyPayment,
            totalPayment: totalPayment,
            totalInterest: totalInterest,
            schedule: schedule
        });
    });

    // 結果表示
    displayMultipleResults();

    // グラフ表示
    showMultipleStackedChart();

    // 結果セクションを表示
    multipleElements.multipleResultSection.style.display = 'block';
    multipleElements.multipleResultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 複数借入結果表示
function displayMultipleResults() {
    // 合計計算
    const monthlyTotal = multipleLoanResults.reduce((sum, result) => sum + result.monthlyPayment, 0);
    const principalTotal = multipleLoanResults.reduce((sum, result) => sum + result.principal, 0);
    const totalPayment = multipleLoanResults.reduce((sum, result) => sum + result.totalPayment, 0);
    const interestTotal = multipleLoanResults.reduce((sum, result) => sum + result.totalInterest, 0);

    // サマリー表示
    multipleElements.multipleMonthlyTotal.textContent = formatNumber(monthlyTotal) + '円';
    multipleElements.multiplePrincipalTotal.textContent = formatNumber(principalTotal) + '円';
    multipleElements.multipleTotalPayment.textContent = formatNumber(totalPayment) + '円';
    multipleElements.multipleInterestTotal.textContent = formatNumber(interestTotal) + '円';

    // 会社別内訳表示（テーブル）
    multipleElements.multipleBreakdownBody.innerHTML = '';
    multipleLoanResults.forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.name}</td>
            <td>${formatNumber(result.principal)}円</td>
            <td>${formatNumber(result.monthlyPayment)}円</td>
            <td>${formatPeriod(result.months)}</td>
            <td>${formatNumber(result.totalPayment)}円</td>
            <td>${formatNumber(result.totalInterest)}円</td>
        `;
        multipleElements.multipleBreakdownBody.appendChild(row);
    });

    // 会社別内訳表示（モバイルカード）
    multipleElements.multipleBreakdownCards.innerHTML = '';
    multipleLoanResults.forEach(result => {
        const card = document.createElement('div');
        card.className = 'breakdown-card';
        card.innerHTML = `
            <div class="breakdown-card-header">${result.name}</div>
            <div class="breakdown-card-body">
                <div class="breakdown-item">
                    <span class="breakdown-label">借入金額</span>
                    <span class="breakdown-value">${formatNumber(result.principal)}円</span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-label">月々返済額</span>
                    <span class="breakdown-value highlight">${formatNumber(result.monthlyPayment)}円</span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-label">返済期間</span>
                    <span class="breakdown-value">${formatPeriod(result.months)}</span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-label">総返済額</span>
                    <span class="breakdown-value">${formatNumber(result.totalPayment)}円</span>
                </div>
                <div class="breakdown-item">
                    <span class="breakdown-label">利息</span>
                    <span class="breakdown-value">${formatNumber(result.totalInterest)}円</span>
                </div>
            </div>
        `;
        multipleElements.multipleBreakdownCards.appendChild(card);
    });
}

// グラフ切り替え
function switchMultipleChart(chartType) {
    multipleElements.multipleChartTabs.forEach(tab => {
        if (tab.dataset.mchart === chartType) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    if (chartType === 'stacked') {
        showMultipleStackedChart();
    } else if (chartType === 'pie') {
        showMultiplePieChart();
    } else if (chartType === 'balance') {
        showMultipleBalanceChart();
    }
}

// 積み上げ棒グラフ
function showMultipleStackedChart() {
    multipleChartHandler.destroy();

    const maxMonths = Math.max(...multipleLoanResults.map(r => r.months));
    const labels = Array.from({length: maxMonths}, (_, i) => `${i + 1}回目`);

    const datasets = multipleLoanResults.map((result, index) => {
        const colors = ['#E60012', '#00A7E1', '#00A040', '#ED6103', '#005BAC'];
        const data = Array(maxMonths).fill(0);

        for (let i = 0; i < result.months; i++) {
            data[i] = result.monthlyPayment;
        }

        return {
            label: result.name,
            data: data,
            backgroundColor: colors[index % colors.length],
            borderWidth: 0
        };
    });

    multipleChartHandler.chart = new Chart(multipleChartHandler.ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        footer: function(tooltipItems) {
                            let total = 0;
                            tooltipItems.forEach(item => {
                                total += item.parsed.y;
                            });
                            return `合計: ${formatNumber(total)}円`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: { maxTicksLimit: 12 }
                },
                y: {
                    stacked: true,
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value) + '円';
                        }
                    }
                }
            }
        }
    });
}

// 円グラフ
function showMultiplePieChart() {
    multipleChartHandler.destroy();

    const labels = multipleLoanResults.map(r => r.name);
    const data = multipleLoanResults.map(r => r.principal);
    const colors = ['#E60012', '#00A7E1', '#00A040', '#ED6103', '#005BAC'];

    multipleChartHandler.chart = new Chart(multipleChartHandler.ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, multipleLoanResults.length)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${formatNumber(value)}円 (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// 合計残高推移グラフ
function showMultipleBalanceChart() {
    multipleChartHandler.destroy();

    const maxMonths = Math.max(...multipleLoanResults.map(r => r.months));
    const labels = Array.from({length: maxMonths}, (_, i) => `${i + 1}回目`);

    const totalBalances = Array(maxMonths).fill(0);

    multipleLoanResults.forEach(result => {
        result.schedule.forEach((item, index) => {
            if (index < maxMonths) {
                totalBalances[index] += item.balance;
            }
        });
    });

    multipleChartHandler.chart = new Chart(multipleChartHandler.ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '合計残高',
                data: totalBalances,
                borderColor: '#3182CE',
                backgroundColor: 'rgba(49, 130, 206, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value) + '円';
                        }
                    }
                },
                x: {
                    ticks: { maxTicksLimit: 12 }
                }
            }
        }
    });
}
