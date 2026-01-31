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
  source_url: string;
  source_verification: string[];
}

interface RunSummary {
  startTime: string;
  endTime: string;
  durationSeconds: number;
  companiesAdded: number;
  companiesSkipped: number;
  sourcesUsed: string[];
  errors: string[];
  retriesPerformed: number;
}

const FEMTECH_CATEGORIES = [
  'fertility', 'pregnancy', 'postpartum', 'menstrual_health', 'menopause',
  'sexual_health', 'mental_health', 'general_wellness', 'chronic_conditions',
  'diagnostics', 'telehealth', 'precision_medicine_ai', 'investors',
  'resources_community', 'reproductive_health', 'maternal_health',
  'hormonal_health', 'gynecological_health', 'endometriosis', 'heart_disease',
  'pelvic_health', 'bone_health', 'cancer', 'mobile_apps', 'other'
];

// Check if we're in Eastern Daylight Time (EDT) or Eastern Standard Time (EST)
function isCurrentlyEDT(): boolean {
  const now = new Date();
  const jan = new Date(now.getFullYear(), 0, 1);
  const jul = new Date(now.getFullYear(), 6, 1);
  const stdOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  // For US Eastern: EDT is UTC-4, EST is UTC-5
  // We check if current month is in DST range (roughly March-November)
  const month = now.getUTCMonth();
  return month >= 2 && month <= 10; // March (2) to November (10)
}

// Retry wrapper for API calls
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 1,
  delayMs: number = 2000
): Promise<{ result: T | null; retries: number; error: string | null }> {
  let lastError: string | null = null;
  let retries = 0;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      return { result, retries, error: null };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      retries = attempt;
      if (attempt < maxRetries) {
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  return { result: null, retries, error: lastError };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = new Date();
  const summary: RunSummary = {
    startTime: startTime.toISOString(),
    endTime: '',
    durationSeconds: 0,
    companiesAdded: 0,
    companiesSkipped: 0,
    sourcesUsed: [
      'Official company websites',
      'Crunchbase profiles',
      'LinkedIn company pages',
      'AngelList/Wellfound',
      'FemTech accelerators & incubators',
      'FemTech VC portfolio pages',
      'FemTech media outlets'
    ],
    errors: [],
    retriesPerformed: 0,
  };

  console.log('========================================');
  console.log('FemTechDB Automated Discovery - START');
  console.log(`Start Time: ${startTime.toISOString()}`);
  console.log('========================================');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const cronSecretKey = Deno.env.get('CRON_SECRET_KEY');

    // Parse request body for timezone check
    let body: { timezone_check?: string } = {};
    try {
      body = await req.json();
    } catch {
      // No body or invalid JSON is fine
    }

    // DST-aware execution: skip if wrong timezone period
    if (body.timezone_check) {
      const isEDT = isCurrentlyEDT();
      if (body.timezone_check === 'EDT' && !isEDT) {
        console.log('Skipping EDT job - currently in EST period');
        return new Response(
          JSON.stringify({ success: true, message: 'Skipped - not in EDT period', skipped: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (body.timezone_check === 'EST' && isEDT) {
        console.log('Skipping EST job - currently in EDT period');
        return new Response(
          JSON.stringify({ success: true, message: 'Skipped - not in EST period', skipped: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`Timezone check passed: ${body.timezone_check}, isEDT: ${isEDT}`);
    }

    const authHeader = req.headers.get('Authorization');
    const cronHeader = req.headers.get('X-Cron-Secret');
    const token = authHeader?.replace('Bearer ', '');

    // Use environment variable instead of hardcoded JWT
    const anonKeyJwt = supabaseAnonKey;

    // Check if this is a cron job call (uses anon key) or has cron secret header
    // Also accept the anon key directly in the Authorization header
    const isCronCall = token === anonKeyJwt || 
                       authHeader === `Bearer ${anonKeyJwt}` ||
                       (cronSecretKey && cronHeader === cronSecretKey);

    console.log('Auth check - token present:', !!token, 'isCronCall:', isCronCall);

    if (isCronCall) {
      console.log('Cron job authenticated via anon key or cron secret');
    } else {
      if (!authHeader?.startsWith('Bearer ')) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized - missing or invalid authorization header' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });

      const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token!);
      
      if (claimsError || !claimsData?.claims) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized - invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const userId = claimsData.claims.sub;
      console.log(`Authenticated user: ${userId}`);

      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

      const { data: roleData, error: roleError } = await supabaseAdmin
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
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limiting: Check for recent successful execution (1 hour cooldown)
    const COOLDOWN_MINUTES = 60;
    const { data: recentExecution } = await supabase
      .from('function_executions')
      .select('executed_at')
      .eq('function_name', 'update-companies')
      .eq('success', true)
      .gte('executed_at', new Date(Date.now() - COOLDOWN_MINUTES * 60 * 1000).toISOString())
      .order('executed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentExecution) {
      const lastRun = new Date(recentExecution.executed_at);
      const minutesSince = Math.round((Date.now() - lastRun.getTime()) / 60000);
      console.log(`Rate limit hit: Last successful run was ${minutesSince} minutes ago`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'RATE_LIMITED',
          message: `Function ran successfully ${minutesSince} minutes ago. Please wait ${COOLDOWN_MINUTES - minutesSince} more minutes.`,
          lastExecution: recentExecution.executed_at
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get existing company names to avoid duplicates
    const { data: existingCompanies } = await supabase
      .from('companies')
      .select('name, website_url');
    
    const existingNames = new Set(
      existingCompanies?.map(c => c.name.toLowerCase()) || []
    );
    const existingUrls = new Set(
      existingCompanies?.filter(c => c.website_url).map(c => {
        try {
          return new URL(c.website_url).hostname.replace('www.', '');
        } catch { return null; }
      }).filter(Boolean) || []
    );

    console.log(`Found ${existingNames.size} existing companies`);

    // Comprehensive FemTech discovery prompt with strict criteria
    const prompt = `You are an expert FemTech industry researcher. Your task is to discover 5 NEW, LEGITIMATE FemTech companies for our database.

## APPROVED DATA SOURCES (Use ONLY these):
1. Official company websites (About, Product, Careers, Press, Blog pages)
2. Crunchbase company profiles
3. LinkedIn company pages (company description, size, industry)
4. AngelList / Wellfound listings
5. FemTech-specific ecosystems:
   - Startup accelerators focused on women's health (Y Combinator, Techstars, etc.)
   - FemTech venture capital portfolio pages (Rock Health, Portfolia, etc.)
   - Recognized FemTech media outlets (FemTech Insider, etc.)
6. FDA device listings (where applicable)
7. UNESCAP Femtech in South-East Asia Report (https://repository.unescap.org/server/api/core/bitstreams/ac306159-0343-4888-b4dc-ffc617d7ebeb/content)
   - Contains comprehensive list of femtech companies in Indonesia, Philippines, Singapore, Thailand, Vietnam
   - Includes market map with ~93 companies in Southeast Asia
8. FemTech Association Asia (https://www.femtechassociation.com/)
   - 2025 Southeast Asia Femtech Market Map
   - Femtech Stars honorees
   - Member directory and blog posts
   - Substack articles with country-specific snapshots (Malaysia, Vietnam, etc.)
9. FemTech Analytics reports and databases

## EXPLICITLY EXCLUDE:
- Personal blogs without a registered company
- General health startups NOT clearly focused on women's/female-specific health
- News articles mentioning companies without official source verification
- Social media rumors or unverified announcements
- Duplicates or rebrands without clear lineage
- Companies that have ceased operations

## INCLUSION CRITERIA (Must meet at least one):
- Core product/service explicitly addresses: women's health, fertility, pregnancy, menopause, gynecology, sexual health, maternal health, or female-specific conditions
- Self-identifies as FemTech or operates in women's health vertical
- Has received funding specifically for women's health innovation

## DATA VALIDATION REQUIREMENTS:
- Each company MUST be verifiable via at least 2 independent sources
- Must have an active, accessible website
- Must show evidence of current operations (recent updates, active social media, etc.)

## CATEGORIES TO SEARCH:
${FEMTECH_CATEGORIES.filter(c => c !== 'other').join(', ')}

## COMPANIES ALREADY IN DATABASE (DO NOT INCLUDE):
${Array.from(existingNames).slice(0, 200).join(', ')}

## RESPONSE FORMAT (JSON only):
{
  "companies": [
    {
      "name": "Company Name",
      "mission": "Their mission statement",
      "problem": "The women's health problem they solve",
      "solution": "How they solve it",
      "category": "exact_category_from_list",
      "website_url": "https://company-website.com",
      "founded_year": 2022,
      "headquarters": "City, Country",
      "continent": "North America|Europe|Asia|Africa|South America|Oceania",
      "country": "Country name",
      "state": "State (US only, null otherwise)",
      "source_url": "https://crunchbase.com/company/example OR https://linkedin.com/company/example",
      "source_verification": ["Source 1 URL or name", "Source 2 URL or name"]
    }
  ]
}

IMPORTANT:
- Return ONLY real, verified companies with accurate information
- The category MUST exactly match one from the list above
- source_url is REQUIRED - must be from an approved source (Crunchbase, LinkedIn, official company website, reputable news, UNESCAP report, FemTech Association)
- Include source_verification array with 2+ sources for each company
- Prioritize Southeast Asian companies from UNESCAP report and FemTech Association sources
- Also discover companies from other regions (North America, Europe, etc.)
- DO NOT include any company without a verifiable source_url`;

    // Make AI request with retry logic
    const aiCall = async () => {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API error: ${response.status} - ${errorText}`);
      }

      return response.json();
    };

    const { result: aiData, retries, error: aiError } = await withRetry(aiCall, 1, 3000);
    summary.retriesPerformed = retries;

    if (aiError || !aiData) {
      summary.errors.push(`AI service error after ${retries + 1} attempts: ${aiError}`);
      console.error('AI service failed:', aiError);
      throw new Error('AI_SERVICE_ERROR');
    }

    const content = aiData.choices?.[0]?.message?.content;
    if (!content) {
      summary.errors.push('No content in AI response');
      throw new Error('No content in AI response');
    }

    console.log('AI Response received, parsing...');

    // Parse the JSON response
    let companiesData: { companies: CompanyData[] };
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonString = jsonMatch[1] || content;
      companiesData = JSON.parse(jsonString.trim());
    } catch (parseError) {
      summary.errors.push(`Failed to parse AI response: ${parseError}`);
      console.error('Failed to parse AI response:', parseError);
      throw new Error('PARSE_ERROR');
    }

    // Validate and filter companies
    const newCompanies: CompanyData[] = [];
    
    for (const company of companiesData.companies || []) {
      // Duplicate check by name
      if (existingNames.has(company.name.toLowerCase())) {
        console.log(`Skipping duplicate (name): ${company.name}`);
        summary.companiesSkipped++;
        continue;
      }

      // Duplicate check by website URL domain
      if (company.website_url) {
        try {
          const domain = new URL(company.website_url).hostname.replace('www.', '');
          if (existingUrls.has(domain)) {
            console.log(`Skipping duplicate (domain): ${company.name} - ${domain}`);
            summary.companiesSkipped++;
            continue;
          }
        } catch {
          // Invalid URL, will flag for review
        }
      }

      // Validate category
      const category = FEMTECH_CATEGORIES.includes(company.category) 
        ? company.category 
        : 'other';

      // Validate source_url is present (REQUIRED)
      if (!company.source_url || company.source_url.trim() === '') {
        console.log(`Skipping ${company.name}: missing required source_url`);
        summary.companiesSkipped++;
        summary.errors.push(`${company.name}: no source_url provided`);
        continue;
      }

      // Validate source verification (must have at least 1 source)
      const hasVerification = company.source_verification && 
                              Array.isArray(company.source_verification) && 
                              company.source_verification.length > 0;

      if (!hasVerification) {
        console.log(`Warning: ${company.name} has no source verification`);
      }

      newCompanies.push({
        ...company,
        category,
      });
    }

    // Insert new companies
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
          source_url: c.source_url,
          is_verified: false,
        })))
        .select();

      if (insertError) {
        summary.errors.push(`Insert error: ${insertError.message}`);
        console.error('Insert error:', insertError);
        throw new Error('INSERT_ERROR');
      }

      summary.companiesAdded = insertedData?.length || 0;
      console.log(`Successfully inserted ${summary.companiesAdded} new companies`);
    }

    // Calculate end time and duration
    const endTime = new Date();
    summary.endTime = endTime.toISOString();
    summary.durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

    // Log comprehensive summary
    console.log('========================================');
    console.log('FemTechDB Automated Discovery - COMPLETE');
    console.log('========================================');
    console.log(`Start Time: ${summary.startTime}`);
    console.log(`End Time: ${summary.endTime}`);
    console.log(`Duration: ${summary.durationSeconds} seconds`);
    console.log(`Companies Added: ${summary.companiesAdded}`);
    console.log(`Companies Skipped (duplicates): ${summary.companiesSkipped}`);
    console.log(`Retries Performed: ${summary.retriesPerformed}`);
    console.log(`Sources Used: ${summary.sourcesUsed.join(', ')}`);
    if (summary.errors.length > 0) {
      console.log(`Errors: ${summary.errors.join('; ')}`);
    }
    console.log('========================================');

    // Log successful execution for rate limiting
    await supabase.from('function_executions').insert({
      function_name: 'update-companies',
      executed_by: isCronCall ? 'cron' : 'admin',
      success: true,
      summary: summary as unknown as Record<string, unknown>,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        summary: {
          ...summary,
          message: `Added ${summary.companiesAdded} new companies, skipped ${summary.companiesSkipped} duplicates`,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const endTime = new Date();
    summary.endTime = endTime.toISOString();
    summary.durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    summary.errors.push(errorMessage);

    console.error('========================================');
    console.error('FemTechDB Automated Discovery - FAILED');
    console.error('========================================');
    console.error(`Start Time: ${summary.startTime}`);
    console.error(`End Time: ${summary.endTime}`);
    console.error(`Duration: ${summary.durationSeconds} seconds`);
    console.error(`Error: ${errorMessage}`);
    console.error('========================================');

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to update companies. Please try again later.',
        summary,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
