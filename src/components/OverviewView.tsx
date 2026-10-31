/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  DisruptionEvent,
  BlastRadiusResult,
  AgentActivityLog,
  RecoveryPlan,
  DigitalTwinGraphNode,
} from '../types/supplyChain';
import {
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  DollarSign,
  TrendingDown,
  Clock,
  ArrowRight,
  Bot,
  Zap,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Layers,
  FileSpreadsheet,
  Sparkles,
  Globe,
  Database,
} from 'lucide-react';

interface OverviewViewProps {
  disruption: DisruptionEvent | null;
  blastRadius: BlastRadiusResult | null;
  recommendedPlan: RecoveryPlan | null;
  isExecuted: boolean;
  agentLogs: AgentActivityLog[];
  onNavigateTab: (tab: any) => void;
  onTriggerPredefined: (id: string) => void;
  nodes: DigitalTwinGraphNode[];
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  disruption,
  blastRadius,
  recommendedPlan,
  isExecuted,
  agentLogs,
  onNavigateTab,
  onTriggerPredefined,
  nodes,
}) => {
  const isDisrupted = !!disruption && disruption.isActive;

  // Node health counts
  const healthyCount = nodes.filter((n) => n.status === 'healthy').length;
  const warningCount = nodes.filter((n) => n.status === 'warning').length;
  const disruptedCount = nodes.filter((n) => n.status === 'disrupted').length;
  const recoveryCount = nodes.filter((n) => n.status === 'recovery').length;

  // Supply chain health score calculation
  const healthScore = isDisrupted
    ? isExecuted
      ? 88
      : 46
    : 96;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Active Disruption Banner */}
      {isDisrupted && (
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-red-950/70 via-slate-900 to-red-950/40 border border-red-500/50 shadow-xl shadow-red-950/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400 mt-0.5">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                  Critical Anomaly Active
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Target: {disruption.targetEntityId} · {disruption.expectedDelayDays}d delay
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                {disruption.title}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {disruption.rootCauseDescription}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateTab('disruption_center')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition cursor-pointer flex items-center space-x-1.5"
            >
              <span>Blast Radius Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab('recovery_planner')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-600/30 transition cursor-pointer flex items-center space-x-1.5"
            >
              <span>Compare 5 Recovery Plans</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Health Score Card */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Supply Chain Health</span>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              [KNOWN]
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span
              className={`text-2xl sm:text-3xl font-extrabold ${
                healthScore > 80
                  ? 'text-emerald-400'
                  : healthScore > 50
                  ? 'text-amber-400'
                  : 'text-red-400'
              }`}
            >
              {healthScore}%
            </span>
            <span className="text-xs text-slate-400">
              {isDisrupted ? (isExecuted ? 'Stabilizing post-recovery' : 'Severely impaired') : 'Optimal flow'}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                healthScore > 80
                  ? 'bg-emerald-500'
                  : healthScore > 50
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </div>

        {/* Customer Orders at Risk */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Orders at Risk</span>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50">
              [ASSUMED]
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span
              className={`text-2xl sm:text-3xl font-extrabold ${
                blastRadius && blastRadius.estimatedDelayedOrdersCount > 0
                  ? 'text-red-400'
                  : 'text-slate-100'
              }`}
            >
              {blastRadius ? blastRadius.estimatedDelayedOrdersCount : 0}
            </span>
            <span className="text-xs text-slate-400">
              / 10 enterprise orders
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 truncate">
            {blastRadius ? `${blastRadius.slaViolationsCount} SLA breach contracts` : 'Zero contractual delays'}
          </p>
        </div>

        {/* Revenue at Risk */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Financial Exposure</span>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50">
              [ASSUMED]
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span
              className={`text-2xl sm:text-3xl font-extrabold ${
                blastRadius && blastRadius.totalFinancialExposureUsd > 0
                  ? 'text-amber-400'
                  : 'text-slate-100'
              }`}
            >
              ${blastRadius ? (blastRadius.totalFinancialExposureUsd / 1000).toFixed(1) : '0'}k
            </span>
            <span className="text-xs text-slate-400">gross exposure</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 truncate">
            {blastRadius
              ? `$${(blastRadius.estimatedRevenueAtRiskUsd / 1000).toFixed(0)}k rev + $${(blastRadius.estimatedSlaPenaltiesUsd / 1000).toFixed(0)}k penalty`
              : 'All contracts within budget'}
          </p>
        </div>

        {/* Stockout Horizon */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Earliest Stockout</span>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              [KNOWN]
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span
              className={`text-2xl sm:text-3xl font-extrabold ${
                isDisrupted ? 'text-red-400' : 'text-slate-100'
              }`}
            >
              {blastRadius ? `${blastRadius.earliestStockoutDays.toFixed(1)}d` : '8.6d'}
            </span>
            <span className="text-xs text-slate-400">safety margin</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 truncate">
            {isDisrupted ? 'Critical alert at Berlin Store' : 'All stores above 8 days cover'}
          </p>
        </div>
      </div>

      {/* Supplier Intelligence & Database Connector Agent Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-blue-950/40 border border-cyan-500/40 shadow-lg shadow-cyan-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-lg bg-cyan-600/20 border border-cyan-500/40 text-cyan-400 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Agent 0 · Autonomous Ingestion
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Google Cloud Firestore Connected
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mt-1">
              Pull Company Intelligence & Connect Database for Digital Twin
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
              Research any global supplier (e.g. BASF, Dow, Maersk) to ingest capacity, lead times, ESG ratings, and shipping routes. Dynamically inject nodes into the network and persist digital twin topology directly to Cloud Firestore.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('company_intelligence')}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold transition shadow-md shadow-cyan-600/30 flex items-center space-x-2 shrink-0 self-start sm:self-center cursor-pointer"
        >
          <Database className="w-4 h-4" />
          <span>Launch Ingestion Agent</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Gemini AI CSV Supplier Failure Ingestion Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-violet-950/60 via-slate-900 to-indigo-950/40 border border-violet-500/40 shadow-lg shadow-violet-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-lg bg-violet-600/20 border border-violet-500/40 text-violet-400 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Gemini 3.8 Flash Powered
              </span>
              <span className="text-xs text-slate-400 font-mono">
                External Supplier CSV Ingestion
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mt-1">
              Analyze Supplier Shipments & Identify Major Supplier Failures
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
              Upload custom shipment logs or evaluate the 2026 Rotterdam port disruption dataset. Gemini AI analyzes root causes, predicts blast radius, and applies disruptions directly to the Digital Twin.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('csv_analysis')}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition shadow-md shadow-violet-600/30 flex items-center space-x-2 shrink-0 self-start sm:self-center cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Open CSV & AI Intelligence</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Interactive Scenario Launchpad for Judges */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Interactive What-If Scenario Launchpad</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate chain reactions across the Digital Twin. Evaluates blast radius & recovery options dynamically.
            </p>
          </div>
          <span className="text-[11px] text-slate-400">
            Select a scenario to trigger live multi-agent workflow
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {/* Scenario 1: The Primary Hackathon Demo */}
          <div
            onClick={() => onTriggerPredefined('DIS-01')}
            className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
              disruption?.id === 'DIS-01'
                ? 'bg-red-950/50 border-red-500 shadow-md ring-1 ring-red-500/40'
                : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400">SCENARIO 1 (PRIMARY)</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                Major Failure
              </span>
            </div>
            <h4 className="text-xs font-bold text-white mt-1.5">Supplier Feedstock Delay (Apex Global)</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Rotterdam reactor shutdown stops MAT-01 and MAT-03, cascading to Factory 1 and 4 customer orders.
            </p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-300 pt-2 border-t border-slate-700/50">
              <span>Impact: 45k units</span>
              <span className="text-blue-400 font-medium">Run Scenario →</span>
            </div>
          </div>

          {/* Scenario 2: Factory Shutdown */}
          <div
            onClick={() => onTriggerPredefined('DIS-03')}
            className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
              disruption?.id === 'DIS-03'
                ? 'bg-red-950/50 border-red-500 shadow-md ring-1 ring-red-500/40'
                : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400">SCENARIO 2</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                Plant Halt
              </span>
            </div>
            <h4 className="text-xs font-bold text-white mt-1.5">Rheinland Mega-Plant Boiler Trip</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Steam boiler failure forces emergency shutdown of 98,000 u/d filling operations at Factory 1.
            </p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-300 pt-2 border-t border-slate-700/50">
              <span>Impact: 98k units</span>
              <span className="text-blue-400 font-medium">Run Scenario →</span>
            </div>
          </div>

          {/* Scenario 3: Freight Corridor Freeze */}
          <div
            onClick={() => onTriggerPredefined('DIS-05')}
            className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
              disruption?.id === 'DIS-05'
                ? 'bg-red-950/50 border-red-500 shadow-md ring-1 ring-red-500/40'
                : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400">SCENARIO 3</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                Logistics Freeze
              </span>
            </div>
            <h4 className="text-xs font-bold text-white mt-1.5">Rhine Rail Corridor Breakdown</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Signal failure blocks primary rail artery between Cologne and Frankfurt Distribution Hub.
            </p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-300 pt-2 border-t border-slate-700/50">
              <span>Impact: 60k units</span>
              <span className="text-blue-400 font-medium">Run Scenario →</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Digital Twin Topology Status + Recent AI Agent Reasoning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Node Health Grid */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Digital Twin Network Status</span>
            </h3>
            <button
              onClick={() => onNavigateTab('digital_twin')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              Open Full Graph →
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[11px]">Healthy Nodes</span>
                <p className="text-xl font-bold text-emerald-400 mt-0.5">{healthyCount}</p>
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
            </div>

            <div className="p-3 rounded-lg bg-red-950/30 border border-red-800/40 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[11px]">Disrupted Nodes</span>
                <p className="text-xl font-bold text-red-400 mt-0.5">{disruptedCount}</p>
              </div>
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-xs shadow-red-500/50" />
            </div>

            <div className="p-3 rounded-lg bg-sky-950/30 border border-sky-800/40 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[11px]">In Recovery</span>
                <p className="text-xl font-bold text-sky-400 mt-0.5">{recoveryCount}</p>
              </div>
              <span className="w-3 h-3 rounded-full bg-sky-400 shadow-xs shadow-sky-400/50" />
            </div>

            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[11px]">Warning Buffers</span>
                <p className="text-xl font-bold text-amber-400 mt-0.5">{warningCount}</p>
              </div>
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs shadow-amber-500/50" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p>· Connected Graph: 5 Suppliers → 8 Materials → 2 Plants → 2 Hubs → 5 Stores → 10 Orders</p>
            <p>· Deterministic Blast Radius propagation modeled via directed topological reachability</p>
          </div>
        </div>

        {/* AI Agent Reasoning Feed */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Live AI Agent Activity Feed</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                5 Coordinated Agents
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('agent_activity')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              View Full Timeline →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {agentLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs hover:border-slate-600 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-200">{log.agentName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
                      {log.dataClassification}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{log.timestamp}</span>
                </div>
                <p className="font-medium text-blue-300 mt-1">{log.actionTaken}</p>
                <p className="text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{log.reasoningTrace}</p>
              </div>
            ))}

            {agentLogs.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400">
                No active disruptions. Supply chain operating at nominal baseline.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
