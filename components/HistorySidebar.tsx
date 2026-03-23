"use client";

import { HistoryEntry, deleteFromHistory } from "@/lib/history";

interface Props {
  history: HistoryEntry[];
  selectedId: string | null;
  onSelect: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ProbabilityBadge({ value }: { value: number }) {
  const color =
    value >= 70
      ? "bg-green-100 text-green-700"
      : value >= 40
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {value}%
    </span>
  );
}

export default function HistorySidebar({ history, selectedId, onSelect, onDelete, onClose }: Props) {
  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    deleteFromHistory(id);
    onDelete(id);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">Past Analyses</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition"
          aria-label="Close history"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            No past analyses yet. Submit a call to get started.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {history.map((entry) => (
              <li
                key={entry.id}
                onClick={() => onSelect(entry)}
                className={`group flex flex-col gap-1 px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${
                  selectedId === entry.id ? "bg-blue-50 border-l-2 border-blue-500" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {entry.result.salesforce_fields.Opportunity_Name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {entry.result.salesforce_fields.Account_Name}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, entry.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition flex-shrink-0"
                    aria-label="Delete"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{formatDate(entry.createdAt)}</span>
                  <ProbabilityBadge value={entry.result.win_probability.percentage} />
                </div>
                <span className="text-xs text-gray-500">{entry.result.pipeline_stage.stage}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
