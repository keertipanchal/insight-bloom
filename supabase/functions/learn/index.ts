import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { topic, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt: string;
    let userPrompt: string;

    if (type === "explanation") {
      systemPrompt = `You are an expert educator who explains topics in a clear, engaging, and detailed way. Structure your explanations with clear sections using markdown headings (##). Use examples, analogies, and interesting facts. Make it educational yet enjoyable to read. Keep it comprehensive but not overwhelming - aim for about 800-1200 words.`;
      userPrompt = `Please provide a detailed, engaging explanation of the following topic: "${topic}". Include key concepts, important details, real-world applications, and interesting facts. Structure it well with headings and paragraphs.`;
    } else if (type === "quiz") {
      systemPrompt = `You are a quiz generator. Generate exactly 10 multiple-choice questions. Return ONLY valid JSON, no markdown, no code blocks. The JSON must be an array of objects with this exact structure: [{"question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0}]. correctIndex is 0-based index of the correct answer.`;
      userPrompt = `Generate 10 multiple-choice quiz questions about: "${topic}". Make questions range from basic to advanced. Return ONLY a JSON array, nothing else.`;
    } else {
      throw new Error("Invalid type. Must be 'explanation' or 'quiz'.");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: type === "explanation",
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    if (type === "explanation") {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Quiz: parse and return JSON
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    // Extract JSON from possible markdown code blocks
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const questions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
