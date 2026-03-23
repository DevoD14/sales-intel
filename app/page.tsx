"use client";

import { useState, useEffect } from "react";
import { AnalysisResult } from "@/types/analysis";
import { HistoryEntry, loadHistory, saveToHistory } from "@/lib/history";
import TranscriptForm from "@/components/TranscriptForm";
import ResultsPanel from "@/components/ResultsPanel";
import RecordingPanel from "@/components/RecordingPanel";
import HistorySidebar from "@/components/HistorySidebar";

type Step = "input" | "record" | "results";

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { id: "input", label: "Input" },
    { id: "record", label: "Record" },
    { id: "results", label: "Results" },
  ];
  const activeIndex = steps.findIndex((s) => s.id === step);
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          <div
            className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold transition-colors ${
              i <= activeIndex ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            {i + 1}
          </div>
          <span className={`text-xs font-medium ${i <= activeIndex ? "text-gray-900" : "text-gray-400"}`}>
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <div className={`w-8 h-px ${i < activeIndex ? "bg-blue-600" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState<Step>("input");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingTranscript, setPendingTranscript] = useState<string>("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  async function handleAnalyze(transcript: string) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      const data: AnalysisResult = await res.json();
      saveToHistory(data);
      setHistory(loadHistory());
      setResult(data);
      setSelectedHistoryId(null);
      setStep("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
    setPendingTranscript("");
    setSelectedHistoryId(null);
    setStep("input");
  }

  function handleRecordingDone(transcript: string) {
    setPendingTranscript(transcript);
    setStep("input");
  }

  function handleHistorySelect(entry: HistoryEntry) {
    setResult(entry.result);
    setSelectedHistoryId(entry.id);
    setStep("results");
  }

  function handleHistoryDelete(id: string) {
    setHistory(loadHistory());
    if (selectedHistoryId === id) {
      setResult(null);
      setSelectedHistoryId(null);
      setStep("input");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 z-10 relative">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">SI</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Sales Intel</h1>
              <p className="text-xs text-gray-500">AI-powered call analysis & Salesforce export</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <StepIndicator step={step} />
            <button
              onClick={() => setHistoryOpen((o) => !o)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                historyOpen
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" />
              </svg>
              History
              {history.length > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {history.length > 9 ? "9+" : history.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto w-full px-6 py-8">
            {step === "record" && (
              <div className="max-w-2xl mx-auto">
                <RecordingPanel
                  onTranscriptReady={handleRecordingDone}
                  onBack={() => setStep("input")}
                />
              </div>
            )}

            {step === "input" && (
              <div className="max-w-2xl mx-auto">
                <TranscriptForm
                  onAnalyze={handleAnalyze}
                  onRecord={() => setStep("record")}
                  loading={loading}
                  error={error}
                  initialTranscript={pendingTranscript}
                />
              </div>
            )}

            {step === "results" && result && (
              <ResultsPanel result={result} onReset={handleReset} />
            )}
          </div>
        </main>

        {historyOpen && (
          <aside className="w-72 border-l border-gray-200 bg-white flex flex-col flex-shrink-0 overflow-hidden">
            <HistorySidebar
              history={history}
              selectedId={selectedHistoryId}
              onSelect={handleHistorySelect}
              onDelete={handleHistoryDelete}
              onClose={() => setHistoryOpen(false)}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
