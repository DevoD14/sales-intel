"use client";

import { AnalysisResult } from "@/types/analysis";
import { exportToCSV } from "@/lib/exportCSV";

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

function ProbabilityBar({ value }: { value: number }) {
  const color =
    value >= 70 ? "bg-green-500" : value >= 40 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className={`${color} h-2.5 rounded-full transition-all`} style={{ width: `${value}%` }} />
    </div>
  );
}

export default function ResultsPanel({ result, onReset }: Props) {
  const { opportunity_summary, pipeline_stage, win_probability, key_insights, action_items, salesforce_fields } = result;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{salesforce_fields.Opportunity_Name}</h2>
          <p className="text-sm text-gray-500">{salesforce_fields.Account_Name}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => exportToCSV(result)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Export CSV
          </button>
          <button
            onClick={onReset}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            New Analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Pipeline Stage</p>
          <p className="text-lg font-semibold text-gray-900">{pipeline_stage.stage}</p>
          <p className="text-xs text-gray-500 mt-2">{pipeline_stage.rationale}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Win Probability</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{win_probability.percentage}%</p>
          <ProbabilityBar value={win_probability.percentage} />
          <p className="text-xs text-gray-500 mt-2">{win_probability.explanation}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Est. Close Date</p>
          <p className="text-lg font-semibold text-gray-900">{salesforce_fields.Close_Date}</p>
          {salesforce_fields.Amount && (
            <>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-3 mb-1">Deal Value</p>
              <p className="text-lg font-semibold text-green-600">{salesforce_fields.Amount}</p>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Opportunity Summary</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{opportunity_summary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Key Insights</h3>
          <ul className="flex flex-col gap-2">
            {key_insights.map((insight, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-600">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                {insight}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Action Items</h3>
          <div className="flex flex-col gap-3">
            {action_items.map((item, i) => (
              <div key={i} className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                <p className="text-sm font-medium text-gray-800">{item.description}</p>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs text-gray-500">Owner: {item.owner}</span>
                  {item.due_date && (
                    <span className="text-xs text-gray-500">Due: {item.due_date}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Salesforce Fields Preview</h3>
          <button
            onClick={() => exportToCSV(result)}
            className="text-xs text-blue-600 hover:underline"
          >
            Download CSV
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(salesforce_fields).map(([key, value]) => (
            value !== null && (
              <div key={key} className="flex flex-col">
                <span className="text-xs font-medium text-gray-400">{key.replace(/_/g, " ")}</span>
                <span className="text-sm text-gray-800 truncate">{String(value)}</span>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
