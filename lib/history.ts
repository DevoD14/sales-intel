import { AnalysisResult } from "@/types/analysis";

export interface HistoryEntry {
  id: string;
  createdAt: string;
  result: AnalysisResult;
}

const STORAGE_KEY = "sales-intel-history";

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(result: AnalysisResult): HistoryEntry {
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    result,
  };
  const history = loadHistory();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...history]));
  return entry;
}

export function deleteFromHistory(id: string): void {
  const history = loadHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}
