import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Company {
  id: string;
  name: string;
  category: string;
  categories?: string[];
  mission: string | null;
  problem: string | null;
  solution: string | null;
  website_url: string | null;
  logo_url: string | null;
  founded_year: number | null;
  headquarters: string | null;
  continent: string | null;
  country: string | null;
  state: string | null;
  is_verified: boolean | null;
  source_url: string | null;
  claimed_by: string | null;
  commercialization_phase: string | null;
  created_at: string;
  updated_at: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { problemDescription } = await req.json();

    if (!problemDescription || typeof problemDescription !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid problem description" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get environment variables - these should be set by Lovable Cloud
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    console.log("Environment check:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
    });

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        `Missing environment variables: url=${!!supabaseUrl}, key=${!!supabaseAnonKey}`
      );
    }

    // Fetch all companies
    const companiesUrl = `${supabaseUrl}/rest/v1/companies?limit=1000`;
    const companiesResponse = await fetch(companiesUrl, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });

    if (!companiesResponse.ok) {
      throw new Error(
        `Failed to fetch companies: ${companiesResponse.status} ${companiesResponse.statusText}`
      );
    }

    const companies = (await companiesResponse.json()) as Company[];

    if (!companies || companies.length === 0) {
      return new Response(
        JSON.stringify({ matches: [] }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare company data for AI matching
    const companiesText = companies
      .map(
        (c) =>
          `Company: ${c.name}\nCategory: ${c.category}\nProblem addressed: ${c.problem || "Not specified"}\nSolution offered: ${c.solution || "Not specified"}\nMission: ${c.mission || "Not specified"}`
      )
      .join("\n\n---\n\n");

    // Call Lovable AI to match problems
    const aiResponse = await callLovableAI(problemDescription, companiesText);

    // Parse the AI response to get matched companies
    const matches = parseAIResponse(aiResponse, companies);

    return new Response(
      JSON.stringify({ matches }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in match-problem-to-companies:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    if (message.includes("429")) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again in a moment.",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (message.includes("402")) {
      return new Response(
        JSON.stringify({
          error: "Payment required. Please add credits to your account.",
        }),
        {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Failed to find matching solutions" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function callLovableAI(
  userProblem: string,
  companiesText: string
): Promise<string> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");

  if (!apiKey) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const systemPrompt = `You are a healthcare solution matcher. Analyze the patient's health concern and match it to the most relevant companies from the provided list.

For each matched company, provide:
1. Company name
2. Relevance score (0-1)
3. Brief reason why it matches

Return results as JSON array with structure:
[
  {
    "name": "Company Name",
    "relevanceScore": 0.85,
    "matchReason": "Why this matches the patient's concern"
  }
]

Return ONLY the JSON array, no other text. Match 1-5 companies that address the patient's specific health concern, symptoms, or goals. Prioritize companies with the highest relevance.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Patient's health concern: "${userProblem}"\n\nAvailable companies:\n${companiesText}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (response.status === 429) {
      throw new Error("429: Rate limit exceeded");
    }
    if (response.status === 402) {
      throw new Error("402: Payment required");
    }
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

function parseAIResponse(
  aiResponse: string,
  allCompanies: Company[]
): (Company & { relevanceScore: number; matchReason: string })[] {
  try {
    // Extract JSON from the response
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn("No JSON found in AI response");
      return [];
    }

    const matches = JSON.parse(jsonMatch[0]);

    // Enrich matches with full company data
    return matches
      .map(
        (match: {
          name: string;
          relevanceScore: number;
          matchReason: string;
        }) => {
          const company = allCompanies.find(
            (c) =>
              c.name.toLowerCase().includes(match.name.toLowerCase()) ||
              match.name.toLowerCase().includes(c.name.toLowerCase())
          );

          if (!company) return null;

          return {
            ...company,
            relevanceScore: Math.min(1, Math.max(0, match.relevanceScore || 0)),
            matchReason: match.matchReason || "",
          };
        }
      )
      .filter(
        (
          match
        ): match is Company & {
          relevanceScore: number;
          matchReason: string;
        } => match !== null
      )
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  } catch (error) {
    console.error("Error parsing AI response:", error);
    return [];
  }
}
