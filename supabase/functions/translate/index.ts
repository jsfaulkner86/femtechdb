import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const languageNames: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  pt: "Portuguese",
  ar: "Arabic",
  zh: "Simplified Chinese",
  hi: "Hindi",
  de: "German",
  ja: "Japanese",
  ko: "Korean",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { texts, language, context } = await req.json();

    if (!texts || !Array.isArray(texts) || !language) {
      return new Response(
        JSON.stringify({ error: "Missing texts array or language" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (language === "en") {
      // Return original texts for English
      const results: Record<string, string> = {};
      texts.forEach((t: string) => { results[t] = t; });
      return new Response(JSON.stringify({ translations: results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check cache first
    const { data: cached } = await supabase
      .from("translations")
      .select("source_text, translated_text")
      .eq("language_code", language)
      .in("source_text", texts);

    const cachedMap: Record<string, string> = {};
    (cached || []).forEach((row: any) => {
      cachedMap[row.source_text] = row.translated_text;
    });

    const uncached = texts.filter((t: string) => !cachedMap[t]);

    if (uncached.length === 0) {
      return new Response(JSON.stringify({ translations: cachedMap }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Translate uncached texts using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langName = languageNames[language] || language;
    
    // Batch in groups of 20
    const batchSize = 20;
    const allTranslated: Record<string, string> = { ...cachedMap };

    for (let i = 0; i < uncached.length; i += batchSize) {
      const batch = uncached.slice(i, i + batchSize);
      const numberedTexts = batch.map((t: string, idx: number) => `${idx + 1}. ${t}`).join("\n");

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            {
              role: "system",
              content: `You are a professional translator. Translate the following numbered texts from English to ${langName}. 
Context: These are ${context || "UI texts"} for a women's health technology (femtech) directory website.
Return ONLY a JSON object where keys are the original English texts and values are the ${langName} translations.
Keep brand names, company names, URLs, and technical terms unchanged.
Be concise and natural in ${langName}.`,
            },
            {
              role: "user",
              content: numberedTexts,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_translations",
                description: "Return the translations as a JSON mapping",
                parameters: {
                  type: "object",
                  properties: {
                    translations: {
                      type: "object",
                      description: "Object mapping original English text to translated text",
                      additionalProperties: { type: "string" },
                    },
                  },
                  required: ["translations"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "return_translations" } },
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited, try again later" }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errText = await response.text();
        console.error("AI error:", response.status, errText);
        // Return original texts as fallback
        batch.forEach((t: string) => { allTranslated[t] = t; });
        continue;
      }

      const aiData = await response.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      
      if (toolCall?.function?.arguments) {
        try {
          const parsed = JSON.parse(toolCall.function.arguments);
          const translations = parsed.translations || parsed;

          // Cache translations in DB
          const rows = Object.entries(translations).map(([source, translated]) => ({
            source_text: source,
            language_code: language,
            translated_text: translated as string,
            context: context || "ui",
          }));

          if (rows.length > 0) {
            await supabase.from("translations").upsert(rows, {
              onConflict: "source_text,language_code",
            });
          }

          Object.entries(translations).forEach(([source, translated]) => {
            allTranslated[source] = translated as string;
          });
        } catch (parseErr) {
          console.error("Parse error:", parseErr);
          batch.forEach((t: string) => { allTranslated[t] = t; });
        }
      } else {
        batch.forEach((t: string) => { allTranslated[t] = t; });
      }
    }

    return new Response(JSON.stringify({ translations: allTranslated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("translate error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
