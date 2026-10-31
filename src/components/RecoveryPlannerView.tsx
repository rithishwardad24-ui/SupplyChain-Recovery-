/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  RecoveryPlan,
  RecoveryStrategyId,
  DisruptionEvent,
  BlastRadiusResult,
} from '../types/supplyChain';
import { PREDEFINED_DISRUPTIONS } from '../data/initialSupplyChainData';
import {
  ShieldCheck,
  Zap,
  Leaf,
  DollarSign,
  Scale,
  Clock,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  FileCheck,
  ChevronRight,
  Flame,
  Factory,
  Truck,
  Building2,
  Layers,
  Store,
  Package,
} from 'lucide-react';

const ENTITY_LABELS: Record<string, string> = {
  // Suppliers
  'SUP-01': 'Apex Global (Rotterdam)',
  'SUP-02': 'Pacific Polymers (Kaohsiung)',
  'SUP-03': 'BioPure Extracts (Lyon)',
  'SUP-04': 'Horizon Packaging (Poznań)',
  'SUP-05': 'Nordic CleanSynthetics (Göteborg)',
  'SUP-BASF': 'BASF SE (Ludwigshafen)',
  // Materials
  'MAT-01': 'Virgin Polymer Resin (Grade A)',
  'MAT-02': 'Bio-Circular Polymer (Substitute)',
  'MAT-03': 'Concentrated Surfactant 70%',
  'MAT-04': 'Natural Botanical Scent',
  'MAT-05': 'Multi-Layer Barrier Film',
  'MAT-06': 'Eco-Stabilizer Polymer',
  'MAT-07': 'Recycled Corrugated Fluting',
  'MAT-08': 'UV Photostabilizer Additive',
  // Factories
  'FAC-01': 'Rheinland Mega-Plant (Cologne)',
  'FAC-02': 'Nordic Modular Works (Malmö)',
  // DCs
  'DC-01': 'Central European Gateway (Frankfurt)',
  'DC-02': 'Northern Logistics Depot (Antwerp)',
  // Stores
  'STR-01': 'Metro Hypermarket (Berlin)',
  'STR-02': 'Grand Express (Paris)',
  'STR-03': 'Nordic Mart (Stockholm)',
  'STR-04': 'Bavaria Central (Munich)',
  'STR-05': 'Benelux Flagship (Brussels)',
  // Orders
  'ORD-101': 'Kaufland (Tier 1)',
  'ORD-102': 'Carrefour (Tier 1)',
  'ORD-103': 'ICA Gruppen (Tier 1)',
  'ORD-104': 'Edeka (Tier 2)',
  'ORD-105': 'Colruyt (Tier 2)',
  'ORD-106': 'Auchan (Tier 2)',
  'ORD-107': 'Coop Sweden (Tier 2)',
  'ORD-108': 'Rewe (Tier 3)',
  'ORD-109': 'Delhaize (Tier 3)',
  'ORD-110': 'Berlin Local (Tier 3)',
};

interface RecoveryPlannerViewProps {
  plans: RecoveryPlan[];
  selectedPlanId: RecoveryStrategyId;
  onSelectPlan: (id: RecoveryStrategyId) => void;
  onApproveAndExecute: (plan: RecoveryPlan) => void;
  currentDisruption: DisruptionEvent | null;
  blastRadius: BlastRadiusResult | null;
  isExecuted: boolean;
  onTriggerDisruption?: (disruption: DisruptionEvent) => void;
}

export const RecoveryPlannerView: React.FC<RecoveryPlannerViewProps> = ({
  plans,
  selectedPlanId,
  onSelectPlan,
  onApproveAndExecute,
  currentDisruption,
  blastRadius,
  isExecuted,
  onTriggerDisruption,
}) => {
  const activePlan = plans.find((p) => p.id === selectedPlanId) || plans[4] || plans[0];

  const getPlanIcon = (id: RecoveryStrategyId) => {
    switch (id) {
      case 'plan_a':
        return DollarSign;
      case 'plan_b':
        return Zap;
      case 'plan_c':
        return ShieldCheck;
      case 'plan_d':
        return Leaf;
      case 'plan_e':
      default:
        return Scale;
    }
  };

  // When no plans are active, show a clean, friendly test scenario launcher
  if (!plans || plans.length === 0) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-2xl mx-auto space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Supply Chain Operating Normally</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              No active disruptions detected across the digital twin. To test the multi-agent decision engine, trigger one of the real-world operational shock scenarios below:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
            <button
              onClick={() => onTriggerDisruption && onTriggerDisruption(PREDEFINED_DISRUPTIONS[0])}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-red-500/50 hover:bg-slate-800/80 transition flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center space-x-2 text-red-400">
                  <Flame className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold">Supplier Failure</span>
                </div>
                <h4 className="text-xs font-semibold text-white mt-1.5 group-hover:text-red-300 transition">
                  Apex Global (Rotterdam)
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Polymer reactor shutdown creates 6-day delay and $150k exposure.
                </p>
              </div>
              <span className="text-[11px] text-blue-400 font-medium mt-3 flex items-center">
                Simulate Shock →
              </span>
            </button>

            <button
              onClick={() => onTriggerDisruption && onTriggerDisruption(PREDEFINED_DISRUPTIONS[2])}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center space-x-2 text-amber-400">
                  <Factory className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold">Factory Outage</span>
                </div>
                <h4 className="text-xs font-semibold text-white mt-1.5 group-hover:text-amber-300 transition">
                  Rheinland Mega-Plant
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Boiler trip halts 98k u/d packaging line for 4.5 days.
                </p>
              </div>
              <span className="text-[11px] text-blue-400 font-medium mt-3 flex items-center">
                Simulate Shock →
              </span>
            </button>

            <button
              onClick={() => onTriggerDisruption && onTriggerDisruption(PREDEFINED_DISRUPTIONS[3])}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 transition flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center space-x-2 text-cyan-400">
                  <Truck className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold">Logistics Halt</span>
                </div>
                <h4 className="text-xs font-semibold text-white mt-1.5 group-hover:text-cyan-300 transition">
                  Rhine Rail Corridor
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Signal failure delays freight between Cologne & Frankfurt.
                </p>
              </div>
              <span className="text-[11px] text-blue-400 font-medium mt-3 flex items-center">
                Simulate Shock →
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Scale className="w-5 h-5 text-blue-400" />
              <span>Multi-Objective Recovery Planner</span>
            </h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              5 Diverse Strategies
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Constrained optimization comparing cost, recovery time, customer SLA protection, operational risk, and CO₂ emissions.
          </p>
        </div>

        {activePlan && (
          <button
            onClick={() => onApproveAndExecute(activePlan)}
            disabled={isExecuted}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition shadow-lg flex items-center space-x-2 cursor-pointer ${
              isExecuted
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 cursor-default'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isExecuted ? 'Plan Executed & Verified' : `Approve & Execute ${activePlan.name.split('–')[0]}`}</span>
          </button>
        )}
      </div>

      {/* Active Outage Quick Selector / Switcher */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse shrink-0" />
          <span className="text-xs font-semibold text-slate-300">
            Outage Shock: <strong className="text-white">{currentDisruption?.title || 'Custom Outage'}</strong>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
            {currentDisruption?.targetEntityId} · {currentDisruption?.severityPercent}% Severity
          </span>
        </div>

        {onTriggerDisruption && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Switch Outage:</span>
            {[
              { id: 'DIS-01', label: '1. Supplier (SUP-01)' },
              { id: 'DIS-03', label: '2. Factory (FAC-01)' },
              { id: 'DIS-05', label: '3. Rail Route (TR-10)' },
              { id: 'DIS-06', label: '4. DC Warehouse (DC-01)' },
              { id: 'DIS-07', label: '5. Store (STR-01)' },
            ].map((s) => {
              const d = PREDEFINED_DISRUPTIONS.find((p) => p.id === s.id);
              if (!d) return null;
              const isActive = currentDisruption?.id === s.id || currentDisruption?.targetEntityId === d.targetEntityId;
              return (
                <button
                  key={s.id}
                  onClick={() => onTriggerDisruption(d)}
                  className={`px-2.5 py-1 text-[11px] rounded font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750 border border-slate-750'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5 Strategy Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {plans.map((plan) => {
          const Icon = getPlanIcon(plan.id);
          const isSelected = plan.id === selectedPlanId;

          return (
            <div
              key={plan.id}
              onClick={() => onSelectPlan(plan.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-950/50'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${
                    plan.id === 'plan_e'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : plan.id === 'plan_d'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {plan.isRecommended && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-300 border border-blue-400/40 animate-pulse">
                      Recommended
                    </span>
                  )}
                </div>

                <h3 className="text-xs font-bold text-white mt-2.5">
                  {plan.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {plan.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cost:</span>
                  <span className="font-mono font-bold text-slate-200">
                    ${(plan.totalRecoveryCostUsd / 1000).toFixed(1)}k
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recovery Time:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {plan.recoveryTimeDays} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SLA Adherence:</span>
                  <span className={`font-mono font-bold ${
                    plan.slaPerformancePercent >= 90 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {plan.slaPerformancePercent}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Multi-Echelon Recovery Pattern Across All 6 Tiers */}
      {activePlan && (
        <div className="p-5 rounded-xl bg-slate-900 border border-blue-900/40 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>Dynamic Recovery Pattern Across 6 Supply Chain Tiers</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-semibold">
                  {activePlan.name.split('–')[0].trim()} Specific Blueprint
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Visualizes the distinct mobilization of suppliers, raw materials, manufacturing lines, distribution centers, retail outlets, and protected customer orders for this plan.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-400 self-start sm:self-auto bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              <span className="text-sky-400 font-bold">{activePlan.recoveryNodeIds?.length || 0}</span> Network Nodes Mobilized
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* 1. Suppliers */}
            <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-2.5">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">1. Suppliers Mobilized</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {activePlan.activatedSupplierIds?.length || 0} Vendors
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {activePlan.activatedSupplierIds?.map((id) => (
                    <span
                      key={id}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold"
                      title={ENTITY_LABELS[id] || id}
                    >
                      {ENTITY_LABELS[id] || id}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed border-t border-slate-800/80 pt-2">
                {activePlan.recoveryPatternSummary?.supplierStrategy || 'Direct vendor engagement'}
              </p>
            </div>

            {/* 2. Raw Materials */}
            <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-2.5">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">2. Materials & Feedstock</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {activePlan.activatedMaterialIds?.length || 0} BOM Items
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {activePlan.activatedMaterialIds?.map((id) => (
                    <span
                      key={id}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold"
                      title={ENTITY_LABELS[id] || id}
                    >
                      {ENTITY_LABELS[id] || id}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed border-t border-slate-800/80 pt-2">
                {activePlan.recoveryPatternSummary?.materialStrategy || 'Material specification control'}
              </p>
            </div>

            {/* 3. Manufacturing Plants */}
            <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-2.5">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Factory className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">3. Factories & Work-Centers</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    {activePlan.activatedFactoryIds?.length || 0} Active
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {activePlan.activatedFactoryIds?.map((id) => (
                    <span
                      key={id}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold"
                      title={ENTITY_LABELS[id] || id}
                    >
                      {ENTITY_LABELS[id] || id}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed border-t border-slate-800/80 pt-2">
                {activePlan.recoveryPatternSummary?.factoryStrategy || 'Factory work-center scheduling'}
              </p>
            </div>

            {/* 4. Distribution Hubs */}
            <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-2.5">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">4. Distribution Centers</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    {activePlan.activatedDcIds?.length || 0} Hubs
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {activePlan.activatedDcIds?.map((id) => (
                    <span
                      key={id}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold"
                      title={ENTITY_LABELS[id] || id}
                    >
                      {ENTITY_LABELS[id] || id}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed border-t border-slate-800/80 pt-2">
                {activePlan.recoveryPatternSummary?.dcStrategy || 'Cross-dock warehouse fulfillment'}
              </p>
            </div>

            {/* 5. Retail Stores */}
            <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-2.5">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Store className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">5. Retail Store Outlets</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                    {activePlan.activatedStoreIds?.length || 0} Outlets
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {activePlan.activatedStoreIds?.map((id) => (
                    <span
                      key={id}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold"
                      title={ENTITY_LABELS[id] || id}
                    >
                      {ENTITY_LABELS[id] || id}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed border-t border-slate-800/80 pt-2">
                {activePlan.recoveryPatternSummary?.storeStrategy || 'Direct store fulfillment'}
              </p>
            </div>

            {/* 6. Customer Orders */}
            <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-2.5">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">6. Customer Orders Shielded</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                    {activePlan.customerOrdersProtectedCount} / 10 Orders
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {activePlan.protectedOrderIds?.map((id) => (
                    <span
                      key={id}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold"
                      title={ENTITY_LABELS[id] || id}
                    >
                      {ENTITY_LABELS[id] || id}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed border-t border-slate-800/80 pt-2">
                {activePlan.recoveryPatternSummary?.orderStrategy || 'Contractual SLA guarantee'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Six Evaluation Criteria Comparison Matrix Table */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Evaluation Criteria Benchmark Matrix (All 6 Standardized Dimensions)
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Data Classification: [KNOWN] & [ASSUMED]
          </span>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Evaluation Metric</th>
                {plans.map((p) => (
                  <th
                    key={p.id}
                    className={`py-2.5 px-3 ${
                      p.id === selectedPlanId ? 'text-blue-400 bg-blue-950/20' : ''
                    }`}
                  >
                    {p.name.split('–')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-medium text-slate-300">
                  1. Total Recovery Cost ($)
                </td>
                {plans.map((p) => (
                  <td key={p.id} className={`py-2.5 px-3 font-bold ${
                    p.id === 'plan_a' ? 'text-emerald-400' : p.id === selectedPlanId ? 'bg-blue-950/20' : ''
                  }`}>
                    ${p.totalRecoveryCostUsd.toLocaleString()}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-medium text-slate-300">
                  2. SLA Performance (% On-Time)
                </td>
                {plans.map((p) => (
                  <td key={p.id} className={`py-2.5 px-3 font-bold ${
                    p.slaPerformancePercent === 100 ? 'text-emerald-400' : p.id === selectedPlanId ? 'bg-blue-950/20' : ''
                  }`}>
                    {p.slaPerformancePercent}%
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-medium text-slate-300">
                  3. Recovery Time Duration
                </td>
                {plans.map((p) => (
                  <td key={p.id} className={`py-2.5 px-3 ${
                    p.id === 'plan_b' ? 'text-emerald-400 font-bold' : p.id === selectedPlanId ? 'bg-blue-950/20' : ''
                  }`}>
                    {p.recoveryTimeDays} days
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-medium text-slate-300">
                  4. Customer Orders Protected
                </td>
                {plans.map((p) => (
                  <td key={p.id} className={`py-2.5 px-3 ${
                    p.id === selectedPlanId ? 'bg-blue-950/20' : ''
                  }`}>
                    {p.customerOrdersProtectedCount} / 10 orders
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-medium text-slate-300">
                  5. Operational Risk Score (1-100)
                </td>
                {plans.map((p) => (
                  <td key={p.id} className={`py-2.5 px-3 ${
                    p.operationalRiskScore < 25 ? 'text-emerald-400' : 'text-amber-400'
                  } ${p.id === selectedPlanId ? 'bg-blue-950/20' : ''}`}>
                    {p.operationalRiskScore} / 100
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-medium text-slate-300">
                  6. Carbon Footprint (kg CO₂e)
                </td>
                {plans.map((p) => (
                  <td key={p.id} className={`py-2.5 px-3 ${
                    p.id === 'plan_d' ? 'text-emerald-400 font-bold' : p.id === selectedPlanId ? 'bg-blue-950/20' : ''
                  }`}>
                    {p.estimatedCo2EmissionsKg.toLocaleString()} kg
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-medium text-slate-300">
                  Mathematical Feasibility
                </td>
                {plans.map((p) => (
                  <td key={p.id} className={`py-2.5 px-3 font-sans font-semibold text-[10px] text-emerald-400 ${
                    p.id === selectedPlanId ? 'bg-blue-950/20' : ''
                  }`}>
                    VERIFIED FEASIBLE
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Plan Deep-Dive */}
      {activePlan && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Proposed Actions Checklist */}
          <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <FileCheck className="w-4 h-4 text-blue-400" />
                  <span>Proposed Simulated Operational Actions ({activePlan.proposedActions.length} Actions)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Action items scheduled for execution upon human confirmation
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Constraint Verified
              </span>
            </div>

            <div className="space-y-3">
              {activePlan.proposedActions.map((action, idx) => (
                <div
                  key={action.id}
                  className="p-3.5 rounded-lg bg-slate-800/50 border border-slate-700/60 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-[10px] font-mono">
                        {idx + 1}
                      </span>
                      <span>{action.title}</span>
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-700/80 text-slate-300">
                      {action.category.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed pl-7">
                    {action.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2 pl-7 text-[11px] text-slate-400">
                    <span>Cost: <strong className="text-slate-200">${action.costUsd.toLocaleString()}</strong></span>
                    <span>Lead: <strong className="text-slate-200">{action.timeHours}h</strong></span>
                    <span>Risk: <strong className="text-emerald-400">{action.riskRating}</strong></span>
                    <span>CO₂ Impact: <strong className="text-slate-200">{action.co2DeltaKg > 0 ? `+${action.co2DeltaKg}` : action.co2DeltaKg} kg</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trade-Offs (Pros & Cons) and Rationale */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
              Agent Decision Rationale & Trade-Offs
            </h3>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1.5">
                Strategic Advantages (Pros)
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {activePlan.pros.map((pro, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1.5">
                Trade-Offs & Compromises (Cons)
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {activePlan.cons.map((con, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-900/60 text-xs">
                <span className="font-semibold text-blue-300 block mb-1">Mathematical Feasibility:</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {activePlan.feasibilityExplanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
