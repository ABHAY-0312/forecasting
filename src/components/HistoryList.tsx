import React from "react";
import { StartupIdea } from "../types";
import { Plus, Brain, CheckCircle, AlertTriangle, Trash2 } from "lucide-react";

interface HistoryListProps {
  ideas: StartupIdea[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewClick: () => void;
  onDelete: (id: string) => void;
}

export default function HistoryList({
  ideas,
  selectedId,
  onSelect,
  onNewClick,
  onDelete,
}: HistoryListProps) {
  
  // Color helper for viability scores
  const getScoreColorClass = (score?: number) => {
    if (score === undefined) return "text-slate-500 bg-slate-800 border-slate-700";
    if (score >= 80) return "text-teal-400 bg-teal-500/10 border-teal-500/20";
    if (score >= 60) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/40 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md">
      {/* Header with New Button */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
        <h3 className="text-sm font-bold font-display text-white tracking-wide uppercase flex items-center">
          <Brain className="w-4 h-4 mr-2 text-teal-400" />
          Submissions
        </h3>
        <button
          onClick={onNewClick}
          className="cursor-pointer flex items-center space-x-1 px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-lg text-xs font-bold transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* Ideas Scroll List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50 max-h-[400px] md:max-h-[600px] lg:max-h-none">
        {ideas.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <Brain className="w-8 h-8 mx-auto opacity-30 text-teal-400" />
            <p className="text-xs">No startup validations logged yet.</p>
            <button
              onClick={onNewClick}
              className="cursor-pointer text-xs text-teal-400 font-semibold hover:underline"
            >
              Submit your first idea →
            </button>
          </div>
        ) : (
          ideas.map((idea) => {
            const isSelected = selectedId === idea.id;
            return (
              <div
                key={idea.id}
                className={`group relative p-4 transition-all duration-150 flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-slate-900/80 border-l-2 border-teal-400"
                    : "hover:bg-slate-900/30"
                }`}
              >
                {/* Clickable Area to Select */}
                <button
                  onClick={() => onSelect(idea.id)}
                  className="cursor-pointer text-left flex-1 min-w-0"
                >
                  <div className="flex items-center space-x-1.5 mb-1">
                    {idea.status === "completed" && (
                      <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded border ${getScoreColorClass(idea.viabilityScore)}`}>
                        {idea.viabilityScore}
                      </span>
                    )}
                    {idea.status === "processing" && (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded border text-teal-400 bg-teal-500/5 border-teal-500/20 animate-pulse flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping mr-1 shrink-0" />
                        Analyzing
                      </span>
                    )}
                    {idea.status === "failed" && (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded border text-rose-400 bg-rose-500/5 border-rose-500/20">
                        Failed
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-white">
                    {idea.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {idea.targetMarket}
                  </p>
                </button>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete audit log for "${idea.title}"?`)) {
                      onDelete(idea.id);
                    }
                  }}
                  className="cursor-pointer opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-opacity"
                  title="Delete audit log"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
