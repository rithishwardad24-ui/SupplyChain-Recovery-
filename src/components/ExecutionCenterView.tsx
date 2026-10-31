/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  RecoveryPlan,
  VerificationReport,
  DisruptionEvent,
} from '../types/supplyChain';
import {
  PlaySquare,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileCheck,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Info,
  Server,
  Layers,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExecutionCenterViewProps {
  activePlan: RecoveryPlan | null;
  currentDisruption: DisruptionEvent | null;
  verificationReport: VerificationReport | null;
  isExecuted: boolean;
  onExecutePlan: () => void;
  onResetExecution: () => void;
  onNavigateToTwin: () => void;
}

export const ExecutionCenterView: React.FC<ExecutionCenterViewProps> = ({
  activePlan,
  currentDisruption,
  verificationReport,
  isExecuted,
  onExecutePlan,
  onResetExecution,
  onNavigateToTwin,
}) => {
  const [executingStep, setExecutingStep] = useState<number | null>(null);

  const handleRunExecution = () => {
    setExecutingStep(1);
    setTimeout(() => setExecutingStep(2), 600);
    setTimeout(() => setExecutingStep(3), 1200);
    setTimeout(() => {
      setExecutingStep(null);
      onExecutePlan();
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {
        // confetti fallback
      }
    }, 1800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <PlaySquare className="w-5 h-5 text-emerald-400" />
              <span>Recovery Execution & Verification Center</span>
            </h2>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
              isExecuted
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : 'bg-amber-950 text-amber-300 border-amber-800'
            }`}>
              {isExecuted ? 'Execution Verified' : 'Awaiting Human Approval'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Human-in-the-loop review, automated digital twin dispatch, and multi-node constraint verification.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isExecuted ? (
            <button
              onClick={onResetExecution}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Execution State</span>
            </button>
          ) : (
            activePlan && (
              <button
                onClick={handleRunExecution}
                disabled={executingStep !== null}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-emerald-600/30 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {executingStep !== null
                    ? `Executing Step ${executingStep}/3...`
                    : `Approve & Execute ${activePlan.name.split('–')[0]}`}
                </span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Simulated Execution Banner Notice */}
      <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>Simulation Environment:</strong> All recovery actions (purchase orders, line rescheduling, freight reallocation) execute safely within the Digital Twin model. No external vendor APIs are committed without explicit enterprise gateway signoff.
          </span>
        </div>
      </div>

      {/* Active Plan Overview */}
      {activePlan && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
                Selected Strategy for Deployment
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">{activePlan.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{activePlan.objectiveDescription}</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Cost:</span>
                <span className="font-bold text-slate-200">${activePlan.totalRecoveryCostUsd.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Time:</span>
                <span className="font-bold text-slate-200">{activePlan.recoveryTimeDays} days</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">SLA Score:</span>
                <span className="font-bold text-emerald-400">{activePlan.slaPerformancePercent}%</span>
              </div>
            </div>
          </div>

          {/* Action Execution Stepper Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Operational Action Sequence ({activePlan.proposedActions.length} Scheduled Levers)
            </h4>

            <div className="space-y-2.5">
              {activePlan.proposedActions.map((action, idx) => {
                const isActionActive = executingStep === idx + 1;
                const isActionComplete = isExecuted || (executingStep !== null && executingStep > idx + 1);

                return (
                  <div
                    key={action.id}
                    className={`p-3.5 rounded-lg border transition-all text-xs flex items-start justify-between gap-3 ${
                      isActionComplete
                        ? 'bg-emerald-950/20 border-emerald-800/60'
                        : isActionActive
                        ? 'bg-blue-950/40 border-blue-500 animate-pulse'
                        : 'bg-slate-800/40 border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isActionComplete
                          ? 'bg-emerald-500 text-slate-950'
                          : isActionActive
                          ? 'bg-blue-500 text-white animate-spin'
                          : 'bg-slate-700 text-slate-300 font-mono text-[10px]'
                      }`}>
                        {isActionComplete ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h5 className="font-bold text-white">{action.title}</h5>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
                            {action.category.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 text-[11px] font-mono">
                      <span className="text-slate-200 font-bold block">${action.costUsd.toLocaleString()}</span>
                      <span className="text-slate-400 block">{action.timeHours}h lead</span>
                      <span className={`text-[10px] font-bold block mt-0.5 ${
                        isActionComplete ? 'text-emerald-400' : 'text-slate-400'
                      }`}>
                        {isActionComplete ? 'Executed' : 'Queued'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Verification Engine Detailed Audit Report */}
      {verificationReport && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Verification Engine Audit (Full Network Balance)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulated recalculation of inventory, BOM, factory capacities, transport routes, and secondary bottlenecks.
              </p>
            </div>

            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
              verificationReport.overallStatus === 'PASSED'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : 'bg-amber-950 text-amber-300 border-amber-800'
            }`}>
              {verificationReport.overallStatus === 'PASSED' ? 'ALL 6 CHECKS PASSED' : 'PASSED WITH ADVISORIES'}
            </span>
          </div>

          {/* Expected vs Verified Outcome Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-800/50 border border-slate-700/60 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                Target / Expected Outcome
              </span>
              <p className="text-slate-200 font-medium leading-relaxed">
                {verificationReport.expectedOutcome}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-800/50 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-400">
                Verified Outcome Post-Simulation
              </span>
              <p className="text-emerald-200 font-medium leading-relaxed">
                {verificationReport.verifiedOutcome}
              </p>
            </div>
          </div>

          {/* 6 Verification Checks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {verificationReport.verificationChecks.map((check) => (
              <div
                key={check.id}
                className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white truncate max-w-[200px]">{check.name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                    check.passed
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}>
                    {check.passed ? 'PASSED' : 'CHECK'}
                  </span>
                </div>
                <p className="font-mono text-[11px] text-blue-300">{check.metric}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">{check.details}</p>
              </div>
            ))}
          </div>

          {/* Remaining Risks & Secondary Shortages Audit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-3.5 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                Monitored Residual Risks
              </span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                {verificationReport.remainingRisks.map((risk, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-amber-400">·</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                Secondary Shortage Audit
              </span>
              {verificationReport.secondaryProblemsCreated.length === 0 ? (
                <p className="text-emerald-300 text-[11px]">
                  Zero secondary network shortages created. All regional buffer stock levels maintained above safety thresholds.
                </p>
              ) : (
                <ul className="space-y-1 text-slate-300 text-[11px]">
                  {verificationReport.secondaryProblemsCreated.map((prob, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-red-400">·</span>
                      <span>{prob}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Link to Digital Twin */}
          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={onNavigateToTwin}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
            >
              <span>View Updated Digital Twin Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
