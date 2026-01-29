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
  continent: string | null;
  country: string | null;
  state: string | null;
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
  'precision_medicine_ai',
  'investors',
  'resources_community',
  'reproductive_health',
  'maternal_health',
  'hormonal_health',
  'gynecological_health',
  'endometriosis',
  'heart_disease',
  'pelvic_health',
  'bone_health',
  'cancer',
  'mobile_apps',
  'other'
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's auth token to validate
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`Authenticated user: ${userId}`);

    // Use service role for database operations (needed to check roles and insert companies)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user has admin role before allowing any operations
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError) {
      console.error('Role check error:', roleError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!roleData) {
      console.log(`User ${userId} attempted admin action without admin role`);
      return new Response(
        JSON.stringify({ error: 'Forbidden - admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin access verified for user: ${userId}`);

    // Get existing company names to avoid duplicates
    const { data: existingCompanies } = await supabase
      .from('companies')
      .select('name');
    
    const existingNames = new Set(
      existingCompanies?.map(c => c.name.toLowerCase()) || []
    );

    console.log(`Found ${existingNames.size} existing companies`);

    // Use Lovable AI to research new femtech companies
    const prompt = `You are a femtech industry expert and researcher. Your task is to identify 5 NEW and INNOVATIVE femtech companies that should be added to our comprehensive database.

SEARCH ACROSS ALL THESE CATEGORIES:
1. Fertility (IVF, egg freezing, fertility tracking, male fertility)
2. Pregnancy (prenatal care, pregnancy monitoring, genetic testing)
3. Postpartum (pelvic floor health, lactation, recovery)
4. Menstrual Health (period tracking, menstrual products, cycle disorders)
5. Menopause & Perimenopause (hormone therapy, symptom management, wearables)
6. Sexual Health/Wellness (intimacy wellness, sexual dysfunction, education)
7. Mental Health (women-focused therapy, perinatal mental health, hormonal mood)
8. General Wellness (supplements, fitness, nutrition for women)
9. Chronic Conditions (PCOS, fibroids, adenomyosis)
10. Diagnostics (at-home testing, cancer screening, biomarkers)
11. Telehealth (virtual care, digital therapeutics, remote monitoring)
12. Precision Medicine & AI (genomics, personalized treatment, AI diagnostics)
13. Investors & Funds (VCs, angels, funds focused on women's health)
14. Resources & Community (education, advocacy, networks, media)
15. Reproductive Health (contraception, family planning, reproductive rights)
16. Maternal Health (prenatal, birth, postpartum care continuity)
17. Hormonal Health (hormone testing, HRT, thyroid, adrenal)
18. Gynecological Health (gynecological care, exams, treatments)
19. Endometriosis (diagnosis, treatment, pain management for endo)
20. Heart Disease (cardiovascular health specific to women)
21. Pelvic Health (pelvic floor disorders, prolapse, incontinence)
22. Bone Health (osteoporosis, bone density, calcium metabolism)
23. Cancer (breast cancer, ovarian cancer, cervical cancer, women's oncology)
24. Mobile Apps (femtech apps from Apple App Store and Google Play Store - period trackers, fertility apps, pregnancy apps, menopause apps)

RESEARCH SOURCES TO CONSIDER:
- Femtech Insider, FemTech World, Rock Health reports
- Recent funding announcements (TechCrunch, Crunchbase, PitchBook)
- Y Combinator, Techstars, and other accelerator portfolios
- LinkedIn company pages and industry groups
- Academic spin-offs and research commercialization
- Apple App Store and Google Play Store top health apps

For each company, provide information in this exact JSON format:
{
  "companies": [
    {
      "name": "Company Name",
      "mission": "Their mission statement or purpose",
      "problem": "The specific women's health problem they address",
      "solution": "How their product/service solves this problem",
      "category": "one of: fertility, pregnancy, postpartum, menstrual_health, menopause, sexual_health, mental_health, general_wellness, chronic_conditions, diagnostics, telehealth, precision_medicine_ai, investors, resources_community, reproductive_health, maternal_health, hormonal_health, gynecological_health, endometriosis, heart_disease, pelvic_health, bone_health, cancer, mobile_apps, other",
      "website_url": "https://their-website.com",
      "founded_year": 2022,
      "headquarters": "City, Country",
      "continent": "North America, Europe, Asia, Africa, South America, or Oceania",
      "country": "Country name",
      "state": "State name (only if in United States, otherwise null)"
    }
  ]
}

IMPORTANT: 
- Only include REAL companies that actually exist
- Do not include these companies as they're already in our database: ${Array.from(existingNames).join(', ')}
- Include companies with less common names that might be missed by simple searches (e.g., "Amie", "Bia", single-word names)
- The category must be exactly one of the listed options
- founded_year should be a number or null if unknown
- Provide accurate, verifiable information
- Include geographic information (continent, country, state for US companies)
- For mobile_apps category, include popular femtech apps from app stores
- Prioritize lesser-known companies over well-funded unicorns`;

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
      throw new Error('AI_SERVICE_ERROR');
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
      throw new Error('PARSE_ERROR');
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
          continent: c.continent,
          country: c.country,
          state: c.state,
          is_verified: false,
        })))
        .select();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error('INSERT_ERROR');
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
    // Return generic error message to clients - detailed errors only in server logs
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to update companies. Please try again later.',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
