import React, { useState } from "react";
import { submitIdea } from "../api";
import { StartupIdea } from "../types";
import { Lightbulb, Rocket, Globe, FileText, Sparkles, Loader2 } from "lucide-react";

interface SubmissionFormProps {
  onSuccess: (newIdea: StartupIdea) => void;
}

export default function SubmissionForm({ onSuccess }: SubmissionFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [extraContext, setExtraContext] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !targetMarket.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const idea = await submitIdea({
        title,
        description,
        targetMarket,
        extraContext: extraContext.trim() || undefined,
      });
      // Clear form
      setTitle("");
      setDescription("");
      setTargetMarket("");
      setExtraContext("");
      onSuccess(idea);
    } catch (err: any) {
      setError(err.message || "An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display text-white tracking-tight">
              Validate Your Next Innovation
            </h2>
            <p className="text-sm text-slate-400">
              Submit your idea to initiate the multi-agent AI validation and intelligence audit.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-slate-200 mb-2 flex items-center">
              <Lightbulb className="w-4 h-4 mr-2 text-teal-400" />
              Startup / Product Name <span className="text-rose-400 ml-1">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., SolarClean Autonomous"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
              required
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Give your venture a descriptive or branded working name.
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-200 mb-2 flex items-center">
              <Rocket className="w-4 h-4 mr-2 text-teal-400" />
              Core Value Proposition & Description <span className="text-rose-400 ml-1">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem you are solving, how you solve it, and your core technology or secret sauce..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors resize-none"
              required
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Explain clearly how this creates value and who the primary beneficiary is.
            </p>
          </div>

          {/* Target Market */}
          <div>
            <label htmlFor="targetMarket" className="block text-sm font-semibold text-slate-200 mb-2 flex items-center">
              <Globe className="w-4 h-4 mr-2 text-teal-400" />
              Target Audience & Customer Segment <span className="text-rose-400 ml-1">*</span>
            </label>
            <input
              type="text"
              id="targetMarket"
              value={targetMarket}
              onChange={(e) => setTargetMarket(e.target.value)}
              placeholder="e.g., Commercial solar farm operators, clean-tech utility companies in the US southwest"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
              required
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Define the specific niche or market demographic you plan to capture first.
            </p>
          </div>

          {/* Extra Context */}
          <div>
            <label htmlFor="extraContext" className="block text-sm font-semibold text-slate-200 mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-teal-400" />
              Additional Context (Optional)
            </label>
            <textarea
              id="extraContext"
              rows={3}
              value={extraContext}
              onChange={(e) => setExtraContext(e.target.value)}
              placeholder="Add any details about funding, team capabilities, pricing models, intellectual property, or unfair advantages..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors resize-none"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Any extra factors our validation agents should compute into their report.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer flex items-center justify-center space-x-2 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/10"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Initializing Agents...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Execute Validation Pipeline</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
