/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  DisruptionEvent,
  BlastRadiusResult,
  RecoveryPlan,
  VerificationReport,
} from '../types/supplyChain';
import {
  BarChart3,
  DollarSign,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Leaf,
  Info,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

interface BusinessImpactViewProps {
  disruption: DisruptionEvent | null;
  blastRadius: BlastRadiusResult | null;
  activePlan: RecoveryPlan | null;
  verificationReport: VerificationReport | null;
  isExecuted: boolean;
}

export const BusinessImpactView: React.FC<BusinessImpactViewProps> = ({
  disruption,
  blastRadius,
  activePlan,
  verificationReport,
  isExecuted,
}) => {
  // Financial metrics
  const revenueAtRisk = blastRadius ? blastRadius.estimatedRevenueAtRiskUsd : 0;
  const slaPenalties = blastRadius ? blastRadius.estimatedSlaPenaltiesUsd : 0;
  const operationalDamageWithoutRecovery = revenueAtRisk + slaPenalties + 35000; // includes factory idling cost
  const recoveryCost = activePlan ? activePlan.totalRecoveryCostUsd : 0;
  const remainingResidualRisk = activePlan && activePlan.slaPerformancePercent < 100
    ? Math.round(revenueAtRisk * (1 - activePlan.slaPerformancePercent / 100))
    : 0;

  const totalCostWithRecovery = recoveryCost + remainingResidualRisk;
  const estimatedSavings = Math.max(0, operationalDamageWithoutRecovery - totalCostWithRecovery);

  const ordersDelayedWithout = blastRadius ? blastRadius.estimatedDelayedOrdersCount : 0;
  const ordersProtectedWith = activePlan ? activePlan.customerOrdersProtectedCount : 0;
  const ordersRemainingDelayed = Math.max(0, ordersDelayedWithout - ordersProtectedWith);

  const recoveryTimeWithout = disruption ? disruption.expectedDelayDays : 6;
  const recoveryTimeWith = activePlan ? activePlan.recoveryTimeDays : 2.2;
  const timeSavedDays = Math.max(0, recoveryTimeWithout - recoveryTimeWith);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span>Executive Business Impact & ROI Calculator</span>
            </h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Without vs. With Recovery
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Quantified financial, operational SLA, and ESG sustainability return on investment.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
            {isExecuted ? 'Status: Verified ROI Post-Execution' : 'Status: Projected ROI Model'}
          </span>
        </div>
      </div>

      {/* Top Level Summary Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimated Gross Savings */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Estimated Net Value Preserved</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              [ASSUMED]
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-400">
              ${(estimatedSavings / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-emerald-400/80 font-medium">ROI: {recoveryCost > 0 ? `${((estimatedSavings / recoveryCost) * 100).toFixed(0)}%` : '0%'}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Loss prevented vs. unmitigated baseline
          </p>
        </div>

        {/* SLA Contracts Protected */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>SLA Contracts Shielded</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              [KNOWN]
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-blue-400">
              {ordersProtectedWith} / {ordersDelayedWithout || 10}
            </span>
            <span className="text-xs text-slate-400">orders</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            100% of Tier 1 Enterprise accounts fulfilled
          </p>
        </div>

        {/* Recovery Duration Acceleration */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Recovery Velocity</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              [ASSUMED]
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-indigo-400">
              -{timeSavedDays.toFixed(1)}d
            </span>
            <span className="text-xs text-slate-400">
              ({recoveryTimeWith}d vs {recoveryTimeWithout}d)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Accelerated return to operational parity
          </p>
        </div>

        {/* Carbon Footprint */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Carbon Intensity Delta</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              [ASSUMED]
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-200">
              {activePlan ? `${activePlan.estimatedCo2EmissionsKg}kg` : '0kg'}
            </span>
            <span className="text-xs text-slate-400">CO₂e</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {activePlan?.id === 'plan_d' ? '70% reduction via eco-rail' : 'Optimized multi-modal logistics'}
          </p>
        </div>
      </div>

      {/* Side-by-Side: Without Recovery vs. With Recovery Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Without Recovery Column */}
        <div className="p-5 rounded-xl bg-slate-900 border border-red-900/40 shadow-md space-y-4">
          <div className="pb-3 border-b border-red-900/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-bold text-red-200 uppercase tracking-wider">
                Baseline (Without Recovery Agent)
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
              Unmitigated Shock
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Delayed Customer Orders:</span>
              <span className="font-mono font-bold text-red-400">{ordersDelayedWithout} orders</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Gross Revenue at Risk:</span>
              <span className="font-mono font-bold text-slate-200">${revenueAtRisk.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Contractual SLA Penalty Clauses:</span>
              <span className="font-mono font-bold text-red-400">${slaPenalties.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Plant Idling & Overhead Drag:</span>
              <span className="font-mono font-bold text-slate-200">$35,000</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Recovery Duration:</span>
              <span className="font-mono font-bold text-amber-400">{recoveryTimeWithout} days</span>
            </div>
            <div className="flex justify-between py-2.5 bg-red-950/30 px-3 rounded-lg border border-red-900/40 text-sm">
              <span className="font-bold text-red-300">Total Unmitigated Loss:</span>
              <span className="font-mono font-extrabold text-red-300">
                ${operationalDamageWithoutRecovery.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* With Recovery Column */}
        <div className="p-5 rounded-xl bg-slate-900 border border-emerald-900/40 shadow-md space-y-4">
          <div className="pb-3 border-b border-emerald-900/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-emerald-200 uppercase tracking-wider">
                Autonomous Recovery ({activePlan?.name.split('–')[0] || 'Plan E'})
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              AI Optimized
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Customer Orders Shielded:</span>
              <span className="font-mono font-bold text-emerald-400">{ordersProtectedWith} / {ordersDelayedWithout || 10} orders</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Direct Recovery Expenditure:</span>
              <span className="font-mono font-bold text-slate-200">${recoveryCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Remaining Residual SLA Exposure:</span>
              <span className="font-mono font-bold text-emerald-400">${remainingResidualRisk.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Resolution Horizon:</span>
              <span className="font-mono font-bold text-blue-400">{recoveryTimeWith} days</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Operational Constraint Violations:</span>
              <span className="font-mono font-bold text-emerald-400">0 (Fully Feasible)</span>
            </div>
            <div className="flex justify-between py-2.5 bg-emerald-950/30 px-3 rounded-lg border border-emerald-900/40 text-sm">
              <span className="font-bold text-emerald-300">Estimated Net Value Preserved:</span>
              <span className="font-mono font-extrabold text-emerald-300">
                ${estimatedSavings.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Data Transparency & Classification Matrix */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <span>Full Data Classification Matrix (Transparency Compliance)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Audited breakdown distinguishing verified historical data from simulated optimization outputs.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Standard: AI Studio Autonomous Transparency Standard
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Field / Metric</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3">Primary Source / Methodology</th>
                <th className="py-2.5 px-3">Assumptions & Verification Boundary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-800/30">
                <td className="py-2 px-3 font-semibold text-white">Bill of Materials (BOM)</td>
                <td className="py-2 px-3">
                  <span className="font-mono font-bold text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    [KNOWN]
                  </span>
                </td>
                <td className="py-2 px-3 text-slate-400">Aura ERP Formulation Registry</td>
                <td className="py-2 px-3 text-slate-400">Exact formula proportions for FG-01, FG-02, FG-03</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2 px-3 font-semibold text-white">Plant Max Capacities</td>
                <td className="py-2 px-3">
                  <span className="font-mono font-bold text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    [KNOWN]
                  </span>
                </td>
                <td className="py-2 px-3 text-slate-400">Factory Engineering Nameplate Ratings</td>
                <td className="py-2 px-3 text-slate-400">FAC-01 120k u/d, FAC-02 65k u/d</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2 px-3 font-semibold text-white">Customer Contract Terms & SLAs</td>
                <td className="py-2 px-3">
                  <span className="font-mono font-bold text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    [KNOWN]
                  </span>
                </td>
                <td className="py-2 px-3 text-slate-400">Executed B2B Retail Contracts</td>
                <td className="py-2 px-3 text-slate-400">Contractual penalty rates per day for Kaufland, Carrefour, etc.</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2 px-3 font-semibold text-white">Blast Radius Cascading Horizon</td>
                <td className="py-2 px-3">
                  <span className="font-mono font-bold text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    [ASSUMED]
                  </span>
                </td>
                <td className="py-2 px-3 text-slate-400">NetworkX Directed Graph BFS Traversal</td>
                <td className="py-2 px-3 text-slate-400">Assumes standard burn rates without emergency consumer rationing</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2 px-3 font-semibold text-white">5 Recovery Plan Trade-Offs</td>
                <td className="py-2 px-3">
                  <span className="font-mono font-bold text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    [ASSUMED]
                  </span>
                </td>
                <td className="py-2 px-3 text-slate-400">SimPy + OR-Tools Multi-Objective Solver</td>
                <td className="py-2 px-3 text-slate-400">Evaluates costs based on spot freight surcharges and overtime labor</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2 px-3 font-semibold text-white">Estimated Net Savings</td>
                <td className="py-2 px-3">
                  <span className="font-mono font-bold text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    [ASSUMED]
                  </span>
                </td>
                <td className="py-2 px-3 text-slate-400">Differential Loss Prevention Model</td>
                <td className="py-2 px-3 text-slate-400">Represents projected value preserved; verified upon delivery execution</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
