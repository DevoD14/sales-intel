import { AnalysisResult } from "@/types/analysis";

export function exportToCSV(result: AnalysisResult) {
  const sf = result.salesforce_fields;

  const headers = [
    "Account_Name",
    "Opportunity_Name",
    "Stage",
    "Probability",
    "Close_Date",
    "Next_Step",
    "Description",
    "Amount",
    "Lead_Source",
  ];

  const values = headers.map((h) => {
    const val = sf[h as keyof typeof sf];
    if (val === null || val === undefined) return "";
    const str = String(val);
    return str.includes(",") || str.includes('"') || str.includes("\n")
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  });

  const csv = [headers.join(","), values.join(",")].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sf.Opportunity_Name.replace(/\s+/g, "_")}_salesforce.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
