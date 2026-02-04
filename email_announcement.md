# Azure OpenAI PTU Calculator - Now Available

**Subject:** New Tool: Azure OpenAI PTU Calculator for Client Engagements

---

Hi Team,

I'm pleased to share a new utility I've developed for our practice: the **Azure OpenAI PTU Calculator**. This web-based tool helps consultants quickly size, cost, and optimize Azure OpenAI Provisioned Throughput Unit (PTU) deployments for client engagements.

## Access the Tool

### Option 1: Live Web Version (Recommended)
Access the calculator instantly from any browser:

**🔗 https://kevenwmarkham.github.io/ptu-calculator/**

No installation required. Works on any device with a modern browser.

---

### Option 2: Download for Local/Offline Use

For offline use or to host on your own environment:

1. **Download the repository:**
   - Go to: https://github.com/KevenWMarkham/ptu-calculator
   - Click the green **"Code"** button
   - Select **"Download ZIP"**

2. **Extract and run:**
   - Extract the ZIP file to any folder
   - Open `index.html` in your browser (Chrome, Edge, or Firefox recommended)

3. **That's it!** No server or installation needed.

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Executive summary with PTUs, costs, and savings at a glance |
| **17 Models** | All current Azure OpenAI models with Feb 2026 rates (gpt-5, gpt-4.1, GPT-4o, o1, o3, DeepSeek-R1) |
| **Cost Analysis** | Compare PTU vs PAYGO pricing with break-even analysis |
| **Spillover Planner** | Model hybrid PTU/PAYGO architectures for cost optimization |
| **Project Management** | Separate Demo examples from client-specific calculations |
| **Export** | Generate PDF reports and Excel workbooks for client deliverables |

## Quick Start Guide

1. **View Demo Mode** - Start with pre-loaded example workloads to understand the tool
2. **Create a Client Project** - Click "+ New" to create a project for your engagement
3. **Add Workloads** - Enter each application's model, token estimates, and peak RPM
4. **Review Results** - Check Cost Analysis and Spillover Planner tabs
5. **Export** - Generate PDF or Excel for your client presentation

## Demo Workloads Included

The tool comes with 5 example workloads to demonstrate capabilities:
- Customer Support Chatbot (GPT-4o)
- Internal Copilot Assistant (gpt-4.1-mini)
- Document Summarization (gpt-4.1)
- Code Review Assistant (GPT-4o)
- Data Analysis Agent (o1-mini)

## Technical Notes

- **Data Storage:** All data is saved locally in your browser (localStorage). Nothing is sent to any server.
- **Rate Updates:** PTU rates are current as of February 2026. I'll push updates quarterly.
- **Browser Support:** Chrome, Edge, Firefox, Safari (latest versions)

## Resources

- **Live Tool:** https://kevenwmarkham.github.io/ptu-calculator/
- **GitHub Repository:** https://github.com/KevenWMarkham/ptu-calculator
- **Documentation:** Included in the repository (`Azure_OpenAI_PTU_Calculator_Documentation.md`)
- **Reference Materials:** Original Excel framework and implementation guide included in `/reference` folder

## Feedback & Questions

This tool is designed to evolve based on your needs. If you have feedback, feature requests, or encounter any issues, please reach out to me directly or open an issue on the GitHub repository.

Best regards,

**Keven Markham**
Vice President, Enterprise Transformation
Microsoft Technology & Services Practice
Deloitte Consulting LLP

---

*This tool is for internal Deloitte use only. Please do not share externally without appropriate review.*
