"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  onTranscriptReady: (transcript: string) => void;
  onBack: () => void;
}

type RecordingState = "idle" | "recording" | "paused" | "done";

export default function RecordingPanel({ onTranscriptReady, onBack }: Props) {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptRef = useRef("");

  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        transcriptRef.current += final;
        setTranscript(transcriptRef.current);
      }
      setInterimText(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "aborted") {
        console.error("Speech recognition error:", event.error);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, []);

  function startTimer() {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function handleStart() {
    transcriptRef.current = "";
    setTranscript("");
    setInterimText("");
    setElapsed(0);
    recognitionRef.current?.start();
    setRecordingState("recording");
    startTimer();
  }

  function handlePause() {
    recognitionRef.current?.stop();
    setRecordingState("paused");
    stopTimer();
  }

  function handleResume() {
    recognitionRef.current?.start();
    setRecordingState("recording");
    startTimer();
  }

  function handleStop() {
    recognitionRef.current?.stop();
    setRecordingState("done");
    stopTimer();
    setInterimText("");
  }

  function handleReset() {
    recognitionRef.current?.abort();
    stopTimer();
    transcriptRef.current = "";
    setTranscript("");
    setInterimText("");
    setElapsed(0);
    setRecordingState("idle");
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  if (!supported) {
    return (
      <div className="flex flex-col gap-6">
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
          <strong>Browser not supported.</strong> Speech recognition requires Chrome or Edge. Please paste your transcript manually instead.
        </div>
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 underline">
          Back to manual entry
        </button>
      </div>
    );
  }

  const fullDisplay = transcript + (interimText ? `\u2026${interimText}` : "");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Record Your Call</h2>
        <p className="text-gray-500 text-sm">
          Speak naturally — the transcript is captured in real time. Review and edit before analyzing.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {recordingState === "recording" && (
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
            )}
            <span className="text-sm font-medium text-gray-700">
              {recordingState === "idle" && "Ready to record"}
              {recordingState === "recording" && "Recording..."}
              {recordingState === "paused" && "Paused"}
              {recordingState === "done" && "Recording complete"}
            </span>
          </div>
          <span className="text-sm font-mono text-gray-500">{formatTime(elapsed)}</span>
        </div>

        <div className="min-h-48 max-h-72 overflow-y-auto rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {fullDisplay || (
            <span className="text-gray-400 italic">
              {recordingState === "idle"
                ? "Transcript will appear here as you speak..."
                : "Listening..."}
            </span>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
          {recordingState === "idle" && (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition"
            >
              <span className="w-2 h-2 rounded-full bg-white" />
              Start Recording
            </button>
          )}

          {recordingState === "recording" && (
            <>
              <button
                onClick={handlePause}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Pause
              </button>
              <button
                onClick={handleStop}
                className="rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-900 transition"
              >
                Stop
              </button>
            </>
          )}

          {recordingState === "paused" && (
            <>
              <button
                onClick={handleResume}
                className="flex items-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition"
              >
                <span className="w-2 h-2 rounded-full bg-white" />
                Resume
              </button>
              <button
                onClick={handleStop}
                className="rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-900 transition"
              >
                Stop
              </button>
            </>
          )}

          {recordingState === "done" && (
            <button
              onClick={handleReset}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Re-record
            </button>
          )}
        </div>
      </div>

      {recordingState === "done" && transcript && (
        <button
          onClick={() => onTranscriptReady(transcript)}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          Review Transcript & Analyze
        </button>
      )}

      <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600 underline text-center">
        Switch to manual transcript entry
      </button>
    </div>
  );
}
