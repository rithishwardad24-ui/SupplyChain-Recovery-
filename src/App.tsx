/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  DisruptionEvent,
  BlastRadiusResult,
  RecoveryPlan,
  RecoveryStrategyId,
  VerificationReport,
  AgentActivityLog,
  DigitalTwinGraphNode,
  Supplier,
} from './types/supplyChain';
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
} from './data/initialSupplyChainData';
import { DigitalTwinNetwork } from './engine/digitalTwinGraph';
import { MultiAgentOrchestrator } from './engine/agentsEngine';
import { VerificationEngine } from './engine/verificationEngine';

import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { DigitalTwinCanvas } from './components/DigitalTwinCanvas';
import { NodeInspectionDrawer } from './components/NodeInspectionDrawer';
import { OverviewView } from './components/OverviewView';
import { DisruptionCenterView } from './components/DisruptionCenterView';
import { RecoveryPlannerView } from './components/RecoveryPlannerView';
import { WhatIfSimulatorView } from './components/WhatIfSimulatorView';
import { AgentActivityView } from './components/AgentActivityView';
import { ExecutionCenterView } from './components/ExecutionCenterView';
import { BusinessImpactView } from './components/BusinessImpactView';
import { CsvAnalysisView } from './components/CsvAnalysisView';
import { CompanyIntelligenceAgentView } from './components/CompanyIntelligenceAgentView';
import {
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Database,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from './firebase/authContext';
import { dbService } from './firebase/dbService';

export default function App() {
  const { user } = useAuth();

  // Navigation State - 4 Focused Workspaces
  const [activeTab, setActiveTab] = useState<ActiveTab>('digital_twin');

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setInspectedNode(null);
  };

  // Digital Twin Engine instance
  const network = useMemo(() => {
    return new DigitalTwinNetwork(
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
  }, []);

  const orchestrator = useMemo(() => new MultiAgentOrchestrator(network), [network]);
  const verifier = useMemo(() => new VerificationEngine(network), [network]);

  // Operational State
  const [currentDisruption, setCurrentDisruption] = useState<DisruptionEvent | null>(null);
  const [blastRadius, setBlastRadius] = useState<BlastRadiusResult | null>(null);
  const [recoveryPlans, setRecoveryPlans] = useState<RecoveryPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<RecoveryStrategyId>('plan_e');
  const [previousPlan, setPreviousPlan] = useState<RecoveryPlan | null>(null);
  const [isExecuted, setIsExecuted] = useState(false);
  const [verificationReport, setVerificationReport] = useState<VerificationReport | null>(null);
  const [agentLogs, setAgentLogs] = useState<AgentActivityLog[]>([]);
  const [isSecondDisruptionActive, setIsSecondDisruptionActive] = useState(false);
  const [networkVersion, setNetworkVersion] = useState(0);

  // Inspection Drawer
  const [inspectedNode, setInspectedNode] = useState<DigitalTwinGraphNode | null>(null);

  const handleSupplierAddedOrUpdated = (supplier: Supplier) => {
    setNetworkVersion((v) => v + 1);
  };

  // Sets of disrupted and recovery nodes for visual graph
  const disruptedNodeIds = useMemo(() => {
    const ids = new Set<string>();
    if (currentDisruption && currentDisruption.isActive) {
      ids.add(currentDisruption.targetEntityId);
      if (blastRadius) {
        blastRadius.affectedMaterialIds.forEach((id) => ids.add(id));
        blastRadius.affectedFactoryIds.forEach((id) => ids.add(id));
        blastRadius.affectedDcIds.forEach((id) => ids.add(id));
        blastRadius.affectedStoreIds.forEach((id) => ids.add(id));
        blastRadius.affectedOrderIds.forEach((id) => ids.add(id));
      }
    }
    return ids;
  }, [currentDisruption, blastRadius]);

  // Active Plan reference (dynamically selected strategy)
  const activePlan = useMemo(() => {
    return recoveryPlans.find((p) => p.id === selectedPlanId) || recoveryPlans[4] || null;
  }, [recoveryPlans, selectedPlanId]);

  // Dynamic recovery pattern nodes based on active recovery plan
  // Accurately reflects supplier, materials, factories, DCs, stores, and orders activated in the plan
  const recoveryNodeIds = useMemo(() => {
    const ids = new Set<string>();
    if (activePlan && activePlan.recoveryNodeIds) {
      activePlan.recoveryNodeIds.forEach((id) => ids.add(id));
    }
    return ids;
  }, [activePlan]);

  // Current visual graph representation
  const graphState = useMemo(() => {
    return network.getVisualGraph(
      isExecuted ? new Set() : disruptedNodeIds,
      recoveryNodeIds
    );
  }, [network, disruptedNodeIds, recoveryNodeIds, isExecuted, networkVersion]);

  // Handler: Trigger Disruption (runs full 5-agent workflow)
  const handleTriggerDisruption = (disruption: DisruptionEvent, isSecond = false) => {
    setCurrentDisruption({ ...disruption, isActive: true });
    setIsExecuted(false);

    // Run multi-agent orchestrator
    const result = orchestrator.executeWorkflow(disruption, isSecond);

    setBlastRadius(result.blastRadius);
    setRecoveryPlans(result.recoveryPlans);
    setSelectedPlanId(result.recommendedPlanId as RecoveryStrategyId);

    // Pre-calculate verification report for the recommended plan
    const recPlan = result.recoveryPlans.find((p) => p.id === result.recommendedPlanId) || result.recoveryPlans[4];
    if (recPlan) {
      const vReport = verifier.verifyRecoveryPlan(recPlan, disruption);
      setVerificationReport(vReport);
    }

    // Prepend new agent activities
    setAgentLogs((prev) => [...result.logs, ...prev]);

    // Persist to Cloud Firestore
    const uid = user?.uid || 'guest-session';
    dbService.saveDisruption(disruption, uid);
    result.logs.forEach((log) => dbService.saveAuditLog(log, uid));
  };

  // Handler: Clear Disruption
  const handleClearDisruption = () => {
    setCurrentDisruption(null);
    setBlastRadius(null);
    setRecoveryPlans([]);
    setVerificationReport(null);
    setIsExecuted(false);
    setIsSecondDisruptionActive(false);
    setPreviousPlan(null);
  };

  // Handler: Run Predefined Scenario by ID
  const handleTriggerPredefined = (scenId: string) => {
    const scen = PREDEFINED_DISRUPTIONS.find((d) => d.id === scenId);
    if (scen) {
      handleTriggerDisruption(scen);
      setActiveTab('recovery_planner');
    }
  };

  // Handler: Run Primary Demo (Supplier Failure)
  const handleRunDemoScenario = () => {
    const majorSupplierFailure = PREDEFINED_DISRUPTIONS[0]; // DIS-01 SUP-01
    handleTriggerDisruption(majorSupplierFailure);
    setActiveTab('recovery_planner');
  };

  // Handler: Inject Second Disruption (Dynamic Adaptation)
  const handleInjectSecondDisruption = () => {
    setIsSecondDisruptionActive(true);
    if (activePlan) {
      setPreviousPlan({ ...activePlan });
    }

    const secondDisruption: DisruptionEvent = {
      id: `DIS-SECOND-${Date.now().toString().slice(-4)}`,
      title: 'Secondary Overseas Port Congestion (Pacific Polymers SUP-02)',
      scenarioType: 'supplier_failure',
      targetEntityId: 'SUP-02',
      targetEntityType: 'supplier',
      severityPercent: 80,
      expectedDelayDays: 6,
      affectedQuantityUnits: 25000,
      timestamp: new Date().toISOString(),
      rootCauseDescription: 'Container terminal crane strike and berth congestion in Singapore freezes secondary emergency shipments from Pacific Polymers.',
      isActive: true,
      isSecondDisruption: true,
    };

    handleTriggerDisruption(secondDisruption, true);
    setActiveTab('recovery_planner');
  };

  // Handler: Select Plan and immediately recalculate verification
  const handleSelectPlan = (planId: RecoveryStrategyId) => {
    setSelectedPlanId(planId);
    const plan = recoveryPlans.find((p) => p.id === planId);
    if (plan && currentDisruption) {
      const vReport = verifier.verifyRecoveryPlan(plan, currentDisruption);
      setVerificationReport(vReport);
    }
  };

  // Handler: Approve & Execute Plan
  const handleExecutePlan = () => {
    if (!activePlan || !currentDisruption) return;

    setIsExecuted(true);

    // Run verification engine
    const report = verifier.verifyRecoveryPlan(activePlan, currentDisruption);
    setVerificationReport(report);

    // Record execution event in Agent Activity Log
    const executionLog: AgentActivityLog = {
      id: `act-exec-${Date.now()}`,
      agentId: 'decision',
      agentName: 'Agent 5: Recovery Decision Agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actionTaken: `Executed and Verified ${activePlan.name}`,
      inputSummary: `User approved deployment of ${activePlan.proposedActions.length} simulated operational recovery levers.`,
      reasoningTrace: `Verification Engine performed cross-network balance audit: Verified inventory buffers at DC-01 and DC-02. Verified factory capacity at FAC-01 (${activePlan.id === 'plan_b' ? '120k' : '110k'} u/d). Recalculated 10 customer order delivery horizons. Verified zero secondary network shortages created.`,
      outputSummary: `All ${activePlan.customerOrdersProtectedCount} target customer orders protected. Verified Net Savings: $${report.netFinancialSavingsUsd.toLocaleString()}.`,
      status: 'completed',
      dataClassification: 'KNOWN',
    };

    setAgentLogs((prev) => [executionLog, ...prev]);

    // Persist execution and verified audit trail to Cloud Firestore
    const uid = user?.uid || 'guest-session';
    dbService.saveExecution(activePlan, currentDisruption.id, report, uid);
    dbService.saveAuditLog(executionLog, uid);
  };

  // Handler: Reset Execution State
  const handleResetExecution = () => {
    setIsExecuted(false);
  };

  // Handler: Full Demo Reset to pristine baseline
  const handleResetDemo = () => {
    network.init(
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
    handleClearDisruption();
    setAgentLogs([]);
    setActiveTab('overview');
  };

  // Handler: Custom Simulation via Sliders
  const handleRunCustomSimulation = (severity: number, delayDays: number) => {
    const customEvent: DisruptionEvent = {
      id: `DIS-SIM-${Date.now().toString().slice(-4)}`,
      title: `Simulated Disruption (${severity}% Severity · ${delayDays}d Delay)`,
      scenarioType: 'custom',
      targetEntityId: currentDisruption ? currentDisruption.targetEntityId : 'SUP-01',
      targetEntityType: currentDisruption ? currentDisruption.targetEntityType : 'supplier',
      severityPercent: severity,
      expectedDelayDays: delayDays,
      affectedQuantityUnits: Math.round(severity * 500),
      timestamp: new Date().toISOString(),
      rootCauseDescription: 'Simulated parametric sensitivity analysis executed via What-If Simulator.',
      isActive: true,
    };
    handleTriggerDisruption(customEvent);
  };

  // Handler: Node-specific disruption trigger from drawer
  const handleTriggerNodeDisruption = (nodeId: string) => {
    const node = graphState.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const customEvent: DisruptionEvent = {
      id: `DIS-NODE-${nodeId}`,
      title: `Direct Outage at ${node.name} (${nodeId})`,
      scenarioType: 'custom',
      targetEntityId: nodeId,
      targetEntityType: node.entityType,
      severityPercent: 90,
      expectedDelayDays: 6,
      affectedQuantityUnits: 40000,
      timestamp: new Date().toISOString(),
      rootCauseDescription: `Simulated sudden failure targeted directly at node ${node.name}.`,
      isActive: true,
    };

    handleTriggerDisruption(customEvent);
    setInspectedNode(null);
    setActiveTab('digital_twin');
  };

  // Initialize with initial monitoring log on mount
  useEffect(() => {
    const initialLog: AgentActivityLog = {
      id: 'act-init-01',
      agentId: 'monitoring',
      agentName: 'Agent 1: Supply Chain Monitoring Agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actionTaken: 'Autonomous Continuous Supply Chain Telemetry Initialized',
      inputSummary: '32 entities connected across 6 tiers (Suppliers, Materials, Plants, DCs, Retail, Orders).',
      reasoningTrace: 'Continuous polling of ERP telemetry, inventory levels, warehouse buffers, and transport GPS pings. All 32 network nodes are operating within nominal green parameters.',
      outputSummary: 'Status: ALL SYSTEMS NOMINAL. Network Health Score: 96%. Awaiting shock events.',
      status: 'completed',
      dataClassification: 'KNOWN',
    };
    setAgentLogs([initialLog]);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Global Application Header */}
      <Header
        onResetDemo={handleResetDemo}
        onRunDemoScenario={handleRunDemoScenario}
        activeDisruptionCount={currentDisruption?.isActive ? 1 : 0}
        hasActiveDisruption={!!currentDisruption?.isActive}
        isSecondDisruptionActive={isSecondDisruptionActive}
      />

      {/* Main Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        disruptionActive={!!currentDisruption?.isActive}
        recoveryPlanReady={recoveryPlans.length > 0}
        isExecuted={isExecuted}
        agentEventCount={agentLogs.length}
      />

      {/* Page Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {activeTab === 'digital_twin' && (
          <div className="space-y-4">
            {/* Clean KPI Summary Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                <span className="text-[11px] text-slate-400 font-medium">Network Health</span>
                <div className="flex items-baseline space-x-1.5 mt-0.5">
                  <span className={`text-xl font-bold ${currentDisruption?.isActive ? 'text-red-400' : 'text-emerald-400'}`}>
                    {currentDisruption?.isActive ? (isExecuted ? '88%' : '46%') : '96%'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {currentDisruption?.isActive ? (isExecuted ? 'In Recovery' : 'Disrupted') : 'Optimal'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                <span className="text-[11px] text-slate-400 font-medium">Digital Twin Nodes</span>
                <div className="flex items-baseline space-x-1.5 mt-0.5">
                  <span className="text-xl font-bold text-white">{graphState.nodes.length}</span>
                  <span className="text-xs text-slate-400">
                    ({network.getAllSuppliers().length} Suppliers, {network.getAllMaterials().length} Materials)
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                <span className="text-[11px] text-slate-400 font-medium">Orders at Risk</span>
                <div className="flex items-baseline space-x-1.5 mt-0.5">
                  <span className={`text-xl font-bold ${blastRadius?.estimatedDelayedOrdersCount ? 'text-amber-400' : 'text-slate-200'}`}>
                    {blastRadius ? blastRadius.estimatedDelayedOrdersCount : 0}
                  </span>
                  <span className="text-xs text-slate-400">/ 10 Enterprise</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                <span className="text-[11px] text-slate-400 font-medium">Financial Exposure</span>
                <div className="flex items-baseline space-x-1.5 mt-0.5">
                  <span className={`text-xl font-bold ${blastRadius?.totalFinancialExposureUsd ? 'text-red-400' : 'text-slate-200'}`}>
                    ${blastRadius ? Math.round(blastRadius.totalFinancialExposureUsd / 1000) : 0}k
                  </span>
                  <span className="text-xs text-slate-400">gross risk</span>
                </div>
              </div>
            </div>

            {/* Disruption Notification Bar */}
            {currentDisruption?.isActive && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/80 via-slate-900 to-red-950/40 border border-red-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center space-x-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
                  <div>
                    <span className="text-xs font-bold text-white">{currentDisruption.title}</span>
                    <span className="text-xs text-slate-300 ml-2">
                      ({currentDisruption.expectedDelayDays} days delay · {blastRadius?.estimatedProductionShortageUnits.toLocaleString()} units impacted)
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('recovery_planner')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <span>Compare 5 Recovery Plans</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Interactive SVG Canvas */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2 shadow-lg">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 text-xs">
                <div className="flex items-center space-x-3 text-slate-300">
                  <span className="font-semibold text-white">Live Network Topology</span>
                  <span className="text-slate-500 hidden sm:inline">Click any node to inspect telemetry</span>
                </div>
                <div className="flex items-center space-x-3 text-[11px] font-mono">
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Healthy</span>
                  </span>
                  {currentDisruption?.isActive && (
                    <span className="flex items-center space-x-1 text-red-400">
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                      <span>Disrupted</span>
                    </span>
                  )}
                  {isExecuted && (
                    <span className="flex items-center space-x-1 text-sky-400">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      <span>Recovery</span>
                    </span>
                  )}
                </div>
              </div>

              <DigitalTwinCanvas
                nodes={graphState.nodes}
                edges={graphState.edges}
                onSelectNode={setInspectedNode}
                selectedNodeId={inspectedNode?.id}
                disruptedNodeIds={disruptedNodeIds}
                recoveryNodeIds={recoveryNodeIds}
              />
            </div>
          </div>
        )}

        {activeTab === 'company_intelligence' && (
          <CompanyIntelligenceAgentView
            network={network}
            orchestrator={orchestrator}
            onSupplierAddedOrUpdated={handleSupplierAddedOrUpdated}
            onTriggerDisruptionForSupplier={(disruption) => {
              handleTriggerDisruption(disruption);
              setActiveTab('recovery_planner');
            }}
          />
        )}

        {activeTab === 'recovery_planner' && (
          <div className="space-y-4">
            {isExecuted && verificationReport && (
              <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Plan Executed & Verified by Autonomous Engine</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Net Savings: <span className="font-bold text-emerald-400">${verificationReport.netFinancialSavingsUsd.toLocaleString()}</span> · All {activePlan?.customerOrdersProtectedCount} target customer orders shielded.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveTab('digital_twin')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
                  >
                    View in Digital Twin
                  </button>
                  <button
                    onClick={handleResetExecution}
                    className="px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/60 text-emerald-300 text-xs font-semibold border border-emerald-700 transition cursor-pointer"
                  >
                    Reset Execution
                  </button>
                </div>
              </div>
            )}

            <RecoveryPlannerView
              plans={recoveryPlans}
              selectedPlanId={selectedPlanId}
              onSelectPlan={handleSelectPlan}
              onApproveAndExecute={(plan) => handleExecutePlan()}
              currentDisruption={currentDisruption}
              blastRadius={blastRadius}
              isExecuted={isExecuted}
              onTriggerDisruption={(d) => handleTriggerDisruption(d)}
            />
          </div>
        )}

        {activeTab === 'agent_activity' && (
          <AgentActivityView logs={agentLogs} />
        )}

        {/* Fallback support for any other tab request */}
        {activeTab === 'overview' && (
          <OverviewView
            disruption={currentDisruption}
            blastRadius={blastRadius}
            recommendedPlan={activePlan}
            isExecuted={isExecuted}
            agentLogs={agentLogs}
            onNavigateTab={handleTabChange}
            onTriggerPredefined={handleTriggerPredefined}
            nodes={graphState.nodes}
          />
        )}

        {activeTab === 'business_impact' && (
          <BusinessImpactView
            disruption={currentDisruption}
            blastRadius={blastRadius}
            activePlan={activePlan}
            verificationReport={verificationReport}
            isExecuted={isExecuted}
          />
        )}
      </main>

      {/* Flyout Node Inspection Drawer */}
      <NodeInspectionDrawer
        node={inspectedNode}
        onClose={() => setInspectedNode(null)}
        network={network}
        onTriggerNodeDisruption={handleTriggerNodeDisruption}
      />
    </div>
  );
}
