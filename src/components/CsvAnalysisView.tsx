/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  SAMPLE_SUPPLIER_FAILURE_CSV,
  ParsedSupplierRecord,
  parseSupplierCsv,
} from '../data/sampleSupplierFailureCsv';
import {
  requestGeminiCsvAnalysis,
  requestGeminiAdvisorChat,
  GeminiAnalysisResponse,
} from '../services/geminiService';
import { DisruptionEvent } from '../types/supplyChain';
import {
  FileSpreadsheet,
  Sparkles,
  Upload,
  Bot,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  Send,
  HelpCircle,
  ShieldAlert,
  Layers,
  FileText,
} from 'lucide-react';

interface CsvAnalysisViewProps {
  onApplyDisruptionToTwin: (disruption: DisruptionEvent) => void;
  onNavigateToTwin: () => void;
}

export const CsvAnalysisView: React.FC<CsvAnalysisViewProps> = ({
  onApplyDisruptionToTwin,
  onNavigateToTwin,
}) => {
  const [csvContent, setCsvContent] = useState<string>(SAMPLE_SUPPLIER_FAILURE_CSV);
  const [parsedRecords, setParsedRecords] = useState<ParsedSupplierRecord[]>(() =>
    parseSupplierCsv(SAMPLE_SUPPLIER_FAILURE_CSV)
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [geminiAnalysis, setGeminiAnalysis] = useState<GeminiAnalysisResponse | null>(null);
  const [showRawEditor, setShowRawEditor] = useState(false);

  // Gemini Chat state
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'gemini'; text: string }>>([
    {
      sender: 'gemini',
      text: 'I am your Gemini Supply Chain Reasoning Agent. Upload a supplier delivery CSV or analyze the Rotterdam failure dataset to identify root causes and mitigation strategies.',
    },
  ]);

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCsvContent(text);
        const parsed = parseSupplierCsv(text);
        setParsedRecords(parsed);
        setGeminiAnalysis(null);
      }
    };
    reader.readAsText(file);
  };

  // Handle Parse / Raw update
  const handleRawChange = (text: string) => {
    setCsvContent(text);
    const parsed = parseSupplierCsv(text);
    setParsedRecords(parsed);
  };

  // Run Gemini AI Analysis
  const handleRunGeminiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await requestGeminiCsvAnalysis(csvContent, parsedRecords);
      setGeminiAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Apply CSV Disruption to Digital Twin
  const handleApplyDisruption = () => {
    const delayed = parsedRecords.filter((r) => r.status === 'Delayed');
    const primarySupplierId = delayed[0]?.supplierId || 'SUP-01';
    const maxDelay = Math.max(...delayed.map((d) => d.delayDays), 6);
    const totalAffectedUnits = delayed.reduce((acc, d) => acc + d.quantityUnits, 0) || 45000;

    const event: DisruptionEvent = {
      id: `DIS-CSV-${Date.now().toString().slice(-4)}`,
      title: `CSV Ingested Disruption: ${delayed[0]?.supplierName || 'Apex Global Chemicals'} Outage`,
      scenarioType: 'supplier_failure',
      targetEntityId: primarySupplierId,
      targetEntityType: 'supplier',
      severityPercent: 95,
      expectedDelayDays: maxDelay,
      affectedQuantityUnits: totalAffectedUnits,
      timestamp: new Date().toISOString(),
      rootCauseDescription: delayed[0]?.rootCause || 'Supplier thermal synthesis failure flagged via CSV log ingestion.',
      isActive: true,
    };

    onApplyDisruptionToTwin(event);
    onNavigateToTwin();
  };

  // Send message to Gemini Advisor
  const handleSendChat = async (questionToSend?: string) => {
    const q = questionToSend || chatQuestion;
    if (!q.trim()) return;

    setChatMessages((prev) => [...prev, { sender: 'user', text: q }]);
    if (!questionToSend) setChatQuestion('');
    setChatLoading(true);

    try {
      const answer = await requestGeminiAdvisorChat(q, {
        parsedRecordsCount: parsedRecords.length,
        analysis: geminiAnalysis,
      });
      setChatMessages((prev) => [...prev, { sender: 'gemini', text: answer }]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'gemini',
          text: 'Unable to reach Gemini model. Recommending backup supplier SUP-02 and resin MAT-02.',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const delayedCount = parsedRecords.filter((r) => r.status === 'Delayed').length;
  const atRiskCount = parsedRecords.filter((r) => r.status === 'At Risk').length;
  const totalUnits = parsedRecords.reduce((acc, r) => acc + r.quantityUnits, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <span>CSV Supplier Failure Ingestion & Gemini AI Intelligence</span>
            </h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              Gemini 3.8 Flash
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ingest real-world vendor shipment telemetry via CSV, perform automated root-cause analysis with Gemini, and propagate blast radius to the Digital Twin.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <label className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Upload CSV</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => {
              setCsvContent(SAMPLE_SUPPLIER_FAILURE_CSV);
              setParsedRecords(parseSupplierCsv(SAMPLE_SUPPLIER_FAILURE_CSV));
              setGeminiAnalysis(null);
            }}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition cursor-pointer"
          >
            Reset Sample CSV
          </button>

          <button
            onClick={handleRunGeminiAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow-md shadow-purple-600/30 transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAnalyzing ? 'Analyzing with Gemini...' : 'Analyze with Gemini AI'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-slate-400 text-[11px] block">Purchase Order Lines</span>
          <p className="text-2xl font-bold text-white mt-1">{parsedRecords.length}</p>
          <span className="text-[10px] text-slate-400">Total ingested records</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-slate-400 text-[11px] block">Delayed PO Shipments</span>
          <p className="text-2xl font-bold text-red-400 mt-1">{delayedCount}</p>
          <span className="text-[10px] text-red-400/80">Critical supplier delivery failure</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-slate-400 text-[11px] block">At-Risk Batches</span>
          <p className="text-2xl font-bold text-amber-400 mt-1">{atRiskCount}</p>
          <span className="text-[10px] text-amber-400/80">Secondary transit bottlenecks</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-slate-400 text-[11px] block">Total Monitored Volume</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{(totalUnits / 1000).toFixed(0)}k units</p>
          <span className="text-[10px] text-slate-400">Feedstock & packaging volume</span>
        </div>
      </div>

      {/* Gemini AI Deep Analysis Card (Shown when analysis is generated) */}
      {geminiAnalysis && (
        <div className="p-5 sm:p-6 rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/50 shadow-2xl space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-purple-900/40 gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-purple-600/30 text-purple-300 border border-purple-500/40">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    Gemini AI Supplier Diagnostic
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    geminiAnalysis.riskSeverity === 'CRITICAL'
                      ? 'bg-red-950 text-red-300 border-red-800'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}>
                    {geminiAnalysis.riskSeverity} RISK
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Confidence: {geminiAnalysis.confidenceScore}%
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">{geminiAnalysis.summary}</h3>
              </div>
            </div>

            <button
              onClick={handleApplyDisruption}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-red-600/30 flex items-center space-x-2 cursor-pointer shrink-0"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Apply Failure to Digital Twin & Solve →</span>
            </button>
          </div>

          {/* Deep Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Root Cause Diagnosis */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-purple-400 block">
                1. Root Cause Diagnosis
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {geminiAnalysis.rootCauseAnalysis}
              </p>
              <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                Epicenter: <strong className="text-slate-200">{geminiAnalysis.primaryDisruptedSupplier.name} ({geminiAnalysis.primaryDisruptedSupplier.location})</strong>
              </div>
            </div>

            {/* Downstream Blast Radius Prediction */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-red-400 block">
                2. Downstream Blast Radius
              </span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li>· Factories: <span className="text-slate-200">{geminiAnalysis.downstreamImpactAssessment.affectedFactories.join(', ')}</span></li>
                <li>· Products: <span className="text-slate-200">{geminiAnalysis.downstreamImpactAssessment.affectedProducts.join(', ')}</span></li>
                <li>· Stockout Horizon: <span className="text-amber-400 font-semibold">{geminiAnalysis.downstreamImpactAssessment.estimatedStockoutWindow}</span></li>
                <li>· Exposure: <span className="text-red-400 font-semibold">{geminiAnalysis.downstreamImpactAssessment.slaPenaltyExposure}</span></li>
              </ul>
            </div>

            {/* Strategic AI Recommendations */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 block">
                3. Gemini Strategic Levers
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Immediate:</span>
                  <p className="text-slate-200 font-medium">{geminiAnalysis.strategicAiRecommendations.immediateAction}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">BOM Substitute:</span>
                  <p className="text-emerald-300 font-medium">{geminiAnalysis.strategicAiRecommendations.substituteLever}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout: Parsed CSV Data Table (Left) + Interactive Gemini Supply Chain Copilot (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parsed CSV Records Table */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Parsed Vendor Shipment Telemetry ({parsedRecords.length} Rows)</span>
            </h3>

            <button
              onClick={() => setShowRawEditor(!showRawEditor)}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
            >
              {showRawEditor ? 'Hide CSV Editor' : 'Edit Raw CSV'}
            </button>
          </div>

          {showRawEditor && (
            <div className="space-y-2">
              <textarea
                value={csvContent}
                onChange={(e) => handleRawChange(e.target.value)}
                rows={6}
                className="w-full bg-slate-950 font-mono text-[11px] text-slate-300 p-3 rounded-lg border border-slate-700 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 text-[10px] uppercase border-b border-slate-800 font-semibold font-mono">
                <tr>
                  <th className="py-2 px-2.5">Supplier</th>
                  <th className="py-2 px-2.5">Material</th>
                  <th className="py-2 px-2.5">PO Ref</th>
                  <th className="py-2 px-2.5">Scheduled</th>
                  <th className="py-2 px-2.5">Delay</th>
                  <th className="py-2 px-2.5">Qty</th>
                  <th className="py-2 px-2.5">Status</th>
                  <th className="py-2 px-2.5">Root Cause</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 text-[11px]">
                {parsedRecords.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/40">
                    <td className="py-2 px-2.5 font-semibold text-slate-200">
                      <div>{r.supplierName.split(' ')[0]}</div>
                      <span className="text-[10px] font-mono text-slate-400">{r.supplierId}</span>
                    </td>
                    <td className="py-2 px-2.5">
                      <div>{r.materialName}</div>
                      <span className="text-[10px] font-mono text-blue-400">{r.materialCode}</span>
                    </td>
                    <td className="py-2 px-2.5 font-mono text-slate-400">{r.poNumber}</td>
                    <td className="py-2 px-2.5 text-slate-400">{r.scheduledDelivery}</td>
                    <td className="py-2 px-2.5 font-mono font-bold">
                      {r.delayDays > 0 ? (
                        <span className="text-red-400">+{r.delayDays}d</span>
                      ) : (
                        <span className="text-emerald-400">On time</span>
                      )}
                    </td>
                    <td className="py-2 px-2.5 font-mono">{r.quantityUnits.toLocaleString()}</td>
                    <td className="py-2 px-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'Delayed'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : r.status === 'At Risk'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 text-slate-400 text-[10px] max-w-[160px] truncate" title={r.rootCause}>
                      {r.rootCause}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gemini AI Copilot & Chat Panel */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Gemini AI Supply Chain Copilot</h3>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                Live Advisor
              </span>
            </div>

            {/* Quick Prompt Chips */}
            <div className="mt-3 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Recommended Prompts:
              </span>
              <div className="flex flex-col gap-1.5 text-left">
                <button
                  onClick={() => handleSendChat('How can we mitigate the Apex Global polymer delay without air freight cost?')}
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-[11px] text-slate-300 text-left border border-slate-700/60 transition cursor-pointer"
                >
                  "How to mitigate Apex Global polymer delay without air freight?"
                </button>
                <button
                  onClick={() => handleSendChat('Can Nordic Modular Works increase shift output to offset Rheinland stoppage?')}
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-[11px] text-slate-300 text-left border border-slate-700/60 transition cursor-pointer"
                >
                  "Can Nordic plant increase shifts to offset Rheinland stoppage?"
                </button>
                <button
                  onClick={() => handleSendChat('What are the contractual SLA liabilities if Kaufland delivery slips 48h?')}
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-[11px] text-slate-300 text-left border border-slate-700/60 transition cursor-pointer"
                >
                  "What are contractual SLA liabilities for Kaufland & Carrefour?"
                </button>
              </div>
            </div>

            {/* Chat History View */}
            <div className="mt-3 space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600/30 border border-blue-500/40 text-blue-100 ml-4'
                      : 'bg-slate-800/70 border border-slate-700/70 text-slate-200 mr-2'
                  }`}
                >
                  <span className="text-[9px] font-mono font-bold block mb-1 uppercase text-slate-400">
                    {msg.sender === 'user' ? 'Operator' : 'Gemini AI Advisor'}
                  </span>
                  <p>{msg.text}</p>
                </div>
              ))}
              {chatLoading && (
                <div className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/70 text-xs text-purple-300 animate-pulse">
                  Gemini reasoning through supply chain graph constraints...
                </div>
              )}
            </div>
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="flex items-center space-x-2 pt-2 border-t border-slate-800"
          >
            <input
              type="text"
              value={chatQuestion}
              onChange={(e) => setChatQuestion(e.target.value)}
              placeholder="Ask Gemini AI about supplier failures..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatQuestion.trim()}
              className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
