/**
 * Excel Export Module
 * Generates Excel workbooks using SheetJS (xlsx)
 */

const ExcelExport = {
    /**
     * Export current state to Excel
     * @param {Object} state - Application state
     */
    export(state) {
        // Check if XLSX is available
        if (typeof XLSX === 'undefined') {
            alert('Excel export library not loaded. Please ensure SheetJS is included.');
            console.error('XLSX library not found. Include it via: <script src="js/lib/xlsx.full.min.js"></script>');
            return;
        }

        // Create workbook
        const wb = XLSX.utils.book_new();

        // Create each sheet
        this.addDashboardSheet(wb, state);
        this.addConfigurationSheet(wb, state);
        this.addWorkloadsSheet(wb, state);
        this.addPtuRatesSheet(wb);
        this.addCapacitySummarySheet(wb, state);
        this.addCostAnalysisSheet(wb, state);
        this.addSpilloverSheet(wb, state);
        this.addChargebackSheet(wb, state);

        // Save file
        const filename = `PTU_Calculator_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, filename);
        console.log(`Excel exported: ${filename}`);
    },

    /**
     * Add Dashboard sheet
     */
    addDashboardSheet(wb, state) {
        const ptuCosts = CostCalculator.calculatePtuCosts(state.calculated.finalPtuRequired, state.config);

        const data = [
            ['Azure OpenAI PTU Calculator'],
            ['Enterprise Capacity Planning Framework'],
            [`Generated: ${new Date().toLocaleDateString()}`],
            [],
            ['EXECUTIVE SUMMARY'],
            ['Metric', 'Value', 'Unit'],
            ['Total PTUs Required', state.calculated.finalPtuRequired, 'PTUs'],
            ['Total Monthly Cost (Hourly)', ptuCosts.monthlyHourly, 'USD'],
            ['Total Monthly Cost (1-Year Reserved)', ptuCosts.monthly1Year, 'USD'],
            ['Annual Savings (1-Year)', ptuCosts.savings1Year, 'USD'],
            ['Applications Configured', state.workloads.length, 'Apps'],
            ['Target PTU Utilization', state.config.targetUtilization, '%']
        ];

        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = [{ wch: 35 }, { wch: 20 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Dashboard');
    },

    /**
     * Add Configuration sheet
     */
    addConfigurationSheet(wb, state) {
        const data = [
            ['Global Configuration'],
            [],
            ['PRICING & REGION SETTINGS'],
            ['Parameter', 'Value', 'Description'],
            ['Deployment Type', state.config.deploymentType, 'Determines minimum PTUs and data residency'],
            ['Primary Region', state.config.primaryRegion, 'Azure region for primary deployment'],
            ['Secondary Region', state.config.secondaryRegion, 'Azure region for failover/spillover'],
            ['Hourly PTU Rate ($/PTU/hr)', state.config.hourlyRate, 'Current rate from Azure pricing'],
            ['1-Year Reservation Discount', state.config.discount1Year / 100, 'Discount percentage for annual commitment'],
            ['3-Year Reservation Discount', state.config.discount3Year / 100, 'Discount percentage for 3-year commitment'],
            [],
            ['CAPACITY PLANNING PARAMETERS'],
            ['Parameter', 'Value', 'Description'],
            ['Target PTU Utilization %', state.config.targetUtilization / 100, 'Target utilization before spillover'],
            ['Buffer Percentage', state.config.bufferPercentage / 100, 'Additional capacity buffer for variance'],
            ['Peak Traffic Multiplier', state.config.peakMultiplier, 'Multiplier for expected peak vs average'],
            ['Hours per Month', state.config.hoursPerMonth, 'Standard hours for monthly calculations']
        ];

        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = [{ wch: 30 }, { wch: 25 }, { wch: 50 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Configuration');
    },

    /**
     * Add Workloads sheet
     */
    addWorkloadsSheet(wb, state) {
        const data = [
            ['Workload Input Configuration'],
            [],
            ['APPLICATION WORKLOADS'],
            [],
            ['Application Name', 'Model', 'Avg Input Tokens', 'Avg Output Tokens', 'Peak RPM', 'Daily Hours', 'Priority']
        ];

        state.workloads.forEach(w => {
            data.push([w.name, w.model, w.inputTokens, w.outputTokens, w.peakRpm, w.dailyHours, w.priority]);
        });

        data.push([]);
        data.push(['CALCULATED METRICS']);
        data.push(['Application', 'Input TPM', 'Output TPM', 'Total TPM', 'Est. PTUs']);

        state.calculated.workloadBreakdown.forEach(w => {
            data.push([w.name, w.inputTpm, w.outputTpm, w.totalTpm, w.estimatedPtus]);
        });

        data.push(['TOTALS', state.calculated.totalInputTpm, state.calculated.totalOutputTpm,
                   state.calculated.totalTpm, state.calculated.basePtuRequired]);

        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 10 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Workload Inputs');
    },

    /**
     * Add PTU Rates sheet
     */
    addPtuRatesSheet(wb) {
        const data = [
            ['PTU Conversion Rates'],
            ['Last Updated: February 2026'],
            [],
            ['MODEL-SPECIFIC RATES'],
            ['Model', 'Input TPM/PTU', 'Output TPM/PTU', 'Output Ratio', 'Method']
        ];

        getModelList().forEach(modelName => {
            const rate = getModelRate(modelName);
            data.push([
                rate.name,
                rate.inputTpmPerPtu,
                rate.outputTpmPerPtu,
                rate.outputRatio || '-',
                rate.method
            ]);
        });

        data.push([]);
        data.push(['MINIMUM PTU INCREMENTS']);
        data.push(['Deployment Type', 'Minimum PTUs', 'Increment Size', 'Notes']);
        data.push(['Global Provisioned', 15, 5, 'Lowest minimum for cost-effective testing']);
        data.push(['Data Zone Provisioned', 50, 50, 'Higher minimum, regional data residency']);
        data.push(['Regional Provisioned', 100, 100, 'Highest minimum, strict data sovereignty']);

        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 45 }];
        XLSX.utils.book_append_sheet(wb, ws, 'PTU Rates');
    },

    /**
     * Add Capacity Summary sheet
     */
    addCapacitySummarySheet(wb, state) {
        const deploymentConfig = getDeploymentConfig(state.config.deploymentType);

        const data = [
            ['PTU Capacity Summary'],
            [],
            ['CAPACITY CALCULATION'],
            ['Metric', 'Value', 'Unit'],
            ['Total Input TPM', state.calculated.totalInputTpm, 'tokens/min'],
            ['Total Output TPM', state.calculated.totalOutputTpm, 'tokens/min'],
            ['Total Combined TPM', state.calculated.totalTpm, 'tokens/min'],
            [],
            ['Base PTU Requirement', state.calculated.basePtuRequired, 'PTUs'],
            ['Buffer Allocation', state.calculated.bufferPtus, 'PTUs'],
            ['Peak Traffic Adjustment', state.calculated.peakPtus, 'PTUs'],
            [],
            ['Minimum Increment', deploymentConfig.incrementSize, 'PTUs'],
            ['TOTAL PTUs REQUIRED', state.calculated.finalPtuRequired, 'PTUs'],
            [],
            ['UTILIZATION PROJECTIONS'],
            ['Scenario', 'PTUs Deployed', 'Expected Utilization', 'Spillover %']
        ];

        const projections = PtuCalculator.calculateUtilizationProjections(state.calculated.basePtuRequired, state.config);
        projections.forEach(p => {
            data.push([p.name, p.ptus, p.expectedUtilization, p.spilloverPercent]);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Capacity Summary');
    },

    /**
     * Add Cost Analysis sheet
     */
    addCostAnalysisSheet(wb, state) {
        const ptuCosts = CostCalculator.calculatePtuCosts(state.calculated.finalPtuRequired, state.config);
        const paygoCosts = CostCalculator.calculatePaygoCosts(state.workloads, state.config.hoursPerMonth);
        const comparison = CostCalculator.compareCosts(ptuCosts, paygoCosts);

        const data = [
            ['Cost Analysis & Comparison'],
            [],
            ['PTU COST CALCULATIONS'],
            ['Metric', 'Value', 'Unit'],
            ['PTUs Required', ptuCosts.ptus, 'PTUs'],
            ['Hourly Rate', ptuCosts.hourlyRate, '$/PTU/hr'],
            [],
            ['Monthly Cost (Hourly Billing)', ptuCosts.monthlyHourly, 'USD'],
            ['Annual Cost (Hourly Billing)', ptuCosts.annualHourly, 'USD'],
            [],
            ['1-Year Reserved Monthly', ptuCosts.monthly1Year, 'USD'],
            ['1-Year Reserved Annual', ptuCosts.annual1Year, 'USD'],
            [],
            ['3-Year Reserved Monthly', ptuCosts.monthly3Year, 'USD'],
            ['3-Year Reserved Annual', ptuCosts.annual3Year, 'USD'],
            [],
            ['Annual Savings (1-Year)', ptuCosts.savings1Year, 'USD'],
            ['Annual Savings (3-Year)', ptuCosts.savings3Year, 'USD'],
            [],
            ['PAYGO COMPARISON'],
            ['Metric', 'Value', 'Unit'],
            ['Monthly Input Tokens', paygoCosts.inputTokens, 'tokens'],
            ['Monthly Output Tokens', paygoCosts.outputTokens, 'tokens'],
            ['PAYGO Input Cost', paygoCosts.inputCost, 'USD'],
            ['PAYGO Output Cost', paygoCosts.outputCost, 'USD'],
            ['Total PAYGO Monthly', paygoCosts.totalMonthly, 'USD'],
            [],
            ['PTU vs PAYGO Difference', comparison.difference, 'USD/month'],
            ['PTU Savings %', comparison.savingsPercent, '%']
        ];

        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Cost Analysis');
    },

    /**
     * Add Spillover Planner sheet
     */
    addSpilloverSheet(wb, state) {
        const scenarios = SpilloverCalculator.calculateScenarios(
            state.calculated.finalPtuRequired,
            state.config,
            state.workloads
        );

        const data = [
            ['Spillover Strategy Planner'],
            [],
            ['SPILLOVER COST SCENARIOS'],
            ['Scenario', 'PTU %', 'PTUs', 'PTU Cost', 'Spillover Cost', 'Total Cost', 'vs 100% PTU']
        ];

        scenarios.forEach(s => {
            data.push([s.name, s.ptuPercent, s.ptus, s.ptuCost, s.spilloverCost, s.totalCost, s.vsPtuBaseline + '%']);
        });

        data.push([]);
        data.push(['APIM CONFIGURATION NOTES']);
        data.push(['• Configure PTU endpoint as Priority 1 in APIM backend pool']);
        data.push(['• Configure same-region PAYGO as Priority 2 (spillover)']);
        data.push(['• Configure secondary region PAYGO as Priority 3 (DR)']);
        data.push(['• Enable circuit breaker to auto-failover on 429 errors']);
        data.push(['• Set retry policy with exponential backoff']);

        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = [{ wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Spillover Planner');
    },

    /**
     * Add Chargeback sheet
     */
    addChargebackSheet(wb, state) {
        const ptuCosts = CostCalculator.calculatePtuCosts(state.calculated.finalPtuRequired, state.config);
        const chargeback = SpilloverCalculator.calculateChargeback(
            state.calculated.workloadBreakdown,
            state.calculated.finalPtuRequired,
            ptuCosts
        );

        const data = [
            ['Cost Allocation & Chargeback'],
            [],
            ['APPLICATION COST ALLOCATION'],
            ['Application', 'TPM Share %', 'PTU Allocation', 'Monthly Cost', 'Annual Cost', 'Cost Center', 'Owner']
        ];

        chargeback.forEach(c => {
            data.push([c.name, c.tpmShare, c.ptuAllocation, c.monthlyCost, c.annualCost, '', '']);
        });

        // Totals
        const totalMonthly = chargeback.reduce((sum, c) => sum + c.monthlyCost, 0);
        const totalAnnual = chargeback.reduce((sum, c) => sum + c.annualCost, 0);
        const totalPtus = chargeback.reduce((sum, c) => sum + c.ptuAllocation, 0);

        data.push(['TOTALS', '100%', totalPtus, totalMonthly, totalAnnual, '', '']);

        data.push([]);
        data.push(['CHARGEBACK NOTES']);
        data.push(['• Costs allocated proportionally based on TPM consumption']);
        data.push(['• Update Cost Center and Owner fields for your organization']);
        data.push(['• Export to finance systems via APIM subscription key metrics']);

        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Chargeback Model');
    }
};
