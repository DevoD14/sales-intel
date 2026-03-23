import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert sales analyst. Analyze sales call notes or transcripts and return structured JSON insights.

Return ONLY valid JSON with this exact structure:
{
  "opportunity_summary": "2-3 sentence summary of the opportunity",
  "pipeline_stage": {
    "stage": "one of: Prospecting | Qualification | Needs Analysis | Value Proposition | Id. Decision Makers | Perception Analysis | Proposal/Price Quote | Negotiation/Review | Closed Won | Closed Lost",
    "rationale": "1 sentence explanation"
  },
  "win_probability": {
    "percentage": 0-100,
    "explanation": "brief explanation of key factors"
  },
  "key_insights": [
    "insight about customer needs, pain points, decision criteria, timeline, or stakeholders"
  ],
  "action_items": [
    {
      "description": "what needs to be done",
      "owner": "rep or customer name/role",
      "due_date": "date string or null if not mentioned"
    }
  ],
  "salesforce_fields": {
    "Account_Name": "company name or Unknown",
    "Opportunity_Name": "descriptive opportunity name",
    "Stage": "same as pipeline_stage.stage",
    "Probability": 0-100,
    "Close_Date": "estimated close date in YYYY-MM-DD or best estimate",
    "Next_Step": "most immediate next action",
    "Description": "brief opportunity description for Salesforce",
    "Amount": "deal value as string or null if not discussed",
    "Lead_Source": "how the lead originated or null if unknown"
  }
}`;

export async function POST(req: NextRequest) {
  const { transcript } = await req.json();

  if (!transcript || typeof transcript !== "string" || transcript.trim().length < 10) {
    return NextResponse.json({ error: "Please provide a valid transcript or notes." }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "API key not configured." }, { status: 500 });
  }

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Analyze this sales call transcript/notes:\n\n${transcript}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Unexpected response from AI." }, { status: 500 });
  }

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "Could not parse AI response." }, { status: 500 });
  }

  const result = JSON.parse(jsonMatch[0]);
  return NextResponse.json(result);
}
