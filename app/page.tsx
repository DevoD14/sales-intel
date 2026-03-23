"use client";

import { useState } from "react";
import { AnalysisResult } from "@/types/analysis";
import TranscriptForm from "@/components/TranscriptForm";
import ResultsPanel from "@/components/ResultsPanel";
import RecordingPanel from "@/components/RecordingPanel";

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
              i <= activeIndex
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {i + 1}
          </div>
          <span
            className={`text-xs font-medium ${
              i <= activeIndex ? "text-gray-900" : "text-gray-400"
            }`}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <div
              className={`w-8 h-px ${i < activeIndex ? "bg-blue-600" : "bg-gray-200"}`}
            />
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
    setStep("input");
  }

  function handleRecordingDone(transcript: string) {
    setPendingTranscript(transcript);
    setStep("input");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
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
          <StepIndicator step={step} />
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
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
      </main>
    </div>
  );
}
