/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  RotateCcw,
  Zap,
  HelpCircle,
  Activity,
  Layers,
  Sparkles,
  Info,
  User,
  Database,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../firebase/authContext';
import { AuthModal } from './AuthModal';

interface HeaderProps {
  onResetDemo: () => void;
  onRunDemoScenario: () => void;
  activeDisruptionCount: number;
  hasActiveDisruption: boolean;
  isSecondDisruptionActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onResetDemo,
  onRunDemoScenario,
  activeDisruptionCount,
  hasActiveDisruption,
  isSecondDisruptionActive,
}) => {
  const [showTransparencyModal, setShowTransparencyModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, profile, dbConnected } = useAuth();

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Clean Title */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base sm:text-lg tracking-tight text-white">SmartSupply AI</span>
                  {hasActiveDisruption ? (
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                      Disruption Active
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Optimal
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Autonomous Supply Chain Digital Twin & Decision Engine
                </p>
              </div>
            </div>

            {/* Quick Actions & Database Status */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Database Status */}
              <div
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-800/80 border border-slate-700 text-slate-300"
                title="Google Cloud Firestore Persistent Database"
              >
                <span className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-slate-400 hidden md:inline">DB:</span>
                <span className="text-emerald-400 font-semibold">{dbConnected ? 'Firestore' : 'Connecting'}</span>
              </div>

              {/* Quick Demo Run Button */}
              <button
                onClick={onRunDemoScenario}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer ${
                  hasActiveDisruption
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{hasActiveDisruption ? 'Re-Trigger Shock' : 'Simulate Outage'}</span>
              </button>

              {/* Reset Demo Button */}
              <button
                onClick={onResetDemo}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
                title="Reset supply chain to healthy baseline state"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              {/* User Authentication Trigger */}
              <button
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              >
                {profile || user ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="truncate max-w-[80px]">{profile?.displayName || 'User'}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5 text-blue-400" />
                    <span className="hidden sm:inline">Sign In</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Data Transparency Modal */}
        {showTransparencyModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 text-slate-200 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Info className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-semibold text-white text-base">Data Transparency & Classification System</h3>
                </div>
                <button
                  onClick={() => setShowTransparencyModal(false)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs leading-relaxed text-slate-300">
                <p>
                  In compliance with autonomous system transparency requirements, every input metric and computed output in SmartSupply AI carries an explicit classification:
                </p>

                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 flex items-start space-x-3">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    [KNOWN]
                  </span>
                  <div>
                    <p className="font-semibold text-emerald-200">Verified Empirical Data</p>
                    <p className="text-slate-400 mt-0.5">
                      Directly sourced from ERP databases, warehouse WMS telemetry, BOM formulation registries, historical supplier contracts, or verified by human operators.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-800/50 flex items-start space-x-3">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    [ASSUMED]
                  </span>
                  <div>
                    <p className="font-semibold text-purple-200">Simulated or Forecasted Value</p>
                    <p className="text-slate-400 mt-0.5">
                      Estimated using graph propagation, Scikit-learn demand forecasts, SimPy discrete-event runs, or multi-objective optimization approximations. Never represented as live confirmed reality until executed and verified.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800/70 p-3 rounded-lg border border-slate-700">
                  <p className="text-[11px] text-slate-400">
                    <span className="font-medium text-slate-200">Database:</span> Google Cloud Firestore (ID: {dbConnected ? 'Connected' : 'Connecting'}) · 
                    <span className="font-medium text-slate-200"> Security:</span> ABAC Zero-Trust Rules Deployed · 
                    <span className="font-medium text-slate-200"> Auth:</span> Firebase Authentication
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowTransparencyModal(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};
