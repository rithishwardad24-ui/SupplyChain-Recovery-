/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Database,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Building2,
  Truck,
  Layers,
  Zap,
  TrendingUp,
  FileText,
  Ship,
  Factory,
  Radio,
  ExternalLink,
  PlusCircle,
  UploadCloud,
  DownloadCloud,
} from 'lucide-react';
import {
  CompanyIntelligenceProfile,
  Supplier,
  DigitalTwinSyncMeta,
  DisruptionEvent,
} from '../types/supplyChain';
import { companyIntelligenceService } from '../services/companyIntelligenceService';
import { dbService } from '../firebase/dbService';
import { useAuth } from '../firebase/authContext';
import { DigitalTwinNetwork } from '../engine/digitalTwinGraph';
import { MultiAgentOrchestrator } from '../engine/agentsEngine';
import confetti from 'canvas-confetti';

interface CompanyIntelligenceAgentViewProps {
  network: DigitalTwinNetwork;
  orchestrator: MultiAgentOrchestrator;
  onSupplierAddedOrUpdated: (supplier: Supplier) => void;
  onTriggerDisruptionForSupplier?: (disruption: DisruptionEvent) => void;
}

const PRESET_COMPANIES = [
  { name: 'BASF SE', category: 'Chemicals & Resins', desc: 'World largest chemical producer (Ludwigshafen)' },
  { name: 'Dow Inc.', category: 'Polymers & PCR', desc: 'Global polyolefins & recycled resins leader' },
  { name: 'LyondellBasell', category: 'Polyolefins', desc: 'Major Dutch polyolefin & catalyst compounder' },
  { name: 'A.P. Moller - Maersk', category: 'Logistics', desc: 'Global container shipping & intermodal rail' },
  { name: 'BioPure Extracts', category: 'Green Chemistry', desc: 'Eco-certified natural surfactants & plant extract' },
  { name: 'Pacific Polymers', category: 'Asia-Pacific Resin', desc: 'Singapore Jurong Island cost-efficient polymer' },
  { name: 'Apex Global Chemicals', category: 'Feedstocks', desc: 'Rotterdam primary polymer & surfactant supplier' },
];

export const CompanyIntelligenceAgentView: React.FC<CompanyIntelligenceAgentViewProps> = ({
  network,
  orchestrator,
  onSupplierAddedOrUpdated,
  onTriggerDisruptionForSupplier,
}) => {
  const { user, dbConnected } = useAuth();
  const userId = user?.uid || 'guest-session';

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [isPulling, setIsPulling] = useState(false);
  const [pullStep, setPullStep] = useState<string>('');
  const [currentProfile, setCurrentProfile] = useState<CompanyIntelligenceProfile | null>(null);
  const [savedProfiles, setSavedProfiles] = useState<CompanyIntelligenceProfile[]>([]);
  const [activeSuppliers, setActiveSuppliers] = useState<Supplier[]>(network.getAllSuppliers());
  const [isSyncingDb, setIsSyncingDb] = useState(false);
  const [isBatchEnriching, setIsBatchEnriching] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [activeTabSub, setActiveTabSub] = useState<'profile' | 'twin_suppliers' | 'saved_dossiers'>('profile');

  // Load saved intelligence & sync state from Firestore on mount
  useEffect(() => {
    loadFirestoreData();
  }, [network]);

  const loadFirestoreData = async () => {
    try {
      const dossiers = await dbService.getRecentCompanyIntelligence(15);
      if (dossiers && dossiers.length > 0) {
        setSavedProfiles(dossiers);
        if (!currentProfile) {
          setCurrentProfile(dossiers[0]);
        }
      }
      setActiveSuppliers(network.getAllSuppliers());
    } catch (err) {
      console.warn('Could not load Firestore initial records:', err);
    }
  };

  // Agent execution: Pull company intelligence
  const handlePullIntelligence = async (companyNameInput?: string) => {
    const targetQuery = (companyNameInput || searchQuery).trim();
    if (!targetQuery) return;

    setIsPulling(true);
    setSearchQuery(targetQuery);
    setSyncStatusMsg(null);

    // Multi-step animated agent reasoning simulation
    setPullStep('Querying global enterprise registries & SEC/ESG filings...');
    await new Promise((r) => setTimeout(r, 450));

    setPullStep('Extracting chemical production capacity & BOM compatibility...');
    await new Promise((r) => setTimeout(r, 550));

    setPullStep('Analyzing shipping corridors, port congestion, and financial solvency...');
    await new Promise((r) => setTimeout(r, 400));

    setPullStep('Synthesizing Digital Twin node attributes with Gemini AI...');

    try {
      const profile = await companyIntelligenceService.pullCompanyIntelligence(targetQuery);
      setCurrentProfile(profile);
      setActiveTabSub('profile');

      // Run orchestrator agent log
      orchestrator.runCompanyIntelligenceAgent(targetQuery, profile);

      // Auto-save to Firestore
      await dbService.saveCompanyIntelligence(profile, userId);
      setSavedProfiles((prev) => [profile, ...prev.filter((p) => p.id !== profile.id)]);

      setSyncStatusMsg(`Successfully pulled intelligence for ${profile.companyName} and persisted to Firestore.`);
    } catch (err: any) {
      console.error('Pull intelligence error:', err);
      setSyncStatusMsg(`Error pulling intelligence: ${err.message || 'Check network connection'}`);
    } finally {
      setIsPulling(false);
      setPullStep('');
    }
  };

  // Inject company into Digital Twin network
  const handleInjectIntoTwin = async () => {
    if (!currentProfile) return;

    try {
      const supplierNode = network.integrateCompanyIntoTwin(currentProfile);
      onSupplierAddedOrUpdated(supplierNode);
      setActiveSuppliers(network.getAllSuppliers());

      // Persist node to Firestore database
      await dbService.saveSupplierNode(supplierNode, userId);

      // Trigger celebratory confetti
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#3b82f6', '#10b981', '#6366f1'],
      });

      setCurrentProfile({
        ...currentProfile,
        isIntegratedInTwin: true,
        isPersistedToDb: true,
      });

      setSyncStatusMsg(`Injected ${supplierNode.name} as active node ${supplierNode.id} in Digital Twin and synced to Firestore!`);
    } catch (err: any) {
      console.error('Failed to integrate into twin:', err);
      setSyncStatusMsg(`Integration error: ${err.message}`);
    }
  };

  // Sync entire Digital Twin state to Firestore
  const handleSyncEntireTwinToFirestore = async () => {
    setIsSyncingDb(true);
    setSyncStatusMsg('Backing up Digital Twin network and suppliers to Google Cloud Firestore...');

    try {
      const allSups = network.getAllSuppliers();
      const meta: DigitalTwinSyncMeta = {
        id: `sync-${Date.now()}`,
        userId,
        syncedAt: new Date().toISOString(),
        suppliersCount: allSups.length,
        materialsCount: network.getAllMaterials().length,
        factoriesCount: network.getAllFactories().length,
        dcsCount: network.getAllDCs().length,
        storesCount: network.getAllStores().length,
        ordersCount: network.getAllOrders().length,
        activeDisruption: null,
        status: 'synced',
        summary: `Synchronized ${allSups.length} suppliers and full DAG topology to cloud database.`,
      };

      await dbService.syncDigitalTwinSnapshot({ suppliers: allSups, meta }, userId);
      setSyncStatusMsg(`Success: Synchronized ${allSups.length} suppliers and network snapshot to Firestore database (ai-studio-remixsmartsupply-d7bf37cc-2a55-4dd9-8e76-3178ceefb0c9).`);
    } catch (err: any) {
      console.error('Sync to Firestore error:', err);
      setSyncStatusMsg(`Sync error: ${err.message}`);
    } finally {
      setIsSyncingDb(false);
    }
  };

  // Pull and restore Digital Twin from Firestore
  const handlePullTwinFromFirestore = async () => {
    setIsSyncingDb(true);
    setSyncStatusMsg('Reading latest supplier nodes and topology from Cloud Firestore...');

    try {
      const dbSuppliers = await dbService.getAllSupplierNodes();
      if (dbSuppliers && dbSuppliers.length > 0) {
        network.importSuppliers(dbSuppliers);
        setActiveSuppliers(network.getAllSuppliers());
        setSyncStatusMsg(`Successfully pulled and hydrated ${dbSuppliers.length} supplier nodes from Firestore into the Digital Twin.`);
      } else {
        setSyncStatusMsg('Firestore suppliers collection empty. Synced current local baseline to cloud database.');
        await handleSyncEntireTwinToFirestore();
      }
    } catch (err: any) {
      console.error('Pull from Firestore error:', err);
      setSyncStatusMsg(`Pull error: ${err.message}`);
    } finally {
      setIsSyncingDb(false);
    }
  };

  // Batch Enrich All Active Suppliers with fresh telemetry
  const handleBatchEnrich = async () => {
    setIsBatchEnriching(true);
    setSyncStatusMsg('Agent polling live telematics and port congestion for all active suppliers...');

    try {
      const enriched = await companyIntelligenceService.batchEnrichSuppliers(activeSuppliers);
      network.importSuppliers(enriched);
      setActiveSuppliers(network.getAllSuppliers());

      // Save enriched back to Firestore
      for (const sup of enriched) {
        await dbService.saveSupplierNode(sup, userId);
      }

      setSyncStatusMsg(`Agent batch-enriched ${enriched.length} suppliers with live port telematics and synchronized updates to Firestore.`);
    } catch (err: any) {
      console.error('Batch enrich error:', err);
      setSyncStatusMsg(`Batch enrich error: ${err.message}`);
    } finally {
      setIsBatchEnriching(false);
    }
  };

  // Test Disruption on Supplier
  const handleSimulateSupplierOutage = (supplierId: string, supplierName: string) => {
    if (onTriggerDisruptionForSupplier) {
      const event: DisruptionEvent = {
        id: `DIS-PULLED-${Date.now().toString().slice(-4)}`,
        title: `Outage at Ingested Supplier ${supplierName} (${supplierId})`,
        scenarioType: 'supplier_failure',
        targetEntityId: supplierId,
        targetEntityType: 'supplier',
        severityPercent: 90,
        expectedDelayDays: 6,
        affectedQuantityUnits: 48000,
        timestamp: new Date().toISOString(),
        rootCauseDescription: `Autonomous disruption injection: Unplanned steam reformer shutdown and logistics freeze at ${supplierName}.`,
        isActive: true,
      };
      onTriggerDisruptionForSupplier(event);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Agent Identity & Database Status */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 rounded-xl border border-slate-700/80 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-1 ring-white/20 shrink-0">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Supplier Intelligence Ingestion & Database Connector Agent
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Agent 0 · Autonomous Ingestion
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Pulls real-world corporate telemetry, capacities, chemical BOM compatibility, ESG ratings, and shipping corridors for any global company. Dynamically connects and persists digital twin topology directly into Google Cloud Firestore.
              </p>
            </div>
          </div>

          {/* Database Connection Pill & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-xs font-mono">
              <span className={`w-2.5 h-2.5 rounded-full ${dbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 leading-none">FIRESTORE DATABASE</div>
                <div className="text-slate-200 font-semibold truncate max-w-[170px] text-[11px]">
                  {dbConnected ? 'ai-studio-remixsmartsupply...' : 'Connecting...'}
                </div>
              </div>
            </div>

            <button
              onClick={handleSyncEntireTwinToFirestore}
              disabled={isSyncingDb}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition disabled:opacity-50 cursor-pointer"
              title="Backup digital twin nodes to Firestore"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{isSyncingDb ? 'Syncing...' : 'Sync Twin to DB'}</span>
            </button>

            <button
              onClick={handlePullTwinFromFirestore}
              disabled={isSyncingDb}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50 cursor-pointer"
              title="Pull stored supplier nodes from Firestore"
            >
              <DownloadCloud className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pull from DB</span>
            </button>
          </div>
        </div>

        {/* Status Message Alert */}
        {syncStatusMsg && (
          <div className="mt-3.5 px-3 py-2 rounded-lg bg-blue-950/40 border border-blue-800/60 text-xs text-blue-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{syncStatusMsg}</span>
            </div>
            <button
              onClick={() => setSyncStatusMsg(null)}
              className="text-slate-400 hover:text-white text-xs ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Search & Ingest Column + Dossier Display Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Query Console & Presets (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                <Search className="w-4 h-4 text-cyan-400" />
                <span>Pull Enterprise Supplier Intelligence</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Gemini AI Grounded</span>
            </div>

            {/* Search Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePullIntelligence();
              }}
              className="space-y-3"
            >
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter company name (e.g. BASF, Dow, Maersk, Covestro)..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-24 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isPulling}
                />
                <button
                  type="submit"
                  disabled={isPulling || !searchQuery.trim()}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center space-x-1 shadow-sm transition disabled:opacity-40 cursor-pointer"
                >
                  {isPulling ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  )}
                  <span>Pull</span>
                </button>
              </div>
            </form>

            {/* Pull Step Progress Indicator */}
            {isPulling && (
              <div className="mt-3.5 p-3 rounded-lg bg-blue-950/60 border border-blue-800/80 text-xs text-blue-200">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span className="font-semibold text-cyan-300">Agent Reasoning Step:</span>
                </div>
                <p className="mt-1 text-slate-300 text-[11px] font-mono leading-relaxed">{pullStep}</p>
              </div>
            )}

            {/* Quick Preset Companies */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Verified Global Suppliers (1-Click Pull)
                </label>
                <span className="text-[10px] text-slate-500">Industry Leader Presets</span>
              </div>

              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {PRESET_COMPANIES.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handlePullIntelligence(preset.name)}
                    disabled={isPulling}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 transition flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition">
                          {preset.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-mono">
                          {preset.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{preset.desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition transform group-hover:translate-x-0.5 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>

            {/* Batch Refresh Telemetry Action */}
            <div className="mt-4 pt-3.5 border-t border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">Live Supplier Telematics</p>
                <p className="text-[11px] text-slate-400">Poll latest port wait times & reliability</p>
              </div>
              <button
                onClick={handleBatchEnrich}
                disabled={isBatchEnriching}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition disabled:opacity-50 cursor-pointer"
              >
                <Radio className={`w-3.5 h-3.5 text-emerald-400 ${isBatchEnriching ? 'animate-ping' : ''}`} />
                <span>{isBatchEnriching ? 'Polling...' : 'Batch Enrich'}</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-3.5">
              <div className="text-[11px] text-slate-400 font-medium">Digital Twin Suppliers</div>
              <div className="text-xl font-bold text-white mt-1 flex items-baseline space-x-1.5">
                <span>{activeSuppliers.length}</span>
                <span className="text-xs font-normal text-emerald-400">Nodes Active</span>
              </div>
            </div>
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-3.5">
              <div className="text-[11px] text-slate-400 font-medium">Saved Intelligence Dossiers</div>
              <div className="text-xl font-bold text-white mt-1 flex items-baseline space-x-1.5">
                <span>{savedProfiles.length}</span>
                <span className="text-xs font-normal text-blue-400">in Cloud DB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dossier Display / Twin Network Integration (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Sub Navigation Bar */}
          <div className="flex items-center justify-between bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setActiveTabSub('profile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeTabSub === 'profile'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Intelligence Dossier
              </button>
              <button
                onClick={() => setActiveTabSub('twin_suppliers')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeTabSub === 'twin_suppliers'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Active Twin Suppliers ({activeSuppliers.length})
              </button>
              <button
                onClick={() => setActiveTabSub('saved_dossiers')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeTabSub === 'saved_dossiers'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Saved in DB ({savedProfiles.length})
              </button>
            </div>

            {currentProfile && (
              <span className="text-[11px] font-mono text-slate-400 mr-2 hidden sm:inline">
                ID: {currentProfile.id}
              </span>
            )}
          </div>

          {/* VIEW 1: Active Company Intelligence Dossier */}
          {activeTabSub === 'profile' && (
            <>
              {currentProfile ? (
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl space-y-5">
                  {/* Dossier Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-bold text-white tracking-tight">
                          {currentProfile.companyName}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {currentProfile.tier}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          currentProfile.operationalStatus === 'Normal'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : currentProfile.operationalStatus === 'Congested'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {currentProfile.operationalStatus}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                        <span>{currentProfile.location}</span>
                        <span>·</span>
                        <span>{currentProfile.domain}</span>
                        <span>·</span>
                        <span className="text-slate-300">{currentProfile.industry}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleInjectIntoTwin}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition cursor-pointer"
                        title="Inject this company as a live node in the Digital Twin graph"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Inject into Twin</span>
                      </button>

                      {currentProfile.isIntegratedInTwin && (
                        <button
                          onClick={() => handleSimulateSupplierOutage(currentProfile.digitalTwinSupplierId || 'SUP-01', currentProfile.companyName)}
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800 transition cursor-pointer"
                          title="Simulate outage scenario on this supplier"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Simulate Disruption</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quantitative Telemetry Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium uppercase">Daily Output Capacity</span>
                      <div className="text-lg font-bold text-white mt-0.5">
                        {currentProfile.dailyCapacityUnits.toLocaleString()}
                        <span className="text-xs font-normal text-slate-400 ml-1">u/d</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium uppercase">Delivery Reliability</span>
                      <div className="text-lg font-bold text-emerald-400 mt-0.5">
                        {currentProfile.reliabilityScore}%
                        <span className="text-xs font-normal text-slate-400 ml-1">score</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium uppercase">Base Lead Time</span>
                      <div className="text-lg font-bold text-cyan-400 mt-0.5">
                        {currentProfile.baseLeadTimeDays}
                        <span className="text-xs font-normal text-slate-400 ml-1">days</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium uppercase">Financial Health</span>
                      <div className="text-lg font-bold text-indigo-400 mt-0.5">
                        {currentProfile.financialHealthScore}/100
                        <span className="text-[10px] font-mono text-slate-400 ml-1">Z-Score</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Risk & Logistics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                      <div className="text-[11px] text-slate-400 font-medium">ESG Sustainability Rating</div>
                      <div className="text-base font-bold text-emerald-300 mt-1 flex items-center space-x-2">
                        <span>Grade {currentProfile.esgRating}</span>
                        <span className="text-xs font-mono font-normal text-slate-400">
                          ({currentProfile.carbonIntensityKgPerUnit} kg CO2/u)
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                      <div className="text-[11px] text-slate-400 font-medium">Overall Risk Level</div>
                      <div className="text-base font-bold mt-1">
                        <span className={
                          currentProfile.riskLevel === 'LOW'
                            ? 'text-emerald-400'
                            : currentProfile.riskLevel === 'MODERATE'
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }>
                          {currentProfile.riskLevel}
                        </span>
                        <span className="text-xs font-mono font-normal text-slate-400 ml-2">
                          (Geo: {currentProfile.geopoliticalRiskScore})
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                      <div className="text-[11px] text-slate-400 font-medium">Primary Shipping Ports</div>
                      <div className="text-xs font-medium text-slate-200 mt-1 truncate">
                        {currentProfile.primaryPorts.join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Live Status & Telematics Feed */}
                  <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <Radio className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-xs font-semibold text-white">Live Telemetry & Field Report:</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans pl-5">
                      {currentProfile.statusDetail}
                    </p>
                  </div>

                  {/* Materials & Commodities Supplied */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      BOM Materials & Feedstocks Supplied
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentProfile.materialsSupplied.map((matId) => (
                        <span
                          key={matId}
                          className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-blue-950/60 text-blue-300 border border-blue-800/80"
                        >
                          {matId} · {network.getMaterial(matId)?.name || 'Feedstock Material'}
                        </span>
                      ))}
                      {currentProfile.suggestedMaterialNames?.map((name) => (
                        <span
                          key={name}
                          className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Executive Briefing & Recommended Action */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/30 to-indigo-950/30 border border-blue-900/50 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Autonomous Procurement Recommendation
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {currentProfile.executiveSummary}
                    </p>
                    <p className="text-xs text-cyan-300 font-medium">
                      Strategic Lever: {currentProfile.recommendedAction}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center text-slate-400 space-y-3">
                  <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
                  <h4 className="text-base font-semibold text-white">No Company Dossier Selected</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Search for a company on the left or select a verified preset like BASF, Dow, or Maersk to pull live intelligence and connect it into the Digital Twin.
                  </p>
                </div>
              )}
            </>
          )}

          {/* VIEW 2: Active Twin Suppliers List */}
          {activeTabSub === 'twin_suppliers' && (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Connected Suppliers in Digital Twin Graph</h3>
                  <p className="text-xs text-slate-400">All supplier nodes currently participating in the digital twin topology</p>
                </div>
                <button
                  onClick={handleSyncEntireTwinToFirestore}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
                >
                  Save All to Firestore
                </button>
              </div>

              <div className="space-y-2.5">
                {activeSuppliers.map((sup) => (
                  <div
                    key={sup.id}
                    className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-blue-400">{sup.id}</span>
                        <span className="text-xs font-bold text-white">{sup.name}</span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-semibold ${
                          sup.status === 'healthy'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : sup.status === 'disrupted'
                            ? 'bg-red-500/20 text-red-300 animate-pulse'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {sup.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                        <span>{sup.location}</span>
                        <span>·</span>
                        <span>Capacity: {(sup.dailyCapacityUnits / 1000).toFixed(0)}k u/d</span>
                        <span>·</span>
                        <span>Lead: {sup.baseLeadTimeDays}d</span>
                        <span>·</span>
                        <span>Rel: {sup.reliabilityScore}%</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePullIntelligence(sup.name)}
                        className="px-2.5 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                      >
                        Deep Inspect
                      </button>
                      <button
                        onClick={() => handleSimulateSupplierOutage(sup.id, sup.name)}
                        className="px-2.5 py-1 rounded text-xs bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/80 transition cursor-pointer"
                      >
                        Test Disruption
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 3: Saved Dossiers in Firestore */}
          {activeTabSub === 'saved_dossiers' && (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Firestore Persistent Intelligence Library</h3>
                  <p className="text-xs text-slate-400">Stored dossiers available across sessions and devices</p>
                </div>
                <span className="text-xs font-mono text-emerald-400">DB Connected</span>
              </div>

              {savedProfiles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedProfiles.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setCurrentProfile(p);
                        setActiveTabSub('profile');
                      }}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-blue-600 transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-blue-400 transition truncate">
                          {p.companyName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{p.tier.split(' ')[0]}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 truncate">{p.location} · {p.industry}</p>
                      <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-850">
                        <span className="text-emerald-400 font-semibold">{p.reliabilityScore}% Reliability</span>
                        <span className="text-slate-500 font-mono">{p.dailyCapacityUnits.toLocaleString()} u/d</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No saved company dossiers in Firestore yet. Pull any company above to automatically persist it.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
