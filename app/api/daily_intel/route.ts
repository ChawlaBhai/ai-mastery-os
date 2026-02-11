import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
    try {
        // 1. Construct Prompt
        const prompt = `
You are an AI systems intelligence analyst.

Research the most important AI model releases, developer tools, automation platforms, APIs, AI agents, and practical AI systems launched or updated in the last 24 hours globally.

Filter strictly for:
- High leverage tools
- API access tools
- Developer frameworks
- Workflow automation systems
- New model capabilities

Exclude:
- Funding news
- Opinion blogs
- Marketing fluff

Rank by practical impact for an AI power user.

Return structured JSON:

{
  "must_explore": [],
  "worth_watching": [],
  "ignore": [],
  "today_focus": ""
}
`;

        // 2. Call Gemini API
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro", generationConfig: { responseMimeType: "application/json" } });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // 3. Parse JSON (Gemini usually returns clean JSON with responseMimeType, but good to be safe)
        // Remove markdown code blocks if present (though responseMimeType should handle this)
        const storedJson = JSON.parse(responseText.replace(/```json\n?|\n?```/g, ""));

        // 4. Store in Supabase
        // Assuming 'daily_reports' table has a 'content' column of type JSONB
        const { data: insertedData, error: insertError } = await supabase
            .from("daily_reports")
            .insert([
                {
                    report: storedJson,
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (insertError) {
            console.error("Supabase Insert Error:", insertError);
            return NextResponse.json({ error: "Failed to save report", details: insertError }, { status: 500 });
        }

        // 5. Return Response
        return NextResponse.json({
            success: true,
            data: insertedData?.[0] || storedJson
        });

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
