/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  DisruptionEvent,
  BlastRadiusResult,
  RecoveryPlan,
  CustomerOrder,
} from '../types/supplyChain';
import { PREDEFINED_DISRUPTIONS } from '../data/initialSupplyChainData';
import { DigitalTwinNetwork } from '../engine/digitalTwinGraph';
import {
  Sliders,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  Zap,
  RotateCcw,
  ShieldAlert,
  Flame,
  CheckCircle,
  GitCompare,
} from 'lucide-react';

interface WhatIfSimulatorViewProps {
  currentDisruption: DisruptionEvent | null;
  blastRadius: BlastRadiusResult | null;
  activePlan: RecoveryPlan | null;
  previousPlan: RecoveryPlan | null;
  isSecondDisruptionActive: boolean;
  onInjectSecondDisruption: () => void;
  onRunCustomSimulation: (severity: number, delayDays: number) => void;
  onSelectScenario: (scenId: string) => void;
  onNavigateToPlanner: () => void;
  network: DigitalTwinNetwork;
}

export const WhatIfSimulatorView: React.FC<WhatIfSimulatorViewProps> = ({
  currentDisruption,
  blastRadius,
  activePlan,
  previousPlan,
  isSecondDisruptionActive,
  onInjectSecondDisruption,
  onRunCustomSimulation,
  onSelectScenario,
  onNavigateToPlanner,
  network,
}) => {
  const [severitySlider, setSeveritySlider] = useState(currentDisruption?.severityPercent || 85);
  const [delaySlider, setDelaySlider] = useState(currentDisruption?.expectedDelayDays || 5);

  const handleApplySliders = () => {
    onRunCustomSimulation(severitySlider, delaySlider);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            <span>Interactive What-If Disruption Simulator</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dynamically adjust disruption variables, forecast supply chain shockwaves, and stress-test recovery adaptability.
          </p>
        </div>

        {/* INJECT SECOND DISRUPTION ACTION (Highlight feature for hackathon) */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onInjectSecondDisruption}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 cursor-pointer shadow-lg ${
              isSecondDisruptionActive
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30 ring-2 ring-amber-400/50'
                : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-600/30 animate-pulse'
            }`}
          >
            <Flame className="w-4 h-4 text-white" />
            <span>
              {isSecondDisruptionActive
                ? 'Re-Inject Secondary Failure'
                : 'Inject Second Disruption (Adaptation Demo)'}
            </span>
          </button>
        </div>
      </div>

      {/* Dynamic Adaptation Banner (Shown when 2nd disruption occurs) */}
      {isSecondDisruptionActive && (
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border border-amber-500/60 shadow-xl space-y-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 mt-0.5">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Adaptive Replanning Triggered
                </span>
                <span className="text-xs text-slate-400">
                  In-Flight Disruption During Active Recovery
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                Secondary Failure Detected: Backup Supplier Port Congestion (Pacific Polymers)
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                The initial recovery plan scheduled emergency volume via Pacific Polymers (SUP-02). However, a secondary maritime port congestion event paralyzed Singapore container berths. SmartSupply AI detected plan invalidation and dynamically replanned.
              </p>
            </div>
          </div>

          {/* Diff between Previous Plan vs Adapted Plan */}
          {previousPlan && activePlan && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">
                  Previous Plan (Invalidated)
                </span>
                <p className="font-semibold text-slate-200 mt-1">{previousPlan.name}</p>
                <div className="mt-2 space-y-1 text-[11px] text-slate-400">
                  <p>· Primary Lever: Single-source to Pacific Polymers (SUP-02)</p>
                  <p>· Vulnerability: Fragile single-point overseas maritime corridor</p>
                  <p>· Projected Cost: ${previousPlan.totalRecoveryCostUsd.toLocaleString()}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-950/50 border border-blue-500/50">
                <span className="text-[11px] font-mono font-bold text-blue-300 uppercase">
                  Adapted Resilient Plan (Active)
                </span>
                <p className="font-semibold text-blue-200 mt-1">{activePlan.name}</p>
                <div className="mt-2 space-y-1 text-[11px] text-slate-300">
                  <p>· New Lever: Dual-source split (Nordic SUP-05 + BioPure SUP-03)</p>
                  <p>· Advantage: Fully insulated from maritime port choke points</p>
                  <p>· Recalculated Cost: ${activePlan.totalRecoveryCostUsd.toLocaleString()} (+$7.5k delta)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Simulator Control Sliders & Scenario Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Variable Sliders */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Disruption Severity Sliders
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              Live Calc
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1.5">
                <span>Supply Chain Impairment Severity:</span>
                <span className="font-mono font-bold text-blue-400 text-sm">{severitySlider}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={severitySlider}
                onChange={(e) => setSeveritySlider(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Minor (10%)</span>
                <span>Moderate (50%)</span>
                <span>Complete Outage (100%)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1.5">
                <span>Expected Outage Duration:</span>
                <span className="font-mono font-bold text-blue-400 text-sm">{delaySlider} Days</span>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                value={delaySlider}
                onChange={(e) => setDelaySlider(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 Day</span>
                <span>7 Days</span>
                <span>14 Days Max</span>
              </div>
            </div>

            <button
              onClick={handleApplySliders}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs shadow-md shadow-blue-600/30 transition cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Recalculate Blast Radius & Plans</span>
            </button>
          </div>
        </div>

        {/* Predefined Scenarios Quick Switcher */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Stress-Test Scenario Presets
            </h3>
            <span className="text-xs text-slate-400">Select scenario to simulate</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {PREDEFINED_DISRUPTIONS.slice(0, 4).map((scen) => (
              <div
                key={scen.id}
                onClick={() => onSelectScenario(scen.id)}
                className={`p-3 rounded-lg border transition cursor-pointer ${
                  currentDisruption?.id === scen.id
                    ? 'bg-blue-950/40 border-blue-500 text-white'
                    : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] font-bold text-slate-400">{scen.id}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-200">
                    {scen.severityPercent}% / {scen.expectedDelayDays}d
                  </span>
                </div>
                <h4 className="font-bold text-white mt-1 leading-snug">{scen.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Projected Sensitivity Curves */}
      {blastRadius && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
            Simulated Damage Sensitivity vs. Delay Duration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Gross Revenue at Risk</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                ${(blastRadius.estimatedRevenueAtRiskUsd / 1000).toFixed(1)}k
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Increases non-linearly past day 4 as retail stockout cascades into customer backorders.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Contractual SLA Penalties</span>
              <p className="text-2xl font-bold text-red-400 mt-1">
                ${(blastRadius.estimatedSlaPenaltiesUsd / 1000).toFixed(1)}k
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Tier 1 penalty clauses trigger after 24h grace period ($4.5k/day Kaufland, $3.8k/day Carrefour).
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Recommended Recovery Strategy</span>
              <p className="text-2xl font-bold text-blue-400 mt-1">
                {activePlan ? activePlan.name.split('–')[0] : 'Plan E'}
              </p>
              <button
                onClick={onNavigateToPlanner}
                className="mt-2 text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
              >
                <span>Inspect in Recovery Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
