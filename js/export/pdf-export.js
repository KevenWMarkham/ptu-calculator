/**
 * PDF Export Module
 * Generates PDF reports using jsPDF
 */

const PdfExport = {
    /**
     * Export current state to PDF
     * @param {Object} state - Application state
     */
    export(state) {
        // Check if jsPDF is available
        if (typeof jspdf === 'undefined' && typeof jsPDF === 'undefined') {
            alert('PDF export library not loaded. Please ensure jsPDF is included.');
            console.error('jsPDF library not found. Include it via: <script src="js/lib/jspdf.umd.min.js"></script>');
            return;
        }

        const { jsPDF } = window.jspdf || window;
        const doc = new jsPDF();

        // Colors
        const deloitteGreen = [134, 188, 37];
        const deloitteBlack = [0, 0, 0];
        const gray = [100, 100, 100];

        let yPos = 20;

        // Header
        doc.setFillColor(...deloitteBlack);
        doc.rect(0, 0, 210, 35, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('Deloitte', 15, 18);
        doc.setTextColor(...deloitteGreen);
        doc.text('.', 52, 18);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text('Azure OpenAI PTU Calculator', 15, 28);

        yPos = 45;

        // Get project name
        const projectName = typeof ProjectManager !== 'undefined'
            ? ProjectManager.getCurrentProject().name
            : 'PTU Analysis';

        // Report Title
        doc.setTextColor(...deloitteBlack);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('PTU Capacity Analysis Report', 15, yPos);

        yPos += 8;
        doc.setFontSize(12);
        doc.setTextColor(...deloitteGreen);
        doc.text(projectName, 15, yPos);

        yPos += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...gray);
        doc.text(`Generated: ${new Date().toLocaleDateString()} | Deployment Type: ${state.config.deploymentType}`, 15, yPos);

        yPos += 15;

        // Executive Summary Box
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(15, yPos, 180, 45, 3, 3, 'F');

        doc.setTextColor(...deloitteBlack);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Executive Summary', 20, yPos + 10);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        const ptuCosts = CostCalculator.calculatePtuCosts(state.calculated.finalPtuRequired, state.config);

        const summaryData = [
            [`Total PTUs Required: ${state.calculated.finalPtuRequired}`, `Applications: ${state.workloads.length}`],
            [`Monthly Cost (Hourly): $${CostCalculator.formatCurrency(ptuCosts.monthlyHourly)}`, `Monthly Cost (1-Year): $${CostCalculator.formatCurrency(ptuCosts.monthly1Year)}`],
            [`Annual Savings (1-Year): $${CostCalculator.formatCurrency(ptuCosts.savings1Year)}`, `Target Utilization: ${state.config.targetUtilization}%`]
        ];

        let summaryY = yPos + 18;
        summaryData.forEach(row => {
            doc.text(row[0], 20, summaryY);
            doc.text(row[1], 110, summaryY);
            summaryY += 8;
        });

        yPos += 55;

        // Configuration Section
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...deloitteGreen);
        doc.text('Configuration', 15, yPos);

        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...deloitteBlack);

        const configItems = [
            `Primary Region: ${state.config.primaryRegion}`,
            `Secondary Region: ${state.config.secondaryRegion}`,
            `Hourly PTU Rate: $${state.config.hourlyRate}/PTU/hr`,
            `1-Year Discount: ${state.config.discount1Year}%`,
            `3-Year Discount: ${state.config.discount3Year}%`,
            `Buffer: ${state.config.bufferPercentage}%`,
            `Peak Multiplier: ${state.config.peakMultiplier}x`
        ];

        configItems.forEach((item, idx) => {
            const col = idx < 4 ? 0 : 1;
            const row = idx < 4 ? idx : idx - 4;
            doc.text(item, 15 + col * 95, yPos + row * 6);
        });

        yPos += 30;

        // Workloads Table
        if (state.workloads.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...deloitteGreen);
            doc.text('Workload Analysis', 15, yPos);

            yPos += 8;

            // Table header
            doc.setFillColor(...deloitteBlack);
            doc.rect(15, yPos, 180, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');

            const headers = ['Application', 'Model', 'Input TPM', 'Output TPM', 'Est. PTUs'];
            const colWidths = [50, 40, 30, 30, 30];
            let xPos = 17;
            headers.forEach((h, i) => {
                doc.text(h, xPos, yPos + 5.5);
                xPos += colWidths[i];
            });

            yPos += 8;
            doc.setTextColor(...deloitteBlack);
            doc.setFont('helvetica', 'normal');

            state.calculated.workloadBreakdown.forEach((w, idx) => {
                if (idx % 2 === 0) {
                    doc.setFillColor(250, 250, 250);
                    doc.rect(15, yPos, 180, 7, 'F');
                }

                xPos = 17;
                const rowData = [
                    w.name.substring(0, 20),
                    w.model.substring(0, 15),
                    w.inputTpm.toLocaleString(),
                    w.outputTpm.toLocaleString(),
                    w.estimatedPtus.toString()
                ];

                rowData.forEach((val, i) => {
                    doc.text(val, xPos, yPos + 5);
                    xPos += colWidths[i];
                });

                yPos += 7;
            });

            // Totals row
            doc.setFillColor(230, 230, 230);
            doc.rect(15, yPos, 180, 7, 'F');
            doc.setFont('helvetica', 'bold');
            xPos = 17;
            const totals = [
                'TOTAL',
                '',
                state.calculated.totalInputTpm.toLocaleString(),
                state.calculated.totalOutputTpm.toLocaleString(),
                state.calculated.basePtuRequired.toString()
            ];
            totals.forEach((val, i) => {
                doc.text(val, xPos, yPos + 5);
                xPos += colWidths[i];
            });

            yPos += 15;
        }

        // Cost Comparison
        if (yPos > 230) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...deloitteGreen);
        doc.text('Cost Analysis', 15, yPos);

        yPos += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...deloitteBlack);

        const paygoCosts = CostCalculator.calculatePaygoCosts(state.workloads, state.config.hoursPerMonth);
        const comparison = CostCalculator.compareCosts(ptuCosts, paygoCosts);

        const costData = [
            ['PTU Monthly (Hourly):', `$${CostCalculator.formatCurrency(ptuCosts.monthlyHourly)}`],
            ['PTU Monthly (1-Year):', `$${CostCalculator.formatCurrency(ptuCosts.monthly1Year)}`],
            ['PTU Monthly (3-Year):', `$${CostCalculator.formatCurrency(ptuCosts.monthly3Year)}`],
            ['PAYGO Equivalent:', `$${CostCalculator.formatCurrency(paygoCosts.totalMonthly)}`],
            ['Annual Savings (1-Year):', `$${CostCalculator.formatCurrency(ptuCosts.savings1Year)}`],
            ['Annual Savings (3-Year):', `$${CostCalculator.formatCurrency(ptuCosts.savings3Year)}`]
        ];

        costData.forEach((row, idx) => {
            doc.text(row[0], 15, yPos);
            doc.text(row[1], 70, yPos);
            yPos += 6;
        });

        yPos += 10;

        // Recommendation Box
        doc.setFillColor(134, 188, 37, 0.1);
        doc.setDrawColor(...deloitteGreen);
        doc.roundedRect(15, yPos, 180, 25, 3, 3, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Recommendation', 20, yPos + 8);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const recText = doc.splitTextToSize(comparison.recommendation, 170);
        doc.text(recText, 20, yPos + 15);

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(...gray);
            doc.text(
                `Azure OpenAI PTU Calculator | Deloitte Microsoft Technology & Services Practice | Page ${i} of ${pageCount}`,
                105, 290, { align: 'center' }
            );
        }

        // Save
        const filename = `PTU_Analysis_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        console.log(`PDF exported: ${filename}`);
    }
};
