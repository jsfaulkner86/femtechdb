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

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_REQUESTS = 10; // Max requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window

function checkRateLimit(clientIp: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(clientIp);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  
  if (record.count >= RATE_LIMIT_REQUESTS) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  record.count++;
  return { allowed: true };
}

// Input validation constants
const MIN_DESCRIPTION_LENGTH = 10;
const MAX_DESCRIPTION_LENGTH = 1000;
const SUSPICIOUS_PATTERNS = /<script|javascript:|on\w+=/i;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting based on client IP
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";
    
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ 
          error: "Too many requests. Please try again later.",
          retryAfter: rateCheck.retryAfter 
        }),
        {
          status: 429,
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": String(rateCheck.retryAfter)
          },
        }
      );
    }

    const { problemDescription } = await req.json();

    // Input validation
    if (!problemDescription || typeof problemDescription !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid problem description" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Sanitize and validate input
    const cleanDescription = problemDescription.trim();
    
    if (cleanDescription.length < MIN_DESCRIPTION_LENGTH) {
      return new Response(
        JSON.stringify({ error: "Please provide more details about your health concern (at least 10 characters)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (cleanDescription.length > MAX_DESCRIPTION_LENGTH) {
      return new Response(
        JSON.stringify({ error: "Description too long. Please limit to 1000 characters." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check for suspicious patterns (potential XSS/injection)
    if (SUSPICIOUS_PATTERNS.test(cleanDescription)) {
      return new Response(
        JSON.stringify({ error: "Invalid characters detected in your description" }),
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

    // Shuffle function for randomization
    const shuffle = <T>(array: T[]): T[] => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    // Pre-filter companies using keyword matching (use cleaned description)
    const keywords = cleanDescription.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    const scoredCompanies = companies.map(c => {
      const searchText = `${c.name} ${c.category} ${c.problem || ''} ${c.solution || ''} ${c.mission || ''}`.toLowerCase();
      let score = 0;
      for (const keyword of keywords) {
        if (searchText.includes(keyword)) score++;
      }
      return { company: c, score };
    });

    // Group by score tiers to add randomization within relevance levels
    const highRelevance = shuffle(scoredCompanies.filter(s => s.score >= 2).map(s => s.company));
    const mediumRelevance = shuffle(scoredCompanies.filter(s => s.score === 1).map(s => s.company));
    const lowRelevance = shuffle(scoredCompanies.filter(s => s.score === 0).map(s => s.company));

    // Build diverse candidate pool
    const candidatePool: Company[] = [];
    const seenIds = new Set<string>();

    // Add high relevance matches (shuffled)
    for (const c of highRelevance.slice(0, 25)) {
      if (!seenIds.has(c.id)) {
        candidatePool.push(c);
        seenIds.add(c.id);
      }
    }

    // Add medium relevance matches (shuffled)
    for (const c of mediumRelevance.slice(0, 15)) {
      if (!seenIds.has(c.id)) {
        candidatePool.push(c);
        seenIds.add(c.id);
      }
    }

    // Add random samples from different categories for diversity
    const categories = [...new Set(companies.map(c => c.category))];
    const shuffledCategories = shuffle(categories);
    
    for (const category of shuffledCategories) {
      if (candidatePool.length >= 50) break;
      const categoryCompanies = shuffle(companies.filter(c => c.category === category && !seenIds.has(c.id)));
      for (const c of categoryCompanies.slice(0, 3)) {
        if (!seenIds.has(c.id) && candidatePool.length < 50) {
          candidatePool.push(c);
          seenIds.add(c.id);
        }
      }
    }

    // Fill remaining slots with random companies if needed
    if (candidatePool.length < 30) {
      const remaining = shuffle(lowRelevance.filter(c => !seenIds.has(c.id)));
      for (const c of remaining.slice(0, 30 - candidatePool.length)) {
        candidatePool.push(c);
        seenIds.add(c.id);
      }
    }

    // Final shuffle of candidates to avoid ordering bias
    const topCandidates = shuffle(candidatePool);

    console.log(`Diversified pool: ${topCandidates.length} candidates from ${companies.length} total (${categories.length} categories)`);

    // Prepare company data for AI matching (shuffled order)
    const companiesText = topCandidates
      .map(
        (c) =>
          `Company: ${c.name}\nCategory: ${c.category}\nProblem: ${c.problem || "N/A"}\nSolution: ${c.solution || "N/A"}`
      )
      .join("\n---\n");

    // Call Lovable AI to match problems (with pre-filtered candidates and sanitized input)
    const aiResponse = await callLovableAI(cleanDescription, companiesText);

    // Parse the AI response to get matched companies
    const matches = parseAIResponse(aiResponse, topCandidates);

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

  const systemPrompt = `You are an unbiased healthcare solution matcher. Analyze the patient's health concern and match it to the most relevant companies from the provided list.

IMPORTANT: Evaluate each company fairly based solely on how well their problem/solution aligns with the patient's concern. Do not favor companies based on their position in the list or name recognition.

For each matched company, provide:
1. Company name (exact match from the list)
2. Relevance score (0-1) based on alignment with patient's specific needs
3. Brief reason why it matches

Return results as JSON array with structure:
[
  {
    "name": "Company Name",
    "relevanceScore": 0.85,
    "matchReason": "Why this matches the patient's concern"
  }
]

Return ONLY the JSON array, no other text. Match 1-5 companies that best address the patient's specific health concern, symptoms, or goals. Prioritize relevance over familiarity.`;

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
