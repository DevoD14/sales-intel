"use client";

import { useState, useEffect } from "react";

interface Props {
  onAnalyze: (transcript: string) => void;
  onRecord: () => void;
  loading: boolean;
  error: string | null;
  initialTranscript?: string;
}

export default function TranscriptForm({ onAnalyze, onRecord, loading, error, initialTranscript }: Props) {
  const [transcript, setTranscript] = useState(initialTranscript ?? "");

  useEffect(() => {
    if (initialTranscript) setTranscript(initialTranscript);
  }, [initialTranscript]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (transcript.trim()) onAnalyze(transcript.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Analyze a Sales Call</h2>
        <p className="text-gray-500 text-sm">
          Record your call directly or paste existing notes and transcripts below.
        </p>
      </div>

      <button
        type="button"
        onClick={onRecord}
        className="flex items-center gap-3 w-full rounded-xl border-2 border-dashed border-gray-300 px-5 py-4 text-sm font-medium text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition group"
      >
        <div className="w-8 h-8 rounded-full bg-red-100 group-hover:bg-red-200 flex items-center justify-center flex-shrink-0 transition">
          <span className="w-3 h-3 rounded-full bg-red-500" />
        </div>
        <div className="text-left">
          <p className="font-semibold">Record a Call</p>
          <p className="text-xs text-gray-400 group-hover:text-blue-500 transition">
            Capture audio and auto-generate a transcript in real time
          </p>
        </div>
      </button>

      <div className="flex items-center gap-3 text-xs text-gray-400">
        <div className="flex-1 h-px bg-gray-200" />
        <span>or paste transcript manually</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div>
        <label htmlFor="transcript" className="block text-sm font-medium text-gray-700 mb-2">
          Transcript or Notes
        </label>
        <textarea
          id="transcript"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={14}
          placeholder="Paste your sales call transcript or notes here..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
          disabled={loading}
        />
        <p className="text-xs text-gray-400 mt-1">{transcript.length} characters</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !transcript.trim()}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Analyzing...
          </>
        ) : (
          "Analyze Call"
        )}
      </button>
    </form>
  );
}
