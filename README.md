# Azure OpenAI PTU Calculator

A web-based capacity planning tool for Azure OpenAI Provisioned Throughput Units (PTUs). Built for Deloitte Microsoft Technology & Services Practice consultants to size, cost, and optimize Azure OpenAI deployments for enterprise clients.

![Dashboard Screenshot](https://img.shields.io/badge/Version-1.0-green) ![License](https://img.shields.io/badge/License-Internal-blue)

## Features

### Core Functionality
- **Dashboard** - Executive summary with total PTUs, monthly costs, and annual savings
- **Configuration** - Set deployment type, regions, pricing, and capacity parameters
- **Workload Inputs** - Add applications with model selection, token estimates, and peak RPM
- **PTU Rates** - Reference table with 17 Azure OpenAI models (February 2026 rates)
- **Capacity Summary** - Calculated PTU requirements with buffer and peak adjustments
- **Cost Analysis** - Compare PTU vs PAYGO economics with break-even analysis
- **Spillover Planner** - Model hybrid PTU/PAYGO architectures for cost optimization
- **Chargeback** - Allocate costs to consuming applications by TPM share

### Project Management
- **Demo Mode** - Pre-loaded example workloads for training and presentations
- **Client Projects** - Create separate projects for each client engagement
- **Data Persistence** - Projects saved to browser localStorage

### Export Options
- **PDF Export** - Deloitte-branded reports for client deliverables
- **Excel Export** - Full workbook with all 8 sheets populated

## Supported Models

| Model | Input TPM/PTU | Output Ratio | Method |
|-------|---------------|--------------|--------|
| gpt-5.2 | 3,400 | 8:1 | ratio |
| gpt-5 | 4,750 | 8:1 | ratio |
| gpt-5-mini | 23,750 | 8:1 | ratio |
| gpt-4.1 | 3,000 | 4:1 | ratio |
| gpt-4.1-mini | 14,900 | 4:1 | ratio |
| gpt-4.1-nano | 59,400 | 4:1 | ratio |
| GPT-4o | 2,500 | - | separate |
| GPT-4o-mini | 37,000 | - | separate |
| GPT-4 Turbo | 1,200 | - | legacy |
| o1 | 500 | - | separate |
| o1-mini | 2,000 | - | separate |
| o3 | 400 | 8:1 | ratio |
| o3-mini | 1,600 | 8:1 | ratio |
| o4-mini | 1,800 | 8:1 | ratio |
| DeepSeek-R1 | 4,000 | 4:1 | ratio |

## Quick Start

### Option 1: Open Locally
Simply open `index.html` in a web browser. No server required.

```bash
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

### Option 2: Deploy to Azure Static Web Apps
```bash
az staticwebapp create \
  --name ptu-calculator \
  --resource-group <your-rg> \
  --source https://github.com/KevenWMarkham/ptu-calculator \
  --branch main \
  --app-location "/" \
  --output-location "/"
```

### Option 3: SharePoint
Upload all files maintaining the folder structure to a SharePoint document library.

## Usage

1. **View Demo** - Start with the pre-loaded example workloads to understand the tool
2. **Create Project** - Click "+ New" to create a client-specific project
3. **Configure** - Set deployment type (Global/Data Zone/Regional) and pricing
4. **Add Workloads** - Enter each application's model, token estimates, and peak RPM
5. **Review Results** - Check Dashboard, Capacity Summary, and Cost Analysis tabs
6. **Optimize** - Use Spillover Planner to find optimal PTU/PAYGO mix
7. **Export** - Generate PDF report or Excel workbook for client delivery

## Project Structure

```
ptu-calculator/
├── index.html                 # Main application
├── css/
│   └── styles.css             # Deloitte-branded styles
├── js/
│   ├── app.js                 # Main controller
│   ├── data/
│   │   └── ptu-rates.js       # Model rates and config
│   ├── calculators/
│   │   ├── ptu-calculator.js  # PTU calculations
│   │   ├── cost-calculator.js # Cost analysis
│   │   └── spillover-calculator.js
│   ├── components/
│   │   ├── tabs.js            # Tab navigation
│   │   ├── workload-table.js  # Workload management
│   │   └── project-manager.js # Project switching
│   ├── export/
│   │   ├── pdf-export.js      # PDF generation
│   │   └── excel-export.js    # Excel export
│   └── lib/
│       ├── jspdf.umd.min.js   # PDF library
│       └── xlsx.full.min.js   # Excel library
├── reference/                  # Original Excel & Word docs
└── Azure_OpenAI_PTU_Calculator_Documentation.md
```

## PTU Calculation Methods

### Ratio-Based (gpt-4.1, gpt-5 series)
```
Effective Tokens = Input Tokens + (Output Tokens × Ratio)
PTUs = Effective TPM / Input TPM per PTU
```

### Separate Calculation (GPT-4o, o1 series)
```
Input PTUs = Input TPM / Input Rate
Output PTUs = Output TPM / Output Rate
PTUs = MAX(Input PTUs, Output PTUs)
```

## Updating PTU Rates

Rates should be updated quarterly from Microsoft's official sources:
1. Edit `js/data/ptu-rates.js`
2. Update the `PTU_RATES` object with new values
3. Update `lastUpdated` field

**Sources:**
- [Azure OpenAI PTU Calculator](https://oai.azure.com/portal/calculator)
- [PTU Documentation](https://learn.microsoft.com/azure/ai-services/openai/concepts/provisioned-throughput)

## Browser Compatibility

- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

## Contributing

For internal Deloitte use. Contact the Microsoft Technology & Services Practice for modifications or feature requests.

## License

Internal Deloitte use only. Not for external distribution.

---

**Deloitte Microsoft Technology & Services Practice** | February 2026
