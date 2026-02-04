/**
 * Cost Calculator Module
 * PTU and PAYGO cost calculations
 */

const CostCalculator = {
    /**
     * Calculate PTU costs
     * @param {number} ptus - Number of PTUs
     * @param {Object} config - Configuration with pricing
     * @returns {Object} Cost breakdown
     */
    calculatePtuCosts(ptus, config) {
        const hourlyRate = config.hourlyRate;
        const hoursPerMonth = config.hoursPerMonth;
        const discount1Year = config.discount1Year / 100;
        const discount3Year = config.discount3Year / 100;

        // Monthly and annual costs
        const monthlyHourly = ptus * hourlyRate * hoursPerMonth;
        const annualHourly = monthlyHourly * 12;

        // Reserved pricing
        const monthly1Year = monthlyHourly * (1 - discount1Year);
        const annual1Year = monthly1Year * 12;

        const monthly3Year = monthlyHourly * (1 - discount3Year);
        const annual3Year = monthly3Year * 12;

        // Savings
        const savings1Year = annualHourly - annual1Year;
        const savings3Year = annualHourly - annual3Year;

        return {
            ptus,
            hourlyRate,
            monthlyHourly,
            annualHourly,
            monthly1Year,
            annual1Year,
            monthly3Year,
            annual3Year,
            savings1Year,
            savings3Year
        };
    },

    /**
     * Calculate PAYGO costs for comparison
     * @param {Array} workloads - Workload configurations
     * @param {number} hoursPerMonth - Hours per month
     * @returns {Object} PAYGO cost breakdown
     */
    calculatePaygoCosts(workloads, hoursPerMonth = 730) {
        if (!workloads || workloads.length === 0) {
            return {
                inputTokens: 0,
                outputTokens: 0,
                inputCost: 0,
                outputCost: 0,
                totalMonthly: 0
            };
        }

        let totalInputCost = 0;
        let totalOutputCost = 0;
        let totalInputTokens = 0;
        let totalOutputTokens = 0;

        workloads.forEach(workload => {
            const paygoRate = getPaygoRate(workload.model);

            // Calculate monthly tokens
            const dailyMinutes = workload.dailyHours * 60;
            const dailyInputTokens = workload.peakRpm * workload.inputTokens * dailyMinutes;
            const dailyOutputTokens = workload.peakRpm * workload.outputTokens * dailyMinutes;

            const daysPerMonth = hoursPerMonth / 24;
            const monthlyInputTokens = dailyInputTokens * daysPerMonth;
            const monthlyOutputTokens = dailyOutputTokens * daysPerMonth;

            totalInputTokens += monthlyInputTokens;
            totalOutputTokens += monthlyOutputTokens;

            // Calculate costs (rates are per 1M tokens)
            totalInputCost += (monthlyInputTokens / 1000000) * paygoRate.input;
            totalOutputCost += (monthlyOutputTokens / 1000000) * paygoRate.output;
        });

        return {
            inputTokens: Math.round(totalInputTokens),
            outputTokens: Math.round(totalOutputTokens),
            inputCost: totalInputCost,
            outputCost: totalOutputCost,
            totalMonthly: totalInputCost + totalOutputCost
        };
    },

    /**
     * Compare PTU vs PAYGO costs
     * @param {Object} ptuCosts - PTU cost calculations
     * @param {Object} paygoCosts - PAYGO cost calculations
     * @returns {Object} Comparison results
     */
    compareCosts(ptuCosts, paygoCosts) {
        const ptuMonthly = ptuCosts.monthly1Year; // Use 1-year reserved for fair comparison
        const paygoMonthly = paygoCosts.totalMonthly;

        const difference = paygoMonthly - ptuMonthly;
        const savingsPercent = paygoMonthly > 0
            ? ((difference / paygoMonthly) * 100).toFixed(1)
            : 0;

        let recommendation = '';
        if (ptuCosts.ptus === 0) {
            recommendation = 'Add workloads to see cost comparison and recommendations.';
        } else if (difference > 0) {
            recommendation = `PTU deployment with 1-year reservation saves $${this.formatCurrency(difference)} per month (${savingsPercent}% savings) compared to PAYGO. Recommended for predictable, high-volume workloads.`;
        } else if (difference < 0) {
            recommendation = `PAYGO is more cost-effective by $${this.formatCurrency(Math.abs(difference))} per month. Consider PAYGO for variable or lower-volume workloads, or reduce PTU allocation with spillover strategy.`;
        } else {
            recommendation = 'PTU and PAYGO costs are roughly equivalent. Choose based on latency requirements and traffic predictability.';
        }

        return {
            ptuMonthly,
            paygoMonthly,
            difference,
            savingsPercent,
            recommendation,
            ptuIsCheaper: difference > 0
        };
    },

    /**
     * Calculate break-even TPM
     * @param {Object} config - Configuration
     * @param {string} model - Model name
     * @returns {number} Break-even tokens per minute
     */
    calculateBreakEven(config, model = 'GPT-4o') {
        const paygoRate = getPaygoRate(model);
        const avgPaygoRate = (paygoRate.input + paygoRate.output) / 2;

        if (avgPaygoRate === 0) return 0;

        // Monthly PTU cost per PTU
        const monthlyPtuCostPerUnit = config.hourlyRate * config.hoursPerMonth;

        // Break-even = PTU cost / PAYGO rate * 1M tokens
        const breakEvenTokens = (monthlyPtuCostPerUnit / avgPaygoRate) * 1000000;

        return Math.round(breakEvenTokens);
    },

    /**
     * Format currency for display
     * @param {number} value - Value to format
     * @returns {string} Formatted currency string
     */
    formatCurrency(value) {
        return value.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }
};
