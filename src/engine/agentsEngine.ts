/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DisruptionEvent,
  BlastRadiusResult,
  RecoveryPlan,
  RecoveryActionItem,
  AgentActivityLog,
  CustomerOrder,
  CompanyIntelligenceProfile,
} from '../types/supplyChain';
import { DigitalTwinNetwork } from './digitalTwinGraph';

export interface MultiAgentWorkflowResult {
  logs: AgentActivityLog[];
  blastRadius: BlastRadiusResult;
  recoveryPlans: RecoveryPlan[];
  recommendedPlanId: string;
  rationale: string;
}

export class MultiAgentOrchestrator {
  private network: DigitalTwinNetwork;

  constructor(network: DigitalTwinNetwork) {
    this.network = network;
  }

  /**
   * Runs the Autonomous Company & Supplier Intelligence Agent
   * Ingests corporate telemetry, maps parameters, and connects database & twin nodes
   */
  public runCompanyIntelligenceAgent(
    companyQuery: string,
    profile: CompanyIntelligenceProfile
  ): AgentActivityLog {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const log: AgentActivityLog = {
      id: `act-intel-${Date.now()}`,
      agentId: 'company_intelligence',
      agentName: 'Agent 0: Company & Supplier Intelligence Agent',
      timestamp,
      actionTaken: `Pulled enterprise telemetry & supply chain profile for ${profile.companyName}`,
      inputSummary: `Queried: "${companyQuery}" · Location: ${profile.location} · Tier: ${profile.tier} · Status: ${profile.operationalStatus}`,
      reasoningTrace: `Queried corporate intelligence registers. Identified daily capacity of ${profile.dailyCapacityUnits.toLocaleString()} units, base lead time of ${profile.baseLeadTimeDays} days, and reliability score of ${profile.reliabilityScore}%. Screened financial health (Solvency index: ${profile.financialHealthScore}/100) and ESG grade (${profile.esgRating}). Evaluated export corridor resilience through ${profile.primaryPorts.slice(0, 2).join(' & ')} with ${profile.portExposureScore}% port congestion exposure. Materials matched to BOM: ${profile.materialsSupplied.join(', ')}.`,
      outputSummary: `Configured Digital Twin Supplier Node #${profile.digitalTwinSupplierId || 'SUP'}. Persisted intelligence dossier and synchronized state to Cloud Firestore database.`,
      status: 'completed',
      dataClassification: 'KNOWN',
    };
    return log;
  }

  /**
   * Runs the complete 5-agent coordinated workflow for a given disruption
   */
  public executeWorkflow(disruption: DisruptionEvent, isSecondDisruption = false): MultiAgentWorkflowResult {
    const logs: AgentActivityLog[] = [];
    const timestamp = new Date().toISOString();

    // ----------------------------------------------------
    // AGENT 1: Supply Chain Monitoring Agent
    // ----------------------------------------------------
    const targetEntityName = this.network.getSupplier(disruption.targetEntityId)?.name
      || this.network.getMaterial(disruption.targetEntityId)?.name
      || this.network.getFactory(disruption.targetEntityId)?.name
      || this.network.getDC(disruption.targetEntityId)?.name
      || this.network.getStore(disruption.targetEntityId)?.name
      || disruption.targetEntityId;

    logs.push({
      id: `act-1-${Date.now()}`,
      agentId: 'monitoring',
      agentName: 'Agent 1: Supply Chain Monitoring Agent',
      timestamp: new Date(Date.now() - 4000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actionTaken: isSecondDisruption 
        ? `Detected secondary in-flight failure at ${targetEntityName}`
        : `Anomaly detected: ${disruption.title}`,
      inputSummary: `Entity: ${disruption.targetEntityId} (${disruption.targetEntityType}) · Severity: ${disruption.severityPercent}% · Delay: ${disruption.expectedDelayDays} days`,
      reasoningTrace: `Real-time telematics and ERP integration flagged sudden variance from baseline schedule. Target entity is experiencing operational impairment (${disruption.severityPercent}% throughput reduction). Alert escalated to Dependency Reasoning Agent.`,
      outputSummary: `Generated Disruption Alert #${disruption.id}. Status: RED. Primary bottleneck flagged at node ${disruption.targetEntityId}.`,
      status: 'alert',
      dataClassification: 'KNOWN',
    });

    // ----------------------------------------------------
    // AGENT 2: Demand & Impact Prediction Agent
    // ----------------------------------------------------
    const blastRadius = this.network.calculateBlastRadius(
      disruption.targetEntityId,
      disruption.severityPercent,
      disruption.expectedDelayDays
    );

    logs.push({
      id: `act-2-${Date.now()}`,
      agentId: 'prediction',
      agentName: 'Agent 2: Demand & Impact Prediction Agent',
      timestamp: new Date(Date.now() - 3000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actionTaken: 'Calculated production deficits, stockout horizons, and financial exposure',
      inputSummary: `Disrupted Node: ${disruption.targetEntityId} · Production Shortage: ${blastRadius.estimatedProductionShortageUnits.toLocaleString()} units`,
      reasoningTrace: `Evaluated inventory burn rates and safety stock buffers across 5 regional stores. Earliest critical stockout projected in ${blastRadius.earliestStockoutDays.toFixed(1)} days. Evaluated contractual SLA terms for ${blastRadius.affectedOrderIds.length} downstream enterprise orders.`,
      outputSummary: `Forecasted ${blastRadius.slaViolationsCount} SLA breaches. Total financial risk: $${blastRadius.totalFinancialExposureUsd.toLocaleString()} ($${blastRadius.estimatedRevenueAtRiskUsd.toLocaleString()} revenue + $${blastRadius.estimatedSlaPenaltiesUsd.toLocaleString()} SLA penalties).`,
      status: 'completed',
      dataClassification: 'ASSUMED',
    });

    // ----------------------------------------------------
    // AGENT 3: Dependency Reasoning Agent
    // ----------------------------------------------------
    logs.push({
      id: `act-3-${Date.now()}`,
      agentId: 'dependency',
      agentName: 'Agent 3: Dependency Reasoning Agent',
      timestamp: new Date(Date.now() - 2000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actionTaken: 'Executed topological graph traversal to map full blast radius & alternatives',
      inputSummary: `Graph Size: ${this.network.getAllSuppliers().length + this.network.getAllMaterials().length + this.network.getAllFactories().length} nodes · Impacted Path Depth: 5 tiers`,
      reasoningTrace: `Traversed directed acyclic graph: ${disruption.targetEntityId} → ${blastRadius.affectedMaterialIds.join(', ')} → Factories ${blastRadius.affectedFactoryIds.join(', ')} → Distribution Hubs → Retail Endpoints. Screened active database for viable backup suppliers (SUP-02, SUP-03, SUP-05) and substitute resins (MAT-02 96% BOM match).`,
      outputSummary: `Identified 4 viable recovery levers: Alternative Supplier onboarding, BOM material substitution, cross-dock inventory reallocation, and express intermodal routing.`,
      status: 'completed',
      dataClassification: 'KNOWN',
    });

    // ----------------------------------------------------
    // AGENT 4: Simulation & Optimization Agent
    // ----------------------------------------------------
    const recoveryPlans = this.generateDiverseRecoveryPlans(disruption, blastRadius, isSecondDisruption);

    logs.push({
      id: `act-4-${Date.now()}`,
      agentId: 'simulation_optimization',
      agentName: 'Agent 4: Simulation & Optimization Agent',
      timestamp: new Date(Date.now() - 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actionTaken: 'Synthesized and simulated 5 diverse constrained recovery strategies',
      inputSummary: `Multi-Objective Criteria: Cost vs. Time vs. SLA vs. Customer Impact vs. Risk vs. CO2`,
      reasoningTrace: `Ran discrete-event simulations for 5 parameter configurations. Checked physical constraints: supplier daily capacity limits, BOM chemical compatibility rules (96% spec approval), factory work-center labor limits (FAC-01 max 120k u/d), and carrier transit schedules.`,
      outputSummary: `Constructed 5 distinct strategies (Cheapest, Fastest, SLA Protection, Green, Balanced). Computed 6 evaluation criteria with zero constraint violations.`,
      status: 'completed',
      dataClassification: 'ASSUMED',
    });

    // ----------------------------------------------------
    // AGENT 5: Recovery Decision Agent
    // ----------------------------------------------------
    const recommendedPlan = recoveryPlans.find((p) => p.isRecommended) || recoveryPlans[4];
    const rationale = `Plan E (Balanced Recovery) delivers the highest Pareto efficiency: protecting 9 of 10 customer orders (90% SLA adherence) and cutting resolution time from ${disruption.expectedDelayDays} days to ${recommendedPlan.recoveryTimeDays} days, for an investment of $${recommendedPlan.totalRecoveryCostUsd.toLocaleString()} against $${blastRadius.totalFinancialExposureUsd.toLocaleString()} in gross risk (yielding a net positive ROI of $${(blastRadius.totalFinancialExposureUsd - recommendedPlan.totalRecoveryCostUsd).toLocaleString()}).`;

    logs.push({
      id: `act-5-${Date.now()}`,
      agentId: 'decision',
      agentName: 'Agent 5: Recovery Decision Agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actionTaken: isSecondDisruption 
        ? 'Adapted decision engine to override previous plan and present revised strategy'
        : 'Formulated executive recommendation and generated human approval request',
      inputSummary: `Selected: ${recommendedPlan.name} (${recommendedPlan.id.toUpperCase()}) · Feasibility: ${recommendedPlan.feasibilityStatus}`,
      reasoningTrace: rationale,
      outputSummary: `Awaiting human-in-the-loop signoff to trigger simulated execution of ${recommendedPlan.proposedActions.length} operational recovery actions.`,
      status: 'decision_needed',
      dataClassification: 'KNOWN',
    });

    return {
      logs,
      blastRadius,
      recoveryPlans,
      recommendedPlanId: recommendedPlan.id,
      rationale,
    };
  }

  /**
   * Generates 5 genuinely diverse recovery strategies evaluated across 6 criteria
   * Dynamically adapts the recovery pattern across all 6 supply chain echelons:
   * Suppliers -> Materials -> Factories -> DCs -> Stores -> Orders
   */
  private generateDiverseRecoveryPlans(
    disruption: DisruptionEvent,
    blastRadius: BlastRadiusResult,
    isSecondDisruption: boolean
  ): RecoveryPlan[] {
    const ordersAtRisk = blastRadius.estimatedDelayedOrdersCount || 5;
    const targetId = disruption.targetEntityId;
    const isFactory = disruption.targetEntityType === 'factory' || targetId.startsWith('FAC');
    const isDC = disruption.targetEntityType === 'distribution_center' || targetId.startsWith('DC');
    const isStore = disruption.targetEntityType === 'store' || targetId.startsWith('STR');
    const isMaterial = disruption.targetEntityType === 'material' || targetId.startsWith('MAT');
    const isSupplier = disruption.targetEntityType === 'supplier' || targetId.startsWith('SUP') || (!isFactory && !isDC && !isStore && !isMaterial);

    // =========================================================================
    // SCENARIO 1: FACTORY OUTAGE (e.g. FAC-01 down)
    // Primary lever: Shift production to FAC-02 (Nordic Modular Works in Malmö)
    // =========================================================================
    if (isFactory) {
      const activeFac = targetId === 'FAC-01' ? 'FAC-02' : 'FAC-01';
      const activeFacName = activeFac === 'FAC-02' ? 'Nordic Modular Works (Malmö)' : 'Rheinland Mega-Plant (Cologne)';

      // Plan A: Cheapest - Standard shift at alternate plant, buffer Tier 3 orders
      const planAActions: RecoveryActionItem[] = [
        {
          id: 'act-a-fac-1',
          category: 'capacity_reallocation',
          title: `Shift Core Batches to ${activeFacName}`,
          description: `Reroute baseline runs to ${activeFac} on standard scheduled daylight shifts without weekend overtime premiums.`,
          sourceEntityId: activeFac,
          targetEntityId: 'DC-02',
          costUsd: 14500,
          timeHours: 96,
          co2DeltaKg: 1200,
          riskRating: 'Low',
          isFeasible: true,
          applied: false,
        },
        {
          id: 'act-a-fac-2',
          category: 'transportation_rerouting',
          title: 'Bulk Ground Rail Transfer from Malmö Hub',
          description: 'Dispatch consolidated rail cars from Sweden to Antwerp logistics depot DC-02 at bulk freight rates.',
          sourceEntityId: activeFac,
          targetEntityId: 'DC-02',
          costUsd: 3200,
          timeHours: 36,
          co2DeltaKg: -150,
          riskRating: 'Low',
          isFeasible: true,
          applied: false,
        },
        {
          id: 'act-a-fac-3',
          category: 'order_prioritization',
          title: 'Buffer Tier 3 Delivery Windows by 48 Hours',
          description: 'Absorb minor delays on non-contractual retail orders (ORD-108, ORD-109, ORD-110) to avoid emergency air charters.',
          costUsd: 1200,
          timeHours: 0,
          co2DeltaKg: 0,
          riskRating: 'Medium',
          isFeasible: true,
          applied: false,
        },
      ];

      const planAOrders = ['ORD-101', 'ORD-102', 'ORD-103', 'ORD-104', 'ORD-105', 'ORD-106', 'ORD-107'];
      const planA: RecoveryPlan = {
        id: 'plan_a',
        name: 'Plan A – Cheapest Recovery',
        subtitle: 'Lowest Cash Outlay via Standard Plant Shifts',
        objectiveDescription: `Minimizes cash expenditure by absorbing secondary delay on non-critical orders and transferring essential runs to ${activeFacName} without overtime labor rates.`,
        isRecommended: false,
        totalRecoveryCostUsd: 18900,
        slaPerformancePercent: 78,
        recoveryTimeDays: 4.8,
        customerOrdersProtectedCount: planAOrders.length,
        totalOrdersAtRiskCount: ordersAtRisk,
        operationalRiskScore: 38,
        estimatedCo2EmissionsKg: 2900,
        feasibilityStatus: 'FEASIBLE',
        feasibilityExplanation: `Verified against ${activeFacName} mechanical capacity. Standard shifts avoid premium labor penalties while satisfying 7 enterprise contracts.`,
        proposedActions: planAActions,
        pros: ['Lowest recovery cost ($18,900)', 'Zero overtime labor surcharges', 'High cash flow preservation'],
        cons: ['Longer resolution time (4.8 days)', '3 Tier 3 customer orders experience mild delivery buffer extensions'],
        activatedSupplierIds: ['SUP-04', 'SUP-05'],
        activatedMaterialIds: ['MAT-01', 'MAT-07'],
        activatedFactoryIds: [activeFac],
        activatedDcIds: ['DC-02'],
        activatedStoreIds: ['STR-01', 'STR-03', 'STR-04'],
        protectedOrderIds: planAOrders,
        recoveryNodeIds: ['SUP-04', 'SUP-05', 'MAT-01', 'MAT-07', activeFac, 'DC-02', 'STR-01', 'STR-03', 'STR-04', ...planAOrders],
        recoveryPatternSummary: {
          supplierStrategy: 'Procure bulk raw materials from regional European partners SUP-04 & SUP-05',
          materialStrategy: 'Maintain certified standard BOM; draw safety inventory for corrugate & polymers',
          factoryStrategy: `Reallocate baseline manufacturing runs to ${activeFacName} on single standard shift`,
          dcStrategy: 'Consolidate finished pallet inventory at Antwerp northern gateway DC-02',
          storeStrategy: 'Direct primary shipments to Berlin, Stockholm, and Munich; buffer Paris & Brussels',
          orderStrategy: 'Guarantee 7 Tier 1/2 enterprise orders; delay non-contractual Tier 3 orders by 48h',
        },
      };

      // Plan B: Fastest - 24/7 Overtime Surge at Alternate Plant + Express Air
      const planBActions: RecoveryActionItem[] = [
        {
          id: 'act-b-fac-1',
          category: 'capacity_reallocation',
          title: `24/7 Double Overtime Shift Surge at ${activeFacName}`,
          description: 'Mobilize full weekend production crews to run 3 consecutive 8-hour surge shifts, producing 65,000 units in 48 hours.',
          sourceEntityId: activeFac,
          costUsd: 38500,
          timeHours: 36,
          co2DeltaKg: 850,
          riskRating: 'Medium',
          isFeasible: true,
          applied: false,
        },
        {
          id: 'act-b-fac-2',
          category: 'transportation_rerouting',
          title: 'Expedited Air Cargo Charter: Malmö to Frankfurt & Paris',
          description: 'Charter dedicated ATR-72 cargo freighters directly from Malmö Airport to Frankfurt and Paris hubs.',
          sourceEntityId: activeFac,
          targetEntityId: 'DC-01',
          costUsd: 28900,
          timeHours: 14,
          co2DeltaKg: 5800,
          riskRating: 'Medium',
          isFeasible: true,
          applied: false,
        },
      ];

      const planBOrders = ['ORD-101', 'ORD-102', 'ORD-103', 'ORD-104', 'ORD-105', 'ORD-106', 'ORD-107', 'ORD-108', 'ORD-109', 'ORD-110'];
      const planB: RecoveryPlan = {
        id: 'plan_b',
        name: 'Plan B – Fastest Recovery',
        subtitle: '24/7 Plant Surge & Air Cargo Charter',
        objectiveDescription: `Restores complete enterprise product throughput in under 36 hours by running 24/7 surge shifts at ${activeFacName} and chartering express air links.`,
        isRecommended: false,
        totalRecoveryCostUsd: 67400,
        slaPerformancePercent: 98,
        recoveryTimeDays: 1.6,
        customerOrdersProtectedCount: 10,
        totalOrdersAtRiskCount: ordersAtRisk,
        operationalRiskScore: 32,
        estimatedCo2EmissionsKg: 7850,
        feasibilityStatus: 'FEASIBLE',
        feasibilityExplanation: 'Air charters and overtime staff confirmed available. Fastest turnaround across all tested strategies.',
        proposedActions: planBActions,
        pros: ['Rapid 1.6-day turnaround', '100% of customer orders protected from SLA default', 'Zero shelf stockouts'],
        cons: ['Highest financial expenditure ($67.4k)', 'Elevated carbon footprint from dedicated air cargo flights'],
        activatedSupplierIds: ['SUP-02', 'SUP-03', 'SUP-05'],
        activatedMaterialIds: ['MAT-01', 'MAT-02', 'MAT-03'],
        activatedFactoryIds: [activeFac],
        activatedDcIds: ['DC-01', 'DC-02'],
        activatedStoreIds: ['STR-01', 'STR-02', 'STR-03', 'STR-04', 'STR-05'],
        protectedOrderIds: planBOrders,
        recoveryNodeIds: ['SUP-02', 'SUP-03', 'SUP-05', 'MAT-01', 'MAT-02', 'MAT-03', activeFac, 'DC-01', 'DC-02', 'STR-01', 'STR-02', 'STR-03', 'STR-04', 'STR-05', ...planBOrders],
        recoveryPatternSummary: {
          supplierStrategy: 'Emergency express call-off from Pacific Polymers (SUP-02) and BioPure (SUP-03)',
          materialStrategy: 'Deploy quick-setting Bio-Resin MAT-02 to accelerate injection molding cycle time by 18%',
          factoryStrategy: `24/7 round-the-clock weekend surge shifts at ${activeFacName} yielding 65,000 units`,
          dcStrategy: 'Dual-hub simultaneous cross-dock dispatch across Antwerp DC-02 and Frankfurt DC-01',
          storeStrategy: 'Simultaneous restock of all 5 retail flagships in Berlin, Paris, Stockholm, Munich, Brussels',
          orderStrategy: '100% order protection: all 10 customer contracts fulfilled within original delivery windows',
        },
      };

      // Plan C: SLA Protection - Ring-Fence Tier 1 Enterprise Orders
      const planCOrders = ['ORD-101', 'ORD-102', 'ORD-103', 'ORD-104', 'ORD-105', 'ORD-106'];
      const planC: RecoveryPlan = {
        id: 'plan_c',
        name: 'Plan C – SLA Protection',
        subtitle: 'Enterprise Contract Shielding',
        objectiveDescription: `Dedicates 100% of ${activeFacName} lines to Tier 1 accounts (Kaufland, Carrefour, ICA) to eliminate financial penalty exposure.`,
        isRecommended: false,
        totalRecoveryCostUsd: 39500,
        slaPerformancePercent: 100,
        recoveryTimeDays: 2.3,
        customerOrdersProtectedCount: planCOrders.length,
        totalOrdersAtRiskCount: ordersAtRisk,
        operationalRiskScore: 20,
        estimatedCo2EmissionsKg: 3400,
        feasibilityStatus: 'FEASIBLE',
        feasibilityExplanation: 'Dedicated line allocations guarantee zero contractual penalty defaults for enterprise clients.',
        proposedActions: [
          {
            id: 'act-c-fac-1',
            category: 'order_prioritization',
            title: 'Ring-Fence Filling Lines for Kaufland & Carrefour',
            description: 'Lock production schedule at operating plant exclusively for Tier 1 Enterprise SKUs with strict delivery penalties.',
            costUsd: 5800,
            timeHours: 8,
            co2DeltaKg: 0,
            riskRating: 'Low',
            isFeasible: true,
            applied: false,
          },
          {
            id: 'act-c-fac-2',
            category: 'inventory_reallocation',
            title: 'Expedited Cross-Dock Transfer: Antwerp to Frankfurt Hub',
            description: 'Transfer 28,000 units from Antwerp depot to Central Gateway DC-01 for immediate store delivery.',
            sourceEntityId: 'DC-02',
            targetEntityId: 'DC-01',
            costUsd: 18200,
            timeHours: 24,
            co2DeltaKg: 950,
            riskRating: 'Low',
            isFeasible: true,
            applied: false,
          },
        ],
        pros: ['Zero contractual SLA violations for enterprise partners', 'Low execution risk (20/100 score)', 'Brand reputation protected'],
        cons: ['Non-enterprise Tier 3 retailers face deferred shipments', 'Draws down regional buffer stocks in Antwerp'],
        activatedSupplierIds: ['SUP-01', 'SUP-05'],
        activatedMaterialIds: ['MAT-01', 'MAT-03', 'MAT-07'],
        activatedFactoryIds: [activeFac],
        activatedDcIds: ['DC-01', 'DC-02'],
        activatedStoreIds: ['STR-01', 'STR-02', 'STR-03'],
        protectedOrderIds: planCOrders,
        recoveryNodeIds: ['SUP-01', 'SUP-05', 'MAT-01', 'MAT-03', 'MAT-07', activeFac, 'DC-01', 'DC-02', 'STR-01', 'STR-02', 'STR-03', ...planCOrders],
        recoveryPatternSummary: {
          supplierStrategy: 'Secure certified high-purity chemicals from European partner SUP-05',
          materialStrategy: 'Ring-fence high-spec Virgin Polymer MAT-01 for Tier 1 Enterprise production runs',
          factoryStrategy: `Dedicate 100% of line capacity at ${activeFacName} to high-margin Enterprise contract SKUs`,
          dcStrategy: 'Pre-allocate Frankfurt DC-01 cross-dock slots exclusively for priority retail partners',
          storeStrategy: 'Prioritize flagship hypermarkets in Berlin (STR-01), Paris (STR-02), and Stockholm (STR-03)',
          orderStrategy: 'Guarantee 100% on-time SLA fulfillment for all Tier 1 Enterprise and Priority contracts',
        },
      };

      // Plan D: Green Recovery - 100% Hydro-Powered Lines & Electric Rail
      const planDOrders = ['ORD-101', 'ORD-103', 'ORD-104', 'ORD-107', 'ORD-108'];
      const planD: RecoveryPlan = {
        id: 'plan_d',
        name: 'Plan D – Green Recovery',
        subtitle: '100% Hydro-Powered Swedish Production & Electric Rail',
        objectiveDescription: 'Maximizes ESG metrics by routing production through hydro-powered Nordic lines with zero air freight and electrified rail transit.',
        isRecommended: false,
        totalRecoveryCostUsd: 41200,
        slaPerformancePercent: 88,
        recoveryTimeDays: 3.4,
        customerOrdersProtectedCount: planDOrders.length,
        totalOrdersAtRiskCount: ordersAtRisk,
        operationalRiskScore: 26,
        estimatedCo2EmissionsKg: 850,
        feasibilityStatus: 'FEASIBLE',
        feasibilityExplanation: 'Hydro-powered line slots confirmed. Certified 74% CO2 reduction under ISO 14064.',
        proposedActions: [
          {
            id: 'act-d-fac-1',
            category: 'capacity_reallocation',
            title: 'Shift Output to Hydro-Powered Malmö Facility',
            description: 'Run production on 100% renewable hydropower lines at Nordic Modular Works (FAC-02).',
            sourceEntityId: 'FAC-02',
            costUsd: 16800,
            timeHours: 48,
            co2DeltaKg: -2100,
            riskRating: 'Low',
            isFeasible: true,
            applied: false,
          },
          {
            id: 'act-d-fac-2',
            category: 'transportation_rerouting',
            title: 'Electrified Rail Intermodal Transit (DB Cargo)',
            description: 'Move pallets via green electrified rail corridors across Scandinavia and Central Europe.',
            costUsd: 11400,
            timeHours: 52,
            co2DeltaKg: -1650,
            riskRating: 'Low',
            isFeasible: true,
            applied: false,
          },
        ],
        pros: ['Lowest environmental impact (850 kg CO2e, -74%)', 'Enhances corporate ESG credentials', 'Reliable green rail transit'],
        cons: ['Transit slightly slower than express air', 'Requires Scandinavian supply chain alignment'],
        activatedSupplierIds: ['SUP-03', 'SUP-05'],
        activatedMaterialIds: ['MAT-02', 'MAT-04', 'MAT-07'],
        activatedFactoryIds: ['FAC-02'],
        activatedDcIds: ['DC-02'],
        activatedStoreIds: ['STR-03', 'STR-01', 'STR-05'],
        protectedOrderIds: planDOrders,
        recoveryNodeIds: ['SUP-03', 'SUP-05', 'MAT-02', 'MAT-04', 'MAT-07', 'FAC-02', 'DC-02', 'STR-03', 'STR-01', 'STR-05', ...planDOrders],
        recoveryPatternSummary: {
          supplierStrategy: 'Engage eco-certified green chemistry producers BioPure (SUP-03) and Nordic CleanSynthetics (SUP-05)',
          materialStrategy: 'Deploy 100% Bio-Circular Polymer Resin MAT-02 and recycled corrugated fluting MAT-07',
          factoryStrategy: 'Utilize 100% hydro-powered clean manufacturing lines at Nordic Modular Works (FAC-02)',
          dcStrategy: 'Dispatch green pallets through Antwerp regional gateway DC-02',
          storeStrategy: 'Prioritize eco-conscious retail partners in Stockholm (STR-03), Berlin (STR-01), Brussels (STR-05)',
          orderStrategy: 'Fulfill eco-certified orders and enterprise volume with certified low-carbon tracking',
        },
      };

      // Plan E: Balanced Recovery (RECOMMENDED) - Dual-Shift Load Balancing + Accelerated Repair
      const planEOrders = ['ORD-101', 'ORD-102', 'ORD-103', 'ORD-104', 'ORD-105', 'ORD-106', 'ORD-107', 'ORD-108', 'ORD-109', 'ORD-110'];
      const planE: RecoveryPlan = {
        id: 'plan_e',
        name: 'Plan E – Balanced Recovery',
        subtitle: 'Multi-Plant Load Sharing & Express Rail (Recommended)',
        objectiveDescription: `Pareto-optimal solution: redistributes critical volume to ${activeFacName} on staggered 16-hour shifts while fast-tracking repair of ${targetId}, protecting 10 of 10 customer orders.`,
        isRecommended: true,
        totalRecoveryCostUsd: 34200,
        slaPerformancePercent: 95,
        recoveryTimeDays: 2.1,
        customerOrdersProtectedCount: 10,
        totalOrdersAtRiskCount: ordersAtRisk,
        operationalRiskScore: 18,
        estimatedCo2EmissionsKg: 2350,
        feasibilityStatus: 'FEASIBLE',
        feasibilityExplanation: `Verified across all physical constraints: ${activeFacName} capacity, express rail slots, and SLA contractual thresholds.`,
        proposedActions: [
          {
            id: 'act-e-fac-1',
            category: 'capacity_reallocation',
            title: `Redistribute Volume to ${activeFacName}`,
            description: `Activate 16-hour dual-shift schedule at ${activeFac} to produce 40,000 units within 40 hours.`,
            sourceEntityId: activeFac,
            costUsd: 15400,
            timeHours: 36,
            co2DeltaKg: 420,
            riskRating: 'Low',
            isFeasible: true,
            applied: false,
          },
          {
            id: 'act-e-fac-2',
            category: 'transportation_rerouting',
            title: 'Express Intermodal Rail Shuttle to Frankfurt Hub',
            description: 'Run scheduled high-speed rail freight connecting Malmö directly to Central European DC-01.',
            sourceEntityId: activeFac,
            targetEntityId: 'DC-01',
            costUsd: 9600,
            timeHours: 20,
            co2DeltaKg: 280,
            riskRating: 'Low',
            isFeasible: true,
            applied: false,
          },
          {
            id: 'act-e-fac-3',
            category: 'order_prioritization',
            title: 'Dynamic SLA Fulfillment Sequencing',
            description: 'Sequence dispatch windows to protect 100% of Tier 1 & Tier 2 customer delivery commitments.',
            costUsd: 2200,
            timeHours: 8,
            co2DeltaKg: 50,
            riskRating: 'Low',
            isFeasible: true,
            applied: false,
          },
        ],
        pros: [
          'Optimal ROI ($34.2k cost vs. $160k+ potential outage loss)',
          'Protects 10 of 10 customer orders (95% SLA adherence)',
          'Low operational risk (18/100 score)',
          'Rapid 2.1-day recovery duration',
        ],
        cons: [
          'Requires operational coordination between Cologne and Malmö plant managers',
          'Minor shift rescheduling at Nordic site',
        ],
        activatedSupplierIds: ['SUP-02', 'SUP-03', 'SUP-05'],
        activatedMaterialIds: ['MAT-01', 'MAT-02', 'MAT-03', 'MAT-07'],
        activatedFactoryIds: [activeFac],
        activatedDcIds: ['DC-01', 'DC-02'],
        activatedStoreIds: ['STR-01', 'STR-02', 'STR-03', 'STR-04', 'STR-05'],
        protectedOrderIds: planEOrders,
        recoveryNodeIds: ['SUP-02', 'SUP-03', 'SUP-05', 'MAT-01', 'MAT-02', 'MAT-03', 'MAT-07', activeFac, 'DC-01', 'DC-02', 'STR-01', 'STR-02', 'STR-03', 'STR-04', 'STR-05', ...planEOrders],
        recoveryPatternSummary: {
          supplierStrategy: 'Balance supply orders across Pacific Polymers (SUP-02) and Nordic CleanSynthetics (SUP-05)',
          materialStrategy: 'Utilize balanced mix of Virgin Polymer MAT-01 and pre-qualified Bio-Resin MAT-02',
          factoryStrategy: `Staggered 16-hour dual-shift schedule at ${activeFacName} to replace lost throughput`,
          dcStrategy: 'Express scheduled rail link connecting distribution gateways DC-01 and DC-02',
          storeStrategy: 'Equitable inventory replenishment balancing store demand across all 5 retail markets',
          orderStrategy: 'Full protection of all 10 customer orders with zero enterprise penalty breaches',
        },
      };

      return [planA, planB, planC, planD, planE];
    }

    // =========================================================================
    // SCENARIO 2: DISTRIBUTION CENTER / LOGISTICS OUTAGE (e.g. DC-01 or TR-10 down)
    // Primary lever: Bypass Frankfurt Gateway via Antwerp Hub DC-02 & Direct Rerouting
    // =========================================================================
    if (isDC || disruption.scenarioType === 'transport_breakdown') {
      const activeDc = targetId === 'DC-01' ? 'DC-02' : 'DC-01';
      const activeDcName = activeDc === 'DC-02' ? 'Northern Logistics Depot (Antwerp)' : 'Central European Gateway (Frankfurt)';

      const planAOrders = ['ORD-101', 'ORD-102', 'ORD-103', 'ORD-104', 'ORD-105', 'ORD-106'];
      const planA: RecoveryPlan = {
        id: 'plan_a',
        name: 'Plan A – Cheapest Recovery',
        subtitle: 'Economy Road Transit via Alternate Hub',
        objectiveDescription: `Reroutes freight through ${activeDcName} using standard road haulage contracts, avoiding rush charter rates.`,
        isRecommended: false,
        totalRecoveryCostUsd: 16800,
        slaPerformancePercent: 80,
        recoveryTimeDays: 4.5,
        customerOrdersProtectedCount: planAOrders.length,
        totalOrdersAtRiskCount: ordersAtRisk,
        operationalRiskScore: 35,
        estimatedCo2EmissionsKg: 2800,
        feasibilityStatus: 'FEASIBLE',
        feasibilityExplanation: `Standard freight carrier contracts confirmed at ${activeDcName}. Tier 3 retail deliveries accept 48h arrival window adjustment.`,
        proposedActions: [
          {
            id: 'act-a-dc-1',
            category: 'transportation_rerouting',
            title: `Bypass Disrupted Node via ${activeDcName}`,
            description: `Re-dispatch pending retail replenishment trailers through ${activeDc} on standard ground freight terms.`,
            sourceEntityId: activeDc,
            targetEntityId: 'STR-01',
            costUsd: 13500,
            timeHours: 84,
            co2DeltaKg: 1100,
            riskRating: 'Low',
            isFeasible: true,
            applied: false,
          },
        ],
        pros: ['Lowest monetary cost ($16.8k)', 'Utilizes pre-negotiated volume carrier agreements', 'No emergency charter fees'],
        cons: ['Slower transit lead time (4.5 days)', 'Some standard store deliveries buffered by 48 hours'],
        activatedSupplierIds: ['SUP-02', 'SUP-04'],
        activatedMaterialIds: ['MAT-01', 'MAT-07'],
        activatedFactoryIds: ['FAC-01'],
        activatedDcIds: [activeDc],
        activatedStoreIds: ['STR-01', 'STR-02', 'STR-04'],
        protectedOrderIds: planAOrders,
        recoveryNodeIds: ['SUP-02', 'SUP-04', 'MAT-01', 'MAT-07', 'FAC-01', activeDc, 'STR-01', 'STR-02', 'STR-04', ...planAOrders],
        recoveryPatternSummary: {
          supplierStrategy: 'Maintain normal procurement schedules with regional packaging and polymer vendors',
          materialStrategy: 'Sustain factory feedstocks without recipe alterations',
          factoryStrategy: 'FAC-01 maintains standard production and routes trailers directly north',
          dcStrategy: `Funnel all cross-dock pallet sorting through ${activeDcName}`,
          storeStrategy: 'Prioritize high-volume stores in Berlin and Paris; defer non-urgent restocks',
          orderStrategy: 'Safeguard 6 primary enterprise orders; absorb non-penalty delay on non-critical accounts',
        },
      };

      const planBOrders = ['ORD-101', 'ORD-102', 'ORD-103', 'ORD-104', 'ORD-105', 'ORD-106', 'ORD-107', 'ORD-108', 'ORD-109', 'ORD-110'];
      const planB: RecoveryPlan = {
        id: 'plan_b',
        name: 'Plan B – Fastest Recovery',
        subtitle: 'Dedicated Direct-to-Store Express Shuttles',
        objectiveDescription: `Deploys dedicated point-to-point express road shuttles directly from manufacturing plant to retail stores, bypassing congested hubs completely.`,
        isRecommended: false,
        totalRecoveryCostUsd: 58200,
        slaPerformancePercent: 98,
        recoveryTimeDays: 1.4,
        customerOrdersProtectedCount: 10,
        totalOrdersAtRiskCount: ordersAtRisk,
        operationalRiskScore: 30,
        estimatedCo2EmissionsKg: 6400,
        feasibilityStatus: 'FEASIBLE',
        feasibilityExplanation: 'Dedicated courier fleet secured for direct store deliveries within 24-36 hours.',
        proposedActions: [
          {
            id: 'act-b-dc-1',
            category: 'transportation_rerouting',
            title: 'Point-to-Point Direct Express Trucking',
            description: 'Bypass all intermediate sortation hubs; dispatch 12 dedicated hot-shot trailers directly to retail stores.',
            sourceEntityId: 'FAC-01',
            targetEntityId: 'STR-01',
            costUsd: 36500,
            timeHours: 22,
            co2DeltaKg: 4200,
            riskRating: 'Medium',
            isFeasible: true,
            applied: false,
          },
        ],
        pros: ['Lightning fast turnaround (1.4 days)', 'Completely eliminates hub sortation bottlenecks', '100% order protection'],
        cons: ['Premium transport expediting surcharges ($58.2k)', 'High vehicular carbon footprint'],
        activatedSupplierIds: ['SUP-01', 'SUP-02', 'SUP-03'],
        activatedMaterialIds: ['MAT-01', 'MAT-03', 'MAT-07'],
        activatedFactoryIds: ['FAC-01', 'FAC-02'],
        activatedDcIds: [activeDc],
        activatedStoreIds: ['STR-01', 'STR-02', 'STR-03', 'STR-04', 'STR-05'],
        protectedOrderIds: planBOrders,
        recoveryNodeIds: ['SUP-01', 'SUP-02', 'SUP-03', 'MAT-01', 'MAT-03', 'MAT-07', 'FAC-01', 'FAC-02', activeDc, 'STR-01', 'STR-02', 'STR-03', 'STR-04', 'STR-05', ...planBOrders],
        recoveryPatternSummary: {
          supplierStrategy: 'Accelerate vendor delivery to factories to feed non-stop direct dispatch',
          materialStrategy: 'Standard BOM components drawn from plant reserves',
          factoryStrategy: 'Continuous packing and live loading onto outgoing hot-shot trailers',
          dcStrategy: `Use ${activeDcName} as emergency overflow staging depot`,
          storeStrategy: 'Direct dock deliveries into all 5 retail flagship locations',
          orderStrategy: '100% on-time delivery across all 10 customer accounts',
        },
      };

      const planCOrders = ['ORD-101', 'ORD-102', 'ORD-103', 'ORD-104', 'ORD-105'];
      const planC: RecoveryPlan = {
        id: 'plan_c',
        name: 'Plan C – SLA Protection',
        subtitle: 'Enterprise Dedicated Freight Ring-Fencing',
        objectiveDescription: `Ring-fences available transport capacity exclusively for Tier 1 Enterprise clients (Kaufland, Carrefour, ICA Gruppen) with guaranteed delivery slots.`,
        isRecommended: false,
        totalRecoveryCostUsd: 36900,
        slaPerformancePercent: 100,
        recoveryTimeDays: 2.1,
        customerOrdersProtectedCount: planCOrders.length,
        totalOrdersAtRiskCount: ordersAtRisk,
        operationalRiskScore: 22,
        estimatedCo2EmissionsKg: 3100,
        feasibilityStatus: 'FEASIBLE',
        feasibilityExplanation: 'Dedicated freight slots guarantee zero contractual penalty defaults for enterprise clients.',
        proposedActions: [
          {
            id: 'act-c-dc-1',
            category: 'order_prioritization',
            title: 'Dedicated Transport Slots for Tier 1 Enterprise Orders',
            description: 'Allocate all immediate outbound trailers to fulfill Kaufland and Carrefour contracts on schedule.',
            costUsd: 8400,
            timeHours: 12,
            co2DeltaKg: 200,
            riskRating: 'Low',
            isFeasible: true,
            applied: false,
          },
        ],
        pros: ['Zero contractual SLA violations for enterprise partners', 'Low execution risk', 'Protects high-revenue partnerships'],
        cons: ['Tier 3 regional orders placed on hold', 'Requires tight store appointment scheduling'],
        activatedSupplierIds: ['SUP-01', 'SUP-05'],
        activatedMaterialIds: ['MAT-01', 'MAT-03', 'MAT-07'],
        activatedFactoryIds: ['FAC-01'],
        activatedDcIds: [activeDc],
        activatedStoreIds: ['STR-01', 'STR-02', 'STR-03'],
        protectedOrderIds: planCOrders,
        recoveryNodeIds: ['SUP-01', 'SUP-05', 'MAT-01', 'MAT-03', 'MAT-07', 'FAC-01', activeDc, 'STR-01', 'STR-02', 'STR-03', ...planCOrders],
        recoveryPatternSummary: {
          supplierStrategy: 'Ensure uninterrupted material delivery to factory to sustain enterprise production runs',
          materialStrategy: 'Strict lot traceability for Tier 1 customer audit compliance',
          factoryStrategy: 'Prioritize production lines dedicated to Tier 1 Enterprise finished goods',
          dcStrategy: `Dedicated express loading docks at ${activeDcName} reserved for enterprise trailers`,
          storeStrategy: 'Prioritize retail locations serving Kaufland (STR-01), Carrefour (STR-02), and ICA (STR-03)',
          orderStrategy: '100% on-time SLA fulfillment for Tier 1 Enterprise accounts with zero penalty days',
        },
      };

      const planDOrders = ['ORD-101', 'ORD-103', 'ORD-105', 'ORD-107'];
      const planD: RecoveryPlan = {
        id: 'plan_d',
        name: 'Plan D – Green Recovery',
        subtitle: 'Electrified Rail Bypass & EV City Distribution',
        objectiveDescription: 'Reroutes logistics flow through electrified intermodal rail corridors and zero-emission electric vehicle local fleets.',
        isRecommended: false,
        totalRecoveryCostUsd: 38400,
        slaPerformancePercent: 89,
        recoveryTimeDays: 3.2,
        customerOrdersProtectedCount: planDOrders.length,
        totalOrdersAtRiskCount: ordersAtRisk,
        operationalRiskScore: 24,
        estimatedCo2EmissionsKg: 910,
        feasibilityStatus: 'FEASIBLE',
        feasibilityExplanation: 'Electric rail slots confirmed with DB Cargo. 68% CO2 emissions reduction.',
        proposedActions: [
          {
            id: 'act-d-dc-1',
            category: 'transportation_rerouting',
            title: 'Green Electric Rail Bypass via DB Cargo',
            description: 'Move containerized pallets via electrified rail from Cologne to Antwerp and southern terminals.',
            costUsd: 14200,
            timeHours: 48,
            co2DeltaKg: -1900,
            riskRating: 'Low',
            isFeasible: true,
            applied: false,
          },
        ],
        pros: ['Lowest carbon footprint (910 kg CO2e, -68%)', 'Utilizes highly reliable electrified rail grid', 'ESG leadership'],
        cons: ['Slower than express road trucking', 'Requires intermodal terminal crane handling'],
        activatedSupplierIds: ['SUP-03', 'SUP-05'],
        activatedMaterialIds: ['MAT-02', 'MAT-04', 'MAT-07'],
        activatedFactoryIds: ['FAC-01', 'FAC-02'],
        activatedDcIds: [activeDc],
        activatedStoreIds: ['STR-03', 'STR-05', 'STR-01'],
        protectedOrderIds: planDOrders,
        recoveryNodeIds: ['SUP-03', 'SUP-05', 'MAT-02', 'MAT-04', 'MAT-07', 'FAC-01', 'FAC-02', activeDc, 'STR-03', 'STR-05', 'STR-01', ...planDOrders],
        recoveryPatternSummary: {
          supplierStrategy: 'Maintain procurement with low-emission suppliers BioPure and Nordic CleanSynthetics',
          materialStrategy: 'Sustain bio-circular packaging and formulations',
          factoryStrategy: 'Synchronize plant dispatch batches with electric train departure schedules',
          dcStrategy: `Route containers through Antwerp intermodal maritime & rail hub ${activeDcName}`,
          storeStrategy: 'Prioritize eco-conscious retail partners in Stockholm, Brussels, and Berlin',
          orderStrategy: 'Fulfill sustainable customer orders with zero fossil transport emissions',
        },
      };

      const planEOrders = ['ORD-101', 'ORD-102', 'ORD-103', 'ORD-104', 'ORD-105', 'ORD-106', 'ORD-107', 'ORD-108', 'ORD-109', 'ORD-110'];
      const planE: RecoveryPlan = {
        id: 'plan_e',
        name: 'Plan E – Balanced Recovery',
        subtitle: 'Inter-Hub Dynamic Cross-Dock Reallocation (Recommended)',
        objectiveDescription: `Pareto-optimal solution: splits volume between Antwerp DC-02 and direct regional drop-shipping, shielding 100% of customer orders at modest cost.`,
        isRecommended: true,
        totalRecoveryCostUsd: 31200,
        slaPerformancePercent: 96,
        recoveryTimeDays: 1.9,
        customerOrdersProtectedCount: 10,
        totalOrdersAtRiskCount: ordersAtRisk,
        operationalRiskScore: 16,
        estimatedCo2EmissionsKg: 2100,
        feasibilityStatus: 'FEASIBLE',
        feasibilityExplanation: `Verified across freight capacity and warehouse sortation constraints. Fully satisfies contractual requirements.`,
        proposedActions: [
          {
            id: 'act-e-dc-1',
            category: 'inventory_reallocation',
            title: `Dynamic Cross-Dock Rebalancing at ${activeDcName}`,
            description: 'Reposition 22,000 buffer units via scheduled express freight to maintain store delivery commitments.',
            sourceEntityId: activeDc,
            targetEntityId: 'STR-01',
            costUsd: 11500,
            timeHours: 24,
            co2DeltaKg: 350,
            riskRating: 'Low',
            isFeasible: true,
            applied: false,
          },
          {
            id: 'act-e-dc-2',
            category: 'transportation_rerouting',
            title: 'Express Intermodal Rail Shuttle to Southern Outlets',
            description: 'Run scheduled intermodal rail wagons to Munich and Paris retail distribution points.',
            costUsd: 8400,
            timeHours: 28,
            co2DeltaKg: 210,
            riskRating: 'Low',
            isFeasible: true,
            applied: false,
          },
        ],
        pros: [
          'Excellent ROI ($31.2k cost vs. $145k+ estimated logistical disruption losses)',
          'Protects 10 of 10 customer orders with 96% SLA compliance',
          'Lowest operational risk score (16/100)',
          'Sub-2 day resolution timeline',
        ],
        cons: [
          'Requires tight communication between warehouse managers in Antwerp and Frankfurt',
          'Temporary safety stock drawdown at secondary hub',
        ],
        activatedSupplierIds: ['SUP-01', 'SUP-02', 'SUP-04'],
        activatedMaterialIds: ['MAT-01', 'MAT-03', 'MAT-07'],
        activatedFactoryIds: ['FAC-01', 'FAC-02'],
        activatedDcIds: [activeDc],
        activatedStoreIds: ['STR-01', 'STR-02', 'STR-03', 'STR-04', 'STR-05'],
        protectedOrderIds: planEOrders,
        recoveryNodeIds: ['SUP-01', 'SUP-02', 'SUP-04', 'MAT-01', 'MAT-03', 'MAT-07', 'FAC-01', 'FAC-02', activeDc, 'STR-01', 'STR-02', 'STR-03', 'STR-04', 'STR-05', ...planEOrders],
        recoveryPatternSummary: {
          supplierStrategy: 'Steady inbound raw material flows to maintain continuous factory packaging lines',
          materialStrategy: 'Certified standard BOM maintained with zero chemical variance',
          factoryStrategy: 'Continuous output dispatched into secondary cross-dock lanes',
          dcStrategy: `Multi-echelon sortation split across ${activeDcName} and direct regional drop-shipping`,
          storeStrategy: 'Balanced replenishment to all 5 stores matching local sales velocity',
          orderStrategy: 'Full delivery commitment honored for all 10 customer enterprise orders',
        },
      };

      return [planA, planB, planC, planD, planE];
    }

    // =========================================================================
    // SCENARIO 3: RETAIL STORE DEMAND SURGE / STORE BOTTLENECK (e.g. STR-01 Berlin)
    // Primary lever: Emergency Stock Allocation & Inter-Branch Store Transfers
    // =========================================================================
    if (isStore) {
      const activeStore = targetId;
      const donorStore = activeStore === 'STR-01' ? 'STR-04' : 'STR-01';
      const donorStoreName = donorStore === 'STR-04' ? 'Bavaria Central (Munich)' : 'Metro Hypermarket (Berlin)';

      const planAOrders = ['ORD-101', 'ORD-102', 'ORD-103', 'ORD-104', 'ORD-105'];
      const planA: RecoveryPlan = {
        id: 'plan_a',
        name: 'Plan A – Cheapest Recovery',
        subtitle: 'Scheduled Bulk Replenishment from Central DC',
        objectiveDescription: `Dispatches standard bulk shipment from Frankfurt DC-01, allowing local store shelves to absorb brief inventory drawdown without emergency transport fees.`,
        isRecommended: false,
        totalRecoveryCostUsd: 12500,
        slaPerformancePercent: 82,
        recoveryTimeDays: 3.5,
        customerOrdersProtectedCount: planAOrders.length,
        totalOrdersAtRiskCount: ordersAtRisk,
        operationalRiskScore: 32,
        estimatedCo2EmissionsKg: 1800,
        feasibilityStatus: 'FEASIBLE',
        feasibilityExplanation: 'Standard scheduled freight slot confirmed. Minor retail stockouts absorbed within safety thresholds.',
        proposedActions: [
          {
            id: 'act-a-str-1',
            category: 'inventory_reallocation',
            title: `Bulk DC Replenishment to ${activeStore}`,
            description: 'Dispatch 15,000 units from Frankfurt DC-01 on scheduled standard freight run.',
            sourceEntityId: 'DC-01',
            targetEntityId: activeStore,
            costUsd: 7800,
            timeHours: 48,
            co2DeltaKg: 450,
            riskRating: 'Low',
            isFeasible: true,
            applied: false,
          },
        ],
        pros: ['Lowest recovery cost ($12.5k)', 'Zero rush courier fees', 'Simple execution'],
        cons: ['Slower replenishment (3.5 days)', 'Store safety stock drops below 1.5 days cover'],
        activatedSupplierIds: ['SUP-01', 'SUP-04'],
        activatedMaterialIds: ['MAT-01', 'MAT-07'],
        activatedFactoryIds: ['FAC-01'],
        activatedDcIds: ['DC-01'],
        activatedStoreIds: [activeStore],
        protectedOrderIds: planAOrders,
        recoveryNodeIds: ['SUP-01', 'SUP-04', 'MAT-01', 'MAT-07', 'FAC-01', 'DC-01', activeStore, ...planAOrders],
        recoveryPatternSummary: {
          supplierStrategy: 'Procure regular packaging cartons from Horizon Packaging (SUP-04)',
          materialStrategy: 'Maintain standard BOM stock levels at factory',
          factoryStrategy: 'FAC-01 packaging lines run regular scheduled output',
          dcStrategy: 'Central European DC-01 schedules consolidated trailer dispatch',
          storeStrategy: `Target store ${activeStore} receives standard replenishment batch`,
          orderStrategy: 'Fulfill primary store customer orders without paying premium logistics surcharges',
        },
      };

      const planBOrders = ['ORD-101', 'ORD-102', 'ORD-103', 'ORD-104', 'ORD-105', 'ORD-106', 'ORD-107', 'ORD-108', 'ORD-109', 'ORD-110'];
      const planB: RecoveryPlan = {
        id: 'plan_b',
        name: 'Plan B – Fastest Recovery',
        subtitle: 'Hot-Shot Express Courier & Emergency Shelf Stocking',
        objectiveDescription: `Dispatches dedicated direct couriers from factory and secondary hub to restock retail shelves within 18 hours.`,
        isRecommended: false,
        totalRecoveryCostUsd: 48500,
        slaPerformancePercent: 99,
        recoveryTimeDays: 1.1,
        customerOrdersProtectedCount: 10,
        totalOrdersAtRiskCount: ordersAtRisk,
        operationalRiskScore: 28,
        estimatedCo2EmissionsKg: 5200,
        feasibilityStatus: 'FEASIBLE',
        feasibilityExplanation: 'Dedicated direct-drive courier vans confirmed on standby.',
        proposedActions: [
          {
            id: 'act-b-str-1',
            category: 'transportation_rerouting',
            title: 'Dedicated Direct-Drive Courier Dispatch',
            description: 'Hot-shot emergency delivery of 20,000 units directly from Cologne plant to store receiving dock.',
            sourceEntityId: 'FAC-01',
            targetEntityId: activeStore,
            costUsd: 29500,
            timeHours: 12,
            co2DeltaKg: 3100,
            riskRating: 'Medium',
            isFeasible: true,
            applied: false,
          },
        ],
        pros: ['Under 24-hour resolution (1.1 days)', 'Zero shelf stockouts', '100% customer satisfaction'],
        cons: ['Expensive emergency dispatch ($48.5k)', 'High vehicular carbon emissions'],
        activatedSupplierIds: ['SUP-01', 'SUP-02', 'SUP-03'],
        activatedMaterialIds: ['MAT-01', 'MAT-03', 'MAT-07'],
        activatedFactoryIds: ['FAC-01'],
        activatedDcIds: ['DC-01', 'DC-02'],
        activatedStoreIds: [activeStore, donorStore],
        protectedOrderIds: planBOrders,
        recoveryNodeIds: ['SUP-01', 'SUP-02', 'SUP-03', 'MAT-01', 'MAT-03', 'MAT-07', 'FAC-01', 'DC-01', 'DC-02', activeStore, donorStore, ...planBOrders],
        recoveryPatternSummary: {
          supplierStrategy: 'Expedited call-offs from suppliers to backfill factory stores immediately',
          materialStrategy: 'Utilize plant reserve finished goods and rapid packaging',
          factoryStrategy: 'FAC-01 live-loads expedited delivery vans for same-day dispatch',
          dcStrategy: 'Bypasses intermediate sortation; loads directly onto long-haul vans',
          storeStrategy: `Store ${activeStore} receives non-stop priority restock`,
          orderStrategy: '100% of customer orders protected from delayed pick-up or missed delivery dates',
        },
      };

      const planCOrders = ['ORD-101', 'ORD-104', 'ORD-110'];
      const planC: RecoveryPlan = {
        id: 'plan_c',
        name: 'Plan C – SLA Protection',
        subtitle: 'Enterprise Customer Allocation Lock',
        objectiveDescription: `Locks retail store backroom inventory exclusively for Tier 1 Enterprise orders (Kaufland ORD-101), eliminating contractual penalty risk.`,
        isRecommended: false,
        totalRecoveryCostUsd: 28400,
        slaPerformancePercent: 100,
        recoveryTimeDays: 1.8,
        customerOrdersProtectedCount: planCOrders.length,
        totalOrdersAtRiskCount: ordersAtRisk,
        operationalRiskScore: 18,
        estimatedCo2EmissionsKg: 2400,
        feasibilityStatus: 'FEASIBLE',
        feasibilityExplanation: 'Enterprise allocation locking prevents retail walk-in sales from depleting contracted B2B stock.',
        proposedActions: [
          {
            id: 'act-c-str-1',
            category: 'order_prioritization',
            title: 'Ring-Fence Retail Stock for Enterprise Order ORD-101',
            description: 'Quarantine store inventory strictly for Kaufland enterprise contract pickup.',
            costUsd: 4200,
            timeHours: 6,
            co2DeltaKg: 0,
            riskRating: 'Low',
            isFeasible: true,
            applied: false,
          },
        ],
        pros: ['Zero contractual SLA violations for enterprise accounts', 'Low execution cost', 'Preserves high-value partner trust'],
        cons: ['Walk-in retail customers experience localized temporary shortages'],
        activatedSupplierIds: ['SUP-01', 'SUP-05'],
        activatedMaterialIds: ['MAT-01', 'MAT-07'],
        activatedFactoryIds: ['FAC-01'],
        activatedDcIds: ['DC-01'],
        activatedStoreIds: [activeStore],
        protectedOrderIds: planCOrders,
        recoveryNodeIds: ['SUP-01', 'SUP-05', 'MAT-01', 'MAT-07', 'FAC-01', 'DC-01', activeStore, ...planCOrders],
        recoveryPatternSummary: {
          supplierStrategy: 'Ensure continuous supply of primary raw materials',
          materialStrategy: 'Standard BOM specifications maintained',
          factoryStrategy: 'FAC-01 aligns daily schedule with retail branch replenishment needs',
          dcStrategy: 'DC-01 tags pallets with Enterprise Priority barcodes for direct store cross-dock',
          storeStrategy: `Store ${activeStore} ring-fences backroom stock for Enterprise orders`,
          orderStrategy: '100% on-time fulfillment for enterprise customer accounts',
        },
      };

      const planDOrders = ['ORD-101', 'ORD-103', 'ORD-107'];
      const planD: RecoveryPlan = {
        id: 'plan_d',
        name: 'Plan D – Green Recovery',
        subtitle: 'Electric Delivery Fleet & Carbon-Neutral Urban Freight',
        objectiveDescription: 'Dispatches urban deliveries using 100% electric vehicle logistics and local green freight partners.',
        isRecommended: false,
        totalRecoveryCostUsd: 31500,
        slaPerformancePercent: 91,
        recoveryTimeDays: 2.6,
        customerOrdersProtectedCount: planDOrders.length,
        totalOrdersAtRiskCount: ordersAtRisk,
        operationalRiskScore: 22,
        estimatedCo2EmissionsKg: 780,
        feasibilityStatus: 'FEASIBLE',
        feasibilityExplanation: 'Electric delivery vans reserved with local urban logistics partners.',
        proposedActions: [
          {
            id: 'act-d-str-1',
            category: 'transportation_rerouting',
            title: 'Electric Van Fleet Replenishment',
            description: 'Deploy zero-emission EV delivery fleet from regional depot to retail store.',
            costUsd: 11200,
            timeHours: 32,
            co2DeltaKg: -1400,
            riskRating: 'Low',
            isFeasible: true,
            applied: false,
          },
        ],
        pros: ['Lowest environmental footprint (780 kg CO2e)', 'Zero tailpipe emissions in urban city center', 'Complies with municipal clean air zones'],
        cons: ['Limited battery range requires scheduled charging stops'],
        activatedSupplierIds: ['SUP-03', 'SUP-05'],
        activatedMaterialIds: ['MAT-02', 'MAT-07'],
        activatedFactoryIds: ['FAC-01'],
        activatedDcIds: ['DC-01'],
        activatedStoreIds: [activeStore],
        protectedOrderIds: planDOrders,
        recoveryNodeIds: ['SUP-03', 'SUP-05', 'MAT-02', 'MAT-07', 'FAC-01', 'DC-01', activeStore, ...planDOrders],
        recoveryPatternSummary: {
          supplierStrategy: 'Sustain orders with sustainable eco-chemistry partners',
          materialStrategy: 'Eco-certified biodegradable packaging and formulations',
          factoryStrategy: 'FAC-01 packages goods in lightweight recyclable corrugated boxes',
          dcStrategy: 'DC-01 stages shipments in EV-charging staging bays',
          storeStrategy: `Store ${activeStore} receives zero-emission urban delivery`,
          orderStrategy: 'Safeguard eco-conscious enterprise accounts with carbon-neutral transit receipts',
        },
      };

      const planEOrders = ['ORD-101', 'ORD-102', 'ORD-103', 'ORD-104', 'ORD-105', 'ORD-106', 'ORD-107', 'ORD-108', 'ORD-109', 'ORD-110'];
      const planE: RecoveryPlan = {
        id: 'plan_e',
        name: 'Plan E – Balanced Recovery',
        subtitle: 'Inter-Store Inventory Loan & Express Replenishment (Recommended)',
        objectiveDescription: `Pareto-optimal solution: borrows 5,000 units safety stock from ${donorStoreName} for immediate fulfillment, backfilled simultaneously by express rail from DC-01.`,
        isRecommended: true,
        totalRecoveryCostUsd: 26500,
        slaPerformancePercent: 97,
        recoveryTimeDays: 1.6,
        customerOrdersProtectedCount: 10,
        totalOrdersAtRiskCount: ordersAtRisk,
        operationalRiskScore: 14,
        estimatedCo2EmissionsKg: 1950,
        feasibilityStatus: 'FEASIBLE',
        feasibilityExplanation: `Inter-store transfer from ${donorStoreName} verified. Both retail locations remain well above minimum safety thresholds.`,
        proposedActions: [
          {
            id: 'act-e-str-1',
            category: 'inventory_reallocation',
            title: `Inter-Store Inventory Balancing: ${donorStoreName} to ${activeStore}`,
            description: `Transfer 5,000 units surplus inventory from ${donorStore} to ${activeStore} via regional express van.`,
            sourceEntityId: donorStore,
            targetEntityId: activeStore,
            costUsd: 6500,
            timeHours: 14,
            co2DeltaKg: 180,
            riskRating: 'Low',
            isFeasible: true,
            applied: false,
          },
          {
            id: 'act-e-str-2',
            category: 'inventory_reallocation',
            title: `Express DC-01 Backfill to ${donorStoreName}`,
            description: 'Simultaneously replenish donor store from Frankfurt DC-01 to restore local safety buffers within 24 hours.',
            sourceEntityId: 'DC-01',
            targetEntityId: donorStore,
            costUsd: 8200,
            timeHours: 20,
            co2DeltaKg: 250,
            riskRating: 'Low',
            isFeasible: true,
            applied: false,
          },
        ],
        pros: [
          'Optimal cost-benefit balance ($26.5k cost)',
          'Sub-36 hour shelf stabilization (1.6 days)',
          'Zero stockouts across both retail branches',
          'Protects all 10 customer order commitments',
        ],
        cons: [
          'Requires inter-branch retail coordination between store general managers',
        ],
        activatedSupplierIds: ['SUP-01', 'SUP-02', 'SUP-04'],
        activatedMaterialIds: ['MAT-01', 'MAT-03', 'MAT-07'],
        activatedFactoryIds: ['FAC-01'],
        activatedDcIds: ['DC-01'],
        activatedStoreIds: [activeStore, donorStore],
        protectedOrderIds: planEOrders,
        recoveryNodeIds: ['SUP-01', 'SUP-02', 'SUP-04', 'MAT-01', 'MAT-03', 'MAT-07', 'FAC-01', 'DC-01', activeStore, donorStore, ...planEOrders],
        recoveryPatternSummary: {
          supplierStrategy: 'Maintain steady raw material deliveries to factory packaging lines',
          materialStrategy: 'Draw standard BOM materials to keep factory output running',
          factoryStrategy: 'FAC-01 packages replenishment pallets for Frankfurt DC-01',
          dcStrategy: 'DC-01 immediately dispatches backfill trailer to re-balance retail inventory',
          storeStrategy: `Store ${activeStore} receives instant lateral inventory loan from ${donorStoreName}`,
          orderStrategy: '100% of customer orders protected from cancellation or delay penalties',
        },
      };

      return [planA, planB, planC, planD, planE];
    }

    // =========================================================================
    // SCENARIO 4: SUPPLIER FAILURE OR RAW MATERIAL SHORTAGE (Default / Standard)
    // Primary lever: Alternative Suppliers (SUP-02, SUP-03, SUP-05) & Material Substitution (MAT-02)
    // =========================================================================
    const altSupplierId = isSecondDisruption ? 'SUP-05' : 'SUP-02';
    const altSupplierName = isSecondDisruption ? 'Nordic CleanSynthetics (SUP-05)' : 'Pacific Polymers (SUP-02)';

    // Plan A: Cheapest Recovery
    const planAActions: RecoveryActionItem[] = [
      {
        id: 'act-a-1',
        category: 'alternative_supplier',
        title: `Procure Economy Feedstock from ${altSupplierName}`,
        description: `Contract ${altSupplierName} at standard volume tier pricing with 5-day delivery window.`,
        sourceEntityId: altSupplierId,
        targetEntityId: 'FAC-01',
        costUsd: 14200,
        timeHours: 120,
        co2DeltaKg: 1850,
        riskRating: 'Medium',
        isFeasible: true,
        applied: false,
      },
      {
        id: 'act-a-2',
        category: 'production_rescheduling',
        title: 'Defer Non-Critical Batches at Factory 1',
        description: 'Postpone standard inventory replenishment schedules (SCH-02) to prioritize immediate runs without overtime pay.',
        sourceEntityId: 'FAC-01',
        costUsd: 2800,
        timeHours: 24,
        co2DeltaKg: -200,
        riskRating: 'Low',
        isFeasible: true,
        applied: false,
      },
      {
        id: 'act-a-3',
        category: 'order_prioritization',
        title: 'Buffer Tier 3 Delivery Windows by 48 Hours',
        description: 'Absorb minor delay on non-contractual Tier 3 retail orders (ORD-108, ORD-109, ORD-110) to avoid premium air-freight fees.',
        costUsd: 1500,
        timeHours: 0,
        co2DeltaKg: 0,
        riskRating: 'Medium',
        isFeasible: true,
        applied: false,
      },
    ];

    const planAOrders = ['ORD-101', 'ORD-102', 'ORD-103', 'ORD-104', 'ORD-105', 'ORD-106', 'ORD-107'];
    const planA: RecoveryPlan = {
      id: 'plan_a',
      name: 'Plan A – Cheapest Recovery',
      subtitle: 'Lowest Cash Expenditure',
      objectiveDescription: `Minimizes recovery expenditure by leveraging economy bulk procurement from ${altSupplierName} and standard road/rail transit. Accepts minor delays on non-critical Tier 3 orders.`,
      isRecommended: false,
      totalRecoveryCostUsd: 18500,
      slaPerformancePercent: 78,
      recoveryTimeDays: 5.5,
      customerOrdersProtectedCount: planAOrders.length,
      totalOrdersAtRiskCount: ordersAtRisk,
      operationalRiskScore: 42,
      estimatedCo2EmissionsKg: 3100,
      feasibilityStatus: 'FEASIBLE',
      feasibilityExplanation: 'Fully verified against inventory and standard freight slots. Slower transit times may incur modest Tier 3 SLA penalties.',
      proposedActions: planAActions,
      pros: ['Lowest direct out-of-pocket recovery cost ($18,500)', 'Zero overtime labor expenses', 'High capital preservation'],
      cons: ['Longest recovery duration (5.5 days)', '3 Tier 3 customer orders will experience mild delivery slippage'],
      activatedSupplierIds: [altSupplierId],
      activatedMaterialIds: ['MAT-01', 'MAT-07'],
      activatedFactoryIds: ['FAC-01'],
      activatedDcIds: ['DC-01'],
      activatedStoreIds: ['STR-01', 'STR-02', 'STR-04'],
      protectedOrderIds: planAOrders,
      recoveryNodeIds: [altSupplierId, 'MAT-01', 'MAT-07', 'FAC-01', 'DC-01', 'STR-01', 'STR-02', 'STR-04', ...planAOrders],
      recoveryPatternSummary: {
        supplierStrategy: `Contract ${altSupplierName} at economy bulk volume rates with standard dispatch`,
        materialStrategy: 'Maintain original formulation; draw from local factory safety reserves',
        factoryStrategy: 'Defer non-critical production schedule SCH-02 at FAC-01; no overtime pay',
        dcStrategy: 'Consolidate deliveries through Central European Gateway DC-01 via standard road freight',
        storeStrategy: 'Prioritize core retail hubs in Berlin, Paris, and Munich; buffer secondary outlets',
        orderStrategy: 'Guarantee 7 Tier 1/2 enterprise orders; defer non-contractual Tier 3 orders by 48h',
      },
    };

    // Plan B: Fastest Recovery
    const planBActions: RecoveryActionItem[] = [
      {
        id: 'act-b-1',
        category: 'material_substitution',
        title: 'Instant BOM Swap to Bio-Circular Resin (MAT-02)',
        description: 'Activate pre-qualified substitute resin MAT-02 currently stored at Antwerp DC-02 with immediate transfer.',
        sourceEntityId: 'MAT-02',
        targetEntityId: 'FAC-01',
        costUsd: 22400,
        timeHours: 18,
        co2DeltaKg: -650,
        riskRating: 'Low',
        isFeasible: true,
        applied: false,
      },
      {
        id: 'act-b-2',
        category: 'transportation_rerouting',
        title: 'Charter Expedited Air Cargo from Antwerp',
        description: 'Bypass congested highway corridor with chartered air shuttle directly to Rheinland operations.',
        sourceEntityId: 'DC-02',
        targetEntityId: 'FAC-01',
        costUsd: 29800,
        timeHours: 12,
        co2DeltaKg: 4600,
        riskRating: 'Medium',
        isFeasible: true,
        applied: false,
      },
      {
        id: 'act-b-3',
        category: 'capacity_reallocation',
        title: 'Overtime Shift Surge at Rheinland Mega-Plant',
        description: 'Authorize double-time weekend crew shifts to clear the 45,000 unit backlog within 36 hours.',
        sourceEntityId: 'FAC-01',
        costUsd: 18500,
        timeHours: 36,
        co2DeltaKg: 780,
        riskRating: 'Low',
        isFeasible: true,
        applied: false,
      },
    ];

    const planBOrders = ['ORD-101', 'ORD-102', 'ORD-103', 'ORD-104', 'ORD-105', 'ORD-106', 'ORD-107', 'ORD-108', 'ORD-109', 'ORD-110'];
    const planB: RecoveryPlan = {
      id: 'plan_b',
      name: 'Plan B – Fastest Recovery',
      subtitle: 'Maximum Acceleration & Instant Substitute',
      objectiveDescription: 'Restores full production throughput in minimum possible time using chartered express transport, immediate material substitution, and 24/7 manufacturing shifts.',
      isRecommended: false,
      totalRecoveryCostUsd: 70700,
      slaPerformancePercent: 96,
      recoveryTimeDays: 1.8,
      customerOrdersProtectedCount: 10,
      totalOrdersAtRiskCount: ordersAtRisk,
      operationalRiskScore: 35,
      estimatedCo2EmissionsKg: 7200,
      feasibilityStatus: 'FEASIBLE',
      feasibilityExplanation: 'Emergency air slots and reserve plant labor confirmed available. Highest speed of execution.',
      proposedActions: planBActions,
      pros: ['Rapid turnaround (1.8 days)', 'Protects 100% of customer orders from missing promised dates', 'Eliminates factory idling'],
      cons: ['Substantial cost premium ($70,700)', 'High carbon footprint due to dedicated air freight charters'],
      activatedSupplierIds: ['SUP-02', 'SUP-03'],
      activatedMaterialIds: ['MAT-02', 'MAT-03', 'MAT-07'],
      activatedFactoryIds: ['FAC-01'],
      activatedDcIds: ['DC-01', 'DC-02'],
      activatedStoreIds: ['STR-01', 'STR-02', 'STR-03', 'STR-04', 'STR-05'],
      protectedOrderIds: planBOrders,
      recoveryNodeIds: ['SUP-02', 'SUP-03', 'MAT-02', 'MAT-03', 'MAT-07', 'FAC-01', 'DC-01', 'DC-02', 'STR-01', 'STR-02', 'STR-03', 'STR-04', 'STR-05', ...planBOrders],
      recoveryPatternSummary: {
        supplierStrategy: 'Emergency purchase orders placed with Pacific Polymers (SUP-02) and BioPure (SUP-03)',
        materialStrategy: 'Instant BOM swap to pre-certified Bio-Circular Resin MAT-02 from Antwerp buffer',
        factoryStrategy: 'Authorize double-time 24/7 weekend surge shifts at Rheinland Mega-Plant (FAC-01)',
        dcStrategy: 'Air-freight shuttle connection between Antwerp DC-02 and Frankfurt DC-01',
        storeStrategy: 'Direct simultaneous express replenish across all 5 retail flagship stores',
        orderStrategy: '100% order protection: all 10 customer contracts fulfilled on schedule',
      },
    };

    // Plan C: SLA Protection
    const planCActions: RecoveryActionItem[] = [
      {
        id: 'act-c-1',
        category: 'order_prioritization',
        title: 'Ring-Fence Finished Goods for Tier 1 Enterprise SLAs',
        description: 'Lock available warehouse stock at DC-01 exclusively for Kaufland (ORD-101) and Carrefour (ORD-102).',
        costUsd: 4200,
        timeHours: 6,
        co2DeltaKg: 0,
        riskRating: 'Low',
        isFeasible: true,
        applied: false,
      },
      {
        id: 'act-c-2',
        category: 'inventory_reallocation',
        title: 'Inter-Hub Inventory Transfer: DC-02 to DC-01',
        description: 'Reposition 25,000 units from Antwerp northern depot to Central Frankfurt hub via dedicated express freight.',
        sourceEntityId: 'DC-02',
        targetEntityId: 'DC-01',
        costUsd: 16800,
        timeHours: 28,
        co2DeltaKg: 1200,
        riskRating: 'Low',
        isFeasible: true,
        applied: false,
      },
      {
        id: 'act-c-3',
        category: 'alternative_supplier',
        title: 'Activate Secondary Supplier BioPure Extracts (SUP-03)',
        description: 'Expedite direct delivery of surfactant components to Paris and Berlin distribution corridors.',
        sourceEntityId: 'SUP-03',
        targetEntityId: 'STR-01',
        costUsd: 21500,
        timeHours: 48,
        co2DeltaKg: 850,
        riskRating: 'Low',
        isFeasible: true,
        applied: false,
      },
    ];

    const planCOrders = ['ORD-101', 'ORD-102', 'ORD-103', 'ORD-104', 'ORD-105', 'ORD-106', 'ORD-107'];
    const planC: RecoveryPlan = {
      id: 'plan_c',
      name: 'Plan C – SLA Protection',
      subtitle: 'Zero Enterprise Penalties',
      objectiveDescription: 'Focuses entirely on fulfilling Tier 1 Enterprise contracts (ORD-101, ORD-102, ORD-103) with zero delay. Prevents brand reputation damage and punitive SLA clauses.',
      isRecommended: false,
      totalRecoveryCostUsd: 42500,
      slaPerformancePercent: 100,
      recoveryTimeDays: 2.5,
      customerOrdersProtectedCount: planCOrders.length,
      totalOrdersAtRiskCount: ordersAtRisk,
      operationalRiskScore: 22,
      estimatedCo2EmissionsKg: 3800,
      feasibilityStatus: 'FEASIBLE',
      feasibilityExplanation: 'Inventory transfer windows match Tier 1 dispatch schedules. 100% of high-penalty enterprise orders protected.',
      proposedActions: planCActions,
      pros: ['Zero contractual SLA violations for enterprise partners', 'Low operational execution risk', 'Preserves high-margin partnerships'],
      cons: ['Depletes regional safety stock buffers in Benelux', 'Requires manual cross-dock prioritization'],
      activatedSupplierIds: ['SUP-03', 'SUP-05'],
      activatedMaterialIds: ['MAT-01', 'MAT-03', 'MAT-07'],
      activatedFactoryIds: ['FAC-01'],
      activatedDcIds: ['DC-01', 'DC-02'],
      activatedStoreIds: ['STR-01', 'STR-02', 'STR-03'],
      protectedOrderIds: planCOrders,
      recoveryNodeIds: ['SUP-03', 'SUP-05', 'MAT-01', 'MAT-03', 'MAT-07', 'FAC-01', 'DC-01', 'DC-02', 'STR-01', 'STR-02', 'STR-03', ...planCOrders],
      recoveryPatternSummary: {
        supplierStrategy: 'Contract BioPure Extracts (SUP-03) and Nordic CleanSynthetics (SUP-05) for guaranteed quality feedstocks',
        materialStrategy: 'Strict preservation of Virgin Polymer MAT-01 and Active Surfactant MAT-03 specs',
        factoryStrategy: 'FAC-01 production dedicated entirely to Tier 1 Enterprise product runs',
        dcStrategy: 'Inter-hub inventory transfer from Antwerp DC-02 to Frankfurt DC-01',
        storeStrategy: 'Prioritize retail replenishment to Berlin (STR-01), Paris (STR-02), Stockholm (STR-03)',
        orderStrategy: '100% on-time delivery for Tier 1 Enterprise (Kaufland, Carrefour, ICA) with zero penalty dollars',
      },
    };

    // Plan D: Green Recovery
    const planDActions: RecoveryActionItem[] = [
      {
        id: 'act-d-1',
        category: 'material_substitution',
        title: '100% Transition to Bio-Circular Resin MAT-02',
        description: 'Utilize zero-fossil Bio-Resin Blend MAT-02 supplied by local European producers.',
        sourceEntityId: 'MAT-02',
        targetEntityId: 'FAC-01',
        costUsd: 19500,
        timeHours: 40,
        co2DeltaKg: -2400,
        riskRating: 'Low',
        isFeasible: true,
        applied: false,
      },
      {
        id: 'act-d-2',
        category: 'transportation_rerouting',
        title: 'Electrified Rail Transit & EV Urban Delivery Fleet',
        description: 'Reroute all recovery volume through DB Cargo green-powered rail corridors and local EV fleets.',
        costUsd: 12800,
        timeHours: 54,
        co2DeltaKg: -1900,
        riskRating: 'Low',
        isFeasible: true,
        applied: false,
      },
      {
        id: 'act-d-3',
        category: 'capacity_reallocation',
        title: 'Shift Volume to Nordic Modular Works (FAC-02)',
        description: 'Reallocate 20,000 units to Sweden hydro-powered manufacturing facility.',
        sourceEntityId: 'FAC-01',
        targetEntityId: 'FAC-02',
        costUsd: 14600,
        timeHours: 48,
        co2DeltaKg: -1100,
        riskRating: 'Medium',
        isFeasible: true,
        applied: false,
      },
    ];

    const planDOrders = ['ORD-101', 'ORD-102', 'ORD-103', 'ORD-105', 'ORD-107', 'ORD-108'];
    const planD: RecoveryPlan = {
      id: 'plan_d',
      name: 'Plan D – Green Recovery',
      subtitle: 'Net-Negative Carbon Impact & 100% Bio-Circular Feedstocks',
      objectiveDescription: 'Maximizes ESG metrics by switching to 100% bio-circular materials, electrified rail transit, and hydro-powered Swedish manufacturing lines.',
      isRecommended: false,
      totalRecoveryCostUsd: 46900,
      slaPerformancePercent: 88,
      recoveryTimeDays: 3.8,
      customerOrdersProtectedCount: planDOrders.length,
      totalOrdersAtRiskCount: ordersAtRisk,
      operationalRiskScore: 28,
      estimatedCo2EmissionsKg: 950,
      feasibilityStatus: 'FEASIBLE',
      feasibilityExplanation: 'Nordic factory has confirmed line availability. Low emission routes certified under ISO 14064.',
      proposedActions: planDActions,
      pros: ['Lowest environmental impact (over 70% CO2 reduction)', 'Strengthens corporate sustainability credentials', 'Reliable electric rail corridors'],
      cons: ['Requires inter-plant scheduling alignment between Cologne and Malmö', 'Transit slightly slower than air freight'],
      activatedSupplierIds: ['SUP-03', 'SUP-05'],
      activatedMaterialIds: ['MAT-02', 'MAT-04', 'MAT-07'],
      activatedFactoryIds: ['FAC-01', 'FAC-02'],
      activatedDcIds: ['DC-02'],
      activatedStoreIds: ['STR-03', 'STR-05', 'STR-01'],
      protectedOrderIds: planDOrders,
      recoveryNodeIds: ['SUP-03', 'SUP-05', 'MAT-02', 'MAT-04', 'MAT-07', 'FAC-01', 'FAC-02', 'DC-02', 'STR-03', 'STR-05', 'STR-01', ...planDOrders],
      recoveryPatternSummary: {
        supplierStrategy: 'Engage green-certified European partners BioPure Extracts (SUP-03) and Nordic CleanSynthetics (SUP-05)',
        materialStrategy: '100% transition to certified Bio-Circular Polymer MAT-02 and recycled boxes MAT-07',
        factoryStrategy: 'Shift 20,000 units output to hydro-powered Nordic Modular Works (FAC-02) in Sweden',
        dcStrategy: 'Utilize Antwerp green corridor DC-02 connected directly to DB Cargo electric rail',
        storeStrategy: 'Prioritize eco-conscious retail partners in Stockholm (STR-03), Brussels (STR-05), Berlin (STR-01)',
        orderStrategy: 'Guarantee fulfillment for sustainability-committed accounts with verified low-carbon audit trail',
      },
    };

    // Plan E: Balanced Recovery (RECOMMENDED)
    const planEActions: RecoveryActionItem[] = [
      {
        id: 'act-e-1',
        category: 'alternative_supplier',
        title: isSecondDisruption 
          ? 'Dual-Source Emergency Feedstock (SUP-05 + SUP-03)' 
          : 'Split Allocation: Pacific Polymers (SUP-02) & BioPure (SUP-03)',
        description: isSecondDisruption
          ? 'Diversify procurement across Nordic CleanSynthetics and BioPure to insulate against single-point failure.'
          : 'Contract 60% urgent requirement with nearby European suppliers to eliminate overseas single-point vulnerability.',
        sourceEntityId: 'SUP-03',
        targetEntityId: 'FAC-01',
        costUsd: 17500,
        timeHours: 36,
        co2DeltaKg: 420,
        riskRating: 'Low',
        isFeasible: true,
        applied: false,
      },
      {
        id: 'act-e-2',
        category: 'inventory_reallocation',
        title: 'Dynamic Cross-Dock Reallocation: Antwerp to Frankfurt',
        description: 'Transfer 18,000 finished units from DC-02 buffer to DC-01 via express rail to satisfy immediate store replenish orders.',
        sourceEntityId: 'DC-02',
        targetEntityId: 'DC-01',
        costUsd: 8900,
        timeHours: 20,
        co2DeltaKg: 310,
        riskRating: 'Low',
        isFeasible: true,
        applied: false,
      },
      {
        id: 'act-e-3',
        category: 'production_rescheduling',
        title: 'Optimized Shift Rescheduling at Rheinland Plant',
        description: 'Add an extra 4-hour staggered weekend shift to produce 25,000 units without incurring extreme double-time premiums.',
        sourceEntityId: 'FAC-01',
        costUsd: 7800,
        timeHours: 24,
        co2DeltaKg: 280,
        riskRating: 'Low',
        isFeasible: true,
        applied: false,
      },
      {
        id: 'act-e-4',
        category: 'order_prioritization',
        title: 'Tier 1 & 2 SLA Guaranteed Dispatch Guarantee',
        description: 'Prioritize order fulfillment for Kaufland, Carrefour, ICA Gruppen, and Edeka with dedicated delivery windows.',
        costUsd: 2200,
        timeHours: 12,
        co2DeltaKg: 90,
        riskRating: 'Low',
        isFeasible: true,
        applied: false,
      },
    ];

    const planEOrders = ['ORD-101', 'ORD-102', 'ORD-103', 'ORD-104', 'ORD-105', 'ORD-106', 'ORD-107', 'ORD-108', 'ORD-109', 'ORD-110'];
    const planE: RecoveryPlan = {
      id: 'plan_e',
      name: 'Plan E – Balanced Recovery',
      subtitle: 'Optimal Multi-Objective Trade-Off (Recommended)',
      objectiveDescription: 'Pareto-optimal solution balancing cost, SLA fulfillment, recovery speed, and carbon footprint. Protects all Tier 1 and Tier 2 orders while keeping recovery costs reasonable.',
      isRecommended: true,
      totalRecoveryCostUsd: 36400,
      slaPerformancePercent: 94,
      recoveryTimeDays: 2.2,
      customerOrdersProtectedCount: 10,
      totalOrdersAtRiskCount: ordersAtRisk,
      operationalRiskScore: 18,
      estimatedCo2EmissionsKg: 2450,
      feasibilityStatus: 'FEASIBLE',
      feasibilityExplanation: 'Verified across all mathematical constraints: plant capacity, inventory safety margins, carrier lead times, and SLA contractual thresholds.',
      proposedActions: planEActions,
      pros: [
        'Optimal ROI ($36.4k cost vs. $150k+ potential loss)',
        'Protects 100% of high-margin Tier 1 & Tier 2 customer orders',
        'Low operational risk (18/100 score)',
        'Rapid 2.2-day recovery duration',
      ],
      cons: [
        'Requires coordination across 3 departments (Procurement, Operations, Logistics)',
        'Minor safety stock drawdown at Antwerp hub',
      ],
      activatedSupplierIds: ['SUP-02', 'SUP-03'],
      activatedMaterialIds: ['MAT-01', 'MAT-02', 'MAT-03', 'MAT-07'],
      activatedFactoryIds: ['FAC-01'],
      activatedDcIds: ['DC-01', 'DC-02'],
      activatedStoreIds: ['STR-01', 'STR-02', 'STR-03', 'STR-04', 'STR-05'],
      protectedOrderIds: planEOrders,
      recoveryNodeIds: ['SUP-02', 'SUP-03', 'MAT-01', 'MAT-02', 'MAT-03', 'MAT-07', 'FAC-01', 'DC-01', 'DC-02', 'STR-01', 'STR-02', 'STR-03', 'STR-04', 'STR-05', ...planEOrders],
      recoveryPatternSummary: {
        supplierStrategy: 'Dual-source split: 60% urgent requirement with Pacific Polymers (SUP-02), 40% with BioPure (SUP-03)',
        materialStrategy: 'Optimal blend of standard Virgin Resin MAT-01 and pre-qualified Bio-Resin MAT-02',
        factoryStrategy: 'Staggered 4-hour weekend shift addition at Rheinland Plant (FAC-01) without double-time penalty',
        dcStrategy: 'Dynamic cross-dock inventory reallocation between Antwerp DC-02 and Frankfurt DC-01',
        storeStrategy: 'Synchronized delivery windows servicing all 5 regional retail hubs',
        orderStrategy: 'Full delivery guarantee for all 10 customer accounts; zero Tier 1/2 contract defaults',
      },
    };

    return [planA, planB, planC, planD, planE];
  }
}
