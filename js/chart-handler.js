/**
 * グラフ描画クラス
 */
class ChartHandler {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.chart = null;
        this.currentType = 'balance';
    }

    /**
     * グラフを破棄
     */
    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }

    /**
     * 残高推移グラフを表示
     * @param {Array} schedule - 返済スケジュール
     */
    showBalanceChart(schedule) {
        this.destroy();
        this.currentType = 'balance';

        const labels = schedule.map(item => `${item.month}回目`);
        const balances = schedule.map(item => item.balance);

        this.chart = new Chart(this.ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '残高',
                    data: balances,
                    borderColor: '#3182CE',
                    backgroundColor: 'rgba(49, 130, 206, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#3182CE',
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `残高: ${formatNumber(context.parsed.y)}円`;
                            }
                        },
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 14
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatNumber(value) + '円';
                            },
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            maxTicksLimit: 12,
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    /**
     * 元金・利息内訳グラフを表示
     * @param {Array} schedule - 返済スケジュール
     */
    showBreakdownChart(schedule) {
        this.destroy();
        this.currentType = 'breakdown';

        const labels = schedule.map(item => `${item.month}回目`);
        const principals = schedule.map(item => item.principal);
        const interests = schedule.map(item => item.interest);

        this.chart = new Chart(this.ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '元金',
                        data: principals,
                        backgroundColor: '#3182CE',
                        borderWidth: 0
                    },
                    {
                        label: '利息',
                        data: interests,
                        backgroundColor: '#DD6B20',
                        borderWidth: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: {
                                size: 13
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                return `${label}: ${formatNumber(context.parsed.y)}円`;
                            },
                            footer: function(tooltipItems) {
                                let total = 0;
                                tooltipItems.forEach(item => {
                                    total += item.parsed.y;
                                });
                                return `合計: ${formatNumber(total)}円`;
                            }
                        },
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 14
                        },
                        footerFont: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        ticks: {
                            maxTicksLimit: 12,
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatNumber(value) + '円';
                            },
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    /**
     * グラフタイプを切り替え
     * @param {string} type - 'balance' or 'breakdown'
     * @param {Array} schedule - 返済スケジュール
     */
    switchChart(type, schedule) {
        if (type === 'balance') {
            this.showBalanceChart(schedule);
        } else if (type === 'breakdown') {
            this.showBreakdownChart(schedule);
        }
    }
}
