/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface CompanyData {
  name: string;
  mission: string;
  problem: string;
  solution: string;
  category: string;
  website_url: string;
  founded_year: number | null;
  headquarters: string;
}

const FEMTECH_CATEGORIES = [
  'fertility',
  'pregnancy',
  'postpartum',
  'menstrual_health',
  'menopause',
  'sexual_health',
  'mental_health',
  'general_wellness',
  'chronic_conditions',
  'diagnostics',
  'telehealth',
  'investors',
  'resources_community',
  'other'
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get existing company names to avoid duplicates
    const { data: existingCompanies } = await supabase
      .from('companies')
      .select('name');
    
    const existingNames = new Set(
      existingCompanies?.map(c => c.name.toLowerCase()) || []
    );

    console.log(`Found ${existingNames.size} existing companies`);

    // Use Lovable AI to research new femtech companies
    const prompt = `You are a femtech industry researcher. Research and identify 5 NEW and INNOVATIVE femtech companies that are making an impact in women's health. Focus on companies founded in the last 3 years or recent funding rounds.

For each company, provide information in this exact JSON format:
{
  "companies": [
    {
      "name": "Company Name",
      "mission": "Their mission statement or purpose",
      "problem": "The specific women's health problem they address",
      "solution": "How their product/service solves this problem",
      "category": "one of: fertility, pregnancy, postpartum, menstrual_health, menopause, sexual_health, mental_health, general_wellness, chronic_conditions, diagnostics, telehealth, other",
      "website_url": "https://their-website.com",
      "founded_year": 2022,
      "headquarters": "City, Country"
    }
  ]
}

IMPORTANT: 
- Only include REAL companies that actually exist
- Do not include these companies as they're already in our database: ${Array.from(existingNames).join(', ')}
- The category must be exactly one of the listed options
- founded_year should be a number or null if unknown
- Provide accurate, verifiable information`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'user',
            content: prompt,
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('AI Response:', content);

    // Parse the JSON from the response
    let companiesData: { companies: CompanyData[] };
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonString = jsonMatch[1] || content;
      companiesData = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse company data from AI');
    }

    // Validate and insert new companies
    const newCompanies: CompanyData[] = [];
    
    for (const company of companiesData.companies || []) {
      // Skip if already exists
      if (existingNames.has(company.name.toLowerCase())) {
        console.log(`Skipping duplicate: ${company.name}`);
        continue;
      }

      // Validate category
      const category = FEMTECH_CATEGORIES.includes(company.category) 
        ? company.category 
        : 'other';

      newCompanies.push({
        ...company,
        category,
      });
    }

    if (newCompanies.length > 0) {
      const { data: insertedData, error: insertError } = await supabase
        .from('companies')
        .insert(newCompanies.map(c => ({
          name: c.name,
          mission: c.mission,
          problem: c.problem,
          solution: c.solution,
          category: c.category,
          website_url: c.website_url,
          founded_year: c.founded_year,
          headquarters: c.headquarters,
          is_verified: false,
        })))
        .select();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      console.log(`Inserted ${insertedData?.length || 0} new companies`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Added ${insertedData?.length || 0} new companies`,
          companies: insertedData,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'No new companies found to add',
        companies: [],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-companies:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
