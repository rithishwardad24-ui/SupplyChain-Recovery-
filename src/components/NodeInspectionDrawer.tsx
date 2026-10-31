/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DigitalTwinGraphNode, NodeHealthStatus } from '../types/supplyChain';
import { DigitalTwinNetwork } from '../engine/digitalTwinGraph';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Factory,
  Truck,
  Package,
  Layers,
  MapPin,
  TrendingUp,
  AlertOctagon,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface NodeInspectionDrawerProps {
  node: DigitalTwinGraphNode | null;
  onClose: () => void;
  network: DigitalTwinNetwork;
  onTriggerNodeDisruption?: (nodeId: string) => void;
}

export const NodeInspectionDrawer: React.FC<NodeInspectionDrawerProps> = ({
  node,
  onClose,
  network,
  onTriggerNodeDisruption,
}) => {
  if (!node) return null;

  const supplier = node.entityType === 'supplier' ? network.getSupplier(node.id) : null;
  const material = node.entityType === 'material' ? network.getMaterial(node.id) : null;
  const factory = node.entityType === 'factory' ? network.getFactory(node.id) : null;
  const dc = node.entityType === 'distribution_center' ? network.getDC(node.id) : null;
  const store = node.entityType === 'store' ? network.getStore(node.id) : null;
  const order = node.entityType === 'customer_order' ? network.getOrder(node.id) : null;

  const getStatusBadge = (status: NodeHealthStatus) => {
    switch (status) {
      case 'disrupted':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-red-950/80 text-red-300 border border-red-800 flex items-center space-x-1">
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            <span>DISRUPTED</span>
          </span>
        );
      case 'warning':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800 flex items-center space-x-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>WARNING</span>
          </span>
        );
      case 'recovery':
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-sky-950/80 text-sky-300 border border-sky-800 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>RECOVERY IN PROGRESS</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>OPERATIONAL (HEALTHY)</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-200 animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs text-blue-400 font-bold bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900">
              {node.id}
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              {node.entityType.replace('_', ' ')}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1 leading-snug">{node.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Status Card */}
        <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Current Status:</span>
          {getStatusBadge(node.status)}
        </div>

        {/* Entity-Specific Deep-Dive */}
        {supplier && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Vendor Profile</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                [KNOWN]
              </span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/50">
                <span className="text-slate-400 text-[11px] block">Location</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{supplier.location}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/50">
                <span className="text-slate-400 text-[11px] block">Reliability Score</span>
                <span className="font-semibold text-emerald-400 mt-0.5 block">{supplier.reliabilityScore}%</span>
              </div>
              <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/50">
                <span className="text-slate-400 text-[11px] block">Base Lead Time</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{supplier.baseLeadTimeDays} days</span>
              </div>
              <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/50">
                <span className="text-slate-400 text-[11px] block">Daily Production Cap</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{supplier.dailyCapacityUnits.toLocaleString()} units</span>
              </div>
            </div>

            <div className="p-3 rounded bg-slate-800/40 border border-slate-700/50 text-xs">
              <span className="text-slate-400 text-[11px] block">Materials Supplied</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {supplier.materialsSupplied.map((matId) => {
                  const m = network.getMaterial(matId);
                  return (
                    <span
                      key={matId}
                      className="px-2 py-1 rounded bg-slate-700/60 border border-slate-600 text-slate-200 font-mono text-[11px]"
                    >
                      {matId} · {m?.name.split(' ')[0]}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {material && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>BOM & Inventory Telemetry</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                [KNOWN]
              </span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/50">
                <span className="text-slate-400 text-[11px] block">Current Stock</span>
                <span className="font-semibold text-blue-400 text-sm mt-0.5 block">{material.currentStockUnits.toLocaleString()} units</span>
              </div>
              <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/50">
                <span className="text-slate-400 text-[11px] block">Safety Stock Reserve</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{material.safetyStockUnits.toLocaleString()} units</span>
              </div>
              <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/50">
                <span className="text-slate-400 text-[11px] block">Unit Purchase Cost</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">${material.unitCost.toFixed(2)}/kg</span>
              </div>
              <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/50">
                <span className="text-slate-400 text-[11px] block">Daily Consumption</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{material.dailyConsumptionRate} u/day</span>
              </div>
            </div>

            {material.substituteMaterialId && (
              <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-900/60 text-xs">
                <span className="font-semibold text-blue-300 block">Pre-Qualified BOM Substitute:</span>
                <p className="text-slate-300 mt-1">
                  {material.substituteMaterialId} (Bio-Resin Blend) with {material.substituteCompatibilityPercent}% molecular compatibility. Fully eligible for instant automated swap under Plan B or Plan D.
                </p>
              </div>
            )}
          </div>
        )}

        {factory && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Plant Telemetry</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                [KNOWN]
              </span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/50">
                <span className="text-slate-400 text-[11px] block">Max Daily Throughput</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{factory.maxDailyCapacityUnits.toLocaleString()} u/day</span>
              </div>
              <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/50">
                <span className="text-slate-400 text-[11px] block">Current Utilization</span>
                <span className="font-semibold text-emerald-400 mt-0.5 block">{Math.round((factory.currentDailyOutputUnits / factory.maxDailyCapacityUnits) * 100)}% ({factory.currentDailyOutputUnits.toLocaleString()} u/d)</span>
              </div>
              <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/50">
                <span className="text-slate-400 text-[11px] block">Operating Cost</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">${factory.operatingCostPerHour.toLocaleString()}/hour</span>
              </div>
              <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/50">
                <span className="text-slate-400 text-[11px] block">OEE Efficiency</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{factory.efficiencyPercent}%</span>
              </div>
            </div>
          </div>
        )}

        {dc && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Hub Logistics</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                [KNOWN]
              </span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/50">
                <span className="text-slate-400 text-[11px] block">Current Stored Pallets</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{dc.currentInventoryUnits.toLocaleString()} units</span>
              </div>
              <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/50">
                <span className="text-slate-400 text-[11px] block">Available Fleet</span>
                <span className="font-semibold text-emerald-400 mt-0.5 block">{dc.availableTrucks} tractors/chassis</span>
              </div>
              <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/50 col-span-2">
                <span className="text-slate-400 text-[11px] block">Serviced Retail Stores</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{dc.servesStoreIds.join(', ')}</span>
              </div>
            </div>
          </div>
        )}

        {order && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Customer Contract & SLA</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                [KNOWN]
              </span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/50">
                <span className="text-slate-400 text-[11px] block">Customer Tier</span>
                <span className={`font-semibold mt-0.5 block ${order.tier === 'Tier 1 Enterprise' ? 'text-amber-400' : 'text-slate-200'}`}>
                  {order.tier}
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/50">
                <span className="text-slate-400 text-[11px] block">Order Value</span>
                <span className="font-semibold text-emerald-400 text-sm mt-0.5 block">${order.orderValueUsd.toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/50">
                <span className="text-slate-400 text-[11px] block">Promised Date</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{order.promisedDeliveryDate}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/50">
                <span className="text-slate-400 text-[11px] block">SLA Penalty / Day</span>
                <span className="font-semibold text-red-400 mt-0.5 block">${order.slaPenaltyPerDayUsd.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* General Node Metrics */}
        <div className="border-t border-slate-800 pt-4">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-2">
            Active Attributes
          </span>
          <div className="space-y-1.5 text-xs">
            {Object.entries(node.metrics).map(([key, val]) => (
              <div key={key} className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">{key}:</span>
                <span className="font-medium text-slate-200 font-mono">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Drawer Footer with Quick Disruption Trigger */}
      {onTriggerNodeDisruption && node.status !== 'disrupted' && (
        <div className="p-4 border-t border-slate-800 bg-slate-950/70">
          <button
            onClick={() => onTriggerNodeDisruption(node.id)}
            className="w-full py-2 px-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-300 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <AlertOctagon className="w-4 h-4 text-red-400" />
            <span>Simulate Disruption at {node.id}</span>
          </button>
        </div>
      )}
    </div>
  );
};
