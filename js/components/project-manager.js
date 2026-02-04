/**
 * Project Manager Component
 * Handles multiple client projects and demo showcase
 */

const DEMO_PROJECT = {
    id: 'demo',
    name: '📊 Demo Examples',
    isDemo: true,
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
    workloads: [
        {
            id: 1,
            name: 'Customer Support Chatbot',
            model: 'GPT-4o',
            inputTokens: 800,
            outputTokens: 400,
            peakRpm: 120,
            dailyHours: 18,
            priority: 1
        },
        {
            id: 2,
            name: 'Internal Copilot Assistant',
            model: 'gpt-4.1-mini',
            inputTokens: 1200,
            outputTokens: 600,
            peakRpm: 80,
            dailyHours: 10,
            priority: 2
        },
        {
            id: 3,
            name: 'Document Summarization',
            model: 'gpt-4.1',
            inputTokens: 4000,
            outputTokens: 1000,
            peakRpm: 25,
            dailyHours: 8,
            priority: 2
        },
        {
            id: 4,
            name: 'Code Review Assistant',
            model: 'GPT-4o',
            inputTokens: 2500,
            outputTokens: 1500,
            peakRpm: 40,
            dailyHours: 12,
            priority: 1
        },
        {
            id: 5,
            name: 'Data Analysis Agent',
            model: 'o1-mini',
            inputTokens: 3000,
            outputTokens: 2000,
            peakRpm: 15,
            dailyHours: 6,
            priority: 3
        }
    ]
};

const ProjectManager = {
    currentProjectId: 'demo',
    projects: {},

    /**
     * Initialize project manager
     */
    init() {
        this.loadProjects();
        this.bindEvents();
        this.renderProjectDropdown();
        this.switchProject(this.currentProjectId);
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Project dropdown change
        document.getElementById('projectSelect').addEventListener('change', (e) => {
            this.switchProject(e.target.value);
        });

        // New project button
        document.getElementById('newProjectBtn').addEventListener('click', () => {
            this.openProjectModal();
        });

        // Delete project button
        document.getElementById('deleteProjectBtn').addEventListener('click', () => {
            this.deleteCurrentProject();
        });

        // Create from demo banner button
        document.getElementById('createFromDemo').addEventListener('click', () => {
            this.openProjectModal('copy-demo');
        });

        // Project modal controls
        document.getElementById('projectModalClose').addEventListener('click', () => {
            this.closeProjectModal();
        });

        document.getElementById('projectModalCancel').addEventListener('click', () => {
            this.closeProjectModal();
        });

        document.getElementById('projectModalSave').addEventListener('click', () => {
            this.createProject();
        });

        // Close modal on backdrop click
        document.getElementById('projectModal').addEventListener('click', (e) => {
            if (e.target.id === 'projectModal') {
                this.closeProjectModal();
            }
        });
    },

    /**
     * Load projects from localStorage
     */
    loadProjects() {
        // Always include demo project
        this.projects = { demo: DEMO_PROJECT };

        try {
            const saved = localStorage.getItem('ptuCalculatorProjects');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge saved projects with demo
                this.projects = { demo: DEMO_PROJECT, ...parsed };
            }

            // Load last active project
            const lastProject = localStorage.getItem('ptuCalculatorActiveProject');
            if (lastProject && this.projects[lastProject]) {
                this.currentProjectId = lastProject;
            }
        } catch (e) {
            console.warn('Could not load projects from localStorage:', e);
        }
    },

    /**
     * Save projects to localStorage
     */
    saveProjects() {
        try {
            // Save all projects except demo
            const toSave = {};
            Object.keys(this.projects).forEach(id => {
                if (id !== 'demo') {
                    toSave[id] = this.projects[id];
                }
            });
            localStorage.setItem('ptuCalculatorProjects', JSON.stringify(toSave));
            localStorage.setItem('ptuCalculatorActiveProject', this.currentProjectId);
        } catch (e) {
            console.warn('Could not save projects to localStorage:', e);
        }
    },

    /**
     * Render project dropdown
     */
    renderProjectDropdown() {
        const select = document.getElementById('projectSelect');
        select.innerHTML = Object.keys(this.projects).map(id => {
            const project = this.projects[id];
            const icon = project.isDemo ? '📊' : '📁';
            return `<option value="${id}">${icon} ${project.name}</option>`;
        }).join('');

        select.value = this.currentProjectId;
    },

    /**
     * Switch to a different project
     */
    switchProject(projectId) {
        const project = this.projects[projectId];
        if (!project) return;

        this.currentProjectId = projectId;

        // Update app state
        appState.config = { ...project.config };
        appState.workloads = JSON.parse(JSON.stringify(project.workloads)); // Deep copy

        // Update config UI
        Object.keys(project.config).forEach(key => {
            const el = document.getElementById(key);
            if (el) {
                el.value = project.config[key];
                // Disable inputs in demo mode
                el.disabled = project.isDemo;
            }
        });

        // Update demo banner visibility
        const demoBanner = document.getElementById('demoBanner');
        demoBanner.classList.toggle('active', project.isDemo);

        // Update delete button state
        document.getElementById('deleteProjectBtn').disabled = project.isDemo;
        document.getElementById('deleteProjectBtn').style.opacity = project.isDemo ? '0.5' : '1';

        // Re-render workload table
        WorkloadTable.render();

        // Disable add/edit in demo mode
        const addBtn = document.getElementById('addWorkloadBtn');
        if (addBtn) {
            addBtn.disabled = project.isDemo;
            addBtn.style.opacity = project.isDemo ? '0.5' : '1';
        }

        // Recalculate
        App.recalculate();

        // Save active project
        this.saveProjects();

        console.log(`Switched to project: ${project.name}`);
    },

    /**
     * Open project creation modal
     */
    openProjectModal(defaultInit = 'empty') {
        const modal = document.getElementById('projectModal');
        document.getElementById('projectName').value = '';

        // Set default radio
        const radios = document.querySelectorAll('input[name="projectInit"]');
        radios.forEach(radio => {
            radio.checked = radio.value === defaultInit;
        });

        modal.classList.add('active');
        document.getElementById('projectName').focus();
    },

    /**
     * Close project modal
     */
    closeProjectModal() {
        document.getElementById('projectModal').classList.remove('active');
    },

    /**
     * Create a new project
     */
    createProject() {
        const name = document.getElementById('projectName').value.trim();
        if (!name) {
            alert('Please enter a project name.');
            return;
        }

        const initType = document.querySelector('input[name="projectInit"]:checked').value;
        const projectId = 'project_' + Date.now();

        let newProject = {
            id: projectId,
            name: name,
            isDemo: false,
            config: { ...DEMO_PROJECT.config },
            workloads: []
        };

        // Initialize based on selection
        if (initType === 'copy-demo') {
            newProject.workloads = JSON.parse(JSON.stringify(DEMO_PROJECT.workloads));
            // Update IDs to avoid conflicts
            newProject.workloads.forEach((w, i) => {
                w.id = Date.now() + i;
            });
        } else if (initType === 'copy-current' && this.currentProjectId !== 'demo') {
            const current = this.projects[this.currentProjectId];
            newProject.config = { ...current.config };
            newProject.workloads = JSON.parse(JSON.stringify(current.workloads));
            newProject.workloads.forEach((w, i) => {
                w.id = Date.now() + i;
            });
        }

        // Add to projects
        this.projects[projectId] = newProject;

        // Save and switch
        this.saveProjects();
        this.renderProjectDropdown();
        this.switchProject(projectId);
        this.closeProjectModal();

        console.log(`Created new project: ${name}`);
    },

    /**
     * Delete current project
     */
    deleteCurrentProject() {
        if (this.currentProjectId === 'demo') {
            alert('Cannot delete the demo project.');
            return;
        }

        const project = this.projects[this.currentProjectId];
        if (!confirm(`Are you sure you want to delete "${project.name}"? This cannot be undone.`)) {
            return;
        }

        delete this.projects[this.currentProjectId];
        this.saveProjects();
        this.renderProjectDropdown();
        this.switchProject('demo');

        console.log(`Deleted project: ${project.name}`);
    },

    /**
     * Save current project state (called after edits)
     */
    saveCurrentProject() {
        if (this.currentProjectId === 'demo') return;

        const project = this.projects[this.currentProjectId];
        if (project) {
            project.config = { ...appState.config };
            project.workloads = JSON.parse(JSON.stringify(appState.workloads));
            this.saveProjects();
        }
    },

    /**
     * Get current project info
     */
    getCurrentProject() {
        return this.projects[this.currentProjectId];
    },

    /**
     * Check if in demo mode
     */
    isDemo() {
        return this.currentProjectId === 'demo';
    }
};
