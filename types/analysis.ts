export interface ActionItem {
  description: string;
  owner: string;
  due_date: string | null;
}

export interface SalesforceFields {
  Account_Name: string;
  Opportunity_Name: string;
  Stage: string;
  Probability: number;
  Close_Date: string;
  Next_Step: string;
  Description: string;
  Amount: string | null;
  Lead_Source: string | null;
}

export interface AnalysisResult {
  opportunity_summary: string;
  pipeline_stage: {
    stage: string;
    rationale: string;
  };
  win_probability: {
    percentage: number;
    explanation: string;
  };
  key_insights: string[];
  action_items: ActionItem[];
  salesforce_fields: SalesforceFields;
}
