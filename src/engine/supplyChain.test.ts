/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { DigitalTwinNetwork } from './digitalTwinGraph';
import { MultiAgentOrchestrator } from './agentsEngine';
import { VerificationEngine } from './verificationEngine';
import {
  INITIAL_SUPPLIERS,
  INITIAL_MATERIALS,
  INITIAL_BOM,
  INITIAL_FACTORIES,
  INITIAL_SCHEDULES,
  INITIAL_DISTRIBUTION_CENTERS,
  INITIAL_RETAIL_STORES,
  INITIAL_CUSTOMER_ORDERS,
  INITIAL_TRANSPORT_ROUTES,
  PREDEFINED_DISRUPTIONS,
} from '../data/initialSupplyChainData';
import { DisruptionEvent } from '../types/supplyChain';

test('DigitalTwinNetwork initializes with complete entity topology', () => {
  const network = new DigitalTwinNetwork(
    INITIAL_SUPPLIERS,
    INITIAL_MATERIALS,
    INITIAL_BOM,
    INITIAL_FACTORIES,
    INITIAL_SCHEDULES,
    INITIAL_DISTRIBUTION_CENTERS,
    INITIAL_RETAIL_STORES,
    INITIAL_CUSTOMER_ORDERS,
    INITIAL_TRANSPORT_ROUTES
  );

  assert.equal(network.getAllSuppliers().length, 5);
  assert.equal(network.getAllMaterials().length, 8);
  assert.equal(network.getAllFactories().length, 2);
  assert.equal(network.getAllDCs().length, 2);
  assert.equal(network.getAllStores().length, 5);
  assert.equal(network.getAllOrders().length, 10);
});

test('Blast radius calculation correctly propagates downstream from SUP-01', () => {
  const network = new DigitalTwinNetwork(
    INITIAL_SUPPLIERS,
    INITIAL_MATERIALS,
    INITIAL_BOM,
    INITIAL_FACTORIES,
    INITIAL_SCHEDULES,
    INITIAL_DISTRIBUTION_CENTERS,
    INITIAL_RETAIL_STORES,
    INITIAL_CUSTOMER_ORDERS,
    INITIAL_TRANSPORT_ROUTES
  );

  const blastRadius = network.calculateBlastRadius('SUP-01', 95, 6);

  // SUP-01 supplies MAT-01, MAT-03, MAT-06
  assert.ok(blastRadius.affectedMaterialIds.includes('MAT-01'));
  assert.ok(blastRadius.affectedMaterialIds.includes('MAT-03'));

  // Downstream factory FAC-01 produces goods using MAT-01 and MAT-03
  assert.ok(blastRadius.affectedFactoryIds.includes('FAC-01'));

  // Production schedules SCH-01 and SCH-02 are impacted
  assert.ok(blastRadius.affectedScheduleIds.length > 0);

  // Downstream distribution centers and stores are reached
  assert.ok(blastRadius.affectedDcIds.length > 0);
  assert.ok(blastRadius.affectedStoreIds.length > 0);

  // Customer orders and financial metrics are calculated
  assert.ok(blastRadius.affectedOrderIds.length > 0);
  assert.ok(blastRadius.estimatedRevenueAtRiskUsd > 50000);
  assert.ok(blastRadius.slaViolationsCount > 0);
  assert.ok(blastRadius.earliestStockoutDays < 15);
});

test('MultiAgentOrchestrator generates 5 distinct recovery plans with 6 criteria', () => {
  const network = new DigitalTwinNetwork(
    INITIAL_SUPPLIERS,
    INITIAL_MATERIALS,
    INITIAL_BOM,
    INITIAL_FACTORIES,
    INITIAL_SCHEDULES,
    INITIAL_DISTRIBUTION_CENTERS,
    INITIAL_RETAIL_STORES,
    INITIAL_CUSTOMER_ORDERS,
    INITIAL_TRANSPORT_ROUTES
  );

  const orchestrator = new MultiAgentOrchestrator(network);
  const disruption = PREDEFINED_DISRUPTIONS[0]; // SUP-01 failure

  const result = orchestrator.executeWorkflow(disruption);

  // Check that all 5 agents generated activities
  assert.equal(result.logs.length, 5);
  assert.equal(result.logs[0].agentId, 'monitoring');
  assert.equal(result.logs[1].agentId, 'prediction');
  assert.equal(result.logs[2].agentId, 'dependency');
  assert.equal(result.logs[3].agentId, 'simulation_optimization');
  assert.equal(result.logs[4].agentId, 'decision');

  // Check 5 diverse plans
  assert.equal(result.recoveryPlans.length, 5);
  const planIds = result.recoveryPlans.map((p) => p.id);
  assert.deepEqual(planIds, ['plan_a', 'plan_b', 'plan_c', 'plan_d', 'plan_e']);

  // Criteria check: Cheapest (Plan A) vs Fastest (Plan B) vs Green (Plan D)
  const planA = result.recoveryPlans.find((p) => p.id === 'plan_a')!;
  const planB = result.recoveryPlans.find((p) => p.id === 'plan_b')!;
  const planD = result.recoveryPlans.find((p) => p.id === 'plan_d')!;
  const planE = result.recoveryPlans.find((p) => p.id === 'plan_e')!;

  assert.ok(planA.totalRecoveryCostUsd < planB.totalRecoveryCostUsd, 'Plan A must be cheaper than Plan B');
  assert.ok(planB.recoveryTimeDays < planA.recoveryTimeDays, 'Plan B must be faster than Plan A');
  assert.ok(planD.estimatedCo2EmissionsKg < planB.estimatedCo2EmissionsKg, 'Plan D must have lower emissions than Plan B');
  assert.equal(planE.isRecommended, true, 'Plan E must be recommended');
});

test('VerificationEngine validates plan and checks secondary shortages', () => {
  const network = new DigitalTwinNetwork(
    INITIAL_SUPPLIERS,
    INITIAL_MATERIALS,
    INITIAL_BOM,
    INITIAL_FACTORIES,
    INITIAL_SCHEDULES,
    INITIAL_DISTRIBUTION_CENTERS,
    INITIAL_RETAIL_STORES,
    INITIAL_CUSTOMER_ORDERS,
    INITIAL_TRANSPORT_ROUTES
  );

  const orchestrator = new MultiAgentOrchestrator(network);
  const verifier = new VerificationEngine(network);
  const disruption = PREDEFINED_DISRUPTIONS[0];

  const workflow = orchestrator.executeWorkflow(disruption);
  const planE = workflow.recoveryPlans.find((p) => p.id === 'plan_e')!;

  const report = verifier.verifyRecoveryPlan(planE, disruption);
  assert.ok(report.overallStatus === 'PASSED' || report.overallStatus === 'PASSED_WITH_WARNINGS');
  assert.ok(report.verificationChecks.length >= 5);
  assert.ok(report.netFinancialSavingsUsd > 0);
});

test('Second disruption triggers dynamic adaptation and re-plans', () => {
  const network = new DigitalTwinNetwork(
    INITIAL_SUPPLIERS,
    INITIAL_MATERIALS,
    INITIAL_BOM,
    INITIAL_FACTORIES,
    INITIAL_SCHEDULES,
    INITIAL_DISTRIBUTION_CENTERS,
    INITIAL_RETAIL_STORES,
    INITIAL_CUSTOMER_ORDERS,
    INITIAL_TRANSPORT_ROUTES
  );

  const orchestrator = new MultiAgentOrchestrator(network);
  const secondDisruption: DisruptionEvent = {
    id: 'DIS-SECOND-01',
    title: 'Secondary Port Congestion Delay at SUP-02 (Pacific Polymers)',
    scenarioType: 'supplier_failure',
    targetEntityId: 'SUP-02',
    targetEntityType: 'supplier',
    severityPercent: 75,
    expectedDelayDays: 5,
    affectedQuantityUnits: 25000,
    timestamp: new Date().toISOString(),
    rootCauseDescription: 'Customs customs hold and maritime port congestion at Singapore terminals freezes Pacific Polymers backup shipments.',
    isActive: true,
    isSecondDisruption: true,
  };

  const result = orchestrator.executeWorkflow(secondDisruption, true);
  assert.equal(result.recoveryPlans.length, 5);
  assert.ok(result.logs.some((l) => l.actionTaken.includes('secondary')));
});

test('Company & Supplier Intelligence Agent runs and dynamically integrates supplier into Digital Twin', () => {
  const network = new DigitalTwinNetwork(
    INITIAL_SUPPLIERS,
    INITIAL_MATERIALS,
    INITIAL_BOM,
    INITIAL_FACTORIES,
    INITIAL_SCHEDULES,
    INITIAL_DISTRIBUTION_CENTERS,
    INITIAL_RETAIL_STORES,
    INITIAL_CUSTOMER_ORDERS,
    INITIAL_TRANSPORT_ROUTES
  );

  const orchestrator = new MultiAgentOrchestrator(network);
  assert.equal(network.getAllSuppliers().length, 5);

  // Ingest BASF SE as a new supplier
  const basfProfile = {
    id: 'INTEL-BASF-01',
    companyName: 'BASF SE',
    domain: 'basf.com',
    location: 'Ludwigshafen, Germany',
    country: 'Germany',
    tier: 'Tier 1 Prime' as const,
    industry: 'Chemicals & Catalysts',
    materialsSupplied: ['MAT-01', 'MAT-03'],
    suggestedMaterialNames: ['Pure PE-100 Polymer', 'Glucopon APG Surfactant'],
    dailyCapacityUnits: 125000,
    baseLeadTimeDays: 2.5,
    reliabilityScore: 97,
    costMultiplier: 1.04,
    carbonIntensityKgPerUnit: 1.72,
    financialHealthScore: 94,
    esgRating: 'AA' as const,
    riskLevel: 'LOW' as const,
    geopoliticalRiskScore: 12,
    portExposureScore: 18,
    primaryPorts: ['Port of Antwerp', 'Rotterdam Botlek'],
    operationalStatus: 'Normal' as const,
    statusDetail: 'Production reactors running at 98.4% capacity. Rhine barge transport on schedule.',
    digitalTwinSupplierId: 'SUP-BASF',
    extractedAt: new Date().toISOString(),
    executiveSummary: 'BASF is a Tier 1 global chemical producer.',
    recommendedAction: 'Direct pipeline connection to FAC-01.',
  };

  // 1. Run agent
  const log = orchestrator.runCompanyIntelligenceAgent('BASF SE', basfProfile);
  assert.equal(log.agentId, 'company_intelligence');
  assert.ok(log.actionTaken.includes('BASF SE'));
  assert.ok(log.reasoningTrace.includes('125,000'));

  // 2. Inject into twin
  const newSupplier = network.integrateCompanyIntoTwin(basfProfile);
  assert.equal(newSupplier.id, 'SUP-BASF');
  assert.equal(newSupplier.name, 'BASF SE');
  assert.equal(network.getAllSuppliers().length, 6);

  // 3. Verify graph visual representation contains the new node
  const visualGraph = network.getVisualGraph();
  const basfNode = visualGraph.nodes.find((n) => n.id === 'SUP-BASF');
  assert.ok(basfNode, 'BASF node must exist in visual graph');
  assert.equal(basfNode.entityType, 'supplier');
  assert.equal(basfNode.tierLevel, 0);

  // 4. Verify edges exist from SUP-BASF to MAT-01 and MAT-03
  const edgeToMat01 = visualGraph.edges.find((e) => e.source === 'SUP-BASF' && e.target === 'MAT-01');
  const edgeToMat03 = visualGraph.edges.find((e) => e.source === 'SUP-BASF' && e.target === 'MAT-03');
  assert.ok(edgeToMat01, 'Directed edge from SUP-BASF to MAT-01 must exist');
  assert.ok(edgeToMat03, 'Directed edge from SUP-BASF to MAT-03 must exist');

  // 5. Test export snapshot
  const snapshot = network.exportNetworkSnapshot();
  assert.equal(snapshot.suppliers.length, 6);
  assert.equal(snapshot.materials.length, 8);
});

test('Recovery patterns dynamically differ across recovery plans (Plan A vs Plan B vs Plan D)', () => {
  const network = new DigitalTwinNetwork(
    INITIAL_SUPPLIERS,
    INITIAL_MATERIALS,
    INITIAL_BOM,
    INITIAL_FACTORIES,
    INITIAL_SCHEDULES,
    INITIAL_DISTRIBUTION_CENTERS,
    INITIAL_RETAIL_STORES,
    INITIAL_CUSTOMER_ORDERS,
    INITIAL_TRANSPORT_ROUTES
  );
  const orchestrator = new MultiAgentOrchestrator(network);
  const disruption = PREDEFINED_DISRUPTIONS[0]; // SUP-01 supplier failure

  const result = orchestrator.executeWorkflow(disruption);
  const planA = result.recoveryPlans.find((p) => p.id === 'plan_a')!;
  const planB = result.recoveryPlans.find((p) => p.id === 'plan_b')!;
  const planD = result.recoveryPlans.find((p) => p.id === 'plan_d')!;

  // 1. Check Plan A vs Plan B vs Plan D have distinct recovery nodes
  assert.notDeepEqual(planA.recoveryNodeIds, planB.recoveryNodeIds);
  assert.notDeepEqual(planA.recoveryNodeIds, planD.recoveryNodeIds);

  // 2. Plan B uses substitute material MAT-02 whereas Plan A uses MAT-01
  assert.ok(planB.activatedMaterialIds.includes('MAT-02'));
  assert.ok(planA.activatedMaterialIds.includes('MAT-01'));

  // 3. Plan D activates hydro-powered factory FAC-02 and eco-supplier SUP-03
  assert.ok(planD.activatedFactoryIds.includes('FAC-02'));
  assert.ok(planD.activatedSupplierIds.includes('SUP-03'));

  // 4. Each plan has full multi-echelon summaries
  assert.ok(planA.recoveryPatternSummary.supplierStrategy.length > 10);
  assert.ok(planA.recoveryPatternSummary.materialStrategy.length > 10);
  assert.ok(planA.recoveryPatternSummary.factoryStrategy.length > 10);
  assert.ok(planA.recoveryPatternSummary.dcStrategy.length > 10);
  assert.ok(planA.recoveryPatternSummary.storeStrategy.length > 10);
  assert.ok(planA.recoveryPatternSummary.orderStrategy.length > 10);
});

test('Recovery patterns dynamically adapt based on the outage location (Factory vs DC vs Store)', () => {
  const network = new DigitalTwinNetwork(
    INITIAL_SUPPLIERS,
    INITIAL_MATERIALS,
    INITIAL_BOM,
    INITIAL_FACTORIES,
    INITIAL_SCHEDULES,
    INITIAL_DISTRIBUTION_CENTERS,
    INITIAL_RETAIL_STORES,
    INITIAL_CUSTOMER_ORDERS,
    INITIAL_TRANSPORT_ROUTES
  );
  const orchestrator = new MultiAgentOrchestrator(network);

  // 1. Factory Outage at FAC-01
  const factoryDisruption = PREDEFINED_DISRUPTIONS[2]; // FAC-01 boiler trip
  const facResult = orchestrator.executeWorkflow(factoryDisruption);
  const facPlanE = facResult.recoveryPlans.find((p) => p.id === 'plan_e')!;

  // When FAC-01 is down, recovery must mobilize FAC-02!
  assert.ok(facPlanE.activatedFactoryIds.includes('FAC-02'), 'Factory outage must allocate production to FAC-02');
  assert.ok(facPlanE.recoveryPatternSummary.factoryStrategy.includes('FAC-02') || facPlanE.recoveryPatternSummary.factoryStrategy.includes('Nordic'));

  // 2. DC Outage at DC-01
  const dcDisruption = PREDEFINED_DISRUPTIONS[5]; // DC-01 warehouse sortation failure
  const dcResult = orchestrator.executeWorkflow(dcDisruption);
  const dcPlanE = dcResult.recoveryPlans.find((p) => p.id === 'plan_e')!;

  // When DC-01 is down, recovery must mobilize DC-02!
  assert.ok(dcPlanE.activatedDcIds.includes('DC-02'), 'DC outage must allocate distribution to DC-02');
  assert.ok(dcPlanE.recoveryPatternSummary.dcStrategy.includes('DC-02') || dcPlanE.recoveryPatternSummary.dcStrategy.includes('Antwerp'));

  // 3. Store Outage at STR-01
  const storeDisruption = PREDEFINED_DISRUPTIONS[6]; // STR-01 Berlin Metro demand spike
  const storeResult = orchestrator.executeWorkflow(storeDisruption);
  const storePlanE = storeResult.recoveryPlans.find((p) => p.id === 'plan_e')!;

  // Store outage mobilizes target store STR-01 and donor store STR-04
  assert.ok(storePlanE.activatedStoreIds.includes('STR-01'));
  assert.ok(storePlanE.activatedStoreIds.includes('STR-04'));
});

