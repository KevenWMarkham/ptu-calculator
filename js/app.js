/**
 * Azure OpenAI PTU Calculator
 * Main Application Controller
 */

// Global application state
const appState = {
    config: {
        deploymentType: 'Global Provisioned',
        primaryRegion: 'East US 2',
        secondaryRegion: 'West US 2',
        hourlyRate: 0.0396,
        discount1Year: 20,
        discount3Year: 40,
        targetUtilization: 85,
        bufferPercentage: 15,
        peakMultiplier: 1.2,
        hoursPerMonth: 730
    },
    workloads: [],
    calculated: {
        totalInputTpm: 0,
        totalOutputTpm: 0,
        totalTpm: 0,
        basePtuRequired: 0,
        finalPtuRequired: 0,
        workloadBreakdown: []
    }
};

/**
 * Main Application Controller
 */
const App = {
    /**
     * Initialize the application
     */
    init() {
        console.log('Initializing PTU Calculator...');

        // Initialize components
        TabsComponent.init();
        WorkloadTable.init();

        // Bind configuration inputs
        this.bindConfigInputs();

        // Bind spillover slider
        this.bindSpilloverSlider();

        // Bind export buttons
        this.bindExportButtons();

        // Render initial state
        this.renderPtuRatesTable();

        // Initialize project manager (loads demo or last project)
        ProjectManager.init();

        console.log('PTU Calculator initialized.');
    },

    /**
     * Bind configuration input changes
     */
    bindConfigInputs() {
        const configInputs = [
            'deploymentType', 'primaryRegion', 'secondaryRegion',
            'hourlyRate', 'discount1Year', 'discount3Year',
            'targetUtilization', 'bufferPercentage', 'peakMultiplier'
        ];

        configInputs.forEach(inputId => {
            const element = document.getElementById(inputId);
            if (element) {
                element.addEventListener('change', (e) => {
                    let value = e.target.value;

                    // Convert numeric fields
                    if (['hourlyRate', 'discount1Year', 'discount3Year', 'targetUtilization',
                         'bufferPercentage', 'peakMultiplier'].includes(inputId)) {
                        value = parseFloat(value) || 0;
                    }

                    appState.config[inputId] = value;
                    this.recalculate();
                    this.saveState();
                });
            }
        });
    },

    /**
     * Bind spillover slider
     */
    bindSpilloverSlider() {
        const slider = document.getElementById('spilloverBase');
        const valueDisplay = document.getElementById('spilloverBaseValue');
        const spilloverDisplay = document.getElementById('expectedSpillover');

        if (slider) {
            slider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                valueDisplay.textContent = value + '%';
                spilloverDisplay.textContent = (100 - value) + '%';
            });

            slider.addEventListener('change', () => {
                this.renderSpilloverTable();
            });
        }
    },

    /**
     * Bind export buttons
     */
    bindExportButtons() {
        const exportBtn = document.getElementById('exportBtn');
        const exportMenu = document.getElementById('exportMenu');

        // Toggle dropdown on click
        exportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            exportMenu.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            exportMenu.classList.remove('show');
        });

        // Prevent dropdown from closing when clicking inside it
        exportMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        document.getElementById('exportPdf').addEventListener('click', () => {
            exportMenu.classList.remove('show');
            PdfExport.export(appState);
        });

        document.getElementById('exportExcel').addEventListener('click', () => {
            exportMenu.classList.remove('show');
            ExcelExport.export(appState);
        });
    },

    /**
     * Recalculate all values
     */
    recalculate() {
        // Calculate PTUs
        const ptuResults = PtuCalculator.calculateTotal(appState.workloads, appState.config);
        appState.calculated = ptuResults;

        // Calculate costs
        const ptuCosts = CostCalculator.calculatePtuCosts(ptuResults.finalPtuRequired, appState.config);
        const paygoCosts = CostCalculator.calculatePaygoCosts(appState.workloads, appState.config.hoursPerMonth);
        const costComparison = CostCalculator.compareCosts(ptuCosts, paygoCosts);

        // Update all UI elements
        this.updateDashboard(ptuResults, ptuCosts, costComparison);
        this.updateCapacitySummary(ptuResults);
        this.updateCostAnalysis(ptuCosts, paygoCosts, costComparison);
        this.renderSpilloverTable();
        this.renderChargebackTable();

        // Update workload calculated metrics
        WorkloadTable.renderCalculatedMetrics(ptuResults.workloadBreakdown);

        // Save state
        this.saveState();
    },

    /**
     * Update dashboard metrics
     */
    updateDashboard(ptuResults, ptuCosts, costComparison) {
        document.getElementById('dash-total-ptus').textContent = ptuResults.finalPtuRequired.toLocaleString();
        document.getElementById('dash-monthly-hourly').textContent = '$' + CostCalculator.formatCurrency(ptuCosts.monthlyHourly);
        document.getElementById('dash-monthly-reserved').textContent = '$' + CostCalculator.formatCurrency(ptuCosts.monthly1Year);
        document.getElementById('dash-annual-savings').textContent = '$' + CostCalculator.formatCurrency(ptuCosts.savings1Year);
        document.getElementById('dash-app-count').textContent = appState.workloads.length;
        document.getElementById('dash-utilization').textContent = appState.config.targetUtilization + '%';

        // Update workload summary
        this.updateDashboardWorkloadSummary();

        // Update totals in workload table
        document.getElementById('totalInputTpm').textContent = ptuResults.totalInputTpm.toLocaleString();
        document.getElementById('totalOutputTpm').textContent = ptuResults.totalOutputTpm.toLocaleString();
        document.getElementById('totalTpm').textContent = ptuResults.totalTpm.toLocaleString();
        document.getElementById('totalEstPtus').textContent = ptuResults.basePtuRequired;
    },

    /**
     * Update dashboard workload summary table
     */
    updateDashboardWorkloadSummary() {
        const tbody = document.querySelector('#dash-workload-summary tbody');

        if (appState.workloads.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="3">No workloads configured. Go to Workload Inputs to add applications.</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = appState.calculated.workloadBreakdown.map(w => `
            <tr>
                <td>${w.name}</td>
                <td>${w.model}</td>
                <td class="text-right">${w.estimatedPtus}</td>
            </tr>
        `).join('');
    },

    /**
     * Update capacity summary tab
     */
    updateCapacitySummary(ptuResults) {
        document.getElementById('cap-input-tpm').textContent = ptuResults.totalInputTpm.toLocaleString();
        document.getElementById('cap-output-tpm').textContent = ptuResults.totalOutputTpm.toLocaleString();
        document.getElementById('cap-total-tpm').textContent = ptuResults.totalTpm.toLocaleString();
        document.getElementById('cap-base-ptu').textContent = ptuResults.basePtuRequired;
        document.getElementById('cap-buffer-ptu').textContent = ptuResults.bufferPtus;
        document.getElementById('cap-peak-ptu').textContent = ptuResults.peakPtus;
        document.getElementById('cap-min-increment').textContent = ptuResults.minimumIncrement || 15;
        document.getElementById('cap-total-ptu').textContent = ptuResults.finalPtuRequired;

        // Update utilization projections
        const projections = PtuCalculator.calculateUtilizationProjections(ptuResults.basePtuRequired, appState.config);
        document.getElementById('util-100-ptus').textContent = projections[0].ptus;
        document.getElementById('util-100-pct').textContent = projections[0].expectedUtilization;
        document.getElementById('util-90-ptus').textContent = projections[1].ptus;
        document.getElementById('util-90-pct').textContent = projections[1].expectedUtilization;
        document.getElementById('util-80-ptus').textContent = projections[2].ptus;
        document.getElementById('util-80-pct').textContent = projections[2].expectedUtilization;
    },

    /**
     * Update cost analysis tab
     */
    updateCostAnalysis(ptuCosts, paygoCosts, costComparison) {
        // PTU costs
        document.getElementById('cost-ptus').textContent = ptuCosts.ptus;
        document.getElementById('cost-hourly-rate').textContent = '$' + ptuCosts.hourlyRate;
        document.getElementById('cost-monthly-hourly').textContent = '$' + CostCalculator.formatCurrency(ptuCosts.monthlyHourly);
        document.getElementById('cost-annual-hourly').textContent = '$' + CostCalculator.formatCurrency(ptuCosts.annualHourly);
        document.getElementById('cost-monthly-1yr').textContent = '$' + CostCalculator.formatCurrency(ptuCosts.monthly1Year);
        document.getElementById('cost-annual-1yr').textContent = '$' + CostCalculator.formatCurrency(ptuCosts.annual1Year);
        document.getElementById('cost-monthly-3yr').textContent = '$' + CostCalculator.formatCurrency(ptuCosts.monthly3Year);
        document.getElementById('cost-annual-3yr').textContent = '$' + CostCalculator.formatCurrency(ptuCosts.annual3Year);
        document.getElementById('cost-savings-1yr').textContent = '$' + CostCalculator.formatCurrency(ptuCosts.savings1Year);
        document.getElementById('cost-savings-3yr').textContent = '$' + CostCalculator.formatCurrency(ptuCosts.savings3Year);

        // PAYGO costs
        document.getElementById('paygo-input-tokens').textContent = paygoCosts.inputTokens.toLocaleString();
        document.getElementById('paygo-output-tokens').textContent = paygoCosts.outputTokens.toLocaleString();
        document.getElementById('paygo-input-cost').textContent = '$' + CostCalculator.formatCurrency(paygoCosts.inputCost);
        document.getElementById('paygo-output-cost').textContent = '$' + CostCalculator.formatCurrency(paygoCosts.outputCost);
        document.getElementById('paygo-total').textContent = '$' + CostCalculator.formatCurrency(paygoCosts.totalMonthly);

        // Comparison
        const diffPrefix = costComparison.difference >= 0 ? '+' : '';
        document.getElementById('paygo-difference').textContent = diffPrefix + '$' + CostCalculator.formatCurrency(costComparison.difference);
        document.getElementById('paygo-savings-pct').textContent = costComparison.savingsPercent + '%';

        // Recommendation
        document.getElementById('costRecommendationText').textContent = costComparison.recommendation;
    },

    /**
     * Render PTU rates reference table
     */
    renderPtuRatesTable() {
        const tbody = document.getElementById('ptuRatesBody');
        const models = getModelList();

        tbody.innerHTML = models.map(modelName => {
            const rate = getModelRate(modelName);
            const ratioDisplay = rate.outputRatio ? `${rate.outputRatio}:1` : '-';
            const methodDisplay = rate.method.charAt(0).toUpperCase() + rate.method.slice(1);

            return `
                <tr>
                    <td><strong>${rate.name}</strong></td>
                    <td class="text-right font-mono">${rate.inputTpmPerPtu.toLocaleString()}</td>
                    <td class="text-right font-mono">${rate.outputTpmPerPtu.toLocaleString()}</td>
                    <td class="text-center">${ratioDisplay}</td>
                    <td>${methodDisplay}</td>
                </tr>
            `;
        }).join('');
    },

    /**
     * Render spillover scenarios table
     */
    renderSpilloverTable() {
        const tbody = document.getElementById('spilloverBody');
        const scenarios = SpilloverCalculator.calculateScenarios(
            appState.calculated.finalPtuRequired,
            appState.config,
            appState.workloads
        );

        if (appState.workloads.length === 0 || appState.calculated.finalPtuRequired === 0) {
            tbody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="7">Add workloads to see spillover scenarios.</td>
                </tr>
            `;
            return;
        }

        const optimal = SpilloverCalculator.findOptimal(scenarios);

        tbody.innerHTML = scenarios.map(scenario => {
            const isOptimal = scenario.name === optimal.name;
            const vsClass = scenario.vsPtuBaseline < 0 ? 'text-success' : (scenario.vsPtuBaseline > 0 ? 'text-error' : '');
            const vsPrefix = scenario.vsPtuBaseline > 0 ? '+' : '';

            return `
                <tr class="${isOptimal ? 'highlight' : ''}">
                    <td>${scenario.name}${isOptimal ? ' ★' : ''}</td>
                    <td class="text-center">${scenario.ptuPercent}</td>
                    <td class="text-right font-mono">${scenario.ptus}</td>
                    <td class="text-right font-mono">$${CostCalculator.formatCurrency(scenario.ptuCost)}</td>
                    <td class="text-right font-mono">$${CostCalculator.formatCurrency(scenario.spilloverCost)}</td>
                    <td class="text-right font-mono"><strong>$${CostCalculator.formatCurrency(scenario.totalCost)}</strong></td>
                    <td class="text-right ${vsClass}">${vsPrefix}${scenario.vsPtuBaseline}%</td>
                </tr>
            `;
        }).join('');
    },

    /**
     * Render chargeback allocation table
     */
    renderChargebackTable() {
        const tbody = document.getElementById('chargebackBody');
        const ptuCosts = CostCalculator.calculatePtuCosts(appState.calculated.finalPtuRequired, appState.config);
        const chargeback = SpilloverCalculator.calculateChargeback(
            appState.calculated.workloadBreakdown,
            appState.calculated.finalPtuRequired,
            ptuCosts
        );

        if (chargeback.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="7">Add workloads to see chargeback allocation.</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = chargeback.map(item => `
            <tr>
                <td>${item.name}</td>
                <td class="text-right">${item.tpmShare}</td>
                <td class="text-right font-mono">${item.ptuAllocation}</td>
                <td class="text-right font-mono">$${CostCalculator.formatCurrency(item.monthlyCost)}</td>
                <td class="text-right font-mono">$${CostCalculator.formatCurrency(item.annualCost)}</td>
                <td><input type="text" class="form-control" placeholder="Enter cost center" style="width:120px"></td>
                <td><input type="text" class="form-control" placeholder="Enter owner" style="width:120px"></td>
            </tr>
        `).join('');

        // Update totals
        const totalMonthly = chargeback.reduce((sum, c) => sum + c.monthlyCost, 0);
        const totalAnnual = chargeback.reduce((sum, c) => sum + c.annualCost, 0);
        const totalPtus = chargeback.reduce((sum, c) => sum + c.ptuAllocation, 0);

        document.getElementById('cb-total-share').textContent = '100%';
        document.getElementById('cb-total-ptus').textContent = totalPtus;
        document.getElementById('cb-total-monthly').textContent = '$' + CostCalculator.formatCurrency(totalMonthly);
        document.getElementById('cb-total-annual').textContent = '$' + CostCalculator.formatCurrency(totalAnnual);
    },

    /**
     * Save state to current project
     */
    saveState() {
        // Save to project manager (handles localStorage)
        if (typeof ProjectManager !== 'undefined') {
            ProjectManager.saveCurrentProject();
        }
    },

    /**
     * Reset application state
     */
    resetState() {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            localStorage.removeItem('ptuCalculatorState');
            location.reload();
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
