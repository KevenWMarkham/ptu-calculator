# Azure OpenAI PTU Calculator Documentation

**Enterprise Capacity Planning Framework**
Version 1.0 | February 2026

---

> **Update Note (Feb 2026)**: This document has been updated with the latest verified PTU rates from Microsoft documentation to address Sami's team inquiry about the PTU calculator formula and rate confirmation. See the [Verified PTU Rates & Formula](#verified-ptu-rates--formula-for-samis-team) section for the confirmed GPT-4o rate (2,500 Input TPM/PTU) and the new gpt-4.1/gpt-5 series rates with output token ratios.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Understanding Provisioned Throughput Units](#understanding-provisioned-throughput-units)
3. [PTU Calculator Framework Overview](#ptu-calculator-framework-overview)
4. [Workbook Structure & Usage](#workbook-structure--usage)
5. [Calculation Methodology](#calculation-methodology)
6. [Cost Analysis & Optimization](#cost-analysis--optimization)
7. [Architecture Patterns](#architecture-patterns)
8. [Implementation Guide](#implementation-guide)
9. [Best Practices & Pitfalls](#best-practices--pitfalls)
10. [External Resources](#external-resources)

---

## Executive Summary

This documentation accompanies the **Azure_PTU_Calculator_Framework.xlsx** workbook, a comprehensive tool for sizing, implementing, and optimizing Azure OpenAI Provisioned Throughput capacity for enterprise deployments.

### Key Metrics at a Glance

| Metric | Description |
|--------|-------------|
| **Total PTUs Required** | Calculated based on workload inputs |
| **Monthly Cost (Hourly)** | Pay-as-you-go PTU billing |
| **Monthly Cost (Reserved)** | Discounted rate with commitment |
| **Annual Savings** | Potential savings with reservations |

### Why PTU Planning Matters

PTU sizing is not just a technical exercise—it's a business decision that directly impacts your bottom line:
- **Under-sizing**: Performance degradation, 429 errors, poor user experience
- **Over-sizing**: Wasted budget on unused capacity
- **Right-sizing**: Predictable performance with optimized costs

---

## Understanding Provisioned Throughput Units

### What Are PTUs?

Provisioned Throughput Units are **generic units of model processing capacity** that you reserve in advance to ensure consistent performance for Azure OpenAI workloads. PTUs provide:

- **Predictable Performance**: Stable maximum latency and throughput
- **Allocated Capacity**: Throughput available whether used or not
- **Cost Optimization**: Potential savings for high-throughput workloads vs. token-based consumption

> **Source**: [Microsoft PTU Documentation](https://learn.microsoft.com/azure/ai-services/openai/concepts/provisioned-throughput)

### Key Characteristics

| Characteristic | Description |
|----------------|-------------|
| **Model-Independent Quota** | PTU quota is not tied to specific models; deploy across any supported model in the region |
| **Regional Allocation** | Quota assigned per subscription per region; must deploy in same region |
| **Hourly Billing** | Deployments charged per PTU per hour |
| **Minimum Increments** | PTUs purchased in model-specific increments |
| **No Capacity Guarantee** | Quota limits deployment size but doesn't guarantee availability |

### Deployment Types

| Deployment Type | Data Residency | CLI SKU Name | Best For |
|-----------------|----------------|--------------|----------|
| **Global Provisioned** | Data may be processed in any Azure region | `GlobalProvisionedManaged` | Cost optimization, flexible data requirements |
| **Data Zone Provisioned** | Data stays within geographic zone (US, EU) | `DataZoneProvisionedManaged` | Regional compliance with flexibility |
| **Regional Provisioned** | Data stays within specific Azure region | `ProvisionedManaged` | Strict data sovereignty, lowest latency |

### Minimum PTU Requirements

| Deployment Type | Minimum PTUs | Increment Size |
|-----------------|--------------|----------------|
| Global Provisioned | 15 | 5 |
| Data Zone Provisioned | 50 | 50 |
| Regional Provisioned | 100 | 100 |

---

## Verified PTU Rates & Formula (For Sami's Team)

> **Note**: This section contains the latest verified rates from Microsoft documentation as of February 2026, addressing the PTU calculator formula and rate confirmation request.

### Official Input TPM per PTU Rates

| Model | Input TPM per PTU | Output Token Ratio | Notes |
|-------|-------------------|-------------------|-------|
| **gpt-5.2** | 3,400 | 8:1 | Latest flagship |
| **gpt-5** | 4,750 | 8:1 | |
| **gpt-5-mini** | 23,750 | 8:1 | |
| **gpt-4.1** | 3,000 | 4:1 | |
| **gpt-4.1-mini** | 14,900 | 4:1 | |
| **gpt-4.1-nano** | 59,400 | 4:1 | |
| **gpt-4o** | **2,500** | varies | **Confirmed rate** |
| **gpt-4o-mini** | 37,000 | varies | |
| **DeepSeek-R1** | 4,000 | varies | Foundry model |

> **Source**: [Microsoft PTU Throughput Onboarding](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/provisioned-throughput-onboarding)

### The PTU Calculator Formula (Verified)

**Step 1: Calculate Total Effective Tokens**
```
Total Tokens = Peak Calls/Min × (Input Tokens + [Output Tokens × Ratio])
```

**Step 2: Apply Model-Specific Output Ratios**

For newer models (gpt-4.1+), output tokens count as multiples of input tokens:

| Model Family | Output Token Multiplier |
|--------------|------------------------|
| gpt-5, gpt-5.2 | 1 output = **8** input tokens |
| gpt-4.1 series | 1 output = **4** input tokens |
| gpt-4o (legacy) | Calculated separately |

**Step 3: Calculate PTUs Required**
```
PTUs Required = Effective Tokens / Input TPM per PTU
```

### Worked Example for Sami's Team

**Scenario**: GPT-4.1 deployment
- Peak calls: 100/minute
- Prompt tokens: 1,000 per call
- Response tokens: 500 per call

**Calculation**:
```
1. Apply output ratio (4:1 for gpt-4.1):
   Effective output = 500 × 4 = 2,000 tokens

2. Total effective tokens per minute:
   = 100 calls × (1,000 input + 2,000 effective output)
   = 100 × 3,000
   = 300,000 tokens/minute

3. PTUs required:
   = 300,000 / 3,000 (gpt-4.1 rate)
   = 100 PTUs
```

### GPT-4o Specific Calculation (Legacy Method)

For GPT-4o, the calculation uses separate input/output rates:

```
Input PTUs  = Input TPM / 2,500
Output PTUs = Output TPM / 833

Total PTUs  = MAX(Input PTUs, Output PTUs)
```

**Example**:
- 80,000 input TPM → 80,000 / 2,500 = 32 PTUs
- 40,000 output TPM → 40,000 / 833 = 48 PTUs
- **Result**: 48 PTUs required

### Key Points for Sami

1. **GPT-4o rate confirmed**: 2,500 Input TPM per PTU
2. **Output tokens are more expensive**: They consume 3-8x more capacity than input tokens
3. **Newer models use ratios**: gpt-4.1 uses 4:1, gpt-5 uses 8:1
4. **No monthly caps**: PTU usage governed by reserved throughput, not monthly ceilings
5. **Cached tokens**: 100% deducted from utilization (free throughput)

---

## PTU Calculator Framework Overview

The Excel workbook provides an integrated framework for comprehensive PTU planning:

```
Azure_PTU_Calculator_Framework.xlsx
├── Dashboard           → Executive summary & navigation
├── Configuration       → Global settings & pricing
├── Workload Inputs     → Application-level requirements
├── PTU Rates           → Model conversion rates
├── Capacity Summary    → Aggregated PTU calculations
├── Cost Analysis       → PTU vs PAYGO comparison
├── Spillover Planner   → Hybrid architecture planning
├── Reservation Optimizer → Commitment term analysis
├── Chargeback Model    → Cost allocation by application
└── Benchmarking Log    → Validation test tracking
```

### Cell Color Conventions

| Color | Meaning |
|-------|---------|
| **Blue text** | User inputs (editable) |
| **Black text** | Formulas and calculations |
| **Green text** | Links to other sheets |
| **Yellow highlight** | Key assumptions to review |

---

## Workbook Structure & Usage

### 1. Dashboard

The Dashboard provides an executive summary with:
- Total PTUs Required
- Total Monthly Cost (Hourly and Reserved)
- Annual Savings with Reservation
- Applications Configured count
- Quick navigation to all sections

**Status Indicators**:
- ⚠ Enter Data: Inputs needed
- ✓ Calculated: Formula results
- ⚙ Configure: Setup required

### 2. Configuration Sheet

Set global parameters before entering workload data:

**Pricing & Region Settings**:
| Parameter | Example Value | Description |
|-----------|---------------|-------------|
| Deployment Type | Global Provisioned | Determines minimum PTUs and pricing |
| Primary Region | East US 2 | Main deployment region |
| Secondary Region | West US 2 | Failover/spillover region |
| Hourly PTU Rate | $0.0396/PTU/hr | Current Azure rate |
| 1-Year Reservation Discount | 20% | Annual commitment savings |
| 3-Year Reservation Discount | 40% | Long-term commitment savings |

**Capacity Planning Parameters**:
| Parameter | Recommended Value | Description |
|-----------|-------------------|-------------|
| Target PTU Utilization | 85% | Utilization before spillover |
| Buffer Percentage | 15% | Additional capacity for variance |
| Peak Traffic Multiplier | 1.2 | Peak vs. average multiplier |

**PAYGO Comparison Rates** (per 1M tokens):
| Model | Input Rate | Output Rate |
|-------|------------|-------------|
| GPT-4o | $2.50 | $10.00 |
| GPT-4 Turbo | $10.00 | $30.00 |
| GPT-3.5 Turbo | $0.50 | $1.50 |

### 3. Workload Inputs Sheet

Enter application-level details for each workload:

| Field | Description | Example |
|-------|-------------|---------|
| Application Name | Unique identifier | Customer Chatbot |
| Model | Azure OpenAI model | GPT-4o |
| Avg Input Tokens | Tokens per request (prompt) | 800 |
| Avg Output Tokens | Tokens per response | 400 |
| Peak RPM | Peak requests per minute | 100 |
| Daily Hours | Active hours per day | 16 |
| Priority (1-3) | Spillover priority | 1 |

**Sample Workloads**:
| Application | Model | Input Tokens | Output Tokens | Peak RPM | Daily Hours | Priority |
|-------------|-------|--------------|---------------|----------|-------------|----------|
| Customer Chatbot | GPT-4o | 800 | 400 | 100 | 16 | 1 |
| Internal Copilot | GPT-4o | 1200 | 600 | 50 | 10 | 2 |
| Document Summarizer | GPT-4 Turbo | 4000 | 1000 | 20 | 8 | 2 |
| Code Assistant | GPT-4o | 2000 | 1500 | 30 | 12 | 1 |

### 4. PTU Rates Sheet

Reference table with current TPM-to-PTU conversion rates:

**Latest Models (February 2026 - Verified from Microsoft Docs)**:

| Model | Input TPM/PTU | Output Ratio | Last Updated |
|-------|---------------|--------------|--------------|
| **gpt-5.2** | 3,400 | 8:1 | Feb 2026 |
| **gpt-5** | 4,750 | 8:1 | Feb 2026 |
| **gpt-5-mini** | 23,750 | 8:1 | Feb 2026 |
| **gpt-4.1** | 3,000 | 4:1 | Feb 2026 |
| **gpt-4.1-mini** | 14,900 | 4:1 | Feb 2026 |
| **gpt-4.1-nano** | 59,400 | 4:1 | Feb 2026 |
| **gpt-4o** | 2,500 | separate calc | Feb 2026 |
| **gpt-4o-mini** | 37,000 | separate calc | Feb 2026 |

**Legacy Models (from Excel workbook)**:

| Model | TPM per PTU (Combined) | Input TPM/PTU | Output TPM/PTU | Last Updated |
|-------|------------------------|---------------|----------------|--------------|
| GPT-4o | 2,500 | 2,500 | 833 | Jan 2026 |
| GPT-4o-mini | 10,000 | 10,000 | 3,333 | Jan 2026 |
| GPT-4 Turbo | 1,200 | 1,200 | 400 | Jan 2026 |
| GPT-4 | 800 | 800 | 267 | Jan 2026 |
| GPT-3.5 Turbo | 10,000 | 10,000 | 3,333 | Jan 2026 |
| o1 | 500 | 500 | 167 | Jan 2026 |
| o1-mini | 2,000 | 2,000 | 667 | Jan 2026 |

> **Important Update**: The Excel workbook should be updated to include the new gpt-4.1 and gpt-5 series models with their output token ratios. The "Output Ratio" column indicates how many input tokens each output token counts as for utilization purposes.

> **Note**: For GPT-4o and later models, input and output TPM are calculated separately. Always validate against [Microsoft's official calculator](https://oai.azure.com/portal/calculator).

### 5. Capacity Summary Sheet

Aggregated view of PTU requirements:

| Metric | Description |
|--------|-------------|
| Total Input TPM | Sum of all application input tokens/minute |
| Total Output TPM | Sum of all application output tokens/minute |
| Base PTU Requirement | Raw calculation before adjustments |
| Buffer Allocation | Additional capacity for variance |
| Peak Traffic Adjustment | Capacity for peak periods |
| **Total PTUs Required** | Final rounded requirement |

**Utilization Projections**:
| Scenario | PTUs Deployed | Expected Utilization | Spillover % |
|----------|---------------|----------------------|-------------|
| Conservative (100% PTU) | Full allocation | 85% | 0% |
| Balanced (90% PTU) | 90% allocation | 94.4% | 10% |
| Aggressive (80% PTU) | 80% allocation | 106.25% | 20% |

### 6. Cost Analysis Sheet

Compare PTU economics against pay-as-you-go:

**PTU Cost Calculations**:
- Monthly Cost (Hourly Billing) = PTUs × $0.0396 × 730 hours
- 1-Year Reserved = Monthly × (1 - 20% discount)
- 3-Year Reserved = Monthly × (1 - 40% discount)

**Break-Even Analysis**:
```
Break-even TPM = PTU Monthly Cost / PAYGO Price Per Million Tokens × 1,000,000
```

### 7. Spillover Planner Sheet

Configure hybrid PTU/PAYGO architecture:

| Parameter | Description |
|-----------|-------------|
| Base PTU Allocation % | Portion of peak traffic handled by PTU (typically 85%) |
| Expected Spillover % | Traffic expected to overflow to PAYGO |
| Spillover Latency Tolerance | Acceptable latency increase |

**Spillover Cost Scenarios**:
| Scenario | PTU % | Spillover % | Monthly Cost Impact |
|----------|-------|-------------|---------------------|
| 100% PTU | 100% | 0% | Baseline |
| 95% PTU | 95% | 5% | ~3% savings |
| 90% PTU | 90% | 10% | ~7% savings |
| 85% PTU | 85% | 15% | ~10% savings |

### 8. Reservation Optimizer Sheet

Compare commitment terms:

| Option | Monthly Cost | Annual Cost | 3-Year Total | Savings vs Hourly |
|--------|--------------|-------------|--------------|-------------------|
| Hourly (No Commitment) | Baseline | × 12 | × 36 | 0% |
| 1-Year Reservation | -20% | -20% | N/A | 20% |
| 3-Year Reservation | -40% | -40% | -40% | 40% |

**Recommendation Logic**:
- Workload < 6 months: Use hourly billing
- Workload 6-18 months: Consider 1-year reservation
- Workload > 18 months: 3-year reservation optimal

### 9. Chargeback Model Sheet

Allocate costs to consuming applications:

| Application | TPM Share % | PTU Allocation | Monthly Cost | Annual Cost |
|-------------|-------------|----------------|--------------|-------------|
| Customer Chatbot | 28.9% | Proportional | Calculated | Calculated |
| Internal Copilot | 21.7% | Proportional | Calculated | Calculated |

### 10. Benchmarking Log Sheet

Track validation tests:

| Date | Application | PTUs Tested | Actual RPM | P95 Latency (ms) | Utilization % | 429 Rate % |
|------|-------------|-------------|------------|------------------|---------------|------------|
| | | | | | | |

---

## Calculation Methodology

### Core PTU Formula

```
Total Tokens = Peak Calls per Minute × (Input Tokens + Output Tokens)
```

This yields **Tokens Per Minute (TPM)**, which maps to PTU requirements.

### Two Calculation Methods

**Method 1: Legacy Models (GPT-4o and earlier)**
Uses separate input/output rates:
```
PTU_Required = CEILING(
    MAX(Input_TPM / Input_Rate, Output_TPM / Output_Rate),
    Minimum_Increment
)
```

**Method 2: New Models (gpt-4.1, gpt-5 series)** ✓ Verified Feb 2026
Uses output token ratio multiplier:
```
Effective_Tokens = Input_Tokens + (Output_Tokens × Output_Ratio)
PTU_Required = CEILING(Effective_TPM / Input_TPM_per_PTU, Minimum_Increment)
```

| Model Family | Output Ratio |
|--------------|--------------|
| gpt-5, gpt-5.2 | 8:1 |
| gpt-4.1 series | 4:1 |

### Example Calculation: GPT-4o (Legacy Method)

For a GPT-4o workload:
- Peak RPM: 100 requests/minute
- Input Tokens: 800 per request
- Output Tokens: 400 per request

**Step 1**: Calculate TPM
```
Input TPM  = 100 × 800 = 80,000 tokens/min
Output TPM = 100 × 400 = 40,000 tokens/min
```

**Step 2**: Calculate PTU (using GPT-4o rates: 2,500 input, 833 output)
```
Input PTUs  = 80,000 / 2,500 = 32 PTUs
Output PTUs = 40,000 / 833 = 48 PTUs
Total PTUs  = MAX(32, 48) = 48 PTUs
```

**Step 3**: Apply buffer and round
```
With 15% buffer = 48 × 1.15 = 55.2 PTUs
Rounded to increment of 5 = 60 PTUs
```

### Example Calculation: gpt-4.1 (New Method)

For a gpt-4.1 workload:
- Peak RPM: 100 requests/minute
- Input Tokens: 1,000 per request
- Output Tokens: 500 per request
- Output Ratio: 4:1

**Step 1**: Calculate effective tokens
```
Effective output = 500 × 4 = 2,000 tokens
Effective per call = 1,000 + 2,000 = 3,000 tokens
```

**Step 2**: Calculate TPM and PTUs
```
Effective TPM = 100 × 3,000 = 300,000 tokens/min
PTUs = 300,000 / 3,000 (gpt-4.1 rate) = 100 PTUs
```

**Step 3**: Apply buffer and round
```
With 15% buffer = 100 × 1.15 = 115 PTUs
Rounded to increment of 50 (Regional) = 150 PTUs
```

### Utilization Calculation

```
Utilization % = (Actual_TPM / (PTU_Count × TPM_Per_PTU)) × 100
```

### Cached Token Benefit

Cached tokens receive a **100% discount** from utilization:
```
Effective Input = (Prompt Tokens - Cached Tokens)
```

This can significantly reduce PTU requirements for applications with repetitive prompts or system messages.

---

## Cost Analysis & Optimization

### PTU vs PAYGO Comparison

**When PTUs are cost-effective**:
- High utilization (>60% of capacity)
- Predictable, steady traffic patterns
- Latency-sensitive applications

**When PAYGO is better**:
- Variable or unpredictable workloads
- Low utilization scenarios
- Short-term or experimental projects

### Spillover Economics Example

| Scenario | PTU Monthly Cost | PAYGO Spillover | Total | vs 100% PTU |
|----------|------------------|-----------------|-------|-------------|
| 100% PTU (sized for peak) | $15,000 | $0 | $15,000 | Baseline |
| 85% PTU + 15% PAYGO | $12,750 | $750 | $13,500 | -10% |
| 70% PTU + 30% PAYGO | $10,500 | $2,300 | $12,800 | -15% |

---

## Architecture Patterns

### GenAI Gateway with Azure API Management

The recommended production architecture includes Azure API Management (APIM) as a GenAI gateway:

```
┌─────────────────┐
│   Applications  │
└────────┬────────┘
         │
┌────────▼────────┐
│  Azure APIM     │
│  (GenAI Gateway)│
│  ├─ Auth        │
│  ├─ Rate Limit  │
│  ├─ Circuit Brk │
│  └─ Monitoring  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌───▼───┐
│ PTU   │ │ PAYGO │
│(Pri 1)│ │(Pri 2)│
└───────┘ └───────┘
```

> **Source**: [Microsoft GenAI Gateway Solution](https://learn.microsoft.com/ai/playbook/solutions/generative-ai/genai-gateway)

### APIM Configuration for Spillover

**Priority-Based Backend Pool**:
1. **Priority 1**: Regional PTU deployment (primary)
2. **Priority 2**: Same-region PAYGO deployment (spillover)
3. **Priority 3**: Secondary region PAYGO (disaster recovery)

**Key Policies**:
- Token limit policies per application/user
- Circuit breaker for automatic failover on 429 errors
- Retry policy with exponential backoff
- Semantic caching to reduce token consumption

### Enterprise PTU Architecture

**Gateway Layer**:
- Azure API Management with GenAI policies
- Subscription-based access control
- Token throttling and rate limiting

**Compute Layer**:
- Primary: Regional PTU deployment
- Spillover: Same-region PAYGO
- DR: Secondary region PAYGO

**Monitoring Layer**:
- Application Insights for token metrics
- Azure Monitor workbooks for dashboards
- Cost Management for chargeback
- Alerting for utilization thresholds

---

## Implementation Guide

### Phase 1: Discovery

**Business Requirements**:
- [ ] Expected user base and growth trajectory
- [ ] SLA requirements (response time, availability)
- [ ] Budget constraints and approval thresholds
- [ ] Data residency and compliance requirements

**Technical Requirements**:
- [ ] Application architecture and integration points
- [ ] Model requirements and capabilities needed
- [ ] Prompt engineering patterns and token estimates
- [ ] Peak usage patterns and seasonal variations

### Phase 2: Sizing

1. **Start with Estimates**: Use historical data or industry benchmarks
2. **Prototype and Measure**: Build representative prototype, measure actual usage
3. **Apply Calculator**: Input measured values into PTU calculator
4. **Add Buffer**: Include 10-20% for variance and growth
5. **Round to Increments**: Adjust to PTU purchase increments
6. **Benchmark**: Validate with load testing before committing

### Phase 3: Deployment Checklist

- [ ] Verify quota availability in target region
- [ ] Create provisioned deployment (validates capacity)
- [ ] Configure APIM gateway with spillover
- [ ] Set up monitoring and alerts
- [ ] Run load test to validate performance
- [ ] Purchase Azure Reservation to lock in pricing

> **Important**: Always deploy first, then purchase reservations. Reservations are financial instruments that do not guarantee capacity.

### Phase 4: Ongoing Optimization

Establish quarterly review cadence to:
- Review actual utilization against projections
- Adjust PTU allocation based on usage patterns
- Evaluate new model options and conversion rates
- Optimize spillover thresholds
- Update cost models and chargeback rates

---

## Best Practices & Pitfalls

### Sizing Best Practices

| Do | Don't |
|----|-------|
| Benchmark actual workloads before committing | Size purely for peak traffic |
| Include system prompts and RAG context in token estimates | Underestimate prompt sizes |
| Account for conversation history in chat apps | Ignore output variance (actual ≈ 40-60% of max_tokens) |
| Update conversion rates quarterly | Use outdated model rates |
| Set max_tokens close to true generation size | Leave max_tokens at default maximum |

### Architecture Best Practices

| Do | Don't |
|----|-------|
| Plan for multi-region or PAYGO fallback | Deploy single region without failover |
| Implement circuit breaker for automatic failover | Let 429 errors cascade to application errors |
| Monitor utilization with Azure Monitor | Deploy without monitoring capability |
| Set per-application quotas | Share deployments without quotas |

### Commercial Best Practices

| Do | Don't |
|----|-------|
| Deploy first, then purchase reservations | Buy reservations before confirming capacity |
| Start with monthly billing until patterns stabilize | Commit to long terms immediately |
| Implement chargeback model for cost allocation | Allow unchecked consumption growth |
| Evaluate new model versions for better efficiency | Ignore model updates and optimizations |

### Common Pitfalls to Avoid

1. **Reservations before deployment**: Capacity isn't guaranteed—deploy first
2. **Wrong commitment term**: Start conservative, extend when stable
3. **No chargeback model**: Without cost allocation, consumption grows unchecked
4. **Ignoring model updates**: New versions often have better PTU efficiency
5. **Single region deployment**: Always have failover strategy
6. **Missing monitoring**: Cannot optimize what you cannot measure

---

## External Resources

### Official Microsoft Resources

| Resource | URL |
|----------|-----|
| **PTU Calculator** | https://oai.azure.com/portal/calculator |
| **PTU Documentation** | https://learn.microsoft.com/azure/ai-services/openai/concepts/provisioned-throughput |
| **PTU Onboarding & Costs** | https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/provisioned-throughput-onboarding |
| **Quotas & Limits** | https://learn.microsoft.com/en-us/azure/ai-services/openai/quotas-limits |
| **Azure OpenAI Pricing** | https://azure.microsoft.com/pricing/details/cognitive-services/openai-service |
| **GenAI Gateway Guide** | https://learn.microsoft.com/ai/playbook/solutions/generative-ai/genai-gateway |
| **AI Foundry Calculator** | https://ai.azure.com/resource/calculator |
| **Manage PTU Quota** | https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/quota |

### Community & Tools

| Resource | URL |
|----------|-----|
| **Azure OpenAI Benchmark Tool** | https://github.com/Azure/azure-openai-benchmark |
| **AOAI with APIM Reference** | https://github.com/microsoft/AzureOpenAI-with-APIM |
| **PTU Sizer Toolkit** | https://github.com/martins-vds/azure-openai-ptu-sizer |

### Additional Resources (from Web Search)

| Resource | URL |
|----------|-----|
| **Azure OpenAI Pricing Guide** | https://azure-noob.com/blog/azure-openai-pricing-real-costs/ |
| **Cost Optimization Strategies** | https://www.finout.io/blog/azure-openai-pricing-6-ways-to-cut-costs |

### Key Technical Concepts

**Leaky Bucket Algorithm**: Azure OpenAI uses this algorithm to manage PTU capacity utilization. Each request is assessed based on prompt size, expected generation size (max_tokens), and model type.

**429 Response Handling**: When utilization reaches 100%, the service returns HTTP 429 with a `retry-after-ms` header. Implement retry logic with exponential backoff.

**Utilization Metric**: Monitor `Provisioned-Managed Utilization V2` in Azure Monitor for real-time PTU usage tracking.

---

## Recommended Excel Framework Updates

Based on the latest Microsoft documentation, the following updates should be made to the **Azure_PTU_Calculator_Framework.xlsx** workbook:

### PTU Rates Sheet Updates

1. **Add new models**:
   - gpt-5.2 (3,400 Input TPM/PTU, 8:1 ratio)
   - gpt-5 (4,750 Input TPM/PTU, 8:1 ratio)
   - gpt-5-mini (23,750 Input TPM/PTU, 8:1 ratio)
   - gpt-4.1 (3,000 Input TPM/PTU, 4:1 ratio)
   - gpt-4.1-mini (14,900 Input TPM/PTU, 4:1 ratio)
   - gpt-4.1-nano (59,400 Input TPM/PTU, 4:1 ratio)
   - DeepSeek-R1 (4,000 Input TPM/PTU)

2. **Add Output Token Ratio column**:
   - New column to capture the 4:1 or 8:1 output multiplier
   - Required for accurate calculations on newer models

3. **Update GPT-4o-mini rate**:
   - Current: 10,000 TPM/PTU
   - Updated: 37,000 Input TPM/PTU (per latest docs)

### Calculation Formula Updates

1. **Add conditional logic** for new vs. legacy models:
   ```
   IF(OutputRatio > 0,
      InputTPM + (OutputTPM × OutputRatio),
      MAX(InputTPM/InputRate, OutputTPM/OutputRate))
   ```

2. **Update minimum increments** for new models:
   - Global/Data Zone gpt-5: 15 min, 5 increment
   - Regional gpt-5: 50 min, 50 increment

### Configuration Sheet Updates

1. Add deployment type selection impact on minimum PTUs
2. Add cached token discount factor (for RAG applications)

---

## Document Information

| Field | Value |
|-------|-------|
| **Document Title** | Azure OpenAI PTU Calculator Documentation |
| **Version** | 1.1 |
| **Date** | February 2026 |
| **Author** | Keven Markham |
| **Associated Workbook** | Azure_PTU_Calculator_Framework.xlsx |
| **Last Updated** | Added verified PTU rates for Sami's team |

---

*This documentation is intended to accompany the Azure PTU Calculator Framework workbook. For questions about Azure OpenAI deployment strategy, contact your Microsoft or consulting partner.*

**Sources**:
- [Microsoft PTU Documentation](https://learn.microsoft.com/azure/ai-services/openai/concepts/provisioned-throughput)
- [PTU Onboarding & Costs](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/provisioned-throughput-onboarding)
- [Azure OpenAI Quotas & Limits](https://learn.microsoft.com/en-us/azure/ai-services/openai/quotas-limits)
- [GenAI Gateway Guide](https://learn.microsoft.com/ai/playbook/solutions/generative-ai/genai-gateway)
