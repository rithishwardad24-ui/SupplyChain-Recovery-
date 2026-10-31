# SmartSupply AI — Autonomous Supply Chain Digital Twin & Recovery Agent

> Intelligent supply chain disruption detection, cascading blast-radius reasoning, 5-strategy constrained optimization, multi-node verification, and dynamic in-flight adaptation platform.

---

## 1. Project Overview

Modern supply chains are interconnected networks where a single upstream disruption (e.g., supplier delay) cascades through raw materials, manufacturing schedules, distribution centers, and retail stores—eventually triggering SLA penalties and customer churn.

**SmartSupply AI** replaces reactive crisis management with proactive multi-agent reasoning:
1. **Monitors** all entities across 6 tiers in real time.
2. **Detects** supplier failures, material deficits, capacity drops, logistics freezes, and demand spikes.
3. **Reasons** about the complete disruption blast radius using a directed topological Digital Twin graph.
4. **Generates & Simulates** 5 distinct recovery plans evaluated across 6 criteria.
5. **Verifies** that the chosen recovery strategy does not create secondary shortages elsewhere in the network.
6. **Adapts** dynamically when a secondary disruption occurs during active recovery.
7. **Maintains Strict Transparency** via audited `[KNOWN]` vs `[ASSUMED]` data classification tags.

---

## 2. Supply Chain Digital Twin Topology

The digital twin models FMCG manufacturer **Aura Consumer Goods**:
- **5 Suppliers**: Rotterdam (Apex Chem), Singapore (Pacific Polymers), France (BioPure), Germany (Horizon Pack), Sweden (Nordic CleanSynthetics).
- **8 Raw Materials**: Virgin Polymer (MAT-01), Bio-Resin Blend (MAT-02 substitute), Surfactant (MAT-03), Fragrance Oil (MAT-04), Barrier Foil (MAT-05), Preservatives (MAT-06), Cartons (MAT-07), UV Stabilizer (MAT-08).
- **2 Factories**: Rheinland Mega-Plant (120k u/d cap) and Nordic Modular Works (65k u/d cap).
- **2 Distribution Hubs**: Central Frankfurt Gateway (850k units) and Antwerp Euro-Port (520k units).
- **5 Retail Stores**: Berlin, Paris, Stockholm, Munich, Brussels.
- **10 Customer Orders**: Enterprise Tier 1 contracts (Kaufland, Carrefour, ICA Gruppen) with guaranteed SLA penalty clauses.

### Digital Twin Node Health Color Scheme
- **Green**: Healthy & Operational
- **Yellow**: Warning / Buffer drawdown
- **Red**: Disrupted / Impacted
- **Blue**: Recovery in Progress
- **Grey**: Inactive / Off-line

---

## 3. Five Specialized AI Agents

1. **Supply Chain Monitoring Agent**: Anomaly detection across suppliers, inventories, and transit legs.
2. **Demand & Impact Prediction Agent**: Deterministic forecasting of production deficits, stockout horizons, and financial exposure ($ revenue at risk + $ contractual SLA penalties).
3. **Dependency Reasoning Agent**: NetworkX-equivalent directed graph traversal calculating upstream & downstream blast radius and identifying viable substitution levers.
4. **Simulation & Optimization Agent**: SimPy discrete-event simulation and constrained multi-objective optimization across the 8 recovery action types.
5. **Recovery Decision Agent**: Synthesizes trade-offs, formulates executive recommendations, requests human-in-the-loop approval, executes simulated actions, and triggers dynamic adaptation.

---

## 4. Five Diverse Recovery Strategies & Six Criteria

| Recovery Strategy | Core Objective | Key Levers | Cost | Speed | SLA Adherence | Risk (1-100) | Carbon (kg CO₂e) |
|---|---|---|---|---|---|---|---|
| **Plan A – Cheapest** | Minimize cash outlay | Economy off-peak volume, standard rail/road, buffer non-contractual Tier 3 | $18.5k | 5.5 days | 78% | 42 | 3,100 kg |
| **Plan B – Fastest** | Minimize resolution time | Chartered air freight, instant BOM substitute MAT-02, 24/7 overtime shifts | $70.7k | 1.8 days | 96% | 35 | 7,200 kg |
| **Plan C – SLA Protection** | Protect Enterprise Tier 1 | Ring-fence warehouse stock, express inter-hub transfers, zero penalty days | $42.5k | 2.5 days | 100% | 22 | 3,800 kg |
| **Plan D – Green** | Net-negative carbon impact | 100% Bio-circular resin MAT-02, electrified DB rail freight, hydro-powered lines | $46.9k | 3.8 days | 88% | 28 | 950 kg |
| **Plan E – Balanced (Rec.)** | Pareto-optimal trade-off | Split allocation (SUP-02 + SUP-03), cross-docking, staggered weekend shift | $36.4k | 2.2 days | 94% | 18 | 2,450 kg |

---

## 5. Automated Tests

Run pure logic unit tests via Node's native test runner:

```bash
npx --yes tsx --test src/engine/supplyChain.test.ts
```

Tests verify:
- Complete entity topology loading and graph connectivity.
- Deterministic blast radius propagation from supplier to retail customer tiers.
- Multi-agent orchestration generating 5 distinct strategies across 6 criteria.
- Verification Engine detecting network balance and secondary shortage risks.
- Second disruption dynamic adaptation and plan diffing.

---

## 6. Hackathon Demonstration Flow (3–5 Minutes)

1. **Healthy Baseline**: View nominal 96% health score and 32 connected nodes on the interactive canvas.
2. **Trigger Disruption**: Click `"Run Demo: Major Supplier Failure"` or inject via Disruption Center.
3. **Observe Blast Radius**: Watch `SUP-01` turn red, propagating through `MAT-01`, `FAC-01`, `DC-01`, `STR-01/02`, and 4 customer orders.
4. **Compare 5 Plans**: Navigate to Recovery Planner; compare the 5 distinct strategies across the 6 standardized criteria.
5. **Approve & Execute**: Click `"Approve & Execute Plan E"`; observe live verification checks passing across BOM, factory capacity, and secondary shortages.
6. **Inject Second Disruption**: Click `"Inject Second Disruption"` in the What-If Simulator. Observe how the system detects the invalidated plan, reassesses dependencies, and presents an adapted resilient plan!
7. **Business Impact**: Inspect the side-by-side ROI model comparing unmitigated damage ($220k+) vs. net value preserved.
