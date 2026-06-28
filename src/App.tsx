import { useEffect, useState } from "react";
import { fetchAllIdeas, fetchIdeaDetails, deleteIdea } from "./api";
import { StartupIdea } from "./types";
import SubmissionForm from "./components/SubmissionForm";
import Dashboard from "./components/Dashboard";
import HistoryList from "./components/HistoryList";
import { Brain, Sparkles, Wifi, RefreshCw } from "lucide-react";

export default function App() {
  const [ideas, setIdeas] = useState<StartupIdea[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load ideas on component mount
  const loadIdeas = async (selectNewest = false) => {
    try {
      const data = await fetchAllIdeas();
      setIdeas(data);
      if (selectNewest && data.length > 0) {
        setSelectedId(data[0].id);
        setIsCreating(false);
      }
    } catch (err: any) {
      setError("Unable to connect to multi-agent server. Ensure the server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIdeas();
  }, []);

  // Polling loop to fetch active processing tasks
  useEffect(() => {
    const processingIdea = ideas.find((idea) => idea.status === "processing");
    if (!processingIdea) return;

    const interval = setInterval(async () => {
      try {
        const updated = await fetchIdeaDetails(processingIdea.id);
        
        setIdeas((prevIdeas) =>
          prevIdeas.map((idea) => (idea.id === updated.id ? updated : idea))
        );

        // If completed or failed, stop polling
        if (updated.status !== "processing") {
          // If the user currently views the completed item, force visual update
          if (selectedId === updated.id) {
            // Re-fetch all to sync history items
            const data = await fetchAllIdeas();
            setIdeas(data);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [ideas, selectedId]);

  const handleSubmissionSuccess = (newIdea: StartupIdea) => {
    // Add new idea to front of the array and set as active view
    setIdeas((prev) => [newIdea, ...prev]);
    setSelectedId(newIdea.id);
    setIsCreating(false);
  };

  const handleDeleteIdea = async (id: string) => {
    try {
      await deleteIdea(id);
      setIdeas((prev) => prev.filter((idea) => idea.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
        setIsCreating(true);
      }
    } catch (err: any) {
      alert("Failed to delete idea: " + err.message);
    }
  };

  const handleSelectIdea = (id: string) => {
    setSelectedId(id);
    setIsCreating(false);
  };

  const handleNewClick = () => {
    setSelectedId(null);
    setIsCreating(true);
  };

  // Find active selected idea
  const activeIdea = selectedId ? ideas.find((i) => i.id === selectedId) : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(20,184,166,0.15),rgba(255,255,255,0))] font-sans antialiased">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Brain className="w-5.5 h-5.5 text-slate-950" />
            </div>
            <div>
              <span className="text-lg font-black font-display tracking-tight text-white flex items-center">
                Startup Validator
              </span>
              <span className="text-[10px] text-teal-400 font-bold tracking-wider uppercase block">
                Multi-Agent Intelligence Core
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pipeline: Online</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
            <p className="text-sm text-slate-400 font-medium">Powering up intelligence core...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto py-16 text-center">
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 mb-4 inline-block">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Workspace Offline</h3>
            <p className="text-sm text-slate-400 mb-6">{error}</p>
            <button
              onClick={() => {
                setIsLoading(true);
                setError(null);
                loadIdeas();
              }}
              className="cursor-pointer px-5 py-2.5 bg-teal-500 text-slate-950 font-semibold rounded-xl text-sm hover:bg-teal-400 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* Left Column: List History */}
            <div className="lg:col-span-1">
              <HistoryList
                ideas={ideas}
                selectedId={selectedId}
                onSelect={handleSelectIdea}
                onNewClick={handleNewClick}
                onDelete={handleDeleteIdea}
              />
            </div>

            {/* Right Column: Active workspace (Submission Form or Dashboard) */}
            <div className="lg:col-span-3">
              {isCreating ? (
                <SubmissionForm onSuccess={handleSubmissionSuccess} />
              ) : activeIdea ? (
                <Dashboard
                  idea={activeIdea}
                  onRefresh={() => {
                    // Update state to trigger reload
                    const index = ideas.findIndex((i) => i.id === activeIdea.id);
                    if (index !== -1) {
                      const updatedList = [...ideas];
                      updatedList[index].status = "processing";
                      updatedList[index].logs = [
                        {
                          timestamp: new Date().toISOString(),
                          agent: "System",
                          message: "Re-initiating validation audit manually.",
                        },
                      ];
                      setIdeas(updatedList);
                      // Execute validation again
                      fetch(`/api/ideas`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(activeIdea),
                      }).catch(console.error);
                    }
                  }}
                />
              ) : (
                <div className="text-center py-20 bg-slate-900/10 border border-slate-900 rounded-2xl p-8">
                  <Brain className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                  <h3 className="text-lg font-bold text-white mb-1">No Active Validation</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                    Select a previously verified startup record from the list, or create a new validation study.
                  </p>
                  <button
                    onClick={handleNewClick}
                    className="cursor-pointer px-4 py-2 bg-teal-500/15 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 rounded-xl text-xs font-bold transition-all"
                  >
                    Validate New Startup Idea
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

