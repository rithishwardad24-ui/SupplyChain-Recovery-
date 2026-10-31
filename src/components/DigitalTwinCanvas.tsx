/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  DigitalTwinGraphNode,
  DigitalTwinGraphEdge,
  NodeHealthStatus,
  EntityType,
} from '../types/supplyChain';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  RefreshCw,
  Info,
  Eye,
} from 'lucide-react';

interface DigitalTwinCanvasProps {
  nodes: DigitalTwinGraphNode[];
  edges: DigitalTwinGraphEdge[];
  onSelectNode: (node: DigitalTwinGraphNode) => void;
  selectedNodeId?: string;
  disruptedNodeIds: Set<string>;
  recoveryNodeIds: Set<string>;
}

export const DigitalTwinCanvas: React.FC<DigitalTwinCanvasProps> = ({
  nodes,
  edges,
  onSelectNode,
  selectedNodeId,
  disruptedNodeIds,
  recoveryNodeIds,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [tierFilter, setTierFilter] = useState<number | 'all'>('all');

  const canvasWidth = 1260;
  const canvasHeight = 720;

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking canvas background
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'canvas-bg') {
      setIsPanning(true);
      setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(1.8, Math.max(0.6, prev + delta)));
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setTierFilter('all');
  };

  // Node health styling helper
  const getNodeColor = (status: NodeHealthStatus) => {
    switch (status) {
      case 'disrupted':
        return {
          bg: '#450a0a',
          border: '#ef4444',
          glow: 'rgba(239, 68, 68, 0.4)',
          text: '#fecaca',
          badge: '#ef4444',
          label: 'Disrupted',
        };
      case 'warning':
        return {
          bg: '#451a03',
          border: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.3)',
          text: '#fde68a',
          badge: '#f59e0b',
          label: 'Warning',
        };
      case 'recovery':
        return {
          bg: '#082f49',
          border: '#0284c7',
          glow: 'rgba(2, 132, 199, 0.4)',
          text: '#bae6fd',
          badge: '#38bdf8',
          label: 'Recovery',
        };
      case 'inactive':
        return {
          bg: '#1e293b',
          border: '#64748b',
          glow: 'none',
          text: '#94a3b8',
          badge: '#64748b',
          label: 'Inactive',
        };
      case 'healthy':
      default:
        return {
          bg: '#022c22',
          border: '#10b981',
          glow: 'rgba(16, 185, 129, 0.25)',
          text: '#a7f3d0',
          badge: '#10b981',
          label: 'Healthy',
        };
    }
  };

  // Filter nodes if tier filter is applied
  const visibleNodes = nodes.filter((node) => {
    if (tierFilter === 'all') return true;
    return node.tierLevel === tierFilter;
  });

  const visibleNodeMap = new Map(visibleNodes.map((n) => [n.id, n]));

  // Tier headers configuration
  const tierHeaders = [
    { title: '1. Suppliers', subtitle: '5 Verified Vendors', x: 90 },
    { title: '2. Raw Materials', subtitle: '8 BOM Ingredients', x: 290 },
    { title: '3. Factories', subtitle: '2 Mega-Plants', x: 490 },
    { title: '4. Distribution', subtitle: '2 Central Hubs', x: 690 },
    { title: '5. Retail Stores', subtitle: '5 Outlets', x: 890 },
    { title: '6. Customers', subtitle: '10 Contract Orders', x: 1100 },
  ];

  return (
    <div className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl select-none">
      {/* Top Canvas Controls Bar */}
      <div className="absolute top-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Tier Filter Bar */}
        <div className="pointer-events-auto flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-1 space-x-1 shadow-lg">
          <button
            onClick={() => setTierFilter('all')}
            className={`px-2.5 py-1 text-xs rounded font-medium transition cursor-pointer ${
              tierFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Tiers (32 Nodes)
          </button>
          {[0, 1, 2, 3, 4, 5].map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`px-2 py-1 text-xs rounded font-medium transition cursor-pointer ${
                tierFilter === t
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {['Suppliers', 'Materials', 'Factories', 'DCs', 'Stores', 'Orders'][t]}
            </button>
          ))}
        </div>

        {/* Zoom & Reset Controls */}
        <div className="pointer-events-auto flex items-center space-x-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-1 shadow-lg">
          <button
            onClick={() => handleZoom(0.15)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-slate-400 px-1">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => handleZoom(-0.15)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-slate-700 mx-1" />
          <button
            onClick={resetView}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
            title="Reset Pan & Zoom"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main SVG Interactive Graph */}
      <div
        className="w-full h-[660px] overflow-hidden cursor-grab active:cursor-grabbing bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <svg
          id="canvas-bg"
          className="w-full h-full"
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        >
          <defs>
            {/* Standard Edge Arrow */}
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
            </marker>

            {/* Disrupted Edge Arrow */}
            <marker
              id="arrow-disrupted"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
            </marker>

            {/* Recovery Edge Arrow */}
            <marker
              id="arrow-recovery"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
            </marker>

            {/* Gradients */}
            <linearGradient id="disrupted-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id="recovery-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Canvas Transform Layer */}
          <g
            transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
            style={{ transformOrigin: 'center' }}
          >
            {/* Tier Column Guidelines & Header Labels */}
            {tierFilter === 'all' &&
              tierHeaders.map((hdr, i) => (
                <g key={`col-${i}`} opacity={0.8}>
                  {/* Vertical Guide Line */}
                  <line
                    x1={hdr.x}
                    y1={30}
                    x2={hdr.x}
                    y2={canvasHeight - 40}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                    strokeWidth="1.2"
                  />
                  {/* Tier Title */}
                  <text
                    x={hdr.x}
                    y={32}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="11"
                    fontWeight="700"
                    letterSpacing="0.05em"
                  >
                    {hdr.title.toUpperCase()}
                  </text>
                  <text
                    x={hdr.x}
                    y={46}
                    textAnchor="middle"
                    fill="#475569"
                    fontSize="9"
                  >
                    {hdr.subtitle}
                  </text>
                </g>
              ))}

            {/* Directed Edges */}
            <g className="edges">
              {edges.map((edge) => {
                const sourceNode = visibleNodeMap.get(edge.source);
                const targetNode = visibleNodeMap.get(edge.target);

                if (!sourceNode || !targetNode) return null;

                // Bezier curved connector
                const deltaX = targetNode.x - sourceNode.x;
                const cp1x = sourceNode.x + deltaX * 0.5;
                const cp1y = sourceNode.y;
                const cp2x = targetNode.x - deltaX * 0.5;
                const cp2y = targetNode.y;

                const pathData = `M ${sourceNode.x + 65} ${sourceNode.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${targetNode.x - 65} ${targetNode.y}`;

                if (edge.isDisrupted) {
                  return (
                    <g key={edge.id}>
                      <path
                        d={pathData}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2.5"
                        strokeDasharray="6 3"
                        markerEnd="url(#arrow-disrupted)"
                        className="animate-pulse"
                      />
                    </g>
                  );
                }

                if (edge.isRecoveryPath) {
                  return (
                    <g key={edge.id}>
                      <path
                        d={pathData}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                        markerEnd="url(#arrow-recovery)"
                      />
                    </g>
                  );
                }

                return (
                  <path
                    key={edge.id}
                    d={pathData}
                    fill="none"
                    stroke="#334155"
                    strokeWidth="1.2"
                    markerEnd="url(#arrow)"
                    opacity={0.6}
                  />
                );
              })}
            </g>

            {/* Interactive Graph Nodes */}
            <g className="nodes">
              {visibleNodes.map((node) => {
                const color = getNodeColor(node.status);
                const isSelected = node.id === selectedNodeId;

                const cardWidth = 135;
                const cardHeight = 44;
                const left = node.x - cardWidth / 2;
                const top = node.y - cardHeight / 2;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${left}, ${top})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectNode(node);
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Glow outline on selection or disruption */}
                    {(isSelected || node.status === 'disrupted' || node.status === 'recovery') && (
                      <rect
                        x="-4"
                        y="-4"
                        width={cardWidth + 8}
                        height={cardHeight + 8}
                        rx="10"
                        fill="none"
                        stroke={color.border}
                        strokeWidth={isSelected ? '2.5' : '1.5'}
                        strokeOpacity="0.6"
                        filter="blur(2px)"
                      />
                    )}

                    {/* Node Card Rectangle */}
                    <rect
                      x="0"
                      y="0"
                      width={cardWidth}
                      height={cardHeight}
                      rx="8"
                      fill={color.bg}
                      stroke={isSelected ? '#38bdf8' : color.border}
                      strokeWidth={isSelected ? '2' : '1.2'}
                      className="transition-all duration-150"
                    />

                    {/* Status Dot */}
                    <circle
                      cx="12"
                      cy="15"
                      r="4"
                      fill={color.badge}
                      className={node.status === 'disrupted' ? 'animate-ping' : ''}
                    />
                    <circle
                      cx="12"
                      cy="15"
                      r="3.5"
                      fill={color.badge}
                    />

                    {/* Entity Code */}
                    <text
                      x="22"
                      y="18"
                      fill={color.text}
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {node.id}
                    </text>

                    {/* Entity Name */}
                    <text
                      x="12"
                      y="34"
                      fill="#f8fafc"
                      fontSize="10"
                      fontWeight="600"
                      className="truncate"
                    >
                      {node.name.length > 17 ? node.name.substring(0, 16) + '…' : node.name}
                    </text>
                  </g>
                );
              })}
            </g>
          </g>
        </svg>
      </div>

      {/* Bottom Status Legend & Quick Info */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
        {/* Node Health Legend */}
        <div className="flex items-center space-x-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Network Status:
          </span>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
            <span className="text-slate-300">Green: Healthy</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs shadow-amber-500/50" />
            <span className="text-slate-300">Yellow: Warning</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-xs shadow-red-500/50 animate-pulse" />
            <span className="text-slate-300">Red: Disrupted</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400/50" />
            <span className="text-slate-300">Blue: Recovery Active</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span className="text-slate-400">Grey: Inactive</span>
          </div>
        </div>

        {/* Interaction Hint */}
        <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span>Click any entity card to inspect live BOM, stock levels, capacity, and downstream SLA dependencies.</span>
        </div>
      </div>
    </div>
  );
};
