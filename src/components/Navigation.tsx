/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  GitBranch,
  Globe,
  Scale,
  Bot,
} from 'lucide-react';

export type ActiveTab =
  | 'digital_twin'
  | 'company_intelligence'
  | 'recovery_planner'
  | 'agent_activity'
  // Legacy aliases mapped cleanly
  | 'overview'
  | 'csv_analysis'
  | 'disruption_center'
  | 'what_if_simulator'
  | 'execution_center'
  | 'business_impact';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  disruptionActive: boolean;
  recoveryPlanReady: boolean;
  isExecuted: boolean;
  agentEventCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  disruptionActive,
  recoveryPlanReady,
  isExecuted,
  agentEventCount,
}) => {
  // Normalize active tab to 4 primary workspaces
  const normalizedTab: 'digital_twin' | 'company_intelligence' | 'recovery_planner' | 'agent_activity' =
    activeTab === 'company_intelligence'
      ? 'company_intelligence'
      : activeTab === 'recovery_planner' || activeTab === 'disruption_center' || activeTab === 'what_if_simulator' || activeTab === 'execution_center'
      ? 'recovery_planner'
      : activeTab === 'agent_activity' || activeTab === 'csv_analysis'
      ? 'agent_activity'
      : 'digital_twin';

  const tabs = [
    {
      id: 'digital_twin' as ActiveTab,
      label: 'Digital Twin Network',
      icon: GitBranch,
      badge: disruptionActive ? 'Disrupted' : 'Healthy',
      badgeColor: disruptionActive ? 'text-red-400 bg-red-950/80 border border-red-800' : 'text-emerald-400 bg-emerald-950/80 border border-emerald-800',
    },
    {
      id: 'company_intelligence' as ActiveTab,
      label: 'Supplier Intel & DB',
      icon: Globe,
      badge: 'Agent 0',
      badgeColor: 'text-cyan-300 bg-cyan-950/80 border border-cyan-700/60',
    },
    {
      id: 'recovery_planner' as ActiveTab,
      label: 'Disruption & Recovery',
      icon: Scale,
      badge: isExecuted ? 'Executed' : disruptionActive ? '5 Plans Ready' : null,
      badgeColor: isExecuted ? 'text-emerald-400 bg-emerald-950/80 border border-emerald-800' : 'text-blue-400 bg-blue-950/80 border border-blue-800',
    },
    {
      id: 'agent_activity' as ActiveTab,
      label: 'AI Agent Logs',
      icon: Bot,
      badge: agentEventCount > 0 ? `${agentEventCount}` : null,
      badgeColor: 'text-purple-300 bg-purple-950/80 border border-purple-800',
    },
  ];

  return (
    <nav className="bg-slate-900/95 border-b border-slate-800 sticky top-16 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start sm:justify-center space-x-2 sm:space-x-4 py-2.5 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = normalizedTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-md border border-slate-700 font-semibold text-blue-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span className={isActive ? 'text-white' : ''}>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
