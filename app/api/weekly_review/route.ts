import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// Use Service Role Key to bypass RLS for inserts
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const { input } = await request.json();

        if (!input) {
            return NextResponse.json({ error: "Input is required" }, { status: 400 });
        }

        const prompt = `
You are my AI Mastery Performance Coach.

Context:
I am building elite capability in using AI tools, models, automation systems, and real-world AI applications.
I learn by building and experimenting, not by reading theory.

This is my weekly log:

${input}

Your job:

1. Identify:
   - Where I spent time but gained shallow knowledge
   - Where I showed depth
   - Where I avoided difficult work

2. Detect skill gaps:
   - Tool misuse
   - Overconsumption vs execution imbalance
   - Missing system-level thinking

3. Choose ONE primary focus for next week.
   Not 3. Not 5. ONE.

4. Design a 5-day execution roadmap (Mon–Fri):
   Each day must include:
   - Clear task
   - Specific tool
   - Expected output
   - Measurable outcome

5. Assign:
   - One build project (must ship by Sunday)
   - One stretch experiment (optional but high growth)

6. Define:
   - What success looks like by end of week
   - What failure looks like

Constraints:
- Assume 1–2 hours daily.
- No theory-heavy content.
- No generic advice.
- Make it practical and structured.

Return structured JSON:

{
  "analysis": "",
  "primary_focus": "",
  "roadmap": [
    {
      "day": "",
      "task": "",
      "tool": "",
      "expected_output": "",
      "measurable_outcome": ""
    }
  ],
  "build_project": "",
  "stretch_experiment": "",
  "success_definition": "",
  "failure_definition": ""
}
`;

        const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Failed to parse JSON from Gemini response");
        }

        const structuredPlan = JSON.parse(jsonMatch[0]);

        // Store in Supabase
        const { data, error } = await supabase
            .from("weekly_reviews")
            .insert([
                {
                    input_text: input,
                    output_plan: structuredPlan,
                    created_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Supabase Insert Error:", error);
            throw error;
        }

        return NextResponse.json({ success: true, data: data });

    } catch (error: any) {
        console.error("Weekly Review API Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate weekly review" },
            { status: 500 }
        );
    }
}
