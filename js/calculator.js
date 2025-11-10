/**
 * カードローン返済計算クラス
 */
class LoanCalculator {
    /**
     * @param {number} principal - 借入金額
     * @param {number} rate - 年利率（%）
     * @param {number} months - 返済月数
     * @param {string} type - 返済方法（'equal': 元利均等, 'principal': 元金均等）
     */
    constructor(principal, rate, months, type = 'equal') {
        this.principal = principal;
        this.rate = rate;
        this.months = months;
        this.type = type;
        this.monthlyRate = (rate / 100) / 12; // 月利
    }

    /**
     * 月々の返済額を計算（元利均等返済）
     * @returns {number}
     */
    calculateEqualPayment() {
        if (this.monthlyRate === 0) {
            return this.principal / this.months;
        }

        const payment = this.principal *
            (this.monthlyRate * Math.pow(1 + this.monthlyRate, this.months)) /
            (Math.pow(1 + this.monthlyRate, this.months) - 1);

        return Math.round(payment);
    }

    /**
     * 返済スケジュールを計算
     * @returns {Array}
     */
    calculateSchedule() {
        if (this.type === 'equal') {
            return this.calculateEqualSchedule();
        } else {
            return this.calculatePrincipalSchedule();
        }
    }

    /**
     * 元利均等返済のスケジュールを計算
     * @returns {Array}
     */
    calculateEqualSchedule() {
        const schedule = [];
        const monthlyPayment = this.calculateEqualPayment();
        let balance = this.principal;

        for (let i = 1; i <= this.months; i++) {
            const interest = Math.round(balance * this.monthlyRate);
            const principalPayment = monthlyPayment - interest;
            balance = Math.max(0, balance - principalPayment);

            schedule.push({
                month: i,
                payment: monthlyPayment,
                principal: principalPayment,
                interest: interest,
                balance: Math.round(balance)
            });
        }

        return schedule;
    }

    /**
     * 元金均等返済のスケジュールを計算
     * @returns {Array}
     */
    calculatePrincipalSchedule() {
        const schedule = [];
        const principalPayment = Math.round(this.principal / this.months);
        let balance = this.principal;

        for (let i = 1; i <= this.months; i++) {
            const interest = Math.round(balance * this.monthlyRate);
            const payment = principalPayment + interest;
            balance = Math.max(0, balance - principalPayment);

            schedule.push({
                month: i,
                payment: payment,
                principal: principalPayment,
                interest: interest,
                balance: Math.round(balance)
            });
        }

        return schedule;
    }

    /**
     * 総返済額を計算
     * @returns {number}
     */
    calculateTotalPayment() {
        const schedule = this.calculateSchedule();
        return schedule.reduce((sum, item) => sum + item.payment, 0);
    }

    /**
     * 利息合計を計算
     * @returns {number}
     */
    calculateTotalInterest() {
        return this.calculateTotalPayment() - this.principal;
    }

    /**
     * 月々の返済額を取得
     * @returns {object}
     */
    getMonthlyPayment() {
        if (this.type === 'equal') {
            const payment = this.calculateEqualPayment();
            return {
                first: payment,
                last: payment,
                type: 'equal'
            };
        } else {
            const schedule = this.calculateSchedule();
            return {
                first: schedule[0].payment,
                last: schedule[schedule.length - 1].payment,
                type: 'principal'
            };
        }
    }

    /**
     * 返済額から期間を逆算（元利均等返済）
     * @param {number} monthlyPayment - 月々の返済額
     * @returns {number}
     */
    static calculateMonthsFromPayment(principal, rate, monthlyPayment) {
        const monthlyRate = (rate / 100) / 12;

        if (monthlyRate === 0) {
            return Math.ceil(principal / monthlyPayment);
        }

        // 最低返済額チェック
        const minPayment = Math.ceil(principal * monthlyRate);
        if (monthlyPayment <= minPayment) {
            return null; // 返済不可
        }

        // 対数を使って期間を計算
        const months = Math.log(monthlyPayment / (monthlyPayment - principal * monthlyRate)) /
                      Math.log(1 + monthlyRate);

        return Math.ceil(months);
    }

    /**
     * 返済額から期間を逆算（元金均等返済）
     * @param {number} monthlyPayment - 月々の返済額
     * @returns {number}
     */
    static calculateMonthsFromPaymentPrincipal(principal, rate, monthlyPayment) {
        const monthlyRate = (rate / 100) / 12;

        // 反復計算で期間を求める
        let months = 1;
        let maxMonths = 360; // 最大30年

        for (let m = 1; m <= maxMonths; m++) {
            const principalPayment = principal / m;
            const interest = principal * monthlyRate;
            const firstPayment = principalPayment + interest;

            if (firstPayment <= monthlyPayment) {
                months = m;
                break;
            }
        }

        return months;
    }

    /**
     * 最低返済額を計算
     * @returns {number}
     */
    calculateMinPayment() {
        if (this.monthlyRate === 0) {
            return Math.ceil(this.principal / 120); // 最大10年
        }

        // 元利均等の場合の最低返済額（利息分を少し上回る額）
        const minPayment = Math.ceil(this.principal * this.monthlyRate * 1.1);
        return minPayment;
    }
}

/**
 * 数値をフォーマット（カンマ区切り）
 * @param {number} num
 * @returns {string}
 */
function formatNumber(num) {
    return Math.round(num).toLocaleString('ja-JP');
}

/**
 * 期間を「XX年XXヶ月」形式にフォーマット
 * @param {number} months
 * @returns {string}
 */
function formatPeriod(months) {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
        return `${remainingMonths}ヶ月`;
    } else if (remainingMonths === 0) {
        return `${years}年`;
    } else {
        return `${years}年${remainingMonths}ヶ月`;
    }
}
