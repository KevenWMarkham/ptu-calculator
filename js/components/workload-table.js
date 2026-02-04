/**
 * Workload Table Component
 * Handles workload input table and modal
 */

const WorkloadTable = {
    editingId: null,

    /**
     * Initialize workload table component
     */
    init() {
        this.bindEvents();
        this.populateModelDropdown();
        this.render();
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Add workload button
        document.getElementById('addWorkloadBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Modal controls
        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modalCancel').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modalSave').addEventListener('click', () => {
            this.saveWorkload();
        });

        // Close modal on backdrop click
        document.getElementById('workloadModal').addEventListener('click', (e) => {
            if (e.target.id === 'workloadModal') {
                this.closeModal();
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    },

    /**
     * Populate model dropdown with available models
     */
    populateModelDropdown() {
        const select = document.getElementById('wl-model');
        const models = getModelList();

        select.innerHTML = models.map(model => {
            const rate = getModelRate(model);
            const methodLabel = rate.method === 'ratio' ? `(${rate.outputRatio}:1)` : `(${rate.method})`;
            return `<option value="${model}">${model} ${methodLabel}</option>`;
        }).join('');
    },

    /**
     * Open modal for adding/editing workload
     * @param {Object} workload - Optional workload to edit
     */
    openModal(workload = null) {
        // Prevent editing in demo mode
        if (typeof ProjectManager !== 'undefined' && ProjectManager.isDemo()) {
            alert('Cannot edit workloads in Demo mode. Create a new client project to add or modify workloads.');
            return;
        }

        const modal = document.getElementById('workloadModal');
        const title = document.getElementById('modalTitle');

        if (workload) {
            // Edit mode
            this.editingId = workload.id;
            title.textContent = 'Edit Workload';
            document.getElementById('wl-name').value = workload.name;
            document.getElementById('wl-model').value = workload.model;
            document.getElementById('wl-input-tokens').value = workload.inputTokens;
            document.getElementById('wl-output-tokens').value = workload.outputTokens;
            document.getElementById('wl-peak-rpm').value = workload.peakRpm;
            document.getElementById('wl-daily-hours').value = workload.dailyHours;
            document.getElementById('wl-priority').value = workload.priority;
        } else {
            // Add mode
            this.editingId = null;
            title.textContent = 'Add Workload';
            document.getElementById('wl-name').value = '';
            document.getElementById('wl-model').value = 'GPT-4o';
            document.getElementById('wl-input-tokens').value = '800';
            document.getElementById('wl-output-tokens').value = '400';
            document.getElementById('wl-peak-rpm').value = '100';
            document.getElementById('wl-daily-hours').value = '16';
            document.getElementById('wl-priority').value = '1';
        }

        modal.classList.add('active');
        document.getElementById('wl-name').focus();
    },

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('workloadModal');
        modal.classList.remove('active');
        this.editingId = null;
    },

    /**
     * Save workload from modal
     */
    saveWorkload() {
        const name = document.getElementById('wl-name').value.trim();
        const model = document.getElementById('wl-model').value;
        const inputTokens = parseInt(document.getElementById('wl-input-tokens').value) || 0;
        const outputTokens = parseInt(document.getElementById('wl-output-tokens').value) || 0;
        const peakRpm = parseInt(document.getElementById('wl-peak-rpm').value) || 0;
        const dailyHours = parseInt(document.getElementById('wl-daily-hours').value) || 0;
        const priority = parseInt(document.getElementById('wl-priority').value) || 1;

        // Validation
        if (!name) {
            alert('Please enter an application name.');
            return;
        }

        if (inputTokens <= 0 || outputTokens <= 0) {
            alert('Please enter valid token values.');
            return;
        }

        if (peakRpm <= 0) {
            alert('Please enter a valid peak RPM.');
            return;
        }

        const workload = {
            id: this.editingId || Date.now(),
            name,
            model,
            inputTokens,
            outputTokens,
            peakRpm,
            dailyHours,
            priority
        };

        if (this.editingId) {
            // Update existing
            const index = appState.workloads.findIndex(w => w.id === this.editingId);
            if (index !== -1) {
                appState.workloads[index] = workload;
            }
        } else {
            // Add new
            appState.workloads.push(workload);
        }

        this.closeModal();
        this.render();
        App.recalculate();
    },

    /**
     * Delete a workload
     * @param {number} id - Workload ID
     */
    deleteWorkload(id) {
        // Prevent deletion in demo mode
        if (typeof ProjectManager !== 'undefined' && ProjectManager.isDemo()) {
            alert('Cannot delete workloads in Demo mode.');
            return;
        }

        if (confirm('Are you sure you want to delete this workload?')) {
            appState.workloads = appState.workloads.filter(w => w.id !== id);
            this.render();
            App.recalculate();
        }
    },

    /**
     * Render workload table
     */
    render() {
        const tbody = document.getElementById('workloadTableBody');
        const isDemo = typeof ProjectManager !== 'undefined' && ProjectManager.isDemo();

        if (appState.workloads.length === 0) {
            const emptyMessage = isDemo
                ? 'Demo project has no workloads configured.'
                : 'No workloads configured. Click "Add Workload" to get started.';
            tbody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="8">${emptyMessage}</td>
                </tr>
            `;
            return;
        }

        const disabledAttr = isDemo ? 'disabled' : '';
        const deleteBtn = isDemo
            ? '<span class="text-muted">Demo</span>'
            : `<button class="btn btn-sm btn-danger" onclick="WorkloadTable.deleteWorkload(\${workload.id})">Delete</button>`;

        tbody.innerHTML = appState.workloads.map(workload => `
            <tr data-id="${workload.id}">
                <td><input type="text" class="input-blue" value="${workload.name}" data-field="name" ${disabledAttr}></td>
                <td>
                    <select class="input-blue" data-field="model" ${disabledAttr}>
                        ${getModelList().map(m => `<option value="${m}" ${m === workload.model ? 'selected' : ''}>${m}</option>`).join('')}
                    </select>
                </td>
                <td><input type="number" class="input-blue" value="${workload.inputTokens}" data-field="inputTokens" ${disabledAttr}></td>
                <td><input type="number" class="input-blue" value="${workload.outputTokens}" data-field="outputTokens" ${disabledAttr}></td>
                <td><input type="number" class="input-blue" value="${workload.peakRpm}" data-field="peakRpm" ${disabledAttr}></td>
                <td><input type="number" class="input-blue" value="${workload.dailyHours}" data-field="dailyHours" min="1" max="24" ${disabledAttr}></td>
                <td>
                    <select class="input-blue" data-field="priority" ${disabledAttr}>
                        <option value="1" ${workload.priority === 1 ? 'selected' : ''}>1</option>
                        <option value="2" ${workload.priority === 2 ? 'selected' : ''}>2</option>
                        <option value="3" ${workload.priority === 3 ? 'selected' : ''}>3</option>
                    </select>
                </td>
                <td>
                    ${isDemo ? '<span class="text-muted">Demo</span>' : `<button class="btn btn-sm btn-danger" onclick="WorkloadTable.deleteWorkload(${workload.id})">Delete</button>`}
                </td>
            </tr>
        `).join('');

        // Bind inline edit events (only if not demo)
        if (!isDemo) {
            tbody.querySelectorAll('input, select').forEach(input => {
                input.addEventListener('change', (e) => {
                    const row = e.target.closest('tr');
                    const id = parseInt(row.dataset.id);
                    const field = e.target.dataset.field;
                    let value = e.target.value;

                    // Convert to number for numeric fields
                    if (['inputTokens', 'outputTokens', 'peakRpm', 'dailyHours', 'priority'].includes(field)) {
                        value = parseInt(value) || 0;
                    }

                    const workload = appState.workloads.find(w => w.id === id);
                    if (workload) {
                        workload[field] = value;
                        App.recalculate();
                    }
                });
            });
        }
    },

    /**
     * Render calculated metrics table
     * @param {Array} breakdown - Workload breakdown from calculator
     */
    renderCalculatedMetrics(breakdown) {
        const tbody = document.getElementById('calculatedMetricsBody');

        if (!breakdown || breakdown.length === 0) {
            tbody.innerHTML = '';
            return;
        }

        tbody.innerHTML = breakdown.map(w => `
            <tr>
                <td>${w.name}</td>
                <td class="font-mono text-right">${w.inputTpm.toLocaleString()}</td>
                <td class="font-mono text-right">${w.outputTpm.toLocaleString()}</td>
                <td class="font-mono text-right">${w.totalTpm.toLocaleString()}</td>
                <td class="font-mono text-right">${w.estimatedPtus}</td>
            </tr>
        `).join('');
    }
};
