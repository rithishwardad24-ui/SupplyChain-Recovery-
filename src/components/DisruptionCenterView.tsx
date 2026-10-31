/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  DisruptionEvent,
  BlastRadiusResult,
  CustomerOrder,
  EntityType,
} from '../types/supplyChain';
import { PREDEFINED_DISRUPTIONS } from '../data/initialSupplyChainData';
import { DigitalTwinNetwork } from '../engine/digitalTwinGraph';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Building,
  Factory,
  Package,
  Truck,
  Store,
  DollarSign,
  PlusCircle,
  Play,
  CheckCircle,
} from 'lucide-react';

interface DisruptionCenterViewProps {
  currentDisruption: DisruptionEvent | null;
  blastRadius: BlastRadiusResult | null;
  onTriggerDisruption: (disruption: DisruptionEvent) => void;
  onClearDisruption: () => void;
  onNavigateToRecovery: () => void;
  network: DigitalTwinNetwork;
}

export const DisruptionCenterView: React.FC<DisruptionCenterViewProps> = ({
  currentDisruption,
  blastRadius,
  onTriggerDisruption,
  onClearDisruption,
  onNavigateToRecovery,
  network,
}) => {
  // Custom Disruption Form state
  const [customEntityId, setCustomEntityId] = useState('SUP-01');
  const [customSeverity, setCustomSeverity] = useState(85);
  const [customDelayDays, setCustomDelayDays] = useState(5);
  const [customTitle, setCustomTitle] = useState('Custom Raw Material Allocation Freeze');
  const [customNotes, setCustomNotes] = useState('Critical port customs inspection and container shortage delay.');

  const handleTriggerCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const entityType: EntityType = customEntityId.startsWith('SUP')
      ? 'supplier'
      : customEntityId.startsWith('MAT')
      ? 'material'
      : customEntityId.startsWith('FAC')
      ? 'factory'
      : customEntityId.startsWith('DC')
      ? 'distribution_center'
      : 'store';

    const customEvent: DisruptionEvent = {
      id: `DIS-CUSTOM-${Date.now().toString().slice(-4)}`,
      title: customTitle,
      scenarioType: 'custom',
      targetEntityId: customEntityId,
      targetEntityType: entityType,
      severityPercent: customSeverity,
      expectedDelayDays: customDelayDays,
      affectedQuantityUnits: Math.round(customSeverity * 500),
      timestamp: new Date().toISOString(),
      rootCauseDescription: customNotes,
      isActive: true,
    };

    onTriggerDisruption(customEvent);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Active Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <AlertOctagon className="w-5 h-5 text-red-500" />
            <span>Disruption Intelligence & Blast Radius Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate operational shocks and evaluate multi-tier blast radius propagation through the Digital Twin.
          </p>
        </div>

        {currentDisruption && currentDisruption.isActive && (
          <div className="flex items-center space-x-2">
            <button
              onClick={onClearDisruption}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              Clear Disruption
            </button>
            <button
              onClick={onNavigateToRecovery}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow-md shadow-blue-600/30 flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Solve with Recovery Agent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Grid: Predefined Scenarios (Left) & Custom Disruption Form (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Predefined Scenarios Catalog */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Predefined Industry Disruption Scenarios (7 Scenarios)
            </h3>
            <span className="text-xs text-slate-400">Click to inject event</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PREDEFINED_DISRUPTIONS.map((scen) => {
              const isSelected = currentDisruption?.id === scen.id;
              return (
                <div
                  key={scen.id}
                  onClick={() => onTriggerDisruption(scen)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-red-950/60 border-red-500 ring-2 ring-red-500/30'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      {scen.id} · {scen.targetEntityId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        isSelected
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {scen.severityPercent}% Severity
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white mt-2 leading-snug">
                    {scen.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {scen.rootCauseDescription}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{scen.expectedDelayDays} days delay</span>
                    <span className="text-blue-400 font-semibold flex items-center space-x-1">
                      <span>Inject</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Disruption Form */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md h-fit space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <PlusCircle className="w-4 h-4 text-purple-400" />
              <span>Custom Disruption Builder</span>
            </h3>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              Interactive
            </span>
          </div>

          <form onSubmit={handleTriggerCustom} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Target Entity in Supply Chain
              </label>
              <select
                value={customEntityId}
                onChange={(e) => setCustomEntityId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <optgroup label="Suppliers">
                  <option value="SUP-01">SUP-01: Apex Global Chemicals (Rotterdam)</option>
                  <option value="SUP-02">SUP-02: Pacific Polymers Ltd (Singapore)</option>
                  <option value="SUP-03">SUP-03: BioPure Extracts Inc (France)</option>
                  <option value="SUP-04">SUP-04: Horizon Packaging & Foil (Germany)</option>
                  <option value="SUP-05">SUP-05: Nordic CleanSynthetics (Sweden)</option>
                </optgroup>
                <optgroup label="Raw Materials">
                  <option value="MAT-01">MAT-01: Virgin Polymer Resin</option>
                  <option value="MAT-02">MAT-02: Bio-Circular Polymer Blend</option>
                  <option value="MAT-03">MAT-03: Concentrated Surfactant 70%</option>
                  <option value="MAT-04">MAT-04: Botanical Scent Essence</option>
                  <option value="MAT-05">MAT-05: Multi-Layer Barrier Foil</option>
                </optgroup>
                <optgroup label="Factories & Logistics">
                  <option value="FAC-01">FAC-01: Rheinland Mega-Plant (Cologne)</option>
                  <option value="FAC-02">FAC-02: Nordic Modular Works (Malmö)</option>
                  <option value="DC-01">DC-01: Central European Hub (Frankfurt)</option>
                  <option value="DC-02">DC-02: Northern Logistics Port (Antwerp)</option>
                </optgroup>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Disruption Severity</span>
                <span className="font-mono text-white font-bold">{customSeverity}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={customSeverity}
                onChange={(e) => setCustomSeverity(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Expected Operational Delay</span>
                <span className="font-mono text-white font-bold">{customDelayDays} Days</span>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                value={customDelayDays}
                onChange={(e) => setCustomDelayDays(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Scenario Title</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Root Cause Description</label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg transition shadow-md shadow-purple-600/30 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Inject Custom Disruption</span>
            </button>
          </form>
        </div>
      </div>

      {/* Active Blast Radius Impact Section */}
      {blastRadius && currentDisruption && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <AlertOctagon className="w-4 h-4 text-red-400" />
                <span>Blast Radius & Cascading Impact Analysis</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Topological dependencies traversed downstream from epicenter: <strong className="text-slate-200">{currentDisruption.targetEntityId}</strong>
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Data: [KNOWN] + [ASSUMED]
              </span>
            </div>
          </div>

          {/* Blast Radius Stat Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400 text-[11px] block">Production Shortage</span>
              <p className="text-lg font-bold text-red-400 mt-0.5">
                {blastRadius.estimatedProductionShortageUnits.toLocaleString()} units
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Estimated manufacturing loss</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400 text-[11px] block">Customer Orders Delayed</span>
              <p className="text-lg font-bold text-amber-400 mt-0.5">
                {blastRadius.estimatedDelayedOrdersCount} / 10 orders
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">{blastRadius.slaViolationsCount} contractual breaches</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400 text-[11px] block">Revenue at Risk</span>
              <p className="text-lg font-bold text-slate-100 mt-0.5">
                ${(blastRadius.estimatedRevenueAtRiskUsd / 1000).toFixed(1)}k
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Pending delivery verification</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400 text-[11px] block">SLA Contract Penalty</span>
              <p className="text-lg font-bold text-red-400 mt-0.5">
                ${blastRadius.estimatedSlaPenaltiesUsd.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Tier 1 & Tier 2 clause liabilities</span>
            </div>
          </div>

          {/* Downstream Entity Impact Lists */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Impacted Materials & Plants */}
            <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
              <h4 className="font-bold text-slate-200 mb-2 flex items-center space-x-1.5">
                <Package className="w-3.5 h-3.5 text-blue-400" />
                <span>Affected Materials & Plants</span>
              </h4>
              <div className="space-y-1.5">
                {blastRadius.affectedMaterialIds.map((matId) => {
                  const m = network.getMaterial(matId);
                  return (
                    <div key={matId} className="flex justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800 font-mono text-[11px]">
                      <span className="text-slate-300 font-semibold">{matId}</span>
                      <span className="text-slate-400 truncate max-w-[150px]">{m?.name}</span>
                    </div>
                  );
                })}
                {blastRadius.affectedFactoryIds.map((facId) => {
                  const f = network.getFactory(facId);
                  return (
                    <div key={facId} className="flex justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800 font-mono text-[11px]">
                      <span className="text-red-400 font-semibold">{facId}</span>
                      <span className="text-slate-400">{f?.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Impacted Logistics & Stores */}
            <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
              <h4 className="font-bold text-slate-200 mb-2 flex items-center space-x-1.5">
                <Store className="w-3.5 h-3.5 text-amber-400" />
                <span>Affected Hubs & Retail Stores</span>
              </h4>
              <div className="space-y-1.5">
                {blastRadius.affectedDcIds.map((dcId) => {
                  const dc = network.getDC(dcId);
                  return (
                    <div key={dcId} className="flex justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800 font-mono text-[11px]">
                      <span className="text-amber-400 font-semibold">{dcId}</span>
                      <span className="text-slate-400">{dc?.name}</span>
                    </div>
                  );
                })}
                {blastRadius.affectedStoreIds.map((stId) => {
                  const st = network.getStore(stId);
                  return (
                    <div key={stId} className="flex justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800 font-mono text-[11px]">
                      <span className="text-slate-300 font-semibold">{stId}</span>
                      <span className="text-slate-400">{st?.city}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cascade Path Traversal */}
            <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
              <h4 className="font-bold text-slate-200 mb-2 flex items-center space-x-1.5">
                <Truck className="w-3.5 h-3.5 text-purple-400" />
                <span>Directed Cascade Traversal</span>
              </h4>
              <div className="space-y-1 overflow-y-auto max-h-40 text-[11px] font-mono">
                {blastRadius.traversedPath.slice(0, 6).map((step, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-300 py-0.5">
                    <span>{step.fromId} → {step.toId}</span>
                    <span className="text-red-400">{step.severityScore}% impact</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* At-Risk Customer Orders Table */}
          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              At-Risk Customer Contracts & SLA Liabilities
            </h4>
            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase border-b border-slate-800 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Tier</th>
                    <th className="py-2.5 px-3">Contract Value</th>
                    <th className="py-2.5 px-3">Promised Delivery</th>
                    <th className="py-2.5 px-3">SLA Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {blastRadius.affectedOrderIds.map((ordId) => {
                    const order = network.getOrder(ordId);
                    if (!order) return null;
                    const isEnterprise = order.tier === 'Tier 1 Enterprise';
                    return (
                      <tr key={ordId} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-mono font-semibold text-slate-200">{order.id}</td>
                        <td className="py-2 px-3 font-medium text-white">{order.customerName}</td>
                        <td className="py-2 px-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            isEnterprise ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {order.tier}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono font-semibold text-emerald-400">
                          ${order.orderValueUsd.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-slate-400">{order.promisedDeliveryDate}</td>
                        <td className="py-2 px-3">
                          <span className="text-[11px] font-semibold text-red-400 flex items-center space-x-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Risk: ${order.slaPenaltyPerDayUsd}/d penalty</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
