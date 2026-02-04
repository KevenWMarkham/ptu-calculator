/**
 * PTU Rates Data
 * Azure OpenAI Model-Specific Conversion Rates
 * Last Updated: February 2026
 * Source: Microsoft Documentation
 */

const PTU_RATES = {
    // GPT-5 Series (8:1 output ratio)
    'gpt-5.2': {
        name: 'gpt-5.2',
        inputTpmPerPtu: 3400,
        outputTpmPerPtu: 425,
        outputRatio: 8,
        method: 'ratio',
        lastUpdated: 'Feb 2026'
    },
    'gpt-5': {
        name: 'gpt-5',
        inputTpmPerPtu: 4750,
        outputTpmPerPtu: 594,
        outputRatio: 8,
        method: 'ratio',
        lastUpdated: 'Feb 2026'
    },
    'gpt-5-mini': {
        name: 'gpt-5-mini',
        inputTpmPerPtu: 23750,
        outputTpmPerPtu: 2969,
        outputRatio: 8,
        method: 'ratio',
        lastUpdated: 'Feb 2026'
    },

    // GPT-4.1 Series (4:1 output ratio)
    'gpt-4.1': {
        name: 'gpt-4.1',
        inputTpmPerPtu: 3000,
        outputTpmPerPtu: 750,
        outputRatio: 4,
        method: 'ratio',
        lastUpdated: 'Feb 2026'
    },
    'gpt-4.1-mini': {
        name: 'gpt-4.1-mini',
        inputTpmPerPtu: 14900,
        outputTpmPerPtu: 3725,
        outputRatio: 4,
        method: 'ratio',
        lastUpdated: 'Feb 2026'
    },
    'gpt-4.1-nano': {
        name: 'gpt-4.1-nano',
        inputTpmPerPtu: 59400,
        outputTpmPerPtu: 14850,
        outputRatio: 4,
        method: 'ratio',
        lastUpdated: 'Feb 2026'
    },

    // GPT-4o Series (separate calculation)
    'GPT-4o': {
        name: 'GPT-4o',
        inputTpmPerPtu: 2500,
        outputTpmPerPtu: 833,
        outputRatio: null,
        method: 'separate',
        lastUpdated: 'Feb 2026'
    },
    'GPT-4o-mini': {
        name: 'GPT-4o-mini',
        inputTpmPerPtu: 37000,
        outputTpmPerPtu: 12333,
        outputRatio: null,
        method: 'separate',
        lastUpdated: 'Feb 2026'
    },

    // Legacy GPT-4 Models
    'GPT-4 Turbo': {
        name: 'GPT-4 Turbo',
        inputTpmPerPtu: 1200,
        outputTpmPerPtu: 400,
        outputRatio: null,
        method: 'legacy',
        lastUpdated: 'Feb 2026'
    },
    'GPT-4': {
        name: 'GPT-4',
        inputTpmPerPtu: 800,
        outputTpmPerPtu: 267,
        outputRatio: null,
        method: 'legacy',
        lastUpdated: 'Feb 2026'
    },
    'GPT-3.5 Turbo': {
        name: 'GPT-3.5 Turbo',
        inputTpmPerPtu: 10000,
        outputTpmPerPtu: 3333,
        outputRatio: null,
        method: 'legacy',
        lastUpdated: 'Feb 2026'
    },

    // o-Series Reasoning Models
    'o1': {
        name: 'o1',
        inputTpmPerPtu: 500,
        outputTpmPerPtu: 167,
        outputRatio: null,
        method: 'separate',
        lastUpdated: 'Feb 2026'
    },
    'o1-mini': {
        name: 'o1-mini',
        inputTpmPerPtu: 2000,
        outputTpmPerPtu: 667,
        outputRatio: null,
        method: 'separate',
        lastUpdated: 'Feb 2026'
    },
    'o3': {
        name: 'o3',
        inputTpmPerPtu: 400,
        outputTpmPerPtu: 50,
        outputRatio: 8,
        method: 'ratio',
        lastUpdated: 'Feb 2026'
    },
    'o3-mini': {
        name: 'o3-mini',
        inputTpmPerPtu: 1600,
        outputTpmPerPtu: 200,
        outputRatio: 8,
        method: 'ratio',
        lastUpdated: 'Feb 2026'
    },
    'o4-mini': {
        name: 'o4-mini',
        inputTpmPerPtu: 1800,
        outputTpmPerPtu: 225,
        outputRatio: 8,
        method: 'ratio',
        lastUpdated: 'Feb 2026'
    },

    // Third-Party Models
    'DeepSeek-R1': {
        name: 'DeepSeek-R1',
        inputTpmPerPtu: 4000,
        outputTpmPerPtu: 1000,
        outputRatio: 4,
        method: 'ratio',
        lastUpdated: 'Feb 2026'
    }
};

/**
 * PAYGO Rates (per 1M tokens)
 */
const PAYGO_RATES = {
    'gpt-5.2': { input: 6.00, output: 18.00 },
    'gpt-5': { input: 5.00, output: 15.00 },
    'gpt-5-mini': { input: 0.30, output: 1.20 },
    'gpt-4.1': { input: 2.00, output: 8.00 },
    'gpt-4.1-mini': { input: 0.40, output: 1.60 },
    'gpt-4.1-nano': { input: 0.10, output: 0.40 },
    'GPT-4o': { input: 2.50, output: 10.00 },
    'GPT-4o-mini': { input: 0.15, output: 0.60 },
    'GPT-4 Turbo': { input: 10.00, output: 30.00 },
    'GPT-4': { input: 30.00, output: 60.00 },
    'GPT-3.5 Turbo': { input: 0.50, output: 1.50 },
    'o1': { input: 15.00, output: 60.00 },
    'o1-mini': { input: 3.00, output: 12.00 },
    'o3': { input: 20.00, output: 80.00 },
    'o3-mini': { input: 1.10, output: 4.40 },
    'o4-mini': { input: 1.10, output: 4.40 },
    'DeepSeek-R1': { input: 0.55, output: 2.19 }
};

/**
 * Deployment Type Configuration
 */
const DEPLOYMENT_TYPES = {
    'Global Provisioned': {
        minimumPtus: 15,
        incrementSize: 5,
        description: 'Lowest minimum for cost-effective testing'
    },
    'Data Zone Provisioned': {
        minimumPtus: 50,
        incrementSize: 50,
        description: 'Higher minimum, regional data residency'
    },
    'Regional Provisioned': {
        minimumPtus: 100,
        incrementSize: 100,
        description: 'Highest minimum, strict data sovereignty'
    }
};

/**
 * Azure Regions
 */
const AZURE_REGIONS = [
    'East US',
    'East US 2',
    'West US',
    'West US 2',
    'West US 3',
    'Central US',
    'North Central US',
    'South Central US',
    'North Europe',
    'West Europe',
    'UK South',
    'UK West',
    'France Central',
    'Germany West Central',
    'Switzerland North',
    'Japan East',
    'Japan West',
    'Australia East',
    'Southeast Asia',
    'Korea Central',
    'Canada East',
    'Brazil South'
];

/**
 * Get list of model names for dropdowns
 */
function getModelList() {
    return Object.keys(PTU_RATES);
}

/**
 * Get rate for a specific model
 */
function getModelRate(modelName) {
    return PTU_RATES[modelName] || null;
}

/**
 * Get PAYGO rate for a specific model
 */
function getPaygoRate(modelName) {
    return PAYGO_RATES[modelName] || { input: 0, output: 0 };
}

/**
 * Get deployment type config
 */
function getDeploymentConfig(deploymentType) {
    return DEPLOYMENT_TYPES[deploymentType] || DEPLOYMENT_TYPES['Global Provisioned'];
}
