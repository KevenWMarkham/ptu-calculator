/**
 * Spillover Calculator Module
 * Hybrid PTU/PAYGO scenario planning
 */

const SpilloverCalculator = {
    /**
     * Calculate spillover scenarios
     * @param {number} totalPtus - Total PTU requirement (100% scenario)
     * @param {Object} config - Configuration
     * @param {Array} workloads - Workload configurations
     * @returns {Array} Spillover scenarios
     */
    calculateScenarios(totalPtus, config, workloads) {
        const scenarios = [
            { name: '100% PTU (No Spillover)', ptuPercent: 1.00 },
            { name: '95% PTU / 5% Spillover', ptuPercent: 0.95 },
            { name: '90% PTU / 10% Spillover', ptuPercent: 0.90 },
            { name: '85% PTU / 15% Spillover', ptuPercent: 0.85 },
            { name: '80% PTU / 20% Spillover', ptuPercent: 0.80 },
            { name: '75% PTU / 25% Spillover', ptuPercent: 0.75 }
        ];

        // Calculate PAYGO costs for spillover portion
        const fullPaygoCosts = CostCalculator.calculatePaygoCosts(workloads, config.hoursPerMonth);
        const baselineMonthly = CostCalculator.calculatePtuCosts(totalPtus, config).monthly1Year;

        const deploymentConfig = getDeploymentConfig(config.deploymentType);

        return scenarios.map(scenario => {
            // Calculate PTU portion
            const rawPtus = totalPtus * scenario.ptuPercent;
            const roundedPtus = Math.ceil(rawPtus / deploymentConfig.incrementSize) * deploymentConfig.incrementSize;

            // Calculate costs
            const ptuCost = CostCalculator.calculatePtuCosts(roundedPtus, config).monthly1Year;

            // Spillover cost = spillover percentage of PAYGO
            const spilloverPercent = 1 - scenario.ptuPercent;
            const spilloverCost = fullPaygoCosts.totalMonthly * spilloverPercent;

            // Total cost
            const totalCost = ptuCost + spilloverCost;

            // Comparison to 100% PTU
            const vsPtuBaseline = baselineMonthly > 0
                ? (((totalCost - baselineMonthly) / baselineMonthly) * 100).toFixed(1)
                : 0;

            return {
                name: scenario.name,
                ptuPercent: (scenario.ptuPercent * 100).toFixed(0) + '%',
                ptus: roundedPtus,
                ptuCost,
                spilloverCost,
                totalCost,
                vsPtuBaseline: parseFloat(vsPtuBaseline)
            };
        });
    },

    /**
     * Find optimal spillover configuration
     * @param {Array} scenarios - Calculated scenarios
     * @returns {Object} Optimal scenario
     */
    findOptimal(scenarios) {
        if (!scenarios || scenarios.length === 0) {
            return null;
        }

        // Find the scenario with the lowest total cost
        return scenarios.reduce((optimal, current) => {
            return current.totalCost < optimal.totalCost ? current : optimal;
        }, scenarios[0]);
    },

    /**
     * Calculate custom spillover scenario
     * @param {number} totalPtus - Total PTU requirement
     * @param {number} ptuPercent - Percentage allocated to PTU (0-1)
     * @param {Object} config - Configuration
     * @param {Array} workloads - Workloads
     * @returns {Object} Custom scenario calculation
     */
    calculateCustomScenario(totalPtus, ptuPercent, config, workloads) {
        const deploymentConfig = getDeploymentConfig(config.deploymentType);
        const rawPtus = totalPtus * ptuPercent;
        const roundedPtus = Math.ceil(rawPtus / deploymentConfig.incrementSize) * deploymentConfig.incrementSize;

        const ptuCost = CostCalculator.calculatePtuCosts(roundedPtus, config).monthly1Year;
        const fullPaygoCosts = CostCalculator.calculatePaygoCosts(workloads, config.hoursPerMonth);
        const spilloverPercent = 1 - ptuPercent;
        const spilloverCost = fullPaygoCosts.totalMonthly * spilloverPercent;

        return {
            ptuPercent: (ptuPercent * 100).toFixed(0) + '%',
            spilloverPercent: (spilloverPercent * 100).toFixed(0) + '%',
            ptus: roundedPtus,
            ptuCost,
            spilloverCost,
            totalCost: ptuCost + spilloverCost
        };
    },

    /**
     * Generate chargeback allocation
     * @param {Array} workloadBreakdown - Calculated workload metrics
     * @param {number} totalPtus - Total PTUs
     * @param {Object} costs - Cost calculations
     * @returns {Array} Chargeback allocation by application
     */
    calculateChargeback(workloadBreakdown, totalPtus, costs) {
        if (!workloadBreakdown || workloadBreakdown.length === 0) {
            return [];
        }

        const totalTpm = workloadBreakdown.reduce((sum, w) => sum + w.totalTpm, 0);

        return workloadBreakdown.map(workload => {
            const tpmShare = totalTpm > 0 ? workload.totalTpm / totalTpm : 0;
            const ptuAllocation = Math.round(totalPtus * tpmShare);
            const monthlyCost = costs.monthly1Year * tpmShare;
            const annualCost = monthlyCost * 12;

            return {
                name: workload.name,
                tpmShare: (tpmShare * 100).toFixed(1) + '%',
                ptuAllocation,
                monthlyCost,
                annualCost,
                costCenter: '',  // To be filled by user
                owner: ''        // To be filled by user
            };
        });
    }
};
