"use client";

import { useState } from "react";
import { AnalysisResult } from "@/types/analysis";
import TranscriptForm from "@/components/TranscriptForm";
import ResultsPanel from "@/components/ResultsPanel";

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">SI</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Sales Intel</h1>
            <p className="text-xs text-gray-500">AI-powered call analysis & Salesforce export</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {!result ? (
          <div className="max-w-2xl mx-auto">
            <TranscriptForm onAnalyze={handleAnalyze} loading={loading} error={error} />
          </div>
        ) : (
          <ResultsPanel result={result} onReset={() => setResult(null)} />
        )}
      </main>
    </div>
  );
}
