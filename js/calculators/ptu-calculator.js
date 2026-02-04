/**
 * PTU Calculator Module
 * Core calculation logic for Provisioned Throughput Units
 */

const PtuCalculator = {
    /**
     * Calculate PTUs required for a single workload
     * @param {Object} workload - Workload configuration
     * @returns {Object} Calculated metrics
     */
    calculateWorkload(workload) {
        const rate = getModelRate(workload.model);
        if (!rate) {
            console.error(`Unknown model: ${workload.model}`);
            return null;
        }

        // Calculate TPM
        const inputTpm = workload.peakRpm * workload.inputTokens;
        const outputTpm = workload.peakRpm * workload.outputTokens;
        const totalTpm = inputTpm + outputTpm;

        // Calculate PTUs based on model method
        let estimatedPtus;

        if (rate.method === 'ratio' && rate.outputRatio) {
            // New method: Use output ratio multiplier
            const effectiveTpm = inputTpm + (outputTpm * rate.outputRatio);
            estimatedPtus = effectiveTpm / rate.inputTpmPerPtu;
        } else {
            // Legacy/Separate method: Calculate input and output separately
            const inputPtus = inputTpm / rate.inputTpmPerPtu;
            const outputPtus = outputTpm / rate.outputTpmPerPtu;
            estimatedPtus = Math.max(inputPtus, outputPtus);
        }

        return {
            workloadId: workload.id,
            name: workload.name,
            model: workload.model,
            inputTpm,
            outputTpm,
            totalTpm,
            estimatedPtus: Math.ceil(estimatedPtus)
        };
    },

    /**
     * Calculate total PTUs for all workloads
     * @param {Array} workloads - Array of workload configurations
     * @param {Object} config - Global configuration
     * @returns {Object} Aggregated calculations
     */
    calculateTotal(workloads, config) {
        if (!workloads || workloads.length === 0) {
            return {
                totalInputTpm: 0,
                totalOutputTpm: 0,
                totalTpm: 0,
                basePtuRequired: 0,
                bufferPtus: 0,
                peakPtus: 0,
                subtotalPtus: 0,
                finalPtuRequired: 0,
                workloadBreakdown: []
            };
        }

        // Calculate each workload
        const workloadBreakdown = workloads.map(w => this.calculateWorkload(w)).filter(w => w !== null);

        // Aggregate totals
        const totalInputTpm = workloadBreakdown.reduce((sum, w) => sum + w.inputTpm, 0);
        const totalOutputTpm = workloadBreakdown.reduce((sum, w) => sum + w.outputTpm, 0);
        const totalTpm = totalInputTpm + totalOutputTpm;
        const basePtuRequired = workloadBreakdown.reduce((sum, w) => sum + w.estimatedPtus, 0);

        // Apply buffer and peak multipliers
        const bufferPercent = config.bufferPercentage / 100;
        const peakMultiplier = config.peakMultiplier;

        const bufferPtus = Math.ceil(basePtuRequired * bufferPercent);
        const peakPtus = Math.ceil(basePtuRequired * (peakMultiplier - 1));
        const subtotalPtus = basePtuRequired + bufferPtus + peakPtus;

        // Round to deployment type increment
        const deploymentConfig = getDeploymentConfig(config.deploymentType);
        const increment = deploymentConfig.incrementSize;
        const minimum = deploymentConfig.minimumPtus;

        let finalPtuRequired = Math.ceil(subtotalPtus / increment) * increment;
        finalPtuRequired = Math.max(finalPtuRequired, minimum);

        // If no workloads have PTUs, return 0
        if (basePtuRequired === 0) {
            finalPtuRequired = 0;
        }

        return {
            totalInputTpm,
            totalOutputTpm,
            totalTpm,
            basePtuRequired,
            bufferPtus,
            peakPtus,
            subtotalPtus,
            finalPtuRequired,
            minimumIncrement: increment,
            workloadBreakdown
        };
    },

    /**
     * Calculate utilization projections for different scenarios
     * @param {number} basePtus - Base PTU requirement
     * @param {Object} config - Configuration
     * @returns {Array} Utilization scenarios
     */
    calculateUtilizationProjections(basePtus, config) {
        const targetUtil = config.targetUtilization / 100;

        const scenarios = [
            { name: 'Conservative (100% PTU)', ptuPercent: 1.0, spillover: 0 },
            { name: 'Balanced (90% PTU)', ptuPercent: 0.9, spillover: 10 },
            { name: 'Aggressive (80% PTU)', ptuPercent: 0.8, spillover: 20 }
        ];

        return scenarios.map(scenario => {
            const ptus = Math.ceil(basePtus * scenario.ptuPercent);
            const deploymentConfig = getDeploymentConfig(config.deploymentType);
            const roundedPtus = Math.ceil(ptus / deploymentConfig.incrementSize) * deploymentConfig.incrementSize;

            // Expected utilization = base requirement / deployed PTUs
            const expectedUtil = ptus > 0 ? (basePtus / roundedPtus) * 100 : 0;

            return {
                name: scenario.name,
                ptus: roundedPtus,
                expectedUtilization: expectedUtil.toFixed(1) + '%',
                spilloverPercent: scenario.spillover + '%'
            };
        });
    },

    /**
     * Calculate monthly tokens based on workloads and daily hours
     * @param {Array} workloads - Workload configurations
     * @param {number} hoursPerMonth - Hours per month (typically 730)
     * @returns {Object} Monthly token totals
     */
    calculateMonthlyTokens(workloads, hoursPerMonth = 730) {
        let totalInputTokens = 0;
        let totalOutputTokens = 0;

        workloads.forEach(workload => {
            // Calculate daily tokens
            const dailyMinutes = workload.dailyHours * 60;
            const dailyInputTokens = workload.peakRpm * workload.inputTokens * dailyMinutes;
            const dailyOutputTokens = workload.peakRpm * workload.outputTokens * dailyMinutes;

            // Calculate monthly (assuming ~30.4 days per month)
            const daysPerMonth = hoursPerMonth / 24;
            totalInputTokens += dailyInputTokens * daysPerMonth;
            totalOutputTokens += dailyOutputTokens * daysPerMonth;
        });

        return {
            inputTokens: Math.round(totalInputTokens),
            outputTokens: Math.round(totalOutputTokens),
            totalTokens: Math.round(totalInputTokens + totalOutputTokens)
        };
    }
};
