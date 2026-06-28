import React, { useState } from "react";
import { StartupIdea, IdeaLog, CompetitorInsight, RiskAnalysis, Recommendation } from "../types";
import { 
  TrendingUp, ShieldAlert, Award, AlertTriangle, Lightbulb, 
  ArrowRight, Shield, Target, Plus, CheckCircle, Brain, RefreshCw, AlertCircle
} from "lucide-react";

interface DashboardProps {
  idea: StartupIdea;
  onRefresh?: () => void;
}

export default function Dashboard({ idea, onRefresh }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "swot" | "competitors" | "risks" | "recommendations">("overview");

  if (idea.status === "processing") {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-md shadow-xl max-w-2xl mx-auto relative overflow-hidden">
          {/* Subtle animated light bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500/30 via-teal-400 to-cyan-500/30 animate-pulse" />

          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-teal-500/20 border-t-teal-400 animate-spin flex items-center justify-center" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-6 h-6 text-teal-400 animate-pulse" />
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold font-display text-white mb-2">
            Intelligence Pipeline Active
          </h3>
          <p className="text-sm text-slate-400 mb-8 max-w-md mx-auto">
            Specialized AI validation agents are actively parsing market data, testing competitive resistance, and modeling risks for <strong className="text-teal-400">"{idea.title}"</strong>.
          </p>

          <div className="text-left bg-slate-950/80 rounded-xl border border-slate-800 p-5 font-mono text-xs text-slate-400 space-y-3 max-h-80 overflow-y-auto shadow-inner">
            <div className="flex justify-between items-center text-slate-500 border-b border-slate-800 pb-2 mb-2">
              <span>AGENT SUITE LOGS</span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                <span>POLLING PIPELINE</span>
              </span>
            </div>
            
            {idea.logs?.map((log, idx) => {
              const agentColors: Record<IdeaLog["agent"], string> = {
                Market: "text-emerald-400",
                Competitor: "text-cyan-400",
                Risk: "text-rose-400",
                SWOT: "text-amber-400",
                System: "text-slate-400",
              };
              
              return (
                <div key={idx} className="flex items-start space-x-2">
                  <span className="text-slate-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={`font-semibold ${agentColors[log.agent]}`}>
                    {log.agent} Agent:
                  </span>
                  <span className="text-slate-300 break-words flex-1">{log.message}</span>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-slate-500 flex items-center justify-center">
            <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
            Analysis completes in approximately 5-10 seconds. Updates automatically.
          </p>
        </div>
      </div>
    );
  }

  if (idea.status === "failed") {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="bg-rose-950/10 border border-rose-900/30 rounded-2xl p-8 backdrop-blur-md shadow-xl">
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-rose-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold font-display text-white mb-2">
            Validation Process Interrupted
          </h3>
          <p className="text-sm text-rose-300/80 mb-6 max-w-md mx-auto">
            Our multi-agent consensus ran into an error during calculation. This usually occurs if external rate-limits or invalid schemas are triggered.
          </p>
          <div className="bg-slate-950 border border-slate-900 text-left p-4 rounded-xl font-mono text-xs text-slate-400 mb-6 max-w-lg mx-auto overflow-x-auto">
            <div className="text-rose-400 font-semibold mb-1">CRITICAL ERROR:</div>
            {idea.error || "Gemini inference timed out or returned structured schema exception."}
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="cursor-pointer inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg text-sm transition-colors border border-slate-700"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Analysis</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Visual helper for severity colors
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "High":
        return "bg-rose-500/10 border-rose-500/20 text-rose-400";
      case "Medium":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      default:
        return "bg-teal-500/10 border-teal-500/20 text-teal-400";
    }
  };

  // Score badge helper color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-teal-400 border-teal-500/30 bg-teal-500/10";
    if (score >= 60) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  return (
    <div className="space-y-6">
      {/* Overview Dashboard Header */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2 flex-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/15 text-emerald-400 rounded-full border border-emerald-500/20 flex items-center space-x-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Audit Verified</span>
            </span>
            <span className="text-slate-500 text-xs">
              Analyzed {new Date(idea.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold font-display text-white tracking-tight">
            {idea.title}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            {idea.description}
          </p>
          <div className="pt-2 text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
            <span>
              <strong className="text-slate-300">Target Segment:</strong> {idea.targetMarket}
            </span>
            {idea.extraContext && (
              <span className="text-slate-500 italic">
                (Supplemental metadata ingested)
              </span>
            )}
          </div>
        </div>

        {/* Big Overall Viability Circle */}
        <div className="flex items-center space-x-4 md:border-l md:border-slate-800/80 md:pl-8">
          <div className="relative flex items-center justify-center">
            {/* SVG circle */}
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                className="stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                className={`transition-all duration-1000 ease-out ${
                  (idea.viabilityScore || 0) >= 80 
                    ? "stroke-teal-400" 
                    : (idea.viabilityScore || 0) >= 60 
                      ? "stroke-amber-400" 
                      : "stroke-rose-400"
                }`}
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * (idea.viabilityScore || 0)) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black font-display text-white">
                {idea.viabilityScore}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                VIABILITY
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-800 overflow-x-auto scrollbar-none gap-2">
        {(["overview", "swot", "competitors", "risks", "recommendations"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`cursor-pointer px-4 py-2.5 font-semibold text-sm border-b-2 transition-all duration-150 whitespace-nowrap capitalize ${
              activeTab === tab
                ? "border-teal-400 text-teal-400 font-bold bg-teal-400/5"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            {tab === "overview" ? "Executive Summary" : tab}
          </button>
        ))}
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Subscores Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Market Demand",
                score: idea.subScores?.marketDemand || 0,
                desc: "Measures macro trends and consumer desire",
                icon: TrendingUp,
              },
              {
                title: "Feasibility",
                score: idea.subScores?.feasibility || 0,
                desc: "Tech Complexity vs Capital Requirements",
                icon: Target,
              },
              {
                title: "Risk Resilience",
                score: idea.subScores?.riskMitigation || 0,
                desc: "Ease of protecting and regulatory hurdles",
                icon: Shield,
              },
              {
                title: "Moat Value",
                score: idea.subScores?.competitiveAdvantage || 0,
                desc: "Strength of competitive differentiation",
                icon: Award,
              },
            ].map((sub, i) => {
              const Icon = sub.icon;
              return (
                <div key={i} className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold text-slate-400">{sub.title}</span>
                    <div className="p-1.5 bg-slate-800 rounded-lg text-slate-400">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold font-display text-white">{sub.score}</span>
                      <span className="text-xs text-slate-500">/ 100</span>
                    </div>
                    {/* Tiny Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-950 rounded-full mt-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          sub.score >= 80 ? "bg-teal-400" : sub.score >= 60 ? "bg-amber-400" : "bg-rose-400"
                        }`}
                        style={{ width: `${sub.score}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 leading-snug">
                      {sub.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Deep Audience Insights & Opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 backdrop-blur-md space-y-4">
              <h3 className="text-lg font-bold font-display text-white flex items-center">
                <Brain className="w-5 h-5 mr-2 text-teal-400" />
                Audience Behavior & Adoption Logic
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {idea.marketAnalysis?.audienceInsights}
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 backdrop-blur-md space-y-4">
              <h3 className="text-lg font-bold font-display text-white flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-amber-400" />
                Uncapped Opportunities
              </h3>
              <ul className="space-y-2.5">
                {idea.marketAnalysis?.opportunities?.map((opp, i) => (
                  <li key={i} className="flex items-start text-xs text-slate-300 leading-relaxed">
                    <Plus className="w-4 h-4 mr-1.5 text-teal-400 shrink-0" />
                    <span>{opp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Macro Trends */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 backdrop-blur-md">
            <h3 className="text-lg font-bold font-display text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-teal-400" />
              Ingested Macro Trends
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {idea.marketAnalysis?.trends?.map((trend, i) => (
                <div key={i} className="bg-slate-950/80 border border-slate-800 p-4 rounded-lg flex items-start space-x-3">
                  <div className="text-xs font-semibold bg-teal-500/10 text-teal-400 w-6 h-6 rounded-full flex items-center justify-center shrink-0 border border-teal-500/20">
                    {i + 1}
                  </div>
                  <span className="text-xs text-slate-300 leading-normal">{trend}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SWOT MATRIX */}
      {activeTab === "swot" && (
        <div className="space-y-4">
          <div className="p-1">
            <h3 className="text-xl font-bold font-display text-white mb-1">SWOT Consensus Matrix</h3>
            <p className="text-xs text-slate-400 mb-6">
              Synthesized by SWOT Agent considering internal execution capabilities and external environment vulnerabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 backdrop-blur-md space-y-3">
              <div className="flex items-center space-x-2 border-b border-emerald-500/10 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h4 className="font-bold font-display text-emerald-400">Strengths (Internal)</h4>
              </div>
              <ul className="space-y-2.5 pl-1">
                {idea.swot?.strengths?.map((str, i) => (
                  <li key={i} className="flex items-start text-xs text-slate-300 leading-relaxed">
                    <span className="text-emerald-400 font-bold mr-2">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 backdrop-blur-md space-y-3">
              <div className="flex items-center space-x-2 border-b border-amber-500/10 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <h4 className="font-bold font-display text-amber-400">Weaknesses (Internal)</h4>
              </div>
              <ul className="space-y-2.5 pl-1">
                {idea.swot?.weaknesses?.map((wk, i) => (
                  <li key={i} className="flex items-start text-xs text-slate-300 leading-relaxed">
                    <span className="text-amber-400 font-bold mr-2">•</span>
                    <span>{wk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-5 backdrop-blur-md space-y-3">
              <div className="flex items-center space-x-2 border-b border-teal-500/10 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                <h4 className="font-bold font-display text-teal-400">Opportunities (External)</h4>
              </div>
              <ul className="space-y-2.5 pl-1">
                {idea.swot?.opportunities?.map((opp, i) => (
                  <li key={i} className="flex items-start text-xs text-slate-300 leading-relaxed">
                    <span className="text-teal-400 font-bold mr-2">•</span>
                    <span>{opp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Threats */}
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-5 backdrop-blur-md space-y-3">
              <div className="flex items-center space-x-2 border-b border-rose-500/10 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <h4 className="font-bold font-display text-rose-400">Threats (External)</h4>
              </div>
              <ul className="space-y-2.5 pl-1">
                {idea.swot?.threats?.map((thr, i) => (
                  <li key={i} className="flex items-start text-xs text-slate-300 leading-relaxed">
                    <span className="text-rose-400 font-bold mr-2">•</span>
                    <span>{thr}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPETITORS */}
      {activeTab === "competitors" && (
        <div className="space-y-6">
          <div className="p-1">
            <h3 className="text-xl font-bold font-display text-white mb-1">Competitor Ecosystem Profiling</h3>
            <p className="text-xs text-slate-400">
              Analysis conducted by Competitor Agent to benchmark industry incumbents against your target business model.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {idea.competitors?.map((comp, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-4">
                  <h4 className="text-base font-bold text-white flex items-center">
                    <Target className="w-4 h-4 mr-2 text-cyan-400" />
                    {comp.name}
                  </h4>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md">
                    Incumbent Benchmark
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Ecosystem Offering</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{comp.description}</p>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Core Vulnerability / Weakness</span>
                    <p className="text-xs text-amber-400/90 leading-relaxed">{comp.weakness}</p>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Your Differentiating Weapon</span>
                    <p className="text-xs text-emerald-400/90 leading-relaxed">{comp.differentiation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RISKS & REGULATION */}
      {activeTab === "risks" && (
        <div className="space-y-6">
          <div className="p-1">
            <h3 className="text-xl font-bold font-display text-white mb-1">Risk & Regulations Register</h3>
            <p className="text-xs text-slate-400">
              Sourced from Risk Agent consensus modeling. Outlines severe friction, structural barriers, and mitigation methods.
            </p>
          </div>

          <div className="space-y-4">
            {idea.risks?.map((risk, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md flex flex-col md:flex-row gap-4 justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2.5">
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${getSeverityStyles(risk.severity)}`}>
                      {risk.severity} Risk
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Category: {risk.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {risk.description}
                  </p>
                </div>

                <div className="w-full md:w-80 bg-slate-950/60 rounded-lg p-3 border border-slate-800/80">
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-teal-400 flex items-center mb-1">
                    <Shield className="w-3.5 h-3.5 mr-1 text-teal-400" />
                    Shield / Mitigation Strategy
                  </span>
                  <p className="text-xs text-slate-400 leading-normal">
                    {risk.mitigation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: STRATEGIC ROADMAP */}
      {activeTab === "recommendations" && (
        <div className="space-y-6">
          <div className="p-1">
            <h3 className="text-xl font-bold font-display text-white mb-1">Actionable Strategic Roadmap</h3>
            <p className="text-xs text-slate-400">
              Highest-impact next steps synthesized by platform coordinator to validate product-market fit.
            </p>
          </div>

          <div className="space-y-4">
            {idea.recommendations?.map((rec, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md flex items-start space-x-4">
                <div className="text-sm font-bold bg-teal-500/10 border border-teal-500/20 text-teal-400 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-white">{rec.title}</h4>
                    <span className={`px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded ${getSeverityStyles(rec.impact)}`}>
                      {rec.impact} Impact
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
